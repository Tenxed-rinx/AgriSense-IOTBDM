import React, { useState } from 'react';
import {
  RawSensorInput,
  SensorRecord,
  SensorThresholds,
  PumpOverrideMode,
  formatSerialMonitorFrame,
} from '../utils/agricultureLogic';
import { REPO_ARDUINO_CODE, REPO_DIAGRAM_JSON } from '../utils/repoFiles';

interface HardwareBenchProps {
  liveInput: RawSensorInput;
  liveRecord: SensorRecord;
  thresholds: SensorThresholds;
  pumpMode: PumpOverrideMode;
  isAutoStreaming: boolean;
  simElapsedSeconds: number;
  serialHistory: string[][];
  onUpdateLiveInput: (partial: Partial<RawSensorInput>) => void;
  onUpdateThresholds: (partial: Partial<SensorThresholds>) => void;
  onUpdatePumpMode: (mode: PumpOverrideMode) => void;
  onLogCurrentReading: () => void;
  onStepRandomReading: () => void;
  onToggleAutoStream: () => void;
  onResetSimulation: () => void;
  onApplyPreset: (presetName: string, input: RawSensorInput) => void;
}

type ActiveHardwarePart = 'dht1' | 'pot1' | 'ldr1' | 'pot2' | 'led1' | 'uno';
type SimulatorSubTab = 'canvas' | 'ino' | 'diagram';

export const HardwareBench: React.FC<HardwareBenchProps> = ({
  liveInput,
  liveRecord,
  thresholds,
  pumpMode,
  isAutoStreaming,
  simElapsedSeconds,
  serialHistory,
  onUpdateLiveInput,
  onUpdateThresholds,
  onUpdatePumpMode,
  onLogCurrentReading,
  onStepRandomReading,
  onToggleAutoStream,
  onResetSimulation,
  onApplyPreset,
}) => {
  const [selectedPart, setSelectedPart] = useState<ActiveHardwarePart>('pot1');
  const [subTab, setSubTab] = useState<SimulatorSubTab>('canvas');

  const currentSerialLines = formatSerialMonitorFrame(liveRecord, thresholds);

  const isSoilDry = liveRecord.soil > thresholds.soilThreshold;
  const isTempHigh = liveRecord.temperature > thresholds.tempThreshold;
  const isWaterLow = liveRecord.water < thresholds.waterThreshold;
  const isPumpOn = liveRecord.pump === 'ON';

  // Calculate rotary knob angles (-135deg to +135deg) for pot1 (Soil A0) and pot2 (Water A2)
  const pot1Angle = -135 + (liveInput.soil / 1023) * 270;
  const pot2Angle = -135 + (liveInput.water / 1023) * 270;

  const formatSimTime = (sec: number) => {
    const mins = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const secs = (sec % 60).toFixed(1).padStart(4, '0');
    return `${mins}:${secs}s`;
  };

  return (
    <section
      aria-label="In-App Wokwi Hardware Simulator"
      className="border border-slate-200 bg-white rounded-lg overflow-hidden"
    >
      {/* Top Wokwi Simulator Control Bar */}
      <div className="bg-[#0F172A] text-slate-100 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Play / Pause Simulation Button */}
          <button
            type="button"
            onClick={onToggleAutoStream}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isAutoStreaming
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            <span>{isAutoStreaming ? '⏸ Pause Simulation' : '▶ Run Simulation (2s Loop)'}</span>
          </button>

          <button
            type="button"
            onClick={onStepRandomReading}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            Step 1 Frame
          </button>

          <button
            type="button"
            onClick={onResetSimulation}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            ↻ Reset MCU
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 pl-2 border-l border-slate-700">
            <span>MCU: ATmega328P</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums text-emerald-400">
              T+{formatSimTime(simElapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Sub-view Switcher (Interactive Circuit vs Code vs diagram.json) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setSubTab('canvas')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                subTab === 'canvas'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Breadboard
            </button>
            <button
              type="button"
              onClick={() => setSubTab('ino')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                subTab === 'ino'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              agriulture_monitoring.ino
            </button>
            <button
              type="button"
              onClick={() => setSubTab('diagram')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                subTab === 'diagram'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              diagram.json
            </button>
          </div>
        </div>
      </div>

      {/* Quick Scenario Preset Strip */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-600">
          <strong className="text-slate-900">Click any hardware component</strong> on the circuit canvas or use sliders below to adjust live pin voltages:
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              onApplyPreset('README Sample Output', {
                soil: 720,
                temperature: 38,
                humidity: 62,
                light: 540,
                water: 120,
              })
            }
            className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 rounded hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0"
          >
            Preset: Repo README Sample (Soil 720 · 38°C · Water 120)
          </button>
          <button
            type="button"
            onClick={() =>
              onApplyPreset('Wet Soil (Pump OFF)', {
                soil: 280,
                temperature: 26,
                humidity: 64,
                light: 610,
                water: 690,
              })
            }
            className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Preset: Wet Soil (Pump OFF)
          </button>
          <button
            type="button"
            onClick={() =>
              onApplyPreset('Dry Soil Irrigation (Pump ON)', {
                soil: 685,
                temperature: 31,
                humidity: 44,
                light: 820,
                water: 540,
              })
            }
            className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Preset: Dry Soil (Pump ON)
          </button>
        </div>
      </div>

      {/* Main Simulator Body: Left 7 Cols (Circuit / Code) + Right 5 Cols (Interactive Part Inspector & Serial Monitor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left 7 Columns: Wokwi Interactive Circuit Canvas or Firmware View */}
        <div className="lg:col-span-7 p-4 bg-[#111827] text-slate-100 flex flex-col justify-between">
          {subTab === 'canvas' && (
            <>
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox="0 0 720 430"
                  className="w-full h-auto min-w-[580px] select-none"
                  role="img"
                  aria-label="In-App Wokwi Interactive Circuit Simulator with dht1, pot1, ldr1, pot2, led1, and Arduino UNO"
                >
                  <defs>
                    <radialGradient id="ledRedGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.95" />
                      <stop offset="45%" stopColor="#DC2626" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Wokwi Dark Blueprint Grid */}
                  <rect x="0" y="0" width="720" height="430" rx="8" fill="#0B0F19" />
                  <g stroke="#1E293B" strokeWidth="1" opacity="0.65">
                    {[40, 80, 120, 160, 200, 240, 280, 320, 360, 400].map((y) => (
                      <line key={`gy-${y}`} x1="0" y1={y} x2="720" y2={y} />
                    ))}
                    {[60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660].map((x) => (
                      <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2="430" />
                    ))}
                  </g>

                  {/* EXACT WOKWI DIAGRAM.JSON WIRES */}
                  {/* 5V Red Power Bus Wires */}
                  <path
                    d="M 125 145 L 125 168 L 310 168 L 310 355"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2"
                    opacity="0.85"
                  />
                  <path
                    d="M 275 135 L 275 168"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2"
                    opacity="0.85"
                  />
                  <path
                    d="M 505 135 L 505 168 L 310 168"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2"
                    opacity="0.85"
                  />
                  <path
                    d="M 615 280 L 615 385 L 310 385 L 310 355"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2"
                    opacity="0.85"
                  />

                  {/* GND Black Bus Wires */}
                  <path
                    d="M 165 145 L 165 180 L 330 180 L 330 355"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2"
                  />
                  <path
                    d="M 315 135 L 315 180"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2"
                  />
                  <path
                    d="M 655 280 L 655 400 L 330 400 L 330 355"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2"
                  />

                  {/* Signal Green Wires matching diagram.json */}
                  {/* dht1:SDA -> uno:2 */}
                  <path
                    d="M 145 145 L 145 156 L 428 156 L 428 195"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="2.5"
                  />
                  {/* pot1:SIG -> uno:A0 */}
                  <path
                    d="M 295 135 L 295 372 L 385 372 L 385 355"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                  />
                  {/* ldr1:AO -> uno:A1 */}
                  <path
                    d="M 535 135 L 535 376 L 405 376 L 405 355"
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="2.5"
                  />
                  {/* pot2:SIG -> uno:A2 */}
                  <path
                    d="M 635 280 L 635 368 L 425 368 L 425 355"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                  />
                  {/* uno:7 -> led1:A and led1:C -> uno:GND.2 */}
                  <path
                    d="M 365 195 L 365 172 L 130 172 L 130 250"
                    fill="none"
                    stroke={isPumpOn ? '#22C55E' : '#15803D'}
                    strokeWidth={isPumpOn ? '3.5' : '2'}
                  />
                  <path
                    d="M 110 250 L 110 208 L 285 208 L 285 195"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="2"
                  />

                  {/* PART 1: wokwi-dht22 (dht1) */}
                  <g
                    transform="translate(75, 22)"
                    onClick={() => setSelectedPart('dht1')}
                    className="cursor-pointer"
                  >
                    <rect
                      width="120"
                      height="118"
                      rx="8"
                      fill="#F8FAFC"
                      stroke={selectedPart === 'dht1' ? '#38BDF8' : isTempHigh ? '#F97316' : '#CBD5E1'}
                      strokeWidth={selectedPart === 'dht1' ? '3' : '2'}
                    />
                    {/* Perforated sensor vents */}
                    {[20, 32, 44, 56].map((vy) => (
                      <line
                        key={vy}
                        x1="20"
                        y1={vy}
                        x2="100"
                        y2={vy}
                        stroke="#CBD5E1"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                    ))}
                    <text x="60" y="76" textAnchor="middle" className="fill-slate-800 font-mono text-[11px] font-bold">
                      DHT22 (dht1)
                    </text>
                    <text x="60" y="92" textAnchor="middle" className="fill-emerald-700 font-mono text-[11px] font-bold">
                      {liveRecord.temperature}°C · {liveRecord.humidity}%
                    </text>
                    <text x="60" y="108" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">
                      SDA → Pin D2
                    </text>
                    {/* Pins */}
                    <rect x="46" y="118" width="4" height="8" fill="#94A3B8" />
                    <rect x="66" y="118" width="4" height="8" fill="#22C55E" />
                    <rect x="86" y="118" width="4" height="8" fill="#94A3B8" />
                  </g>

                  {/* PART 2: wokwi-potentiometer (pot1 - Soil Moisture A0) */}
                  <g
                    transform="translate(225, 22)"
                    onClick={() => setSelectedPart('pot1')}
                    className="cursor-pointer"
                  >
                    <rect
                      width="140"
                      height="112"
                      rx="8"
                      fill="#1E293B"
                      stroke={selectedPart === 'pot1' ? '#38BDF8' : isSoilDry ? '#F59E0B' : '#475569'}
                      strokeWidth={selectedPart === 'pot1' ? '3' : '2'}
                    />
                    <text x="70" y="18" textAnchor="middle" className="fill-slate-200 font-sans text-[10px] font-semibold">
                      Soil Moisture (pot1)
                    </text>
                    {/* Rotary Dial */}
                    <circle cx="70" cy="54" r="24" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
                    <circle cx="70" cy="54" r="17" fill="#334155" />
                    <g transform={`translate(70, 54) rotate(${pot1Angle})`}>
                      <line x1="0" y1="0" x2="0" y2="-16" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                    </g>
                    <text x="70" y="92" textAnchor="middle" className="fill-sky-400 font-mono text-[11px] font-bold">
                      {liveRecord.soil} ADC {isSoilDry ? '(DRY)' : '(WET)'}
                    </text>
                    <text x="70" y="105" textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">
                      SIG → Pin A0
                    </text>
                  </g>

                  {/* PART 3: wokwi-photoresistor-sensor (ldr1 - Light Intensity A1) */}
                  <g
                    transform="translate(445, 22)"
                    onClick={() => setSelectedPart('ldr1')}
                    className="cursor-pointer"
                  >
                    <rect
                      width="150"
                      height="112"
                      rx="8"
                      fill="#1E3A8A"
                      stroke={selectedPart === 'ldr1' ? '#38BDF8' : '#3B82F6'}
                      strokeWidth={selectedPart === 'ldr1' ? '3' : '2'}
                    />
                    <text x="75" y="18" textAnchor="middle" className="fill-blue-100 font-sans text-[10px] font-semibold">
                      LDR Sensor (ldr1)
                    </text>
                    {/* Photoresistor cell graphic */}
                    <circle cx="75" cy="52" r="20" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
                    <path
                      d="M 63 46 Q 75 40 87 46 Q 63 52 87 58"
                      fill="none"
                      stroke="#B45309"
                      strokeWidth="2"
                    />
                    <text x="75" y="90" textAnchor="middle" className="fill-purple-300 font-mono text-[11px] font-bold">
                      {liveRecord.light} ADC
                    </text>
                    <text x="75" y="104" textAnchor="middle" className="fill-blue-200 font-mono text-[9px]">
                      AO → Pin A1
                    </text>
                  </g>

                  {/* PART 4: wokwi-led (led1 - Red Pump Indicator on Pin 7) */}
                  <g
                    transform="translate(55, 232)"
                    onClick={() => setSelectedPart('led1')}
                    className="cursor-pointer"
                  >
                    <rect
                      width="135"
                      height="122"
                      rx="8"
                      fill="#1E293B"
                      stroke={selectedPart === 'led1' ? '#38BDF8' : isPumpOn ? '#EF4444' : '#475569'}
                      strokeWidth={selectedPart === 'led1' ? '3' : '2'}
                    />
                    <text x="67" y="18" textAnchor="middle" className="fill-slate-200 font-sans text-[10px] font-semibold">
                      Pump Relay LED (led1)
                    </text>
                    {/* Radial Glow when Pump is ON */}
                    {isPumpOn && (
                      <circle cx="67" cy="56" r="36" fill="url(#ledRedGlow)" />
                    )}
                    {/* 5mm Red LED Dome */}
                    <path
                      d="M 53 64 L 53 48 A 14 14 0 0 1 81 48 L 81 64 Z"
                      fill={isPumpOn ? '#EF4444' : '#450A0A'}
                      stroke={isPumpOn ? '#FCA5A5' : '#7F1D1D'}
                      strokeWidth="1.5"
                    />
                    <rect x="50" y="64" width="34" height="5" rx="1" fill={isPumpOn ? '#DC2626' : '#450A0A'} />
                    <text
                      x="67"
                      y="92"
                      textAnchor="middle"
                      className={`font-mono text-[12px] font-bold ${
                        isPumpOn ? 'fill-emerald-400' : 'fill-slate-400'
                      }`}
                    >
                      PUMP: {liveRecord.pump}
                    </text>
                    <text x="67" y="108" textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">
                      Anode → Pin D7
                    </text>
                  </g>

                  {/* PART 5: wokwi-arduino-uno (uno) */}
                  <g
                    transform="translate(245, 195)"
                    onClick={() => setSelectedPart('uno')}
                    className="cursor-pointer"
                  >
                    <rect
                      width="235"
                      height="160"
                      rx="8"
                      fill="#0284C7"
                      stroke={selectedPart === 'uno' ? '#FDE047' : '#38BDF8'}
                      strokeWidth={selectedPart === 'uno' ? '3' : '2'}
                    />
                    <rect x="10" y="10" width="215" height="140" rx="4" fill="#0369A1" />
                    {/* USB Port & Barrel Jack */}
                    <rect x="-6" y="26" width="22" height="32" rx="2" fill="#94A3B8" stroke="#475569" />
                    <rect x="-4" y="105" width="24" height="26" rx="2" fill="#1E293B" stroke="#0F172A" />

                    {/* Top Digital Pin Header Strip */}
                    <rect x="32" y="12" width="175" height="12" fill="#0F172A" />
                    <text x="40" y="21" className="fill-slate-300 font-mono text-[8px]">
                      GND
                    </text>
                    <text x="115" y="21" className="fill-emerald-300 font-mono text-[8px] font-bold">
                      D7:{isPumpOn ? 'HIGH' : 'LOW'}
                    </text>
                    <text x="176" y="21" className="fill-emerald-300 font-mono text-[8px] font-bold">
                      D2:SDA
                    </text>

                    {/* Board Branding */}
                    <text x="122" y="54" textAnchor="middle" className="fill-white font-mono text-[14px] font-bold">
                      ARDUINO UNO
                    </text>
                    <text x="122" y="68" textAnchor="middle" className="fill-sky-200 font-mono text-[9px]">
                      wokwi-arduino-uno (id: uno)
                    </text>

                    {/* Status LEDs (ON, L, TX, RX) */}
                    <circle cx="52" cy="84" r="4" fill="#22C55E" />
                    <text x="60" y="87" className="fill-sky-100 font-mono text-[8px]">
                      ON
                    </text>
                    <circle cx="92" cy="84" r="4" fill={isAutoStreaming ? '#F59E0B' : '#475569'} />
                    <text x="100" y="87" className="fill-sky-100 font-mono text-[8px]">
                      TX/RX 9600
                    </text>

                    {/* ATmega328P DIP Socket */}
                    <rect x="65" y="98" width="125" height="26" rx="2" fill="#0F172A" stroke="#475569" />
                    <text x="127" y="114" textAnchor="middle" className="fill-emerald-400 font-mono text-[9px]">
                      ATmega328P · loop()
                    </text>

                    {/* Bottom Power & Analog Pin Header Strip */}
                    <rect x="45" y="136" width="165" height="12" fill="#0F172A" />
                    <text x="52" y="145" className="fill-rose-400 font-mono text-[8px] font-bold">
                      5V
                    </text>
                    <text x="72" y="145" className="fill-slate-300 font-mono text-[8px]">
                      GND
                    </text>
                    <text x="120" y="145" className="fill-sky-300 font-mono text-[8px] font-bold">
                      A0:{liveRecord.soil}
                    </text>
                    <text x="155" y="145" className="fill-purple-300 font-mono text-[8px] font-bold">
                      A1:{liveRecord.light}
                    </text>
                    <text x="186" y="145" className="fill-blue-300 font-mono text-[8px] font-bold">
                      A2:{liveRecord.water}
                    </text>
                  </g>

                  {/* PART 6: wokwi-potentiometer (pot2 - Water Tank Level A2) */}
                  <g
                    transform="translate(555, 168)"
                    onClick={() => setSelectedPart('pot2')}
                    className="cursor-pointer"
                  >
                    <rect
                      width="140"
                      height="112"
                      rx="8"
                      fill="#1E293B"
                      stroke={selectedPart === 'pot2' ? '#38BDF8' : isWaterLow ? '#EF4444' : '#475569'}
                      strokeWidth={selectedPart === 'pot2' ? '3' : '2'}
                    />
                    <text x="70" y="18" textAnchor="middle" className="fill-slate-200 font-sans text-[10px] font-semibold">
                      Water Level (pot2)
                    </text>
                    {/* Rotary Dial */}
                    <circle cx="70" cy="54" r="24" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
                    <circle cx="70" cy="54" r="17" fill="#334155" />
                    <g transform={`translate(70, 54) rotate(${pot2Angle})`}>
                      <line x1="0" y1="0" x2="0" y2="-16" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
                    </g>
                    <text x="70" y="92" textAnchor="middle" className="fill-blue-400 font-mono text-[11px] font-bold">
                      {liveRecord.water} ADC {isWaterLow ? '(LOW!)' : '(OK)'}
                    </text>
                    <text x="70" y="105" textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">
                      SIG → Pin A2
                    </text>
                  </g>
                </svg>
              </div>

              {/* Direct On-Bench Sliders for All 5 Hardware Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-800">
                <div
                  onClick={() => setSelectedPart('pot1')}
                  className={`p-2 rounded border transition-colors ${
                    selectedPart === 'pot1'
                      ? 'border-sky-500 bg-slate-900'
                      : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  <div className="flex justify-between text-[11px] mb-1">
                    <label htmlFor="sim-soil" className="font-mono text-slate-300">
                      pot1 · Soil A0
                    </label>
                    <span className="font-mono font-bold text-sky-400 tabular-nums">
                      {liveInput.soil}
                    </span>
                  </div>
                  <input
                    id="sim-soil"
                    type="range"
                    min={0}
                    max={1023}
                    value={liveInput.soil}
                    onChange={(e) =>
                      onUpdateLiveInput({ soil: Number(e.target.value) })
                    }
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                <div
                  onClick={() => setSelectedPart('dht1')}
                  className={`p-2 rounded border transition-colors ${
                    selectedPart === 'dht1'
                      ? 'border-emerald-500 bg-slate-900'
                      : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  <div className="flex justify-between text-[11px] mb-1">
                    <label htmlFor="sim-temp" className="font-mono text-slate-300">
                      dht1 · Temp D2
                    </label>
                    <span className="font-mono font-bold text-amber-400 tabular-nums">
                      {liveInput.temperature}°C
                    </span>
                  </div>
                  <input
                    id="sim-temp"
                    type="range"
                    min={10}
                    max={55}
                    value={liveInput.temperature}
                    onChange={(e) =>
                      onUpdateLiveInput({ temperature: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div
                  onClick={() => setSelectedPart('dht1')}
                  className={`p-2 rounded border transition-colors ${
                    selectedPart === 'dht1'
                      ? 'border-emerald-500 bg-slate-900'
                      : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  <div className="flex justify-between text-[11px] mb-1">
                    <label htmlFor="sim-hum" className="font-mono text-slate-300">
                      dht1 · Hum D2
                    </label>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums">
                      {liveInput.humidity}%
                    </span>
                  </div>
                  <input
                    id="sim-hum"
                    type="range"
                    min={20}
                    max={100}
                    value={liveInput.humidity}
                    onChange={(e) =>
                      onUpdateLiveInput({ humidity: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div
                  onClick={() => setSelectedPart('ldr1')}
                  className={`p-2 rounded border transition-colors ${
                    selectedPart === 'ldr1'
                      ? 'border-purple-500 bg-slate-900'
                      : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  <div className="flex justify-between text-[11px] mb-1">
                    <label htmlFor="sim-light" className="font-mono text-slate-300">
                      ldr1 · Light A1
                    </label>
                    <span className="font-mono font-bold text-purple-400 tabular-nums">
                      {liveInput.light}
                    </span>
                  </div>
                  <input
                    id="sim-light"
                    type="range"
                    min={0}
                    max={1023}
                    value={liveInput.light}
                    onChange={(e) =>
                      onUpdateLiveInput({ light: Number(e.target.value) })
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div
                  onClick={() => setSelectedPart('pot2')}
                  className={`p-2 rounded border transition-colors ${
                    selectedPart === 'pot2'
                      ? 'border-blue-500 bg-slate-900'
                      : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  <div className="flex justify-between text-[11px] mb-1">
                    <label htmlFor="sim-water" className="font-mono text-slate-300">
                      pot2 · Water A2
                    </label>
                    <span className="font-mono font-bold text-blue-400 tabular-nums">
                      {liveInput.water}
                    </span>
                  </div>
                  <input
                    id="sim-water"
                    type="range"
                    min={0}
                    max={1023}
                    value={liveInput.water}
                    onChange={(e) =>
                      onUpdateLiveInput({ water: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          {subTab === 'ino' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                <span>arduino-code/agriulture_monitoring.ino</span>
                <span>C++ · Executed by In-App Simulator</span>
              </div>
              <pre className="text-xs font-mono leading-relaxed text-slate-200 overflow-x-auto max-h-[420px]">
                <code>{REPO_ARDUINO_CODE}</code>
              </pre>
            </div>
          )}

          {subTab === 'diagram' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                <span>diagram.json (Wokwi Hardware Topology)</span>
                <span>6 Parts · 13 Pin Connections</span>
              </div>
              <pre className="text-xs font-mono leading-relaxed text-emerald-300 overflow-x-auto max-h-[420px]">
                <code>{REPO_DIAGRAM_JSON}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Selected Part Parameter Popover + Arduino Serial Monitor */}
        <div className="lg:col-span-5 p-4 bg-[#0F172A] text-slate-100 flex flex-col justify-between space-y-4">
          {/* Interactive Component Calibration Box */}
          <div className="border border-slate-800 bg-[#1E293B]/70 rounded-lg p-3.5">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-sky-400">
                  FIRMWARE THRESHOLDS &amp; RELAY CONTROL
                </span>
                <h3 className="text-xs font-semibold text-white">
                  Real-Time Comparator Calibration
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded">
                {(
                  [
                    { mode: 'AUTO', label: 'Auto D7' },
                    { mode: 'FORCE_ON', label: 'Force ON' },
                    { mode: 'FORCE_OFF', label: 'Force OFF' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.mode}
                    type="button"
                    onClick={() => onUpdatePumpMode(m.mode)}
                    className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                      pumpMode === m.mode
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <label htmlFor="bench-thresh-soil" className="text-slate-300">
                    Dry Soil (&gt;ADC)
                  </label>
                  <span className="font-mono text-amber-400 font-semibold tabular-nums">
                    {thresholds.soilThreshold}
                  </span>
                </div>
                <input
                  id="bench-thresh-soil"
                  type="range"
                  min={200}
                  max={850}
                  step={10}
                  value={thresholds.soilThreshold}
                  onChange={(e) =>
                    onUpdateThresholds({ soilThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <label htmlFor="bench-thresh-temp" className="text-slate-300">
                    High Temp (&gt;°C)
                  </label>
                  <span className="font-mono text-orange-400 font-semibold tabular-nums">
                    {thresholds.tempThreshold}°C
                  </span>
                </div>
                <input
                  id="bench-thresh-temp"
                  type="range"
                  min={20}
                  max={50}
                  step={1}
                  value={thresholds.tempThreshold}
                  onChange={(e) =>
                    onUpdateThresholds({ tempThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <label htmlFor="bench-thresh-water" className="text-slate-300">
                    Low Water (&lt;ADC)
                  </label>
                  <span className="font-mono text-rose-400 font-semibold tabular-nums">
                    {thresholds.waterThreshold}
                  </span>
                </div>
                <input
                  id="bench-thresh-water"
                  type="range"
                  min={50}
                  max={500}
                  step={10}
                  value={thresholds.waterThreshold}
                  onChange={(e) =>
                    onUpdateThresholds({
                      waterThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Live Arduino Serial Monitor Console */}
          <div className="flex-1 flex flex-col justify-between border border-slate-800 bg-[#090D16] rounded-lg p-3.5">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  UART SERIAL MONITOR (9600 BAUD)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {serialHistory.length} frames logged
                </span>
              </div>

              <div
                className="font-mono text-xs leading-relaxed space-y-1 max-h-[230px] overflow-y-auto pr-1"
                aria-live="polite"
              >
                <div className="text-emerald-400">
                  🌱 Smart Agriculture Monitoring Started
                </div>
                {currentSerialLines.map((line, index) => {
                  let textColor = 'text-slate-200';
                  if (line.includes('ALERT: Soil is Dry'))
                    textColor = 'text-amber-400 font-semibold';
                  else if (line.includes('ALERT: High Temperature'))
                    textColor = 'text-orange-400 font-semibold';
                  else if (line.includes('ALERT: Low Water Level'))
                    textColor = 'text-rose-400 font-semibold';
                  else if (line.includes('Pump Status: ON'))
                    textColor = 'text-emerald-400 font-semibold';
                  else if (line.startsWith('---')) textColor = 'text-slate-600';

                  return (
                    <div key={index} className={textColor}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={onLogCurrentReading}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors whitespace-nowrap shrink-0"
              >
                Log Current Frame to CSV Table
              </button>
              <span className="text-[11px] font-mono text-slate-400">
                Pin D7 LED: <strong className={isPumpOn ? 'text-rose-400' : 'text-slate-500'}>{isPumpOn ? 'HIGH (5V)' : 'LOW (0V)'}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
