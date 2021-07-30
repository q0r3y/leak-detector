/**
 * This is the main application class.
 * It creates a SensorHandler, Creates a WebSocket server, and an HTTP server
 */

"use strict";

const _SENSOR_HANDLER = require('./node/SensorHandler.js');
const WEB_SOCKET = require('ws');
const DATA_HANDLER = require('./node/DataHandler');
const NODE_MAILER = require('nodemailer');
const CONFIG = require('./config.json');

class app {

    /**
     * @constructor
     */
    constructor() {
        this._SENSOR_HANDLER = new _SENSOR_HANDLER();
        const WEB_SOCKET_SERVER = new WEB_SOCKET.Server({port: 8082});
        //this.sendEmail("SENSOR: Server online", "The server has come online.");
        this.loadWebSocketServer(WEB_SOCKET_SERVER);
        this.loadHttpServer();

        this._SENSOR_HANDLER.clientListen((jsonMsg) => {

            const stringMsg = JSON.stringify(jsonMsg, null, 2); // pretty json

            // Need logic to prevent sensor spam
            // Move this all somewhere else

            if (jsonMsg.leak_status) {
                console.log(`SENSOR: Leak Detected ${jsonMsg.leak_status}`);
                this.sendEmail(`SENSOR: Leak Detected `,
                    `The sensor at: "${jsonMsg.location}" has detected a leak.
                    \n ${stringMsg}`);
            }

            if (jsonMsg.temp > CONFIG.TEMP_HIGH) {
                this.sendEmail(`SENSOR: High Temperature (${jsonMsg.temp})`,
                    `The sensor at: ${jsonMsg.location} `+
                    `Has detected a temperature ABOVE the threshold `+
                    `(${jsonMsg.temp}f / ${CONFIG.TEMP_HIGH}f) \n ${stringMsg}`);

            } else if (jsonMsg.temp < CONFIG.TEMP_LOW) {
                this.sendEmail(`SENSOR: Low Temperature (${jsonMsg.temp})`,
                    `The sensor at: ${jsonMsg.location} `+
                    `Has detected a temperature BELOW the threshold `+
                    `(${jsonMsg.temp}f / ${CONFIG.TEMP_LOW}f) \n ${stringMsg}`);
            }

            WEB_SOCKET_SERVER.clients.forEach((client) => {
                if (client.readyState === WEB_SOCKET.OPEN) {
                    client.send(stringMsg);
                }
            });
        });
    }

    /**
     * @desc Sends Status Emails
     * @param subject - The subject for the email
     * @param body - The body text for the email
     */
    sendEmail(subject, body) {
        const transporter = NODE_MAILER.createTransport({
            service: CONFIG.SERVICE,
            auth: {
                user: CONFIG.FROM_USER,
                pass: CONFIG.USER_PASS
            }
        });

        const mailOptions = {
            from: CONFIG.FROM_USER,
            to: CONFIG.TO_USER,
            subject: subject,
            text: body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(`[-] ${error}`);
            } else {
                console.log('[+] Email sent: ' + info.response);
            }
        });
    }

    /**
     * @desc Handles web socket connection
     * @param WEB_SOCKET_SERVER - Web socket server object
     */
    loadWebSocketServer(WEB_SOCKET_SERVER) {
        WEB_SOCKET_SERVER.on('connection', webSocket => {
            console.log(`[+] New WebSocket client connected.`);
            const sensors = this._SENSOR_HANDLER.getSensorData();
            for (let sensor of sensors) {
                const sensorData = {
                    sensor_id : sensor.sensorId,
                    location : sensor.location,
                    ip_addr : sensor.ipAddress,
                    mac_addr : sensor.macAddress,
                    leak_status : sensor.leakStatus,
                    temp : sensor.temperature,
                    updated : sensor.lastUpdate,
                }
                webSocket.send(JSON.stringify(sensorData));
            }
            webSocket.on('close', () => {
                console.log(`[-] WebSocket client disconnected.`);
            })
        })
    }

    /**
     * @desc Handles HTTP server connections
     */
    loadHttpServer() {
        const HTTP = require('http');
        const EJS = require('ejs');
        const fileName = 'live_sensors.ejs';
        let ejsData = null;

        HTTP.createServer(async (request, response) => {

            let httpHandler = (error, string, contentType) => {
                if (error) {
                    response.writeHead(500, {'Content-Type': 'text/plain'});
                    response.end('An error has occurred: ' + error.message);
                } else if (contentType.indexOf('css') >= 0 || contentType.indexOf('js') >= 0) {
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(string, 'utf-8');
                } else if (contentType.indexOf('html') >= 0) {
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(EJS.render(string, {
                        data: ejsData,
                        filename: fileName
                    }));
                } else {
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(string, 'binary');
                }
            };

            if (request.url.indexOf('.css') >= 0) {
                DATA_HANDLER.renderDom(request.url.slice(1), 'text/css', httpHandler, 'utf-8');
            } else if (request.url.indexOf('.js') >= 0) {
                DATA_HANDLER.renderDom(request.url.slice(1), 'application/javascript', httpHandler, 'utf-8');
            } else if (request.url.indexOf('.png') >= 0) {
                DATA_HANDLER.renderDom(request.url.slice(1), 'image/png', httpHandler, 'binary');
            } else if (request.url.indexOf('.woff') >= 0) {
                DATA_HANDLER.renderDom(request.url.slice(1), 'application/font-woff', httpHandler, 'binary');
            } else if (request.url.indexOf('.woff2') >= 0) {
                DATA_HANDLER.renderDom(request.url.slice(1), 'application/font-woff2', httpHandler, 'binary');
            } else if (request.url.indexOf('.ttf') >= 0) {
                DATA_HANDLER.renderDom(request.url.slice(1), 'application/x-font-truetype', httpHandler, 'binary');
            } else if (request.url.indexOf('.svg') >= 0) {
                DATA_HANDLER.renderDom(request.url.slice(1), 'image/svg+xml', httpHandler, 'binary');
            } else if (request.url.indexOf('.eot') >= 0) {
                DATA_HANDLER.renderDom(request.url.slice(1), 'application/vnd.ms-fontobject', httpHandler, 'binary');
            } else if (request.url.indexOf('.ico') >= 0) {
                DATA_HANDLER.renderDom(request.url.slice(1), 'image/x-icon', httpHandler, 'binary');
            } else if (request.url.indexOf('/') >= 0) {
                DATA_HANDLER.renderDom('src/html/live_sensors.ejs', 'text/html', httpHandler, 'utf-8');
            } else {
                DATA_HANDLER.renderDom(`HEY! What you're looking for: It's not here!`, 'text/html', httpHandler, 'utf-8');
            }
        }).listen(80);
    }
}

module.exports = app;
