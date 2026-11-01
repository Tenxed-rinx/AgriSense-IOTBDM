export interface SensorThresholds {
  soilThreshold: number; // Default 500 (ADC > 500 means Dry Soil)
  tempThreshold: number; // Default 35 (°C > 35 means High Temperature)
  waterThreshold: number; // Default 200 (ADC < 200 means Low Water Level)
}

export type PumpOverrideMode = 'AUTO' | 'FORCE_ON' | 'FORCE_OFF';

export type AlertType = 'Dry Soil' | 'High Temperature' | 'Low Water Level';

export interface RawSensorInput {
  soil: number;        // 0 - 1023 ADC (repo simulation: 200 - 800)
  temperature: number; // °C (repo simulation: 20 - 45)
  humidity: number;    // % (repo simulation: 40 - 90)
  light: number;       // 0 - 1023 ADC (repo simulation: 100 - 1000)
  water: number;       // 0 - 1023 ADC (repo simulation: 100 - 800)
  timestamp?: string;
}

export interface SensorRecord {
  id: string;
  timestamp: string;
  soil: number;
  temperature: number;
  humidity: number;
  light: number;
  water: number;
  pump: 'ON' | 'OFF';
  alerts: AlertType[];
  alertsText: string;
}

export const DEFAULT_THRESHOLDS: SensorThresholds = {
  soilThreshold: 500,
  tempThreshold: 35,
  waterThreshold: 200,
};

/**
 * Exact 10 rows from data/sensor_data.csv in Tenxed-rinx/IoT-Smart-Agriculture-Monitoring-System
 */
export const INITIAL_REPO_CSV_DATA: SensorRecord[] = [
  {
    id: 'row-1',
    timestamp: '2026-06-15 13:59:04.592434',
    soil: 213,
    temperature: 34,
    humidity: 44,
    light: 106,
    water: 713,
    pump: 'OFF',
    alerts: [],
    alertsText: '',
  },
  {
    id: 'row-2',
    timestamp: '2026-06-15 13:59:04.592456',
    soil: 670,
    temperature: 24,
    humidity: 41,
    light: 304,
    water: 461,
    pump: 'ON',
    alerts: ['Dry Soil'],
    alertsText: 'Dry Soil',
  },
  {
    id: 'row-3',
    timestamp: '2026-06-15 13:59:04.592464',
    soil: 360,
    temperature: 20,
    humidity: 43,
    light: 286,
    water: 387,
    pump: 'OFF',
    alerts: [],
    alertsText: '',
  },
  {
    id: 'row-4',
    timestamp: '2026-06-15 13:59:04.592471',
    soil: 785,
    temperature: 43,
    humidity: 73,
    light: 899,
    water: 190,
    pump: 'ON',
    alerts: ['Dry Soil', 'High Temperature', 'Low Water Level'],
    alertsText: 'Dry Soil, High Temperature, Low Water Level',
  },
  {
    id: 'row-5',
    timestamp: '2026-06-15 13:59:04.592479',
    soil: 726,
    temperature: 27,
    humidity: 80,
    light: 349,
    water: 292,
    pump: 'ON',
    alerts: ['Dry Soil'],
    alertsText: 'Dry Soil',
  },
  {
    id: 'row-6',
    timestamp: '2026-06-15 13:59:04.592493',
    soil: 294,
    temperature: 40,
    humidity: 69,
    light: 401,
    water: 511,
    pump: 'OFF',
    alerts: ['High Temperature'],
    alertsText: 'High Temperature',
  },
  {
    id: 'row-7',
    timestamp: '2026-06-15 13:59:04.592499',
    soil: 476,
    temperature: 39,
    humidity: 60,
    light: 947,
    water: 359,
    pump: 'OFF',
    alerts: ['High Temperature'],
    alertsText: 'High Temperature',
  },
  {
    id: 'row-8',
    timestamp: '2026-06-15 13:59:04.592505',
    soil: 427,
    temperature: 28,
    humidity: 43,
    light: 348,
    water: 144,
    pump: 'OFF',
    alerts: ['Low Water Level'],
    alertsText: 'Low Water Level',
  },
  {
    id: 'row-9',
    timestamp: '2026-06-15 13:59:04.592511',
    soil: 719,
    temperature: 45,
    humidity: 65,
    light: 429,
    water: 477,
    pump: 'ON',
    alerts: ['Dry Soil', 'High Temperature'],
    alertsText: 'Dry Soil, High Temperature',
  },
  {
    id: 'row-10',
    timestamp: '2026-06-15 13:59:04.592516',
    soil: 606,
    temperature: 27,
    humidity: 53,
    light: 101,
    water: 557,
    pump: 'ON',
    alerts: ['Dry Soil'],
    alertsText: 'Dry Soil',
  },
];

/**
 * Evaluates a single sensor input against the Arduino / Python threshold logic
 */
export function evaluateSensorReading(
  input: RawSensorInput,
  thresholds: SensorThresholds = DEFAULT_THRESHOLDS,
  pumpMode: PumpOverrideMode = 'AUTO',
  id: string = `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
): SensorRecord {
  const alerts: AlertType[] = [];

  if (input.soil > thresholds.soilThreshold) {
    alerts.push('Dry Soil');
  }
  if (input.temperature > thresholds.tempThreshold) {
    alerts.push('High Temperature');
  }
  if (input.water < thresholds.waterThreshold) {
    alerts.push('Low Water Level');
  }

  let pump: 'ON' | 'OFF';
  if (pumpMode === 'FORCE_ON') {
    pump = 'ON';
  } else if (pumpMode === 'FORCE_OFF') {
    pump = 'OFF';
  } else {
    pump = input.soil > thresholds.soilThreshold ? 'ON' : 'OFF';
  }

  const timestamp = input.timestamp || formatTimestamp(new Date());

  return {
    id,
    timestamp,
    soil: Math.round(input.soil),
    temperature: Number(input.temperature.toFixed(1)),
    humidity: Number(input.humidity.toFixed(1)),
    light: Math.round(input.light),
    water: Math.round(input.water),
    pump,
    alerts,
    alertsText: alerts.join(', '),
  };
}

/**
 * Re-evaluates a list of records when thresholds or override mode changes
 */
export function reevaluateDataset(
  records: SensorRecord[],
  thresholds: SensorThresholds,
  pumpMode: PumpOverrideMode = 'AUTO'
): SensorRecord[] {
  return records.map((rec) =>
    evaluateSensorReading(
      {
        soil: rec.soil,
        temperature: rec.temperature,
        humidity: rec.humidity,
        light: rec.light,
        water: rec.water,
        timestamp: rec.timestamp,
      },
      thresholds,
      pumpMode,
      rec.id
    )
  );
}

/**
 * Formats an Arduino Serial Monitor frame matching arduino-code/agriulture_monitoring.ino
 */
export function formatSerialMonitorFrame(
  record: SensorRecord,
  thresholds: SensorThresholds = DEFAULT_THRESHOLDS
): string[] {
  const lines: string[] = [
    '--------------------------------',
    `Soil Moisture: ${record.soil}`,
    `Temperature: ${record.temperature} °C`,
    `Humidity: ${record.humidity} %`,
    `Light Intensity: ${record.light}`,
    `Water Level: ${record.water}`,
  ];

  if (record.soil > thresholds.soilThreshold || record.pump === 'ON') {
    lines.push(`🚰 Pump Status: ${record.pump}`);
    if (record.soil > thresholds.soilThreshold) {
      lines.push('⚠ ALERT: Soil is Dry');
    }
  } else {
    lines.push('🚰 Pump Status: OFF');
  }

  if (record.temperature > thresholds.tempThreshold) {
    lines.push('🔥 ALERT: High Temperature');
  }

  if (record.water < thresholds.waterThreshold) {
    lines.push('💧 ALERT: Low Water Level');
  }

  return lines;
}

/**
 * Generates simulated sensor readings using the exact bounds from main.py:
 * soil: 200..800, temp: 20..45, humidity: 40..90, light: 100..1000, water: 100..800
 */
export function generateSimulatedReading(
  thresholds: SensorThresholds = DEFAULT_THRESHOLDS,
  pumpMode: PumpOverrideMode = 'AUTO',
  rng: () => number = Math.random
): SensorRecord {
  const randInt = (min: number, max: number) =>
    Math.floor(rng() * (max - min + 1)) + min;

  const raw: RawSensorInput = {
    soil: randInt(200, 800),
    temperature: randInt(20, 45),
    humidity: randInt(40, 90),
    light: randInt(100, 1000),
    water: randInt(100, 800),
  };

  return evaluateSensorReading(raw, thresholds, pumpMode);
}

/**
 * Generates a batch of N readings like main.py (default 10)
 */
export function generateSimulatedBatch(
  count: number = 10,
  thresholds: SensorThresholds = DEFAULT_THRESHOLDS,
  pumpMode: PumpOverrideMode = 'AUTO',
  rng: () => number = Math.random
): SensorRecord[] {
  const batch: SensorRecord[] = [];
  const baseTime = Date.now();
  for (let i = 0; i < count; i++) {
    const rec = generateSimulatedReading(thresholds, pumpMode, rng);
    rec.id = `batch-${baseTime}-${i}`;
    rec.timestamp = formatTimestamp(new Date(baseTime + i * 2000));
    batch.push(rec);
  }
  return batch;
}

/**
 * Converts SensorRecord[] to exact CSV format matching data/sensor_data.csv
 */
export function serializeToCsv(records: SensorRecord[]): string {
  const header = 'Timestamp,Soil,Temperature,Humidity,Light,Water,Pump,Alerts';
  const rows = records.map((r) => {
    const alertsField = r.alertsText.includes(',')
      ? `"${r.alertsText}"`
      : r.alertsText;
    return `${r.timestamp},${r.soil},${r.temperature},${r.humidity},${r.light},${r.water},${r.pump},${alertsField}`;
  });
  return [header, ...rows].join('\n');
}

/**
 * Parses a CSV string matching data/sensor_data.csv into SensorRecord[]
 */
export function parseFromCsv(
  csvText: string,
  thresholds: SensorThresholds = DEFAULT_THRESHOLDS
): SensorRecord[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  const records: SensorRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Handle quoted Alerts column at the end
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    parts.push(current.trim());

    if (parts.length >= 6) {
      const timestamp = parts[0] || formatTimestamp(new Date());
      const soil = Number(parts[1]);
      const temperature = Number(parts[2]);
      const humidity = Number(parts[3]);
      const light = Number(parts[4]);
      const water = Number(parts[5]);

      if (
        !Number.isNaN(soil) &&
        !Number.isNaN(temperature) &&
        !Number.isNaN(humidity) &&
        !Number.isNaN(light) &&
        !Number.isNaN(water)
      ) {
        records.push(
          evaluateSensorReading(
            { soil, temperature, humidity, light, water, timestamp },
            thresholds,
            'AUTO',
            `csv-${i}-${Date.now()}`
          )
        );
      }
    }
  }
  return records;
}

/**
 * Validates manual sensor form entry inputs
 */
export function validateManualReadingInput(values: {
  soil: string;
  temperature: string;
  humidity: string;
  light: string;
  water: string;
}): { valid: boolean; error?: string; parsed?: RawSensorInput } {
  if (
    values.soil.trim() === '' ||
    values.temperature.trim() === '' ||
    values.humidity.trim() === '' ||
    values.light.trim() === '' ||
    values.water.trim() === ''
  ) {
    return { valid: false, error: 'All five sensor fields are required.' };
  }

  const soil = Number(values.soil);
  const temperature = Number(values.temperature);
  const humidity = Number(values.humidity);
  const light = Number(values.light);
  const water = Number(values.water);

  if (
    Number.isNaN(soil) ||
    Number.isNaN(temperature) ||
    Number.isNaN(humidity) ||
    Number.isNaN(light) ||
    Number.isNaN(water)
  ) {
    return { valid: false, error: 'All sensor inputs must be valid numbers.' };
  }

  if (soil < 0 || soil > 1023) {
    return { valid: false, error: 'Soil Moisture ADC must be between 0 and 1023.' };
  }
  if (temperature < -10 || temperature > 80) {
    return { valid: false, error: 'Temperature must be between -10°C and 80°C.' };
  }
  if (humidity < 0 || humidity > 100) {
    return { valid: false, error: 'Humidity must be between 0% and 100%.' };
  }
  if (light < 0 || light > 1023) {
    return { valid: false, error: 'Light Intensity ADC must be between 0 and 1023.' };
  }
  if (water < 0 || water > 1023) {
    return { valid: false, error: 'Water Tank Level ADC must be between 0 and 1023.' };
  }

  return {
    valid: true,
    parsed: { soil, temperature, humidity, light, water },
  };
}

/**
 * Computes summary telemetry statistics across a dataset
 */
export function calculateTelemetryStats(records: SensorRecord[]) {
  if (records.length === 0) {
    return {
      count: 0,
      avgSoil: 0,
      avgTemp: 0,
      avgHumidity: 0,
      avgLight: 0,
      avgWater: 0,
      pumpOnCount: 0,
      drySoilAlerts: 0,
      highTempAlerts: 0,
      lowWaterAlerts: 0,
      totalAlertRows: 0,
    };
  }

  let sumSoil = 0;
  let sumTemp = 0;
  let sumHumidity = 0;
  let sumLight = 0;
  let sumWater = 0;
  let pumpOnCount = 0;
  let drySoilAlerts = 0;
  let highTempAlerts = 0;
  let lowWaterAlerts = 0;
  let totalAlertRows = 0;

  for (const r of records) {
    sumSoil += r.soil;
    sumTemp += r.temperature;
    sumHumidity += r.humidity;
    sumLight += r.light;
    sumWater += r.water;
    if (r.pump === 'ON') pumpOnCount++;
    if (r.alerts.includes('Dry Soil')) drySoilAlerts++;
    if (r.alerts.includes('High Temperature')) highTempAlerts++;
    if (r.alerts.includes('Low Water Level')) lowWaterAlerts++;
    if (r.alerts.length > 0) totalAlertRows++;
  }

  const n = records.length;
  return {
    count: n,
    avgSoil: Math.round(sumSoil / n),
    avgTemp: Number((sumTemp / n).toFixed(1)),
    avgHumidity: Number((sumHumidity / n).toFixed(1)),
    avgLight: Math.round(sumLight / n),
    avgWater: Math.round(sumWater / n),
    pumpOnCount,
    drySoilAlerts,
    highTempAlerts,
    lowWaterAlerts,
    totalAlertRows,
  };
}

export function formatTimestamp(date: Date): string {
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3) + '000';
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.${ms}`;
}
