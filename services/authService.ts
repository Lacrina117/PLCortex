// FIX: Implemented the authService to manage the mock authentication flow.
/**
 * =============================================================================
 * IMPORTANT - MOCK IMPLEMENTATION
 * =============================================================================
 * This service file provides a MOCK implementation of the authentication backend.
 * In a real-world application, this file would contain `fetch` calls to secure
 * server endpoints (e.g., POST /api/validate-code). The logic for managing
 * codes, passwords, and state would reside entirely on the server with a
 * proper database.
 *
 * This client-side simulation is for demonstration purposes only within this
 * environment. It allows the frontend UI and user/admin flows to be fully
 * functional as specified.
 * =============================================================================
 */

export interface AccessCode {
  id: string;
  accessCode: string;
  createdAt: string;
  isActive: boolean;
  description: string;
}

// --- Mock Database and Constants ---

const ADMIN_PASSWORD = "lacrina117";
const MOCK_DB_STORAGE_KEY = 'plcortex_access_codes_db';

// A fixed, static list of 20 codes to ensure they are always the same.
const STATIC_ACCESS_CODES: string[] = [
    'A7B3-9CDE-F1G5-H2J4', 'K6L8-M9N1-P2Q3-R4S5', 'T7V9-W1X2-Y3Z4-A5B6',
    'C8D9-E1F2-G3H4-J5K6', 'L7M8-N9P1-Q2R3-S4T5', 'V6W7-X8Y9-Z1A2-B3C4',
    'D5E6-F7G8-H9J1-K2L3', 'M4N5-P6Q7-R8S9-T1V2', 'W3X4-Y5Z6-A7B8-C9D1',
    'E2F3-G4H5-J6K7-L8M9', 'N1P2-Q3R4-S5T6-V7W8', 'X9Y1-Z2A3-B4C5-D6E7',
    'F8G9-H1J2-K3L4-M5N6', 'P7Q8-R9S1-T2V3-W4X5', 'Y6Z7-A8B9-C1D2-E3F4',
    'G5H6-J7K8-L9M1-N2P3', 'Q4R5-S6T7-V8W9-X1Y2', 'Z3A4-B5C6-D7E8-F9G1',
    'H2J3-K4L5-M6N7-P8Q9', 'R1S2-T3V4-W5X6-Y7Z8'
];

const createInitialDatabase = (): AccessCode[] => {
    const codes = STATIC_ACCESS_CODES.map((codeStr, i) => ({
        id: `code_${i + 1}`,
        accessCode: codeStr,
        createdAt: new Date().toISOString(),
        isActive: true,
        description: '',
    }));
    
    // For demonstration, let's make a few inactive
    codes[18].isActive = false;
    codes[19].isActive = false;
    codes[19].description = 'Example Disabled';
    return codes;
};

// --- Persistence Logic ---
const saveDatabase = (db: AccessCode[]) => {
    try {
        localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
        console.error("Failed to save mock database to localStorage", e);
    }
};

const loadDatabase = (): AccessCode[] => {
    try {
        const storedData = localStorage.getItem(MOCK_DB_STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData) as AccessCode[];
            // Basic validation to ensure data integrity
            if (Array.isArray(parsedData) && parsedData.length > 0 && 'accessCode' in parsedData[0] && 'isActive' in parsedData[0]) {
                 // If the stored codes don't match the static list (e.g., from a previous version), reset.
                if (parsedData.length !== STATIC_ACCESS_CODES.length || parsedData.some((c, i) => c.accessCode !== STATIC_ACCESS_CODES[i])) {
                     const newDb = createInitialDatabase();
                     saveDatabase(newDb);
                     return newDb;
                }
                return parsedData;
            }
        }
    } catch (e) {
        console.error("Failed to load mock database from localStorage", e);
    }
    // If nothing is stored, or data is invalid/old format, create and store a new one.
    const newDb = createInitialDatabase();
    saveDatabase(newDb);
    return newDb;
};


let mockCodeDatabase: AccessCode[] = loadDatabase();

// --- Service Functions (Simulating API calls) ---

export const isMasterPassword = (input: string): boolean => {
    return input === ADMIN_PASSWORD;
};

export const validateCode = (code: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const foundCode = mockCodeDatabase.find(c => c.accessCode === code);
      if (foundCode && foundCode.isActive) {
        // Code is valid and active. Don't mark as used.
        resolve();
      } else {
        // Reject if not found or not active
        reject(new Error('Invalid or inactive code.'));
      }
    }, 500); // Simulate network delay
  });
};

export const adminLogin = (password: string): Promise<{ token: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_token', 'mock-admin-token');
        resolve({ token: 'mock-admin-token' });
      } else {
        reject(new Error('Invalid admin credentials.'));
      }
    }, 500);
  });
};

export const adminLogout = (): void => {
    sessionStorage.removeItem('admin_token');
};

const checkAdminAuth = (): boolean => {
    return sessionStorage.getItem('admin_token') === 'mock-admin-token';
};

export const getCodes = (): Promise<AccessCode[]> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!checkAdminAuth()) {
                return reject(new Error('Unauthorized'));
            }
            resolve(JSON.parse(JSON.stringify(mockCodeDatabase))); // Return a copy
        }, 300);
    });
};

export const updateCode = (id: string, updates: Partial<Pick<AccessCode, 'isActive' | 'description'>>): Promise<AccessCode> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!checkAdminAuth()) {
                return reject(new Error('Unauthorized'));
            }
            const codeIndex = mockCodeDatabase.findIndex(c => c.id === id);
            if (codeIndex > -1) {
                const updatedCode = { ...mockCodeDatabase[codeIndex], ...updates };
                mockCodeDatabase[codeIndex] = updatedCode;
                saveDatabase(mockCodeDatabase); // Persist change
                resolve(updatedCode);
            } else {
                reject(new Error('Code not found.'));
            }
        }, 100);
    });
};