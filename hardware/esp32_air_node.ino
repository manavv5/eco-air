/**
 * EcoAir DIY IoT Sensor Node Firmware
 * Target: ESP32 DevKit v1 + Plantower PMS5003 (Laser PM2.5/PM10 Sensor) + DHT22
 * 
 * Posts real-time particulate and temperature telemetry directly to EcoAir dashboard
 * via HTTP JSON Webhook or local WebSocket.
 * 
 * Hardware Wiring:
 * - PMS5003 VCC  -> ESP32 5V (VIN)
 * - PMS5003 GND  -> ESP32 GND
 * - PMS5003 TXD  -> ESP32 GPIO 16 (RX2)
 * - PMS5003 RXD  -> ESP32 GPIO 17 (TX2)
 * - DHT22 Data   -> ESP32 GPIO 4 (10k pull-up resistor to 3.3V)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <HardwareSerial.h>
#include "DHT.h"

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// EcoAir Endpoint (Local IP or Cloud Relay)
const char* ecoair_endpoint = "http://192.168.1.100:8080/api/sensor";

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

HardwareSerial pmsSerial(2); // UART2 (GPIO 16 RX, GPIO 17 TX)

struct PMS5003Data {
  uint16_t pm1_0;
  uint16_t pm2_5;
  uint16_t pm10;
};

PMS5003Data sensorData;

void setup() {
  Serial.begin(115200);
  pmsSerial.begin(9600, SERIAL_8N1, 16, 17);
  dht.begin();

  Serial.println("\n[EcoAir Node] Initializing DIY Hardware Node...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[EcoAir Node] WiFi Connected! Node IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[EcoAir Node] Operating in Autonomous Offline / Serial Logging Mode.");
  }
}

bool readPMSdata(Stream *s) {
  if (!s->available()) return false;
  
  // PMS5003 packet header is 0x42 0x4D
  if (s->peek() != 0x42) {
    s->read();
    return false;
  }

  if (s->available() < 32) return false;

  uint8_t buffer[32];
  s->readBytes(buffer, 32);

  if (buffer[0] != 0x42 || buffer[1] != 0x4D) return false;

  // Verify frame checksum
  uint16_t checksum = 0;
  for (int i = 0; i < 30; i++) checksum += buffer[i];
  uint16_t receivedChecksum = (buffer[30] << 8) | buffer[31];
  if (checksum != receivedChecksum) return false;

  // Extract PM values (TSI standard µg/m³)
  sensorData.pm1_0 = (buffer[10] << 8) | buffer[11];
  sensorData.pm2_5 = (buffer[12] << 8) | buffer[13];
  sensorData.pm10  = (buffer[14] << 8) | buffer[15];

  return true;
}

void loop() {
  if (readPMSdata(&pmsSerial)) {
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    if (isnan(temp)) temp = 22.0;
    if (isnan(hum)) hum = 50.0;

    // Estimate localized AQI from PM2.5 (EPA Formula)
    int localAqi = calculateAqi(sensorData.pm2_5);

    // Format Telemetry JSON Payload
    String jsonPayload = "{";
    jsonPayload += "\"node_id\":\"ecoair-desk-node-01\",";
    jsonPayload += "\"pm25\":" + String(sensorData.pm2_5) + ",";
    jsonPayload += "\"pm10\":" + String(sensorData.pm10) + ",";
    jsonPayload += "\"pm1_0\":" + String(sensorData.pm1_0) + ",";
    jsonPayload += "\"temp\":" + String(temp, 1) + ",";
    jsonPayload += "\"humidity\":" + String(hum, 1) + ",";
    jsonPayload += "\"aqi\":" + String(localAqi);
    jsonPayload += "}";

    Serial.println("[EcoAir Telemetry] " + jsonPayload);

    // Post to EcoAir Dashboard if connected
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(ecoair_endpoint);
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(jsonPayload);
      Serial.println("[EcoAir HTTP Status] " + String(httpResponseCode));
      http.end();
    }
  }

  delay(2000); // 2-second telemetry sampling interval
}

int calculateAqi(float pm25) {
  if (pm25 <= 12.0) return (50.0 / 12.0) * pm25;
  if (pm25 <= 35.4) return 50 + ((100 - 50) / (35.4 - 12.1)) * (pm25 - 12.1);
  if (pm25 <= 55.4) return 101 + ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5);
  if (pm25 <= 150.4) return 151 + ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5);
  return 201 + ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5);
}
