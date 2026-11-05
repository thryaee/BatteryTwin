/**
 * battery_sensor.ino
 * -------------------
 * BatteryTwin ESP32 Full Firmware
 * Voltage Sensor + ACS712 + DHT11 + OLED + Relay + WiFi + MQTT
 *
 * Wiring:
 *   Voltage Sensor → S=GPIO34, +=3.3V, -=GND, VCC screw=Switch OUT, GND screw=GND
 *   ACS712         → VCC=5V, GND, OUT=10kΩ divider→GPIO35, T1=Switch OUT, T2=Relay COM
 *   DHT11          → VCC=3.3V, GND, DATA=GPIO4
 *   OLED           → VCC=3.3V, GND, SDA=GPIO21, SCL=GPIO22
 *   Relay          → VCC=5V, GND, IN=GPIO26
 *
 * Libraries needed:
 *   DHT sensor library, Adafruit Unified Sensor,
 *   Adafruit SSD1306, Adafruit GFX Library, PubSubClient, ArduinoJson
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION — edit only these values
// ═══════════════════════════════════════════════════════════════════

const char* WIFI_SSID         = "Lemmino";
const char* WIFI_PASSWORD     = "ifounddbcooper";
const char* MQTT_BROKER       = "10.173.244.171";
const int   MQTT_PORT         = 1883;
const char* MQTT_USERNAME     = "";
const char* MQTT_PASSWORD_STR = "";

const char* TOPIC_DATA        = "chargex/battery/data";
const char* TOPIC_RELAY       = "chargex/relay/control";
const char* TOPIC_HEARTBEAT   = "chargex/device/heartbeat";
const char* BATTERY_ID        = "BATTERY_01";
const char* CLIENT_ID         = "esp32-battery-01";

// ═══════════════════════════════════════════════════════════════════
// PIN DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

#define DHT_PIN        4
#define DHT_TYPE       DHT11
#define RELAY_PIN      26
#define LED_PIN        2
#define VOLTAGE_PIN    34   // Voltage sensor S pin
#define CURRENT_PIN    35   // ACS712 OUT pin (via 10kΩ divider)

// ═══════════════════════════════════════════════════════════════════
// OLED
// ═══════════════════════════════════════════════════════════════════

#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT  64
#define OLED_RESET     -1
#define OLED_ADDRESS  0x3C

// ═══════════════════════════════════════════════════════════════════
// SENSOR CALIBRATION
// ═══════════════════════════════════════════════════════════════════

// Voltage sensor module (0-25V): ratio = 5.0
#define VOLTAGE_RATIO     5.0
#define ADC_REF           3.3
#define ADC_RES           4095.0

// ACS712 5A: sensitivity=185mV/A, zero=2.5V
// Note: OUT pin goes through 10kΩ/10kΩ divider → multiply ADC by 2
#define ACS_SENSITIVITY   0.185
#define ACS_ZERO_V        2.5
#define ACS_DIVIDER       2.0    // because of 10kΩ/10kΩ voltage divider

// ═══════════════════════════════════════════════════════════════════
// BATTERY PARAMETERS (7.4V 2S 3000mAh)
// ═══════════════════════════════════════════════════════════════════

const float BATTERY_FULL_V      = 8.40;
const float BATTERY_EMPTY_V     = 6.00;
const float NOMINAL_CAPACITY_AH = 3.0;

// ═══════════════════════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════════════════════

const unsigned long PUBLISH_INTERVAL_MS   = 2000;
const unsigned long HEARTBEAT_INTERVAL_MS = 10000;
const unsigned long RECONNECT_DELAY_MS    = 5000;

// ═══════════════════════════════════════════════════════════════════
// OBJECTS
// ═══════════════════════════════════════════════════════════════════

DHT              dht(DHT_PIN, DHT_TYPE);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
WiFiClient       wifiClient;
PubSubClient     mqttClient(wifiClient);

// ═══════════════════════════════════════════════════════════════════
// GLOBALS
// ═══════════════════════════════════════════════════════════════════

bool          oledOk      = false;
bool          dhtOk       = false;
bool          relayOn     = true;
float         socEstimate = 50.0;
unsigned long lastPublishMs   = 0;
unsigned long lastHeartbeatMs = 0;
unsigned long lastSocMs       = 0;

// ═══════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN,   OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Active LOW → relay ON at start

  Serial.println("\n=============================");
  Serial.println("  BatteryTwin Full Firmware  ");
  Serial.println("=============================");

  Wire.begin(21, 22);

  // OLED
  oledOk = display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS);
  if (!oledOk) {
    Serial.println("[FAIL] OLED not found!");
  } else {
    Serial.println("[OK]   OLED found.");
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(15, 10); display.println("BatteryTwin");
    display.setCursor(15, 25); display.println("Starting...");
    display.display();
    delay(1000);
  }

  // Voltage + Current sensors (analog — always available)
  Serial.println("[OK]   Voltage sensor on GPIO34.");
  Serial.println("[OK]   ACS712 current sensor on GPIO35.");

  // DHT11
  dht.begin();
  delay(2000);
  float t = dht.readTemperature();
  if (isnan(t)) Serial.println("[WARN] DHT11 first read failed.");
  else          Serial.printf("[OK]   DHT11 found. Temp=%.1fC\n", t);

  Serial.println("[OK]   Relay ON (GPIO26 LOW)");

  // WiFi
  connectWiFi();

  // MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);
  connectMQTT();

  lastSocMs = millis();
  Serial.println("=============================");
  Serial.println("  Ready. Sending data...     ");
  Serial.println("=============================\n");
}

// ═══════════════════════════════════════════════════════════════════
// LOOP
// ═══════════════════════════════════════════════════════════════════

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (!mqttClient.connected())        connectMQTT();
  mqttClient.loop();

  unsigned long now = millis();

  if (now - lastPublishMs >= PUBLISH_INTERVAL_MS) {
    lastPublishMs = now;
    readAndPublish();
  }
  if (now - lastHeartbeatMs >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatMs = now;
    publishHeartbeat();
  }
}

// ═══════════════════════════════════════════════════════════════════
// READ SENSORS + OLED + MQTT PUBLISH
// ═══════════════════════════════════════════════════════════════════

void readAndPublish() {
  unsigned long now = millis();
  float dt = (now - lastSocMs) / 1000.0;
  lastSocMs = now;

  // ── Voltage Sensor ─────────────────────────────────────────────
  int rawV = analogRead(VOLTAGE_PIN);
  float adcV = (rawV / ADC_RES) * ADC_REF;
  float voltage = adcV * VOLTAGE_RATIO;

  // ── ACS712 Current (100 sample average) ────────────────────────
  long sum = 0;
  for (int i = 0; i < 100; i++) {
    sum += analogRead(CURRENT_PIN);
    delay(1);
  }
  float adcA_raw = ((sum / 100.0) / ADC_RES) * ADC_REF;
  // Compensate for 10kΩ/10kΩ voltage divider (multiply by 2)
  float adcA = adcA_raw * ACS_DIVIDER;
  float current_A  = abs((adcA - ACS_ZERO_V) / ACS_SENSITIVITY);
  float current_mA = current_A * 1000.0;

  // Noise gate
  if (!relayOn || current_mA < 10.0) {
    current_mA = 0.0;
    current_A  = 0.0;
  }
  float power_mW = voltage * current_mA;

  // ── DHT11 ──────────────────────────────────────────────────────
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  dhtOk = !isnan(temp) && !isnan(hum);
  if (!dhtOk) { temp = 25.0; hum = 0.0; }

  // ── SOC estimate ───────────────────────────────────────────────
  float soc = estimateSOC(voltage, current_A, dt);

  // ── Serial output ──────────────────────────────────────────────
  Serial.println("-----------------------------");
  Serial.printf("Voltage  : %.3f V\n",  voltage);
  Serial.printf("Current  : %.2f mA\n", current_mA);
  Serial.printf("Power    : %.2f mW\n", power_mW);
  Serial.printf("Temp     : %.1f C\n",  temp);
  Serial.printf("Humidity : %.1f %%\n", hum);
  Serial.printf("SOC      : %.1f %%\n", soc);
  Serial.printf("Relay    : %s\n",      relayOn ? "ON" : "OFF");
  Serial.println();

  // ── OLED output ────────────────────────────────────────────────
  if (oledOk) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);

    display.setCursor(0, 0);
    display.println("-- BatteryTwin --");

    display.setCursor(0, 12);
    display.printf("Volt : %.2f V", voltage);

    display.setCursor(0, 22);
    display.printf("Curr : %.1f mA", current_mA);

    display.setCursor(0, 32);
    display.printf("Pwr  : %.1f mW", power_mW);

    display.setCursor(0, 42);
    if (dhtOk) display.printf("Temp : %.1f C", temp);
    else        display.println("Temp : ERROR");

    display.setCursor(0, 54);
    display.printf("SOC:%.0f%%  Rly:%s", soc, relayOn ? "ON" : "OFF");

    display.display();
  }

  // ── MQTT publish ───────────────────────────────────────────────
  StaticJsonDocument<300> doc;
  doc["battery_id"]    = BATTERY_ID;
  doc["voltage_v"]     = round(voltage    * 1000.0) / 1000.0;
  doc["current_a"]     = round(current_A  * 1000.0) / 1000.0;
  doc["temperature_c"] = round(temp       * 100.0)  / 100.0;
  doc["humidity_pct"]  = round(hum        * 100.0)  / 100.0;
  doc["soc_percent"]   = round(soc        * 100.0)  / 100.0;
  doc["data_source"]   = "ESP32_HARDWARE";
  doc["timestamp_ms"]  = (unsigned long)now;

  char payload[300];
  serializeJson(doc, payload);

  if (mqttClient.publish(TOPIC_DATA, payload, false)) {
    Serial.println("[MQTT] Published OK.");
    digitalWrite(LED_PIN, HIGH); delay(50); digitalWrite(LED_PIN, LOW);
  } else {
    Serial.println("[MQTT] Publish FAILED.");
  }
}

// ═══════════════════════════════════════════════════════════════════
// SOC ESTIMATION
// ═══════════════════════════════════════════════════════════════════

float estimateSOC(float voltage, float currentA, float dtSec) {
  float delta = (currentA * (dtSec / 3600.0) / NOMINAL_CAPACITY_AH) * 100.0;
  socEstimate = constrain(socEstimate + delta, 0.0, 100.0);
  if (abs(currentA) < 0.05) {
    float ocv = constrain(
      (voltage - BATTERY_EMPTY_V) / (BATTERY_FULL_V - BATTERY_EMPTY_V) * 100.0,
      0.0, 100.0);
    socEstimate = 0.8 * socEstimate + 0.2 * ocv;
  }
  return socEstimate;
}

// ═══════════════════════════════════════════════════════════════════
// HEARTBEAT
// ═══════════════════════════════════════════════════════════════════

void publishHeartbeat() {
  StaticJsonDocument<128> doc;
  doc["device_id"]   = CLIENT_ID;
  doc["uptime_ms"]   = millis();
  doc["relay_state"] = relayOn;
  doc["wifi_rssi"]   = WiFi.RSSI();
  char buf[128];
  serializeJson(doc, buf);
  mqttClient.publish(TOPIC_HEARTBEAT, buf, false);
}

// ═══════════════════════════════════════════════════════════════════
// MQTT CALLBACK — relay control from backend
// ═══════════════════════════════════════════════════════════════════

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.printf("[MQTT] Received on '%s': %s\n", topic, msg.c_str());

  if (String(topic) == TOPIC_RELAY) {
    StaticJsonDocument<128> doc;
    if (deserializeJson(doc, msg)) return;
    bool on            = doc["relay_state"] | true;
    const char* reason = doc["reason"] | "";
    setRelay(on);
    Serial.printf("[RELAY] → %s | %s\n", on ? "ON" : "OFF", reason);
  }
}

// ═══════════════════════════════════════════════════════════════════
// RELAY
// ═══════════════════════════════════════════════════════════════════

void setRelay(bool on) {
  relayOn = on;
  digitalWrite(RELAY_PIN, on ? LOW : HIGH); // Active LOW
  Serial.printf("[RELAY] %s\n", on ? "ON (charging)" : "OFF (cut)");
}

// ═══════════════════════════════════════════════════════════════════
// WIFI
// ═══════════════════════════════════════════════════════════════════

void connectWiFi() {
  Serial.printf("[WiFi] Connecting to %s\n", WIFI_SSID);

  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  delay(1000);
  WiFi.mode(WIFI_STA);
  delay(500);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int n = 0;
  while (WiFi.status() != WL_CONNECTED && n < 80) {
    delay(500); Serial.print("."); n++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[WiFi] Connected! IP: %s  RSSI: %d dBm\n",
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else {
    Serial.printf("[WiFi] Failed (status=%d). Will retry.\n", WiFi.status());
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
    delay(2000);
  }
}

// ═══════════════════════════════════════════════════════════════════
// MQTT CONNECT
// ═══════════════════════════════════════════════════════════════════

void connectMQTT() {
  int n = 0;
  while (!mqttClient.connected() && n < 5) {
    Serial.printf("[MQTT] Connecting to %s:%d...\n", MQTT_BROKER, MQTT_PORT);
    bool ok = strlen(MQTT_USERNAME) > 0
              ? mqttClient.connect(CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD_STR)
              : mqttClient.connect(CLIENT_ID);
    if (ok) {
      mqttClient.subscribe(TOPIC_RELAY, 1);
      Serial.println("[MQTT] Connected. Subscribed to relay topic.");
      return;
    }
    Serial.printf("[MQTT] Failed (state=%d). Retry in 5s...\n",
                  mqttClient.state());
    delay(RECONNECT_DELAY_MS);
    n++;
  }
}
