/**
 * battery_sensor.ino
 * -------------------
 * BatteryTwin ESP32 Firmware
 *
 * Hardware:
 *   - ESP32 (any variant with WiFi)
 *   - INA219 (voltage + current measurement via I²C)
 *   - DHT11  (temperature sensor on GPIO 4)
 *   - OLED   (SSD1306 128x64 I²C display on GPIO 21/22)
 *   - 5V Relay module (GPIO 26)
 *   - 7.4V Li-ion battery (2S)
 *   - 9V adapter (charger input)
 *
 * Wiring:
 *   INA219:
 *     VCC  → 3.3V
 *     GND  → GND
 *     SDA  → GPIO 21
 *     SCL  → GPIO 22
 *     VIN+ → 9V Adapter(+) after fuse/switch
 *     VIN- → Relay COM
 *
 *   DHT11:
 *     VCC  → 3.3V
 *     DATA → GPIO 4  (4.7kΩ pull-up to 3.3V)
 *     GND  → GND
 *
 *   OLED (SSD1306 I2C):
 *     VCC  → 3.3V
 *     GND  → GND
 *     SDA  → GPIO 21 (shared with INA219)
 *     SCL  → GPIO 22 (shared with INA219)
 *
 *   Relay:
 *     VCC  → 5V
 *     GND  → GND
 *     IN   → GPIO 26
 *     COM  → INA219 VIN-
 *     NO   → Battery(+) 7.4V
 *
 *   LM2596:
 *     IN(+) → 9V Adapter(+)
 *     IN(-) → GND
 *     OUT(+)→ 5V rail (Relay VCC)
 *     OUT(-)→ GND
 *
 * Dependencies (install via Arduino Library Manager):
 *   - Adafruit INA219       (by Adafruit)
 *   - DHT sensor library    (by Adafruit)
 *   - Adafruit Unified Sensor (by Adafruit)
 *   - Adafruit SSD1306      (by Adafruit)
 *   - Adafruit GFX Library  (by Adafruit)
 *   - PubSubClient          (by Nick O'Leary)
 *   - ArduinoJson           (by Benoit Blanchon)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION – edit these values
// ═══════════════════════════════════════════════════════════════════

// WiFi credentials
const char* WIFI_SSID     = "BHASKAR-2.4_EXT";
const char* WIFI_PASSWORD = "12345678";

// MQTT broker (your PC's LAN IP where Mosquitto runs)
const char* MQTT_BROKER   = "192.168.1.100";
const int   MQTT_PORT     = 1883;
const char* MQTT_USERNAME = "";
const char* MQTT_PASSWORD_STR = "";

// MQTT topics
const char* TOPIC_DATA      = "chargex/battery/data";
const char* TOPIC_RELAY     = "chargex/relay/control";
const char* TOPIC_HEARTBEAT = "chargex/device/heartbeat";

// Device identity
const char* BATTERY_ID  = "BATTERY_01";
const char* CLIENT_ID   = "esp32-battery-01";

// Hardware pins
#define DHT_PIN          4     // DHT11 data pin
#define DHT_TYPE         DHT11
#define RELAY_PIN        26    // Relay IN pin
#define STATUS_LED_PIN   2     // Built-in LED

// OLED display
#define OLED_WIDTH       128
#define OLED_HEIGHT      64
#define OLED_RESET       -1    // no reset pin
#define OLED_ADDRESS     0x3C  // most common SSD1306 address

// Timing
const unsigned long PUBLISH_INTERVAL_MS   = 2000;
const unsigned long HEARTBEAT_INTERVAL_MS = 10000;
const unsigned long RECONNECT_DELAY_MS    = 5000;

// ── 7.4V Li-ion battery (2S) parameters ───────────────────────────
const float BATTERY_FULL_V      = 8.40;   // 2S full charge (4.20V × 2)
const float BATTERY_EMPTY_V     = 6.00;   // 2S cutoff voltage (3.00V × 2)
const float NOMINAL_CAPACITY_AH = 2.0;    // Ah — adjust to your pack

// ═══════════════════════════════════════════════════════════════════
// GLOBALS
// ═══════════════════════════════════════════════════════════════════

Adafruit_INA219    ina219;
DHT                dht(DHT_PIN, DHT_TYPE);
Adafruit_SSD1306   oled(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET);
WiFiClient         wifiClient;
PubSubClient       mqttClient(wifiClient);

unsigned long lastPublishMs   = 0;
unsigned long lastHeartbeatMs = 0;
unsigned long lastSocMs       = 0;
bool          relayState      = true;
float         socEstimate     = 50.0;

// ═══════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[BatteryTwin] ESP32 Firmware starting...");

  // GPIO
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  setRelay(true);

  // I²C
  Wire.begin(21, 22);

  // INA219
  if (!ina219.begin()) {
    Serial.println("[ERROR] INA219 not found! Check wiring.");
    while (true) { blinkLed(3, 200); delay(1000); }
  }
  ina219.setCalibration_32V_2A();
  Serial.println("[OK] INA219 initialised.");

  // DHT11
  dht.begin();
  delay(2000); // DHT11 needs 2s after power-on
  float testTemp = dht.readTemperature();
  if (isnan(testTemp)) {
    Serial.println("[WARN] DHT11 first read failed — will retry in loop.");
  } else {
    Serial.printf("[OK] DHT11 initialised. Temp=%.1f°C\n", testTemp);
  }

  // OLED
  if (!oled.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    Serial.println("[WARN] OLED not found. Display disabled.");
  } else {
    Serial.println("[OK] OLED initialised.");
    showOledBoot();
  }

  // WiFi + MQTT
  connectWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);
  connectMQTT();

  lastSocMs = millis();
  Serial.println("[BatteryTwin] Ready.");
}

// ═══════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Lost connection. Reconnecting...");
    connectWiFi();
  }
  if (!mqttClient.connected()) connectMQTT();
  mqttClient.loop();

  unsigned long now = millis();

  if (now - lastPublishMs >= PUBLISH_INTERVAL_MS) {
    lastPublishMs = now;
    publishSensorData();
  }
  if (now - lastHeartbeatMs >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatMs = now;
    publishHeartbeat();
  }
}

// ═══════════════════════════════════════════════════════════════════
// SENSOR READING
// ═══════════════════════════════════════════════════════════════════

float readVoltage() {
  return ina219.getBusVoltage_V();
}

float readCurrent() {
  return ina219.getCurrent_mA() / 1000.0;
}

float readTemperature() {
  float t = dht.readTemperature();
  if (isnan(t)) {
    Serial.println("[WARN] DHT11 read failed. Using last known value.");
    return 25.0; // fallback
  }
  return t;
}

float estimateSOC(float voltage, float currentA, float dtSeconds) {
  // Coulomb counting
  float delta = (currentA * (dtSeconds / 3600.0) / NOMINAL_CAPACITY_AH) * 100.0;
  socEstimate += delta;
  socEstimate = constrain(socEstimate, 0.0, 100.0);

  // OCV recalibration when idle
  if (abs(currentA) < 0.05) {
    float ocvSoc = (voltage - BATTERY_EMPTY_V) /
                   (BATTERY_FULL_V - BATTERY_EMPTY_V) * 100.0;
    ocvSoc = constrain(ocvSoc, 0.0, 100.0);
    socEstimate = 0.8 * socEstimate + 0.2 * ocvSoc;
  }
  return socEstimate;
}

// ═══════════════════════════════════════════════════════════════════
// MQTT PUBLISHING
// ═══════════════════════════════════════════════════════════════════

void publishSensorData() {
  unsigned long now = millis();
  float dtSeconds   = (now - lastSocMs) / 1000.0;
  lastSocMs = now;

  float voltage     = constrain(readVoltage(),     0.0, 10.0);
  float currentA    = readCurrent();
  float temperature = constrain(readTemperature(), -10.0, 85.0);
  float soc         = estimateSOC(voltage, currentA, dtSeconds);
  float power       = voltage * currentA;

  // Build JSON
  StaticJsonDocument<256> doc;
  doc["battery_id"]    = BATTERY_ID;
  doc["voltage_v"]     = round(voltage     * 1000.0) / 1000.0;
  doc["current_a"]     = round(currentA    * 1000.0) / 1000.0;
  doc["temperature_c"] = round(temperature * 100.0)  / 100.0;
  doc["soc_percent"]   = round(soc         * 100.0)  / 100.0;
  doc["data_source"]   = "ESP32_HARDWARE";
  doc["timestamp_ms"]  = (unsigned long)now;

  char payload[256];
  serializeJson(doc, payload);

  if (mqttClient.publish(TOPIC_DATA, payload, false)) {
    Serial.printf("[MQTT] V=%.2fV I=%.3fA T=%.1f°C SOC=%.1f%%\n",
                  voltage, currentA, temperature, soc);
    blinkLed(1, 50);
  } else {
    Serial.println("[MQTT] Publish failed.");
  }

  // Update OLED
  updateOled(voltage, currentA, temperature, soc);
}

void publishHeartbeat() {
  StaticJsonDocument<128> doc;
  doc["device_id"]   = CLIENT_ID;
  doc["uptime_ms"]   = millis();
  doc["relay_state"] = relayState;
  doc["wifi_rssi"]   = WiFi.RSSI();
  char payload[128];
  serializeJson(doc, payload);
  mqttClient.publish(TOPIC_HEARTBEAT, payload, false);
}

// ═══════════════════════════════════════════════════════════════════
// MQTT CALLBACK
// ═══════════════════════════════════════════════════════════════════

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.printf("[MQTT] Received on '%s': %s\n", topic, msg.c_str());

  if (String(topic) == TOPIC_RELAY) {
    StaticJsonDocument<128> doc;
    if (deserializeJson(doc, msg)) return;
    bool newState     = doc["relay_state"] | true;
    const char* reason = doc["reason"] | "";
    setRelay(newState);
    Serial.printf("[RELAY] → %s | %s\n", newState ? "ON" : "OFF", reason);
  }
}

// ═══════════════════════════════════════════════════════════════════
// RELAY
// ═══════════════════════════════════════════════════════════════════

void setRelay(bool on) {
  relayState = on;
  // Active-LOW relay: LOW = ON, HIGH = OFF
  digitalWrite(RELAY_PIN, on ? LOW : HIGH);
  Serial.printf("[RELAY] %s\n", on ? "ON (charging allowed)" : "OFF (charging cut)");
}

// ═══════════════════════════════════════════════════════════════════
// OLED DISPLAY
// ═══════════════════════════════════════════════════════════════════

void showOledBoot() {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(10, 10);
  oled.println("BatteryTwin");
  oled.setCursor(10, 25);
  oled.println("Initialising...");
  oled.display();
  delay(1500);
}

void updateOled(float v, float i, float t, float soc) {
  oled.clearDisplay();
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);

  // Title
  oled.setCursor(0, 0);
  oled.println("-- BatteryTwin --");

  // Voltage
  oled.setCursor(0, 12);
  oled.printf("Volt : %.2f V", v);

  // Current
  oled.setCursor(0, 22);
  oled.printf("Curr : %.3f A", i);

  // Temperature
  oled.setCursor(0, 32);
  oled.printf("Temp : %.1f C", t);

  // SOC
  oled.setCursor(0, 42);
  oled.printf("SOC  : %.1f %%", soc);

  // Relay status
  oled.setCursor(0, 54);
  oled.printf("Relay: %s", relayState ? "ON " : "OFF");

  oled.display();
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
    Serial.println("\n[WiFi] Failed. Will retry.");
  }
}

void connectMQTT() {
  int attempts = 0;
  while (!mqttClient.connected() && attempts < 5) {
    Serial.printf("[MQTT] Connecting to %s:%d...\n", MQTT_BROKER, MQTT_PORT);
    bool ok = strlen(MQTT_USERNAME) > 0
              ? mqttClient.connect(CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD_STR)
              : mqttClient.connect(CLIENT_ID);
    if (ok) {
      Serial.println("[MQTT] Connected.");
      mqttClient.subscribe(TOPIC_RELAY, 1);
      blinkLed(3, 100);
      return;
    }
    Serial.printf("[MQTT] Failed (state=%d). Retrying...\n", mqttClient.state());
    delay(RECONNECT_DELAY_MS);
    attempts++;
  }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

void blinkLed(int times, int ms) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED_PIN, HIGH); delay(ms);
    digitalWrite(STATUS_LED_PIN, LOW);  delay(ms);
  }
}
