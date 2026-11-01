import React, { useState } from 'react';
import {
  SensorRecord,
  RawSensorInput,
  validateManualReadingInput,
} from '../utils/agricultureLogic';

interface CsvDataExplorerProps {
  records: SensorRecord[];
  onAddManualRecord: (input: RawSensorInput) => void;
  onGenerateBatch: (count: number) => void;
  onResetToRepoDefault: () => void;
  onClearAll: () => void;
  onExportCsv: () => void;
  onImportCsvText: (csvText: string) => void;
  onDeleteRecord: (id: string) => void;
}

export const CsvDataExplorer: React.FC<CsvDataExplorerProps> = ({
  records,
  onAddManualRecord,
  onGenerateBatch,
  onResetToRepoDefault,
  onClearAll,
  onExportCsv,
  onImportCsvText,
  onDeleteRecord,
}) => {
  const [filterAlert, setFilterAlert] = useState<string>('ALL');
  const [filterPump, setFilterPump] = useState<'ALL' | 'ON' | 'OFF'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Manual entry form state
  const [manualSoil, setManualSoil] = useState<string>('640');
  const [manualTemp, setManualTemp] = useState<string>('36');
  const [manualHumidity, setManualHumidity] = useState<string>('58');
  const [manualLight, setManualLight] = useState<string>('480');
  const [manualWater, setManualWater] = useState<string>('320');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Optional raw CSV preview/import drawer
  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);
  const [csvImportBuffer, setCsvImportBuffer] = useState<string>('');

  const filteredRecords = records.filter((r) => {
    if (filterPump !== 'ALL' && r.pump !== filterPump) return false;
    if (filterAlert !== 'ALL') {
      if (filterAlert === 'NOMINAL' && r.alerts.length > 0) return false;
      if (
        filterAlert !== 'NOMINAL' &&
        !r.alerts.some((a) => a === filterAlert)
      ) {
        return false;
      }
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const hay = `${r.timestamp} ${r.soil} ${r.temperature} ${r.humidity} ${r.light} ${r.water} ${r.pump} ${r.alertsText}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const validation = validateManualReadingInput({
      soil: manualSoil,
      temperature: manualTemp,
      humidity: manualHumidity,
      light: manualLight,
      water: manualWater,
    });

    if (!validation.valid || !validation.parsed) {
      setFormError(validation.error || 'Invalid sensor input.');
      return;
    }

    onAddManualRecord(validation.parsed);
    setFormSuccess(
      `Logged reading (Soil ${validation.parsed.soil} ADC, Temp ${validation.parsed.temperature}°C)`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Generator Bar */}
      <div className="border border-slate-200 bg-white rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-slate-500">
              DATA PIPELINE · data/sensor_data.csv
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              CSV Sensor Data Logger &amp; Batch Simulator (main.py)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Seeded with the 10 canonical rows from the repository · Append new readings or run the Python 10-row batch generator
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onGenerateBatch(10)}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Run main.py (+10 Simulated Rows)
            </button>
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-2 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Download sensor_data.csv
            </button>
            <button
              type="button"
              onClick={() => setShowCsvModal((prev) => !prev)}
              className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              {showCsvModal ? 'Hide CSV Import' : 'Import CSV Text'}
            </button>
            <button
              type="button"
              onClick={onResetToRepoDefault}
              className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Reset to Repo 10 Rows
            </button>
          </div>
        </div>

        {showCsvModal && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <label
              htmlFor="csv-import-textarea"
              className="block text-xs font-semibold text-slate-700"
            >
              Paste CSV content matching Timestamp,Soil,Temperature,Humidity,Light,Water,Pump,Alerts:
            </label>
            <textarea
              id="csv-import-textarea"
              rows={4}
              value={csvImportBuffer}
              onChange={(e) => setCsvImportBuffer(e.target.value)}
              placeholder="Timestamp,Soil,Temperature,Humidity,Light,Water,Pump,Alerts&#10;2026-06-15 13:59:04.592434,720,38,62,450,120,ON,&quot;Dry Soil, High Temperature, Low Water Level&quot;"
              className="w-full rounded-md border border-slate-300 p-2.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (csvImportBuffer.trim()) {
                    onImportCsvText(csvImportBuffer);
                    setCsvImportBuffer('');
                    setShowCsvModal(false);
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Parse &amp; Load CSV Rows
              </button>
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Sensor Entry Form */}
      <form
        onSubmit={handleManualSubmit}
        noValidate
        className="border border-slate-200 bg-white rounded-lg p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Log Custom Sensor Sample
          </h3>
          <span className="text-xs text-slate-500">
            Valid ranges: Soil 0–1023 ADC · Temp -10–80°C · Humidity 0–100% · Light 0–1023 ADC · Water 0–1023 ADC
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label
              htmlFor="manual-soil-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Soil Moisture (ADC)
            </label>
            <input
              id="manual-soil-input"
              type="number"
              value={manualSoil}
              onChange={(e) => setManualSoil(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="manual-temp-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Temperature (°C)
            </label>
            <input
              id="manual-temp-input"
              type="number"
              value={manualTemp}
              onChange={(e) => setManualTemp(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="manual-humidity-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Humidity (%)
            </label>
            <input
              id="manual-humidity-input"
              type="number"
              value={manualHumidity}
              onChange={(e) => setManualHumidity(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="manual-light-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Light LDR (ADC)
            </label>
            <input
              id="manual-light-input"
              type="number"
              value={manualLight}
              onChange={(e) => setManualLight(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="manual-water-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Water Tank (ADC)
            </label>
            <input
              id="manual-water-input"
              type="number"
              value={manualWater}
              onChange={(e) => setManualWater(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Append Row to CSV
            </button>
          </div>
        </div>

        {formError && (
          <p role="alert" className="text-xs font-medium text-rose-600 mt-2">
            ✖ {formError}
          </p>
        )}
        {formSuccess && (
          <p className="text-xs font-medium text-emerald-700 mt-2">
            ● {formSuccess}
          </p>
        )}
      </form>

      {/* Filter & Data Grid Section */}
      <div className="border border-slate-200 bg-white rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Alert Filter Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {[
                { key: 'ALL', label: 'All Rows' },
                { key: 'Dry Soil', label: 'Dry Soil' },
                { key: 'High Temperature', label: 'High Temp' },
                { key: 'Low Water Level', label: 'Low Water' },
                { key: 'NOMINAL', label: 'Nominal Only' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterAlert(tab.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filterAlert === tab.key
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Pump State Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['ALL', 'ON', 'OFF'] as const).map((pState) => (
                <button
                  key={pState}
                  type="button"
                  onClick={() => setFilterPump(pState)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filterPump === pState
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pump: {pState}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="csv-search" className="sr-only">
              Search CSV records
            </label>
            <input
              id="csv-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by value or alert..."
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {records.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Clear Table
              </button>
            )}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-800">
              No matching sensor records found.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Reset active filters or generate a new 10-row simulation batch.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterAlert('ALL');
                  setFilterPump('ALL');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={onResetToRepoDefault}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Restore Repo Dataset (10 Rows)
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono uppercase text-slate-500">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Soil (A0)</th>
                  <th className="py-2.5 px-3 text-right">Temp (°C)</th>
                  <th className="py-2.5 px-3 text-right">Humidity (%)</th>
                  <th className="py-2.5 px-3 text-right">Light (A1)</th>
                  <th className="py-2.5 px-3 text-right">Water (A2)</th>
                  <th className="py-2.5 px-3">Pump (D7)</th>
                  <th className="py-2.5 px-3">Alerts</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-mono tabular-nums">
                {filteredRecords.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {row.timestamp}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-semibold ${
                        row.alerts.includes('Dry Soil')
                          ? 'text-amber-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {row.soil}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-semibold ${
                        row.alerts.includes('High Temperature')
                          ? 'text-orange-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {row.temperature}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {row.humidity}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {row.light}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-semibold ${
                        row.alerts.includes('Low Water Level')
                          ? 'text-rose-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {row.water}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {row.pump === 'ON' ? (
                        <span className="font-semibold text-emerald-700">
                          ● ON
                        </span>
                      ) : (
                        <span className="text-slate-500">○ OFF</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {row.alerts.length === 0 ? (
                        <span className="text-slate-400">● Nominal</span>
                      ) : (
                        <span className="text-amber-800 font-medium">
                          ▲ {row.alerts.join(' · ')}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(row.id)}
                        aria-label={`Delete row ${idx + 1} (${row.timestamp})`}
                        className="text-slate-400 hover:text-rose-600 font-sans text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
