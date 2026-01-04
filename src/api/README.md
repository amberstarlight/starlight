# starlight/api

REST API for Starlight. Connects to `zigbee2mqtt` and `mosquitto` or other MQTT
endpoint.

## Environment Variables

### `PORT`

The port the API runs on. Defaults to 8080.


### `MQTT_ENDPOINT_HOSTNAME`

The endpoint for the MQTT server. Defaults to `localhost`, using `mqtt`
protocol.


### `MQTT_ENDPOINT_PORT`

The port the MQTT endpoint uses. Defaults to 1883.
