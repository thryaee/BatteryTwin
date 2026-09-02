# ESP32 Firmware

## Required Libraries (Arduino Library Manager)

| Library | Version | Install via |
|---|---|---|
| Adafruit INA219 | ≥1.2.1 | Arduino Library Manager |
| PubSubClient | ≥2.8.0 | Arduino Library Manager |
| ArduinoJson | ≥6.21 | Arduino Library Manager |

## Board Settings

- Board: **ESP32 Dev Module**
- Upload Speed: 115200
- Partition: Default (or Minimal SPIFFS for more program space)

## Configuration

Open `battery_sensor.ino` and edit the **CONFIGURATION** section:

```cpp
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_BROKER   = "192.168.1.100"; // Your PC's LAN IP
```

## Wiring Summary

```
ESP32 Pin  │ Connected To
───────────┼─────────────────────────────
GPIO 21    │ INA219 SDA
GPIO 22    │ INA219 SCL
3.3V       │ INA219 VCC
GND        │ INA219 GND
GPIO 34    │ NTC Thermistor (voltage divider)
GPIO 26    │ Relay module IN
GPIO 2     │ Status LED (built-in)
```

## Testing Without Hardware

Set `USE_SIMULATOR=true` in `backend/.env` to run the system without any ESP32.
The Python simulator generates identical data to what the ESP32 would send.
