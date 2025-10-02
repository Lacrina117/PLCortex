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
  isUsed: boolean;
}

// --- Mock Database and Constants ---

const ADMIN_PASSWORD = "lacrina117";

let mockCodeDatabase: AccessCode[] = [
    {
        id: '1',
        accessCode: 'ABCD-1234-WXYZ-9876',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        isUsed: false,
    },
    {
        id: '2',
        accessCode: 'QWER-5678-ASDF-5432',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        isUsed: true,
    },
];

// --- Helper Functions ---

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


// --- Service Functions (Simulating API calls) ---

export const isMasterPassword = (input: string): boolean => {
    return input === ADMIN_PASSWORD;
};

export const validateCode = (code: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const foundCode = mockCodeDatabase.find(c => c.accessCode === code);
      if (foundCode && !foundCode.isUsed) {
        // Mark the code as used instead of deleting it
        foundCode.isUsed = true;
        resolve();
      } else {
        reject(new Error('Invalid or already used code.'));
      }
    }, 500); // Simulate network delay
  });
};

export const adminLogin = (password: string): Promise<{ token: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        // In a real app, you'd get a JWT from the server.
        // We also store it to simulate a protected session.
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

export const generateCode = (): Promise<AccessCode> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
             if (!checkAdminAuth()) {
                return reject(new Error('Unauthorized'));
            }
            const newCode: AccessCode = {
                id: String(Date.now()),
                accessCode: generateRandomCode(),
                createdAt: new Date().toISOString(),
                isUsed: false,
            };
            mockCodeDatabase.push(newCode);
            resolve(newCode);
        }, 300);
    });
};

export const deleteCode = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!checkAdminAuth()) {
                return reject(new Error('Unauthorized'));
            }
            const codeIndex = mockCodeDatabase.findIndex(c => c.id === id);
            if (codeIndex > -1) {
                mockCodeDatabase.splice(codeIndex, 1);
                resolve();
            } else {
                reject(new Error('Code not found.'));
            }
        }, 200);
    });
};