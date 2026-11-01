import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_THRESHOLDS,
  INITIAL_REPO_CSV_DATA,
  evaluateSensorReading,
  reevaluateDataset,
  formatSerialMonitorFrame,
  serializeToCsv,
  parseFromCsv,
  validateManualReadingInput,
  calculateTelemetryStats,
} from './agricultureLogic';

test('evaluateSensorReading matches repo sample output and threshold rules', () => {
  // Sample from readme.md: Soil: 720, Temp: 38, Humidity: 62, Water: 120
  const reading = evaluateSensorReading({
    soil: 720,
    temperature: 38,
    humidity: 62,
    light: 450,
    water: 120,
  });

  assert.equal(reading.pump, 'ON');
  assert.deepEqual(reading.alerts, [
    'Dry Soil',
    'High Temperature',
    'Low Water Level',
  ]);
  assert.equal(
    reading.alertsText,
    'Dry Soil, High Temperature, Low Water Level'
  );
});

test('evaluateSensorReading keeps pump OFF and no alerts when nominal', () => {
  const reading = evaluateSensorReading({
    soil: 360,
    temperature: 24,
    humidity: 55,
    light: 500,
    water: 600,
  });

  assert.equal(reading.pump, 'OFF');
  assert.deepEqual(reading.alerts, []);
  assert.equal(reading.alertsText, '');
});

test('formatSerialMonitorFrame produces exact Arduino Serial Monitor lines', () => {
  const reading = evaluateSensorReading({
    soil: 720,
    temperature: 38,
    humidity: 62,
    light: 510,
    water: 120,
  });

  const frame = formatSerialMonitorFrame(reading);
  assert.ok(frame.includes('Soil Moisture: 720'));
  assert.ok(frame.includes('Temperature: 38 °C'));
  assert.ok(frame.includes('🚰 Pump Status: ON'));
  assert.ok(frame.includes('⚠ ALERT: Soil is Dry'));
  assert.ok(frame.includes('🔥 ALERT: High Temperature'));
  assert.ok(frame.includes('💧 ALERT: Low Water Level'));
});

test('reevaluateDataset updates pump and alerts when thresholds change', () => {
  const customThresholds = {
    soilThreshold: 750, // Only soil > 750 triggers Dry Soil now
    tempThreshold: 42,
    waterThreshold: 150,
  };

  const updated = reevaluateDataset(INITIAL_REPO_CSV_DATA, customThresholds);
  // Row 4 has soil 785, temp 43, water 190 -> Dry Soil & High Temperature, but water 190 >= 150
  const row4 = updated[3];
  assert.equal(row4.pump, 'ON');
  assert.deepEqual(row4.alerts, ['Dry Soil', 'High Temperature']);

  // Row 2 has soil 670 -> now <= 750 so pump should be OFF
  const row2 = updated[1];
  assert.equal(row2.pump, 'OFF');
  assert.deepEqual(row2.alerts, []);
});

test('serializeToCsv and parseFromCsv round-trip repo dataset accurately', () => {
  const csv = serializeToCsv(INITIAL_REPO_CSV_DATA);
  const parsed = parseFromCsv(csv, DEFAULT_THRESHOLDS);

  assert.equal(parsed.length, 10);
  assert.equal(parsed[0].soil, 213);
  assert.equal(parsed[0].pump, 'OFF');
  assert.equal(parsed[3].soil, 785);
  assert.equal(parsed[3].pump, 'ON');
  assert.deepEqual(parsed[3].alerts, [
    'Dry Soil',
    'High Temperature',
    'Low Water Level',
  ]);
});

test('validateManualReadingInput enforces required fields and sensor ranges', () => {
  const emptyCheck = validateManualReadingInput({
    soil: '',
    temperature: '25',
    humidity: '50',
    light: '300',
    water: '400',
  });
  assert.equal(emptyCheck.valid, false);

  const outOfRangeCheck = validateManualReadingInput({
    soil: '1500',
    temperature: '25',
    humidity: '50',
    light: '300',
    water: '400',
  });
  assert.equal(outOfRangeCheck.valid, false);

  const validCheck = validateManualReadingInput({
    soil: '640',
    temperature: '31',
    humidity: '58',
    light: '720',
    water: '410',
  });
  assert.equal(validCheck.valid, true);
  assert.equal(validCheck.parsed?.soil, 640);
});

test('calculateTelemetryStats aggregates initial repo data accurately', () => {
  const stats = calculateTelemetryStats(INITIAL_REPO_CSV_DATA);
  assert.equal(stats.count, 10);
  assert.equal(stats.pumpOnCount, 5);
  assert.equal(stats.drySoilAlerts, 5);
  assert.equal(stats.highTempAlerts, 4);
  assert.equal(stats.lowWaterAlerts, 2);
});
