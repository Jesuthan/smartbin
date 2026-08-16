#include <stdio.h>
#include <stdlib.h>
#inc lude <string.h>
#include <ctype.h>
#include  "freertos/FreeRTOS.h"
#include "freertos/ta sk.h"
#include "freertos/event_groups.h"
#i nclude "esp_system.h"
#include "esp_wifi.h" 
#include "esp_event.h"
#include "esp_log.h" 
#include "nvs_flash.h"
#include "driver/ua rt.h"
#include "driver/gpio.h"
#include "lw ip/err.h"
#include "lwip/sys.h"
#include "m qtt_client.h"

#define TAG "GPS_TRACKER"
 
// UART Configuration for NEO-6M GPS
#defin e GPS_UART_NUM          UART_NUM_2
#define G PS_TX_PIN            2
#define GPS_RX_PIN             4
#define GPS_UART_BUF_SIZE     102 4
#define GPS_BAUD_RATE         9600

// W i-Fi Configuration
#define WIFI_SSID              "YOUR_WIFI_SSID"
#define WIFI_PASS             "9 87654321"
#define WIFI_CONNECTED_BIT    BIT0 
#define WIFI_FAIL_BIT         BIT1
#define  WIFI_MAXIMUM_RETRY    5

// MQTT Configura tion
#define MQTT_BROKER           "test.mos quitto.org"
#define MQTT_PORT             18 83
#define MQTT_TOPIC            "Smart_bin" 
#define STR_HELPER(x) #x
#define STR(x) ST R_HELPER(x)

// GPS update interval
#defin e GPS_UPDATE_INTERVAL   10000  // 10 seconds 

// Wi-Fi event group
static EventGroupHan dle_t s_wifi_event_group;
static int s_retry _num = 0;

// MQTT client handle
static es p_mqtt_client_handle_t mqtt_client = NULL;
s tatic bool mqtt_connected = false;

// GPS  data structure
typedef struct {
    float l atitude;
    float longitude;
    float alt itude;
    int satellites;
    float hdop; 
    int hour;
    int minute;
    int seco nd;
    bool is_valid;
} gps_data_t;

//  GPS data
static gps_data_t gps_data = {
     .is_valid = false
};

// Function prototy pes
static void wifi_event_handler(void* arg , esp_event_base_t event_base, int32_t event_ id, void* event_data);
static void mqtt_even t_handler(void *handler_args, esp_event_base_ t base, int32_t event_id, void *event_data); 
static void init_wifi(void);
static void in it_mqtt(void);
static void gps_task(void *pv Parameters);
static void mqtt_publish_task(v oid *pvParameters);
static bool parse_gps_da ta(const char* nmea_sentence);
static bool p arse_gpgga(const char* sentence);
static boo l parse_gprmc(const char* sentence);
static  float parse_coordinate(const char* coord_str,  char direction);

// Wi-Fi event handler
 static void wifi_event_handler(void* arg, esp _event_base_t event_base, int32_t event_id, v oid* event_data)
{
    if (event_base == WI FI_EVENT && event_id == WIFI_EVENT_STA_START)  {
        esp_wifi_connect();
    } else i f (event_base == WIFI_EVENT && event_id == WI FI_EVENT_STA_DISCONNECTED) {
        if (s_r etry_num < WIFI_MAXIMUM_RETRY) {
             esp_wifi_connect();
            s_retry_num ++;
            ESP_LOGI(TAG, "Retrying to c onnect to the AP");
        } else {
             xEventGroupSetBits(s_wifi_event_group,  WIFI_FAIL_BIT);
        }
        ESP_LOGI( TAG,"Connect to the AP fail");
    } else if  (event_base == IP_EVENT && event_id == IP_EV ENT_STA_GOT_IP) {
        ip_event_got_ip_t*  event = (ip_event_got_ip_t*) event_data;
         ESP_LOGI(TAG, "Got IP:" IPSTR, IP2STR(& event->ip_info.ip));
        s_retry_num = 0 ;
        xEventGroupSetBits(s_wifi_event_gr oup, WIFI_CONNECTED_BIT);
    }
}

// MQT T event handler
static void mqtt_event_handl er(void *handler_args, esp_event_base_t base,  int32_t event_id, void *event_data)
{
     esp_mqtt_event_handle_t event = event_data;
     
    switch ((esp_mqtt_event_id_t)event_ id) {
        case MQTT_EVENT_CONNECTED:
             ESP_LOGI(TAG, "MQTT connected");
             mqtt_connected = true;
             break;
        
        case MQTT_EVENT_D ISCONNECTED:
            ESP_LOGI(TAG, "MQTT  disconnected");
            mqtt_connected  = false;
            break;
        
         case MQTT_EVENT_PUBLISHED:
            ES P_LOGI(TAG, "MQTT message published successfu lly, msg_id=%d", event->msg_id);
             break;
        
        case MQTT_EVENT_DA TA:
            ESP_LOGI(TAG, "MQTT data rec eived");
            printf("TOPIC=%.*s\r\n" , event->topic_len, event->topic);
             printf("DATA=%.*s\r\n", event->data_len, e vent->data);
            break;
        
         case MQTT_EVENT_ERROR:
            ES P_LOGI(TAG, "MQTT error");
            break ;
        
        default:
            br eak;
    }
}

// Initialize Wi-Fi
static  void init_wifi(void)
{
    s_wifi_event_gr oup = xEventGroupCreate();

    ESP_ERROR_C HECK(esp_netif_init());
    ESP_ERROR_CHECK( esp_event_loop_create_default());
    esp_ne tif_create_default_wifi_sta();

    wifi_in it_config_t cfg = WIFI_INIT_CONFIG_DEFAULT(); 
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
 
    ESP_ERROR_CHECK(esp_event_handler_regis ter(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event _handler, NULL));
    ESP_ERROR_CHECK(esp_ev ent_handler_register(IP_EVENT, IP_EVENT_STA_G OT_IP, &wifi_event_handler, NULL));

    wi fi_config_t wifi_config = {
        .sta = { 
            .ssid = WIFI_SSID,
             .password = WIFI_PASS,
            .thresho ld.authmode = WIFI_AUTH_WPA2_PSK,
        }, 
    };
    
    ESP_ERROR_CHECK(esp_wifi_ set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHEC K(esp_wifi_set_config(WIFI_IF_STA, &wifi_conf ig));
    ESP_ERROR_CHECK(esp_wifi_start()); 

    ESP_LOGI(TAG, "wifi_init_sta finished .");

    // Wait for connection
    Event Bits_t bits = xEventGroupWaitBits(s_wifi_even t_group,
            WIFI_CONNECTED_BIT | WI FI_FAIL_BIT,
            pdFALSE,
             pdFALSE,
            portMAX_DELAY);

     if (bits & WIFI_CONNECTED_BIT) {
         ESP_LOGI(TAG, "Connected to AP SSID:%s", WIFI _SSID);
    } else if (bits & WIFI_FAIL_BIT)  {
        ESP_LOGI(TAG, "Failed to connect  to SSID:%s", WIFI_SSID);
    } else {
         ESP_LOGE(TAG, "Unexpected event");
    } 
}

// Initialize MQTT
static void init_mq tt(void)
{
    esp_mqtt_client_config_t mqt t_cfg = {
        .broker.address.uri = "mqt t://" MQTT_BROKER,
        .broker.address.p ort = MQTT_PORT,
    };

    mqtt_client =  esp_mqtt_client_init(&mqtt_cfg);
    esp_mq tt_client_register_event(mqtt_client, ESP_EVE NT_ANY_ID, mqtt_event_handler, NULL);
    es p_mqtt_client_start(mqtt_client);
}

// Pa rse GPS data
static bool parse_gps_data(cons t char* nmea_sentence)
{
    if (strncmp(nm ea_sentence, "$GPGGA", 6) == 0) {
        re turn parse_gpgga(nmea_sentence);
    } else  if (strncmp(nmea_sentence, "$GPRMC", 6) == 0)  {
        return parse_gprmc(nmea_sentence) ;
    }
    return false;
}

// Parse co ordinate from NMEA format to decimal degrees 
static float parse_coordinate(const char* co ord_str, char direction)
{
    float coord  = atof(coord_str);
    int degrees = (int)(c oord / 100);
    float minutes = coord - (de grees * 100);
    float decimal_degrees = de grees + (minutes / 60.0);
    
    if (dire ction == 'S' || direction == 'W') {
         decimal_degrees = -decimal_degrees;
    }
     
    return decimal_degrees;
}

// Par se GPGGA sentence (Global Positioning System  Fix Data)
static bool parse_gpgga(const char * sentence)
{
    char* token;
    char* s ave_ptr;
    char sentence_copy[128];
     
    strncpy(sentence_copy, sentence, sizeof( sentence_copy) - 1);
    sentence_copy[sizeo f(sentence_copy) - 1] = '\0';
    
    // F irst token is the sentence type
    token =  strtok_r(sentence_copy, ",", &save_ptr);
     if (!token) return false;
    
    // Time 
    token = strtok_r(NULL, ",", &save_ptr); 
    if (!token) return false;
    if (strl en(token) >= 6) {
        gps_data.hour = (t oken[0] - '0') * 10 + (token[1] - '0');
         gps_data.minute = (token[2] - '0') * 10 +  (token[3] - '0');
        gps_data.second =  (token[4] - '0') * 10 + (token[5] - '0');
     }
    
    // Latitude
    token = strt ok_r(NULL, ",", &save_ptr);
    if (!token | | strlen(token) == 0) return false;
    char * lat_direction = strtok_r(NULL, ",", &save_p tr);
    if (!lat_direction || strlen(lat_di rection) == 0) return false;
    gps_data.la titude = parse_coordinate(token, lat_directio n[0]);
    
    // Longitude
    token = s trtok_r(NULL, ",", &save_ptr);
    if (!toke n || strlen(token) == 0) return false;
    c har* lng_direction = strtok_r(NULL, ",", &sav e_ptr);
    if (!lng_direction || strlen(lng _direction) == 0) return false;
    gps_data .longitude = parse_coordinate(token, lng_dire ction[0]);
    
    // Fix quality
    tok en = strtok_r(NULL, ",", &save_ptr);
    if  (!token) return false;
    int fix_quality =  atoi(token);
    gps_data.is_valid = (fix_q uality > 0);
    
    // Number of satellit es
    token = strtok_r(NULL, ",", &save_ptr );
    if (!token) return false;
    gps_da ta.satellites = atoi(token);
    
    // HD OP
    token = strtok_r(NULL, ",", &save_ptr );
    if (!token) return false;
    gps_da ta.hdop = atof(token);
    
    // Altitude 
    token = strtok_r(NULL, ",", &save_ptr); 
    if (!token) return false;
    gps_data .altitude = atof(token);
    
    return gp s_data.is_valid;
}

// Parse GPRMC sentenc e (Recommended Minimum Specific GPS/Transit D ata)
static bool parse_gprmc(const char* sen tence)
{
    char* token;
    char* save_p tr;
    char sentence_copy[128];
    
     strncpy(sentence_copy, sentence, sizeof(sente nce_copy) - 1);
    sentence_copy[sizeof(sen tence_copy) - 1] = '\0';
    
    // First  token is the sentence type
    token = strto k_r(sentence_copy, ",", &save_ptr);
    if ( !token) return false;
    
    // Time
     token = strtok_r(NULL, ",", &save_ptr);
     if (!token) return false;
    if (strlen(to ken) >= 6) {
        gps_data.hour = (token[ 0] - '0') * 10 + (token[1] - '0');
        g ps_data.minute = (token[2] - '0') * 10 + (tok en[3] - '0');
        gps_data.second = (tok en[4] - '0') * 10 + (token[5] - '0');
    } 
    
    // Status
    token = strtok_r(NU LL, ",", &save_ptr);
    if (!token) return  false;
    gps_data.is_valid = (token[0] ==  'A');
    
    // Latitude
    token = str tok_r(NULL, ",", &save_ptr);
    if (!token  || strlen(token) == 0) return false;
    cha r* lat_direction = strtok_r(NULL, ",", &save_ ptr);
    if (!lat_direction || strlen(lat_d irection) == 0) return false;
    gps_data.l atitude = parse_coordinate(token, lat_directi on[0]);
    
    // Longitude
    token =  strtok_r(NULL, ",", &save_ptr);
    if (!tok en || strlen(token) == 0) return false;
     char* lng_direction = strtok_r(NULL, ",", &sa ve_ptr);
    if (!lng_direction || strlen(ln g_direction) == 0) return false;
    gps_dat a.longitude = parse_coordinate(token, lng_dir ection[0]);
    
    return gps_data.is_val id;
}

// GPS task
static void gps_task(v oid *pvParameters)
{
    // Configure UART  for GPS
    uart_config_t uart_config = {
         .baud_rate = GPS_BAUD_RATE,
        . data_bits = UART_DATA_8_BITS,
        .parit y = UART_PARITY_DISABLE,
        .stop_bits  = UART_STOP_BITS_1,
        .flow_ctrl = UAR T_HW_FLOWCTRL_DISABLE,
        .rx_flow_ctrl _thresh = 0,
        .source_clk = UART_SCLK _APB,
    };

    ESP_ERROR_CHECK(uart_par am_config(GPS_UART_NUM, &uart_config));
     ESP_ERROR_CHECK(uart_set_pin(GPS_UART_NUM, GP S_TX_PIN, GPS_RX_PIN, UART_PIN_NO_CHANGE, UAR T_PIN_NO_CHANGE));
    ESP_ERROR_CHECK(uart_ driver_install(GPS_UART_NUM, GPS_UART_BUF_SIZ E, 0, 0, NULL, 0));

    uint8_t* data = ma lloc(GPS_UART_BUF_SIZE);
    char line_buffe r[256];
    int line_pos = 0;

    while ( 1) {
        int len = uart_read_bytes(GPS_U ART_NUM, data, GPS_UART_BUF_SIZE, 100 / portT ICK_PERIOD_MS);
        
        for (int i  = 0; i < len; i++) {
            char c = d ata[i];
            
            if (c == ' \n') {
                line_buffer[line_pos]  = '\0';
                
                / / Process the NMEA sentence
                 if (line_pos > 0 && line_buffer[0] == '$') { 
                    parse_gps_data(line_buff er);
                }
                
                 line_pos = 0;
            } el se if (c != '\r' && line_pos < sizeof(line_bu ffer) - 1) {
                line_buffer[lin e_pos++] = c;
            }
        }
         
        vTaskDelay(10 / portTICK_PERIOD _MS);
    }
    
    free(data);
}

//  MQTT publish task
static void mqtt_publish_t ask(void *pvParameters)
{
    TickType_t la st_update = 0;
    char payload[150];
     
    while (1) {
        TickType_t now = xT askGetTickCount();
        
        if ((no w - last_update) * portTICK_PERIOD_MS >= GPS_ UPDATE_INTERVAL) {
            last_update =  now;
            
            if (gps_data .is_valid && gps_data.satellites >= 3) {
                 snprintf(payload, sizeof(payload ),
                        "{\"lat\":%.6f,\" lng\":%.6f,\"alt\":%.1f,\"sat\":%d,\"hdop\":% .1f,\"time\":\"%02d:%02d:%02d\"}",
                         gps_data.latitude,
                         gps_data.longitude,
                         gps_data.altitude,
                         gps_data.satellites,
                         gps_data.hdop,
                         gps_data.hour,
                         gps_data.minute,
                         gps_data.second);
                
                 if (mqtt_connected) {
                     int msg_id = esp_mqtt_client_publish(m qtt_client, MQTT_TOPIC, payload, 0, 1, 0);
                     if (msg_id != -1) {
                         ESP_LOGI(TAG, "Published:  %s", payload);
                    } else { 
                        ESP_LOGE(TAG, "Publi sh failed");
                    }
                 }
            } else {
                 // Send a message when no valid GPS data  is available
                if (mqtt_connec ted) {
                    int msg_id = esp_ mqtt_client_publish(mqtt_client, MQTT_TOPIC,  "No valid GPS data available", 0, 1, 0);
                     if (msg_id != -1) {
                         ESP_LOGI(TAG, "Published: No  valid GPS data available");
                     } else {
                        ESP_LO GE(TAG, "Publish failed for no data message") ;
                    }
                }
             }
        }
        
        v TaskDelay(1000 / portTICK_PERIOD_MS);
    } 
}

void app_main(void)
{
    // Initiali ze NVS
    esp_err_t ret = nvs_flash_init(); 
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES ||  ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
         ESP_ERROR_CHECK(nvs_flash_erase());
         ret = nvs_flash_init();
    }
    ESP_ ERROR_CHECK(ret);

    ESP_LOGI(TAG, "Start ing GPS Tracker...");

    // Initialize Wi -Fi
    init_wifi();

    // Initialize MQ TT
    init_mqtt();

    // Create tasks
     xTaskCreate(gps_task, "gps_task", 4096, N ULL, 5, NULL);
    xTaskCreate(mqtt_publish_ task, "mqtt_publish_task", 4096, NULL, 5, NUL L);
} 