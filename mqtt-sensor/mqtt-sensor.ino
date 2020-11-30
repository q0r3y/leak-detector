#define ARDUINOJSON_ENABLE_PROGMEM 0
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"

// TODO: Comment out all serial lines for final unit

// V 0.1.4 - Fixed ip & mac concatenation bug

WiFiClient wifiClient;
PubSubClient client(MQTT_SERVER, MQTT_PORT, wifiClient);

String macAddress;
String ipAddress;

// Arduino setup function is ran once upon boot
void setup() {
  Serial.begin(115200);
  setPins();
  setWifi();
  connectToBroker();
}

void loop() {
  if(WiFi.status() == WL_CONNECTED) { // Used to reconnect to WiFi it the connection is dropped
    unsigned long currentTime = millis();
    if (currentTime - messageTimer >= mqttMessageInterval) { // Sends a message every mqttMessageInterval amount of seconds
      bool isLeaking = digitalRead(LEAK_PIN);
      Serial.println(F("[+] Checking temp.."));
      int currentTemp = getTemp();
      if (isLeaking) {
        digitalWrite(RED_LED, LOW);
      } else {
        digitalWrite(RED_LED, HIGH);
      }
      digitalWrite(BLUE_LED, LOW);
      StaticJsonDocument<200> doc;
      // CREATING JSON OBJECT
      doc["ip_addr"] = ipAddress;
      doc["mac"] = macAddress;
      doc["sensor_id"] = SENSOR_ID;
      doc["location"] = LOCATION;
      doc["leak_status"] = isLeaking;
      doc["temp"] = currentTemp;
      char buffer[256];
      size_t n = serializeJson(doc, buffer);
      //
      if (client.publish(MQTT_TOPIC,buffer,n) == true) {
        Serial.println(F("[+] Success sending message from main loop"));
      } else {
        Serial.println(F("[-] Error sending message from main loop"));
        Serial.println(F("[*] Reconnecting to MQTT Broker"));
        connectToBroker();
      }
      messageTimer = currentTime;
      digitalWrite(BLUE_LED, HIGH);
    }
  } else {
    Serial.println(F("[-] Wifi disconnected.."));
    setWifi();
  }
}

// Initializes PIN states (HIGH == OFF, LOW == ON)
void setPins() {
  pinMode(RED_LED, OUTPUT);
  digitalWrite(RED_LED, HIGH);
  pinMode(BLUE_LED, OUTPUT);
  digitalWrite(BLUE_LED, HIGH);
}

// Connects to WiFi
void setWifi() {
  macAddress = "";
  ipAddress = "";
  WiFi.begin(SSID,WIFI_PASS);
  WiFi.mode(WIFI_STA); // Puts ESP into station mode
  Serial.print(F("[+] WiFi connecting.."));
  while(WiFi.status() != WL_CONNECTED) {
    digitalWrite(BLUE_LED, LOW);
    Serial.print(".");
    delay(500);
    digitalWrite(BLUE_LED, HIGH);
  }
  Serial.println(F(""));
  ipAddress += WiFi.localIP().toString();
  Serial.print(F("[+] IP Address: "));
  Serial.println(ipAddress);
  macAddress += WiFi.macAddress();
  Serial.print(F("[+] MAC: "));
  Serial.println(WiFi.macAddress());
}

// Connects to MQTT broker
void connectToBroker() {
  client.setServer(MQTT_SERVER, MQTT_PORT);
  while (!client.connected()) {
    Serial.println(F("[*] Connecting to MQTT Broker.. "));
    Serial.print(F("[*] MQTT IP Address: "));
    Serial.println(MQTT_SERVER);
    Serial.print("[*] Port: ");
    Serial.println(MQTT_PORT);
    if (client.connect(SENSOR_ID)) {
      Serial.println(F("[+] Connected to MQTT Broker."));
    } else {
      Serial.println(F("[-] Connection to MQTT Broker failed. Trying again."));
    }
  }
}

// Gets temperature from TEMP_PIN
int getTemp() {
  int reading = analogRead(TEMP_PIN);
  float voltage = reading * 3.3;
  voltage /= 1024.0;
  float farenheitTemp = (((voltage - 0.5) * 100) * 9.0 / 5.0) + 32.0;
  int integerTemp = farenheitTemp;
  return integerTemp;
}
