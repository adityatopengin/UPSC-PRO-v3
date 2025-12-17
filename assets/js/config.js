/**
 * CONFIG.JS
 * Single Source of Truth for App Data & Settings.
 * No hardcoding allowed elsewhere.
 */

const CONFIG = {
    // App Metadata
    version: "3.0.0",
    name: "UPSC Pro",
    
    // Default Settings
    defaults: {
        mode: 'test',       // 'test' or 'learning'
        qCount: 10,
        randomize: true,
        // Time per question in seconds
        timePerQ_GS: 72,    // 100 Qs in 120 mins
        timePerQ_CSAT: 90   // 80 Qs in 120 mins
    },

    // Subject Registry: GS Paper 1
    // Icon names refer to FontAwesome classes (without 'fa-')
    subjectsGS1: [
        { id: 'ancient',    name: 'Ancient History',   icon: 'land-mine-on',      color: 'amber',  file: 'ancient_history.json' },
        { id: 'medieval',   name: 'Medieval History',  icon: 'chess-rook',        color: 'amber',  file: 'medieval_history.json' },
        { id: 'modern',     name: 'Modern History',    icon: 'monument',          color: 'amber',  file: 'modern_history.json' },
        { id: 'art',        name: 'Art & Culture',     icon: 'palette',           color: 'pink',   file: 'art_culture.json' },
        { id: 'polity',     name: 'Indian Polity',     icon: 'landmark',          color: 'blue',   file: 'polity.json' },
        { id: 'geo_ind',    name: 'Indian Geography',  icon: 'map-location-dot',  color: 'cyan',   file: 'indian_geo.json' },
        { id: 'geo_world',  name: 'World Geography',   icon: 'earth-americas',    color: 'cyan',   file: 'world_geo.json' },
        { id: 'env',        name: 'Environment',       icon: 'leaf',              color: 'green',  file: 'environment.json' },
        { id: 'eco',        name: 'Indian Economy',    icon: 'indian-rupee-sign', color: 'emerald',file: 'economy.json' },
        { id: 'sci',        name: 'Science & Tech',    icon: 'microchip',         color: 'indigo', file: 'science_tech.json' },
        { id: 'ir',         name: 'Intl. Relations',   icon: 'handshake',         color: 'purple', file: 'ir.json' }
    ],

    // Subject Registry: CSAT Paper 2
    subjectsCSAT: [
        { id: 'quant',      name: 'Mathematics',       icon: 'calculator',        color: 'slate',  file: 'csat_math.json' },
        { id: 'reasoning',  name: 'Reasoning',         icon: 'brain',             color: 'rose',   file: 'csat_reasoning.json' },
        { id: 'rc',         name: 'Reading Passage',   icon: 'book-open-reader',  color: 'teal',   file: 'csat_passage.json' }
    ],

    // Helper: Get File Path by Subject Name or ID
    getFileName: function(subjectName) {
        const all = [...this.subjectsGS1, ...this.subjectsCSAT];
        const match = all.find(s => s.name === subjectName || s.id === subjectName);
        return match ? match.file : 'mix_test.json';
    }
};

// Freeze to prevent accidental modification during runtime
Object.freeze(CONFIG);

