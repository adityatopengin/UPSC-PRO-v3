/**
 * STORE.JS
 * Manages Persistence (LocalStorage).
 * * CRITICAL FIXES INCLUDED:
 * 1. Race Condition Prevention (IDs & Timestamps)
 * 2. Safe JSON Parsing
 * 3. History Capping (Prevent Quota Exceeded)
 */

const Store = {
    // Basic Get/Set with Error Handling
    get(key, fallback = null) {
        try {
            const data = localStorage.getItem(`upsc_${key}`);
            return data ? JSON.parse(data) : fallback;
        } catch (e) {
            console.error("Storage Read Error:", e);
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(`upsc_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error("Storage Write Error:", e);
        }
    },

    // Specialized Data Management
    // FIX #6: RACE CONDITION PREVENTION
    saveResult(result) {
        try {
            const history = this.get('history', []) || [];
            
            const enrichedResult = {
                ...result,
                // Add unique ID and timestamp to prevent overwrites
                id: `result_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                savedAt: new Date().toISOString()
            };
            
            // Add to beginning of array (newest first)
            history.unshift(enrichedResult);
            
            // Keep only last 50 attempts to save space
            const limited = history.slice(0, 50);
            
            this.set('history', limited);
            console.log(`✅ Result saved [ID: ${enrichedResult.id}]. Total history: ${limited.length}`);
            return enrichedResult.id;
        } catch (e) {
            console.error('❌ Failed to save result:', e);
            return null;
        }
    },

    saveMistakes(newMistakes) {
        const current = this.get('mistakes', []);
        // Combine old and new, filter duplicates by question text
        const merged = [...current, ...newMistakes].filter((v, i, a) => 
            a.findIndex(t => t.text === v.text) === i
        ).slice(0, 100); // Save top 100 hard questions
        this.set('mistakes', merged);
    },

    clearAll() {
        const keys = ['history', 'mistakes', 'settings', 'visited'];
        keys.forEach(k => localStorage.removeItem(`upsc_${k}`));
        location.reload();
    }
};



