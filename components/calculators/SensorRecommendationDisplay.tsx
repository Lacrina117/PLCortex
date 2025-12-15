import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ErrorAlert } from '../ErrorAlert';
import { ExportButton } from '../ExportButton';

// --- TYPE DEFINITIONS ---
interface SensorRecommendation {
  isTopChoice: boolean;
  technology: string;
  justification: string;
  ratings: {
    precision: number;
    cost: number;
    robustness: number;
    easeOfInstallation: number;
  };
  suggestedModels: string;
}

interface RecommendationData {
  recommendations: SensorRecommendation[];
  installationConsiderations: string[];
  wiringWarning?: {
    title: string;
    content: string;
  };
  modelsDisclaimer: string;
  implementationGuide: string | Record<string, string>;
}

// --- HELPER COMPONENTS ---

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i < rating);
  return (
    <div className="flex items-center">
      {stars.map((filled, index) => (
        <svg key={index} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const SensorCard: React.FC<{ recommendation: SensorRecommendation }> = ({ recommendation }) => {
  const { t } = useTranslation();
  const isTopChoice = recommendation.isTopChoice;

  const ratingLabels = {
    precision: t('calculator.sensorSelection.priorities.highPrecision'),
    cost: t('calculator.sensorSelection.priorities.lowCost'),
    robustness: t('calculator.sensorSelection.priorities.maxRobustness'),
    easeOfInstallation: 'Facilidad de Instalación',
  };

  return (
    <div className={`relative p-4 rounded-lg border-2 transition-all ${isTopChoice ? 'bg-indigo-50 dark:bg-gray-700/50 border-indigo-500 shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      {isTopChoice && (
        <div className="absolute -top-3 right-3 px-2 py-0.5 text-xs font-bold text-white bg-indigo-600 rounded-full">
          Opción Principal
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{recommendation.technology}</h3>
      <div className="mt-3 space-y-2">
        {Object.entries(recommendation.ratings).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-600 dark:text-gray-400">{ratingLabels[key as keyof typeof ratingLabels]}</span>
            <StarRating rating={value} />
          </div>
        ))}
      </div>
    </div>
  );
};


// --- MAIN DISPLAY COMPONENT ---

export const SensorRecommendationDisplay: React.FC<{ recommendationJson: string }> = ({ recommendationJson }) => {
    const { t } = useTranslation();
    const exportRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState('');

    const data: RecommendationData | null = useMemo(() => {
        try {
            let jsonStr = recommendationJson.replace(/```json\n?/, '').replace(/```$/, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse recommendation JSON", e, "Raw JSON:", recommendationJson);
            return null;
        }
    }, [recommendationJson]);

    useEffect(() => {
        if (data && typeof data.implementationGuide === 'object' && data.implementationGuide !== null && Object.keys(data.implementationGuide).length > 0) {
            if (!activeTab || !data.implementationGuide[activeTab as keyof typeof data.implementationGuide]) {
                setActiveTab(Object.keys(data.implementationGuide)[0]);
            }
        }
    }, [data, activeTab]);

    if (!data) {
        return <ErrorAlert message="Failed to parse the recommendation data from the AI. The format was unexpected." />;
    }

    const topChoice = data.recommendations.find(r => r.isTopChoice) || data.recommendations[0];

    return (
        <div ref={exportRef} className="relative mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in space-y-8">
            <ExportButton
                targetRef={exportRef}
                filename="PLCortex_Sensor_Recommendation"
                sensorData={data}
                imageTargetRef={cardsRef}
            />
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-indigo-500 pb-2">
                Recomendación de Sensor
            </h2>

            {/* Justification */}
            <section>
                <h3 className="text-xl font-semibold mb-2">Justificación</h3>
                <p className="text-gray-600 dark:text-gray-300">{topChoice.justification}</p>
            </section>

            {/* Recommendation Cards */}
            <section>
                 <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.recommendations.map(rec => (
                        <SensorCard key={rec.technology} recommendation={rec} />
                    ))}
                </div>
            </section>
            
            {/* Models */}
             <section>
                <h3 className="text-xl font-semibold mb-2">{t('calculator.sensorSelection.wizardTitle')}</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-semibold">{topChoice.suggestedModels}</p>
                    <p className="text-xs text-gray-500 mt-1">{data.modelsDisclaimer}</p>
                </div>
            </section>

            {/* Installation, Wiring, and Implementation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section>
                    <h3 className="text-xl font-semibold mb-2">Consideraciones de Instalación</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                        {data.installationConsiderations.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </section>
                
                {data.wiringWarning && (
                    <section className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-lg">
                        <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">{data.wiringWarning.title}</h3>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">{data.wiringWarning.content}</p>
                    </section>
                )}
            </div>

            {/* Implementation Guide */}
             <section>
                <h3 className="text-xl font-semibold mb-2">Guía Rápida de Implementación</h3>
                {typeof data.implementationGuide === 'object' && data.implementationGuide !== null && Object.keys(data.implementationGuide).length > 0 ? (
                    <div>
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                                {Object.keys(data.implementationGuide).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`${activeTab === key ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'} whitespace-nowrap capitalize py-2 px-3 border-b-2 font-medium text-sm`}
                                    >
                                        {key}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <pre className="mt-2 p-4 bg-gray-900 text-gray-200 rounded-md text-xs whitespace-pre-wrap max-h-80 overflow-auto">
                            <code>
                                {data.implementationGuide[activeTab as keyof typeof data.implementationGuide]}
                            </code>
                        </pre>
                    </div>
                ) : (
                    <pre className="p-4 bg-gray-900 text-gray-200 rounded-md text-xs whitespace-pre-wrap">
                        <code>
                            {data.implementationGuide as string}
                        </code>
                    </pre>
                )}
            </section>

        </div>
    );
};