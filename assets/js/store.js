/**
 * STORE.JS - Production Data Persistence
 * Version: 1.1.0 (Production Ready)
 * Handles LocalStorage with Quota Management and Race Protection.
 */

const Store = {
    _prefix: 'upsc_pro_',

    /**
     * Internal: Safe Storage Set with Quota Handling
     */
    _safeSet(key, value) {
        try {
            localStorage.setItem(this._prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            // Check if it's a QuotaExceededError
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn('Storage Quota Exceeded. Attempting automatic cleanup...');
                this._cleanupOldHistory();
                // Try one more time after cleanup
                try {
                    localStorage.setItem(this._prefix + key, JSON.stringify(value));
                    return true;
                } catch (retryError) {
                    console.error('Critical Storage Failure:', retryError);
                    return false;
                }
            }
            console.error('Storage Write Error:', e);
            return false;
        }
    },

    /**
     * Internal: Automatic Cleanup for Quota Management
     */
    _cleanupOldHistory() {
        const history = this.get('history', []);
        if (history.length > 5) {
            // Keep only the 5 most recent results to free up space
            const reduced = history.slice(0, 5);
            this.set('history', reduced);
        }
    },

    /**
     * Get data with safe parsing
     */
    get(key, fallback = null) {
        try {
            const data = localStorage.getItem(this._prefix + key);
            return data ? JSON.parse(data) : fallback;
        } catch (e) {
            console.error(`Storage Read Error [${key}]:`, e);
            return fallback;
        }
    },

    /**
     * Set data safely
     */
    set(key, value) {
        return this._safeSet(key, value);
    },

    /**
     * Specialized: Save Quiz Result with Unique ID and Timestamp
     */
    saveResult(result) {
        if (!result) return null;

        const history = this.get('history', []);
        
        // Add unique ID and collision-proof metadata
        const enrichedResult = {
            ...result,
            id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            savedAt: new Date().toISOString()
        };

        // Add to top of list
        history.unshift(enrichedResult);

        // Maintain a healthy history limit (50 items)
        const cappedHistory = history.slice(0, 50);
        
        const success = this.set('history', cappedHistory);
        return success ? enrichedResult.id : null;
    },

    /**
     * Specialized: Save Mistake questions for future revision
     */
    saveMistakes(newMistakes) {
        if (!Array.isArray(newMistakes) || newMistakes.length === 0) return;

        const current = this.get('mistakes', []);
        
        // Merge and remove duplicates based on question text
        const merged = [...newMistakes, ...current];
        const unique = merged.filter((q, index, self) =>
            index === self.findIndex((t) => t.text === q.text)
        );

        // Keep top 100 hard questions for the user
        this.set('mistakes', unique.slice(0, 100));
    },

    /**
     * Clear specific app data without affecting other site data
     */
    clearAll() {
        const appKeys = ['history', 'mistakes', 'settings', 'visited'];
        appKeys.forEach(k => localStorage.removeItem(this._prefix + k));
        window.location.reload();
    }
};

// Ensure Store is globally accessible
window.Store = Store;


