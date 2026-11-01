import React from 'react';
import {
  AgroSimulationParams,
  SoilType,
  SOIL_TYPES,
  REGIONAL_AGRO_PRESETS,
  calculateVwcPercent,
  calculateVpd,
} from '../utils/soilAgronomyData';
import {
  Layers,
  Thermometer,
  Droplets,
  Sun,
  FlaskConical,
  Sparkles,
  RotateCcw,
  Gauge,
  Waves,
  Zap,
  Info,
  Check,
} from 'lucide-react';

interface SoilUsageSimulatorProps {
  params: AgroSimulationParams;
  onChangeParams: (partial: Partial<AgroSimulationParams>) => void;
  onApplyPreset: (presetName: string, params: AgroSimulationParams) => void;
  onResetToDefaults: () => void;
  onSyncWithHardwareProbe?: () => void;
}

const FARMER_SOIL_LABELS: Record<SoilType, { simpleName: string; easyDesc: string }> = {
  'Clay': {
    simpleName: 'Heavy Clay Soil (Chikni Mitti)',
    easyDesc: 'Holds high water reserves, dense and sticky when wet. Needs adequate drainage.',
  },
  'Sandy Loam': {
    simpleName: 'Sandy Loamy Soil (Retili Balui)',
    easyDesc: 'Porous and airy, drains quickly and warms up fast. Benefits from frequent light irrigation.',
  },
  'Silty Loam': {
    simpleName: 'Rich Fertile Loam (Do-Mat Mitti)',
    easyDesc: 'High-fertility agricultural benchmark. Balanced moisture retention and aeration for most crops.',
  },
  'Black Cotton': {
    simpleName: 'Black Cotton Soil (Kali Mitti)',
    easyDesc: 'Deep clay-rich vertisol with substantial moisture capacity. Excellent for cotton, pulses, and grains.',
  },
  'Red Laterite': {
    simpleName: 'Red Hill Soil (Lal Mitti)',
    easyDesc: 'Porous reddish soil rich in iron oxides. Naturally acidic, well-suited for tea, coffee, and nuts.',
  },
  'Peaty Humus': {
    simpleName: 'Dark Organic Soil (Khaad Bhari Mitti)',
    easyDesc: 'Spongy and dark, rich in decomposed organic humus. High moisture and nutrient retention.',
  },
  'Calcareous Chalk': {
    simpleName: 'Chalky / Lime Soil (Chuna Mitti)',
    easyDesc: 'Permeable limestone-rich soil. Alkaline pH, favored by grapes, lavender, and Mediterranean orchards.',
  },
};

export const SoilUsageSimulator: React.FC<SoilUsageSimulatorProps> = ({
  params,
  onChangeParams,
  onApplyPreset,
  onResetToDefaults,
  onSyncWithHardwareProbe,
}) => {
  const currentSoilInfo = SOIL_TYPES[params.soilType];
  const farmerSoil = FARMER_SOIL_LABELS[params.soilType];
  const vwcPercent = calculateVwcPercent(params.soilMoistureAdc, params.soilType);
  const vpd = calculateVpd(params.temperature, params.humidity);

  // Moisture classification
  const getMoistureTone = () => {
    if (params.soilMoistureAdc < 280) return { label: 'Saturated / Heavy Water', color: 'text-blue-800 bg-blue-50 border-blue-200' };
    if (params.soilMoistureAdc <= currentSoilInfo.fieldCapacityAdc) return { label: 'Optimal Field Capacity', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (params.soilMoistureAdc <= 580) return { label: 'Adequate Moisture', color: 'text-slate-800 bg-slate-100 border-slate-200' };
    if (params.soilMoistureAdc <= currentSoilInfo.wiltingPointAdc) return { label: 'Moisture Deficit (Needs Water Soon)', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { label: 'Wilting Point (Dry)', color: 'text-rose-800 bg-rose-50 border-rose-200' };
  };

  const moistureTone = getMoistureTone();

  const getPhTone = () => {
    if (params.soilPh < 5.8) return { label: 'Acidic (Sour)', color: 'text-amber-800 bg-amber-50' };
    if (params.soilPh <= 7.3) return { label: 'Neutral (Optimal)', color: 'text-emerald-800 bg-emerald-50' };
    return { label: 'Alkaline (Chalky)', color: 'text-purple-800 bg-purple-50' };
  };

  const phTone = getPhTone();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Clean Slate Header */}
      <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Farm Condition Tester</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Test Your Farm &amp; Soil Conditions
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Adjust soil texture, moisture, temperature, and pH below. The system evaluates crop suitability and root-zone water balance in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSyncWithHardwareProbe && (
            <button
              type="button"
              onClick={onSyncWithHardwareProbe}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy Live Sensor Values</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetToDefaults}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Quick Regional Examples Ribbon */}
      <div className="bg-slate-50/70 border-b border-slate-200 px-5 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Regional Agro-Climatic Presets:
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {REGIONAL_AGRO_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onApplyPreset(preset.name, preset.params)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:border-slate-400 text-slate-700 hover:text-slate-900 transition-all text-left shrink-0 shadow-2xs group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-emerald-700">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-500">
                {preset.params.soilType} · {preset.params.temperature}°C · {preset.params.humidity}% RH
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulation Tuning Controls */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Soil & Texture Parameters */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Soil Classification Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Select Soil Type &amp; Texture
              </label>
              <span className="text-[11px] text-slate-600 font-medium">
                Current: {farmerSoil.simpleName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {(Object.keys(SOIL_TYPES) as SoilType[]).map((type) => {
                const info = SOIL_TYPES[type];
                const simple = FARMER_SOIL_LABELS[type];
                const isSelected = params.soilType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChangeParams({ soilType: type })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>{type}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {simple.simpleName.split('(')[1]?.replace(')', '') || simple.easyDesc}
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium mt-1">
                      Drainage: {info.drainageRate.split('/')[0]}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">{farmerSoil.simpleName}:</span>{' '}
                <span>{farmerSoil.easyDesc}</span>
              </div>
            </div>
          </div>

          {/* 2. Soil Moisture Slider */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Soil Moisture &amp; Water Content
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${moistureTone.color}`}>
                  {moistureTone.label}
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {vwcPercent}% Water
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Wet / Flooded</span>
                <span className="font-mono text-[11px] text-slate-700 font-medium">
                  ADC: {params.soilMoistureAdc} / 1023
                </span>
                <span>Dry / Hard</span>
              </div>
              <input
                type="range"
                min="100"
                max="950"
                step="5"
                value={params.soilMoistureAdc}
                onChange={(e) => onChangeParams({ soilMoistureAdc: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Saturated (~{currentSoilInfo.fieldCapacityAdc})</span>
                <span className="font-medium text-emerald-700">Optimal Field Capacity</span>
                <span>Wilting (~{currentSoilInfo.wiltingPointAdc})</span>
              </div>
            </div>
          </div>

          {/* 3. Soil pH & Salinity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* pH */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
                  <span>Soil Reaction (pH)</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  pH {params.soilPh.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="4.5"
                max="8.8"
                step="0.1"
                value={params.soilPh}
                onChange={(e) => onChangeParams({ soilPh: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Acidic (&lt;5.5)</span>
                <span className="font-semibold text-slate-700">Neutral (6.5)</span>
                <span>Alkaline (&gt;7.5)</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Classification: <span className="font-medium text-slate-800">{phTone.label}</span>
              </div>
            </div>

            {/* Salinity */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Waves className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salinity (EC dS/m)</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {params.salinityEc.toFixed(1)} dS/m
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.1"
                value={params.salinityEc}
                onChange={(e) => onChangeParams({ salinityEc: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Low Salt</span>
                <span>Moderate</span>
                <span>High Salt</span>
              </div>
              <div className="text-[11px] text-slate-600">
                {params.salinityEc < 1.5 ? 'Safe for root absorption.' : 'Elevated osmotic stress on root hair.'}
              </div>
            </div>
          </div>

          {/* 4. Plant Nutrients (N-P-K) */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Primary Nutrients (N-P-K)</span>
              <span className="text-[10px] text-slate-500">Parts Per Million (ppm)</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-700">Nitrogen (N)</div>
                <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                  {params.nitrogenPpm} ppm
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="1"
                  value={params.nitrogenPpm}
                  onChange={(e) => onChangeParams({ nitrogenPpm: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-800 mt-1"
                />
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-700">Phosphorus (P)</div>
                <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                  {params.phosphorusPpm} ppm
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={params.phosphorusPpm}
                  onChange={(e) => onChangeParams({ phosphorusPpm: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-800 mt-1"
                />
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-700">Potassium (K)</div>
                <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                  {params.potassiumPpm} ppm
                </div>
                <input
                  type="range"
                  min="30"
                  max="400"
                  step="5"
                  value={params.potassiumPpm}
                  onChange={(e) => onChangeParams({ potassiumPpm: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-800 mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Atmospheric & Weather Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Canopy Weather &amp; Atmosphere
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                VPD: {vpd} kPa
              </span>
            </div>

            {/* Temperature */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Thermometer className="w-4 h-4 text-slate-500" />
                  Air Temperature
                </span>
                <span className="font-mono font-bold text-slate-900">{params.temperature}°C</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="0.5"
                value={params.temperature}
                onChange={(e) => onChangeParams({ temperature: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Cool (15°C)</span>
                <span>Mild (25°C)</span>
                <span>Warm (38°C)</span>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Droplets className="w-4 h-4 text-slate-500" />
                  Relative Humidity
                </span>
                <span className="font-mono font-bold text-slate-900">{params.humidity}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="95"
                step="1"
                value={params.humidity}
                onChange={(e) => onChangeParams({ humidity: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Dry (25%)</span>
                <span>Moderate (55%)</span>
                <span>Humid (85%)</span>
              </div>
            </div>

            {/* Sunlight */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Sun className="w-4 h-4 text-slate-500" />
                  Solar Radiation (LDR)
                </span>
                <span className="font-mono font-bold text-slate-900">{params.lightIntensity} ADC</span>
              </div>
              <input
                type="range"
                min="50"
                max="1023"
                step="10"
                value={params.lightIntensity}
                onChange={(e) => onChangeParams({ lightIntensity: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Overcast / Shade</span>
                <span>Normal Daylight</span>
                <span>Direct Full Sun</span>
              </div>
            </div>

            {/* Water Tank */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Gauge className="w-4 h-4 text-slate-500" />
                  Water Reservoir Supply
                </span>
                <span className="font-mono font-bold text-slate-900">{params.waterLevelAdc} ADC</span>
              </div>
              <input
                type="range"
                min="50"
                max="950"
                step="10"
                value={params.waterLevelAdc}
                onChange={(e) => onChangeParams({ waterLevelAdc: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Low Reserve (&lt;200)</span>
                <span>Half Full</span>
                <span>Abundant Storage</span>
              </div>
            </div>
          </div>

          {/* Clean Sub-surface Profile Diagram */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-white space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Root Zone Hydro-Profile</span>
              <span className="text-emerald-400 text-[11px] font-mono">{params.soilType}</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-between px-3 text-slate-300">
                <span>O-Horizon: Litter &amp; Mulch</span>
                <span className="text-[10px] text-slate-400">0 - 5 cm</span>
              </div>

              <div
                className="h-11 rounded border flex items-center justify-between px-3 transition-all"
                style={{
                  backgroundColor: params.soilMoistureAdc < 300
                    ? '#1e293b'
                    : params.soilMoistureAdc < 550
                    ? '#064e3b'
                    : '#451a03',
                  borderColor: params.soilMoistureAdc < 300
                    ? '#475569'
                    : params.soilMoistureAdc < 550
                    ? '#059669'
                    : '#b45309',
                }}
              >
                <div>
                  <div className="font-bold text-white">A-Horizon: Feeder Roots</div>
                  <div className="text-[10px] text-slate-200">
                    {vwcPercent}% Water · {params.soilMoistureAdc < 300 ? 'Saturated' : params.soilMoistureAdc < 550 ? 'Optimal Aerobic Capillary' : 'High Tension Deficit'}
                  </div>
                </div>
                <span className="text-slate-300 text-[10px]">5 - 30 cm</span>
              </div>

              <div className="h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-between px-3 text-slate-300">
                <div>
                  <span>B-Horizon: Subsoil Bed</span>
                  <span className="text-[10px] text-slate-400 block">
                    Drainage: {currentSoilInfo.drainageRate.split('/')[0]}
                  </span>
                </div>
                <span className="text-slate-400 text-[10px]">30 - 80 cm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
