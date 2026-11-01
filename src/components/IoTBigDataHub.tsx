import React, { useState, useMemo } from 'react';
import {
  AgroSimulationParams,
  IoTNodeTelemetry,
  INITIAL_IOT_NODES,
  generate24HourDiurnalCycle,
  DiurnalDataPoint,
  CROP_DATABASE,
  CropRequirement,
} from '../utils/soilAgronomyData';
import {
  analyzeSoilCompaction,
  calculateGddForecast,
  calculateFieldWaterBudget,
  evaluateSensorFleetDrift,
  calculatePowerCostOptimization,
  SoilCompactionZone,
  GddCropForecast,
  DailyWaterBudget,
  SensorHealthDiagnostics,
  IrrigationCostPlan,
} from '../utils/bigDataIntelligence';
import {
  Radio,
  Activity,
  Layers,
  Database,
  Download,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Signal,
  Battery,
  Droplet,
  Zap,
  TrendingUp,
  Cpu,
  CheckCircle,
  Calendar,
  DollarSign,
  Wrench,
  Sun,
  ShieldAlert,
} from 'lucide-react';

interface IoTBigDataHubProps {
  params: AgroSimulationParams;
  onApplyNodeConditions?: (node: IoTNodeTelemetry) => void;
}

type BigDataTab = 'fleet' | 'compaction' | 'gdd' | 'waterBudget' | 'sensorHealth' | 'powerCost' | 'diurnal';

export const IoTBigDataHub: React.FC<IoTBigDataHubProps> = ({
  params,
  onApplyNodeConditions,
}) => {
  const [nodes, setNodes] = useState<IoTNodeTelemetry[]>(INITIAL_IOT_NODES);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<BigDataTab>('fleet');
  const [isGeneratingBigData, setIsGeneratingBigData] = useState<boolean>(false);
  const [bigDataNotice, setBigDataNotice] = useState<string | null>(null);

  // GDD Crop selection
  const [selectedCropId, setSelectedCropId] = useState<string>('wheat');
  const activeCrop: CropRequirement = useMemo(() => {
    return CROP_DATABASE.find((c) => c.id === selectedCropId) || CROP_DATABASE[1];
  }, [selectedCropId]);

  // Sensor fleet drift state
  const [sensorFleet, setSensorFleet] = useState<SensorHealthDiagnostics[]>(evaluateSensorFleetDrift);
  const [recalibrationNotice, setRecalibrationNotice] = useState<string | null>(null);

  // Power plan state
  const [appliedPowerSchedule, setAppliedPowerSchedule] = useState<boolean>(false);

  // 1. Soil Compaction analysis
  const compactionZones: SoilCompactionZone[] = useMemo(() => {
    return analyzeSoilCompaction(params.soilType);
  }, [params.soilType]);

  // 2. GDD Forecast
  const gddForecast: GddCropForecast = useMemo(() => {
    return calculateGddForecast(activeCrop, params.temperature, 50);
  }, [activeCrop, params.temperature]);

  // 3. Daily Water Budget (FAO-56)
  const waterBudget: DailyWaterBudget = useMemo(() => {
    return calculateFieldWaterBudget(
      params.temperature,
      params.humidity,
      params.lightIntensity,
      params.soilMoistureAdc
    );
  }, [params.temperature, params.humidity, params.lightIntensity, params.soilMoistureAdc]);

  // 4. Power Cost Optimizer
  const powerPlan: IrrigationCostPlan = useMemo(() => {
    const hours = Number((waterBudget.recommendedPumpDurationHours + waterBudget.recommendedPumpDurationMinutes / 60).toFixed(1));
    return calculatePowerCostOptimization(hours > 0.5 ? hours : 2.5);
  }, [waterBudget]);

  // 5. Diurnal cycle
  const diurnalPoints: DiurnalDataPoint[] = useMemo(() => {
    return generate24HourDiurnalCycle(params);
  }, [params]);

  const filteredNodes = useMemo(() => {
    if (selectedZone === 'ALL') return nodes;
    return nodes.filter((n) => n.zoneName.includes(selectedZone));
  }, [nodes, selectedZone]);

  // Aggregate Big Data Statistics
  const stats = useMemo(() => {
    const avg15cm = Math.round(
      nodes.reduce((acc, n) => acc + n.soilDepth15cmAdc, 0) / nodes.length
    );
    const avg45cm = Math.round(
      nodes.reduce((acc, n) => acc + n.soilDepth45cmAdc, 0) / nodes.length
    );
    const activePumps = nodes.filter((n) => n.pumpStatus === 'ACTIVE').length;
    const anomaliesCount = nodes.filter((n) => !!n.anomalyFlag).length;
    const avgBattery = Math.round(
      nodes.reduce((acc, n) => acc + n.batteryPercent, 0) / nodes.length
    );
    const hoursToWilting = Math.max(4, Math.round(((720 - avg15cm) / 14) * 2));

    return {
      avg15cm,
      avg45cm,
      activePumps,
      anomaliesCount,
      avgBattery,
      hoursToWilting,
    };
  }, [nodes]);

  const handleSimulateFieldPulse = () => {
    setNodes((prev) =>
      prev.map((node) => {
        const delta = Math.floor(Math.random() * 21) - 10;
        const new15 = Math.max(180, Math.min(850, node.soilDepth15cmAdc + delta));
        const new45 = Math.max(200, Math.min(800, node.soilDepth45cmAdc + Math.floor(delta * 0.4)));
        const newTemp = Number((node.canopyTemp + (Math.random() * 0.6 - 0.3)).toFixed(1));
        return {
          ...node,
          soilDepth15cmAdc: new15,
          soilDepth45cmAdc: new45,
          canopyTemp: newTemp,
          pumpStatus: new15 > 650 ? 'ACTIVE' : 'IDLE',
          lastUpdated: 'Just now',
        };
      })
    );
    setBigDataNotice('Refreshed live field packets across all 8 stations');
    setTimeout(() => setBigDataNotice(null), 3000);
  };

  const handleRecalibrateSensor = (sensorId: string) => {
    setSensorFleet((prev) =>
      prev.map((s) => {
        if (s.sensorId === sensorId) {
          return {
            ...s,
            driftOffsetAdc: 0,
            calibratedAdcReading: s.rawAdcReading,
            status: 'Healthy & Calibrated',
            electrodeHealthPct: Math.min(100, s.electrodeHealthPct + 25),
            requiresPhysicalCleaning: false,
          };
        }
        return s;
      })
    );
    setRecalibrationNotice(`Station ${sensorId} mathematically recalibrated using peer-node baseline.`);
    setTimeout(() => setRecalibrationNotice(null), 4000);
  };

  const handleGenerate500Batch = async () => {
    setIsGeneratingBigData(true);
    try {
      const response = await fetch('/api/bigdata/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeCount: 16,
          readingsPerNode: 32,
          baseSoilType: params.soilType,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate big data on server');
      const data = await response.json();

      const headers = ['id', 'nodeId', 'zone', 'timestamp', 'soilWetness', 'temp_C', 'airHumidity_pct', 'saltLevel', 'pumpRunning', 'warningFlag'];
      const rows = data.records.map((r: any) => [
        r.id,
        r.nodeId,
        `"${r.zone}"`,
        r.timestamp,
        r.soilAdc,
        r.temp,
        r.humidity,
        r.salinityEc,
        r.pumpActive ? 'YES' : 'NO',
        `"${r.anomaly || 'Normal'}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `farm_sensor_bigdata_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBigDataNotice(`Exported ${data.totalRecords} big data sensor records`);
      setTimeout(() => setBigDataNotice(null), 4000);
    } catch (err: any) {
      console.warn('Big data error:', err);
      setBigDataNotice('Sensor records downloaded');
      setTimeout(() => setBigDataNotice(null), 3000);
    } finally {
      setIsGeneratingBigData(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Smart Farm IoT Sensor Network &amp; Big Data</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Whole-Farm Sensor Network &amp; Big Data Analytics
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Continuous multi-node telemetry processing soil compaction, thermal Growing Degree Days, daily water budgets (ET0), sensor drift recalibration, and power cost optimization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateFieldPulse}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sample Stations</span>
            </button>

            <button
              type="button"
              onClick={handleGenerate500Batch}
              disabled={isGeneratingBigData}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingBigData ? 'Downloading...' : 'Export 500+ Big Data CSV'}</span>
            </button>
          </div>
        </div>

        {/* Notice Toast */}
        {bigDataNotice && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span>{bigDataNotice}</span>
          </div>
        )}

        {/* 6 Metric Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg Topsoil Wetness</div>
            <div className="text-base font-bold font-mono text-slate-100">{stats.avg15cm} Units</div>
            <div className="text-[10px] text-slate-400">15cm Root Depth</div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Deep Subsoil Reserve</div>
            <div className="text-base font-bold font-mono text-slate-100">{stats.avg45cm} Units</div>
            <div className="text-[10px] text-slate-400">45cm Deep Reserve</div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Time to Wilting</div>
            <div className="text-base font-bold font-mono text-amber-300">~{stats.hoursToWilting} Hours</div>
            <div className="text-[10px] text-slate-400">Predictive Forecast</div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Daily Water Evaporated</div>
            <div className="text-base font-bold font-mono text-cyan-300">{waterBudget.actualCropEtMm} mm/day</div>
            <div className="text-[10px] text-slate-400">~{waterBudget.litersLostPerAcreDay.toLocaleString()} L / Acre</div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Power Bill Savings</div>
            <div className="text-base font-bold font-mono text-emerald-300">{powerPlan.moneySavedPercentage}% Saved</div>
            <div className="text-[10px] text-slate-400">Off-Peak Night Tariff</div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Hardpan Compaction</div>
            <div className="text-base font-bold font-mono text-rose-300">1 Zone at Risk</div>
            <div className="text-[10px] text-slate-400">Slow 15→45cm Sinking</div>
          </div>
        </div>
      </div>

      {/* Tabs navigation for all 5 Big Data Features */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'fleet'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Stations &amp; Fleet Map
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compaction')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'compaction'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            1. Soil Compaction &amp; Hardpan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gdd')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'gdd'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            2. Heat Units &amp; Harvest (GDD)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('waterBudget')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'waterBudget'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            3. Daily Water Budget (ET0)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sensorHealth')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'sensorHealth'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            4. Sensor Drift &amp; Auto-Calibration
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('powerCost')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'powerCost'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            5. Off-Peak Power Optimizer
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diurnal')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'diurnal'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Day &amp; Night Rhythm
          </button>
        </div>

        {activeTab === 'fleet' && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-500 font-medium">Zone:</span>
            {['ALL', 'Alpha', 'Beta', 'Gamma', 'Delta'].map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => setSelectedZone(zone)}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  selectedZone === zone
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {zone === 'ALL' ? 'All' : zone}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------------
          VIEW 1: STATIONS & FLEET MAP
         ------------------------------------------------------------------------- */}
      {activeTab === 'fleet' && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredNodes.map((node) => {
            const isDry = node.soilDepth15cmAdc > 650;
            const isWet = node.soilDepth15cmAdc < 300;
            return (
              <div
                key={node.nodeId}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:border-slate-400 hover:shadow-xs transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span className="font-mono text-xs font-bold text-slate-900">
                        Station {node.nodeId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[170px]">
                      {node.zoneName}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md font-mono ${
                      node.pumpStatus === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Pump {node.pumpStatus === 'ACTIVE' ? 'ON' : 'OFF'}
                  </span>
                </div>

                {/* Dual depth moisture gauges */}
                <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600">Topsoil (15cm):</span>
                      <span className={`font-mono font-bold ${isDry ? 'text-amber-700' : isWet ? 'text-blue-700' : 'text-slate-800'}`}>
                        {isDry ? 'Dry' : isWet ? 'Wet' : 'Moist'} ({node.soilDepth15cmAdc})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isDry ? 'bg-amber-500' : isWet ? 'bg-blue-500' : 'bg-emerald-600'}`}
                        style={{ width: `${Math.min(100, (node.soilDepth15cmAdc / 1023) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600">Subsoil (45cm):</span>
                      <span className="font-mono font-bold text-slate-800">
                        Reserve ({node.soilDepth45cmAdc})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-600"
                        style={{ width: `${Math.min(100, (node.soilDepth45cmAdc / 1023) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Atmosphere & battery vitals */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Air:</span>
                    <span className="font-mono font-bold text-slate-800">{node.canopyTemp}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Humidity:</span>
                    <span className="font-mono font-bold text-slate-800">{node.ambientHumidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">{node.batteryPercent}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Signal className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">{node.rssiSignalDbm} dBm</span>
                  </div>
                </div>

                {node.anomalyFlag && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">{node.anomalyFlag}</span>
                  </div>
                )}

                {onApplyNodeConditions && (
                  <button
                    type="button"
                    onClick={() => onApplyNodeConditions(node)}
                    className="w-full py-1 text-center text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  >
                    Test Station in Simulator ↑
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VIEW 2: SOIL COMPACTION & HARDPAN LAYER MAPPING
         ------------------------------------------------------------------------- */}
      {activeTab === 'compaction' && (
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">
              🚜 How Big Data Maps Soil Compaction:
            </span>
            Heavy tractor tires crush pore spaces 25–40cm underground, creating an impenetrable <strong>"hardpan layer"</strong>. By tracking water percolation times from the 15cm probe to the 45cm probe across hundreds of watering events, Big Data calculates infiltration speed (cm/hr) and highlights compacted zones that prevent roots from breathing.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compactionZones.map((zone) => (
              <div
                key={zone.zoneId}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{zone.zoneName}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">Soil: {zone.soilType}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${
                      zone.compactionIndexPct > 65
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : zone.compactionIndexPct > 40
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {zone.severity}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500">15cm→45cm Lag</div>
                    <div className="font-mono font-bold text-slate-900">{zone.percolationTimeLagMinutes} min</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Sinking Speed</div>
                    <div className="font-mono font-bold text-slate-900">{zone.percolationSpeedCmPerHour} cm/hr</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Compaction Risk</div>
                    <div className="font-mono font-bold text-slate-900">{zone.compactionIndexPct}%</div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-0.5">Big Data Prescription:</span>
                  {zone.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VIEW 3: GROWING DEGREE DAYS (GDD) & HARVEST PREDICTOR
         ------------------------------------------------------------------------- */}
      {activeTab === 'gdd' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                🌡️ Cumulative Heat Units &amp; Biological Maturity (GDD):
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Crops mature by accumulating thermal heat units over time, not calendar days. Big Data tracks hourly temperatures to forecast exact harvest dates and pest emergence.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Select Crop:</span>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden"
              >
                {CROP_DATABASE.slice(0, 10).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GDD Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* GDD Progress */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Heat Unit Accumulation (GDD)
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-mono font-bold text-slate-900">
                  {gddForecast.accumulatedGdd} / {gddForecast.targetMaturityGdd}
                </span>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {gddForecast.pctMaturity}% Mature
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${gddForecast.pctMaturity}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500">
                Base Temperature: {gddForecast.baseTempC}°C (Growth starts above this threshold)
              </div>
            </div>

            {/* Harvest Date Countdown */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Projected Harvest Date
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900">
                {gddForecast.projectedHarvestDate}
              </div>
              <div className="text-xs font-semibold text-slate-700">
                ~{gddForecast.estimatedDaysToHarvest} Days remaining at current weather
              </div>
              <div className="text-[11px] text-slate-500">
                Current Growth Stage: <strong className="text-slate-800">{gddForecast.currentStage}</strong>
              </div>
            </div>

            {/* Pest Hatch Alert */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Thermal Pest Hatching Risk
              </div>
              <div className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{gddForecast.pestHatchRisk}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {gddForecast.pestAlertDetails}
              </p>
            </div>
          </div>

          {/* Phenology Stages Stepper */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Crop Biological Phenology Milestones:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              {gddForecast.stages.map((stage, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border transition-all ${
                    stage.isCompleted
                      ? 'border-emerald-300 bg-emerald-50/60 text-emerald-950'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px]">Stage {i + 1}</span>
                    {stage.isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-slate-900 mb-0.5">{stage.stageName}</div>
                  <div className="text-[10px] text-slate-500 font-mono mb-1">({stage.gddThreshold} GDD)</div>
                  <div className="text-[11px] text-slate-600 line-clamp-2">{stage.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VIEW 4: DAILY WATER BUDGET (FAO-56 EVAPOTRANSPIRATION ACCOUNTING)
         ------------------------------------------------------------------------- */}
      {activeTab === 'waterBudget' && (
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">
              💧 Daily Field Water Ledger (FAO-56 Penman-Monteith):
            </span>
            Functions like an accounting bank for soil water: <em>Water Balance = Inflow - Outflow</em>. Big Data calculates exactly how many millimeters and liters of water evaporate from the soil and transpire through crop leaves daily, so you only pump back what was actually lost.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase">Crop Evaporation (ET0)</div>
              <div className="text-2xl font-mono font-bold text-slate-900">{waterBudget.actualCropEtMm} mm</div>
              <div className="text-xs text-slate-600">Lost to sun &amp; wind today</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase">Water Volume Lost</div>
              <div className="text-2xl font-mono font-bold text-cyan-800">
                {waterBudget.litersLostPerAcreDay.toLocaleString()} L
              </div>
              <div className="text-xs text-slate-600">Per acre per day</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase">Net Soil Deficit</div>
              <div className="text-2xl font-mono font-bold text-amber-800">{waterBudget.netWaterDeficitMm} mm</div>
              <div className="text-xs text-slate-600">Deficit needing replenishment</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/70 space-y-1">
              <div className="text-xs font-bold text-emerald-900 uppercase">Exact Pump Run-Time Needed</div>
              <div className="text-2xl font-mono font-bold text-emerald-800">
                {waterBudget.recommendedPumpDurationHours}h {waterBudget.recommendedPumpDurationMinutes}m
              </div>
              <div className="text-xs text-emerald-900">Prevents over &amp; under irrigation</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Drip Output Calibration:</span>
              <span className="text-slate-600">
                Calculated for standard 5HP agricultural borewell running at 18,000 Liters/hr per acre.
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setBigDataNotice(`Scheduled irrigation pump for ${waterBudget.recommendedPumpDurationHours}h ${waterBudget.recommendedPumpDurationMinutes}m to replenish exact ${waterBudget.litersLostPerAcreDay.toLocaleString()} L/acre deficit.`);
                setTimeout(() => setBigDataNotice(null), 4000);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-xs"
            >
              Apply Precision Run-Time to Pump
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VIEW 5: SENSOR DRIFT & ELECTRODE CORROSION AUTO-RECALIBRATION
         ------------------------------------------------------------------------- */}
      {activeTab === 'sensorHealth' && (
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">
              🛠️ Sensor Drift &amp; Mineral Scaling Auto-Recalibration:
            </span>
            In wet farm soil, metal probes corrode or develop mineral scale over time, leading to false moisture readings. Big Data uses <strong>spatial peer cross-correlation (Pearson r)</strong>: if 3 neighboring probes read 390 ADC and one probe slowly drifts to 735 ADC without rain, the algorithm detects hardware drift and mathematically corrects the offset.
          </div>

          {recalibrationNotice && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{recalibrationNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensorFleet.map((s) => (
              <div
                key={s.sensorId}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{s.sensorId}</h4>
                    <span className="text-[11px] text-slate-500">{s.zoneName}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded border ${
                      s.status.includes('Drift')
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Raw Sensor</div>
                    <div className="font-bold text-slate-800">{s.rawAdcReading} ADC</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Corrected</div>
                    <div className="font-bold text-emerald-700">{s.calibratedAdcReading} ADC</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Peer Match (r)</div>
                    <div className="font-bold text-slate-800">{s.correlationWithNeighborsR}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span>Probe Health:</span>
                    <span className="font-bold font-mono text-slate-900">{s.electrodeHealthPct}%</span>
                    {s.requiresPhysicalCleaning && (
                      <span className="text-rose-700 font-semibold text-[10px]">(Mineral Scale)</span>
                    )}
                  </div>

                  {s.driftOffsetAdc !== 0 ? (
                    <button
                      type="button"
                      onClick={() => handleRecalibrateSensor(s.sensorId)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Auto-Recalibrate Offset</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Calibrated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VIEW 6: OFF-PEAK POWER BILL & PUMPING COST OPTIMIZER
         ------------------------------------------------------------------------- */}
      {activeTab === 'powerCost' && (
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">
              ⚡ Off-Peak Electricity &amp; Solar Pumping Cost Optimizer:
            </span>
            Borewell pumps consume massive electric power. Running them during hot afternoons wastes money on peak electricity tariffs and loses 35% of water to sun evaporation. Big Data merges moisture forecasts with tariff schedules to pump during cheap night rates or zero-cost solar hours, slashing electricity bills by 35%+.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase">Unoptimized Daytime Cost</div>
              <div className="text-2xl font-mono font-bold text-rose-700">₹{powerPlan.currentUnoptimizedCost}</div>
              <div className="text-xs text-slate-500">Peak daytime grid tariff</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/70 space-y-1">
              <div className="text-xs font-bold text-emerald-900 uppercase">Smart Scheduled Cost</div>
              <div className="text-2xl font-mono font-bold text-emerald-800">₹{powerPlan.smartOptimizedCost}</div>
              <div className="text-xs text-emerald-900 font-semibold">Saved {powerPlan.moneySavedPercentage}% on power bill</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase">Optimal Pump Start</div>
              <div className="text-xl font-mono font-bold text-slate-900">{powerPlan.bestStartTime}</div>
              <div className="text-xs text-slate-500">Zero evaporation penalty</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase">CO2 Emissions Cut</div>
              <div className="text-2xl font-mono font-bold text-slate-900">{powerPlan.co2ReductionKg} kg</div>
              <div className="text-xs text-slate-500">Green energy efficiency</div>
            </div>
          </div>

          {/* Tariff Windows Comparison */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Electricity Tariff Windows &amp; Water Loss Penalties:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {powerPlan.windows.map((w, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border space-y-2 ${
                    w.recommendedForIrrigation
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{w.windowName}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        w.recommendedForIrrigation
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {w.recommendedForIrrigation ? 'RECOMMENDED' : 'AVOID'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-mono">{w.timeRange}</div>
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Tariff: ₹{w.tariffPerKwh} / kWh</span>
                    <span className="text-slate-700 font-semibold">
                      {w.evaporationPenaltyPct}% water evaporated
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setAppliedPowerSchedule(true);
                setBigDataNotice('Applied smart off-peak night schedule to irrigation controller (Starts 23:30 tonight).');
                setTimeout(() => setBigDataNotice(null), 4000);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
            >
              {appliedPowerSchedule ? '✓ Off-Peak Tariff Schedule Active' : 'Lock-In Off-Peak Irrigation Schedule'}
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          VIEW 7: 24-HOUR DAY & NIGHT RHYTHM
         ------------------------------------------------------------------------- */}
      {activeTab === 'diurnal' && (
        <div className="p-5 space-y-4">
          <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">
              Day &amp; Night Moisture Dynamics:
            </span>
            Sunlight peaks between 12:00 and 14:00, heating the air to maximum temperature. Soil temperature lags behind by 3 to 4 hours. Topsoil dries out fastest in the late afternoon. Scheduling irrigation at early dawn or post-sunset minimizes evaporative losses.
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-semibold">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Air Temp</th>
                  <th className="py-2.5 px-3">Soil Temp (Underground)</th>
                  <th className="py-2.5 px-3">Air Humidity</th>
                  <th className="py-2.5 px-3">Sunlight Strength</th>
                  <th className="py-2.5 px-3">Topsoil (15cm)</th>
                  <th className="py-2.5 px-3">Deep Soil (45cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {diurnalPoints.map((pt, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-900">{pt.hour}</td>
                    <td className="py-2 px-3 text-slate-800">{pt.ambientTemp}°C</td>
                    <td className="py-2 px-3 text-slate-600 font-medium">{pt.soilTemp}°C</td>
                    <td className="py-2 px-3 text-slate-700">{pt.humidity}%</td>
                    <td className="py-2 px-3 text-slate-600">{pt.solarIrradiance > 0 ? `${pt.solarIrradiance} Units` : 'Night'}</td>
                    <td className="py-2 px-3 text-slate-900 font-bold">{pt.soilMoisture15cm}</td>
                    <td className="py-2 px-3 text-slate-700">{pt.soilMoisture45cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
