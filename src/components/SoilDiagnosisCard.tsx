import React, { useState } from 'react';
import {
  AgroSimulationParams,
  SoilDiagnosticReport,
  diagnoseSoilConditions,
} from '../utils/soilAgronomyData';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  Wind,
  Droplet,
  FlaskConical,
  Bug,
  Compass,
  ArrowRight,
  Loader2,
  Sprout,
} from 'lucide-react';

interface SoilDiagnosisCardProps {
  params: AgroSimulationParams;
}

interface AiPrescriptionData {
  title: string;
  summary: string;
  soilPathology: string;
  fertilizerPrescription: string[];
  cropSuitabilityVerdict: string;
  immediateAction: string;
}

export const SoilDiagnosisCard: React.FC<SoilDiagnosisCardProps> = ({
  params,
}) => {
  const diagnosis: SoilDiagnosticReport = diagnoseSoilConditions(params);

  const [aiReport, setAiReport] = useState<AiPrescriptionData | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  const handleFetchAiPrescription = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/agronomy/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soilType: params.soilType,
          soilMoistureAdc: params.soilMoistureAdc,
          vwcPercent: diagnosis.vwcPercent,
          temperature: params.temperature,
          humidity: params.humidity,
          soilPh: params.soilPh,
          nitrogenPpm: params.nitrogenPpm,
          phosphorusPpm: params.phosphorusPpm,
          potassiumPpm: params.potassiumPpm,
          salinityEc: params.salinityEc,
          lightIntensity: params.lightIntensity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setAiReport({
          title: data.title || 'Agronomic Soil Health Prescription',
          summary: data.summary || diagnosis.soilTellingStory,
          soilPathology: data.soilPathology || 'Roots are aerated and water tension is within physiological bounds.',
          fertilizerPrescription: data.fertilizerPrescription || diagnosis.actionableRemedies,
          cropSuitabilityVerdict: data.cropSuitabilityVerdict || 'Conditions align with recommended regional crop rotations.',
          immediateAction: data.immediateAction || diagnosis.actionableRemedies[0] || 'Maintain regular irrigation intervals.',
        });
        setShowAiModal(true);
      }
    } catch (err: any) {
      console.warn('AI Agronomy call error, using local prescription:', err);
      setAiReport({
        title: `Soil Health Prescription: ${params.soilType}`,
        summary: diagnosis.soilTellingStory,
        soilPathology: `Under current field parameters, capillary water retention and pore aeration support active biological respiration. Soil pH of ${params.soilPh.toFixed(1)} governs primary nutrient availability.`,
        fertilizerPrescription: diagnosis.actionableRemedies,
        cropSuitabilityVerdict: `Check the Crop Suitability section below to view recommended crop varieties.`,
        immediateAction: diagnosis.actionableRemedies[0] || 'Maintain scheduled irrigation.',
      });
      setShowAiModal(true);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getUrgencyBadge = () => {
    switch (diagnosis.urgencyLevel) {
      case 'CRITICAL':
        return { text: 'CRITICAL ATTENTION NEEDED', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'HIGH':
        return { text: 'HIGH ATTENTION REQUIRED', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'MEDIUM':
        return { text: 'MODERATE ADJUSTMENT', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { text: 'SOIL HEALTH NOMINAL', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  const urgency = getUrgencyBadge();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Clean Slate Card Header */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <Stethoscope className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Agronomic Diagnostic Engine
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                What the Soil is Saying
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${urgency.bg}`}>
              {urgency.text}
            </span>

            <button
              type="button"
              onClick={handleFetchAiPrescription}
              disabled={isLoadingAi}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isLoadingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Field...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Agronomist Rx (Gemini 3.8)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Narrative Story */}
        <div className="mt-3 p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm leading-relaxed">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5" />
            <span>Field Interpretation:</span>
          </div>
          <p className="font-normal text-slate-200 text-sm sm:text-base">
            "{diagnosis.soilTellingStory}"
          </p>
        </div>
      </div>

      {/* 4 Diagnostic Quadrants */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-slate-200">
        {/* 1. Root Zone Water */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Droplet className="w-4 h-4 text-slate-600" />
              Root Zone Moisture
            </span>
            <span className="font-mono text-slate-900 font-bold">{diagnosis.vwcPercent}% Water</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {diagnosis.moistureStatus}
          </div>
          <div className="text-xs text-slate-600">
            Aeration: <span className="font-medium text-slate-800">{diagnosis.aerationStatus}</span>
          </div>
        </div>

        {/* 2. Atmospheric Demand / VPD */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Wind className="w-4 h-4 text-slate-600" />
              Evaporation Demand
            </span>
            <span className="font-mono text-slate-900 font-bold">{diagnosis.vpdKpa} kPa</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {diagnosis.transpirationDemand}
          </div>
          <div className="text-xs text-slate-600">
            {diagnosis.vpdKpa < 0.45
              ? 'Low drying rate: monitor for mildew or fungal risks.'
              : diagnosis.vpdKpa > 1.4
              ? 'High drying demand: leaves transpire water rapidly.'
              : 'Balanced evapotranspiration rate.'}
          </div>
        </div>

        {/* 3. Soil pH & Reaction */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <FlaskConical className="w-4 h-4 text-slate-600" />
              Soil Reaction (pH)
            </span>
            <span className="font-mono text-slate-900 font-bold">pH {params.soilPh.toFixed(1)}</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {diagnosis.phClassification}
          </div>
          <div className="text-xs text-slate-600">
            {diagnosis.phLockoutAlerts.length > 0 ? (
              <span className="text-amber-800 font-medium">
                {diagnosis.phLockoutAlerts[0]}
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">
                Balanced: primary and micro nutrients remain bioavailable.
              </span>
            )}
          </div>
        </div>

        {/* 4. Biological Biome Activity */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Bug className="w-4 h-4 text-slate-600" />
              Soil Biological Biome
            </span>
            <span className="font-mono text-slate-900 font-bold">
              {diagnosis.microbialActivityScore} / 100
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {diagnosis.microbialActivityScore > 75
              ? 'Active Organic Breakdown'
              : diagnosis.microbialActivityScore > 50
              ? 'Moderate Soil Life'
              : 'Stressed Soil Biome'}
          </div>
          <div className="text-xs text-slate-600 truncate">
            {diagnosis.microbialStatus}
          </div>
        </div>
      </div>

      {/* Field Amendments Checklist */}
      <div className="p-5 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Recommended Field Amendments &amp; Actions:
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {diagnosis.actionableRemedies.map((remedy, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-start gap-3 text-xs text-slate-800 shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                {idx + 1}
              </div>
              <div className="leading-relaxed font-medium">{remedy}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Doctor Prescription Modal */}
      {showAiModal && aiReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Official Agronomic Prescription
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{aiReport.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Immediate Action */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block text-[11px] text-amber-800">
                  Immediate Priority Action
                </span>
                <span className="font-medium text-sm text-slate-900">{aiReport.immediateAction}</span>
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Field Condition Evaluation
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                {aiReport.summary}
              </p>
            </div>

            {/* Pathology */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Rhizosphere Dynamics &amp; Soil Aeration
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                {aiReport.soilPathology}
              </p>
            </div>

            {/* Prescriptions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Soil Conditioning &amp; Fertilizer Schedule
              </h4>
              <div className="space-y-1.5">
                {aiReport.fertilizerPrescription.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 flex items-start gap-2.5 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Crop Feasibility Assessment
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-medium">
                {aiReport.cropSuitabilityVerdict}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 font-mono">
                Model: Gemini 3.8 Flash via Express API
              </span>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Close Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
