#include <SoftwareSerial.h>
#include <Wire.h> 
#include <Adafruit_BMP085.h>

// GSM SIM900A  connections
#define GSM_RX_PIN 16
#define GS M_TX_PIN 17
SoftwareSerial gsmSerial(GSM_RX_P IN, GSM_TX_PIN);

// Ultrasonic sensor connec tions
#define TRIG_PIN 5
#define ECHO_PIN 4

 // BMP180 sensor
Adafruit_BMP085 bmp;

const  char phoneNumber[] = "+00000000000"; // Repla ce with your phone number

void setup() {
  S erial.begin(115200);
  gsmSerial.begin(9600); 
  Wire.begin(21, 22); // Initialize I2C for  BMP180

  pinMode(TRIG_PIN, OUTPUT);
  pinMod e(ECHO_PIN, INPUT);

  if (!bmp.begin()) {
     Serial.println("Could not find a valid BMP0 85 sensor, check wiring!");
    while (1);
   }

  Serial.println("Initializing GSM...");
   gsmSerial.println("AT");
  delay(1000);
  gs mSerial.println("AT+CMGF=1");
  delay(1000);
   gsmSerial.println("AT+CNMI=2,2,0,0,0");
  d elay(1000);

  Serial.println("Sensors and GS M initialized.");
}

void loop() {
  // Ultra sonic distance measurement
  long duration;
   float distance;

  digitalWrite(TRIG_PIN, LO W);
  delayMicroseconds(2);
  digitalWrite(TR IG_PIN, HIGH);
  delayMicroseconds(10);
  dig italWrite(TRIG_PIN, LOW);

  duration = pulse In(ECHO_PIN, HIGH);
  distance = (duration *  0.034 / 2); // Speed of sound in cm/µs

  //  BMP180 temperature and pressure measurement
   float pressure = bmp.readPressure();
  floa t pressure_hpa = pressure / 100.0;
  float te mperature = bmp.readTemperature();


  // Pri nt to Serial Monitor
  Serial.print("Distance : ");
  Serial.print(distance);
  Serial.prin tln(" cm");

  Serial.print("Pressure: ");
   Serial.print(pressure_hpa); // Convert Pa to  hPa
  Serial.println(" hPa");

  Serial.print ("Temperature: ");
  Serial.print(temperature );
  Serial.println(" celcius");


  // Send  SMS only if distance is below 3 cm
  if (dist ance < 3) {
    String message = "Distance: "  + String(distance) + " cm, Pressure: " + Str ing(pressure_hpa) + " hPa, Temperature: " + S tring(temperature) + " celcius" ;
    Serial. println("SMS message: " + message); // debug
     sendSMS(message);
    delay(10000); // De lay 10 seconds to prevent spamming SMS.
  }

   delay(1000); // reduced delay for more freq uent checks
}

void sendSMS(String message) { 
  gsmSerial.print("AT+CMGS=\"");
  gsmSerial .print(phoneNumber);
  gsmSerial.println("\"" );
  delay(1000);
  gsmSerial.print(message); 
  delay(1000);
  gsmSerial.write(26);
  dela y(1000);

  Serial.println("SMS sent.");
} 