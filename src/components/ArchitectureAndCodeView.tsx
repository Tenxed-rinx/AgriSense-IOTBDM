import React, { useState } from 'react';
import {
  HARDWARE_COMPONENTS,
  REPO_ARDUINO_CODE,
  REPO_MAIN_PY_CODE,
  REPO_STREAMLIT_APP_PY,
  REPO_DIAGRAM_JSON,
} from '../utils/repoFiles';
import { SensorRecord, SensorThresholds } from '../utils/agricultureLogic';

interface ArchitectureAndCodeViewProps {
  liveRecord: SensorRecord;
  thresholds: SensorThresholds;
  totalRowsLogged: number;
  onFocusSimulator?: () => void;
}

export const ArchitectureAndCodeView: React.FC<ArchitectureAndCodeViewProps> = ({
  liveRecord,
  thresholds,
  totalRowsLogged,
  onFocusSimulator,
}) => {
  const [selectedCodeFile, setSelectedCodeFile] = useState<
    'arduino' | 'diagram' | 'main_py' | 'streamlit'
  >('arduino');
  const [copied, setCopied] = useState(false);

  const codeMap = {
    arduino: {
      path: 'arduino-code/agriulture_monitoring.ino',
      lang: 'C++ / Arduino IDE',
      content: REPO_ARDUINO_CODE,
    },
    diagram: {
      path: 'diagram.json',
      lang: 'Wokwi Circuit Topology JSON',
      content: REPO_DIAGRAM_JSON,
    },
    main_py: {
      path: 'main.py',
      lang: 'Python 3 · Pandas CSV Generator',
      content: REPO_MAIN_PY_CODE,
    },
    streamlit: {
      path: 'dashboard/app.py',
      lang: 'Python 3 · Streamlit Dashboard',
      content: REPO_STREAMLIT_APP_PY,
    },
  };

  const activeCode = codeMap[selectedCodeFile];

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activeCode.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const pipelineStages = [
    {
      step: '01. Sensors',
      detail: `pot1 A0 (${liveRecord.soil}) · dht1 D2 (${liveRecord.temperature}°C, ${liveRecord.humidity}%) · ldr1 A1 (${liveRecord.light}) · pot2 A2 (${liveRecord.water})`,
      stateText: '● Polling Active',
    },
    {
      step: '02. Arduino / ESP32',
      detail: '10-bit ADC quantization (0–1023) & digital single-wire frame decoding at 9600 baud',
      stateText: '● 2000ms Loop',
    },
    {
      step: '03. Sensor Data Processing',
      detail: 'Normalizes raw voltage levels and structures telemetry frames for threshold comparator',
      stateText: '● Frame Ready',
    },
    {
      step: '04. Threshold Checking',
      detail: `Soil > ${thresholds.soilThreshold} · Temp > ${thresholds.tempThreshold}°C · Water < ${thresholds.waterThreshold}`,
      stateText:
        liveRecord.alerts.length > 0
          ? `▲ ${liveRecord.alerts.length} Alert(s)`
          : '● Within Bounds',
    },
    {
      step: '05. Pump Decision',
      detail: `Digital Pin D7 LED (led1) set to ${liveRecord.pump === 'ON' ? 'HIGH (5V)' : 'LOW (0V)'}`,
      stateText: liveRecord.pump === 'ON' ? '● Pump ON' : '○ Pump OFF',
    },
    {
      step: '06. Dashboard + Alerts',
      detail:
        liveRecord.alerts.length > 0
          ? liveRecord.alerts.join(' · ')
          : 'No active environmental warnings',
      stateText: '● Visualized',
    },
    {
      step: '07. CSV Data Logging',
      detail: `Persisted to data/sensor_data.csv (${totalRowsLogged} records in active buffer)`,
      stateText: '● Synced',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 7-Stage Architecture Pipeline */}
      <div className="border border-slate-200 bg-white rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 mb-4">
          <div>
            <span className="text-xs font-mono text-slate-500">
              SYSTEM ARCHITECTURE · END-TO-END IOT DATAFLOW
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              7-Stage Smart Agriculture Monitoring Pipeline
            </h2>
          </div>
          {onFocusSimulator && (
            <button
              type="button"
              onClick={onFocusSimulator}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Scroll to In-App Circuit Simulator ↑
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-t border-slate-200 pt-4">
          {pipelineStages.map((st, idx) => (
            <div
              key={st.step}
              className="px-3 py-2 flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] font-mono font-semibold text-slate-400">
                  STAGE 0{idx + 1}
                </div>
                <h3 className="text-xs font-semibold text-slate-900 mt-0.5">
                  {st.step.slice(4)}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  {st.detail}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-700">
                {st.stateText}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Pinout & Specifications Table */}
      <div className="border border-slate-200 bg-white rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            Wokwi Circuit Parts &amp; Pinout Matrix (diagram.json)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Exact part IDs, wire colors, and pin connections simulated in the interactive breadboard above
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono uppercase text-slate-500">
                <th className="py-2.5 px-4">Part ID &amp; Type</th>
                <th className="py-2.5 px-4">Component</th>
                <th className="py-2.5 px-4">Arduino Connection</th>
                <th className="py-2.5 px-4">Wire Colors</th>
                <th className="py-2.5 px-4">Automation Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {HARDWARE_COMPONENTS.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4 font-mono text-slate-700">
                    <strong className="text-slate-900">{item.wokwiId}</strong> · {item.wokwiType}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {item.component}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-emerald-700 font-medium">
                    {item.pin}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600">
                    {item.wireColors}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">
                    {item.thresholdRule}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source Code Inspector */}
      <div className="border border-slate-200 bg-white rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Repository Source Code &amp; Wokwi Diagram Inspector
            </h3>
            <p className="text-xs text-slate-500">
              Complete firmware, Wokwi diagram.json, and Python scripts from Tenxed-rinx/IoT-Smart-Agriculture-Monitoring-System
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedCodeFile('arduino')}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCodeFile === 'arduino'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                agriulture_monitoring.ino
              </button>
              <button
                type="button"
                onClick={() => setSelectedCodeFile('diagram')}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCodeFile === 'diagram'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                diagram.json
              </button>
              <button
                type="button"
                onClick={() => setSelectedCodeFile('main_py')}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCodeFile === 'main_py'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                main.py
              </button>
              <button
                type="button"
                onClick={() => setSelectedCodeFile('streamlit')}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCodeFile === 'streamlit'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                dashboard/app.py
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>
        </div>

        <div className="bg-[#0F172A] text-slate-100 p-4 overflow-x-auto">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2 mb-3">
            <span>{activeCode.path}</span>
            <span>{activeCode.lang}</span>
          </div>
          <pre className="text-xs font-mono leading-relaxed text-slate-200">
            <code>{activeCode.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
