/**
 * This class handles all the data communicated over the MQTT protocol. It connects to an MQTT broker. It then
 * loops through each Sensor inside the sensorCollection and subscribes to all the MQTT Topics that are
 * 'linked' to the Sensor objects. Then it continuously listens to all of those topics for incoming data
 * and updates the appropriate sensor within sensorCollection with the received data. The listener accepts a
 * callback function which can be used to do other things with the received data.
 */

'use strict';

// todo:  Setup MQTT Authentication

const MQTT = require('mqtt');
const SENSOR = require('./Sensor.js');
const CONFIG = require('../config.json');

class SensorHandler {

    #_mqttClient;
    #_sensorCollection = {};

    /**
     * @constructor
     */
    constructor() {
        const MQTT_BROKER = "mqtt://"+CONFIG.MQTT_BROKER_IP;
        console.log(`[*] Constructing SensorHandler..`);
        this.clientConnect(MQTT_BROKER).then(() => {
            this.createSensorArray().then(() => {
                this.clientSubscribe();
            }).catch((err) => {
                console.log(err);
            })
        }).catch((err) => { console.log(err); });
    }

    /**
     * @desc Connects the client to MQTT broker.
     *       Upon connection the callback loops through all sensors in sensorCollection
     *       and subscribes to every topic within the Sensor objects.
     * @param {string} MQTT_BROKER_IP - The IP Address of the MQTT broker
     */
    clientConnect(MQTT_BROKER_IP) {
        return new Promise( (resolve, reject) => {
            console.log(`[*] Connecting to MQTT Broker..`);
            this.#_mqttClient = MQTT.connect(MQTT_BROKER_IP);
            if (this.#_mqttClient.disconnected) {
                reject();
            }
            this.#_mqttClient.on('connect', () => {
                console.log(`[+] Client connected to MQTT Broker`);
                resolve();
            });
        })
    }

    /**
     * @desc This function takes the sensor topic array from the config file
     * and loops through the topics to create sensor objects which are subscribed
     * to those topics and places them inside the sensorCollection
     */
    createSensorArray() {
        console.log(`[*] Building Sensor Array..`);
        return new Promise((resolve, reject) => {
            let sensors = {};
            let index = 1;
            try {
                for (let topic of CONFIG.SENSOR_TOPICS) {
                    sensors[`sensor${index}`] = new SENSOR(topic, 2);
                    index++;
                }
                this.#_sensorCollection = sensors;
                console.log('[+] Sensor array creation completed.');
                resolve();
            } catch (err) {
                console.log(`[-] Error creating sensor array. ${err}`);
                reject();
            }
        });
    }

    /**
     * @desc This function loops through the entire sensorCollection array
     * and subscribes to every topic that has been assigned to the sensors
     */
    clientSubscribe() {
        console.log(`[*] Subscribing to topics..`);
        Object.values(this.#_sensorCollection).forEach( sensor => {
            this.#_mqttClient.subscribe(sensor.topic, (err) => {
                if (err) {
                    console.log(`[-] Error when trying to subscribe to topic ${sensor.topic}. ${err}`);
                } else {
                    console.log(`[+] Subscribed to ${sensor.topic}`);
                }
            })
        });
    }

    /**
     * @desc Puts the client in a state that listens for incoming messages.
     *       Upon receiving a message, the mqttClient callback function loops through
     *       the sensors within sensorCollection and finds the sensors that are subscribed
     *       to the incoming message topic. It then sets the sensors data field to
     *       the data that was received.
     * @param {function} callback - Callback function that is fed the data received
     *       from the MQTT broker.
     */
    clientListen(callback) {
        console.log(`[*] MQTT Client Listening..`);
        this.#_mqttClient.on('message', (topic, message) => {
            console.log(`\n[+] Client has received a message on topic: ${topic}: `);
            Object.values(this.#_sensorCollection).forEach( sensor => {
                if (topic === sensor.topic) {
                    let recMessage = {
                        "sensor_id":"none",
                        "location":"none",
                        "leak_status":null,
                        "temp":0,
                        "ip_addr":"0.0.0.0",
                        "mac":"00:00:00:00:00:00"
                    };
                    try {
                        recMessage = JSON.parse(message);
                    } catch (err) {
                        console.error(`[-] ${err}. The message received was not JSON: Message set to default value.\n`);
                    }
                    sensor.sensorData = recMessage;
                    console.log(`Received message:`,sensor.sensorData);
                    if (typeof (callback) == "function") {
                        callback(recMessage);
                    }
                }
            });
        }, 1000);
    }

    // getSensorData() {
    //     let sensorData = [];
    //     Object.values(sensorCollection).forEach( sensor => {
    //         sensorData[sensor.sensorId] = sensor.sensorData;
    //     });
    //     return sensorData;
    // }

}

module.exports = SensorHandler;
