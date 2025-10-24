import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { BrandLogo } from '../components/BrandLogo';

interface Fault {
    code: string;
    name: string;
    description: string;
}

interface ColorCode {
    type: string;
    positive: string;
    negative: string;
    jacket: string;
}

interface ColorCodeStandard {
    name: string;
    note: string;
    codes: ColorCode[];
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

const ColorCell: React.FC<{ colorName: string }> = ({ colorName }) => {
    const colorMap: { [key: string]: { bg: string, text: string, border?: string } } = {
        'Yellow': { bg: 'bg-yellow-400', text: 'text-black' },
        'Red': { bg: 'bg-red-500', text: 'text-white' },
        'White': { bg: 'bg-white', text: 'text-black', border: 'border border-gray-300' },
        'Blue': { bg: 'bg-blue-600', text: 'text-white' },
        'Purple': { bg: 'bg-purple-600', text: 'text-white' },
        'Orange': { bg: 'bg-orange-500', text: 'text-white' },
        'Brown': { bg: 'bg-yellow-800', text: 'text-white' },
        'Black': { bg: 'bg-black', text: 'text-white' },
        'Green': { bg: 'bg-green-500', text: 'text-white' },
        'Pink': { bg: 'bg-pink-400', text: 'text-white' },
        'Amarillo': { bg: 'bg-yellow-400', text: 'text-black' },
        'Rojo': { bg: 'bg-red-500', text: 'text-white' },
        'Blanco': { bg: 'bg-white', text: 'text-black', border: 'border border-gray-300' },
        'Azul': { bg: 'bg-blue-600', text: 'text-white' },
        'Morado': { bg: 'bg-purple-600', text: 'text-white' },
        'Naranja': { bg: 'bg-orange-500', text: 'text-white' },
        'Marrón': { bg: 'bg-yellow-800', text: 'text-white' },
        'Negro': { bg: 'bg-black', text: 'text-white' },
        'Verde': { bg: 'bg-green-500', text: 'text-white' },
        'Rosa': { bg: 'bg-pink-400', text: 'text-white' },
    };

    const style = colorMap[colorName] || { bg: 'bg-gray-200', text: 'text-black' };

    return (
        <div className={`px-2 py-1 rounded-md text-center text-xs font-semibold ${style.bg} ${style.text} ${style.border || ''}`}>
            {colorName}
        </div>
    );
};


const ThermocoupleColorCodeTable: React.FC<{ standard: ColorCodeStandard }> = ({ standard }) => {
    const { t } = useTranslation();
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{standard.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{standard.note}</p>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reference.thermocoupleTable.type')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reference.thermocoupleTable.positive')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reference.thermocoupleTable.negative')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reference.thermocoupleTable.jacket')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {standard.codes.map(code => (
                            <tr key={code.type}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-800 dark:text-gray-200">{code.type}</td>
                                <td className="px-4 py-4"><ColorCell colorName={code.positive} /></td>
                                <td className="px-4 py-4"><ColorCell colorName={code.negative} /></td>
                                <td className="px-4 py-4"><ColorCell colorName={code.jacket} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ReferenceView: React.FC = () => {
    const { t } = useTranslation();
    
    const siemensFaults: Fault[] = t('reference.faults.siemens') as any;
    const abFaults: Fault[] = t('reference.faults.allenBradley') as any;
    const abbFaults: Fault[] = t('reference.faults.abb') as any;
    const schneiderFaults: Fault[] = t('reference.faults.schneider') as any;
    const danfossFaults: Fault[] = t('reference.faults.danfoss') as any;
    const yaskawaFaults: Fault[] = t('reference.faults.yaskawa') as any;
    const mitsubishiFaults: Fault[] = t('reference.faults.mitsubishi') as any;
    const eatonFaults: Fault[] = t('reference.faults.eaton') as any;
    const colorCodeData = t('reference.colorCodes') as any;

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
    
    const thermocoupleStandards = [
        colorCodeData.ansi,
        colorCodeData.iec,
        colorCodeData.din,
        colorCodeData.jis,
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <header className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('reference.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('reference.description')}</p>
            </header>

            {/* Thermocouple Color Codes Section */}
            <section>
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('reference.thermocoupleTitle')}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('reference.thermocoupleDesc')}</p>
                    <div className="mt-6 space-y-8">
                        {thermocoupleStandards.map(standard => (
                            <ThermocoupleColorCodeTable key={standard.name} standard={standard} />
                        ))}
                    </div>
                </div>
            </section>

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
        </div>
    );
};