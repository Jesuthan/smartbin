#define TRIG_PIN 5  // Trig pin connected to GPIO 5
#define ECHO_PIN 18 // Echo pin connected to GPIO 18

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  long duration;
  float distance;

  // Send a 10µs HIGH pulse to trigger the sensor
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read the echo pulse duration
  duration = pulseIn(ECHO_PIN, HIGH);

  // Convert time into distance (speed of sound = 343 m/s or 0.0343 cm/µs)
  distance = (duration * 0.0343) / 2;

  // Display distance on Serial Monitor
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  delay(500);  // Wait before next reading
}
