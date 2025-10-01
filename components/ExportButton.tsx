import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from '../hooks/useTranslation';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  filename: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, filename }) => {
    const { t } = useTranslation();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!targetRef.current) return;
        setIsExporting(true);

        try {
            // Temporarily modify styles for better capture quality
            const originalShadow = targetRef.current.style.boxShadow;
            targetRef.current.style.boxShadow = 'none';

            const canvas = await html2canvas(targetRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            });
            
            // Restore original styles
            targetRef.current.style.boxShadow = originalShadow;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const margin = 20;
            const pdfWidth = pdf.internal.pageSize.getWidth() - (2 * margin);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const x = margin;
            const y = margin;

            pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
            pdf.save(`${filename}.pdf`);

        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert("Failed to export PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            title={t('export.pdf')}
        >
            {isExporting ? (
                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            )}
            <span className="hidden sm:inline">{t('export.pdf')}</span>
        </button>
    );
};
