#include <HardwareSerial.h>
#include <TinyGPSPlus.h>

// Define Ultrasonic Sensor Pins
#define TRIG_PIN 5
#define ECHO_PIN 18

// Define LED Pins for bin levels
#define LED_10CM 12
#define LED_20CM 13
#define LED_30CM 14
#define LED_40CM 15

// Initialize GPS Module (RX=16, TX=17)
HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

void setup() {
    Serial.begin(115200);     // Debug Serial Monitor
    gpsSerial.begin(9600, SERIAL_8N1, 16, 17); // GPS module Serial
    
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    pinMode(LED_10CM, OUTPUT);
    pinMode(LED_20CM, OUTPUT);
    pinMode(LED_30CM, OUTPUT);
    pinMode(LED_40CM, OUTPUT);
}

void loop() {
    float distance = getDistance();
    Serial.print("Bin Level: ");
    Serial.print(distance);
    Serial.println(" cm");

    updateLEDs(distance);
    updateGPS();

    delay(1000); // Wait 1 second before next reading
}

// Function to measure distance using Ultrasonic Sensor
float getDistance() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);
    float distance = duration * 0.034 / 2;  // Convert to cm
    return distance;
}

// Function to update LED indicators based on bin level
void updateLEDs(float distance) {
    digitalWrite(LED_10CM, (distance <= 10) ? HIGH : LOW);
    digitalWrite(LED_20CM, (distance > 10 && distance <= 20) ? HIGH : LOW);
    digitalWrite(LED_30CM, (distance > 20 && distance <= 30) ? HIGH : LOW);
    digitalWrite(LED_40CM, (distance > 30 && distance <= 40) ? HIGH : LOW);
}

// Function to get GPS location and print to Serial Monitor
void updateGPS() {
    while (gpsSerial.available() > 0) {
        gps.encode(gpsSerial.read());
    }

    if (gps.location.isUpdated()) {
        Serial.print("GPS Location: ");
        Serial.print("Lat: "); Serial.print(gps.location.lat(), 6);
        Serial.print(", Lon: "); Serial.println(gps.location.lng(), 6);
    }
}

