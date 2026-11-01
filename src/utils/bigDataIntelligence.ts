/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SoilType, CropRequirement, CROP_DATABASE } from './soilAgronomyData';

// -------------------------------------------------------------
// 1. Soil Compaction & Hardpan Layer Mapping
// -------------------------------------------------------------
export interface SoilCompactionZone {
  zoneId: string;
  zoneName: string;
  soilType: SoilType;
  topsoilMoistureAdc: number;
  subsoilMoistureAdc: number;
  percolationTimeLagMinutes: number; // Time for water to sink from 15cm to 45cm
  percolationSpeedCmPerHour: number; // Infiltration speed
  compactionIndexPct: number; // 0-100% (High = tractor hardpan layer)
  severity: 'Good Aeration' | 'Moderate Density' | 'Severe Hardpan (Tractor Damaged)';
  recommendedAction: string;
}

export function analyzeSoilCompaction(soilType: SoilType): SoilCompactionZone[] {
  return [
    {
      zoneId: 'ZONE-A',
      zoneName: 'Zone Alpha: High Field Plateau',
      soilType: 'Clay',
      topsoilMoistureAdc: 320,
      subsoilMoistureAdc: 640,
      percolationTimeLagMinutes: 185, // Very slow sinking
      percolationSpeedCmPerHour: 1.2,
      compactionIndexPct: 78,
      severity: 'Severe Hardpan (Tractor Damaged)',
      recommendedAction: 'Deep subsoiler ripper pass needed at 40cm depth; water is pooling on topsoil due to tractor wheel compaction.',
    },
    {
      zoneId: 'ZONE-B',
      zoneName: 'Zone Beta: Central Precision Pivot',
      soilType: 'Silty Loam',
      topsoilMoistureAdc: 390,
      subsoilMoistureAdc: 385,
      percolationTimeLagMinutes: 42,
      percolationSpeedCmPerHour: 4.8,
      compactionIndexPct: 22,
      severity: 'Good Aeration',
      recommendedAction: 'Soil crumb structure is healthy; water sinks uniformly to deep roots.',
    },
    {
      zoneId: 'ZONE-C',
      zoneName: 'Zone Gamma: Lowland Alluvial Valley',
      soilType: 'Black Cotton',
      topsoilMoistureAdc: 340,
      subsoilMoistureAdc: 460,
      percolationTimeLagMinutes: 98,
      percolationSpeedCmPerHour: 2.3,
      compactionIndexPct: 54,
      severity: 'Moderate Density',
      recommendedAction: 'Incorporate organic green manure or gypsum to enhance soil pore macro-channels.',
    },
    {
      zoneId: 'ZONE-D',
      zoneName: 'Zone Delta: Polyhouse / Greenhouse Block',
      soilType: 'Sandy Loam',
      topsoilMoistureAdc: 375,
      subsoilMoistureAdc: 370,
      percolationTimeLagMinutes: 24,
      percolationSpeedCmPerHour: 7.5,
      compactionIndexPct: 12,
      severity: 'Good Aeration',
      recommendedAction: 'Excellent friable soil bed; no compaction resistance.',
    },
  ];
}

// -------------------------------------------------------------
// 2. Cumulative Growing Degree Day (GDD) & Harvest Predictor
// -------------------------------------------------------------
export interface GddPhenologyStage {
  stageName: string;
  gddThreshold: number;
  description: string;
  isCompleted: boolean;
}

export interface GddCropForecast {
  cropId: string;
  cropName: string;
  baseTempC: number;
  accumulatedGdd: number;
  targetMaturityGdd: number;
  pctMaturity: number;
  currentStage: string;
  estimatedDaysToHarvest: number;
  projectedHarvestDate: string;
  pestHatchRisk: 'Low' | 'Moderate (Egg Laying)' | 'High Alert (Larvae Emergence)';
  pestAlertDetails: string;
  stages: GddPhenologyStage[];
}

export function calculateGddForecast(
  crop: CropRequirement,
  currentTemp: number,
  simulatedDaysElapsed: number = 45
): GddCropForecast {
  // Base temperature below which crop does not grow
  let baseTemp = 10;
  let targetGdd = 1400;

  if (crop.category === 'Cereal & Grain') {
    baseTemp = crop.id.includes('wheat') ? 4 : 10;
    targetGdd = crop.id.includes('wheat') ? 1600 : 1350;
  } else if (crop.category === 'Vegetable') {
    baseTemp = 8;
    targetGdd = 950;
  } else if (crop.category === 'Pulse & Legume') {
    baseTemp = 7;
    targetGdd = 1100;
  } else if (crop.category === 'Cash & Fiber') {
    baseTemp = 12;
    targetGdd = 1800;
  }

  // Calculate daily GDD: max((Tavg - Tbase), 0)
  const dailyGdd = Math.max(0, currentTemp - baseTemp);
  // Accumulated over past simulated period
  const accumulated = Math.round(simulatedDaysElapsed * (dailyGdd > 0 ? dailyGdd : 14));
  const pct = Math.min(100, Math.round((accumulated / targetGdd) * 100));

  // Remaining days
  const remainingGdd = Math.max(0, targetGdd - accumulated);
  const daysLeft = dailyGdd > 0 ? Math.ceil(remainingGdd / dailyGdd) : 40;

  // Harvest date calculation
  const harvestDate = new Date();
  harvestDate.setDate(harvestDate.getDate() + daysLeft);
  const dateStr = harvestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Pest emergence modeling: pests hatch at specific thermal GDD thresholds
  let pestHatchRisk: GddCropForecast['pestHatchRisk'] = 'Low';
  let pestAlertDetails = 'No thermal pest threshold reached. Population is dormant.';

  if (accumulated > 450 && accumulated < 750) {
    pestHatchRisk = 'High Alert (Larvae Emergence)';
    pestAlertDetails = `Thermal heat accumulation (${accumulated} GDD) has satisfied bollworm/borer egg incubation. Scout fields for young larvae.`;
  } else if (accumulated >= 750) {
    pestHatchRisk = 'Moderate (Egg Laying)';
    pestAlertDetails = 'Secondary generation moth flights active. Monitor pheromone traps.';
  }

  const stages: GddPhenologyStage[] = [
    {
      stageName: 'Seedling Emergence',
      gddThreshold: Math.round(targetGdd * 0.12),
      description: 'First true leaves emerged, radical taproot anchoring.',
      isCompleted: accumulated >= targetGdd * 0.12,
    },
    {
      stageName: 'Vegetative Canopy & Tillering',
      gddThreshold: Math.round(targetGdd * 0.38),
      description: 'Rapid leaf area expansion and branching.',
      isCompleted: accumulated >= targetGdd * 0.38,
    },
    {
      stageName: 'Anthesis & Flowering',
      gddThreshold: Math.round(targetGdd * 0.65),
      description: 'Floral pollination. Critical moisture sensitivity period.',
      isCompleted: accumulated >= targetGdd * 0.65,
    },
    {
      stageName: 'Grain / Fruit Filling',
      gddThreshold: Math.round(targetGdd * 0.88),
      description: 'Nutrient translocation, sugar accumulation, and starch bulking.',
      isCompleted: accumulated >= targetGdd * 0.88,
    },
    {
      stageName: 'Physiological Harvest Maturity',
      gddThreshold: targetGdd,
      description: 'Crop moisture drop; optimal harvesting window.',
      isCompleted: accumulated >= targetGdd,
    },
  ];

  let currentStage = 'Seedling Emergence';
  for (let i = stages.length - 1; i >= 0; i--) {
    if (stages[i].isCompleted) {
      currentStage = stages[i].stageName;
      break;
    }
  }

  return {
    cropId: crop.id,
    cropName: crop.name,
    baseTempC: baseTemp,
    accumulatedGdd: accumulated,
    targetMaturityGdd: targetGdd,
    pctMaturity: pct,
    currentStage,
    estimatedDaysToHarvest: daysLeft,
    projectedHarvestDate: dateStr,
    pestHatchRisk,
    pestAlertDetails,
    stages,
  };
}

// -------------------------------------------------------------
// 3. Field Water Balance Budgeting (FAO-56 Evapotranspiration Accounting)
// -------------------------------------------------------------
export interface DailyWaterBudget {
  et0MillimetersPerDay: number; // Evaporation + Transpiration in mm
  cropCoefficientKc: number; // Crop factor
  actualCropEtMm: number; // ETc = ET0 * Kc
  litersLostPerAcreDay: number; // 1 mm across 1 acre = ~4047 Liters
  effectiveRainfallMm: number;
  scheduledIrrigationInflowMm: number;
  netWaterDeficitMm: number;
  recommendedPumpDurationHours: number; // Exact pump run time needed
  recommendedPumpDurationMinutes: number;
  flowRateLitersPerHour: number;
}

export function calculateFieldWaterBudget(
  tempC: number,
  humidityPct: number,
  solarAdc: number,
  soilMoistureAdc: number
): DailyWaterBudget {
  // Simplified FAO-56 Penman-Monteith reference ET0
  const solarFraction = solarAdc / 1023;
  const tempFactor = (tempC + 5) / 25;
  const humidityDeficitFactor = (100 - humidityPct) / 60;
  const et0 = Number(Math.max(1.5, Math.min(8.5, 3.2 * solarFraction * tempFactor * humidityDeficitFactor)).toFixed(2));

  const cropKc = 1.05; // Standard vegetative crop coefficient
  const actualCropEt = Number((et0 * cropKc).toFixed(2));

  // 1 mm over 1 acre = 4,046.86 Liters
  const litersLostPerAcre = Math.round(actualCropEt * 4047);

  const effectiveRain = 0.0; // Simulated dry day
  // Moisture deficit
  const soilDryFactor = Math.max(0, (soilMoistureAdc - 400) / 400);
  const netDeficitMm = Number((actualCropEt + soilDryFactor * 3.0).toFixed(2));

  // Assume standard 5HP agricultural borewell drip output ~ 18,000 Liters / hour per acre
  const pumpRateLph = 18000;
  const totalLitersNeeded = netDeficitMm * 4047;
  const totalHours = totalLitersNeeded / pumpRateLph;

  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  return {
    et0MillimetersPerDay: et0,
    cropCoefficientKc: cropKc,
    actualCropEtMm: actualCropEt,
    litersLostPerAcreDay: litersLostPerAcre,
    effectiveRainfallMm: effectiveRain,
    scheduledIrrigationInflowMm: 0,
    netWaterDeficitMm: netDeficitMm,
    recommendedPumpDurationHours: hours,
    recommendedPumpDurationMinutes: minutes,
    flowRateLitersPerHour: pumpRateLph,
  };
}

// -------------------------------------------------------------
// 4. Sensor Drift & Electrode Corrosion Auto-Recalibration
// -------------------------------------------------------------
export interface SensorHealthDiagnostics {
  sensorId: string;
  zoneName: string;
  rawAdcReading: number;
  calibratedAdcReading: number;
  driftOffsetAdc: number;
  electrodeHealthPct: number; // 100% = brand new, <60% = mineral scale/corrosion
  correlationWithNeighborsR: number; // Pearson r (0.0 to 1.0)
  status: 'Healthy & Calibrated' | 'Minor Scale Buildup' | 'Drift Detected (Auto-Corrected)';
  requiresPhysicalCleaning: boolean;
}

export function evaluateSensorFleetDrift(): SensorHealthDiagnostics[] {
  return [
    {
      sensorId: 'NODE-A01',
      zoneName: 'Zone Alpha: High Plateau',
      rawAdcReading: 580,
      calibratedAdcReading: 580,
      driftOffsetAdc: 0,
      electrodeHealthPct: 96,
      correlationWithNeighborsR: 0.98,
      status: 'Healthy & Calibrated',
      requiresPhysicalCleaning: false,
    },
    {
      sensorId: 'NODE-A02',
      zoneName: 'Zone Alpha: High Plateau',
      rawAdcReading: 735,
      calibratedAdcReading: 685,
      driftOffsetAdc: -50,
      electrodeHealthPct: 68,
      correlationWithNeighborsR: 0.74,
      status: 'Drift Detected (Auto-Corrected)',
      requiresPhysicalCleaning: true, // Mineral scale detected
    },
    {
      sensorId: 'NODE-B01',
      zoneName: 'Zone Beta: Central Pivot',
      rawAdcReading: 390,
      calibratedAdcReading: 390,
      driftOffsetAdc: 0,
      electrodeHealthPct: 98,
      correlationWithNeighborsR: 0.99,
      status: 'Healthy & Calibrated',
      requiresPhysicalCleaning: false,
    },
    {
      sensorId: 'NODE-C01',
      zoneName: 'Zone Gamma: Lowland Valley',
      rawAdcReading: 320,
      calibratedAdcReading: 305,
      driftOffsetAdc: -15,
      electrodeHealthPct: 82,
      correlationWithNeighborsR: 0.91,
      status: 'Minor Scale Buildup',
      requiresPhysicalCleaning: false,
    },
  ];
}

// -------------------------------------------------------------
// 5. Off-Peak Electricity & Pump Power Cost Optimizer
// -------------------------------------------------------------
export interface ElectricityWindow {
  windowName: string;
  timeRange: string;
  tariffPerKwh: number; // in local currency (e.g. ₹ or $)
  powerSource: 'Grid (Expensive Peak)' | 'Grid (Off-Peak Night Discount)' | 'On-Farm Solar Array (Zero Cost)';
  recommendedForIrrigation: boolean;
  evaporationPenaltyPct: number; // Afternoon sun causes high loss
}

export interface IrrigationCostPlan {
  currentUnoptimizedCost: number;
  smartOptimizedCost: number;
  moneySavedPercentage: number;
  scheduledPumpWindow: string;
  bestStartTime: string;
  durationString: string;
  solarSelfConsumptionPct: number;
  co2ReductionKg: number;
  windows: ElectricityWindow[];
}

export function calculatePowerCostOptimization(pumpHoursNeeded: number = 2.5): IrrigationCostPlan {
  // 5HP pump uses ~3.73 kW
  const pumpKw = 3.73;
  const totalKwh = pumpKw * pumpHoursNeeded;

  // Peak daytime tariff (12:00 - 17:00): $0.18 / ₹9.0 per kWh + 35% water loss
  const peakRate = 9.0;
  // Night off-peak discount (23:00 - 06:00): $0.06 / ₹3.2 per kWh + zero sun evaporation
  const offPeakRate = 3.2;
  // Solar midday window (09:00 - 11:30): Free solar self-generation
  const solarRate = 0.0;

  const unoptimizedCost = Math.round(totalKwh * peakRate);
  const optimizedCost = Math.round(totalKwh * offPeakRate);
  const moneySaved = Math.round(((unoptimizedCost - optimizedCost) / unoptimizedCost) * 100);

  const windows: ElectricityWindow[] = [
    {
      windowName: 'Early Solar Morning',
      timeRange: '06:30 - 09:30',
      tariffPerKwh: 4.5,
      powerSource: 'On-Farm Solar Array (Zero Cost)',
      recommendedForIrrigation: true,
      evaporationPenaltyPct: 5,
    },
    {
      windowName: 'Peak Daytime Sun (High Cost)',
      timeRange: '11:00 - 16:30',
      tariffPerKwh: 9.0,
      powerSource: 'Grid (Expensive Peak)',
      recommendedForIrrigation: false,
      evaporationPenaltyPct: 35, // 35% of water lost to air
    },
    {
      windowName: 'Night Discount Tariff',
      timeRange: '23:00 - 05:00',
      tariffPerKwh: 3.2,
      powerSource: 'Grid (Off-Peak Night Discount)',
      recommendedForIrrigation: true,
      evaporationPenaltyPct: 0,
    },
  ];

  return {
    currentUnoptimizedCost: unoptimizedCost,
    smartOptimizedCost: optimizedCost,
    moneySavedPercentage: moneySaved,
    scheduledPumpWindow: 'Night Off-Peak Tariff (23:00 - 05:00)',
    bestStartTime: '23:30 Tonight',
    durationString: `${pumpHoursNeeded} Hours`,
    solarSelfConsumptionPct: 45,
    co2ReductionKg: Number((totalKwh * 0.82).toFixed(1)),
    windows,
  };
}
