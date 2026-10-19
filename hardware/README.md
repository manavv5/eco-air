# 🔌 EcoAir DIY Hardware Node (ESP32 + PMS5003)

This hardware module allows you to place an actual physical laser air sensor on your desk during the hackathon demo, contrasting **Hyperlocal Indoor/Desk Telemetry** against **City-Wide Open-Meteo Satellite/Station Data**.

---

## 🛒 Bill of Materials (BOM)
1. **ESP32 DevKit v1** (Wi-Fi + Bluetooth microcontroller) ~$4.00
2. **Plantower PMS5003** (Laser scattering PM1.0 / PM2.5 / PM10 sensor) ~$14.00
3. **DHT22 / BME280** (Temperature & Relative Humidity) ~$3.00
4. Breadboard + Jumper Wires

---

## ⚡ Circuit Schematic & Pin Connections

| PMS5003 Sensor Pin | ESP32 GPIO Pin | Function |
| :--- | :--- | :--- |
| **Pin 1 (VCC)** | **VIN / 5V** | 5V Power Supply |
| **Pin 2 (GND)** | **GND** | Ground |
| **Pin 4 (RXD)** | **GPIO 17 (TX2)** | Sensor Serial Control |
| **Pin 5 (TXD)** | **GPIO 16 (RX2)** | Laser Particle Data Stream (9600 baud) |

| DHT22 Sensor Pin | ESP32 GPIO Pin | Note |
| :--- | :--- | :--- |
| **VCC** | **3.3V** | Power |
| **GND** | **GND** | Ground |
| **DATA** | **GPIO 4** | 10kΩ pull-up resistor to 3.3V |

---

## 🚀 How to Flash & Run
1. Open [`esp32_air_node.ino`](esp32_air_node.ino) in the Arduino IDE.
2. Install libraries: `DHT sensor library` by Adafruit.
3. Select Board: **ESP32 Dev Module**.
4. Enter your WiFi credentials and flash.
5. In the EcoAir web dashboard, switch to **"DIY Hardware Node"** or click **"Connect Web Serial"** to stream live laser telemetry!
