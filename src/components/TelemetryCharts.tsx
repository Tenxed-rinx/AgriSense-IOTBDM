import React, { useState } from 'react';
import { SensorRecord, SensorThresholds } from '../utils/agricultureLogic';

interface TelemetryChartsProps {
  records: SensorRecord[];
  thresholds: SensorThresholds;
  selectedRecordId?: string;
  onSelectRecord?: (rec: SensorRecord) => void;
}

interface SingleChartConfig {
  id: string;
  title: string;
  subtitle: string;
  pinLabel: string;
  unit: string;
  minVal: number;
  maxVal: number;
  thresholdVal?: number;
  thresholdLabel?: string;
  thresholdDirection?: 'above' | 'below';
  strokeColor: string;
  fillColor: string;
  getValue: (r: SensorRecord) => number;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({
  records,
  thresholds,
  selectedRecordId,
  onSelectRecord,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'all' | 'core' | 'auxiliary'>('all');

  // Display up to last 25 records in charts for crisp legibility
  const displayRecords = records.slice(-25);

  const chartConfigs: SingleChartConfig[] = [
    {
      id: 'soil-chart',
      title: 'Soil Moisture Resistance',
      subtitle: 'Higher ADC indicates drier soil substrate · Triggers Relay D7 when above threshold',
      pinLabel: 'PIN A0 · 10-BIT ADC',
      unit: 'ADC',
      minVal: 0,
      maxVal: 1000,
      thresholdVal: thresholds.soilThreshold,
      thresholdLabel: `Dry Threshold (${thresholds.soilThreshold} ADC)`,
      thresholdDirection: 'above',
      strokeColor: '#0284C7',
      fillColor: 'rgba(2, 132, 199, 0.10)',
      getValue: (r) => r.soil,
    },
    {
      id: 'temp-chart',
      title: 'Ambient Air Temperature',
      subtitle: 'DHT22 digital thermistor reading · Triggers thermal alert above threshold',
      pinLabel: 'PIN D2 · DHT22',
      unit: '°C',
      minVal: 10,
      maxVal: 55,
      thresholdVal: thresholds.tempThreshold,
      thresholdLabel: `High Temp (${thresholds.tempThreshold} °C)`,
      thresholdDirection: 'above',
      strokeColor: '#D97706',
      fillColor: 'rgba(217, 119, 6, 0.10)',
      getValue: (r) => r.temperature,
    },
    {
      id: 'humidity-chart',
      title: 'Relative Air Humidity',
      subtitle: 'DHT22 capacitive humidity telemetry across sampling intervals',
      pinLabel: 'PIN D2 · DHT22',
      unit: '%',
      minVal: 20,
      maxVal: 100,
      strokeColor: '#0D9488',
      fillColor: 'rgba(13, 148, 136, 0.10)',
      getValue: (r) => r.humidity,
    },
    {
      id: 'water-light-chart',
      title: 'Reservoir Water Level',
      subtitle: 'Tank depth sensor on A2 · Triggers low reservoir warning below threshold',
      pinLabel: 'PIN A2 · 10-BIT ADC',
      unit: 'ADC',
      minVal: 0,
      maxVal: 900,
      thresholdVal: thresholds.waterThreshold,
      thresholdLabel: `Low Tank (${thresholds.waterThreshold} ADC)`,
      thresholdDirection: 'below',
      strokeColor: '#2563EB',
      fillColor: 'rgba(37, 99, 235, 0.10)',
      getValue: (r) => r.water,
    },
  ];

  const visibleCharts = chartConfigs.filter((c) => {
    if (activeChartTab === 'core') {
      return c.id === 'soil-chart' || c.id === 'temp-chart' || c.id === 'humidity-chart';
    }
    if (activeChartTab === 'auxiliary') {
      return c.id === 'water-light-chart' || c.id === 'soil-chart';
    }
    return true;
  });

  if (displayRecords.length === 0) {
    return (
      <div className="border border-slate-200 bg-white p-8 text-center rounded-lg">
        <p className="text-sm font-medium text-slate-700">No sensor records available to plot.</p>
        <p className="text-xs text-slate-500 mt-1">
          Use the hardware simulator or click &ldquo;Generate Batch (10 Rows)&rdquo; to populate telemetry series.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Multi-Channel Sensor Time-Series
          </h2>
          <p className="text-xs text-slate-500">
            Showing {displayRecords.length} recent samples · Hover any node to inspect cross-channel telemetry
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveChartTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeChartTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 4 Channels
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('core')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeChartTab === 'core'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Streamlit Trio (Soil · Temp · Humidity)
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('auxiliary')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeChartTab === 'auxiliary'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Irrigation & Reservoir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {visibleCharts.map((cfg) => {
          const width = 560;
          const height = 195;
          const padLeft = 42;
          const padRight = 18;
          const padTop = 18;
          const padBottom = 28;
          const plotW = width - padLeft - padRight;
          const plotH = height - padTop - padBottom;

          const toX = (idx: number) => {
            if (displayRecords.length <= 1) return padLeft + plotW / 2;
            return padLeft + (idx / (displayRecords.length - 1)) * plotW;
          };

          const toY = (val: number) => {
            const clamped = Math.max(cfg.minVal, Math.min(cfg.maxVal, val));
            const ratio = (clamped - cfg.minVal) / (cfg.maxVal - cfg.minVal || 1);
            return padTop + plotH - ratio * plotH;
          };

          const points = displayRecords.map((rec, i) => ({
            x: toX(i),
            y: toY(cfg.getValue(rec)),
            val: cfg.getValue(rec),
            rec,
          }));

          const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
          const areaPath =
            points.length > 1
              ? `M ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ` +
                points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ') +
                ` L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
              : '';

          const activePoint =
            hoveredIndex !== null && points[hoveredIndex]
              ? points[hoveredIndex]
              : points[points.length - 1];

          const thresholdY =
            cfg.thresholdVal !== undefined ? toY(cfg.thresholdVal) : null;

          const isViolating =
            cfg.thresholdVal !== undefined &&
            ((cfg.thresholdDirection === 'above' &&
              activePoint.val > cfg.thresholdVal) ||
              (cfg.thresholdDirection === 'below' &&
                activePoint.val < cfg.thresholdVal));

          return (
            <div
              key={cfg.id}
              className="border border-slate-200 bg-white rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>{cfg.pinLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {isViolating ? (
                        <span className="text-amber-700 font-semibold">▲ Threshold Exceeded</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">● Nominal</span>
                      )}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                    {cfg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cfg.subtitle}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                    {activePoint.val}
                    <span className="text-xs font-mono uppercase text-slate-400 ml-1">
                      {cfg.unit}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                    Sample #{hoveredIndex !== null ? hoveredIndex + 1 : displayRecords.length}
                  </div>
                </div>
              </div>

              <div className="relative w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-44 select-none cursor-crosshair"
                  role="img"
                  aria-label={`${cfg.title} time-series chart`}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Horizontal Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((step) => {
                    const y = padTop + step * plotH;
                    const labelVal = Math.round(
                      cfg.maxVal - step * (cfg.maxVal - cfg.minVal)
                    );
                    return (
                      <g key={step}>
                        <line
                          x1={padLeft}
                          y1={y}
                          x2={width - padRight}
                          y2={y}
                          stroke="#E2E8F0"
                          strokeWidth="1"
                        />
                        <text
                          x={padLeft - 6}
                          y={y + 3}
                          textAnchor="end"
                          className="fill-slate-400 font-mono text-[10px]"
                        >
                          {labelVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Threshold Reference Line */}
                  {thresholdY !== null && (
                    <g>
                      <line
                        x1={padLeft}
                        y1={thresholdY}
                        x2={width - padRight}
                        y2={thresholdY}
                        stroke="#DC2626"
                        strokeWidth="1.25"
                        strokeDasharray="4 4"
                      />
                      <rect
                        x={width - padRight - 148}
                        y={Math.max(padTop + 1, thresholdY - 14)}
                        width="146"
                        height="13"
                        rx="2"
                        fill="#FFFFFF"
                        fillOpacity="0.88"
                      />
                      <text
                        x={width - padRight - 4}
                        y={Math.max(padTop + 10, thresholdY - 4)}
                        textAnchor="end"
                        className="fill-rose-600 font-mono text-[10px] font-medium"
                      >
                        {cfg.thresholdLabel}
                      </text>
                    </g>
                  )}

                  {/* Area under curve */}
                  {areaPath && <path d={areaPath} fill={cfg.fillColor} />}

                  {/* Main Line */}
                  {points.length > 1 && (
                    <polyline
                      fill="none"
                      stroke={cfg.strokeColor}
                      strokeWidth="2"
                      points={polylinePoints}
                    />
                  )}

                  {/* Hovered Crosshair Line */}
                  {hoveredIndex !== null && points[hoveredIndex] && (
                    <line
                      x1={points[hoveredIndex].x}
                      y1={padTop}
                      x2={points[hoveredIndex].x}
                      y2={padTop + plotH}
                      stroke="#64748B"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Data Nodes */}
                  {points.map((pt, i) => {
                    const isSelected = pt.rec.id === selectedRecordId;
                    const isHovered = hoveredIndex === i;
                    const nodeViolating =
                      cfg.thresholdVal !== undefined &&
                      ((cfg.thresholdDirection === 'above' &&
                        pt.val > cfg.thresholdVal) ||
                        (cfg.thresholdDirection === 'below' &&
                          pt.val < cfg.thresholdVal));

                    return (
                      <g
                        key={pt.rec.id}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onClick={() => onSelectRecord?.(pt.rec)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered || isSelected ? 5.5 : 3.5}
                          fill={nodeViolating ? '#DC2626' : cfg.strokeColor}
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                        {/* Larger hit target */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={12}
                          fill="transparent"
                        />
                      </g>
                    );
                  })}

                  {/* X-Axis Indices */}
                  {points.map((pt, i) => {
                    if (
                      i === 0 ||
                      i === points.length - 1 ||
                      i % Math.max(1, Math.floor(points.length / 5)) === 0
                    ) {
                      return (
                        <text
                          key={`x-${pt.rec.id}`}
                          x={pt.x}
                          y={height - 6}
                          textAnchor="middle"
                          className="fill-slate-400 font-mono text-[10px]"
                        >
                          #{i + 1}
                        </text>
                      );
                    }
                    return null;
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-100 pt-2 mt-1">
                <span>
                  Timestamp: {activePoint.rec.timestamp.slice(11, 19)}
                </span>
                <span>
                  Pump D7: <strong className={activePoint.rec.pump === 'ON' ? 'text-emerald-700' : 'text-slate-700'}>{activePoint.rec.pump}</strong> · Light A1: {activePoint.rec.light} ADC
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
