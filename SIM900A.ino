#include <HardwareSerial.h>

// Initialize hardware serial for GSM module
HardwareSerial mySerial(1);

// Define pin assignments for ultrasonic sensor and LEDs
const int trigPin = 18;
const int echoPin = 19;
const int led1 = 23; // LED for 30cm distance
const int led2 = 22; // LED for 20cm distance
const int led3 = 21; // LED for 10cm distance
const int led4 = 5;  // LED for 0cm distance

// Variables to store sensor readings
long duration;
int distance;
bool smsSent = false; // Flag to prevent repeated SMS sending

// Function declaration
void SendMessage();
void sendLocation();

void setup() {
  // Configure pins as input/output
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(led3, OUTPUT);
  pinMode(led4, OUTPUT);
  
  // Start serial communication for debugging and GSM module
  Serial.begin(115200);
  mySerial.begin(9600, SERIAL_8N1, 16, 17); // GSM Module TX = 17, RX = 16
}

void loop() {
  // Trigger ultrasonic sensor to measure distance
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH, 30000); // Increased timeout
  
  // Convert time to distance (cm)
  if (duration == 0) {
    Serial.println("Ultrasonic sensor timeout - check wiring");
    return;
  }
  distance = duration * 0.0340 / 2;

  // Print distance to serial monitor
  Serial.print("Distance: ");
  Serial.println(distance);

  // Control LEDs based on distance thresholds
  digitalWrite(led1, (distance <= 30 && distance > 20) ? HIGH : LOW);
  digitalWrite(led2, (distance <= 20 && distance > 10) ? HIGH : LOW);
  digitalWrite(led3, (distance <= 10 && distance > 5) ? HIGH : LOW);
  digitalWrite(led4, (distance == 5) ? HIGH : LOW);

  // If distance is less than 10 cm, send SMS alert with location
  if (distance < 5 && !smsSent) {
    SendMessage();
    sendLocation();
    smsSent = true; // Prevent repeated SMS sending
  }
  else if (distance >= 5) {
    smsSent = false; // Reset flag when distance is above threshold
  }

  delay(1000); // Delay to avoid repeated triggering
}

// Function to send an SMS alert using GSM module
void SendMessage() {
  Serial.println("Sending SMS...");
  mySerial.println("AT+CMGF=1"); // Set SMS mode to text
  delay(1000);
  mySerial.println("AT+CMGS=\"+94771156259\"\r"); // Replace with recipient number
  delay(1000);
  mySerial.println("Alert! The distance has reached below 10 cm. The bin is full."); // Message content
  delay(100);
  mySerial.println((char)26); // End SMS command
  delay(1000);
  Serial.println("SMS Sent");
}

// Function to send location via SMS
void sendLocation() {
  Serial.println("Sending Location...");
  mySerial.println("AT+CMGF=1"); // Set SMS mode to text
  delay(1000);
  mySerial.println("AT+CMGS=\"+94771156259\"\r"); // Replace with recipient number
  delay(1000);
  mySerial.println("Location: https://maps.google.com/?q=6.9271,79.8612"); // Replace with actual location coordinates
  delay(100);
  mySerial.println((char)26); // End SMS command
  delay(1000);
  Serial.println("Location Sent");
}
