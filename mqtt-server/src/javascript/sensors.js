/* Global Variables */
let webSocket;
let webSocketUri = "ws://localhost:8082";
let sensors = [];

/* This function is called when the browser loads the sensor web page */
function webSocketConnect() {
  console.log("connect",webSocketUri);
  webSocket = new WebSocket(webSocketUri);

  // When the websocket receives a message
  webSocket.onmessage = function(msg) {
    let messageData = JSON.parse(msg.data);
    let sensorId = String(messageData.sensor_id);
    console.log(`Sensor ID: ${sensorId}`);
    if (!sensors.includes(sensorId)) { // If the sensor hasn't been added to the page
      console.log(`Creating new sensor div: ${sensorId}`);
      sensors.push(sensorId);
      createSensorDiv(messageData);
    } else { // Else we update the sensors data with the new message data
      console.log(`Updating current sensor: Sensor ID: ${sensorId}`);
      updateSensorDiv(messageData);
    }
  }

  // Update the status div with the connection status
  webSocket.onopen = function() {
    document.getElementById('status').innerHTML = "WebSocket: connected";
  }

  // Runs when the websocket connection is closed
  webSocket.onclose = function() {
    // update the status div with the connection status
    document.getElementById('status').innerHTML = "WebSocket: not connected";
    // in case of lost connection tries to reconnect every 3 secs
    setTimeout(webSocketConnect,3000);
  }
}

/* This function runs when it discovers a new sensor */
function createSensorDiv(messageData) {
  let div = "";
  div += `
  <div class="sensor" id="${messageData.sensor_id}">
  <a> Sensor ID: ${messageData.sensor_id}</a><br>
  <a> Sensor Location: ${messageData.location}</a><br>
  <a> Sensor IP: ${messageData.ip_addr}</a><br>
  <a> Sensor MAC: ${messageData.mac}</a><br>
  <a> Sensor Leak Status: ${messageData.leak_status}</a><br>
  <a> Sensor Temperature: ${messageData.temp}</a><br>
  </div>
  `;
  document.getElementById('sensorGrid').innerHTML += div;
}

/* This function runs when it receives a new message from an already discovered sensor */
function updateSensorDiv(messageData) {
  setDivColor(messageData);
  let updatedElement = "";
  updatedElement +=
  `
  <a> Sensor ID: ${messageData.sensor_id}</a><br>
  <a> Sensor Location: ${messageData.location}</a><br>
  <a> Sensor IP: ${messageData.ip_addr}</a><br>
  <a> Sensor MAC: ${messageData.mac}</a><br>
  <a> Sensor Leak Status: ${messageData.leak_status}</a><br>
  <a> Sensor Temperature: ${messageData.temp}</a><br>
  `;
  document.getElementById(messageData.sensor_id).innerHTML = updatedElement;
}

/* This function sets the sensor div background colors based on that status that
   was received in the message */
function setDivColor(messageData) {

  let temp = messageData.temp;
  let leaking = messageData.leak_status;
  let sensor = messageData.sensor_id;
  let tempTooHot = ( temp > 90 );
  let tempTooCold = ( temp < 60 );
  let doc = document.getElementById(sensor);
  // Resets css class to "sensor" in order to remove animation if an animation class was previously applied
  doc.className = "sensor";

  blockScope: {
    if ( !leaking && !tempTooHot && !tempTooCold ) { // Everything is good
      console.log("Everything is good");
      doc.style.backgroundColor = "lightgreen";
      break blockScope;
    } else if ( !leaking && tempTooHot && !tempTooCold ) { // The temp is too hot
      console.log("The temp is too hot");
      doc.style.backgroundColor = "#FFFF66"; // #FFFF66 = Yellow
      break blockScope;
    } else if ( !leaking && !tempTooHot && tempTooCold ) { // The temp is too cold
      console.log("The temp is too cold");
      doc.style.backgroundColor = "skyblue";
      break blockScope;
    } else if ( leaking && !tempTooHot && !tempTooCold ) { // There is a leak & temps are normal
      console.log("There is a leak");
      doc.style.backgroundColor = "crimson";
      break blockScope;
    } else if ( leaking && tempTooHot && !tempTooCold ) { // There is a leak & the temp is too hot
      console.log(`There is a leak and temp too hot`);
      doc.className = "leakHot";
      break blockScope;
    } else if ( leaking && !tempTooHot && tempTooCold ) { // There is a leak & the temp is too cold
      console.log(`There is a leak and temp too cold`);
      doc.className = "leakCold";
      break blockScope;
    } else {
      console.log(`I don't even know. ¯\\_(ツ)_/¯`);
    }
  }
}

/* --.- .-. -.-- */
