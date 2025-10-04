import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { BrandLogo } from '../components/BrandLogo';

interface Fault {
    code: string;
    name: string;
    description: string;
}

const FaultTable: React.FC<{ faults: Fault[] }> = ({ faults }) => {
    const { t } = useTranslation();
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reference.faults.code')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reference.faults.name')}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reference.faults.description')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {faults.map((fault, index) => (
                        <tr key={index}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-red-600 dark:text-red-400">{fault.code}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200">{fault.name}</td>
                            <td className="px-4 py-4 whitespace-normal text-sm text-gray-600 dark:text-gray-300">{fault.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ReferenceView: React.FC = () => {
    const { t } = useTranslation();
    
    // The translation hook returns the array of fault objects directly
    const siemensFaults: Fault[] = t('reference.faults.siemens') as any;
    const abFaults: Fault[] = t('reference.faults.allenBradley') as any;
    const abbFaults: Fault[] = t('reference.faults.abb') as any;
    const schneiderFaults: Fault[] = t('reference.faults.schneider') as any;
    const danfossFaults: Fault[] = t('reference.faults.danfoss') as any;
    const yaskawaFaults: Fault[] = t('reference.faults.yaskawa') as any;
    const mitsubishiFaults: Fault[] = t('reference.faults.mitsubishi') as any;
    const eatonFaults: Fault[] = t('reference.faults.eaton') as any;

    const vfdBrands = [
        { name: t('reference.brands.siemens'), logoName: 'Siemens', faults: siemensFaults },
        { name: t('reference.brands.allenBradley'), logoName: 'Allen-Bradley', faults: abFaults },
        { name: t('reference.brands.abb'), logoName: 'ABB', faults: abbFaults },
        { name: t('reference.brands.schneider'), logoName: 'Schneider Electric', faults: schneiderFaults },
        { name: t('reference.brands.danfoss'), logoName: 'Danfoss', faults: danfossFaults },
        { name: t('reference.brands.yaskawa'), logoName: 'Yaskawa', faults: yaskawaFaults },
        { name: t('reference.brands.mitsubishi'), logoName: 'Mitsubishi Electric', faults: mitsubishiFaults },
        { name: t('reference.brands.eaton'), logoName: 'Eaton', faults: eatonFaults },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <header className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('reference.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('reference.description')}</p>
            </header>

            {/* VFD Faults Section */}
            <section>
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('reference.vfdTitle')}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('reference.vfdDesc')}</p>
                    <div className="mt-6 space-y-8">
                        {vfdBrands.map(brand => (
                            <div key={brand.name} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50">
                                    <BrandLogo brand={brand.logoName} topic="VFD" className="h-10 w-10" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{brand.name}</h3>
                                </div>
                                <FaultTable faults={brand.faults} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* You can add the PLC Data Types section here in the future */}
            {/*
            <section>
                 <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('reference.plcTitle')}</h2>
                     <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('reference.plcDesc')}</p>
                 </div>
            </section>
            */}
        </div>
    );
};