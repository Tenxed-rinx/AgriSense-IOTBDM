/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  DEFAULT_THRESHOLDS,
  INITIAL_REPO_CSV_DATA,
  RawSensorInput,
  SensorRecord,
  SensorThresholds,
  PumpOverrideMode,
  evaluateSensorReading,
  reevaluateDataset,
  generateSimulatedReading,
  generateSimulatedBatch,
  serializeToCsv,
  parseFromCsv,
  calculateTelemetryStats,
  formatSerialMonitorFrame,
} from './utils/agricultureLogic';
import {
  AgroSimulationParams,
  CropRequirement,
  IoTNodeTelemetry,
  SOIL_TYPES,
  calculateVwcPercent,
  calculateVpd,
} from './utils/soilAgronomyData';
import { SoilUsageSimulator } from './components/SoilUsageSimulator';
import { SoilDiagnosisCard } from './components/SoilDiagnosisCard';
import { CropSuitabilityExplorer } from './components/CropSuitabilityExplorer';
import { IoTBigDataHub } from './components/IoTBigDataHub';
import { AiAgronomistAssistant } from './components/AiAgronomistAssistant';
import { TelemetryCharts } from './components/TelemetryCharts';
import { HardwareBench } from './components/HardwareBench';
import { CsvDataExplorer } from './components/CsvDataExplorer';
import { ArchitectureAndCodeView } from './components/ArchitectureAndCodeView';
import {
  Sprout,
  Droplet,
  Thermometer,
  Wind,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';

export default function App() {
  // Configurable thresholds matching arduino-code/agriulture_monitoring.ino
  const [thresholds, setThresholds] = useState<SensorThresholds>(DEFAULT_THRESHOLDS);
  const [pumpMode, setPumpMode] = useState<PumpOverrideMode>('AUTO');

  // Dataset initialized with the exact 10 rows from data/sensor_data.csv in the repo
  const [records, setRecords] = useState<SensorRecord[]>(INITIAL_REPO_CSV_DATA);

  // Farmer-friendly Agronomic Parameters
  const [agroParams, setAgroParams] = useState<AgroSimulationParams>({
    soilMoistureAdc: 460,
    soilType: 'Silty Loam',
    temperature: 26,
    humidity: 58,
    soilPh: 6.5,
    nitrogenPpm: 42,
    phosphorusPpm: 28,
    potassiumPpm: 210,
    lightIntensity: 680,
    waterLevelAdc: 620,
    salinityEc: 0.9,
  });

  // Live hardware probe state (synced with agroParams)
  const [liveInput, setLiveInput] = useState<RawSensorInput>({
    soil: 460,
    temperature: 26,
    humidity: 58,
    light: 680,
    water: 620,
  });

  // 2000ms Arduino loop() auto-streaming state & elapsed clock
  const [isAutoStreaming, setIsAutoStreaming] = useState<boolean>(false);
  const [simElapsedSeconds, setSimElapsedSeconds] = useState<number>(0);
  const [serialHistory, setSerialHistory] = useState<string[][]>([]);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Re-evaluate dataset whenever thresholds or pump override mode changes
  const evaluatedRecords = useMemo(
    () => reevaluateDataset(records, thresholds, pumpMode),
    [records, thresholds, pumpMode]
  );

  // Evaluate live hardware probe against current thresholds and pump mode
  const liveRecord = useMemo(
    () => evaluateSensorReading(liveInput, thresholds, pumpMode, 'live-probe'),
    [liveInput, thresholds, pumpMode]
  );

  const stats = useMemo(
    () => calculateTelemetryStats(evaluatedRecords),
    [evaluatedRecords]
  );

  // Keep liveInput and agroParams in two-way sync
  const handleUpdateAgroParams = (partial: Partial<AgroSimulationParams>) => {
    setAgroParams((prev) => {
      const next = { ...prev, ...partial };
      setLiveInput((lp) => ({
        ...lp,
        soil: next.soilMoistureAdc,
        temperature: next.temperature,
        humidity: next.humidity,
        light: next.lightIntensity,
        water: next.waterLevelAdc,
      }));
      return next;
    });
  };

  const handleUpdateLiveInput = (partial: Partial<RawSensorInput>) => {
    setLiveInput((prev) => {
      const next = { ...prev, ...partial };
      setAgroParams((ap) => ({
        ...ap,
        soilMoistureAdc: next.soil !== undefined ? next.soil : ap.soilMoistureAdc,
        temperature: next.temperature !== undefined ? next.temperature : ap.temperature,
        humidity: next.humidity !== undefined ? next.humidity : ap.humidity,
        lightIntensity: next.light !== undefined ? next.light : ap.lightIntensity,
        waterLevelAdc: next.water !== undefined ? next.water : ap.waterLevelAdc,
      }));
      return next;
    });
  };

  const handleApplyAgroPreset = (presetName: string, presetParams: AgroSimulationParams) => {
    setAgroParams(presetParams);
    setLiveInput({
      soil: presetParams.soilMoistureAdc,
      temperature: presetParams.temperature,
      humidity: presetParams.humidity,
      light: presetParams.lightIntensity,
      water: presetParams.waterLevelAdc,
    });
    showNotice(`Loaded "${presetName}" farm conditions`);
  };

  const handleApplyCropIdealConditions = (crop: CropRequirement) => {
    const idealVwc = (crop.optimalMoistureMin + crop.optimalMoistureMax) / 2;
    const idealAdc = Math.round(1023 - (idealVwc / (SOIL_TYPES[crop.preferredSoils[0] || 'Silty Loam'].adcToVwcFactor / 0.048) / 100) * 1023);
    const idealSoil = crop.preferredSoils[0] || 'Silty Loam';
    const idealTemp = Number(((crop.optimalTempMin + crop.optimalTempMax) / 2).toFixed(1));
    const idealHumidity = Number(((crop.optimalHumidityMin + crop.optimalHumidityMax) / 2).toFixed(0));
    const idealPh = Number(((crop.optimalPhMin + crop.optimalPhMax) / 2).toFixed(1));

    handleUpdateAgroParams({
      soilMoistureAdc: Math.max(220, Math.min(800, idealAdc)),
      soilType: idealSoil,
      temperature: idealTemp,
      humidity: idealHumidity,
      soilPh: idealPh,
    });

    showNotice(`Simulator calibrated to optimal conditions for ${crop.name}`);
    scrollToSection('soil-simulator-section');
  };

  const handleApplyNodeConditions = (node: IoTNodeTelemetry) => {
    handleUpdateAgroParams({
      soilMoistureAdc: node.soilDepth15cmAdc,
      temperature: node.canopyTemp,
      humidity: node.ambientHumidity,
    });
    showNotice(`Loaded conditions from Station ${node.nodeId} (${node.zoneName})`);
    scrollToSection('soil-simulator-section');
  };

  // 2000ms Arduino loop() simulation timer
  useEffect(() => {
    if (!isAutoStreaming) return;
    const interval = setInterval(() => {
      const next = generateSimulatedReading(thresholds, pumpMode);
      setLiveInput({
        soil: next.soil,
        temperature: next.temperature,
        humidity: next.humidity,
        light: next.light,
        water: next.water,
      });
      setAgroParams((prev) => ({
        ...prev,
        soilMoistureAdc: next.soil,
        temperature: next.temperature,
        humidity: next.humidity,
        lightIntensity: next.light,
        waterLevelAdc: next.water,
      }));
      setRecords((prev) => [...prev, next]);
      setSimElapsedSeconds((prev) => prev + 2);
      setSerialHistory((prev) => [
        ...prev.slice(-19),
        formatSerialMonitorFrame(next, thresholds),
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAutoStreaming, thresholds, pumpMode]);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleUpdateThresholds = (partial: Partial<SensorThresholds>) => {
    setThresholds((prev) => ({ ...prev, ...partial }));
  };

  const handleLogCurrentReading = () => {
    const newRec = evaluateSensorReading(liveInput, thresholds, pumpMode);
    setRecords((prev) => [...prev, newRec]);
    setSimElapsedSeconds((prev) => prev + 2);
    setSerialHistory((prev) => [
      ...prev.slice(-19),
      formatSerialMonitorFrame(newRec, thresholds),
    ]);
    showNotice(
      `Saved field reading to log (Soil: ${newRec.soil}, Pump: ${newRec.pump})`
    );
  };

  const handleStepRandomReading = () => {
    const simulated = generateSimulatedReading(thresholds, pumpMode);
    setLiveInput({
      soil: simulated.soil,
      temperature: simulated.temperature,
      humidity: simulated.humidity,
      light: simulated.light,
      water: simulated.water,
    });
    setAgroParams((prev) => ({
      ...prev,
      soilMoistureAdc: simulated.soil,
      temperature: simulated.temperature,
      humidity: simulated.humidity,
      lightIntensity: simulated.light,
      waterLevelAdc: simulated.water,
    }));
    setRecords((prev) => [...prev, simulated]);
    setSimElapsedSeconds((prev) => prev + 2);
    setSerialHistory((prev) => [
      ...prev.slice(-19),
      formatSerialMonitorFrame(simulated, thresholds),
    ]);
    showNotice(
      `Sampled 1 sensor cycle (Soil: ${simulated.soil}, Temp: ${simulated.temperature}°C)`
    );
  };

  const handleGenerateBatch = (count: number = 10) => {
    const batch = generateSimulatedBatch(count, thresholds, pumpMode);
    if (batch.length > 0) {
      const last = batch[batch.length - 1];
      setLiveInput({
        soil: last.soil,
        temperature: last.temperature,
        humidity: last.humidity,
        light: last.light,
        water: last.water,
      });
      setAgroParams((prev) => ({
        ...prev,
        soilMoistureAdc: last.soil,
        temperature: last.temperature,
        humidity: last.humidity,
        lightIntensity: last.light,
        waterLevelAdc: last.water,
      }));
    }
    setRecords((prev) => [...prev, ...batch]);
    setSimElapsedSeconds((prev) => prev + count * 2);
    showNotice(`Added +${count} sensor readings to table`);
  };

  const handleApplyPreset = (presetName: string, input: RawSensorInput) => {
    setLiveInput(input);
    setAgroParams((prev) => ({
      ...prev,
      soilMoistureAdc: input.soil,
      temperature: input.temperature,
      humidity: input.humidity,
      lightIntensity: input.light,
      waterLevelAdc: input.water,
    }));
    const evaluated = evaluateSensorReading(input, thresholds, pumpMode);
    setRecords((prev) => [...prev, evaluated]);
    setSimElapsedSeconds((prev) => prev + 2);
    setSerialHistory((prev) => [
      ...prev.slice(-19),
      formatSerialMonitorFrame(evaluated, thresholds),
    ]);
    showNotice(`Applied "${presetName}" hardware preset`);
  };

  const handleAddManualRecord = (input: RawSensorInput) => {
    const newRec = evaluateSensorReading(input, thresholds, pumpMode);
    setLiveInput(input);
    setRecords((prev) => [...prev, newRec]);
    showNotice('Added manual reading to table');
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetSimulation = () => {
    setIsAutoStreaming(false);
    setSimElapsedSeconds(0);
    setSerialHistory([]);
    setThresholds(DEFAULT_THRESHOLDS);
    setPumpMode('AUTO');
    setRecords(INITIAL_REPO_CSV_DATA);
    setAgroParams({
      soilMoistureAdc: 460,
      soilType: 'Silty Loam',
      temperature: 26,
      humidity: 58,
      soilPh: 6.5,
      nitrogenPpm: 42,
      phosphorusPpm: 28,
      potassiumPpm: 210,
      lightIntensity: 680,
      waterLevelAdc: 620,
      salinityEc: 0.9,
    });
    setLiveInput({
      soil: 460,
      temperature: 26,
      humidity: 58,
      light: 680,
      water: 620,
    });
    showNotice('Reset simulator to default fertile loam soil');
  };

  const handleClearAll = () => {
    setIsAutoStreaming(false);
    setRecords([]);
    showNotice('Cleared sensor table');
  };

  const handleExportCsv = () => {
    const csvContent = serializeToCsv(evaluatedRecords);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'farm_sensor_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice(`Exported ${evaluatedRecords.length} readings to farm_sensor_data.csv`);
  };

  const handleImportCsvText = (csvText: string) => {
    const parsed = parseFromCsv(csvText, thresholds);
    if (parsed.length > 0) {
      setRecords(parsed);
      const last = parsed[parsed.length - 1];
      setLiveInput({
        soil: last.soil,
        temperature: last.temperature,
        humidity: last.humidity,
        light: last.light,
        water: last.water,
      });
      setAgroParams((prev) => ({
        ...prev,
        soilMoistureAdc: last.soil,
        temperature: last.temperature,
        humidity: last.humidity,
        lightIntensity: last.light,
        waterLevelAdc: last.water,
      }));
      showNotice(`Loaded ${parsed.length} rows from CSV`);
    } else {
      showNotice('No valid sensor rows found in pasted CSV');
    }
  };

  const currentVwc = calculateVwcPercent(agroParams.soilMoistureAdc, agroParams.soilType);
  const currentVpd = calculateVpd(agroParams.temperature, agroParams.humidity);

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Clean, Refined Minimalist Top Navigation */}
      <header className="flex items-center justify-between gap-6 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('top');
            }}
            className="flex items-center gap-2.5 group"
          >
            <span className="p-1.5 rounded-lg bg-emerald-700 text-white font-bold text-sm shadow-xs">
              <Sprout className="w-5 h-5" />
            </span>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                AgriSense IoT
              </span>
              <span className="text-[10px] text-slate-500 block -mt-1 font-semibold tracking-wide">
                Smart Soil &amp; Crop Advisor
              </span>
            </div>
          </a>
        </div>

        {/* Clean Text Navigation Links */}
        <nav
          aria-label="In-Page Workspace Sections"
          className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 overflow-x-auto"
        >
          <a
            href="#soil-simulator-section"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('soil-simulator-section');
            }}
            className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Test Soil &amp; Field
          </a>
          <a
            href="#soil-diagnosis-section"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('soil-diagnosis-section');
            }}
            className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            What Soil is Saying
          </a>
          <a
            href="#crop-suitability-section"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('crop-suitability-section');
            }}
            className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Best Crops to Grow
          </a>
          <a
            href="#iot-bigdata-section"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('iot-bigdata-section');
            }}
            className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Farm Sensor Network
          </a>
          <a
            href="#simulator-section"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('simulator-section');
            }}
            className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Arduino Circuit
          </a>
          <a
            href="#csv-section"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('csv-section');
            }}
            className="py-1.5 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Sensor Table ({evaluatedRecords.length})
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-7">
        {/* Sub-header Context & Simple Field Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">ACTIVE FIELD PARAMETERS</span>
              <span aria-hidden="true">·</span>
              <span>{agroParams.soilType} Soil</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-800 font-semibold">{currentVwc}% Root Moisture</span>
              <span aria-hidden="true">·</span>
              <span>pH {agroParams.soilPh.toFixed(1)}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Soil Usage Simulator, Agronomic Diagnostics &amp; Crop Advisor
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusNotice && (
              <span
                role="status"
                className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-in fade-in"
              >
                ● {statusNotice}
              </span>
            )}
            <button
              type="button"
              onClick={handleStepRandomReading}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Take 1 Sensor Sample
            </button>
            <button
              type="button"
              onClick={() => handleGenerateBatch(10)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
            >
              Add +10 Readings
            </button>
          </div>
        </div>

        {/* 6-Column Clean Status Strip */}
        <section
          aria-label="Current Live Readout Strip"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {/* 1. Soil Moisture */}
          <div className="border border-slate-200 bg-white rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Root Moisture
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold text-slate-900">
                {currentVwc}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({liveRecord.soil})
              </span>
            </div>
            <div className="mt-1 text-xs font-medium">
              {liveRecord.soil > thresholds.soilThreshold ? (
                <span className="text-amber-700">Soil is Thirsty</span>
              ) : (
                <span className="text-emerald-700">Ideal Wetness</span>
              )}
            </div>
          </div>

          {/* 2. Temperature */}
          <div className="border border-slate-200 bg-white rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Air Temperature
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-slate-900">
                {liveRecord.temperature}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1">°C</span>
            </div>
            <div className="mt-1 text-xs text-slate-600">
              {liveRecord.temperature > thresholds.tempThreshold ? (
                <span className="text-rose-700 font-medium">Warm weather</span>
              ) : (
                <span className="text-emerald-700 font-medium">Comfortable</span>
              )}
            </div>
          </div>

          {/* 3. Humidity */}
          <div className="border border-slate-200 bg-white rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Air Humidity
            </div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-bold text-slate-900">
                {liveRecord.humidity}
              </span>
              <span className="text-xs font-bold text-slate-500 ml-1">%</span>
            </div>
            <div className="mt-1 text-xs text-slate-600">
              {liveRecord.humidity > 75 ? 'Humid air' : 'Normal breeze'}
            </div>
          </div>

          {/* 4. Soil pH */}
          <div className="border border-slate-200 bg-white rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Soil Reaction (pH)
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold text-slate-900">
                {agroParams.soilPh.toFixed(1)}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {agroParams.soilPh < 6.0 ? 'Sour' : agroParams.soilPh <= 7.2 ? 'Balanced' : 'Alkaline'}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500 truncate">
              {agroParams.soilType}
            </div>
          </div>

          {/* 5. Evaporation Power */}
          <div className="border border-slate-200 bg-white rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Drying Demand
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold text-slate-900">
                {currentVpd}
              </span>
              <span className="text-xs text-slate-400">kPa</span>
            </div>
            <div className="mt-1 text-xs text-slate-600">
              {currentVpd < 0.5 ? 'Slow drying' : currentVpd > 1.4 ? 'Fast drying' : 'Optimal transpiration'}
            </div>
          </div>

          {/* 6. Pump Status */}
          <div className="border border-slate-200 bg-white rounded-xl p-3.5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Water Pump
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span
                className={`text-2xl font-mono font-bold ${
                  liveRecord.pump === 'ON' ? 'text-emerald-700' : 'text-slate-800'
                }`}
              >
                {liveRecord.pump === 'ON' ? 'RUNNING' : 'IDLE'}
              </span>
              <span className="text-[11px] font-medium text-slate-500">{pumpMode}</span>
            </div>
            <div className="mt-1 text-xs text-slate-600">
              {liveRecord.pump === 'ON' ? 'Irrigation active' : 'Moisture sufficient'}
            </div>
          </div>
        </section>

        {/* SECTION 1: SOIL CONDITION SIMULATOR */}
        <section id="soil-simulator-section" className="scroll-mt-20">
          <SoilUsageSimulator
            params={agroParams}
            onChangeParams={handleUpdateAgroParams}
            onApplyPreset={handleApplyAgroPreset}
            onResetToDefaults={handleResetSimulation}
            onSyncWithHardwareProbe={() => {
              handleUpdateAgroParams({
                soilMoistureAdc: liveInput.soil,
                temperature: liveInput.temperature,
                humidity: liveInput.humidity,
                lightIntensity: liveInput.light,
                waterLevelAdc: liveInput.water,
              });
              showNotice('Copied readings from Arduino sensor hardware');
            }}
          />
        </section>

        {/* SECTION 2: WHAT THE SOIL IS SAYING */}
        <section id="soil-diagnosis-section" className="scroll-mt-20">
          <SoilDiagnosisCard params={agroParams} />
        </section>

        {/* SECTION 3: BEST CROPS TO GROW */}
        <section id="crop-suitability-section" className="scroll-mt-20">
          <CropSuitabilityExplorer
            params={agroParams}
            onApplyCropIdealConditions={handleApplyCropIdealConditions}
          />
        </section>

        {/* SECTION 4: IOT BIG DATA NETWORK */}
        <section id="iot-bigdata-section" className="scroll-mt-20">
          <IoTBigDataHub
            params={agroParams}
            onApplyNodeConditions={handleApplyNodeConditions}
          />
        </section>

        {/* SECTION 5: ARDUINO HARDWARE BENCH */}
        <section id="simulator-section" className="scroll-mt-20">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Arduino UNO Circuit &amp; Wire Simulator
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Simulates physical Arduino UNO microcontroller, sensors, and water pump relay
            </span>
          </div>
          <HardwareBench
            liveInput={liveInput}
            liveRecord={liveRecord}
            thresholds={thresholds}
            pumpMode={pumpMode}
            isAutoStreaming={isAutoStreaming}
            simElapsedSeconds={simElapsedSeconds}
            serialHistory={serialHistory}
            onUpdateLiveInput={handleUpdateLiveInput}
            onUpdateThresholds={handleUpdateThresholds}
            onUpdatePumpMode={setPumpMode}
            onLogCurrentReading={handleLogCurrentReading}
            onStepRandomReading={handleStepRandomReading}
            onToggleAutoStream={() => setIsAutoStreaming((s) => !s)}
            onResetSimulation={handleResetSimulation}
            onApplyPreset={handleApplyPreset}
          />
        </section>

        {/* SECTION 6: TELEMETRY CHARTS */}
        <section id="telemetry-section" className="scroll-mt-20">
          <TelemetryCharts
            records={evaluatedRecords}
            thresholds={thresholds}
            onSelectRecord={(rec) => {
              setLiveInput({
                soil: rec.soil,
                temperature: rec.temperature,
                humidity: rec.humidity,
                light: rec.light,
                water: rec.water,
              });
              setAgroParams((prev) => ({
                ...prev,
                soilMoistureAdc: rec.soil,
                temperature: rec.temperature,
                humidity: rec.humidity,
                lightIntensity: rec.light,
                waterLevelAdc: rec.water,
              }));
            }}
          />
        </section>

        {/* SECTION 7: SENSOR TABLE & CSV LOGGER */}
        <section id="csv-section" className="scroll-mt-20">
          <CsvDataExplorer
            records={evaluatedRecords}
            onAddManualRecord={handleAddManualRecord}
            onGenerateBatch={handleGenerateBatch}
            onResetToRepoDefault={handleResetSimulation}
            onClearAll={handleClearAll}
            onExportCsv={handleExportCsv}
            onImportCsvText={handleImportCsvText}
            onDeleteRecord={handleDeleteRecord}
          />
        </section>

        {/* SECTION 8: SYSTEM ARCHITECTURE & CODE */}
        <section id="architecture-section" className="scroll-mt-20">
          <ArchitectureAndCodeView
            liveRecord={liveRecord}
            thresholds={thresholds}
            totalRowsLogged={evaluatedRecords.length}
            onFocusSimulator={() => scrollToSection('simulator-section')}
          />
        </section>
      </main>

      {/* Floating AI Farm Doctor (Kisan Mitra) */}
      <AiAgronomistAssistant params={agroParams} />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-5 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            AgriSense IoT · Smart Agriculture Monitoring, Soil Health Diagnostics &amp; Crop Advisor
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => scrollToSection('soil-simulator-section')}
              className="hover:text-slate-900 transition-colors"
            >
              Test Soil
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => scrollToSection('crop-suitability-section')}
              className="hover:text-slate-900 transition-colors"
            >
              Best Crops
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => scrollToSection('iot-bigdata-section')}
              className="hover:text-slate-900 transition-colors"
            >
              Farm Sensor Network
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => scrollToSection('csv-section')}
              className="hover:text-slate-900 transition-colors"
            >
              Sensor Table
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
