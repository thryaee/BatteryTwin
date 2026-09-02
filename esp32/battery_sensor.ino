/**
 * battery_sensor.ino
 * -------------------
 * BatteryTwin ESP32 Firmware
 *
 * Hardware:
 *   - ESP32 (any variant with WiFi)
 *   - INA219 (voltage + current measurement via I²C)
 *   - NTC thermistor OR DS18B20 (temperature)
 *   - 5V relay module (connected to RELAY_PIN)
 *
 * Wiring:
 *   INA219:
 *     VCC  → 3.3V
 *     GND  → GND
 *     SDA  → GPIO 21 (default I²C SDA)
 *     SCL  → GPIO 22 (default I²C SCL)
 *
 *   NTC Thermistor (voltage divider to 3.3V):
 *     Top of divider  → 3.3V
 *     NTC             → GPIO 34 (ADC input)
 *     Bottom resistor → GND
 *
 *   Relay:
 *     IN   → GPIO 26
 *     VCC  → 5V
 *     GND  → GND
 *     (Connect relay COM/NO between charger output and battery)
 *
 * Dependencies (install via Arduino Library Manager):
 *   - Adafruit INA219 (by Adafruit)
 *   - PubSubClient   (by Nick O'Leary)
 *   - ArduinoJson    (by Benoit Blanchon)
 *
 * Configuration:
 *   Edit the CONFIGURATION section below with your WiFi + MQTT credentials.
 *
 * MQTT topics:
 *   Publish: chargex/battery/data   (sensor readings every PUBLISH_INTERVAL_MS)
 *   Publish: chargex/device/heartbeat
 *   Subscribe: chargex/relay/control (relay ON/OFF commands from backend)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <ArduinoJson.h>

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION – edit these values
// ═══════════════════════════════════════════════════════════════════

// WiFi credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT broker (your PC's LAN IP where Mosquitto runs)
const char* MQTT_BROKER   = "192.168.1.100";   // <-- replace with your PC's IP
const int   MQTT_PORT     = 1883;
const char* MQTT_USERNAME = "";                 // leave empty if no auth
const char* MQTT_PASSWORD_STR = "";            // leave empty if no auth

// MQTT topics (must match backend config)
const char* TOPIC_DATA      = "chargex/battery/data";
const char* TOPIC_RELAY     = "chargex/relay/control";
const char* TOPIC_HEARTBEAT = "chargex/device/heartbeat";

// Device identity
const char* BATTERY_ID      = "BATTERY_01";
const char* CLIENT_ID       = "esp32-battery-01";

// Hardware pins
const int RELAY_PIN         = 26;    // Digital output to relay module
const int TEMP_ADC_PIN      = 34;    // Analog input for NTC thermistor
const int STATUS_LED_PIN    = 2;     // Built-in LED on most ESP32 boards

// Timing
const unsigned long PUBLISH_INTERVAL_MS  = 2000;   // sensor publish rate
const unsigned long HEARTBEAT_INTERVAL_MS = 10000; // heartbeat rate
const unsigned long RECONNECT_DELAY_MS   = 5000;

// NTC thermistor parameters (adjust for your sensor)
const float NTC_NOMINAL_R     = 10000.0;  // Resistance at nominal temp (Ω)
const float NTC_NOMINAL_TEMP  = 25.0;     // Nominal temperature (°C)
const float NTC_BETA          = 3950.0;   // Beta coefficient
const float NTC_SERIES_R      = 10000.0;  // Series resistor value (Ω)
const float ADC_REF_V         = 3.3;      // ESP32 ADC reference voltage
const int   ADC_MAX           = 4095;     // 12-bit ADC

// Battery SOC estimation parameters
const float BATTERY_FULL_V    = 4.20;     // Volts at 100% SOC
const float BATTERY_EMPTY_V   = 2.80;     // Volts at 0% SOC
const float NOMINAL_CAPACITY_AH = 3.0;   // Ah (3000 mAh for 18650)

// ═══════════════════════════════════════════════════════════════════
// GLOBALS
// ═══════════════════════════════════════════════════════════════════

Adafruit_INA219 ina219;
WiFiClient      wifiClient;
PubSubClient    mqttClient(wifiClient);

unsigned long lastPublishMs  = 0;
unsigned long lastHeartbeatMs = 0;
bool          relayState     = true;    // true = ON (charging allowed)
float         socEstimate    = 50.0;    // Coulomb-counted SOC
float         totalChargeAh  = 0.0;    // Running charge accumulator
unsigned long lastSocMs      = 0;

// ═══════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[BatteryTwin] ESP32 Firmware starting...");

  // GPIO setup
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  setRelay(true);   // Start with relay ON (charging allowed)

  // I²C + INA219
  Wire.begin();
  if (!ina219.begin()) {
    Serial.println("[ERROR] INA219 not found! Check wiring.");
    // Flash error pattern
    while (true) {
      blinkLed(3, 100);
      delay(1000);
    }
  }
  ina219.setCalibration_32V_2A();   // Calibrate for ±2A measurement
  Serial.println("[OK] INA219 initialised.");

  // WiFi
  connectWiFi();

  // MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);
  connectMQTT();

  lastSocMs = millis();
  Serial.println("[BatteryTwin] Ready. Publishing to: " + String(TOPIC_DATA));
}

// ═══════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════

void loop() {
  // Maintain WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Connection lost. Reconnecting...");
    connectWiFi();
  }

  // Maintain MQTT
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  unsigned long now = millis();

  // Publish sensor data
  if (now - lastPublishMs >= PUBLISH_INTERVAL_MS) {
    lastPublishMs = now;
    publishSensorData();
  }

  // Publish heartbeat
  if (now - lastHeartbeatMs >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatMs = now;
    publishHeartbeat();
  }
}

// ═══════════════════════════════════════════════════════════════════
// SENSOR READING
// ═══════════════════════════════════════════════════════════════════

float readVoltage() {
  // INA219 measures bus voltage (after shunt resistor)
  return ina219.getBusVoltage_V();
}

float readCurrent() {
  // INA219 returns milliamps; convert to amps
  // Positive = charging, negative = discharging
  return ina219.getCurrent_mA() / 1000.0;
}

float readTemperature() {
  // Read NTC thermistor via Steinhart-Hart (Beta equation)
  int adcRaw = analogRead(TEMP_ADC_PIN);
  if (adcRaw <= 0) return 25.0;  // fallback on bad ADC

  float voltage   = adcRaw * (ADC_REF_V / ADC_MAX);
  float resistance = NTC_SERIES_R * (ADC_REF_V / voltage - 1.0);

  // Beta equation: 1/T = 1/T0 + (1/B) * ln(R/R0)
  float steinhart = resistance / NTC_NOMINAL_R;
  steinhart = log(steinhart);
  steinhart /= NTC_BETA;
  steinhart += 1.0 / (NTC_NOMINAL_TEMP + 273.15);
  steinhart = 1.0 / steinhart;
  return steinhart - 273.15;   // Convert K to °C
}

float estimateSOC(float voltage, float currentA, float dtSeconds) {
  // Coulomb counting: ΔSOCa = (I × Δt / Capacity) × 100
  float deltaSoc = (currentA * (dtSeconds / 3600.0) / NOMINAL_CAPACITY_AH) * 100.0;
  socEstimate += deltaSoc;
  socEstimate = constrain(socEstimate, 0.0, 100.0);

  // Blend with OCV estimate when current is near zero (recalibration)
  if (abs(currentA) < 0.05) {
    float ocvSoc = (voltage - BATTERY_EMPTY_V) /
                   (BATTERY_FULL_V - BATTERY_EMPTY_V) * 100.0;
    ocvSoc = constrain(ocvSoc, 0.0, 100.0);
    // Weighted blend: 80% coulomb, 20% OCV when idle
    socEstimate = 0.8 * socEstimate + 0.2 * ocvSoc;
  }

  return socEstimate;
}

// ═══════════════════════════════════════════════════════════════════
// MQTT PUBLISHING
// ═══════════════════════════════════════════════════════════════════

void publishSensorData() {
  unsigned long now = millis();
  float dtSeconds = (now - lastSocMs) / 1000.0;
  lastSocMs = now;

  float voltage     = readVoltage();
  float currentA    = readCurrent();
  float temperature = readTemperature();
  float soc         = estimateSOC(voltage, currentA, dtSeconds);
  float power       = voltage * currentA;

  // Clamp and sanity check
  voltage     = constrain(voltage, 0.0, 5.0);
  temperature = constrain(temperature, -40.0, 100.0);

  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["battery_id"]    = BATTERY_ID;
  doc["voltage_v"]     = round(voltage * 1000.0) / 1000.0;
  doc["current_a"]     = round(currentA * 1000.0) / 1000.0;
  doc["temperature_c"] = round(temperature * 100.0) / 100.0;
  doc["soc_percent"]   = round(soc * 100.0) / 100.0;
  doc["data_source"]   = "ESP32_HARDWARE";
  doc["timestamp_ms"]  = (unsigned long)now;

  char payload[256];
  serializeJson(doc, payload);

  if (mqttClient.publish(TOPIC_DATA, payload, false)) {
    Serial.printf("[MQTT] Published: V=%.3fV I=%.3fA T=%.1f°C SOC=%.1f%%\n",
                  voltage, currentA, temperature, soc);
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(50);
    digitalWrite(STATUS_LED_PIN, LOW);
  } else {
    Serial.println("[MQTT] Publish failed.");
  }
}

void publishHeartbeat() {
  StaticJsonDocument<128> doc;
  doc["device_id"]  = CLIENT_ID;
  doc["uptime_ms"]  = millis();
  doc["relay_state"] = relayState;
  doc["wifi_rssi"]  = WiFi.RSSI();

  char payload[128];
  serializeJson(doc, payload);
  mqttClient.publish(TOPIC_HEARTBEAT, payload, false);
}

// ═══════════════════════════════════════════════════════════════════
// MQTT CALLBACK (relay control)
// ═══════════════════════════════════════════════════════════════════

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String topicStr(topic);
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.printf("[MQTT] Received on '%s': %s\n", topic, msg.c_str());

  if (topicStr == TOPIC_RELAY) {
    StaticJsonDocument<128> doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (err) {
      Serial.println("[MQTT] Failed to parse relay command JSON.");
      return;
    }

    bool newState = doc["relay_state"] | true;
    const char* reason = doc["reason"] | "No reason provided";
    setRelay(newState);
    Serial.printf("[RELAY] → %s | Reason: %s\n",
                  newState ? "ON" : "OFF", reason);
  }
}

// ═══════════════════════════════════════════════════════════════════
// RELAY CONTROL
// ═══════════════════════════════════════════════════════════════════

void setRelay(bool on) {
  relayState = on;
  // Most relay modules are active-LOW: LOW = relay ON, HIGH = relay OFF
  // If yours is active-HIGH, invert the logic here.
  digitalWrite(RELAY_PIN, on ? LOW : HIGH);
  Serial.printf("[RELAY] Set to %s\n", on ? "ON (charging allowed)" : "OFF (charging cut)");
}

// ═══════════════════════════════════════════════════════════════════
// CONNECTIVITY
// ═══════════════════════════════════════════════════════════════════

void connectWiFi() {
  Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Connected! IP: %s\n",
                  WiFi.localIP().toString().c_str());
    blinkLed(2, 200);
  } else {
    Serial.println("\n[WiFi] Connection failed. Will retry in loop.");
  }
}

void connectMQTT() {
  int attempts = 0;
  while (!mqttClient.connected() && attempts < 5) {
    Serial.printf("[MQTT] Connecting to %s:%d...\n", MQTT_BROKER, MQTT_PORT);

    bool connected;
    if (strlen(MQTT_USERNAME) > 0) {
      connected = mqttClient.connect(CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD_STR);
    } else {
      connected = mqttClient.connect(CLIENT_ID);
    }

    if (connected) {
      Serial.println("[MQTT] Connected to broker.");
      // Subscribe to relay control topic
      mqttClient.subscribe(TOPIC_RELAY, 1);
      Serial.printf("[MQTT] Subscribed to: %s\n", TOPIC_RELAY);
      blinkLed(3, 100);
      return;
    } else {
      Serial.printf("[MQTT] Failed (state=%d). Retrying in %dms...\n",
                    mqttClient.state(), RECONNECT_DELAY_MS);
      delay(RECONNECT_DELAY_MS);
      attempts++;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

void blinkLed(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(STATUS_LED_PIN, LOW);
    delay(delayMs);
  }
}
