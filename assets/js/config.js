/**
 * CONFIG.JS
 * The Central Registry for Data, Links, and UI Configuration.
 */

const CONFIG = {
    // App Versioning
    version: "4.0.0",
    name: "UPSC Pro",
    
    // Quiz Defaults
    defaults: {
        mode: 'test',
        qCount: 10,
        randomize: true,
        timePerQ_GS: 72,   // 72 seconds per Q
        timePerQ_CSAT: 90  // 90 seconds per Q
    },

    // 1. RESOURCE LINKS (Coaching Archives)
    resources: {
        // PSIR Optional Links (Split)
        psir: {
            drive: "https://drive.google.com/drive/folders/1-2kk78IRyyhx3TFV2_87cm_iGgdWMwQH",
            topperRepo: "https://t.me/PSIR_Toppers_Copies" // Example or your specific link
        },

        // The 9 Coaching Institutes (Corrected)
        institutes: [
            { name: 'Vision IAS',     char: 'V',  color: 'slate',   url: 'http://www.visionias.in/resources/toppers_answers.php' },
            { name: 'Forum IAS',      char: 'F',  color: 'red',     url: 'https://forumias.com/blog/testimonials/' },
            { name: 'Insights',       char: 'I',  color: 'teal',    url: 'https://www.insightsonindia.com/upsc-toppers-answer-copies-download-ias-topper-mains-copies-by-insightsias/' },
            { name: 'Next IAS',       char: 'N',  color: 'blue',    url: 'https://www.nextias.com/toppers-answers-ias' },
            { name: 'Drishti IAS',    char: 'D',  color: 'amber',   url: 'https://www.drishtiias.com/free-downloads/toppers-copy/' },
            { name: 'Vajiram',        char: 'VR', color: 'yellow',  url: 'https://vajiramandravi.com/upsc-ias-toppers-copy-and-answer-sheets/' },
            { name: 'Shubhra Ranjan', char: 'SR', color: 'purple',  url: 'https://www.shubhraviraj.com/' }, // Corrected
            { name: 'Rau\'s IAS',     char: 'R',  color: 'indigo',  url: 'https://www.rauias.com/toppers-copies/' },
            { name: 'IAS Baba',       char: 'IB', color: 'emerald', url: 'https://iasbaba.com/toppers-answer-copies/' }
        ]
    },

    // 2. EYECATCHER CARDS (Smart Notes Library)
    // Gradients: gold, emerald, royal, purple
    notesLibrary: [
        { title: "Ancient India",       subtitle: "Timeline & Maps",       icon: "monument",     gradient: "gold" },
        { title: "Modern History",      subtitle: "Freedom Struggle",      icon: "scroll",       gradient: "royal" },
        { title: "Indian Polity",       subtitle: "Articles & Amendments", icon: "gavel",        gradient: "purple" },
        { title: "Economy",             subtitle: "Budget & Survey",       icon: "chart-line",   gradient: "emerald" },
        { title: "Environment",         subtitle: "Conventions & Parks",   icon: "leaf",         gradient: "emerald" },
        { title: "Art & Culture",       subtitle: "Dance, Music & Arch",   icon: "palette",      gradient: "gold" },
        { title: "Geography",           subtitle: "Physical & Human",      icon: "earth-asia",   gradient: "royal" },
        { title: "Science & Tech",      subtitle: "Space & Defense",       icon: "rocket",       gradient: "purple" },
        { title: "Ethics (GS4)",        subtitle: "Key Definitions",       icon: "scale-balanced",gradient: "gold" },
        { title: "Essay Quotes",        subtitle: "Topic-wise List",       icon: "quote-left",   gradient: "royal" },
        { title: "Govt Schemes",        subtitle: "Ministry-wise",         icon: "building-columns", gradient: "purple" },
        { title: "Maps & Places",       subtitle: "News Locations",        icon: "map-location-dot", gradient: "emerald" }
    ],

    // 3. SUBJECT REGISTRY (Paper 1 & 2)
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

    subjectsCSAT: [
        { id: 'quant',      name: 'Mathematics',       icon: 'calculator',        color: 'slate',  file: 'csat_math.json' },
        { id: 'reasoning',  name: 'Reasoning',         icon: 'brain',             color: 'rose',   file: 'csat_reasoning.json' },
        { id: 'rc',         name: 'Reading Passage',   icon: 'book-open-reader',  color: 'teal',   file: 'csat_passage.json' }
    ],

    // Helper to find file by name or ID
    getFileName: function(query) {
        const all = [...this.subjectsGS1, ...this.subjectsCSAT];
        const match = all.find(s => s.id === query || s.name === query);
        // Fallback for random/mixed tests
        return match ? match.file : 'polity.json'; 
    }
};

Object.freeze(CONFIG);



