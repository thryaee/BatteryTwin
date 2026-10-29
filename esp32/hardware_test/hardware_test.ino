/**
 * hardware_test.ino
 * ------------------
 * BatteryTwin — Phase 1 Calibrated Hardware Test
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_INA219.h>
#include <DHT.h>

// ── Pin definitions ────────────────────────────────────────────────
#define DHT_PIN       4
#define DHT_TYPE      DHT11
#define RELAY_PIN     26
#define LED_PIN       2      // Built-in LED

// ── OLED Settings ──────────────────────────────────────────────────
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define OLED_ADDRESS  0x3C

// ── Objects ────────────────────────────────────────────────────────
DHT            dht(DHT_PIN, DHT_TYPE);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_INA219  ina219;

// ── Status flags ───────────────────────────────────────────────────
bool oledOk  = false;
bool inaOk   = false;
bool dhtOk   = false;
bool relayOn = true;

unsigned long lastRelay = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN,   OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  // Relay ON at start (active LOW)

  Serial.println("\n=============================");
  Serial.println("  BatteryTwin Hardware Test  ");
  Serial.println("=============================");

  Wire.begin(21, 22);

  // ── OLED init ──────────────────────────────────────────────────
  oledOk = display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS);
  if (!oledOk) {
    Serial.println("[FAIL] OLED not found!");
  } else {
    Serial.println("[OK]   OLED found.");
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(15, 10); display.println("BatteryTwin");
    display.setCursor(15, 25); display.println("Testing...");
    display.display();
    delay(1000);
  }

  // ── INA219 init ────────────────────────────────────────────────
  inaOk = ina219.begin();
  if (!inaOk) {
    Serial.println("[FAIL] INA219 not found!");
  } else {
    ina219.setCalibration_32V_2A();
    Serial.println("[OK]   INA219 found.");
  }

  // ── DHT11 init ─────────────────────────────────────────────────
  dht.begin();
  delay(2000);

  Serial.println("[OK]   Relay ON (GPIO26 LOW)");
  Serial.println("=============================\n");
}

void loop() {
  unsigned long now = millis();

  // ── Read INA219 with Multi-Sample Averaging & Noise Filter ──────
  float voltage = 0, current_mA = 0, power_mW = 0;

  if (inaOk) {
    float busVoltage   = ina219.getBusVoltage_V();
    float shuntVoltage = ina219.getShuntVoltage_mV();
    
    // Total battery voltage under load
    voltage = busVoltage + (shuntVoltage / 1000.0);

    // Take 5 samples to smooth out current fluctuations
    float currentSum = 0;
    for (int i = 0; i < 5; i++) {
      currentSum += ina219.getCurrent_mA();
      delay(10);
    }
    current_mA = currentSum / 5.0;

    // Handle direction & floating noise
    current_mA = abs(current_mA); 

    // Noise Gate: If relay is OFF or load current is tiny, force to 0
    if (!relayOn || current_mA < 5.0) {
      current_mA = 0.0;
      power_mW = 0.0;
    } else {
      power_mW = voltage * current_mA; // Recalculate clean power in mW
    }
  }

  // ── Read DHT11 ─────────────────────────────────────────────────
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  dhtOk = !isnan(temp) && !isnan(hum);

  // ── Toggle relay every 5 seconds ────────────────────────────────
  if (now - lastRelay >= 5000) {
    lastRelay = now;
    relayOn = !relayOn;
    digitalWrite(RELAY_PIN, relayOn ? LOW : HIGH); // Active LOW logic
    digitalWrite(LED_PIN,   relayOn ? HIGH : LOW);
    Serial.printf("[RELAY] Toggled → %s\n", relayOn ? "ON" : "OFF");
  }

  // ── Serial Monitor output ──────────────────────────────────────
  Serial.println("-----------------------------");
  if (inaOk) {
    Serial.printf("Voltage  : %.3f V\n",  voltage);
    Serial.printf("Current  : %.2f mA\n", current_mA);
    Serial.printf("Power    : %.2f mW\n", power_mW);
  } else {
    Serial.println("INA219   : NOT FOUND");
  }

  if (dhtOk) {
    Serial.printf("Temp     : %.1f C\n",  temp);
    Serial.printf("Humidity : %.1f %%\n", hum);
  } else {
    Serial.println("DHT11    : READ ERROR");
  }

  Serial.printf("Relay    : %s\n", relayOn ? "ON" : "OFF");
  Serial.println();

  // ── OLED output ────────────────────────────────────────────────
  if (oledOk) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);

    display.setCursor(0, 0);
    display.println("-- BatteryTwin --");

    display.setCursor(0, 12);
    if (inaOk) display.printf("Volt : %.3f V",  voltage);
    else        display.println("Volt : N/A");

    display.setCursor(0, 22);
    if (inaOk) display.printf("Curr : %.2f mA", current_mA);
    else        display.println("Curr : N/A");

    display.setCursor(0, 32);
    if (inaOk) display.printf("Pwr  : %.2f mW", power_mW);
    else        display.println("Pwr  : N/A");

    display.setCursor(0, 42);
    if (dhtOk) display.printf("Temp : %.1f C",  temp);
    else        display.println("Temp : ERROR");

    display.setCursor(0, 54);
    display.printf("Relay: %s", relayOn ? "ON " : "OFF");

    display.display();
  }

  delay(2000);
}