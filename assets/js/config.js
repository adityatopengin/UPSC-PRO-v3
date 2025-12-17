 /**
 * CONFIG.JS
 * Single Source of Truth for Data, Settings, and Links.
 */

const CONFIG = {
    // App Metadata
    version: "3.5.0",
    name: "UPSC Pro",
    
    // Quiz Defaults
    defaults: {
        mode: 'test',       // Default mode
        qCount: 10,         // Default question count
        randomize: true,    // Always shuffle by default
        // Time per question in seconds
        timePerQ_GS: 72,    // 100 Qs in 120 mins
        timePerQ_CSAT: 90   // 80 Qs in 120 mins
    },

    // External Resource Links (Manage your links here)
    resources: {
        psirDrive: "https://drive.google.com/drive/folders/1-2kk78IRyyhx3TFV2_87cm_iGgdWMwQH",
        toppers: [
            { name: 'Vision',   char: 'V',  color: 'slate',   url: 'http://www.visionias.in/resources/toppers_answers.php' },
            { name: 'Forum',    char: 'F',  color: 'red',     url: 'https://forumias.com/blog/testimonials/' },
            { name: 'Insights', char: 'I',  color: 'teal',    url: 'https://www.insightsonindia.com/upsc-toppers-answer-copies-download-ias-topper-mains-copies-by-insightsias/' },
            { name: 'Next IAS', char: 'N',  color: 'emerald', url: 'https://www.nextias.com/toppers-answers-ias' },
            { name: 'Drishti',  char: 'D',  color: 'amber',   url: 'https://www.drishtiias.com/free-downloads/toppers-copy/' },
            { name: 'Vajiram',  char: 'VR', color: 'yellow',  url: 'https://vajiramandravi.com/upsc-ias-toppers-copy-and-answer-sheets/' }
        ]
    },

    // Subject Registry: GS Paper 1
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
        // Normalize comparison (handle ID or Name)
        const match = all.find(s => s.name === subjectName || s.id === subjectName);
        return match ? match.file : 'mix_test.json';
    }
};

// Freeze to prevent accidental modification during runtime
Object.freeze(CONFIG);

