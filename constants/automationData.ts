// FIX: Implemented the automationData constants file to provide data for VFDs and PLCs.

export const vfdBrands: string[] = [
    'General',
    'Siemens',
    'Allen-Bradley',
    'ABB',
    'Yaskawa',
    'Danfoss',
    'Schneider Electric',
    'Mitsubishi Electric',
    'Eaton'
];

export const vfdModelsByBrand: { [key: string]: string[] } = {
    'Siemens': ['Sinamics G120', 'Sinamics V20', 'Micromaster 440'],
    'Allen-Bradley': ['PowerFlex 523', 'PowerFlex 525', 'PowerFlex 755', 'PowerFlex 4M'],
    'ABB': ['ACS355', 'ACS580', 'ACS880'],
    'Yaskawa': ['V1000', 'A1000', 'GA500'],
    'Danfoss': ['VLT FC 302', 'VLT Micro Drive FC 51'],
    'Schneider Electric': ['Altivar Machine ATV320', 'Altivar Process ATV630', 'Altivar Process ATV650'],
    'Mitsubishi Electric': ['FR-E800', 'FR-D700'],
    'Eaton': ['PowerXL DG1'],
    'General': [],
};

export const plcBrands: string[] = [
    'General',
    'Siemens',
    'Allen-Bradley',
    'Schneider Electric',
    'Mitsubishi Electric',
    'Eaton',
];

export const plcSoftwareByBrand: { [key: string]: string[] } = {
    'Siemens': ['TIA Portal', 'SIMATIC Step 7'],
    'Allen-Bradley': ['Studio 5000', 'RSLogix 500', 'RSLogix 5', 'Connected Components Workbench'],
    'Schneider Electric': ['EcoStruxure Machine Expert (SoMachine)', 'EcoStruxure Control Expert (Unity Pro)'],
    'Mitsubishi Electric': ['GX Works3', 'GX Works2'],
    'Eaton': ['Power Xpert inControl', 'WebUI'],
    'General': [],
};

export const plcVersionsBySoftware: { [key: string]: string[] } = {
    'TIA Portal': ['v15', 'v16', 'v17', 'v18', 'v19'],
    'Studio 5000': ['v30', 'v31', 'v32', 'v33', 'v34', 'v35'],
    'RSLogix 500': ['v10', 'v11', 'v12'],
    'Connected Components Workbench': ['v11', 'v12', 'v13', 'v20', 'v21', 'v22'],
    'GX Works3': ['1.050C', '1.060N', '1.070W'],
    'GX Works2': ['1.501F', '1.590Q'],
    'General': [],
};

export const plcLanguages: string[] = [
    'Ladder Diagram (LD)',
    'Function Block Diagram (FBD)',
    'Structured Text (ST)',
    'Instruction List (IL)',
    'Sequential Function Chart (SFC)',
];