/**
 * This class represents a physical sensor. It is constructed using a topic and a quality of service number.
 * The topic is used when initially gathering the data from the MQTT broker via the SensorHandler class.
 */

'use strict';

class Sensor {

    #_subscribeData
    #_topic
    #_sensorId = 'default'
    #_sensorData = {"sensor_id":"none","location":"none","leak_status":null,"temp":0,"ip_addr":"0.0.0.0","mac":"00:00:00:00:00:00"}
    #_temperature = 'default'
    #_location = 'default'
    #_leakStatus = 'default'
    #_ipAddress = 'default'
    #_macAddress = 'default'

    /**
     * @constructor
     * @param {string} topic
     * @param {int} qos
     */
    constructor(topic, qos) {
        this.#_topic = topic;
        this.#_subscribeData = {};
        this.#_subscribeData[topic] = {qos: qos};
    }

    // Subscribe data is an object that is used when making the initial subscription within Sensor Handler.
    get subscribeData() {
        return this.#_subscribeData;
    }

    // Sets the subscribe data
    set subscribeData(value) {
        this.#_subscribeData = value;
    }

    // Sensor data is used for initial assignment received from JSON
    get sensorData() {
        return this.#_sensorData;
    }

    set sensorData(value) {
        this.#_sensorData = value;
        try {
            this.#_sensorId = value.sensor_id;
            this.#_location = value.location;
            this.#_leakStatus = value.leak_status;
            this.#_temperature = value.temp;
            this.#_macAddress = value.mac;
            this.#_ipAddress = value.ip_addr;
        } catch (e) {
            console.log(e);
        }
    }

    get topic() {
        return this.#_topic;
    }

    set topic(value) {
        this.#_topic = value;
    }

    get sensorId() {
        return this.#_sensorId;
    }

    set sensorId(value) {
        this.#_sensorId = value;
    }

    get temperature() {
        return this.#_temperature;
    }

    set temperature(value) {
        this.#_temperature = value;
    }

    get location() {
        return this.#_location;
    }

    set location(value) {
        this.#_location = value;
    }

    get leakStatus() {
        return this.#_leakStatus;
    }

    set leakStatus(value) {
        this.#_leakStatus = value;
    }

    get ipAddress() {
        return this.#_ipAddress;
    }

    set ipAddress(value) {
        this.#_ipAddress = value;
    }

    get macAddress() {
        return this.#_macAddress;
    }

    set macAddress(value) {
        this.#_macAddress = value;
    }

}

module.exports = Sensor;
