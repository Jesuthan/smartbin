#include <stdio.h>
#include <math.h>
#include "bmp180.h"
#include "i2cdev.h"
#include "esp_log.h"

#define I2C_MASTER_SCL_IO 22  // GPIO pin for SCL
#define I2C_MASTER_SDA_IO 21  // GPIO pin for SDA
#define I2C_MASTER_FREQ_HZ 100000  // I2C clock frequency
#define BMP180_I2C_ADDRESS 0x77  // BMP180 I2C address

static const char *TAG = "BMP180_EXAMPLE";

void i2c_master_init() {
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };

    esp_err_t ret = i2c_param_config(I2C_NUM_0, &conf);
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Failed to configure I2C parameters: %s", esp_err_to_name(ret));
        return;
    }

    ret = i2c_driver_install(I2C_NUM_0, conf.mode, 0, 0, 0);
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Failed to install I2C driver: %s", esp_err_to_name(ret));
        return;
    }

    ESP_LOGI(TAG, "I2C initialized successfully");
}

float calculate_altitude(float pressure) {
    float sea_level_pressure = 1013.25;  // Sea level pressure in hPa
    return 44330 * (1 - pow((pressure / sea_level_pressure), 0.1903));
}

void app_main() {
    // Initialize I2C
    i2c_master_init();

    // Initialize BMP180
    bmp180_dev_t bmp180 = {
        .i2c_dev = {
            .port = I2C_NUM_0,
            .addr = BMP180_I2C_ADDRESS,
            .timeout_ticks = 0xFFFF,
        },
    };

    esp_err_t ret = bmp180_init(&bmp180);
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Failed to initialize BMP180 sensor: %s", esp_err_to_name(ret));
        return;
    }
    ESP_LOGI(TAG, "BMP180 initialized successfully");

    // Read and print temperature and pressure
    while (1) {
        float temperature, pressure;

        esp_err_t temp_ret = bmp180_read_temperature(&bmp180, &temperature);
        esp_err_t press_ret = bmp180_read_pressure(&bmp180, &pressure);

        if (temp_ret == ESP_OK && press_ret == ESP_OK) {
            float altitude = calculate_altitude(pressure / 100.0);  // Convert pressure to hPa
            ESP_LOGI(TAG, "Temperature: %.2f C", temperature);
            ESP_LOGI(TAG, "Pressure: %.2f hPa", pressure / 100.0);
            ESP_LOGI(TAG, "Altitude: %.2f meters", altitude);
        } else {
            if (temp_ret != ESP_OK) {
                ESP_LOGE(TAG, "Failed to read temperature: %s", esp_err_to_name(temp_ret));
            }
            if (press_ret != ESP_OK) {
                ESP_LOGE(TAG, "Failed to read pressure: %s", esp_err_to_name(press_ret));
            }
        }

        vTaskDelay(2000 / portTICK_PERIOD_MS);  // Wait 2 seconds
    }
}