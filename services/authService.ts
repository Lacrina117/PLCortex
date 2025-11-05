// FIX: Refactored to use API endpoints instead of mock localStorage database.
/**
 * =============================================================================
 * PRODUCTION AUTH SERVICE
 * =============================================================================
 * This service now communicates with Vercel Serverless Functions (/api/auth/*)
 * to handle access code validation and management. The serverless functions
 * are responsible for securely interacting with the Vercel KV database.
 * =============================================================================
 */

export interface AccessCode {
  id: string;
  accessCode: string;
  createdAt: string;
  isActive: boolean;
  description: string;
}

const ADMIN_PASSWORD = "lacrina117";
const USER_MASTER_PASSWORD = "150995";

// --- Service Functions (Calling API endpoints) ---

export const isMasterPassword = (input: string): boolean => {
    return input === ADMIN_PASSWORD;
};

export const isUserMasterPassword = (input: string): boolean => {
    return input === USER_MASTER_PASSWORD;
};

export const validateCode = async (code: string): Promise<string> => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode: code }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Invalid or inactive code.');
  }
  
  const data = await response.json();
  sessionStorage.setItem('user_token', 'validated');
  sessionStorage.setItem('user_description', data.description || '');
  return data.description || '';
};

export const adminLogin = (password: string): Promise<{ token: string }> => {
  return new Promise((resolve, reject) => {
    // Admin login/logout can remain a simple sessionStorage check for this app's purpose.
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

export const logout = (): void => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('user_token');
    sessionStorage.removeItem('user_description');
};

export const getUserDescription = (): string | null => {
    return sessionStorage.getItem('user_description');
};

export const isUserLoggedIn = (): boolean => {
    return !!sessionStorage.getItem('user_token');
};

const getAdminToken = (): string | null => {
    return sessionStorage.getItem('admin_token');
};

export const getCodes = async (): Promise<AccessCode[]> => {
    const token = getAdminToken();
    if (!token) {
        throw new Error('Unauthorized');
    }
    const response = await fetch('/api/admin', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch codes.');
    }
    return response.json();
};

export const updateCode = async (id: string, updates: Partial<Pick<AccessCode, 'isActive' | 'description'>>): Promise<AccessCode> => {
    const token = getAdminToken();
    if (!token) {
        throw new Error('Unauthorized');
    }
    const response = await fetch(`/api/admin`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, updates }),
    });
    if (!response.ok) {
        throw new Error('Failed to update code.');
    }
    return response.json();
};