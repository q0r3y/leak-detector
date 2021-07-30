/**
 * This class represents a physical sensor. It is constructed using a topic and a quality of service number.
 * The topic is used when initially gathering the data from the MQTT broker via the SensorHandler class.
 */

'use strict';

class Sensor {

    #_qos
    #_topic
    #_sensorId = ''
    #_temperature = 'default'
    #_location = 'default'
    #_leakStatus = 'default'
    #_ipAddress = 'default'
    #_macAddress = 'default'
    #_lastUpdate = 'default'

    /**
     * @constructor
     * @param {string} topic
     * @param {int} qos
     */
    constructor(topic, qos) {
        this.#_topic = topic;
        this.#_qos = qos;
        this.#_lastUpdate = Date.now();
    }

    get qos() {
        return this.#_qos;
    }

    set qos(value) {
        this.#_qos = value;
    }

    get lastUpdate () {
        return this.#_lastUpdate;
    }

    set lastUpdate(value) {
        this.#_lastUpdate = value;
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
