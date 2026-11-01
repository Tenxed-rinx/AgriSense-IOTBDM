import React, { useState, useMemo } from 'react';
import {
  AgroSimulationParams,
  CropMatchResult,
  CropRequirement,
  evaluateCropSuitability,
} from '../utils/soilAgronomyData';
import {
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Droplet,
  Calendar,
  Sparkles,
  ArrowRight,
  Sprout,
  Star,
} from 'lucide-react';

interface CropSuitabilityExplorerProps {
  params: AgroSimulationParams;
  onApplyCropIdealConditions?: (crop: CropRequirement) => void;
}

export const CropSuitabilityExplorer: React.FC<CropSuitabilityExplorerProps> = ({
  params,
  onApplyCropIdealConditions,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [inspectedMatch, setInspectedMatch] = useState<CropMatchResult | null>(null);

  // Evaluate all crops in real time against current soil & environment parameters
  const matches: CropMatchResult[] = useMemo(() => {
    return evaluateCropSuitability(params);
  }, [params]);

  // Filtered crops
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Search
      const matchesSearch =
        m.crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.crop.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Category
      if (selectedCategory !== 'ALL' && m.crop.category !== selectedCategory) {
        return false;
      }

      // Tier
      if (selectedTier !== 'ALL' && m.tier !== selectedTier) {
        return false;
      }

      return true;
    });
  }, [matches, searchQuery, selectedCategory, selectedTier]);

  const categories = [
    { id: 'ALL', label: 'All Crops' },
    { id: 'Cereal & Grain', label: 'Grains & Cereals (Rice, Wheat, Corn)' },
    { id: 'Pulse & Legume', label: 'Pulses & Dals (Gram, Soybean)' },
    { id: 'Cash & Fiber', label: 'Cash Crops (Cotton, Sugarcane)' },
    { id: 'Vegetable', label: 'Vegetables (Tomato, Potato, Onion)' },
    { id: 'Fruit & Plantation', label: 'Fruits & Plantation (Banana, Mango, Citrus)' },
  ];

  const tiers = [
    { id: 'ALL', label: 'All Results' },
    { id: 'Prime Match', label: 'Prime Choice (85-100%)' },
    { id: 'Viable with Care', label: 'Good to Grow (65-84%)' },
    { id: 'Marginal / Amending Required', label: 'Needs Extra Care (45-64%)' },
    { id: 'Unfavorable', label: 'Not Recommended Now' },
  ];

  const getTierDisplay = (tier: CropMatchResult['tier']) => {
    switch (tier) {
      case 'Prime Match':
        return { label: 'Prime Choice', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'Viable with Care':
        return { label: 'Good to Grow', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'Marginal / Amending Required':
        return { label: 'Needs Care', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: 'Unfavorable', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
  };

  const primeCount = matches.filter((m) => m.tier === 'Prime Match').length;
  const viableCount = matches.filter((m) => m.tier === 'Viable with Care').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Clean Slate Header */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Bio-Climatic Crop Matching</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Best Crops to Grow on Your Land
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Evaluated in real-time against active soil wetness, soil texture ({params.soilType}), reaction pH ({params.soilPh.toFixed(1)}), and ambient air temperature.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700">
              ● {primeCount} Prime Matches
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              ● {viableCount} Viable
            </span>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search crop name (e.g. Rice, Wheat, Tomato)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-hidden focus:border-slate-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tier Filter Bar */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-700">Filter by Recommendation:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {tiers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTier(t.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedTier === t.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crops Cards Grid */}
      <div className="p-5">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No crops found matching this filter. Try adjusting your search query or choosing "All Results".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((m) => {
              const { crop, suitabilityScore, tier, limitingFactors, positiveHighlights, estimatedYieldPotential } = m;
              const tierDisplay = getTierDisplay(tier);
              return (
                <div
                  key={crop.id}
                  className="rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top card banner */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
                          {crop.emoji}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {crop.name}
                          </h3>
                          <div className="text-[11px] text-slate-500">
                            {crop.category} · ~{crop.growingPeriodDays} days
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-base font-bold text-slate-900">
                          {suitabilityScore}%
                        </div>
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md border ${tierDisplay.color}`}>
                          {tierDisplay.label}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 mt-2.5 line-clamp-2">
                      {crop.description}
                    </div>
                  </div>

                  {/* Highlights and alerts in plain language */}
                  <div className="p-4 space-y-2 bg-slate-50/40 flex-1">
                    {positiveHighlights.slice(0, 2).map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}

                    {limitingFactors.slice(0, 2).map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}

                    {limitingFactors.length === 0 && (
                      <div className="text-[11px] text-emerald-700 font-medium">
                        ✓ All conditions are optimal for this crop variety.
                      </div>
                    )}
                  </div>

                  {/* Action & quick stats */}
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Droplet className="w-3 h-3 text-slate-400" />
                        {crop.waterNeed} Water
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Star className="w-3 h-3 text-amber-500" />
                        ~{estimatedYieldPotential}% Yield
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectedMatch(m)}
                      className="px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Growing Guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Crop Dossier & Growing Guide Modal */}
      {inspectedMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {inspectedMatch.crop.emoji}
                </span>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Agronomic Cultivation Profile
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {inspectedMatch.crop.name}
                  </h3>
                  <div className="text-xs text-slate-500 italic">
                    {inspectedMatch.crop.scientificName} · Season: {inspectedMatch.crop.season}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedMatch(null)}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Match score banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-600 block font-medium">
                  Suitability on current field:
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl font-mono font-bold text-slate-900">
                    {inspectedMatch.suitabilityScore}% Match
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getTierDisplay(inspectedMatch.tier).color}`}>
                    {getTierDisplay(inspectedMatch.tier).label}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-600 block font-medium">Estimated Yield Potential:</span>
                <span className="text-xl font-mono font-bold text-slate-900">
                  ~{inspectedMatch.estimatedYieldPotential}% of Full Yield
                </span>
              </div>
            </div>

            {/* Comparison table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Crop Growth Windows vs Field Telemetry
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-500 text-[10px]">Optimal Moisture</div>
                  <div className="font-bold text-slate-800">
                    {inspectedMatch.crop.optimalMoistureMin} - {inspectedMatch.crop.optimalMoistureMax}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Field: {((1023 - params.soilMoistureAdc) / 1023 * 100 * 0.05).toFixed(0)}%
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-500 text-[10px]">Optimal Temp</div>
                  <div className="font-bold text-slate-800">
                    {inspectedMatch.crop.optimalTempMin} - {inspectedMatch.crop.optimalTempMax}°C
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Field: {params.temperature}°C
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-500 text-[10px]">Optimal pH</div>
                  <div className="font-bold text-slate-800">
                    pH {inspectedMatch.crop.optimalPhMin} - {inspectedMatch.crop.optimalPhMax}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Field: pH {params.soilPh.toFixed(1)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-500 text-[10px]">Days to Harvest</div>
                  <div className="font-bold text-slate-800">
                    {inspectedMatch.crop.growingPeriodDays} Days
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {inspectedMatch.crop.season.split(' ')[0]}
                  </div>
                </div>
              </div>
            </div>

            {/* Field Advice */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-800">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Field Husbandry &amp; Fertigation Protocol
                </span>
                <p className="leading-relaxed">{inspectedMatch.crop.keyAgronomicAdvice}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 text-slate-800">
                <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] block">
                  Pest &amp; Disease Vulnerability Warning
                </span>
                <p className="leading-relaxed">{inspectedMatch.crop.diseaseVulnerability}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              {onApplyCropIdealConditions && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyCropIdealConditions(inspectedMatch.crop);
                    setInspectedMatch(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Calibrate Simulator for {inspectedMatch.crop.name}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setInspectedMatch(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors ml-auto"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
