#!/usr/bin/env bash

# This is a test script for publishing MQTT messages to
# the mosquitto broker. It takes an integer command line
# argument and publishes int number of messages on int
# number of sensor topics. It's being used to simulate
# up to int number of sensors. (need mosquitto installed)

function publishMessages {
 for (( i=1; i<=$1; i++ ))
 do
   zeroPad=$(printf "%02d" $i)
   mosquitto_pub -t "SENSOR/ESP-$zeroPad" -m "{\"ip_addr\":\"171.19.52.170\",\"mac\":\"84:F3:EB:0C:7E:B1\",\"sensor_id\":\"ESP-0$i\",\"location\":\"Somewhere\",\"leak_status\":false,\"temp\":90}"
   echo "mosquitto_pub -t "SENSOR/ESP-$zeroPad" -m "{\"ip_addr\":\"171.19.52.170\",\"mac\":\"84:F3:EB:0C:7E:B1\",\"sensor_id\":\"ESP-0$i\",\"location\":\"Somewhere\",\"leak_status\":false,\"temp\":90}""
 done
}
publishMessages $1
