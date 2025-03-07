#include <stdio.h>
#include "driver/gpio.h"
#include "esp_system.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_timer.h"  // Required for esp_timer_get_time()

#define TRIG_PIN GPIO_NUM_5      // Trigger pin for ultrasonic sensor
#define ECHO_PIN GPIO_NUM_18     // Echo pin for ultrasonic sensor

#define LED_EMPTY GPIO_NUM_32  // LED for Empty Bin
#define LED_25 GPIO_NUM_25     // LED for 25% full
#define LED_50 GPIO_NUM_26     // LED for 50% full
#define LED_75 GPIO_NUM_27     // LED for 75% full
#define LED_FULL GPIO_NUM_33   // LED for Full Bin

// Function to initialize the ultrasonic sensor
void ultrasonic_init() {
    gpio_set_direction(TRIG_PIN, GPIO_MODE_OUTPUT);
    gpio_set_direction(ECHO_PIN, GPIO_MODE_INPUT);
    printf("Ultrasonic sensor initialized.\n");
}

// Function to initialize LEDs
void leds_init() {
    gpio_set_direction(LED_EMPTY, GPIO_MODE_OUTPUT);
    gpio_set_direction(LED_25, GPIO_MODE_OUTPUT);
    gpio_set_direction(LED_50, GPIO_MODE_OUTPUT);
    gpio_set_direction(LED_75, GPIO_MODE_OUTPUT);
    gpio_set_direction(LED_FULL, GPIO_MODE_OUTPUT);

    gpio_set_level(LED_EMPTY, 0);
    gpio_set_level(LED_25, 0);
    gpio_set_level(LED_50, 0);
    gpio_set_level(LED_75, 0);
    gpio_set_level(LED_FULL, 0);
    printf("LEDs initialized and turned off.\n");
}

// Function to get the distance from the ultrasonic sensor
float get_distance() {
    gpio_set_level(TRIG_PIN, 0);
    vTaskDelay(2 / portTICK_PERIOD_MS);
    gpio_set_level(TRIG_PIN, 1);
    vTaskDelay(10 / portTICK_PERIOD_MS);
    gpio_set_level(TRIG_PIN, 0);

    int64_t start_time = 0, end_time = 0;
    int64_t timeout = esp_timer_get_time() + 20000;  // 20ms timeout

    // Wait for ECHO pin to go HIGH (but with a timeout)
    while (gpio_get_level(ECHO_PIN) == 0) {
        if (esp_timer_get_time() > timeout) {
            printf("Timeout waiting for ECHO HIGH\n");
            return -1;
        }
    }
    start_time = esp_timer_get_time();  // Start timing

    timeout = esp_timer_get_time() + 20000;  // Reset timeout

    // Wait for ECHO pin to go LOW (but with a timeout)
    while (gpio_get_level(ECHO_PIN) == 1) {
        if (esp_timer_get_time() > timeout) {
            printf("Timeout waiting for ECHO LOW\n");
            return -1;
        }
    }
    end_time = esp_timer_get_time();  // End timing

    // Calculate distance
    int64_t duration = end_time - start_time;
    float distance = (duration * 0.0343) / 2;  // Convert to cm

    if (distance < 0 || distance > 400) {
        printf("Error: Distance out of range.\n");
        return -1;
    }

    return distance;
}

// Function to update LEDs based on bin fullness
void update_leds(float distance) {
    gpio_set_level(LED_EMPTY, 0);
    gpio_set_level(LED_25, 0);
    gpio_set_level(LED_50, 0);
    gpio_set_level(LED_75, 0);
    gpio_set_level(LED_FULL, 0);

    if (distance > 40) {
        gpio_set_level(LED_EMPTY, 1);
        printf("Bin is empty.\n");
    } else if (distance > 30) {
        gpio_set_level(LED_25, 1);
        printf("Bin is 25%% full.\n");
    } else if (distance > 20) {
        gpio_set_level(LED_50, 1);
        printf("Bin is 50%% full.\n");
    } else if (distance > 10) {
        gpio_set_level(LED_75, 1);
        printf("Bin is 75%% full.\n");
    } else {
        gpio_set_level(LED_FULL, 1);
        printf("Bin is fully filled.\n");
    }
}

// Main task
void app_main() {
    ultrasonic_init();
    leds_init();

    while (1) {
        float distance = get_distance();
        if (distance != -1) {
            printf("Distance: %.2f cm\n", distance);
            update_leds(distance);
        }
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
