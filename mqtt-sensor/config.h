// Wifi configuration
const char* SSID = "SSID-NAME";
const char* WIFI_PASS = "WIFI-PASSWORD";

// Sensor information
const char* SENSOR_ID = "ESP-01";
const char* LOCATION = "Somewhere";

// MQTT server configuration
const char* MQTT_SERVER = "172.19.78.138";
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "LEAK_SENSOR/ESP-01";

// Pin setup
const uint8_t TEMP_PIN = A0;
const uint8_t LEAK_PIN = D2;
const uint8_t RED_LED = D0;
const uint8_t BLUE_LED = D4;

// Message interval set to 10 seconds
const unsigned long mqttMessageInterval = 1000*10;
unsigned long messageTimer = 0;
