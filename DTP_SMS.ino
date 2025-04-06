#include <SoftwareSerial.h>
#include <Wire.h>
#include <Adafruit_BMP085.h>

// GSM SIM900A connections
#define GSM_RX_PIN 16
#define GSM_TX_PIN 17
SoftwareSerial gsmSerial(GSM_RX_PIN, GSM_TX_PIN);

// Ultrasonic sensor connections
#define TRIG_PIN 5
#define ECHO_PIN 4

// BMP180 sensor
Adafruit_BMP085 bmp;

const char phoneNumber[] = "+94771156259"; // Replace with your phone number

void setup() {
  Serial.begin(115200);
  gsmSerial.begin(9600);
  Wire.begin(21, 22); // Initialize I2C for BMP180

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  if (!bmp.begin()) {
    Serial.println("Could not find a valid BMP085 sensor, check wiring!");
    while (1);
  }

  Serial.println("Initializing GSM...");
  gsmSerial.println("AT");
  delay(1000);
  gsmSerial.println("AT+CMGF=1");
  delay(1000);
  gsmSerial.println("AT+CNMI=2,2,0,0,0");
  delay(1000);

  Serial.println("Sensors and GSM initialized.");
}

void loop() {
  // Ultrasonic distance measurement
  long duration;
  float distance;

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  duration = pulseIn(ECHO_PIN, HIGH);
  distance = (duration * 0.034 / 2); // Speed of sound in cm/µs

  // BMP180 temperature and pressure measurement
  float pressure = bmp.readPressure();
  float pressure_hpa = pressure / 100.0;
  float temperature = bmp.readTemperature();


  // Print to Serial Monitor
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  Serial.print("Pressure: ");
  Serial.print(pressure_hpa); // Convert Pa to hPa
  Serial.println(" hPa");

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" celcius");


  // Send SMS only if distance is below 3 cm
  if (distance < 3) {
    String message = "Distance: " + String(distance) + " cm, Pressure: " + String(pressure_hpa) + " hPa, Temperature: " + String(temperature) + " celcius" ;
    Serial.println("SMS message: " + message); // debug
    sendSMS(message);
    delay(10000); // Delay 10 seconds to prevent spamming SMS.
  }

  delay(1000); // reduced delay for more frequent checks
}

void sendSMS(String message) {
  gsmSerial.print("AT+CMGS=\"");
  gsmSerial.print(phoneNumber);
  gsmSerial.println("\"");
  delay(1000);
  gsmSerial.print(message);
  delay(1000);
  gsmSerial.write(26);
  delay(1000);

  Serial.println("SMS sent.");
}