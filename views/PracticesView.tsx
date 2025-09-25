

// FIX: Implemented the view for generating practice problems.
import React, { useState, useEffect } from 'react';
import { InputForm } from '../components/InputForm';
import { PracticeDisplay } from '../components/PracticeDisplay';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { generatePractice } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { vfdBrands, vfdModelsByBrand, plcBrands, plcSoftwareByBrand, plcLanguages } from '../constants/automationData';


export const PracticesView: React.FC = () => {
    const [practice, setPractice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<'VFD' | 'PLC'>('PLC');

    // Practice form state
    const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');
    const [selectedVfdBrand, setSelectedVfdBrand] = useState(vfdBrands[0]);
    const [selectedVfdModel, setSelectedVfdModel] = useState('General');
    const [selectedPlcBrand, setSelectedPlcBrand] = useState(plcBrands[0]);
    const [selectedPlcSoftware, setSelectedPlcSoftware] = useState('General');
    const [selectedPlcLanguage, setSelectedPlcLanguage] = useState(plcLanguages[0]);

    const { language } = useLanguage();
    const { t } = useTranslation();

    useEffect(() => {
        setSelectedVfdModel('General');
    }, [selectedVfdBrand]);

    useEffect(() => {
        setSelectedPlcSoftware('General');
    }, [selectedPlcBrand]);


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setPractice('');

        try {
            const result = await generatePractice({
                topic: selectedTopic,
                difficulty: selectedDifficulty,
                language,
                vfdBrand: selectedTopic === 'VFD' ? selectedVfdBrand : undefined,
                vfdModel: selectedTopic === 'VFD' ? selectedVfdModel : undefined,
                plcBrand: selectedTopic === 'PLC' ? selectedPlcBrand : undefined,
                plcSoftware: selectedTopic === 'PLC' ? selectedPlcSoftware : undefined,
                plcLanguage: selectedTopic === 'PLC' ? selectedPlcLanguage : undefined,
            });
            setPractice(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <InputForm
                    query=""
                    setQuery={() => {}} // Not used in practice mode
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    selectedTopic={selectedTopic}
                    setSelectedTopic={setSelectedTopic}
                    formType="practice"
                    // Practice Props
                    selectedDifficulty={selectedDifficulty}
                    setSelectedDifficulty={setSelectedDifficulty}
                    // VFD Props
                    selectedVfdBrand={selectedVfdBrand}
                    setSelectedVfdBrand={setSelectedVfdBrand}
                    vfdBrands={vfdBrands}
                    selectedVfdModel={selectedVfdModel}
                    setSelectedVfdModel={setSelectedVfdModel}
                    vfdModelsByBrand={vfdModelsByBrand}
                    // PLC Props
                    selectedPlcBrand={selectedPlcBrand}
                    setSelectedPlcBrand={setSelectedPlcBrand}
                    plcBrands={plcBrands}
                    selectedPlcSoftware={selectedPlcSoftware}
                    setSelectedPlcSoftware={setSelectedPlcSoftware}
                    plcSoftwareByBrand={plcSoftwareByBrand[selectedPlcBrand] || []}
                    selectedPlcLanguage={selectedPlcLanguage}
                    setSelectedPlcLanguage={setSelectedPlcLanguage}
                    plcLanguages={plcLanguages}
                    // Dummy props to satisfy interface
                    selectedPlcVersion=""
                    setSelectedPlcVersion={() => {}}
                    plcVersionsBySoftware={[]}
                />
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {practice && !isLoading && <PracticeDisplay practiceText={practice} />}
        </div>
    );
};