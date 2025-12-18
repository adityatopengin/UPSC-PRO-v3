/**
 * MAIN.JS - The Master Controller
 * Final Integration: Coordinates Store, Adapter, Engine, and UI.
 * Features: Fog-Footer Navigation, JSON Normalization, UPSC Logic.
 * * CRITICAL FIXES INCLUDED:
 * 1. JSON Validation Schema
 * 2. Network Retry Logic
 * 3. Robust Button State Detection
 * 4. Safety Initialization Checks
 */

// ==========================================
// 1. UTILITY: JSON SCHEMA VALIDATION
// Prevents "Silent Crashes" from bad data
// ==========================================
function validateQuestionsSchema(questions) {
    if (!Array.isArray(questions)) {
        throw new Error('Questions must be an array');
    }

    const errors = [];

    // Validate first 50 items to save performance
    questions.slice(0, 50).forEach((q, idx) => {
        // Rule 1: Must have text
        if (!q.text && !q.question_text) {
            errors.push(`Q${idx + 1}: Missing question text`);
        }

        // Rule 2: Must have options
        if (!Array.isArray(q.options) || q.options.length < 2) {
            errors.push(`Q${idx + 1}: Must have at least 2 options`);
        }

        // Rule 3: Must have a correct answer
        if (q.correct === undefined &&
            q.correct_option_index === undefined &&
            !q.correct_option_label) {
            errors.push(`Q${idx + 1}: Missing correct answer`);
        }
        
        // Rule 4: Correct index must be within range
        const correctIdx = parseInt(q.correct_option_index ?? q.correct ?? 0);
        if (correctIdx < 0 || correctIdx >= (q.options?.length ?? 0)) {
             errors.push(`Q${idx + 1}: Correct index ${correctIdx} out of range`);
        }
    });

    if (errors.length > 0) {
        const summary = errors.slice(0, 5).join('\n');
        const remaining = errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : '';
        throw new Error(`JSON Validation Failed:\n${summary}${remaining}`);
    }

    return true;
}

// ==========================================
// 2. UTILITY: NETWORK RESILIENCE
// Retries fetches for users with bad internet
// ==========================================
const NetworkUtils = {
    async fetchWithRetry(url, maxRetries = 2, timeout = 5000) {
        let lastError = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) console.log(`[Network] Retry attempt ${attempt}/${maxRetries}: ${url}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    signal: controller.signal,
                    cache: 'force-cache', // Important for offline usage
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'max-age=3600'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data;

            } catch (error) {
                lastError = error;
                console.warn(`[Network] Attempt ${attempt + 1} failed:`, error.message);

                if (attempt < maxRetries) {
                    // Exponential backoff: 500ms, 1000ms
                    const waitMs = 500 * Math.pow(2, attempt);
                    await new Promise(resolve => setTimeout(resolve, waitMs));
                }
            }
        }

        throw new Error(`Failed to fetch ${url}: ${lastError?.message}`);
    }
};

// ==========================================
// 3. MAIN APPLICATION LOGIC
// ==========================================
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
        console.log("UPSC Pro v4.1: System Initializing...");
        
        // A. Load User Preferences from Store
        this.state.settings = Store.get('settings', { theme: 'light' });
        if (this.state.settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        }

        // B. Initial Routing: Check if first-time user
        const hasVisited = Store.get('visited', false);
        if (!hasVisited) {
            // Increased delay and added a safety check for the UI object
            setTimeout(() => {
                if (typeof UI !== 'undefined' && UI.modals) {
                    UI.modals.orientation();
                } else {
                    console.error("Main Init: UI system not ready. Check if ui.js loaded correctly.");
                }
            }, 300); // 300ms is safer for mobile browsers
        } else {
            this.navigate('home');
        }

        // C. Listen for Global Time Up Event
        window.addEventListener('timeUp', () => {
            // Only alert if we are actually in a quiz
            if (this.state.view === 'quiz') {
                alert("Time's Up! Submitting your answers.");
                this.finishQuiz();
            }
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
        if (nav) {
            if (['home', 'notes', 'stats', 'settings'].includes(view)) {
                UI.renderFooter(view); // Home, Notes, Stats
                nav.classList.remove('hidden');
            } else {
                nav.classList.add('hidden'); // Hide footer during Quiz or Analysis
            }
        }

        // B. Render View Specific Content
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

        mainEl.scrollTo(0, 0); // Reset scroll position
    },

    /**
     * Logic to Fetch JSON and Start Quiz
     * Completely rewritten for robustness and safety.
     */
    async triggerStart(subjectName) {
        // Safe UI Loader Call
        if (typeof UI !== 'undefined' && UI.loader) UI.loader(true);
        if (typeof UI !== 'undefined' && UI.hideModal) UI.hideModal();

        try {
            console.log(`[Main] Attempting to start quiz: ${subjectName}`);

            // 1. Resolve filename from Config file
            const fileName = CONFIG.getFileName(subjectName);
            
            // 2. Fetch with Retry Logic (Critical Fix #4)
            const rawData = await NetworkUtils.fetchWithRetry(`data/${fileName}`, 2, 5000);

            // 3. Normalize Data via Adapter
            const cleanQuestions = Adapter.normalize(rawData);
            
            // 4. Validate Data Integrity (Critical Fix #3)
            validateQuestionsSchema(cleanQuestions);

            if (!cleanQuestions || cleanQuestions.length === 0) {
                throw new Error("File loaded but contained no valid questions.");
            }

            // 5. Capture User Config (Critical Fix #2)
            // Uses precise selector for the .active class added by ui.js
            const countBtn = document.querySelector('#q-counts .count-btn.active');
            const modeBtn = document.querySelector('#q-modes .mode-btn.active');
            
            // Fallback defaults if selection fails
            const count = countBtn ? parseInt(countBtn.dataset.count) : 10;
            const mode = modeBtn ? modeBtn.dataset.mode : 'test';
            
            console.log(`[Main] Config: Count=${count}, Mode=${mode}, Paper=${this.state.paper}`);

            // 6. Start the Engine
            Engine.startSession({ 
                subject: subjectName, 
                count: count, 
                mode: mode, 
                paper: this.state.paper 
            }, cleanQuestions);

            // 7. Navigate to Quiz View
            this.navigate('quiz');

        } catch (e) {
            console.error("Critical Quiz Launch Failure:", e);
            let msg = `Quiz Failed to Start!\n\nError: ${e.message}`;
            
            if (e.message.includes('HTTP 404')) {
                msg += `\n\nTip: Check if the file exists in the /data folder.`;
            }
            
            alert(msg);
        } finally {
            if (typeof UI !== 'undefined' && UI.loader) UI.loader(false);
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
        const q = Engine.state.activeQuiz;
        if (!q) return;  // Safety check
        
        const target = q.currentIdx + dir;
        
        // Only move if within valid range
        if (target >= 0 && target < q.questions.length) {
            q.currentIdx = target;
            UI.drawQuiz(q);
        }
    },

    finishQuiz() {
        if (this.state.view !== 'quiz') return;
        
        const result = Engine.calculateFinal();
        
        // Save to LocalStorage with Race Condition protection (in store.js)
        Store.saveResult(result);
        
        // Save Mistakes for review
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
                <div>
                    <h3 class="text-sm font-black">Dark Mode</h3>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toggle Theme</p>
                </div>
                <button onclick="Main.toggleTheme()" class="w-12 h-7 bg-slate-200 dark:bg-blue-600 rounded-full relative transition-colors">
                    <div class="w-5 h-5 bg-white rounded-full absolute top-1 left-1 dark:left-6 transition-all"></div>
                </button>
            </div>
            <div onclick="UI.modals.orientation(true)" class="glass-card p-6 rounded-[32px] flex items-center justify-between cursor-pointer active:scale-95">
                <div>
                    <h3 class="text-sm font-black text-blue-600">Replay Orientation</h3>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listen to Instructions</p>
                </div>
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
            ${history.length > 0 ? history.map(h => `
                <div class="glass-card p-5 rounded-3xl flex justify-between items-center mb-3">
                    <div>
                        <h4 class="text-sm font-black">${h.subject || 'Mixed Test'}</h4>
                        <p class="text-[9px] font-bold text-slate-400">${new Date(h.savedAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-black text-blue-600">${h.score}</div>
                        <div class="text-[8px] font-black text-slate-400 uppercase">Score</div>
                    </div>
                </div>`).join('') : '<p class="text-center text-slate-400 text-sm">No history yet.</p>'}
        </div>`;
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => Main.init());



