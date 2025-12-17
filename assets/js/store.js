/**
 * STORE.JS
 * Manages Persistence (LocalStorage).
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
    saveResult(result) {
        const history = this.get('history', []);
        history.unshift(result);
        // Keep only last 50 attempts to save space
        this.set('history', history.slice(0, 50));
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
