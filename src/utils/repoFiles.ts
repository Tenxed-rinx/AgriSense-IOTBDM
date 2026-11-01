export interface HardwareComponentSpec {
  id: string;
  wokwiId: string;
  wokwiType: string;
  component: string;
  pin: string;
  wireColors: string;
  purpose: string;
  operatingRange: string;
  thresholdRule: string;
}

export const HARDWARE_COMPONENTS: HardwareComponentSpec[] = [
  {
    id: 'arduino-uno',
    wokwiId: 'uno',
    wokwiType: 'wokwi-arduino-uno',
    component: 'Arduino UNO R3 (ATmega328P)',
    pin: '5V · GND.1–3 · D2 · D7 · A0–A2',
    wireColors: 'Red (5V) · Black (GND) · Green (Signals)',
    purpose: 'Primary microcontroller polling sensors every 2000 ms and driving relay/LED logic',
    operatingRange: '5V DC Logic · 10-bit ADC (0–1023)',
    thresholdRule: 'Executes loop() every 2000 ms at 9600 baud',
  },
  {
    id: 'dht22',
    wokwiId: 'dht1',
    wokwiType: 'wokwi-dht22',
    component: 'DHT22 Temperature & Humidity',
    pin: 'dht1:SDA → uno:2',
    wireColors: 'VCC: Red · GND: Black · SDA: Green',
    purpose: 'Ambient air temperature (°C) and relative humidity (%) sensing',
    operatingRange: 'Temp: 20–45 °C · Humidity: 40–90 %',
    thresholdRule: 'Alert if Temperature > 35 °C',
  },
  {
    id: 'soil-sensor',
    wokwiId: 'pot1',
    wokwiType: 'wokwi-potentiometer',
    component: 'Soil Moisture Sensor (Potentiometer pot1)',
    pin: 'pot1:SIG → uno:A0',
    wireColors: 'VCC: Red · GND: Black · SIG: Green',
    purpose: 'Volumetric soil resistance simulation (higher ADC = drier soil)',
    operatingRange: '0–1023 ADC (Repo batch: 200–800)',
    thresholdRule: 'Pump LED ON & Dry Soil Alert if Soil > 500',
  },
  {
    id: 'ldr-sensor',
    wokwiId: 'ldr1',
    wokwiType: 'wokwi-photoresistor-sensor',
    component: 'LDR Photoresistor Module (ldr1)',
    pin: 'ldr1:AO → uno:A1',
    wireColors: 'VCC: Red · AO: Green',
    purpose: 'Solar irradiance and ambient light intensity tracking',
    operatingRange: '0–1023 ADC (Repo batch: 100–1000)',
    thresholdRule: 'Photoperiod telemetry logging',
  },
  {
    id: 'water-sensor',
    wokwiId: 'pot2',
    wokwiType: 'wokwi-potentiometer',
    component: 'Water Level Sensor (Potentiometer pot2)',
    pin: 'pot2:SIG → uno:A2',
    wireColors: 'VCC: Red · GND: Black · SIG: Green',
    purpose: 'Irrigation reservoir depth simulation',
    operatingRange: '0–1023 ADC (Repo batch: 100–800)',
    thresholdRule: 'Alert if Water Level < 200',
  },
  {
    id: 'pump-relay',
    wokwiId: 'led1',
    wokwiType: 'wokwi-led (red)',
    component: 'Pump Simulation Actuator LED (led1)',
    pin: 'uno:7 → led1:A · led1:C → uno:GND.2',
    wireColors: 'Anode D7: Green · Cathode GND.2: Green',
    purpose: 'Automated irrigation water pump indicator LED',
    operatingRange: 'HIGH (5V = ON) · LOW (0V = OFF)',
    thresholdRule: 'HIGH when Soil Moisture > 500',
  },
];

export const REPO_DIAGRAM_JSON = `{
  "version": 1,
  "author": "Anonymous maker",
  "editor": "wokwi",
  "parts": [
    { "type": "wokwi-arduino-uno", "id": "uno", "top": 0, "left": 0, "attrs": {} },
    {
      "type": "wokwi-dht22",
      "id": "dht1",
      "top": -162.9,
      "left": -43.8,
      "attrs": { "temperature": "40.1" }
    },
    { "type": "wokwi-potentiometer", "id": "pot1", "top": -174.1, "left": 67, "attrs": {} },
    {
      "type": "wokwi-photoresistor-sensor",
      "id": "ldr1",
      "top": -188.8,
      "left": 375.2,
      "attrs": {}
    },
    { "type": "wokwi-potentiometer", "id": "pot2", "top": -1.3, "left": 422.2, "attrs": {} },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 25.2,
      "left": -111.4,
      "attrs": { "color": "red" }
    }
  ],
  "connections": [
    [ "dht1:VCC", "uno:5V", "red", [ "v0" ] ],
    [ "dht1:GND", "uno:GND.1", "black", [ "v0" ] ],
    [ "dht1:SDA", "uno:2", "green", [ "v0" ] ],
    [ "pot1:VCC", "uno:5V", "red", [ "v0" ] ],
    [ "pot1:GND", "uno:GND.1", "black", [ "v0" ] ],
    [ "uno:A0", "pot1:SIG", "green", [ "v0" ] ],
    [ "ldr1:AO", "uno:A1", "green", [ "h0" ] ],
    [ "ldr1:VCC", "uno:5V", "red", [ "h0" ] ],
    [ "pot2:VCC", "uno:5V", "red", [ "v0" ] ],
    [ "uno:GND.3", "pot2:GND", "black", [ "v0" ] ],
    [ "pot2:SIG", "uno:A2", "green", [ "v0" ] ],
    [ "led1:C", "uno:GND.2", "green", [ "v0" ] ],
    [ "uno:7", "led1:A", "green", [ "v0" ] ]
  ],
  "dependencies": {}
}`;

export const REPO_ARDUINO_CODE = `#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT22

#define SOIL_PIN A0
#define LDR_PIN A1
#define WATER_LEVEL_PIN A2

#define PUMP_PIN 7

DHT dht(DHTPIN, DHTTYPE);

// Threshold values
int soilThreshold = 500;
int tempThreshold = 35;
int waterThreshold = 200;

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(PUMP_PIN, OUTPUT);
  Serial.println("🌱 Smart Agriculture Monitoring Started");
}

void loop() {
  // Sensor Readings
  int soilMoisture = analogRead(SOIL_PIN);
  int lightValue = analogRead(LDR_PIN);
  int waterLevel = analogRead(WATER_LEVEL_PIN);
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  Serial.println("--------------------------------");
  Serial.print("Soil Moisture: ");
  Serial.println(soilMoisture);
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  Serial.print("Light Intensity: ");
  Serial.println(lightValue);
  Serial.print("Water Level: ");
  Serial.println(waterLevel);

  // Pump Logic
  if (soilMoisture > soilThreshold) {
    digitalWrite(PUMP_PIN, HIGH);
    Serial.println("🚰 Pump Status: ON");
    Serial.println("⚠ ALERT: Soil is Dry");
  } else {
    digitalWrite(PUMP_PIN, LOW);
    Serial.println("🚰 Pump Status: OFF");
  }

  // High Temperature Alert
  if (temperature > tempThreshold) {
    Serial.println("🔥 ALERT: High Temperature");
  }

  // Low Water Alert
  if (waterLevel < waterThreshold) {
    Serial.println("💧 ALERT: Low Water Level");
  }

  delay(2000);
}`;

export const REPO_MAIN_PY_CODE = `import random
import pandas as pd
from datetime import datetime
import os

os.makedirs("data", exist_ok=True)

data_list = []

for i in range(10):
    soil = random.randint(200, 800)
    temp = random.randint(20, 45)
    humidity = random.randint(40, 90)
    light = random.randint(100, 1000)
    water = random.randint(100, 800)

    pump = "ON" if soil > 500 else "OFF"

    alert = []
    if soil > 500:
        alert.append("Dry Soil")
    if temp > 35:
        alert.append("High Temperature")
    if water < 200:
        alert.append("Low Water Level")

    timestamp = datetime.now()

    row = {
        "Timestamp": timestamp,
        "Soil": soil,
        "Temperature": temp,
        "Humidity": humidity,
        "Light": light,
        "Water": water,
        "Pump": pump,
        "Alerts": ", ".join(alert)
    }

    data_list.append(row)

df = pd.DataFrame(data_list)
df.to_csv("data/sensor_data.csv", index=False)

print(df)
print("\\nData saved successfully!")`;

export const REPO_STREAMLIT_APP_PY = `import streamlit as st
import pandas as pd
import os

st.title("🌱 Smart Agriculture Dashboard")

# Get current file location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Create correct CSV path
csv_path = os.path.join(BASE_DIR, "..", "data", "sensor_data.csv")

# Check if file exists
if os.path.exists(csv_path):
    df = pd.read_csv(csv_path)

    st.subheader("Sensor Data")
    st.dataframe(df)

    st.subheader("Temperature")
    st.line_chart(df["Temperature"])

    st.subheader("Soil Moisture")
    st.line_chart(df["Soil"])

    st.subheader("Humidity")
    st.line_chart(df["Humidity"])
else:
    st.error("sensor_data.csv not found!")
    st.info("Run main.py first to generate sensor data.")`;
