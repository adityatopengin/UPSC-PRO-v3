/**
 * APP.JS - MODULAR ARCHITECTURE
 * * Module 1: DataStore (Storage Manager)
 * Module 2: Adapter (Data Normalizer)
 * Module 3: Engine (Quiz Logic & Timer)
 * Module 4: UI (Renderer & Animations)
 * Module 5: Core (Controller & Initialization)
 */

/* =========================================
   MODULE 1: DATA STORE (The Vault)
   Handles all LocalStorage operations.
   ========================================= */
const DataStore = {
    get(key, fallback) {
        try {
            const data = localStorage.getItem(`upsc_${key}`);
            return data ? JSON.parse(data) : fallback;
        } catch (e) {
            console.error("Storage Read Error", e);
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(`upsc_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error("Storage Write Error", e); // Handle QuotaExceeded
        }
    },

    // Specialized Methods
    saveResult(result) {
        const history = this.get('history', []);
        history.unshift(result);
        this.set('history', history.slice(0, 50)); // Keep last 50
    },

    saveMistakes(newMistakes) {
        const current = this.get('mistakes', []);
        // Merge and remove duplicates based on Question ID or Text
        const merged = [...current, ...newMistakes].filter((v, i, a) => 
            a.findIndex(t => t.text === v.text) === i
        ).slice(0, 100);
        this.set('mistakes', merged);
    }
};

/* =========================================
   MODULE 2: ADAPTER (The Translator)
   Ensures different JSON formats work perfectly.
   ========================================= */
const Adapter = {
    normalize(rawData) {
        // 1. Handle " { questions: [...] } " vs " [...] "
        let list = Array.isArray(rawData) ? rawData : (rawData.questions || []);

        // 2. Normalize Keys (text vs question_text, etc.)
        return list.map((q, index) => ({
            id: q.id || `q_${Date.now()}_${index}`,
            text: q.text || q.question_text || "Question text missing",
            options: q.options || [],
            correct: this._parseCorrect(q.correct, q.correct_option),
            explanation: q.explanation || "No explanation provided.",
            year: q.year || null,
            difficulty: q.difficulty || "medium",
            notes: q.notes || null
        }));
    },

    _parseCorrect(c1, c2) {
        // Returns the index (0-3). Some JSONs use "A"/"B" strings.
        if (typeof c1 === 'number') return c1;
        if (typeof c2 === 'number') return c2;
        // Logic for string conversion if needed later
        return 0; 
    }
};

/* =========================================
   MODULE 3: ENGINE (The Brain)
   Handles Timer, Randomization, and Scoring.
   ========================================= */
const Engine = {
    state: {
        activeQuiz: null,
        timer: null
    },

    startSession(config, questions) {
        // 1. Randomize
        const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, config.count);
        
        // 2. Calculate Time (Paper 1 vs Paper 2)
        const timePerQ = config.paper === 'csat' ? CONFIG.defaults.timePerQ_CSAT : CONFIG.defaults.timePerQ_GS;
        const totalTime = config.count * timePerQ;

        this.state.activeQuiz = {
            config: config,
            questions: shuffled,
            answers: {},
            currentIdx: 0,
            timeLeft: totalTime,
            startTime: Date.now()
        };

        if (config.mode === 'test') this._startTimer();
    },

    endSession() {
        this._stopTimer();
        const q = this.state.activeQuiz;
        if (!q) return null;

        // Scoring Logic (Paper specific)
        const isCsat = q.config.paper === 'csat';
        const marks = isCsat ? { pos: 2.5, neg: 0.83 } : { pos: 2.0, neg: 0.66 };

        let correct = 0, wrong = 0, attempted = 0;
        const fullData = q.questions.map((item, i) => {
            const userAns = q.answers[i];
            if (userAns !== undefined) {
                attempted++;
                if (userAns === item.correct) correct++; else wrong++;
            }
            return { ...item, userAns };
        });

        return {
            date: new Date().toISOString(),
            subject: q.config.subject,
            score: ((correct * marks.pos) - (wrong * marks.neg)).toFixed(2),
            accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
            correct, wrong, total: q.questions.length, fullData
        };
    },

    _startTimer() {
        this._stopTimer();
        this.state.timer = setInterval(() => {
            const q = this.state.activeQuiz;
            if (!q) return this._stopTimer();

            q.timeLeft--;
            UI.updateTimer(q.timeLeft); // Direct call to UI for performance

            if (q.timeLeft <= 0) {
                this._stopTimer();
                alert("Time's Up!");
                Core.finishQuiz(); // Callback to Core
            }
        }, 1000);
    },

    _stopTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    }
};

/* =========================================
   MODULE 4: UI (The Visuals)
   Renders specific components.
   ========================================= */
const UI = {
    // A. Renderers
    renderEyecatchers() {
        const container = document.getElementById('notes-grid');
        if (!container) return;

        const html = CONFIG.notesLibrary.map(card => `
            <div class="eye-card rounded-3xl p-5 bg-grad-${card.gradient} text-white cursor-pointer active:scale-95 shadow-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-black leading-none mb-1">${card.title}</h3>
                        <p class="text-[10px] font-medium opacity-90 uppercase tracking-wide">${card.subtitle}</p>
                    </div>
                    <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg">
                        <i class="fa-solid fa-${card.icon}"></i>
                    </div>
                </div>
                <div class="mt-8 h-12 w-full bg-white/10 rounded-lg border border-white/20 relative overflow-hidden">
                    <div class="absolute inset-0 bg-white/5 skew-x-12 transform translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                    <div class="flex items-center justify-center h-full text-[9px] font-bold opacity-50">DIAGRAM PREVIEW</div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    },

    renderToppersModal() {
        // The 9 Coaching Links
        const links = CONFIG.resources.institutes.map(inst => `
            <a href="${inst.url}" target="_blank" class="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div class="w-14 h-14 rounded-2xl bg-${inst.color}-100 dark:bg-${inst.color}-900 text-${inst.color}-600 flex items-center justify-center text-xl font-black shadow-sm">
                    ${inst.char}
                </div>
                <span class="text-[9px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">${inst.name}</span>
            </a>
        `).join('');

        this.showModal(`
            <div class="p-6">
                <h3 class="text-lg font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight">Coaching Archives</h3>
                <div class="grid grid-cols-3 gap-4">
                    ${links}
                </div>
                <button onclick="document.getElementById('modal-overlay').remove()" class="w-full mt-8 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-500">Close</button>
            </div>
        `);
    },

    // B. Utilities
    updateTimer(seconds) {
        const el = document.getElementById('quiz-timer');
        if (el) {
            const m = Math.floor(seconds / 60);
            const s = (seconds % 60).toString().padStart(2, '0');
            el.innerText = `${m}:${s}`;
            if (seconds < 60) el.classList.add('text-red-500');
        }
    },

    loader(show) {
        const el = document.getElementById('loader');
        if (show) el.classList.remove('hidden'); else el.classList.add('hidden');
    },

    showModal(contentHTML) {
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4";
        overlay.innerHTML = `
            <div class="glass-card w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] animate-slide-up overflow-hidden">
                ${contentHTML}
            </div>
        `;
        document.body.appendChild(overlay);
        // Close on background click
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    }
};

/* =========================================
   MODULE 5: CORE (The Controller)
   Connects all modules together.
   ========================================= */
const Core = {
    state: {
        view: 'home',
        paper: 'gs1'
    },

    init() {
        console.log("System Check: Modules Loaded.");
        this.loadTheme();
        
        // Initial Routing
        const visited = DataStore.get('visited', false);
        if (!visited) this.showOrientation();
        else this.navigate('home');
    },

    loadTheme() {
        const settings = DataStore.get('settings', { theme: 'light' });
        if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    },

    navigate(view, data) {
        // Cleanup
        if (this.state.view === 'quiz') Engine.endSession(); // Stop timer if leaving

        this.state.view = view;
        this._renderLayout(view, data);
    },

    async startQuiz(config) {
        UI.loader(true);
        try {
            // 1. Get Filename
            let file;
            if (config.type === 'mistakes') {
                // Logic for mistakes...
            } else {
                file = CONFIG.getFileName(config.subject);
            }

            // 2. Fetch & Adapt
            const res = await fetch(`data/${file}`);
            if (!res.ok) throw new Error("File not found");
            const raw = await res.json();
            const cleanData = Adapter.normalize(raw);

            if (cleanData.length === 0) throw new Error("No questions available");

            // 3. Start Engine
            Engine.startSession({ ...config, paper: this.state.paper }, cleanData);
            
            // 4. Render
            this.navigate('quiz');

        } catch (e) {
            alert(e.message);
            this.navigate('home');
        } finally {
            UI.loader(false);
        }
    },

    finishQuiz() {
        const result = Engine.endSession();
        if (result) {
            DataStore.saveResult(result);
            const mistakes = result.fullData.filter(q => q.userAns !== undefined && q.userAns !== q.correct);
            DataStore.saveMistakes(mistakes);
            this.navigate('analysis', result);
        }
    },

    // --- VIEW RENDERERS (Delegated to UI helpers) ---
    _renderLayout(view, data) {
        const main = document.getElementById('main-view');
        const nav = document.getElementById('app-nav');
        
        // Toggle Footer
        if (['home', 'notes', 'stats', 'settings'].includes(view)) {
            nav.classList.remove('hidden');
            this._drawFooter(view);
        } else {
            nav.classList.add('hidden');
        }

        // Header Update
        this._drawHeader(view);

        // Content Injection
        if (view === 'home') this._drawHome(main);
        if (view === 'notes') this._drawNotes(main);
        if (view === 'quiz') this._drawQuiz(main);
        if (view === 'analysis') this._drawAnalysis(main, data);
        if (view === 'settings') this._drawSettings(main);
        
        main.scrollTo(0, 0);
    },

    // --- DRAWING FUNCTIONS (Kept in Core for access to State) ---
    
    _drawHome(container) {
        const subjects = this.state.paper === 'gs1' ? CONFIG.subjectsGS1 : CONFIG.subjectsCSAT;
        
        container.innerHTML = `
            <div class="space-y-6 pb-32 animate-slide-up">
                <div class="relative flex bg-slate-200 dark:bg-slate-800 rounded-full p-1 mx-4">
                    <div class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-full transition-transform duration-300 shadow-sm" 
                         style="transform: translateX(${this.state.paper === 'gs1' ? '0' : '100%'})"></div>
                    <button onclick="Core.state.paper='gs1'; Core.navigate('home')" class="relative z-10 flex-1 py-2 text-[10px] font-black text-slate-800 dark:text-white">PAPER 1</button>
                    <button onclick="Core.state.paper='csat'; Core.navigate('home')" class="relative z-10 flex-1 py-2 text-[10px] font-black text-slate-800 dark:text-white">PAPER 2</button>
                </div>

                <div class="grid grid-cols-2 gap-3 px-2">
                    ${subjects.map(s => `
                        <div onclick="Core.showSetup('${s.name}')" class="glass-card p-4 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all cursor-pointer hover:border-${s.color}-400 border border-transparent">
                            <div class="w-12 h-12 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/30 text-${s.color}-600 dark:text-${s.color}-400 flex items-center justify-center text-xl">
                                <i class="fa-solid fa-${s.icon}"></i>
                            </div>
                            <span class="text-[10px] font-black text-center uppercase leading-tight text-slate-700 dark:text-slate-200">${s.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    _drawNotes(container) {
        container.innerHTML = `
            <div class="space-y-6 pb-32 animate-slide-up">
                <div class="grid grid-cols-2 gap-3">
                    <div onclick="window.open('${CONFIG.resources.psir.drive}', '_blank')" class="glass-card p-4 rounded-3xl flex flex-col justify-between h-40 cursor-pointer active:scale-95 bg-purple-50/50 dark:bg-purple-900/10">
                        <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><i class="fa-brands fa-google-drive"></i></div>
                        <div><h3 class="text-sm font-black leading-tight">PSIR<br>Drive</h3><p class="text-[8px] font-bold text-purple-500 uppercase mt-1">Full Course</p></div>
                    </div>
                    <div onclick="window.open('${CONFIG.resources.psir.topperRepo}', '_blank')" class="glass-card p-4 rounded-3xl flex flex-col justify-between h-40 cursor-pointer active:scale-95 bg-blue-50/50 dark:bg-blue-900/10">
                        <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><i class="fa-solid fa-file-pen"></i></div>
                        <div><h3 class="text-sm font-black leading-tight">Topper<br>Copies</h3><p class="text-[8px] font-bold text-blue-500 uppercase mt-1">Answer Sheets</p></div>
                    </div>
                </div>

                <div onclick="UI.renderToppersModal()" class="glass-card p-5 rounded-3xl flex items-center justify-between cursor-pointer active:scale-95">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl"><i class="fa-solid fa-building-columns"></i></div>
                        <div><h3 class="text-sm font-black">Coaching Archive</h3><p class="text-[9px] font-bold text-slate-400 uppercase">Vision, Forum, Shubhra Ranjan +6</p></div>
                    </div>
                    <i class="fa-solid fa-chevron-right text-slate-300"></i>
                </div>

                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Smart Notes</h3>
                <div id="notes-grid" class="space-y-4"></div>
            </div>
        `;
        // Defer rendering the heavy eyecatchers
        setTimeout(() => UI.renderEyecatchers(), 50);
    },

    _drawQuiz(container) {
        const q = Engine.state.activeQuiz;
        if(!q) return this.navigate('home');
        
        const current = q.questions[q.currentIdx];
        
        container.innerHTML = `
            <div class="pb-40 animate-slide-up">
                <div class="flex justify-between items-center mb-6">
                    <span class="text-[9px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded">Q ${q.currentIdx+1}/${q.questions.length}</span>
                    <span id="quiz-timer" class="font-mono font-bold text-slate-800 dark:text-white">${q.config.mode==='test' ? '00:00' : 'Learn'}</span>
                </div>

                <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-8 leading-relaxed font-display">${current.text}</h3>

                <div class="space-y-3">
                    ${current.options.map((opt, i) => {
                        const isSel = q.answers[q.currentIdx] === i;
                        const isCorrect = current.correct === i;
                        let cls = "glass-card p-4 rounded-2xl flex items-start gap-4 transition-all border-2 ";
                        
                        if(q.config.mode === 'learning' && q.answers[q.currentIdx] !== undefined) {
                            if(isCorrect) cls += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                            else if(isSel) cls += "border-red-500 bg-red-50 dark:bg-red-900/20";
                            else cls += "border-transparent opacity-50";
                        } else if(isSel) {
                            cls += "border-blue-600 bg-blue-50 dark:bg-blue-900/20";
                        } else {
                            cls += "border-transparent";
                        }

                        return `<div onclick="Core.handleOption(${i})" class="${cls} cursor-pointer">
                            <div class="w-6 h-6 rounded-full border border-slate-300 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400 mt-0.5">${String.fromCharCode(65+i)}</div>
                            <span class="text-sm font-medium leading-snug">${opt}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <div class="fixed bottom-0 left-0 right-0 p-4 glass-card rounded-t-[32px] shadow-2xl z-50 flex items-center gap-3 max-w-md mx-auto">
                <button onclick="Core.moveQ(-1)" class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-xs">PREV</button>
                <button onclick="Core.moveQ(1)" class="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs">NEXT</button>
                <button onclick="if(confirm('Submit?')) Core.finishQuiz()" class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center"><i class="fa-solid fa-check"></i></button>
            </div>
        `;
    },

    _drawAnalysis(container, stats) {
        container.innerHTML = `
            <div class="space-y-8 pb-32 animate-slide-up">
                <div class="glass-card p-8 rounded-[40px] text-center bg-blue-50/30">
                    <p class="text-[10px] font-black text-blue-600 uppercase mb-2">Total Score</p>
                    <div class="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">${stats.score}</div>
                    <div class="flex justify-center gap-6 mt-6">
                        <span class="text-xs font-bold text-emerald-500">${stats.correct} Correct</span>
                        <span class="text-xs font-bold text-red-500">${stats.wrong} Wrong</span>
                    </div>
                </div>

                <h3 class="text-xs font-black uppercase tracking-widest px-2">Review</h3>
                <div class="space-y-4">
                    ${stats.fullData.map((q, i) => `
                        <div class="glass-card p-5 rounded-[24px] ${q.userAns === q.correct ? 'border-l-4 border-emerald-500' : 'border-l-4 border-red-500'}">
                            <div class="flex justify-between mb-2">
                                <span class="text-[10px] font-black text-slate-400">Q${i+1}</span>
                            </div>
                            <p class="text-sm font-bold mb-2">${q.text}</p>
                            <p class="text-xs text-slate-500 leading-relaxed">${q.explanation}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    _drawSettings(container) {
        container.innerHTML = `
            <div class="px-2 pt-6 space-y-6 animate-slide-up">
                <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
                    <div><h3 class="text-sm font-bold">Dark Mode</h3><p class="text-xs text-slate-400">Eye comfort</p></div>
                    <button onclick="Core.toggleDark()" class="w-12 h-7 bg-slate-200 dark:bg-blue-600 rounded-full relative transition-colors"><div class="w-5 h-5 bg-white rounded-full absolute top-1 left-1 dark:left-6 transition-all shadow-sm"></div></button>
                </div>
                <div class="glass-card p-6 rounded-3xl flex items-center justify-between" onclick="Core.showOrientation(true)">
                    <div><h3 class="text-sm font-bold">Orientation</h3><p class="text-xs text-slate-400">Listen to instructions</p></div>
                    <button class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><i class="fa-solid fa-play"></i></button>
                </div>
                 <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
                    <div><h3 class="text-sm font-bold text-red-500">Reset App</h3><p class="text-xs text-slate-400">Clear all data</p></div>
                    <button onclick="if(confirm('Reset?')) { localStorage.clear(); location.reload(); }" class="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold">Reset</button>
                </div>
            </div>
        `;
    },

    _drawHeader(view) {
        const h = document.getElementById('app-header');
        if(view === 'home') {
            h.innerHTML = `
                <div class="flex items-center justify-between p-4 glass-card rounded-3xl mx-2 mt-4 animate-slide-up">
                    <div class="flex items-center gap-3">
                        <img src="assets/images/Omg.jpg" class="w-10 h-10 rounded-full border-2 border-blue-500 object-cover">
                        <div><h2 class="text-xs font-black leading-none">Aspirant</h2><p class="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">Target 2026</p></div>
                    </div>
                    <button onclick="Core.navigate('settings')" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><i class="fa-solid fa-gear"></i></button>
                </div>
            `;
        } else {
            h.innerHTML = `
                <div class="flex items-center p-4 mt-2 gap-4">
                    <button onclick="Core.navigate('home')" class="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-500"><i class="fa-solid fa-arrow-left"></i></button>
                    <h2 class="text-xl font-black capitalize">${view}</h2>
                </div>
            `;
        }
    },

    _drawFooter(active) {
        const nav = document.getElementById('app-nav');
        const btn = (view, icon, label) => `
            <button onclick="Core.navigate('${view}')" class="nav-btn ${active === view ? 'active' : 'inactive'}">
                <i class="fa-solid fa-${icon}"></i>
                <span class="text-[8px] font-bold uppercase mt-1">${label}</span>
            </button>`;
        
        nav.innerHTML = `
            <div class="flex justify-around items-center glass-card rounded-full p-3 shadow-2xl border-t border-white/20 backdrop-blur-xl">
                ${btn('home', 'house', 'Home')}
                ${btn('notes', 'book-bookmark', 'Notes')}
                ${btn('quiz', 'layer-group', 'Quiz')} ${btn('settings', 'sliders', 'Settings')}
            </div>
        `;
    },

    // --- ACTIONS ---
    handleOption(idx) {
        const q = Engine.state.activeQuiz;
        q.answers[q.currentIdx] = idx;
        this._drawQuiz(document.getElementById('main-view')); // Re-render
    },

    moveQ(dir) {
        const q = Engine.state.activeQuiz;
        const target = q.currentIdx + dir;
        if(target >= 0 && target < q.questions.length) {
            q.currentIdx = target;
            this._drawQuiz(document.getElementById('main-view'));
        }
    },

    showSetup(subject) {
        UI.showModal(`
            <div class="p-8">
                <h3 class="text-xl font-black mb-6 uppercase tracking-tight">${subject}</h3>
                <div class="space-y-6">
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase mb-3 block">Count</label>
                        <div class="grid grid-cols-4 gap-2" id="q-counts">
                            ${[10, 20, 50, 100].map(n => `<button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.className='py-3 rounded-2xl bg-slate-100 text-xs font-bold text-slate-500'); this.className='py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold'" class="py-3 rounded-2xl ${n===10?'bg-slate-900 text-white':'bg-slate-100 text-slate-500'} text-xs font-bold">${n}</button>`).join('')}
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase mb-3 block">Mode</label>
                        <div class="grid grid-cols-2 gap-2" id="q-modes">
                            <button onclick="this.nextElementSibling.className='py-4 rounded-2xl bg-slate-100 text-xs font-bold text-slate-500'; this.className='py-4 rounded-2xl bg-slate-900 text-white text-xs font-bold'" class="py-4 rounded-2xl bg-slate-900 text-white text-xs font-bold">TEST</button>
                            <button onclick="this.previousElementSibling.className='py-4 rounded-2xl bg-slate-100 text-xs font-bold text-slate-500'; this.className='py-4 rounded-2xl bg-slate-900 text-white text-xs font-bold'" class="py-4 rounded-2xl bg-slate-100 text-xs font-bold text-slate-500">LEARN</button>
                        </div>
                    </div>
                </div>
                <button onclick="Core.triggerStart('${subject}')" class="w-full mt-10 py-4 bg-blue-600 text-white rounded-3xl font-bold shadow-xl">START QUIZ</button>
            </div>
        `);
    },

    triggerStart(subject) {
        const count = parseInt(document.querySelector('#q-counts .bg-slate-900').innerText);
        const mode = document.querySelector('#q-modes .bg-slate-900').innerText.toLowerCase();
        document.getElementById('modal-overlay').remove();
        this.startQuiz({ subject, count, mode });
    },

    showOrientation(force = false) {
        if (!force && DataStore.get('visited')) return;
        
        UI.showModal(`
            <div class="p-8 text-center">
                <div class="w-20 h-20 bg-blue-600 text-white rounded-3xl mx-auto flex items-center justify-center text-3xl mb-6 shadow-xl shadow-blue-500/30"><i class="fa-solid fa-headphones-simple"></i></div>
                <h2 class="text-2xl font-black mb-2">Welcome</h2>
                <p class="text-xs text-slate-500 mb-8 leading-relaxed">Listen to the orientation from Pradeep Tripathi.</p>
                
                <div class="flex items-center justify-center gap-6 mb-8">
                    <button id="play-btn" class="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl shadow-xl active:scale-90 transition-all"><i class="fa-solid fa-play"></i></button>
                    <audio id="welcome-audio" src="assets/audio/disclaimer.mp3"></audio>
                </div>

                <button onclick="DataStore.set('visited', true); document.getElementById('modal-overlay').remove();" class="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-bold">Continue</button>
            </div>
        `);

        const audio = document.getElementById('welcome-audio');
        const btn = document.getElementById('play-btn');
        btn.onclick = () => {
            if (audio.paused) { audio.play(); btn.innerHTML = '<i class="fa-solid fa-pause"></i>'; }
            else { audio.pause(); btn.innerHTML = '<i class="fa-solid fa-play"></i>'; }
        };
    },

    toggleDark() {
        const isDark = document.documentElement.classList.toggle('dark');
        DataStore.set('settings', { theme: isDark ? 'dark' : 'light' });
        this._drawSettings(document.getElementById('main-view'));
    }
};

// Start the Engine
document.addEventListener('DOMContentLoaded', () => Core.init());

