/*
 * I2C Scanner
 * Scans all I2C addresses and prints what it finds.
 * Upload this to ESP32, open Serial Monitor at 115200 baud.
 */

#include <Wire.h>

void setup() {
  Serial.begin(115200);
  delay(1000);
  Wire.begin(21, 22);  // SDA=21, SCL=22
  Serial.println("\n[I2C Scanner] Scanning...");
}

void loop() {
  int found = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    byte err = Wire.endTransmission();
    if (err == 0) {
      Serial.print("[FOUND] Device at address 0x");
      if (addr < 16) Serial.print("0");
      Serial.println(addr, HEX);
      found++;
    }
  }
  if (found == 0)
    Serial.println("[NONE] No I2C devices found. Check wiring!");
  else
    Serial.println("[DONE] Scan complete.");
  delay(3000);
}
