import { View } from '../App';

const STORAGE_KEY = 'plcortex_recent_activity';
const MAX_RECENT_ITEMS = 3;

/**
 * Retrieves the list of recently used views from localStorage.
 * @returns An array of view keys.
 */
export const getRecentActivity = (): View[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const views = JSON.parse(stored);
            if (Array.isArray(views)) {
                // Basic validation to ensure stored items are valid views
                const validViews: View[] = ['solutions', 'practices', 'tools', 'reference', 'calculator'];
                return views.filter(v => validViews.includes(v));
            }
        }
    } catch (e) {
        console.error('Failed to get recent activity:', e);
        // Clear potentially corrupted data
        localStorage.removeItem(STORAGE_KEY);
    }
    return [];
};

/**
 * Adds a new view to the top of the recent activity list.
 * @param view The view key to add.
 */
export const addRecentActivity = (view: View): void => {
    if (view === 'dashboard') {
        return;
    }

    try {
        let recent = getRecentActivity();
        // Remove the view if it already exists to move it to the front
        recent = recent.filter(v => v !== view);
        // Add the new view to the beginning
        recent.unshift(view);
        // Trim the array to the max size
        const trimmed = recent.slice(0, MAX_RECENT_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.error('Failed to add recent activity:', e);
    }
};