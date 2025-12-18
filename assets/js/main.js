/**
 * MAIN.JS - The Master Controller
 * Version: 1.1.0 (Production Ready)
 * Orchestrates Store, Adapter, Engine, and UI modules.
 */

// ==========================================
// 1. DATA VALIDATION SCHEMA
// ==========================================
function validateQuestionsSchema(questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Question bank is empty or invalid.');
    }

    const errors = [];
    // Sanity check first 10 questions to ensure file isn't corrupted
    questions.slice(0, 10).forEach((q, idx) => {
        if (!q.text) errors.push(`Q${idx + 1}: Text missing`);
        if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`Q${idx + 1}: Options missing`);
        if (q.correct === undefined) errors.push(`Q${idx + 1}: Correct answer unresolvable`);
    });

    if (errors.length > 0) {
        throw new Error(`Data Integrity Error:\n${errors.slice(0, 3).join('\n')}`);
    }
    return true;
}

// ==========================================
// 2. NETWORK RESILIENCE (Fetch with Retry)
// ==========================================
const Network = {
    async fetchWithRetry(url, retries = 3, backoff = 1000) {
        try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (err) {
            if (retries > 0) {
                await new Promise(res => setTimeout(res, backoff));
                return this.fetchWithRetry(url, retries - 1, backoff * 2);
            }
            throw err;
        }
    }
};

// ==========================================
// 3. MAIN APPLICATION OBJECT
// ==========================================
const Main = {
    state: {
        view: 'home',
        paper: 'gs1', // 'gs1' or 'csat'
        settings: { theme: 'light' }
    },

    /**
     * Boot Sequence
     */
    init() {
        console.log("UPSC Pro: Initializing Production Core...");

        // 1. Theme Initialization
        this.state.settings = Store.get('settings', { theme: null });
        
        // Auto-detect system preference if no user setting exists
        if (!this.state.settings.theme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.state.settings.theme = prefersDark ? 'dark' : 'light';
        }

        if (this.state.settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        }

        // 2. First-Visit Logic
        const hasVisited = Store.get('visited', false);
        if (!hasVisited) {
            setTimeout(() => UI.modals.orientation(), 500);
        } else {
            this.navigate('home');
        }

        // 3. Global Event Listeners
        window.addEventListener('timeUp', () => {
            if (this.state.view === 'quiz') {
                this.finishQuiz();
            }
        });

        // 4. Handle Keyboard Navigation (Accessibility)
        document.addEventListener('keydown', (e) => {
            if (this.state.view !== 'quiz') return;
            if (e.key === 'ArrowRight') this.moveQ(1);
            if (e.key === 'ArrowLeft') this.moveQ(-1);
            if (e.key >= '1' && e.key <= '4') this.handleOption(parseInt(e.key) - 1);
        });
    },

    /**
     * THE ROUTER
     * Handles view switching and UI cleanup
     */
    navigate(view, data = null) {
        // Exit early if Engine is running a timer but we are leaving the quiz
        if (this.state.view === 'quiz' && view !== 'quiz') {
            Engine._stopTimer();
        }

        this.state.view = view;

        // Render Global Components
        UI.renderHeader(view);
        
        // Show/Hide Fog Footer based on view
        const isMainTab = ['home', 'notes', 'stats', 'settings'].includes(view);
        if (isMainTab) {
            UI.renderFooter(view);
        } else {
            const nav = document.getElementById('app-nav');
            if (nav) nav.classList.add('hidden');
        }

        // Render specific view
        const mainEl = document.getElementById('main-view');
        if (!mainEl) return;

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

        mainEl.scrollTo(0, 0);
    },

    /**
     * QUIZ INITIALIZATION
     */
    async triggerStart(subjectName) {
        UI.loader(true);
        UI.hideModal();

        try {
            const fileName = CONFIG.getFileName(subjectName);
            const rawData = await Network.fetchWithRetry(`data/${fileName}`);
            
            const questions = Adapter.normalize(rawData);
            validateQuestionsSchema(questions);

            // Capture user selection from Modal
            const countBtn = document.querySelector('#q-counts .count-btn.active');
            const modeBtn = document.querySelector('#q-modes .mode-btn.active');
            
            const config = {
                subject: subjectName,
                count: countBtn ? parseInt(countBtn.dataset.count) : 10,
                mode: modeBtn ? modeBtn.dataset.mode : 'test',
                paper: this.state.paper
            };

            Engine.startSession(config, questions);
            this.navigate('quiz');

        } catch (err) {
            console.error("Quiz Launch Failed:", err);
            alert(`Error: Could not load quiz data. Please check your connection.`);
        } finally {
            UI.loader(false);
        }
    },

    /**
     * QUIZ ACTIONS
     */
    handleOption(idx) {
        Engine.saveAnswer(idx);
        UI.drawQuiz(Engine.state.activeQuiz); 
    },

    moveQ(dir) {
        const q = Engine.state.activeQuiz;
        if (!q) return;
        
        const nextIdx = q.currentIdx + dir;
        if (nextIdx >= 0 && nextIdx < q.questions.length) {
            q.currentIdx = nextIdx;
            UI.drawQuiz(q);
        }
    },

    finishQuiz() {
        if (this.state.view !== 'quiz') return;
        
        const result = Engine.calculateFinal();
        Store.saveResult(result);
        
        // Extract mistakes for future Revision Mode
        const mistakes = result.fullData.filter(q => q.attempted && !q.isCorrect);
        Store.saveMistakes(mistakes);

        this.navigate('analysis', result);
    },

    /**
     * GLOBAL UTILITIES
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

    _renderSettings(container) {
        container.innerHTML = `
        <div class="px-2 pt-6 space-y-6 animate-view-enter">
            <div class="glass-card p-6 rounded-[32px] flex items-center justify-between">
                <div>
                    <h3 class="text-sm font-black">Appearance</h3>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dark Mode Toggle</p>
                </div>
                <button onclick="Main.toggleTheme()" class="w-12 h-7 bg-slate-200 dark:bg-blue-600 rounded-full relative transition-colors">
                    <div class="w-5 h-5 bg-white rounded-full absolute top-1 left-1 dark:left-6 transition-all shadow-sm"></div>
                </button>
            </div>
            <div onclick="Store.clearAll()" class="glass-card p-6 rounded-[32px] flex items-center justify-between border-red-100 dark:border-red-900/30 text-red-500">
                <div>
                    <h3 class="text-sm font-black">Reset Progress</h3>
                    <p class="text-[10px] font-bold opacity-60 uppercase tracking-widest">Clear History & Settings</p>
                </div>
                <i class="fa-solid fa-trash-can"></i>
            </div>
            <div class="text-center pt-10">
                <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">UPSC Pro v${CONFIG.version}</p>
            </div>
        </div>`;
    },

    _renderStats(container) {
        const history = Store.get('history', []);
        container.innerHTML = `
        <div class="px-2 pb-32 space-y-6 animate-view-enter">
            <div class="glass-card p-8 rounded-[40px] text-center bg-blue-50/50 dark:bg-blue-900/10">
                <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Quiz Performance</p>
                <div class="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">${history.length}</div>
                <p class="text-[10px] font-bold text-slate-400 uppercase mt-2">Attempts Recorded</p>
            </div>
            
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Recent History</h3>
            <div class="space-y-3">
                ${history.length > 0 ? history.slice(0, 10).map(h => `
                    <div class="glass-card p-5 rounded-3xl flex justify-between items-center transition-all active:scale-[0.98]">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-500 shadow-sm">
                                <i class="fa-solid fa-graduation-cap"></i>
                            </div>
                            <div>
                                <h4 class="text-[13px] font-black">${h.subject}</h4>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">${new Date(h.savedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-black text-blue-600">${h.score}</div>
                            <div class="text-[8px] font-black text-slate-400 uppercase">Points</div>
                        </div>
                    </div>`).join('') : '<div class="text-center py-10 text-slate-400 text-sm">No attempts yet. Start a quiz to see stats!</div>'}
            </div>
        </div>`;
    }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => Main.init());

