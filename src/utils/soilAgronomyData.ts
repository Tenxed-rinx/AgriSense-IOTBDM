/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SoilType =
  | 'Clay'
  | 'Sandy Loam'
  | 'Silty Loam'
  | 'Black Cotton'
  | 'Red Laterite'
  | 'Peaty Humus'
  | 'Calcareous Chalk';

export interface SoilTypeInfo {
  id: SoilType;
  name: string;
  texture: string;
  waterHoldingCapacity: 'Very High' | 'High' | 'Moderate' | 'Low';
  drainageRate: 'Slow / Poor' | 'Moderate' | 'Rapid' | 'Excessive';
  aeration: 'Restricted' | 'Good' | 'Excellent' | 'Moderate';
  typicalPh: number;
  cec: string; // Cation Exchange Capacity
  adcToVwcFactor: number; // Conversion factor for raw ADC to Volumetric Water Content %
  description: string;
  fieldCapacityAdc: number;
  wiltingPointAdc: number;
}

export const SOIL_TYPES: Record<SoilType, SoilTypeInfo> = {
  'Clay': {
    id: 'Clay',
    name: 'Clay Soil (Heavy / Fine)',
    texture: 'Dense, sticky when wet, hard when dry. High plasticity.',
    waterHoldingCapacity: 'Very High',
    drainageRate: 'Slow / Poor',
    aeration: 'Restricted',
    typicalPh: 6.8,
    cec: 'High (25-40 meq/100g)',
    adcToVwcFactor: 0.055, // Moisture retains easily, high water per ADC unit
    description: 'Binds moisture tightly with low percolation. Prone to waterlogging, root asphyxiation, and surface crusting under flood irrigation.',
    fieldCapacityAdc: 420,
    wiltingPointAdc: 720,
  },
  'Sandy Loam': {
    id: 'Sandy Loam',
    name: 'Sandy Loam (Light / Porous)',
    texture: 'Gritty, loose, friable crumb structure with rapid infiltration.',
    waterHoldingCapacity: 'Low',
    drainageRate: 'Rapid',
    aeration: 'Excellent',
    typicalPh: 6.2,
    cec: 'Low to Medium (8-15 meq/100g)',
    adcToVwcFactor: 0.038,
    description: 'Warms quickly in spring and provides outstanding root aeration. Requires frequent light irrigation and nutrient supplementation due to leaching.',
    fieldCapacityAdc: 350,
    wiltingPointAdc: 650,
  },
  'Silty Loam': {
    id: 'Silty Loam',
    name: 'Silty Loam (Rich Alluvial)',
    texture: 'Smooth, floury texture, highly fertile with balanced pore space.',
    waterHoldingCapacity: 'High',
    drainageRate: 'Moderate',
    aeration: 'Good',
    typicalPh: 6.5,
    cec: 'High (18-28 meq/100g)',
    adcToVwcFactor: 0.048,
    description: 'The agricultural gold standard. Balanced water retention and capillary action, ideal for vegetables, grains, and deep taproot crops.',
    fieldCapacityAdc: 390,
    wiltingPointAdc: 690,
  },
  'Black Cotton': {
    id: 'Black Cotton',
    name: 'Black Cotton Soil (Vertisol)',
    texture: 'Montmorillonite clay-rich, dark, deep shrink-swell cracking.',
    waterHoldingCapacity: 'Very High',
    drainageRate: 'Slow / Poor',
    aeration: 'Moderate',
    typicalPh: 7.6,
    cec: 'Very High (40-60 meq/100g)',
    adcToVwcFactor: 0.058,
    description: 'Classic semi-arid subtropical soil. Enormous moisture retention capacity, ideal for cotton, pulses, and sorghum, but develops deep drying fissures.',
    fieldCapacityAdc: 440,
    wiltingPointAdc: 740,
  },
  'Red Laterite': {
    id: 'Red Laterite',
    name: 'Red Laterite (Iron/Aluminum Oxides)',
    texture: 'Porous, well-aggregated, reddish due to ferric oxides.',
    waterHoldingCapacity: 'Moderate',
    drainageRate: 'Moderate',
    aeration: 'Good',
    typicalPh: 5.4,
    cec: 'Low (5-12 meq/100g)',
    adcToVwcFactor: 0.042,
    description: 'Common in tropical highlands. Acidic with high phosphorus fixation. Requires liming, organic mulches, and targeted P fertilization for non-acidophiles.',
    fieldCapacityAdc: 370,
    wiltingPointAdc: 670,
  },
  'Peaty Humus': {
    id: 'Peaty Humus',
    name: 'Peaty / Organic Muck Soil',
    texture: 'Spongy, dark, rich in decomposed organic matter (>20%).',
    waterHoldingCapacity: 'Very High',
    drainageRate: 'Slow / Poor',
    aeration: 'Moderate',
    typicalPh: 4.8,
    cec: 'Extremely High (>80 meq/100g)',
    adcToVwcFactor: 0.062,
    description: 'Acidic, sponge-like moisture sponge. Exceptional for berries, acidophilic vegetables, and brassicas when drainage ditches are maintained.',
    fieldCapacityAdc: 450,
    wiltingPointAdc: 760,
  },
  'Calcareous Chalk': {
    id: 'Calcareous Chalk',
    name: 'Calcareous / Chalky Limestone Soil',
    texture: 'Stony, pale, high calcium carbonate (CaCO3) content.',
    waterHoldingCapacity: 'Low',
    drainageRate: 'Rapid',
    aeration: 'Excellent',
    typicalPh: 7.9,
    cec: 'Moderate (12-22 meq/100g)',
    adcToVwcFactor: 0.035,
    description: 'Free-draining alkaline soil. Susceptible to lime-induced iron and zinc chlorosis. Excellent for grapes, lavender, barley, and Mediterranean orchards.',
    fieldCapacityAdc: 340,
    wiltingPointAdc: 640,
  },
};

export interface CropRequirement {
  id: string;
  name: string;
  scientificName: string;
  category: 'Cereal & Grain' | 'Pulse & Legume' | 'Cash & Fiber' | 'Vegetable' | 'Fruit & Plantation';
  emoji: string;
  // Moisture requirement (VWC %: 0 - 100)
  optimalMoistureMin: number;
  optimalMoistureMax: number;
  // Temperature (°C)
  optimalTempMin: number;
  optimalTempMax: number;
  tempToleranceMin: number;
  tempToleranceMax: number;
  // Relative Humidity (%)
  optimalHumidityMin: number;
  optimalHumidityMax: number;
  // pH
  optimalPhMin: number;
  optimalPhMax: number;
  phToleranceMin: number;
  phToleranceMax: number;
  // Texture preferences
  preferredSoils: SoilType[];
  // Nutritional demand
  nitrogenNeed: 'Low' | 'Medium' | 'High' | 'Very High';
  phosphorusNeed: 'Low' | 'Medium' | 'High' | 'Very High';
  potassiumNeed: 'Low' | 'Medium' | 'High' | 'Very High';
  // Irrigation demand
  waterNeed: 'Low' | 'Medium' | 'High' | 'Very High';
  growingPeriodDays: number;
  season: 'Kharif (Monsoon)' | 'Rabi (Winter)' | 'Zaid (Summer)' | 'Year-round' | 'Perennial';
  economicYieldPotential: 'Very High' | 'High' | 'Moderate';
  description: string;
  keyAgronomicAdvice: string;
  diseaseVulnerability: string;
}

export const CROP_DATABASE: CropRequirement[] = [
  {
    id: 'rice-paddy',
    name: 'Rice (Paddy)',
    scientificName: 'Oryza sativa',
    category: 'Cereal & Grain',
    emoji: '🌾',
    optimalMoistureMin: 65,
    optimalMoistureMax: 95,
    optimalTempMin: 24,
    optimalTempMax: 35,
    tempToleranceMin: 18,
    tempToleranceMax: 42,
    optimalHumidityMin: 65,
    optimalHumidityMax: 90,
    optimalPhMin: 5.5,
    optimalPhMax: 6.8,
    phToleranceMin: 5.0,
    phToleranceMax: 7.8,
    preferredSoils: ['Clay', 'Silty Loam', 'Black Cotton'],
    nitrogenNeed: 'High',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'High',
    waterNeed: 'Very High',
    growingPeriodDays: 120,
    season: 'Kharif (Monsoon)',
    economicYieldPotential: 'High',
    description: 'Thrives in water-retentive clayey soils with standing water or saturated root zone. High heat and humidity tolerant.',
    keyAgronomicAdvice: 'Maintain saturated conditions or Alternate Wetting and Drying (AWD) to save 30% water without yield penalty.',
    diseaseVulnerability: 'Blast and sheath blight flare up if humidity >85% with night temps >23°C.',
  },
  {
    id: 'wheat',
    name: 'Wheat (Bread / Durum)',
    scientificName: 'Triticum aestivum',
    category: 'Cereal & Grain',
    emoji: '🍞',
    optimalMoistureMin: 35,
    optimalMoistureMax: 60,
    optimalTempMin: 15,
    optimalTempMax: 25,
    tempToleranceMin: 8,
    tempToleranceMax: 32,
    optimalHumidityMin: 40,
    optimalHumidityMax: 65,
    optimalPhMin: 6.0,
    optimalPhMax: 7.5,
    phToleranceMin: 5.5,
    phToleranceMax: 8.2,
    preferredSoils: ['Silty Loam', 'Sandy Loam', 'Clay'],
    nitrogenNeed: 'High',
    phosphorusNeed: 'High',
    potassiumNeed: 'Medium',
    waterNeed: 'Medium',
    growingPeriodDays: 135,
    season: 'Rabi (Winter)',
    economicYieldPotential: 'High',
    description: 'Cool season staple grain preferring well-drained fertile loams. Vulnerable to terminal heat stress during grain filling.',
    keyAgronomicAdvice: 'Ensure crown root initiation (CRI stage, 21 days after sowing) irrigation is timed precisely for root anchoring.',
    diseaseVulnerability: 'Yellow/stripe rust risk accelerates when ambient humidity is high and temperatures stay 10-18°C.',
  },
  {
    id: 'maize-corn',
    name: 'Maize (Field Corn)',
    scientificName: 'Zea mays',
    category: 'Cereal & Grain',
    emoji: '🌽',
    optimalMoistureMin: 40,
    optimalMoistureMax: 70,
    optimalTempMin: 20,
    optimalTempMax: 32,
    tempToleranceMin: 12,
    tempToleranceMax: 38,
    optimalHumidityMin: 45,
    optimalHumidityMax: 75,
    optimalPhMin: 5.8,
    optimalPhMax: 7.2,
    phToleranceMin: 5.2,
    phToleranceMax: 8.0,
    preferredSoils: ['Silty Loam', 'Sandy Loam', 'Black Cotton'],
    nitrogenNeed: 'High',
    phosphorusNeed: 'High',
    potassiumNeed: 'High',
    waterNeed: 'Medium',
    growingPeriodDays: 105,
    season: 'Kharif (Monsoon)',
    economicYieldPotential: 'High',
    description: 'Heavy feeder with rapid vegetative growth. Intolerant of standing waterlogging; needs aerobic root respiration.',
    keyAgronomicAdvice: 'Tasseling and silking are critical moisture stress periods; even a 2-day drought drop will reduce kernel count.',
    diseaseVulnerability: 'Fall armyworm and northern corn leaf blight during warm, overcast spells.',
  },
  {
    id: 'pearl-millet',
    name: 'Pearl Millet (Bajra)',
    scientificName: 'Pennisetum glaucum',
    category: 'Cereal & Grain',
    emoji: '🌾',
    optimalMoistureMin: 20,
    optimalMoistureMax: 45,
    optimalTempMin: 26,
    optimalTempMax: 38,
    tempToleranceMin: 18,
    tempToleranceMax: 45,
    optimalHumidityMin: 25,
    optimalHumidityMax: 55,
    optimalPhMin: 6.5,
    optimalPhMax: 8.0,
    phToleranceMin: 5.5,
    phToleranceMax: 8.5,
    preferredSoils: ['Sandy Loam', 'Calcareous Chalk', 'Red Laterite'],
    nitrogenNeed: 'Low',
    phosphorusNeed: 'Low',
    potassiumNeed: 'Medium',
    waterNeed: 'Low',
    growingPeriodDays: 85,
    season: 'Kharif (Monsoon)',
    economicYieldPotential: 'Moderate',
    description: 'Extreme drought and heat survivor. Flourishes in sandy soils and arid climates where other grains fail completely.',
    keyAgronomicAdvice: 'Do not over-water; saturated root conditions cause stunted tillering and root collar rot.',
    diseaseVulnerability: 'Downy mildew and ergot during unseasonal humid rain at flowering.',
  },
  {
    id: 'sorghum',
    name: 'Sorghum (Great Millet)',
    scientificName: 'Sorghum bicolor',
    category: 'Cereal & Grain',
    emoji: '🌾',
    optimalMoistureMin: 25,
    optimalMoistureMax: 50,
    optimalTempMin: 25,
    optimalTempMax: 35,
    tempToleranceMin: 15,
    tempToleranceMax: 42,
    optimalHumidityMin: 30,
    optimalHumidityMax: 65,
    optimalPhMin: 6.0,
    optimalPhMax: 8.0,
    phToleranceMin: 5.2,
    phToleranceMax: 8.5,
    preferredSoils: ['Black Cotton', 'Clay', 'Sandy Loam'],
    nitrogenNeed: 'Medium',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'Medium',
    waterNeed: 'Low',
    growingPeriodDays: 100,
    season: 'Kharif (Monsoon)',
    economicYieldPotential: 'Moderate',
    description: 'Exceptional root suction pressure can extract soil water bound tightly in heavy black clay soils. Highly resilient.',
    keyAgronomicAdvice: 'Ideal rotation crop after cotton or soybean to break fungal nematode cycles.',
    diseaseVulnerability: 'Grain mold if late rains hit during maturity.',
  },
  {
    id: 'cotton',
    name: 'Cotton (White Gold)',
    scientificName: 'Gossypium hirsutum',
    category: 'Cash & Fiber',
    emoji: '☁️',
    optimalMoistureMin: 35,
    optimalMoistureMax: 60,
    optimalTempMin: 25,
    optimalTempMax: 36,
    tempToleranceMin: 18,
    tempToleranceMax: 43,
    optimalHumidityMin: 40,
    optimalHumidityMax: 70,
    optimalPhMin: 6.2,
    optimalPhMax: 7.8,
    phToleranceMin: 5.8,
    phToleranceMax: 8.5,
    preferredSoils: ['Black Cotton', 'Silty Loam', 'Clay'],
    nitrogenNeed: 'High',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'Very High',
    waterNeed: 'Medium',
    growingPeriodDays: 165,
    season: 'Kharif (Monsoon)',
    economicYieldPotential: 'Very High',
    description: 'Deep taproot crop engineered by nature for expansive vertisols. Needs bright sunshine and heat during boll maturation.',
    keyAgronomicAdvice: 'High potassium (K) is vital to avoid premature leaf reddening and ensure long staple fiber strength.',
    diseaseVulnerability: 'Bollworm complexes and whitefly-vectored leaf curl virus in hot humid pockets.',
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    category: 'Cash & Fiber',
    emoji: '🎋',
    optimalMoistureMin: 60,
    optimalMoistureMax: 85,
    optimalTempMin: 26,
    optimalTempMax: 36,
    tempToleranceMin: 18,
    tempToleranceMax: 44,
    optimalHumidityMin: 60,
    optimalHumidityMax: 85,
    optimalPhMin: 6.0,
    optimalPhMax: 7.5,
    phToleranceMin: 5.2,
    phToleranceMax: 8.2,
    preferredSoils: ['Silty Loam', 'Clay', 'Black Cotton'],
    nitrogenNeed: 'Very High',
    phosphorusNeed: 'High',
    potassiumNeed: 'Very High',
    waterNeed: 'Very High',
    growingPeriodDays: 360,
    season: 'Perennial',
    economicYieldPotential: 'Very High',
    description: 'Long duration, massive biomass accumulator with prodigious water and fertilizer consumption.',
    keyAgronomicAdvice: 'Sub-surface drip fertigation cuts water volume by 45% while boosting sucrose brix reading by 1.5 units.',
    diseaseVulnerability: 'Red rot in poorly drained waterlogged clay blocks.',
  },
  {
    id: 'chickpea',
    name: 'Chickpea (Bengal Gram)',
    scientificName: 'Cicer arietinum',
    category: 'Pulse & Legume',
    emoji: '🧆',
    optimalMoistureMin: 25,
    optimalMoistureMax: 45,
    optimalTempMin: 16,
    optimalTempMax: 26,
    tempToleranceMin: 10,
    tempToleranceMax: 33,
    optimalHumidityMin: 35,
    optimalHumidityMax: 60,
    optimalPhMin: 6.0,
    optimalPhMax: 7.8,
    phToleranceMin: 5.5,
    phToleranceMax: 8.5,
    preferredSoils: ['Silty Loam', 'Sandy Loam', 'Black Cotton'],
    nitrogenNeed: 'Low',
    phosphorusNeed: 'High',
    potassiumNeed: 'Medium',
    waterNeed: 'Low',
    growingPeriodDays: 110,
    season: 'Rabi (Winter)',
    economicYieldPotential: 'High',
    description: 'Symbiotic Rhizobium nodules fix atmospheric nitrogen. Prefers cool nights and low relative humidity.',
    keyAgronomicAdvice: 'Excessive nitrogen or surface moisture causes lush vegetative growth with zero pod setting (flower drop).',
    diseaseVulnerability: 'Ascochyta blight and Fusarium wilt if planted in water-choked clay without seed fungicide treatment.',
  },
  {
    id: 'soybean',
    name: 'Soybean',
    scientificName: 'Glycine max',
    category: 'Pulse & Legume',
    emoji: '🌱',
    optimalMoistureMin: 45,
    optimalMoistureMax: 70,
    optimalTempMin: 22,
    optimalTempMax: 32,
    tempToleranceMin: 15,
    tempToleranceMax: 38,
    optimalHumidityMin: 50,
    optimalHumidityMax: 80,
    optimalPhMin: 6.0,
    optimalPhMax: 7.0,
    phToleranceMin: 5.5,
    phToleranceMax: 7.8,
    preferredSoils: ['Silty Loam', 'Black Cotton', 'Sandy Loam'],
    nitrogenNeed: 'Low',
    phosphorusNeed: 'High',
    potassiumNeed: 'High',
    waterNeed: 'Medium',
    growingPeriodDays: 95,
    season: 'Kharif (Monsoon)',
    economicYieldPotential: 'High',
    description: 'High protein and oil legume. Fixes up to 80 kg N/ha into the soil profile for the succeeding crop.',
    keyAgronomicAdvice: 'Inoculate seed with Bradyrhizobium japonicum before planting for maximum active pink nodules.',
    diseaseVulnerability: 'Yellow mosaic virus transmitted by whitefly in hot dry interludes.',
  },
  {
    id: 'tomato',
    name: 'Tomato (Determinate / Hybrid)',
    scientificName: 'Solanum lycopersicum',
    category: 'Vegetable',
    emoji: '🍅',
    optimalMoistureMin: 45,
    optimalMoistureMax: 68,
    optimalTempMin: 20,
    optimalTempMax: 29,
    tempToleranceMin: 12,
    tempToleranceMax: 36,
    optimalHumidityMin: 50,
    optimalHumidityMax: 70,
    optimalPhMin: 6.0,
    optimalPhMax: 6.8,
    phToleranceMin: 5.5,
    phToleranceMax: 7.5,
    preferredSoils: ['Silty Loam', 'Sandy Loam', 'Peaty Humus'],
    nitrogenNeed: 'Medium',
    phosphorusNeed: 'High',
    potassiumNeed: 'Very High',
    waterNeed: 'Medium',
    growingPeriodDays: 85,
    season: 'Year-round',
    economicYieldPotential: 'Very High',
    description: 'High cash value solanaceous fruit. Sensitive to erratic watering which causes blossom end rot and skin splitting.',
    keyAgronomicAdvice: 'Maintain uniform soil moisture using drip and ensure bio-available calcium to avoid blossom end rot.',
    diseaseVulnerability: 'Early blight, late blight, and bacterial wilt when soil moisture stays saturated under high heat.',
  },
  {
    id: 'potato',
    name: 'Potato (Tuber)',
    scientificName: 'Solanum tuberosum',
    category: 'Vegetable',
    emoji: '🥔',
    optimalMoistureMin: 50,
    optimalMoistureMax: 75,
    optimalTempMin: 16,
    optimalTempMax: 24,
    tempToleranceMin: 8,
    tempToleranceMax: 30,
    optimalHumidityMin: 55,
    optimalHumidityMax: 80,
    optimalPhMin: 5.2,
    optimalPhMax: 6.5,
    phToleranceMin: 4.8,
    phToleranceMax: 7.2,
    preferredSoils: ['Sandy Loam', 'Silty Loam', 'Peaty Humus'],
    nitrogenNeed: 'High',
    phosphorusNeed: 'High',
    potassiumNeed: 'Very High',
    waterNeed: 'Medium',
    growingPeriodDays: 90,
    season: 'Rabi (Winter)',
    economicYieldPotential: 'High',
    description: 'Shallow root system with subterranean tuber bulking. Demands loose, friable, uncompacted soil for symmetrical tubers.',
    keyAgronomicAdvice: 'Never lime heavily before potatoes: alkaline pH (>6.8) triggers common scab (Streptomyces scabies).',
    diseaseVulnerability: 'Late blight (Phytophthora infestans) whenever VPD drops <0.4 kPa in cool damp weather.',
  },
  {
    id: 'onion',
    name: 'Onion & Shallot',
    scientificName: 'Allium cepa',
    category: 'Vegetable',
    emoji: '🧅',
    optimalMoistureMin: 35,
    optimalMoistureMax: 58,
    optimalTempMin: 18,
    optimalTempMax: 28,
    tempToleranceMin: 10,
    tempToleranceMax: 36,
    optimalHumidityMin: 45,
    optimalHumidityMax: 65,
    optimalPhMin: 6.2,
    optimalPhMax: 7.2,
    phToleranceMin: 5.8,
    phToleranceMax: 7.8,
    preferredSoils: ['Sandy Loam', 'Silty Loam'],
    nitrogenNeed: 'Medium',
    phosphorusNeed: 'High',
    potassiumNeed: 'High',
    waterNeed: 'Medium',
    growingPeriodDays: 125,
    season: 'Rabi (Winter)',
    economicYieldPotential: 'High',
    description: 'Bulb vegetable requiring light friable soils. Highly sensitive to soil crusting and standing irrigation.',
    keyAgronomicAdvice: 'Cut off irrigation 10-15 days prior to harvest to allow outer tunic drying and extend shelf life.',
    diseaseVulnerability: 'Purple blotch and thrips infestation during warm dry transitions.',
  },
  {
    id: 'bell-pepper',
    name: 'Bell Pepper / Capsicum',
    scientificName: 'Capsicum annuum',
    category: 'Vegetable',
    emoji: '🫑',
    optimalMoistureMin: 45,
    optimalMoistureMax: 65,
    optimalTempMin: 21,
    optimalTempMax: 28,
    tempToleranceMin: 14,
    tempToleranceMax: 34,
    optimalHumidityMin: 55,
    optimalHumidityMax: 75,
    optimalPhMin: 6.0,
    optimalPhMax: 6.8,
    phToleranceMin: 5.5,
    phToleranceMax: 7.5,
    preferredSoils: ['Silty Loam', 'Sandy Loam', 'Peaty Humus'],
    nitrogenNeed: 'Medium',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'High',
    waterNeed: 'Medium',
    growingPeriodDays: 95,
    season: 'Year-round',
    economicYieldPotential: 'Very High',
    description: 'High-value horticultural crop. Extreme flower abortion occurs if night temperatures exceed 24°C or soil drops below wilting point.',
    keyAgronomicAdvice: 'Drip fertigation with balanced N:K ratio (1:1.5) produces thick pericarp walls and high market grade.',
    diseaseVulnerability: 'Phytophthora root rot if soil drainage is impeded.',
  },
  {
    id: 'spinach-greens',
    name: 'Spinach & Leafy Greens',
    scientificName: 'Spinacia oleracea',
    category: 'Vegetable',
    emoji: '🥬',
    optimalMoistureMin: 55,
    optimalMoistureMax: 75,
    optimalTempMin: 14,
    optimalTempMax: 22,
    tempToleranceMin: 5,
    tempToleranceMax: 28,
    optimalHumidityMin: 60,
    optimalHumidityMax: 80,
    optimalPhMin: 6.4,
    optimalPhMax: 7.4,
    phToleranceMin: 6.0,
    phToleranceMax: 7.8,
    preferredSoils: ['Silty Loam', 'Peaty Humus', 'Sandy Loam'],
    nitrogenNeed: 'High',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'Medium',
    waterNeed: 'Medium',
    growingPeriodDays: 45,
    season: 'Rabi (Winter)',
    economicYieldPotential: 'High',
    description: 'Fast cycle succulent greens. Intolerant of soil acidity (pH < 6.0 causes severe chlorosis and stunted rootlets).',
    keyAgronomicAdvice: 'Requires steady nitrate nitrogen for dark emerald leaf color; harvest early in morning for crisp turgidity.',
    diseaseVulnerability: 'Downy mildew under low VPD and overhead sprinkling.',
  },
  {
    id: 'banana',
    name: 'Banana (Cavendish / Grand Naine)',
    scientificName: 'Musa acuminata',
    category: 'Fruit & Plantation',
    emoji: '🍌',
    optimalMoistureMin: 60,
    optimalMoistureMax: 85,
    optimalTempMin: 24,
    optimalTempMax: 34,
    tempToleranceMin: 16,
    tempToleranceMax: 40,
    optimalHumidityMin: 65,
    optimalHumidityMax: 90,
    optimalPhMin: 6.0,
    optimalPhMax: 7.2,
    phToleranceMin: 5.2,
    phToleranceMax: 8.0,
    preferredSoils: ['Silty Loam', 'Clay', 'Black Cotton'],
    nitrogenNeed: 'Very High',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'Very High',
    waterNeed: 'Very High',
    growingPeriodDays: 330,
    season: 'Perennial',
    economicYieldPotential: 'Very High',
    description: 'Gigantic herbaceous plant with massive transpiration area. Continuous consumer of soil water and potassium.',
    keyAgronomicAdvice: 'Apply high potassium sulfate regularly during bunch emergence for dense bunch fingers and sweet pulp.',
    diseaseVulnerability: 'Sigatoka leaf streak during warm humid seasons; Panama wilt (Fusarium oxysporum) in acidic waterlogged soils.',
  },
  {
    id: 'mango',
    name: 'Mango (King of Fruits)',
    scientificName: 'Mangifera indica',
    category: 'Fruit & Plantation',
    emoji: '🥭',
    optimalMoistureMin: 30,
    optimalMoistureMax: 55,
    optimalTempMin: 24,
    optimalTempMax: 36,
    tempToleranceMin: 12,
    tempToleranceMax: 45,
    optimalHumidityMin: 35,
    optimalHumidityMax: 65,
    optimalPhMin: 5.8,
    optimalPhMax: 7.5,
    phToleranceMin: 5.2,
    phToleranceMax: 8.2,
    preferredSoils: ['Silty Loam', 'Red Laterite', 'Sandy Loam'],
    nitrogenNeed: 'Medium',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'High',
    waterNeed: 'Low',
    growingPeriodDays: 140,
    season: 'Perennial',
    economicYieldPotential: 'Very High',
    description: 'Deep penetrating root system. Requires a distinct dry winter stress period (2-3 months) to induce prolific floral buds.',
    keyAgronomicAdvice: 'Withhold irrigation during November-December to trigger flower differentiation; resume drip once fruitlets set.',
    diseaseVulnerability: 'Powdery mildew and anthracnose if rain or heavy dew occurs during panicle anthesis.',
  },
  {
    id: 'grapes',
    name: 'Grapes (Table / Wine)',
    scientificName: 'Vitis vinifera',
    category: 'Fruit & Plantation',
    emoji: '🍇',
    optimalMoistureMin: 25,
    optimalMoistureMax: 50,
    optimalTempMin: 20,
    optimalTempMax: 32,
    tempToleranceMin: 10,
    tempToleranceMax: 40,
    optimalHumidityMin: 35,
    optimalHumidityMax: 60,
    optimalPhMin: 6.2,
    optimalPhMax: 8.0,
    phToleranceMin: 5.6,
    phToleranceMax: 8.4,
    preferredSoils: ['Sandy Loam', 'Calcareous Chalk', 'Silty Loam'],
    nitrogenNeed: 'Low',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'Very High',
    waterNeed: 'Low',
    growingPeriodDays: 150,
    season: 'Perennial',
    economicYieldPotential: 'Very High',
    description: 'Thrives in well-drained, gravelly or chalky soils with Mediterranean or semi-arid sunlight. Low moisture yields highest sugar and flavor.',
    keyAgronomicAdvice: 'Regulated Deficit Irrigation (RDI) post-veraison concentrates anthocyanins, tannins, and brix sugars.',
    diseaseVulnerability: 'Downy mildew and powdery mildew when ambient humidity exceeds 70% with humid canopy.',
  },
  {
    id: 'tea',
    name: 'Tea (Camellia)',
    scientificName: 'Camellia sinensis',
    category: 'Fruit & Plantation',
    emoji: '🍵',
    optimalMoistureMin: 55,
    optimalMoistureMax: 75,
    optimalTempMin: 18,
    optimalTempMax: 28,
    tempToleranceMin: 10,
    tempToleranceMax: 34,
    optimalHumidityMin: 70,
    optimalHumidityMax: 90,
    optimalPhMin: 4.5,
    optimalPhMax: 5.5,
    phToleranceMin: 4.0,
    phToleranceMax: 6.0,
    preferredSoils: ['Red Laterite', 'Peaty Humus'],
    nitrogenNeed: 'High',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'High',
    waterNeed: 'High',
    growingPeriodDays: 365,
    season: 'Perennial',
    economicYieldPotential: 'Very High',
    description: 'Strict acidophile highland plantation shrub. Cannot survive in alkaline or calcium-rich soils (calcium toxic to tea roots).',
    keyAgronomicAdvice: 'Maintain soil pH strictly between 4.5 and 5.5. Mulch heavily with organic prunings to prevent soil erosion on slopes.',
    diseaseVulnerability: 'Blister blight under prolonged mist and high humidity.',
  },
  {
    id: 'coffee',
    name: 'Coffee (Arabica / Robusta)',
    scientificName: 'Coffea arabica',
    category: 'Fruit & Plantation',
    emoji: '☕',
    optimalMoistureMin: 45,
    optimalMoistureMax: 70,
    optimalTempMin: 19,
    optimalTempMax: 28,
    tempToleranceMin: 12,
    tempToleranceMax: 34,
    optimalHumidityMin: 60,
    optimalHumidityMax: 85,
    optimalPhMin: 5.2,
    optimalPhMax: 6.2,
    phToleranceMin: 4.8,
    phToleranceMax: 6.8,
    preferredSoils: ['Red Laterite', 'Silty Loam', 'Peaty Humus'],
    nitrogenNeed: 'High',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'Very High',
    waterNeed: 'Medium',
    growingPeriodDays: 240,
    season: 'Perennial',
    economicYieldPotential: 'Very High',
    description: 'Shade-loving sub-montane crop requiring rich acidic friable soil with deep organic humus layer.',
    keyAgronomicAdvice: 'Intercrop with leguminous shade trees (Silver Oak, Erythrina) for natural leaf litter and nitrogen cycling.',
    diseaseVulnerability: 'Coffee leaf rust (Hemileia vastatrix) during prolonged warm rain showers.',
  },
  {
    id: 'strawberry',
    name: 'Strawberry (Day-Neutral / June)',
    scientificName: 'Fragaria × ananassa',
    category: 'Fruit & Plantation',
    emoji: '🍓',
    optimalMoistureMin: 50,
    optimalMoistureMax: 70,
    optimalTempMin: 16,
    optimalTempMax: 24,
    tempToleranceMin: 8,
    tempToleranceMax: 30,
    optimalHumidityMin: 55,
    optimalHumidityMax: 75,
    optimalPhMin: 5.5,
    optimalPhMax: 6.5,
    phToleranceMin: 5.0,
    phToleranceMax: 7.0,
    preferredSoils: ['Sandy Loam', 'Peaty Humus', 'Silty Loam'],
    nitrogenNeed: 'Medium',
    phosphorusNeed: 'High',
    potassiumNeed: 'High',
    waterNeed: 'Medium',
    growingPeriodDays: 75,
    season: 'Rabi (Winter)',
    economicYieldPotential: 'Very High',
    description: 'Shallow fibrous root system with tender crown. Highly sensitive to soil salinity and water stagnation.',
    keyAgronomicAdvice: 'Grow on raised beds with black or silver reflective plastic mulch to prevent berry soil contact and rot.',
    diseaseVulnerability: 'Botrytis grey mold and crown rot in poorly ventilated high humidity.',
  },
  {
    id: 'groundnut-peanut',
    name: 'Groundnut (Peanut)',
    scientificName: 'Arachis hypogaea',
    category: 'Pulse & Legume',
    emoji: '🥜',
    optimalMoistureMin: 30,
    optimalMoistureMax: 55,
    optimalTempMin: 24,
    optimalTempMax: 33,
    tempToleranceMin: 18,
    tempToleranceMax: 38,
    optimalHumidityMin: 40,
    optimalHumidityMax: 70,
    optimalPhMin: 6.0,
    optimalPhMax: 7.2,
    phToleranceMin: 5.3,
    phToleranceMax: 7.8,
    preferredSoils: ['Sandy Loam', 'Red Laterite', 'Silty Loam'],
    nitrogenNeed: 'Low',
    phosphorusNeed: 'High',
    potassiumNeed: 'Medium',
    waterNeed: 'Low',
    growingPeriodDays: 115,
    season: 'Kharif (Monsoon)',
    economicYieldPotential: 'High',
    description: 'Subterranean geocarpic legume. Flowers aerial, but fertilized pegs must easily penetrate into soil to develop pods.',
    keyAgronomicAdvice: 'Requires light, friable topsoil for easy peg entry and gypsum (calcium source) at flowering for pod filling.',
    diseaseVulnerability: 'Tikka disease (leaf spot) and collar rot under high moisture.',
  },
  {
    id: 'citrus-orange',
    name: 'Citrus (Sweet Orange & Lemon)',
    scientificName: 'Citrus sinensis',
    category: 'Fruit & Plantation',
    emoji: '🍊',
    optimalMoistureMin: 35,
    optimalMoistureMax: 60,
    optimalTempMin: 22,
    optimalTempMax: 34,
    tempToleranceMin: 12,
    tempToleranceMax: 42,
    optimalHumidityMin: 40,
    optimalHumidityMax: 70,
    optimalPhMin: 6.0,
    optimalPhMax: 7.5,
    phToleranceMin: 5.5,
    phToleranceMax: 8.2,
    preferredSoils: ['Silty Loam', 'Sandy Loam', 'Calcareous Chalk'],
    nitrogenNeed: 'High',
    phosphorusNeed: 'Medium',
    potassiumNeed: 'High',
    waterNeed: 'Medium',
    growingPeriodDays: 240,
    season: 'Perennial',
    economicYieldPotential: 'High',
    description: 'Evergreen tree fruit that detests wet feet. Root rot (Gummosis) is the #1 killer in poorly drained heavy soils.',
    keyAgronomicAdvice: 'Never let irrigation water touch the trunk base directly; use ring basin or dual drip lines.',
    diseaseVulnerability: 'Phytophthora foot rot and citrus canker during warm rainy months.',
  },
];

export interface AgroSimulationParams {
  soilMoistureAdc: number; // 0 to 1023 (low = wet, high = dry)
  soilType: SoilType;
  temperature: number; // °C
  humidity: number; // %
  soilPh: number; // 4.0 - 9.0
  nitrogenPpm: number; // 0 - 100 ppm
  phosphorusPpm: number; // 0 - 60 ppm
  potassiumPpm: number; // 0 - 400 ppm
  lightIntensity: number; // 0 - 1023 (low = dark, high = full sun)
  waterLevelAdc: number; // 0 - 1023 (reservoir supply)
  salinityEc: number; // dS/m (0.2 to 4.5)
}

export interface SoilDiagnosticReport {
  vwcPercent: number; // Estimated Volumetric Water Content %
  vpdKpa: number; // Vapor Pressure Deficit in kPa
  moistureStatus: 'Saturated / Waterlogged' | 'Optimal Field Capacity' | 'Adequate Moisture' | 'Moisture Deficit' | 'Severe Wilting Point';
  moistureSeverity: 'critical' | 'warning' | 'optimal';
  aerationStatus: 'Asphyxiated / Anaerobic' | 'Moderate' | 'Ideal Aerobic' | 'Excessive Leaching';
  phClassification: 'Strongly Acidic' | 'Moderately Acidic' | 'Neutral (Optimal)' | 'Slightly Alkaline' | 'Strongly Alkaline';
  phLockoutAlerts: string[];
  salinityStress: 'Normal (Safe)' | 'Slight Osmotic Stress' | 'High Salinity / Toxic';
  microbialActivityScore: number; // 0 - 100
  microbialStatus: string;
  transpirationDemand: 'Sluggish / Fungal Risk' | 'Healthy Transpiration' | 'Extreme Atmospheric Stress';
  soilTellingStory: string; // The primary narrative: "What the soil is telling you"
  actionableRemedies: string[];
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CropMatchResult {
  crop: CropRequirement;
  suitabilityScore: number; // 0 - 100
  tier: 'Prime Match' | 'Viable with Care' | 'Marginal / Amending Required' | 'Unfavorable';
  limitingFactors: string[];
  positiveHighlights: string[];
  estimatedYieldPotential: number; // % of peak yield
  waterRegimenRecommendation: string;
  actionRequiredToGrow: string;
}

/**
 * Calculates saturated vapor pressure (es) and actual vapor pressure (ea) to get VPD in kPa
 */
export function calculateVpd(tempC: number, humidityPercent: number): number {
  // Tetens formula for saturation vapor pressure es (kPa)
  const es = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const ea = es * (humidityPercent / 100);
  const vpd = es - ea;
  return Number(Math.max(0, vpd).toFixed(2));
}

/**
 * Converts raw Arduino ADC (0-1023 where 1023=dry air, 200=immersed) to Volumetric Water Content (VWC %)
 */
export function calculateVwcPercent(soilAdc: number, soilType: SoilType): number {
  const info = SOIL_TYPES[soilType];
  // Invert ADC: 0 is completely wet (100%), 1023 is dry (0%)
  const inverted = Math.max(0, 1023 - soilAdc);
  // Scale with soil texture factor
  const rawVwc = (inverted / 1023) * 100 * (info.adcToVwcFactor / 0.048);
  return Number(Math.min(100, Math.max(0, rawVwc)).toFixed(1));
}

/**
 * Generates the deep agronomic soil diagnosis: "What the soil is telling"
 */
export function diagnoseSoilConditions(params: AgroSimulationParams): SoilDiagnosticReport {
  const {
    soilMoistureAdc,
    soilType,
    temperature,
    humidity,
    soilPh,
    nitrogenPpm,
    salinityEc,
  } = params;

  const soilInfo = SOIL_TYPES[soilType];
  const vwc = calculateVwcPercent(soilMoistureAdc, soilType);
  const vpd = calculateVpd(temperature, humidity);

  // Moisture state classification based on ADC and soil type
  let moistureStatus: SoilDiagnosticReport['moistureStatus'];
  let moistureSeverity: SoilDiagnosticReport['moistureSeverity'] = 'optimal';
  let urgencyLevel: SoilDiagnosticReport['urgencyLevel'] = 'LOW';

  if (soilMoistureAdc < 280) {
    moistureStatus = 'Saturated / Waterlogged';
    moistureSeverity = 'critical';
    urgencyLevel = 'HIGH';
  } else if (soilMoistureAdc <= soilInfo.fieldCapacityAdc) {
    moistureStatus = 'Optimal Field Capacity';
    moistureSeverity = 'optimal';
  } else if (soilMoistureAdc <= 580) {
    moistureStatus = 'Adequate Moisture';
    moistureSeverity = 'optimal';
  } else if (soilMoistureAdc <= soilInfo.wiltingPointAdc) {
    moistureStatus = 'Moisture Deficit';
    moistureSeverity = 'warning';
    urgencyLevel = 'MEDIUM';
  } else {
    moistureStatus = 'Severe Wilting Point';
    moistureSeverity = 'critical';
    urgencyLevel = 'CRITICAL';
  }

  // Aeration
  let aerationStatus: SoilDiagnosticReport['aerationStatus'];
  if (soilMoistureAdc < 280 && (soilType === 'Clay' || soilType === 'Black Cotton')) {
    aerationStatus = 'Asphyxiated / Anaerobic';
  } else if (soilMoistureAdc < 320) {
    aerationStatus = 'Moderate';
  } else if (soilMoistureAdc > 750 && soilType === 'Sandy Loam') {
    aerationStatus = 'Excessive Leaching';
  } else {
    aerationStatus = 'Ideal Aerobic';
  }

  // pH analysis and nutrient lockout
  let phClassification: SoilDiagnosticReport['phClassification'];
  const phLockoutAlerts: string[] = [];

  if (soilPh < 5.5) {
    phClassification = 'Strongly Acidic';
    phLockoutAlerts.push('Phosphorus is fixed by active aluminum and iron oxides, rendering it unavailable.');
    phLockoutAlerts.push('Calcium, Magnesium, and Molybdenum uptake severely depressed.');
    if (urgencyLevel === 'LOW') urgencyLevel = 'MEDIUM';
  } else if (soilPh < 6.2) {
    phClassification = 'Moderately Acidic';
    phLockoutAlerts.push('Mild phosphorus immobilization; slight micronutrient release.');
  } else if (soilPh <= 7.3) {
    phClassification = 'Neutral (Optimal)';
  } else if (soilPh <= 8.0) {
    phClassification = 'Slightly Alkaline';
    phLockoutAlerts.push('Iron, Zinc, and Manganese availability beginning to precipitate as insoluble carbonates.');
  } else {
    phClassification = 'Strongly Alkaline';
    phLockoutAlerts.push('Severe lime-induced chlorosis: Iron (Fe) and Zinc (Zn) completely locked out.');
    phLockoutAlerts.push('Phosphorus bound tightly with calcium as insoluble calcium phosphate.');
    if (urgencyLevel === 'LOW') urgencyLevel = 'HIGH';
  }

  // Salinity
  let salinityStress: SoilDiagnosticReport['salinityStress'];
  if (salinityEc < 1.5) {
    salinityStress = 'Normal (Safe)';
  } else if (salinityEc <= 2.8) {
    salinityStress = 'Slight Osmotic Stress';
    if (urgencyLevel === 'LOW') urgencyLevel = 'MEDIUM';
  } else {
    salinityStress = 'High Salinity / Toxic';
    urgencyLevel = 'HIGH';
  }

  // Microbial activity calculation (optimal at 24-30C, VWC 40-60%, pH 6.2-7.2)
  let microbialScore = 80;
  if (temperature < 15) microbialScore -= (15 - temperature) * 3;
  if (temperature > 35) microbialScore -= (temperature - 35) * 4;
  if (soilPh < 5.5) microbialScore -= 25;
  if (soilPh > 8.0) microbialScore -= 20;
  if (moistureStatus === 'Saturated / Waterlogged') microbialScore -= 35;
  if (moistureStatus === 'Severe Wilting Point') microbialScore -= 40;
  microbialScore = Math.max(10, Math.min(100, Math.round(microbialScore)));

  let microbialStatus = 'Thriving soil biome with rapid organic matter mineralization.';
  if (microbialScore < 45) {
    microbialStatus = 'Suppressed biological nitrification and reduced root mycorrhizal symbiosis.';
  } else if (microbialScore < 70) {
    microbialStatus = 'Moderate bacterial activity; slower organic nutrient turnover.';
  }

  // Transpiration Demand (VPD)
  let transpirationDemand: SoilDiagnosticReport['transpirationDemand'];
  if (vpd < 0.45) {
    transpirationDemand = 'Sluggish / Fungal Risk';
  } else if (vpd <= 1.45) {
    transpirationDemand = 'Healthy Transpiration';
  } else {
    transpirationDemand = 'Extreme Atmospheric Stress';
    if (urgencyLevel === 'LOW') urgencyLevel = 'MEDIUM';
  }

  // The soil telling story (Human agronomic interpretation)
  let soilTellingStory = '';
  const remedies: string[] = [];

  if (moistureStatus === 'Severe Wilting Point') {
    soilTellingStory = `Your ${soilInfo.name} is in severe acute dehydration (ADC ${soilMoistureAdc}, ~${vwc}% VWC). Capillary water has dropped below the permanent wilting point. Plant roots are experiencing negative hydrostatic tension, stomata are shutting down to conserve hydration, and photosynthesis has ceased.`;
    remedies.push('Activate automated irrigation or deep drip soak immediately to recharge the 30cm root reservoir.');
    remedies.push('Apply organic mulch (straw/woodchip) to reduce surface soil evaporation by up to 40%.');
  } else if (moistureStatus === 'Saturated / Waterlogged') {
    soilTellingStory = `Your soil is completely submerged and oxygen-depleted (ADC ${soilMoistureAdc}, ~${vwc}% VWC). Soil pore spaces are filled with liquid instead of air, halting aerobic respiration in root tip cells and triggering ethylene release, which induces leaf chlorosis and Pythium root rot.`;
    remedies.push('Halt all automated irrigation cycles and shut off water pump immediately.');
    remedies.push('Clear lateral drainage ditches or sub-surface drains to relieve perched water tables.');
    if (soilType === 'Clay' || soilType === 'Black Cotton') {
      remedies.push('Incorporate agricultural gypsum (calcium sulfate) to aggregate fine clay particles and enhance macro-pore percolation.');
    }
  } else if (moistureStatus === 'Moisture Deficit') {
    soilTellingStory = `The soil is entering early water stress (ADC ${soilMoistureAdc}, ~${vwc}% VWC). While deeper taproot crops can still access water, shallow vegetables and fruitlets will soon experience reduced cell division and tip burn.`;
    remedies.push('Schedule a precision irrigation cycle within the next 4-8 hours before wilting point is reached.');
  } else {
    soilTellingStory = `The soil is in a balanced, productive state (ADC ${soilMoistureAdc}, ~${vwc}% VWC). Capillary water tension is optimal for root hair absorption without suffocating gas exchange.`;
    remedies.push('Maintain current irrigation frequency; monitor daily evapotranspiration (ET0) curves.');
  }

  // Add pH and nutrient specific remarks to story and remedies
  if (soilPh < 5.5) {
    soilTellingStory += ` Furthermore, strong soil acidity (pH ${soilPh.toFixed(1)}) is actively locking up phosphorus and causing potential aluminum toxicity.`;
    remedies.push(`Broadcast agricultural lime (calcitic or dolomitic limestone) at 1.5 - 2.5 tonnes/ha to neutralize soil acidity to pH ~6.5.`);
  } else if (soilPh > 8.0) {
    soilTellingStory += ` Additionally, high alkalinity (pH ${soilPh.toFixed(1)}) is binding micronutrients like Iron and Zinc into insoluble precipitates.`;
    remedies.push(`Apply elemental sulfur or composted acidic pine bark/peat to gradually lower soil pH, and spray chelated iron (Fe-EDDHA) on foliage.`);
  }

  if (nitrogenPpm < 20) {
    remedies.push('Topsoil nitrogen is depleted (<20 ppm). Top-dress with well-rotted cattle manure or slow-release urea/calcium ammonium nitrate.');
  }

  if (salinityEc > 2.5) {
    remedies.push(`Elevated electrical conductivity (${salinityEc.toFixed(1)} dS/m) imposes osmotic water withholding on crops. Apply leaching fraction of 15% fresh water to wash soluble salts past the root zone.`);
  }

  return {
    vwcPercent: vwc,
    vpdKpa: vpd,
    moistureStatus,
    moistureSeverity,
    aerationStatus,
    phClassification,
    phLockoutAlerts,
    salinityStress,
    microbialActivityScore: microbialScore,
    microbialStatus,
    transpirationDemand,
    soilTellingStory,
    actionableRemedies: remedies,
    urgencyLevel,
  };
}

/**
 * Evaluates all 20+ crops against the user's simulated soil & environment parameters
 */
export function evaluateCropSuitability(params: AgroSimulationParams): CropMatchResult[] {
  const diagnostic = diagnoseSoilConditions(params);
  const { vwcPercent, vpdKpa } = diagnostic;
  const { temperature, humidity, soilPh, soilType, nitrogenPpm, salinityEc } = params;

  return CROP_DATABASE.map((crop) => {
    let score = 100;
    const limitingFactors: string[] = [];
    const positiveHighlights: string[] = [];

    // 1. Moisture match (Weight: 30%)
    if (vwcPercent >= crop.optimalMoistureMin && vwcPercent <= crop.optimalMoistureMax) {
      positiveHighlights.push(`Optimal soil moisture (~${vwcPercent}% VWC within ${crop.optimalMoistureMin}-${crop.optimalMoistureMax}% range)`);
    } else {
      const diff = vwcPercent < crop.optimalMoistureMin
        ? crop.optimalMoistureMin - vwcPercent
        : vwcPercent - crop.optimalMoistureMax;
      const penalty = Math.min(35, diff * 1.3);
      score -= penalty;
      if (vwcPercent < crop.optimalMoistureMin) {
        limitingFactors.push(`Soil moisture too dry (${vwcPercent}% VWC vs crop minimum ${crop.optimalMoistureMin}%)`);
      } else {
        limitingFactors.push(`Soil moisture too wet / waterlogged (${vwcPercent}% VWC vs crop maximum ${crop.optimalMoistureMax}%)`);
      }
    }

    // 2. Temperature match (Weight: 25%)
    if (temperature >= crop.optimalTempMin && temperature <= crop.optimalTempMax) {
      positiveHighlights.push(`Ideal ambient temperature (${temperature}°C in ${crop.optimalTempMin}-${crop.optimalTempMax}°C window)`);
    } else if (temperature >= crop.tempToleranceMin && temperature <= crop.tempToleranceMax) {
      const diff = temperature < crop.optimalTempMin
        ? crop.optimalTempMin - temperature
        : temperature - crop.optimalTempMax;
      const penalty = Math.min(20, diff * 2.2);
      score -= penalty;
      limitingFactors.push(`Temperature (${temperature}°C) is outside optimum (${crop.optimalTempMin}-${crop.optimalTempMax}°C), slowing growth rate`);
    } else {
      score -= 38;
      limitingFactors.push(`Severe temperature stress (${temperature}°C outside biological survival bounds ${crop.tempToleranceMin}-${crop.tempToleranceMax}°C)`);
    }

    // 3. Soil pH match (Weight: 20%)
    if (soilPh >= crop.optimalPhMin && soilPh <= crop.optimalPhMax) {
      positiveHighlights.push(`Perfect soil pH (${soilPh.toFixed(1)} within optimal ${crop.optimalPhMin}-${crop.optimalPhMax})`);
    } else if (soilPh >= crop.phToleranceMin && soilPh <= crop.phToleranceMax) {
      const diff = soilPh < crop.optimalPhMin ? crop.optimalPhMin - soilPh : soilPh - crop.optimalPhMax;
      const penalty = Math.min(18, diff * 14);
      score -= penalty;
      limitingFactors.push(`Sub-optimal soil pH (${soilPh.toFixed(1)} vs ideal ${crop.optimalPhMin}-${crop.optimalPhMax})`);
    } else {
      score -= 32;
      limitingFactors.push(`Critical pH lockout / intolerance (soil pH ${soilPh.toFixed(1)} exceeds limit ${crop.phToleranceMin}-${crop.phToleranceMax})`);
    }

    // 4. Soil Texture match (Weight: 15%)
    if (crop.preferredSoils.includes(soilType)) {
      positiveHighlights.push(`Preferred soil texture structure (${soilType})`);
    } else {
      score -= 14;
      limitingFactors.push(`Sub-optimal soil texture (${soilType} vs preferred: ${crop.preferredSoils.join(', ')})`);
    }

    // 5. Atmospheric Humidity & VPD (Weight: 10%)
    if (humidity >= crop.optimalHumidityMin && humidity <= crop.optimalHumidityMax) {
      positiveHighlights.push(`Favorable canopy relative humidity (${humidity}%)`);
    } else {
      const diff = humidity < crop.optimalHumidityMin ? crop.optimalHumidityMin - humidity : humidity - crop.optimalHumidityMax;
      const penalty = Math.min(10, diff * 0.4);
      score -= penalty;
      if (humidity > crop.optimalHumidityMax) {
        limitingFactors.push(`High humidity (${humidity}%) elevates foliar fungal blight risks`);
      }
    }

    // 6. Salinity tolerance check
    if (salinityEc > 2.0) {
      if (crop.category === 'Fruit & Plantation' && crop.id !== 'grapes') {
        score -= 15;
        limitingFactors.push(`Sensitive to root zone electrical conductivity (${salinityEc.toFixed(1)} dS/m)`);
      }
    }

    // Final score clamp
    const finalScore = Math.max(5, Math.min(100, Math.round(score)));

    let tier: CropMatchResult['tier'];
    if (finalScore >= 85) tier = 'Prime Match';
    else if (finalScore >= 65) tier = 'Viable with Care';
    else if (finalScore >= 45) tier = 'Marginal / Amending Required';
    else tier = 'Unfavorable';

    // Estimated yield potential
    const estimatedYieldPotential = Math.round(finalScore * 0.95);

    // Irrigation regimen based on water demand and current soil
    let waterRegimenRecommendation = '';
    if (crop.waterNeed === 'Very High') {
      waterRegimenRecommendation = 'Heavy furrow or sub-surface continuous drip with moisture maintained above 60% VWC.';
    } else if (crop.waterNeed === 'High') {
      waterRegimenRecommendation = 'Regular scheduled drip irrigation every 24-48 hours with flow sensors.';
    } else if (crop.waterNeed === 'Medium') {
      waterRegimenRecommendation = 'Moderate deficit irrigation triggered when soil moisture ADC exceeds 500.';
    } else {
      waterRegimenRecommendation = 'Sparse, deep infrequent watering to encourage expansive taproot penetration.';
    }

    let actionRequiredToGrow = 'Ready to sow under current conditions.';
    if (limitingFactors.length > 0) {
      actionRequiredToGrow = `Address primary constraint: ${limitingFactors[0]}`;
    }

    return {
      crop,
      suitabilityScore: finalScore,
      tier,
      limitingFactors,
      positiveHighlights,
      estimatedYieldPotential,
      waterRegimenRecommendation,
      actionRequiredToGrow,
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

/**
 * Realistic Regional Presets for one-click agro-climatic simulation
 */
export interface AgroPreset {
  name: string;
  region: string;
  description: string;
  params: AgroSimulationParams;
}

export const REGIONAL_AGRO_PRESETS: AgroPreset[] = [
  {
    name: 'Monsoon Rice Delta',
    region: 'South / Southeast Asian Floodplain',
    description: 'Heavy clay soil saturated from seasonal monsoons, warm 32°C air, and high relative humidity.',
    params: {
      soilMoistureAdc: 240, // Very wet / standing water
      soilType: 'Clay',
      temperature: 32,
      humidity: 84,
      soilPh: 6.2,
      nitrogenPpm: 38,
      phosphorusPpm: 24,
      potassiumPpm: 180,
      lightIntensity: 650,
      waterLevelAdc: 820,
      salinityEc: 0.8,
    },
  },
  {
    name: 'Temperate Grain Belt',
    region: 'North American Prairie / Black Earth Steppe',
    description: 'Fertile silty loam, balanced 22°C temperatures, moderate 52% humidity with excellent field capacity.',
    params: {
      soilMoistureAdc: 420, // Ideal field capacity
      soilType: 'Silty Loam',
      temperature: 22,
      humidity: 52,
      soilPh: 6.6,
      nitrogenPpm: 48,
      phosphorusPpm: 32,
      potassiumPpm: 210,
      lightIntensity: 850,
      waterLevelAdc: 650,
      salinityEc: 0.6,
    },
  },
  {
    name: 'Arid Highland Orchard',
    region: 'Mediterranean / Semi-Arid Foothills',
    description: 'Porous calcareous sandy loam under hot 35°C sun, low 26% relative humidity and moisture deficit.',
    params: {
      soilMoistureAdc: 680, // Dry
      soilType: 'Calcareous Chalk',
      temperature: 35,
      humidity: 26,
      soilPh: 7.8,
      nitrogenPpm: 18,
      phosphorusPpm: 14,
      potassiumPpm: 160,
      lightIntensity: 980,
      waterLevelAdc: 320,
      salinityEc: 1.8,
    },
  },
  {
    name: 'Subtropical Vertisol Basin',
    region: 'Deccan Plateau / Australian Vertosol Plain',
    description: 'Heavy black cotton soil with high moisture retention, warm 29°C climate, perfect for cotton and pulses.',
    params: {
      soilMoistureAdc: 490,
      soilType: 'Black Cotton',
      temperature: 29,
      humidity: 58,
      soilPh: 7.4,
      nitrogenPpm: 28,
      phosphorusPpm: 22,
      potassiumPpm: 290,
      lightIntensity: 780,
      waterLevelAdc: 540,
      salinityEc: 1.1,
    },
  },
  {
    name: 'Tropical Acidic Tea Highlands',
    region: 'Highland Rainforest Slopes',
    description: 'Ferrous red laterite soil with high natural acidity (pH 5.0), cool 21°C mist, and regular rain showers.',
    params: {
      soilMoistureAdc: 380,
      soilType: 'Red Laterite',
      temperature: 21,
      humidity: 78,
      soilPh: 5.0,
      nitrogenPpm: 35,
      phosphorusPpm: 16,
      potassiumPpm: 140,
      lightIntensity: 520,
      waterLevelAdc: 720,
      salinityEc: 0.4,
    },
  },
  {
    name: 'High-Tech Drip Greenhouse',
    region: 'Precision Horticulture Facility',
    description: 'Peaty substrate with micro-drip fertigation, controlled 24°C, 65% humidity, and balanced NPK delivery.',
    params: {
      soilMoistureAdc: 360,
      soilType: 'Peaty Humus',
      temperature: 24,
      humidity: 65,
      soilPh: 6.3,
      nitrogenPpm: 60,
      phosphorusPpm: 40,
      potassiumPpm: 320,
      lightIntensity: 800,
      waterLevelAdc: 900,
      salinityEc: 1.2,
    },
  },
];

/**
 * Big Data Multi-Node Spatial Grid
 */
export interface IoTNodeTelemetry {
  nodeId: string;
  zoneName: string;
  soilDepth15cmAdc: number;
  soilDepth45cmAdc: number;
  canopyTemp: number;
  ambientHumidity: number;
  vpdKpa: number;
  batteryPercent: number;
  rssiSignalDbm: number;
  pumpStatus: 'IDLE' | 'ACTIVE' | 'SCHEDULED';
  anomalyFlag?: string;
  lastUpdated: string;
}

export const INITIAL_IOT_NODES: IoTNodeTelemetry[] = [
  {
    nodeId: 'NODE-A01',
    zoneName: 'Zone Alpha: Plateau Clay Block',
    soilDepth15cmAdc: 580,
    soilDepth45cmAdc: 440,
    canopyTemp: 28.4,
    ambientHumidity: 54,
    vpdKpa: 1.77,
    batteryPercent: 94,
    rssiSignalDbm: -68,
    pumpStatus: 'IDLE',
    lastUpdated: 'Just now',
  },
  {
    nodeId: 'NODE-A02',
    zoneName: 'Zone Alpha: Plateau Clay Block',
    soilDepth15cmAdc: 690,
    soilDepth45cmAdc: 520,
    canopyTemp: 29.1,
    ambientHumidity: 51,
    vpdKpa: 1.98,
    batteryPercent: 88,
    rssiSignalDbm: -72,
    pumpStatus: 'ACTIVE',
    anomalyFlag: 'Rapid Moisture Decline (Topsoil)',
    lastUpdated: '12s ago',
  },
  {
    nodeId: 'NODE-B01',
    zoneName: 'Zone Beta: Central Precision Pivot',
    soilDepth15cmAdc: 390,
    soilDepth45cmAdc: 380,
    canopyTemp: 25.8,
    ambientHumidity: 62,
    vpdKpa: 1.26,
    batteryPercent: 97,
    rssiSignalDbm: -62,
    pumpStatus: 'IDLE',
    lastUpdated: '5s ago',
  },
  {
    nodeId: 'NODE-B02',
    zoneName: 'Zone Beta: Central Precision Pivot',
    soilDepth15cmAdc: 410,
    soilDepth45cmAdc: 395,
    canopyTemp: 26.2,
    ambientHumidity: 60,
    vpdKpa: 1.36,
    batteryPercent: 91,
    rssiSignalDbm: -65,
    pumpStatus: 'IDLE',
    lastUpdated: '22s ago',
  },
  {
    nodeId: 'NODE-C01',
    zoneName: 'Zone Gamma: Alluvial Valley Drip',
    soilDepth15cmAdc: 290,
    soilDepth45cmAdc: 260,
    canopyTemp: 24.5,
    ambientHumidity: 72,
    vpdKpa: 0.86,
    batteryPercent: 85,
    rssiSignalDbm: -78,
    pumpStatus: 'IDLE',
    anomalyFlag: 'Drainage Saturation Warning',
    lastUpdated: '34s ago',
  },
  {
    nodeId: 'NODE-C02',
    zoneName: 'Zone Gamma: Alluvial Valley Drip',
    soilDepth15cmAdc: 340,
    soilDepth45cmAdc: 310,
    canopyTemp: 25.0,
    ambientHumidity: 68,
    vpdKpa: 1.02,
    batteryPercent: 93,
    rssiSignalDbm: -70,
    pumpStatus: 'IDLE',
    lastUpdated: '18s ago',
  },
  {
    nodeId: 'NODE-D01',
    zoneName: 'Zone Delta: Controlled Greenhouse',
    soilDepth15cmAdc: 375,
    soilDepth45cmAdc: 370,
    canopyTemp: 24.2,
    ambientHumidity: 65,
    vpdKpa: 1.06,
    batteryPercent: 100,
    rssiSignalDbm: -54,
    pumpStatus: 'SCHEDULED',
    lastUpdated: 'Just now',
  },
  {
    nodeId: 'NODE-D02',
    zoneName: 'Zone Delta: Controlled Greenhouse',
    soilDepth15cmAdc: 382,
    soilDepth45cmAdc: 374,
    canopyTemp: 24.0,
    ambientHumidity: 66,
    vpdKpa: 1.02,
    batteryPercent: 99,
    rssiSignalDbm: -56,
    pumpStatus: 'IDLE',
    lastUpdated: '8s ago',
  },
];

/**
 * Big data diurnal cycle points for 24-hour heatmaps
 */
export interface DiurnalDataPoint {
  hour: string;
  soilMoisture15cm: number;
  soilMoisture45cm: number;
  ambientTemp: number;
  soilTemp: number;
  humidity: number;
  vpdKpa: number;
  solarIrradiance: number;
}

export function generate24HourDiurnalCycle(baseParams: AgroSimulationParams): DiurnalDataPoint[] {
  const points: DiurnalDataPoint[] = [];
  const hours = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
  ];

  hours.forEach((hour, idx) => {
    // Diurnal temperature sinusoidal wave
    const hourNum = idx * 2;
    // Peak temp at 14:00, minimum at 04:00
    const tempDelta = Math.sin(((hourNum - 8) / 24) * 2 * Math.PI) * 7;
    const ambientTemp = Number((baseParams.temperature + tempDelta).toFixed(1));
    // Soil temp lags air temp by ~3 hours and has dampened amplitude
    const soilTempDelta = Math.sin(((hourNum - 11) / 24) * 2 * Math.PI) * 3.5;
    const soilTemp = Number((baseParams.temperature - 2 + soilTempDelta).toFixed(1));

    // Humidity is inverse to temperature
    const humidityDelta = -tempDelta * 2.5;
    const humidity = Number(Math.max(20, Math.min(95, baseParams.humidity + humidityDelta)).toFixed(1));

    const vpd = calculateVpd(ambientTemp, humidity);

    // Solar irradiance: 0 at night, peak at 12:00-14:00
    let solar = 0;
    if (hourNum >= 6 && hourNum <= 18) {
      solar = Math.round(Math.sin(((hourNum - 6) / 12) * Math.PI) * baseParams.lightIntensity);
    }

    // Topsoil moisture evaporates during midday, replenished slightly at night
    const topEvap = solar > 300 ? (solar / 1000) * 45 : -15;
    const soil15 = Math.round(Math.min(950, Math.max(150, baseParams.soilMoistureAdc + topEvap)));
    // Subsoil at 45cm is more stable
    const soil45 = Math.round(Math.min(900, Math.max(180, baseParams.soilMoistureAdc - 30 + topEvap * 0.25)));

    points.push({
      hour,
      soilMoisture15cm: soil15,
      soilMoisture45cm: soil45,
      ambientTemp,
      soilTemp,
      humidity,
      vpdKpa: vpd,
      solarIrradiance: solar,
    });
  });

  return points;
}
