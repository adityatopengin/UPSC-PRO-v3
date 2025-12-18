
/**
 * MAIN.JS - The Master Controller
 * Version: 2.1.0 (Fixes Blank Screen & Map)
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
// 2. NETWORK RESILIENCE
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
        paper: 'gs1',
        settings: { theme: 'light' }
    },

    init() {
        console.log("UPSC Pro: Initializing Core...");

        // 1. Theme
        this.state.settings = Store.get('settings', { theme: null });
        if (!this.state.settings.theme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.state.settings.theme = prefersDark ? 'dark' : 'light';
        }
        if (this.state.settings.theme === 'dark') document.documentElement.classList.add('dark');

        // 2. Resume Check
        const savedSession = Store.get('current_session');
        if (savedSession) {
            console.log("Resuming session...");
            Engine.state.activeQuiz = savedSession;
            const elapsedMS = (savedSession.totalDuration - savedSession.timeLeft) * 1000;
            Engine.state.activeQuiz.startTime = Date.now() - elapsedMS;
            Engine._runTimer();
            this.navigate('quiz');
            return;
        }

        // 3. Render Home Background FIRST (Fixes Blank Screen)
        this.navigate('home');

        // 4. Orientation Check
        const hasVisited = Store.get('visited', false);
        if (!hasVisited) {
            // Pass 'true' to tell UI this is the first visit
            setTimeout(() => UI.modals.orientation(true), 500);
        }

        // 5. Events
        window.addEventListener('timeUp', () => {
            if (this.state.view === 'quiz') this.finishQuiz();
        });

        document.addEventListener('keydown', (e) => {
            if (this.state.view !== 'quiz') return;
            if (e.key === 'ArrowRight') this.moveQ(1);
            if (e.key === 'ArrowLeft') this.moveQ(-1);
            if (e.key >= '1' && e.key <= '4') this.handleOption(parseInt(e.key) - 1);
        });
    },

    navigate(view, data = null) {
        if (this.state.view === 'quiz' && view !== 'quiz') {
            Engine._stopTimer();
        }

        this.state.view = view;
        UI.renderHeader(view);
        
        const isMainTab = ['home', 'notes', 'stats', 'settings'].includes(view);
        if (isMainTab) {
            UI.renderFooter(view);
        } else {
            const nav = document.getElementById('app-nav');
            if (nav) nav.classList.add('hidden');
        }

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

    async triggerStart(subjectName) {
        // Capture configs before closing modal
        const countBtn = document.querySelector('#q-counts .count-btn.active');
        const modeBtn = document.querySelector('#q-modes .mode-btn.active');
        
        const config = {
            subject: subjectName,
            count: countBtn ? parseInt(countBtn.dataset.count) : 10,
            mode: modeBtn ? modeBtn.dataset.mode : 'test',
            paper: this.state.paper
        };

        UI.loader(true);
        UI.hideModal();

        try {
            const fileName = CONFIG.getFileName(subjectName);
            const rawData = await Network.fetchWithRetry(`data/${fileName}`);
            const questions = Adapter.normalize(rawData);
            validateQuestionsSchema(questions);

            Engine.startSession(config, questions);
            this.navigate('quiz');

        } catch (err) {
            console.error("Quiz Launch Failed:", err);
            alert(`Error: Could not load quiz data.`);
        } finally {
            UI.loader(false);
        }
    },

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

    jumpToQ(idx) {
        const q = Engine.state.activeQuiz;
        if (!q) return;
        if (idx >= 0 && idx < q.questions.length) {
            q.currentIdx = idx;
            UI.hideModal();
            UI.drawQuiz(q);
        }
    },

    finishQuiz() {
        if (this.state.view !== 'quiz') return;
        const result = Engine.calculateFinal();
        Store.saveResult(result);
        const mistakes = result.fullData.filter(q => q.attempted && !q.isCorrect);
        Store.saveMistakes(mistakes);
        this.navigate('analysis', result);
    },

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
        // No need to navigate here as Home is already rendered in background
    },

    _renderSettings(container) {
        // ... (Logic moved to UI.js for consistency, but Main handles routing)
        // This function is effectively replaced by UI._renderSettings call in navigate()
        UI._renderSettings(container);
    },

    _renderStats(container) {
        UI._renderStats(container);
    }
};

document.addEventListener('DOMContentLoaded', () => Main.init());



