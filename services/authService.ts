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

const generateRandomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars like I, 1, O, 0
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i < 15) {
      result += '-';
    }
  }
  return result;
};

const createInitialDatabase = (): AccessCode[] => {
    const codes: AccessCode[] = [];
    for (let i = 0; i < 20; i++) {
        codes.push({
            id: `code_${i + 1}`,
            accessCode: generateRandomCode(),
            createdAt: new Date().toISOString(),
            isActive: true,
            description: '',
        });
    }
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
            const parsedData = JSON.parse(storedData);
            // Check for the old `isUsed` property to force regeneration if format is outdated
            if (Array.isArray(parsedData) && parsedData.length > 0 && 'accessCode' in parsedData[0] && !('isUsed' in parsedData[0])) {
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