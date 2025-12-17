/**
 * APP.JS - UPSC Pro Master Engine v3.5
 * Features: Settings, Charts, Resources, Robust Quiz Engine
 */

const App = {
    // 1. CENTRAL STATE
    state: {
        view: 'home',
        paper: 'gs1',      // 'gs1' or 'csat'
        quiz: null,        // Active quiz session
        history: [],       // Past results
        settings: { theme: 'light', sound: true },
        isFirstTime: !localStorage.getItem('upsc_visited')
    },

    // 2. INITIALIZATION
    init() {
        console.log("Initializing UPSC Pro...");
        this.loadStorage();
        this.applyTheme();
        
        // Check for Charts library
        if(typeof Chart === 'undefined') {
            console.warn("Chart.js not loaded yet.");
        }

        // Start App
        if (this.state.isFirstTime) {
            this.UI.showDisclaimer();
        }
        this.Router.navigate('home');
    },

    loadStorage() {
        try {
            this.state.history = JSON.parse(localStorage.getItem('upsc_history') || '[]');
            this.state.settings = JSON.parse(localStorage.getItem('upsc_settings') || '{"theme":"light"}');
        } catch (e) {
            console.error("Storage corrupted, resetting.");
            localStorage.clear();
        }
    },

    applyTheme() {
        if (this.state.settings.theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    },

    /* =========================================
       MODULE 3: ROUTER (Navigation Manager)
       ========================================= */
    Router: {
        navigate(view, data = null) {
            // CRITICAL: Stop Timer if leaving quiz
            if (App.state.view === 'quiz' && view !== 'quiz') {
                App.Engine.stopTimer();
            }

            App.state.view = view;
            
            // 1. Manage Header & Footer Visibility
            App.UI.renderHeader(view);
            const nav = document.getElementById('app-nav');
            
            // Show Footer only on main tabs
            if (['home', 'stats', 'notes', 'settings'].includes(view)) {
                nav.classList.remove('hidden');
                App.UI.renderFooter(view);
            } else {
                nav.classList.add('hidden');
            }

            // 2. Render View Content
            switch(view) {
                case 'home': App.UI.drawHome(); break;
                case 'quiz': App.UI.drawQuiz(); break;
                case 'analysis': App.UI.drawAnalysis(data); break;
                case 'stats': App.UI.drawStats(); break;
                case 'notes': App.UI.drawNotes(); break;
                case 'settings': App.UI.drawSettings(); break;
            }
        }
    },

    /* =========================================
       MODULE 4: ENGINE (The Logic Core)
       ========================================= */
    Engine: {
        async start(config) {
            App.UI.loader(true);
            try {
                // Fetch Data
                let questions = [];
                if (config.type === 'mistakes') {
                    questions = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
                    if(questions.length === 0) throw new Error("No mistakes recorded yet.");
                } else if (config.type === 'random') {
                     // Load Mixed Data (Fallback to Polity for demo if mix missing)
                     const res = await fetch(`data/polity.json`).catch(() => null);
                     if(res) questions = await res.json();
                } else {
                    const file = CONFIG.getFileName(config.subject);
                    const res = await fetch(`data/${file}`);
                    if (!res.ok) throw new Error(`File ${file} not found`);
                    const raw = await res.json();
                    questions = Array.isArray(raw) ? raw : (raw.questions || []);
                }

                if (!questions || questions.length === 0) throw new Error("No questions found.");

                // Normalize Data (Handle different JSON structures)
                questions = questions.map(q => ({
                    id: q.id || Math.random(),
                    text: q.text || q.question_text,
                    options: q.options || [],
                    correct: q.correct !== undefined ? q.correct : q.correct_option,
                    explanation: q.explanation || "No explanation available.",
                    year: q.year || null,
                    difficulty: q.difficulty || null
                }));

                // Randomize & Slice
                if (CONFIG.defaults.randomize) questions = App.Utils.shuffle(questions);
                questions = questions.slice(0, config.count);

                // Initialize Quiz State
                App.state.quiz = {
                    config,
                    questions,
                    answers: {}, // Map { qId: optionIdx }
                    currentIdx: 0,
                    startTime: Date.now(),
                    timeLeft: config.mode === 'test' ? (config.count * (App.state.paper === 'gs1' ? 72 : 90)) : null,
                    timer: null
                };

                App.Router.navigate('quiz');
                if (config.mode === 'test') this.startTimer();

            } catch (e) {
                alert("Quiz Error: " + e.message);
                App.Router.navigate('home');
            } finally {
                App.UI.loader(false);
            }
        },

        startTimer() {
            this.stopTimer(); // Clear any existing
            const timerEl = document.getElementById('quiz-timer');
            
            App.state.quiz.timer = setInterval(() => {
                const q = App.state.quiz;
                if (!q) return this.stopTimer();

                q.timeLeft--;
                if (timerEl) {
                    timerEl.innerText = App.Utils.formatTime(q.timeLeft);
                    if (q.timeLeft < 60) timerEl.classList.add('text-red-500');
                }

                if (q.timeLeft <= 0) {
                    this.stopTimer();
                    alert("Time's Up!");
                    this.finish();
                }
            }, 1000);
        },

        stopTimer() {
            if (App.state.quiz && App.state.quiz.timer) {
                clearInterval(App.state.quiz.timer);
                App.state.quiz.timer = null;
            }
        },

        finish() {
            this.stopTimer();
            const q = App.state.quiz;
            
            // Calculate Stats
            let correct = 0, wrong = 0, attempted = 0;
            const fullData = q.questions.map((question, i) => {
                const userAns = q.answers[i]; // Using Index as ID for simplicity in array map
                if (userAns !== undefined) {
                    attempted++;
                    if (userAns === question.correct) correct++; else wrong++;
                }
                return { ...question, userAns };
            });

            // Score Calculation
            const factor = App.state.paper === 'csat' ? 2.5 : 2.0;
            const penalty = App.state.paper === 'csat' ? 0.83 : 0.66;
            const score = ((correct * factor) - (wrong * penalty)).toFixed(2);
            const accuracy = attempted > 0 ? Math.round((correct/attempted)*100) : 0;

            const result = {
                date: new Date().toISOString(),
                subject: q.config.subject,
                score, correct, wrong, total: q.questions.length, accuracy, fullData
            };

            // Save History
            App.state.history.unshift(result);
            localStorage.setItem('upsc_history', JSON.stringify(App.state.history.slice(0, 50)));

            // Save Mistakes
            const mistakes = fullData.filter(x => x.userAns !== undefined && x.userAns !== x.correct);
            const existingMistakes = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
            // Merge simple logic
            const newMistakes = [...existingMistakes, ...mistakes].slice(0, 100); 
            localStorage.setItem('upsc_mistakes', JSON.stringify(newMistakes));

            App.Router.navigate('analysis', result);
        }
    },

    /* =========================================
       MODULE 5: UI (Renderer)
       ========================================= */
    UI: {
        /* --- HEADER & FOOTER --- */
        renderHeader(view) {
            const h = document.getElementById('app-header');
            if (view === 'home') {
                h.innerHTML = `
                <div class="flex items-center justify-between p-4 glass-card rounded-3xl mx-2 mt-4 animate-slide-up">
                    <div class="flex items-center gap-3">
                        <img src="assets/images/Omg.jpg" class="w-10 h-10 rounded-full border-2 border-blue-500 object-cover">
                        <div>
                            <h2 class="text-sm font-black text-slate-800 dark:text-white leading-none">Aspirant</h2>
                            <p class="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Target 2026</p>
                        </div>
                    </div>
                    <button onclick="App.Router.navigate('settings')" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                        <i class="fa-solid fa-gear"></i>
                    </button>
                </div>`;
            } else if (view === 'quiz') {
                 // Quiz Header (Timer + Submit)
                 const q = App.state.quiz;
                 h.innerHTML = `
                 <div class="flex items-center justify-between p-4 mt-2">
                     <div class="glass-card px-4 py-2 rounded-full font-mono font-bold text-blue-600" id="quiz-timer">
                        ${q.config.mode === 'test' ? App.Utils.formatTime(q.timeLeft) : '∞'}
                     </div>
                     <button onclick="if(confirm('Submit Test?')) App.Engine.finish()" class="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-lg">
                        Submit
                     </button>
                 </div>`;
            } else {
                // Generic Back Header
                h.innerHTML = `
                <div class="flex items-center p-4 mt-2 gap-4">
                    <button onclick="App.Router.navigate('home')" class="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-500">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <h2 class="text-xl font-black text-slate-800 dark:text-white capitalize">${view}</h2>
                </div>`;
            }
        },

        renderFooter(active) {
            const nav = document.getElementById('app-nav');
            const cls = (v) => active === v ? 'active' : 'inactive';
            
            nav.innerHTML = `
            <div class="flex justify-around items-center glass-card mx-6 mb-6 rounded-3xl p-3 shadow-2xl border-t border-white/20 backdrop-blur-xl">
                <button onclick="App.Router.navigate('home')" class="nav-btn ${cls('home')}">
                    <i class="fa-solid fa-house"></i>
                    <span class="text-[9px] font-bold uppercase mt-1">Home</span>
                </button>
                <button onclick="App.Router.navigate('notes')" class="nav-btn ${cls('notes')}">
                    <i class="fa-solid fa-book-open"></i>
                    <span class="text-[9px] font-bold uppercase mt-1">Notes</span>
                </button>
                <button onclick="App.Router.navigate('stats')" class="nav-btn ${cls('stats')}">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span class="text-[9px] font-bold uppercase mt-1">Stats</span>
                </button>
            </div>`;
        },

        /* --- VIEWS --- */
        drawHome() {
            const main = document.getElementById('main-view');
            const subjects = App.state.paper === 'gs1' ? CONFIG.subjectsGS1 : CONFIG.subjectsCSAT;
            
            main.innerHTML = `
            <div class="px-2 space-y-6 pb-24 animate-fade-in">
                <div class="toggle-pill relative mx-auto">
                    <div class="active-bg" style="transform: translateX(${App.state.paper === 'gs1' ? '0' : '100%'})"></div>
                    <button onclick="App.state.paper='gs1'; App.UI.drawHome()" class="relative z-10 flex-1 text-[10px] font-bold p-3 text-center text-slate-800 dark:text-white transition-colors">GS PAPER 1</button>
                    <button onclick="App.state.paper='csat'; App.UI.drawHome()" class="relative z-10 flex-1 text-[10px] font-bold p-3 text-center text-slate-800 dark:text-white transition-colors">CSAT PAPER 2</button>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div onclick="App.UI.modals.setup('Mock Test', 'random')" class="glass-card p-5 rounded-3xl flex flex-col items-center gap-2 cursor-pointer bg-blue-50/50 dark:bg-blue-900/20 hover:scale-[1.02] transition-transform">
                        <i class="fa-solid fa-trophy text-2xl text-blue-500"></i>
                        <span class="text-xs font-bold text-slate-700 dark:text-white">Mock Test</span>
                    </div>
                    <div onclick="App.UI.modals.setup('Mistakes', 'mistakes')" class="glass-card p-5 rounded-3xl flex flex-col items-center gap-2 cursor-pointer bg-red-50/50 dark:bg-red-900/20 hover:scale-[1.02] transition-transform">
                        <i class="fa-solid fa-rotate-left text-2xl text-red-500"></i>
                        <span class="text-xs font-bold text-slate-700 dark:text-white">Mistakes</span>
                    </div>
                </div>

                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Subjects</h3>
                <div class="grid grid-cols-2 gap-3">
                    ${subjects.map(s => `
                    <div onclick="App.UI.modals.setup('${s.name}', '${s.name}')" class="glass-card p-4 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-${s.color}-400">
                        <div class="w-12 h-12 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/30 text-${s.color}-600 dark:text-${s.color}-400 flex items-center justify-center text-xl">
                            <i class="fa-solid fa-${s.icon || 'book'}"></i>
                        </div>
                        <span class="text-[10px] font-black text-center text-slate-700 dark:text-slate-200 leading-tight uppercase">${s.name}</span>
                    </div>`).join('')}
                </div>
            </div>`;
        },

        drawQuiz() {
            const q = App.state.quiz;
            const current = q.questions[q.currentIdx];
            const main = document.getElementById('main-view');

            if(!current) return App.Router.navigate('home');

            main.innerHTML = `
            <div class="px-2 pb-32 animate-slide-up">
                <div class="flex gap-2 mb-4">
                    <span class="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase">Q ${q.currentIdx + 1}/${q.questions.length}</span>
                    ${current.year ? `<span class="text-[9px] font-bold bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded text-blue-600">${current.year}</span>` : ''}
                    ${current.difficulty ? `<span class="text-[9px] font-bold bg-amber-50 dark:bg-amber-900 px-2 py-1 rounded text-amber-600 uppercase">${current.difficulty}</span>` : ''}
                </div>

                <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-8 leading-relaxed font-display">
                    ${current.text}
                </h3>

                <div class="space-y-3">
                    ${current.options.map((opt, i) => {
                        const isSel = q.answers[q.currentIdx] === i;
                        const isCorrect = current.correct === i;
                        let cls = "glass-card p-4 rounded-2xl flex items-start gap-4 transition-all border-2 ";
                        
                        // Mode Logic
                        if (q.config.mode === 'learning' && q.answers[q.currentIdx] !== undefined) {
                            if (isCorrect) cls += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                            else if (isSel) cls += "border-red-500 bg-red-50 dark:bg-red-900/20";
                            else cls += "border-transparent opacity-50";
                        } else if (isSel) {
                            cls += "border-blue-600 bg-blue-50 dark:bg-blue-900/20";
                        } else {
                            cls += "border-transparent hover:border-slate-300 dark:hover:border-slate-600";
                        }

                        return `
                        <div onclick="App.UI.handleOption(${i})" class="${cls} cursor-pointer">
                            <div class="w-6 h-6 rounded-full border border-slate-300 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400 mt-0.5">
                                ${String.fromCharCode(65 + i)}
                            </div>
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">${opt}</span>
                        </div>`;
                    }).join('')}
                </div>

                ${q.config.mode === 'learning' && q.answers[q.currentIdx] !== undefined ? `
                <div class="mt-8 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 animate-slide-up">
                    <h4 class="text-[10px] font-black text-blue-600 uppercase mb-2"><i class="fa-solid fa-lightbulb mr-1"></i> Explanation</h4>
                    <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">${current.explanation}</p>
                </div>` : ''}
            </div>

            <div class="fixed bottom-0 left-0 right-0 p-4 glass-card rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 flex items-center gap-4 max-w-md mx-auto">
                <button onclick="App.UI.modals.map()" class="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600">
                    <i class="fa-solid fa-grip-vertical"></i>
                </button>
                <div class="flex-1 flex gap-3">
                    <button onclick="App.UI.moveQ(-1)" class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-xs hover:bg-slate-200">PREV</button>
                    <button onclick="App.UI.moveQ(1)" class="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs shadow-lg transform active:scale-95 transition-transform">NEXT</button>
                </div>
            </div>`;
        },

        drawNotes() {
            const main = document.getElementById('main-view');
            const res = CONFIG.resources;
            
            main.innerHTML = `
            <div class="px-2 pb-24 space-y-4 animate-slide-up">
                <div onclick="window.open('${res.psirDrive}', '_blank')" class="glass-card p-6 rounded-3xl relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform">
                    <div class="absolute -right-6 -top-6 w-32 h-32 bg-purple-100 dark:bg-purple-900/40 rounded-full blur-2xl"></div>
                    <div class="relative z-10 flex flex-col h-32 justify-between">
                        <div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                            <i class="fa-brands fa-google-drive"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white leading-none">PSIR Optional</h3>
                            <p class="text-[10px] font-bold text-purple-500 uppercase mt-1">Direct Drive Access</p>
                        </div>
                    </div>
                </div>

                <div onclick="App.UI.modals.toppers()" class="glass-card p-6 rounded-3xl relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform">
                    <div class="absolute -right-6 -top-6 w-32 h-32 bg-emerald-100 dark:bg-emerald-900/40 rounded-full blur-2xl"></div>
                    <div class="relative z-10 flex flex-col h-32 justify-between">
                        <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                            <i class="fa-solid fa-pen-nib"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white leading-none">Topper Copies</h3>
                            <p class="text-[10px] font-bold text-emerald-500 uppercase mt-1">Vision, Forum, Next IAS</p>
                        </div>
                    </div>
                </div>

                <div class="glass-card p-6 rounded-3xl border-dashed border-2 border-slate-300 flex items-center justify-center h-24">
                    <span class="text-xs font-bold text-slate-400 uppercase">Daily Briefs • Coming Soon</span>
                </div>
            </div>`;
        },

        drawStats() {
            const history = App.state.history;
            const main = document.getElementById('main-view');
            
            if (history.length === 0) {
                main.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                    <i class="fa-solid fa-chart-simple text-4xl mb-2"></i>
                    <p class="text-xs font-bold uppercase">No Data Available</p>
                </div>`;
                return;
            }

            main.innerHTML = `
            <div class="px-2 pb-24 space-y-4 animate-slide-up">
                <div class="glass-card p-6 rounded-[30px] flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10">
                    <div>
                        <h3 class="text-xs font-bold text-slate-500 uppercase">Tests Taken</h3>
                        <p class="text-4xl font-black text-slate-800 dark:text-white mt-1">${history.length}</p>
                    </div>
                    <div class="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg">
                        <i class="fa-solid fa-graduation-cap text-2xl text-blue-500"></i>
                    </div>
                </div>

                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Recent Activity</h3>
                <div class="space-y-3">
                    ${history.map(h => `
                    <div class="glass-card p-4 rounded-2xl flex justify-between items-center">
                        <div>
                            <h4 class="text-xs font-bold text-slate-800 dark:text-white leading-tight mb-1">${h.subject}</h4>
                            <p class="text-[10px] font-medium text-slate-400">${new Date(h.date).toLocaleDateString()}</p>
                        </div>
                        <div class="text-right">
                             <div class="text-xl font-black ${parseFloat(h.score) > 0 ? 'text-emerald-500' : 'text-red-500'}">${h.score}</div>
                             <div class="text-[8px] font-bold text-slate-400 uppercase">Score</div>
                        </div>
                    </div>`).join('')}
                </div>
            </div>`;
        },

        drawAnalysis(res) {
            const main = document.getElementById('main-view');
            main.innerHTML = `
            <div class="px-2 pb-24 space-y-6 animate-slide-up">
                <div class="glass-card p-8 rounded-[40px] text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">FINAL SCORE</p>
                    <div class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tighter mb-6">${res.score}</div>
                    
                    <div class="flex justify-center gap-8">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-emerald-500">${res.correct}</div>
                            <div class="text-[8px] font-bold text-slate-400 uppercase mt-1">Correct</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-red-500">${res.wrong}</div>
                            <div class="text-[8px] font-bold text-slate-400 uppercase mt-1">Wrong</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-slate-400">${res.accuracy}%</div>
                            <div class="text-[8px] font-bold text-slate-400 uppercase mt-1">Accuracy</div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 h-48">
                    <div class="glass-card p-2 rounded-3xl flex items-center justify-center relative">
                        <canvas id="chartAccuracy"></canvas>
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span class="text-[10px] font-bold text-slate-400">DIST</span>
                        </div>
                    </div>
                    <div class="glass-card p-4 rounded-3xl flex flex-col justify-center gap-2">
                         <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-emerald-500" style="width: ${res.accuracy}%"></div></div>
                         <div class="flex justify-between text-[8px] font-bold text-slate-400"><span>ACC</span><span>${res.accuracy}%</span></div>
                         
                         <div class="h-2 bg-slate-100 rounded-full overflow-hidden mt-2"><div class="h-full bg-blue-500" style="width: ${(res.total - res.wrong - res.correct)/res.total * 100}%"></div></div>
                         <div class="flex justify-between text-[8px] font-bold text-slate-400"><span>SKIP</span><span>${res.total - res.wrong - res.correct}</span></div>
                    </div>
                </div>

                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Review</h3>
                <div class="space-y-4">
                    ${res.fullData.map((q, i) => `
                    <div class="glass-card p-5 rounded-3xl border-l-4 ${q.userAns === q.correct ? 'border-l-emerald-500' : (q.userAns === undefined ? 'border-l-slate-300' : 'border-l-red-500')}">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-[10px] font-black text-slate-400">Q${i+1}</span>
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded ${q.userAns === q.correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} uppercase">
                                ${q.userAns === q.correct ? 'Correct' : (q.userAns === undefined ? 'Skipped' : 'Wrong')}
                            </span>
                        </div>
                        <p class="text-sm font-bold text-slate-800 dark:text-white mb-2 line-clamp-2">${q.text}</p>
                        <p class="text-xs text-slate-500 leading-relaxed">${q.explanation}</p>
                    </div>`).join('')}
                </div>
            </div>`;
            
            // Render Chart
            setTimeout(() => {
                new Chart(document.getElementById('chartAccuracy'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Correct', 'Wrong', 'Skip'],
                        datasets: [{
                            data: [res.correct, res.wrong, res.total - res.correct - res.wrong],
                            backgroundColor: ['#10b981', '#ef4444', '#e2e8f0'],
                            borderWidth: 0
                        }]
                    },
                    options: { responsive: true, cutout: '75%', plugins: { legend: { display: false } } }
                });
            }, 100);
        },

        drawSettings() {
            const main = document.getElementById('main-view');
            main.innerHTML = `
            <div class="px-2 pt-6 space-y-6 animate-slide-up">
                <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-bold text-slate-800 dark:text-white">Dark Mode</h3>
                        <p class="text-xs text-slate-400">Reduce eye strain</p>
                    </div>
                    <button onclick="App.UI.toggleDark()" class="w-12 h-7 bg-slate-200 dark:bg-blue-600 rounded-full relative transition-colors">
                        <div class="w-5 h-5 bg-white rounded-full absolute top-1 left-1 dark:left-6 transition-all shadow-sm"></div>
                    </button>
                </div>

                <div class="glass-card p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-bold text-slate-800 dark:text-white">Reset Progress</h3>
                        <p class="text-xs text-slate-400">Clear all history & mistakes</p>
                    </div>
                    <button onclick="if(confirm('Reset all data? This cannot be undone.')){ localStorage.clear(); location.reload(); }" class="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold">Reset</button>
                </div>

                <div class="text-center pt-10">
                    <p class="text-[10px] font-bold text-slate-300 uppercase">UPSC Pro v${CONFIG.version}</p>
                    <p class="text-[10px] text-slate-300 mt-1">Made with <i class="fa-solid fa-heart text-red-400"></i> for Aspirants</p>
                </div>
            </div>`;
        },

        /* --- LOGIC HELPERS --- */
        handleOption(idx) {
            App.state.quiz.answers[App.state.quiz.currentIdx] = idx;
            this.drawQuiz(); // Re-render to show selection state
        },
        moveQ(dir) {
            const q = App.state.quiz;
            const target = q.currentIdx + dir;
            if (target >= 0 && target < q.questions.length) {
                q.currentIdx = target;
                this.drawQuiz();
            }
        },
        toggleDark() {
            const isDark = document.documentElement.classList.toggle('dark');
            App.state.settings.theme = isDark ? 'dark' : 'light';
            localStorage.setItem('upsc_settings', JSON.stringify(App.state.settings));
            this.drawSettings(); // Re-render toggle state
        },
        loader(show) {
            const el = document.getElementById('loader');
            if (show) el.classList.remove('hidden'); else el.classList.add('hidden');
        },

        /* --- MODALS --- */
        modals: {
            setup(title, type) {
                const modal = document.createElement('div');
                modal.className = "fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center";
                modal.innerHTML = `
                <div class="glass-card w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] p-8 animate-slide-up">
                    <div class="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                    <h3 class="text-xl font-black text-slate-800 dark:text-white uppercase mb-6">${title}</h3>
                    
                    <div class="space-y-6">
                        <div>
                            <label class="text-[10px] font-black text-slate-400 uppercase mb-3 block">Questions</label>
                            <div class="grid grid-cols-4 gap-2" id="q-counts">
                                ${[10, 20, 50, 100].map(n => `<button class="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500" onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('bg-slate-900','text-white','dark:bg-blue-600')); this.classList.add('bg-slate-900','text-white','dark:bg-blue-600');">${n}</button>`).join('')}
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] font-black text-slate-400 uppercase mb-3 block">Mode</label>
                            <div class="grid grid-cols-2 gap-2" id="q-modes">
                                <button class="py-4 rounded-2xl bg-slate-900 text-white dark:bg-blue-600 text-xs font-bold border-2 border-transparent">Test</button>
                                <button class="py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold border-2 border-transparent" onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.className='py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold border-2 border-transparent'); this.className='py-4 rounded-2xl bg-slate-900 text-white dark:bg-blue-600 text-xs font-bold border-2 border-transparent';">Learn</button>
                            </div>
                        </div>
                    </div>
                    <button id="start-btn" class="w-full mt-10 py-4 bg-blue-600 text-white rounded-3xl font-bold shadow-lg shadow-blue-500/30">Start Quiz</button>
                </div>`;
                document.body.appendChild(modal);
                
                // Set Defaults
                modal.querySelector('#q-counts button').click(); // Select 10

                modal.querySelector('#start-btn').onclick = () => {
                    const count = parseInt(modal.querySelector('#q-counts .bg-slate-900, #q-counts .dark\\:bg-blue-600').innerText);
                    const mode = modal.querySelector('#q-modes .bg-slate-900, #q-modes .dark\\:bg-blue-600').innerText.toLowerCase();
                    modal.remove();
                    App.Engine.start({ subject: type, count, mode, type });
                };
                modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
            },
            
            map() {
                const q = App.state.quiz;
                const modal = document.createElement('div');
                modal.className = "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6";
                modal.innerHTML = `
                <div class="glass-card w-full max-w-sm rounded-[40px] p-6 animate-slide-up bg-white dark:bg-slate-900">
                    <h3 class="text-xs font-black text-slate-400 uppercase mb-4">Question Map</h3>
                    <div class="grid grid-cols-5 gap-3 max-h-80 overflow-y-auto no-scrollbar">
                        ${q.questions.map((_, i) => {
                            let color = q.currentIdx === i ? 'bg-blue-600 text-white' : (q.answers[i] !== undefined ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400');
                            return `<button onclick="App.state.quiz.currentIdx=${i}; App.UI.drawQuiz(); this.closest('div.fixed').remove()" class="w-full aspect-square rounded-xl text-[10px] font-bold ${color}">${i+1}</button>`;
                        }).join('')}
                    </div>
                    <button onclick="this.closest('div.fixed').remove()" class="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-500">Close</button>
                </div>`;
                document.body.appendChild(modal);
            },

            toppers() {
                const modal = document.createElement('div');
                modal.className = "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6";
                modal.innerHTML = `
                <div class="glass-card w-full max-w-sm rounded-[40px] p-8 animate-slide-up bg-white dark:bg-slate-900">
                    <h3 class="text-xl font-black text-slate-800 dark:text-white mb-6">Topper Archives</h3>
                    <div class="grid grid-cols-3 gap-3">
                        ${CONFIG.resources.toppers.map(t => `
                        <a href="${t.url}" target="_blank" class="flex flex-col items-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div class="w-12 h-12 rounded-xl bg-${t.color}-100 text-${t.color}-600 flex items-center justify-center text-lg font-black mb-2">${t.char}</div>
                            <span class="text-[10px] font-bold text-slate-600 dark:text-slate-400">${t.name}</span>
                        </a>`).join('')}
                    </div>
                    <button onclick="this.closest('div.fixed').remove()" class="w-full mt-8 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-500">Close</button>
                </div>`;
                document.body.appendChild(modal);
            }
        },

        showDisclaimer() {
            const modal = document.createElement('div');
            modal.className = "fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6";
            modal.innerHTML = `
            <div class="glass-card w-full max-w-sm rounded-[40px] p-8 text-center animate-slide-up bg-white dark:bg-slate-900">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-6 shadow-xl shadow-blue-500/30">
                    <i class="fa-solid fa-user-shield"></i>
                </div>
                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Welcome, Aspirant</h2>
                <p class="text-xs text-slate-500 leading-relaxed mb-8">Listen to the orientation before starting your preparation journey.</p>
                <audio controls src="assets/audio/disclaimer.mp3" class="w-full mb-8 rounded-full"></audio>
                <button onclick="localStorage.setItem('upsc_visited','true'); this.closest('div.fixed').remove();" class="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold">Enter App</button>
            </div>`;
            document.body.appendChild(modal);
        }
    },

    /* =========================================
       MODULE 6: UTILS (Helpers)
       ========================================= */
    Utils: {
        shuffle: (arr) => arr.sort(() => Math.random() - 0.5),
        formatTime: (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
 
