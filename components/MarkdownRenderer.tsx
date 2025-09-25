// FIX: Implemented a reusable markdown rendering component.
import React from 'react';

// Helper for inline markdown elements like bold and inline code.
const formatInlineMarkdown = (text: string): string => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800 dark:text-gray-200">$1</strong>') // Bold
        .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 text-pink-500 dark:text-pink-400 rounded-md px-1.5 py-1 text-sm font-mono">$1</code>'); // Inline code
};

export const MarkdownRenderer: React.FC<{ markdownText: string }> = ({ markdownText }) => {
    const lines = markdownText.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.trim().startsWith('```')) {
            const codeLines = [];
            const lang = line.trim().substring(3).trim();
            i++; 
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(
                <div key={elements.length} className="my-4 rounded-lg shadow-inner bg-gray-100 dark:bg-gray-900/50 relative">
                    {lang && <span className="absolute top-2 right-3 text-xs text-gray-500">{lang}</span>}
                    <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200">
                        <code>{codeLines.join('\n')}</code>
                    </pre>
                </div>
            );
            i++; 
            continue;
        }
        
        if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---') && lines[i + 1].includes('|')) {
            const tableData: { header: string[]; rows: string[][] } = { header: [], rows: [] };
            tableData.header = line.split('|').map(h => h.trim()).filter(Boolean);
            i += 2;
            while (i < lines.length && lines[i].includes('|')) {
                const row = lines[i].split('|').map(c => c.trim()).filter(Boolean);
                 if (row.length === tableData.header.length) {
                    tableData.rows.push(row);
                    i++;
                 } else { break; }
            }
            if (tableData.header.length > 0) {
                 elements.push(
                    <div key={elements.length} className="overflow-x-auto my-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>{tableData.header.map((h, idx) => <th key={idx} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>)}</tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {tableData.rows.map((row, rIdx) => <tr key={rIdx}>{row.map((cell, cIdx) => <td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }} />)}</tr>)}
                            </tbody>
                        </table>
                    </div>
                );
                continue;
            } else { // reset 'i' if table parsing failed
                i -= tableData.rows.length + 2;
            }
        }
        
        if (line.startsWith('# ')) {
            elements.push(<h1 key={elements.length} className="text-3xl font-extrabold mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.substring(2)) }} />);
            i++; continue;
        }
        if (line.startsWith('## ')) {
            elements.push(<h2 key={elements.length} className="text-2xl font-bold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.substring(3)) }} />);
            i++; continue;
        }
        if (line.startsWith('### ')) {
            elements.push(<h3 key={elements.length} className="text-xl font-semibold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.substring(4)) }} />);
            i++; continue;
        }
        
        const listMatch = line.trim().match(/^(\*|-|\d+\.)\s/);
        if (listMatch) {
            const listItems = [];
            const listType = (listMatch[1] === '*' || listMatch[1] === '-') ? 'ul' : 'ol';
            const listClass = `pl-5 my-4 space-y-2 ${listType === 'ul' ? 'list-disc' : 'list-decimal'}`;

            while (i < lines.length) {
                const currentLine = lines[i];
                const itemMatch = currentLine.trim().match(/^(\*|-|\d+\.)\s/);
                if (itemMatch) {
                     const itemContent = currentLine.trim().replace(/^(\*|-|\d+\.)\s/, '');
                     listItems.push(<li key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemContent) }} />);
                     i++;
                } else {
                    break;
                }
            }
            elements.push(React.createElement(listType, { key: elements.length, className: listClass }, listItems));
            continue;
        }

        if (line.trim() !== '') {
            elements.push(<p key={elements.length} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />);
        }
        
        i++;
    }

    return <>{elements}</>;
};