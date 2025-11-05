import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from '../hooks/useTranslation';

// Type definitions for the sensor data, as this component is now aware of it.
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
  implementationGuide: string;
}

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  filename: string;
  sensorData?: RecommendationData | null; // New optional prop
  imageTargetRef?: React.RefObject<HTMLElement>; // New optional prop for specific image capture
}

// New function to generate a high-quality, text-based PDF for sensor recommendations
const generateSensorPdf = async (doc: jsPDF, data: RecommendationData, t: (key: string) => any, imageTargetRef?: React.RefObject<HTMLElement>) => {
    let y = 40;
    const margin = 40; // in points
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - 2 * margin;

    const checkY = (increment: number) => {
        if (y + increment > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        } else {
            y += increment;
        }
    };
    
    const drawHeader = (text: string, size = 14) => {
        if (!text) return;
        // checkY(size * 1.5 + 5); // checkY is now handled before drawing complex elements
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
        doc.text(text, margin, y);
        y += size * 1.2;
    };

    const drawText = (text: string, size = 10, indent = 0) => {
        if (!text) return;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, usableWidth - indent);
        const textHeight = lines.length * size * 1.2;

        if (y + textHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }

        for (const line of lines) {
            doc.text(line, margin + indent, y);
            y += size * 1.2;
        }
    };

    // --- PDF Content ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(t('pdf.sensorReport.title'), pageWidth / 2, y, { align: 'center' });
    y += 30;

    const topChoice = data.recommendations?.find(r => r.isTopChoice) || data.recommendations?.[0];

    if (!topChoice) {
        drawText("No recommendations available.", 12);
        return;
    }

    checkY(20);
    drawHeader(t('pdf.sensorReport.justification'));
    drawText(topChoice.justification);
    
    checkY(20);
    drawHeader(t('pdf.sensorReport.recommendedTechnologies'));
    
    if (imageTargetRef?.current) {
        try {
            const canvas = await html2canvas(imageTargetRef.current, {
                scale: 2, // Higher resolution
                backgroundColor: '#ffffff', // Explicitly set white background
                logging: false,
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            const imgWidth = usableWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            if (y + imgHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin;
            }

            doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
            y += imgHeight;
        } catch (e) {
            console.error("html2canvas failed, falling back to text", e);
            drawText("Error: Could not render visual cards.", 10);
        }
    } else {
        // Fallback to text if no image target is provided
        data.recommendations?.forEach(rec => {
            y += 15;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            const title = rec.isTopChoice ? `${rec.technology} (${t('pdf.sensorReport.topChoice')})` : rec.technology;
            doc.text(title, margin, y);
            y += 14;
        });
    }

    checkY(20);
    drawHeader(t('pdf.sensorReport.suggestedModels'));
    drawText(topChoice.suggestedModels);
    y += 10;
    if (data.modelsDisclaimer) {
        drawText(data.modelsDisclaimer, 8);
    }

    if (data.installationConsiderations && data.installationConsiderations.length > 0) {
        checkY(20);
        drawHeader(t('pdf.sensorReport.installationConsiderations'));
        data.installationConsiderations.forEach(item => {
            y += 2;
            drawText(`• ${item}`, 10, 10);
        });
    }

    if (data.wiringWarning && data.wiringWarning.title && data.wiringWarning.content) {
        checkY(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor('#c05621'); // dark orange
        doc.text(data.wiringWarning.title, margin, y);
        y += 15;
        doc.setTextColor('#000000');
        drawText(data.wiringWarning.content);
    }

    if (data.implementationGuide) {
        checkY(20);
        drawHeader(t('pdf.sensorReport.implementationGuide'));
        doc.setFillColor(243, 244, 246); // Light gray
        const codeLines = doc.splitTextToSize(data.implementationGuide, usableWidth - 10);
        const codeHeight = codeLines.length * 8 * 1.2 + 10;
        
        if (y + codeHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }
        
        doc.rect(margin, y, usableWidth, codeHeight, 'F');
        y += 10;
        
        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor('#111827');
        
        for (const line of codeLines) {
            doc.text(line, margin + 5, y);
            y += 8 * 1.2;
        }
    }
};

export const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, filename, sensorData, imageTargetRef }) => {
    const { t } = useTranslation();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        // NEW LOGIC: If sensorData is provided, use programmatic PDF generation
        if (sensorData) {
            try {
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'pt',
                    format: 'a4'
                });
                await generateSensorPdf(pdf, sensorData, t, imageTargetRef);
                pdf.save(`${filename}.pdf`);
            } catch (error) {
                console.error("Error generating sensor PDF:", error);
                alert("Failed to export PDF. Please try again.");
            } finally {
                setIsExporting(false);
            }
            return;
        }

        // --- FALLBACK LOGIC (html2canvas) ---
        if (!targetRef.current) {
            setIsExporting(false);
            return;
        }
        
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
            
            const pageHeight = pdf.internal.pageSize.getHeight() - 2 * margin;
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
              position -= pageHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight);
              heightLeft -= pageHeight;
            }

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