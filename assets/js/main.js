/**
 * MAIN.JS - The Master Controller
 * Final Integration: Coordinates Store, Adapter, Engine, and UI.
 * Features: Fog-Footer Navigation, JSON Normalization, UPSC Logic.
 */

const Main = {
    state: {
        view: 'home',
        paper: 'gs1', // 'gs1' or 'csat'
        settings: { theme: 'light' }
    },

    /**
     * Entry point: Runs when index.html is loaded
     */
    init() {
        console.log("UPSC Pro v4.0: Initializing Modular System...");
        
        // 1. Load User Preferences from Store
        this.state.settings = Store.get('settings', { theme: 'light' });
        if (this.state.settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        }

        // 2. Initial Routing: Check if first-time user
        const hasVisited = Store.get('visited', false);
        if (!hasVisited) {
            UI.modals.orientation(); // Show orientation if never visited
        } else {
            this.navigate('home');
        }

        // 3. Listen for Global Time Up Event
        window.addEventListener('timeUp', () => {
            alert("Time's Up!");
            this.finishQuiz();
        });
    },

    /**
     * The Router: Switches views and cleans up logic
     */
    navigate(view, data = null) {
        // Cleanup: Stop quiz timer if we are leaving the quiz screen
        if (this.state.view === 'quiz' && view !== 'quiz') {
            Engine._stopTimer();
        }

        this.state.view = view;

        // A. Render Global UI Components
        UI.renderHeader(view);
        
        // Show the 3-button Fog Footer only on main tabs
        const nav = document.getElementById('app-nav');
        if (['home', 'notes', 'stats', 'settings'].includes(view)) {
            UI.renderFooter(view); // Home, Notes, Stats
            nav.classList.remove('hidden');
        } else {
            nav.classList.add('hidden'); // Hide footer during Quiz or Analysis
        }

        // B. Render View Specific Content
        const mainEl = document.getElementById('main-view');
        switch(view) {
            case 'home':
                const subjects = this.state.paper === 'gs1' ? CONFIG.subjectsGS1 : CONFIG.subjectsCSAT;
                UI.drawHome(this.state.paper, subjects);
                break;
            case 'notes':
                UI.drawNotes();
                break;
            case 'stats':
                this._renderStats(mainEl);
                break;
            case 'quiz':
                UI.drawQuiz(Engine.state.activeQuiz);
                break;
            case 'analysis':
                UI.drawAnalysis(data);
                break;
            case 'settings':
                this._renderSettings(mainEl);
                break;
        }

        mainEl.scrollTo(0, 0); // Reset scroll position
    },

    /**
     * Logic to Fetch JSON and Start Quiz
     */
    async triggerStart(subjectName) {
        UI.loader(true);
        UI.hideModal();

        try {
            // 1. Resolve filename from Config file
            const fileName = CONFIG.getFileName(subjectName);
            
            // 2. Fetch the JSON file from /data/
            const response = await fetch(`data/${fileName}`);
            if (!response.ok) throw new Error("JSON file not found: " + fileName);
            const rawData = await response.json();

            // 3. Use ADAPTER to fix "undefined" fields and normalize structure
            const cleanQuestions = Adapter.normalize(rawData);
            if (!cleanQuestions.length) throw new Error("No valid questions found.");

            // 4. Capture User Config (Count & Mode) from the Setup Modal
            const countBtn = document.querySelector('#q-counts .bg-slate-900, #q-counts .dark\\:bg-white');
            const count = parseInt(countBtn?.innerText || 10);
            const modeBtn = document.querySelector('#q-modes .bg-slate-900, #q-modes .dark\\:bg-white');
            const mode = modeBtn?.innerText.toLowerCase().includes('test') ? 'test' : 'learning';

            // 5. Start the Engine
            Engine.startSession({ 
                subject: subjectName, 
                count: count, 
                mode: mode, 
                paper: this.state.paper 
            }, cleanQuestions);

            // 6. Navigate to Quiz View
            this.navigate('quiz');

        } catch (e) {
            console.error("Quiz Launch Failed:", e);
            alert("Error: " + e.message);
        } finally {
            UI.loader(false);
        }
    },

    /**
     * Quiz Interactions
     */
    handleOption(idx) {
        Engine.saveAnswer(idx);
        UI.drawQuiz(Engine.state.activeQuiz); 
    },

    moveQ(dir) {
        if (Engine.moveTo(Engine.state.activeQuiz.currentIdx + dir)) {
            UI.drawQuiz(Engine.state.activeQuiz);
        }
    },

    finishQuiz() {
        if (this.state.view !== 'quiz') return;
        
        const result = Engine.calculateFinal();
        
        // Save to LocalStorage
        Store.saveResult(result);
        const hardQs = result.fullData.filter(q => q.attempted && !q.isCorrect);
        Store.saveMistakes(hardQs);

        this.navigate('analysis', result);
    },

    /**
     * Global App Actions
     */
    togglePaper(type) {
        this.state.paper = type;
        this.navigate('home');
    },

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        this.state.settings.theme = isDark ? 'dark' : 'light';
        Store.set('settings', this.state.settings);
        this.navigate('settings');
    },

    completeOrientation() {
        Store.set('visited', true);
        UI.hideModal();
        this.navigate('home');
    },

    // Inline renderers for static pages
    _renderSettings(container) {
        container.innerHTML = `
        <div class="px-2 pt-6 space-y-6 animate-view-enter">
            <div class="glass-card p-6 rounded-[32px] flex items-center justify-between">
                <div><h3 class="text-sm font-black">Dark Mode</h3><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toggle Theme</p></div>
                <button onclick="Main.toggleTheme()" class="w-12 h-7 bg-slate-200 dark:bg-blue-600 rounded-full relative transition-colors">
                    <div class="w-5 h-5 bg-white rounded-full absolute top-1 left-1 dark:left-6 transition-all"></div>
                </button>
            </div>
            <div onclick="UI.modals.orientation(true)" class="glass-card p-6 rounded-[32px] flex items-center justify-between cursor-pointer active:scale-95">
                <div><h3 class="text-sm font-black text-blue-600">Replay Orientation</h3><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listen to Instructions</p></div>
                <i class="fa-solid fa-play text-blue-500"></i>
            </div>
        </div>`;
    },

    _renderStats(container) {
        const history = Store.get('history', []);
        container.innerHTML = `
        <div class="px-2 pb-32 space-y-6 animate-view-enter">
            <div class="glass-card p-8 rounded-[40px] text-center">
                <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Quiz History</p>
                <div class="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">${history.length}</div>
                <p class="text-[10px] font-bold text-slate-400 uppercase mt-2">Tests Attempted</p>
            </div>
            ${history.map(h => `
                <div class="glass-card p-5 rounded-3xl flex justify-between items-center mb-3">
                    <div><h4 class="text-sm font-black">${h.subject}</h4><p class="text-[9px] font-bold text-slate-400">${new Date(h.date).toLocaleDateString()}</p></div>
                    <div class="text-right"><div class="text-lg font-black text-blue-600">${h.score}</div><div class="text-[8px] font-black text-slate-400 uppercase">Score</div></div>
                </div>`).join('')}
        </div>`;
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => Main.init());

