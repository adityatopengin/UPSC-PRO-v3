/**
 * APP.JS
 * The Consolidated Brain of UPSC Pro v3.
 * Architecture: Modular Monolith (Store -> Engine -> UI -> Router)
 * Updated: Added Notes & Resource Library
 */

const App = {
    // Global State
    state: {
        activeView: 'dashboard',
        quiz: {
            questions: [],
            answers: {},
            bookmarks: [],
            currentIdx: 0,
            startTime: null,
            timerInterval: null,
            isPaused: false
        },
        user: {
            name: "Aspirant",
            target: 2026
        }
    },

    /* =========================================
       MODULE 1: STORE (Data Persistence)
       ========================================= */
    Store: {
        get(key, def) {
            try { return JSON.parse(localStorage.getItem(`upsc_${key}`)) || def; } 
            catch { return def; }
        },
        set(key, val) {
            localStorage.setItem(`upsc_${key}`, JSON.stringify(val));
        },
        getHistory() { return this.get('history', []); },
        saveResult(result) {
            const history = this.getHistory();
            history.unshift(result);
            if (history.length > 50) history.pop();
            this.set('history', history);
        },
        getMistakes() { return this.get('mistakes', []); },
        saveMistake(question) {
            const list = this.getMistakes();
            if (!list.find(q => q.id === question.id)) {
                list.push(question);
                this.set('mistakes', list);
            }
        },
        getSettings() { return this.get('settings', { theme: 'light', sound: true }); }
    },

    /* =========================================
       MODULE 2: UTILS (Helpers)
       ========================================= */
    Utils: {
        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },
        formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s.toString().padStart(2, '0')}`;
        },
        calculateScore(questions, answers, paper) {
            let correct = 0, wrong = 0, attempted = 0;
            questions.forEach((q, i) => {
                const ans = answers[q.id];
                if (ans !== undefined) {
                    attempted++;
                    if (ans === q.correct) correct++; else wrong++;
                }
            });
            const positive = paper === 'csat' ? 2.5 : 2.0;
            const negative = paper === 'csat' ? 0.83 : 0.66;
            const score = (correct * positive) - (wrong * negative);
            return { score: score.toFixed(2), correct, wrong, attempted };
        }
    },

    /* =========================================
       MODULE 3: ENGINE (Quiz Logic)
       ========================================= */
    Engine: {
        async startQuiz(config) {
            App.UI.showLoader(true);
            try {
                let questions = [];
                if (config.type === 'mistakes') {
                    questions = App.Store.getMistakes();
                } else {
                    const fileName = CONFIG.getFileName(config.subjectId);
                    const res = await fetch(`data/${fileName}`);
                    if (!res.ok) throw new Error("File not found");
                    questions = await res.json();
                }

                if (!questions || questions.length === 0) throw new Error("No questions available.");

                if (CONFIG.defaults.randomize) {
                    questions = App.Utils.shuffle(questions);
                }
                questions = questions.slice(0, config.count);

                App.state.quiz = {
                    questions: questions,
                    answers: {},
                    bookmarks: [],
                    currentIdx: 0,
                    config: config,
                    startTime: Date.now(),
                    timeLeft: config.timeLimit
                };

                App.Router.navigate('quiz');
                this.startTimer();
                App.UI.renderQuestion(0);

            } catch (e) {
                alert("Error: " + e.message);
                App.Router.navigate('dashboard');
            } finally {
                App.UI.showLoader(false);
            }
        },

        startTimer() {
            if (App.state.quiz.config.mode !== 'test') return;
            const display = document.getElementById('timer-display');
            clearInterval(App.state.quiz.timerInterval);

            App.state.quiz.timerInterval = setInterval(() => {
                App.state.quiz.timeLeft--;
                const t = App.state.quiz.timeLeft;
                
                if (display) {
                    display.innerText = App.Utils.formatTime(t);
                    if (t < 60) display.classList.add('text-red-500');
                }

                if (t <= 0) {
                    clearInterval(App.state.quiz.timerInterval);
                    alert("Time's Up!");
                    this.submitQuiz();
                }
            }, 1000);
        },

        submitQuiz() {
            clearInterval(App.state.quiz.timerInterval);
            const qState = App.state.quiz;
            const stats = App.Utils.calculateScore(qState.questions, qState.answers, qState.config.paper);

            const result = {
                date: new Date().toISOString(),
                subject: qState.config.subjectName,
                score: stats.score,
                total: qState.questions.length,
                stats: stats
            };

            App.Store.saveResult(result);
            
            qState.questions.forEach(q => {
                if (qState.answers[q.id] !== undefined && qState.answers[q.id] !== q.correct) {
                    App.Store.saveMistake(q);
                }
            });

            App.Router.navigate('result', result);
        }
    },

    /* =========================================
       MODULE 4: UI (The IOS Designer)
       ========================================= */
    UI: {
        renderHeader(view) {
            const header = document.getElementById('app-header');
            if (view === 'dashboard') {
                header.innerHTML = `
                    <div class="glass-header rounded-3xl p-4 flex items-center justify-between shadow-sm animate-fade-in">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                                <img src="assets/images/Omg.jpg" alt="User" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h1 class="text-xs font-bold text-slate-500 uppercase">Welcome Back</h1>
                                <p class="text-sm font-black text-slate-800 dark:text-white">${App.state.user.name}</p>
                            </div>
                        </div>
                        <button onclick="App.UI.toggleDark()" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors">
                            <i class="fa-solid fa-moon"></i>
                        </button>
                    </div>
                `;
            } else if (view === 'quiz') {
                header.innerHTML = `
                    <div class="flex items-center justify-between animate-fade-in">
                        <button onclick="App.Router.navigate('dashboard')" class="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-500 hover:text-blue-600">
                            <i class="fa-solid fa-arrow-left"></i>
                        </button>
                        <div class="glass-card px-4 py-2 rounded-full font-mono font-bold text-blue-600" id="timer-display">
                            00:00
                        </div>
                        <button onclick="App.Engine.submitQuiz()" class="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-lg">
                            Submit
                        </button>
                    </div>
                `;
            } else {
                 header.innerHTML = `
                    <div class="flex items-center gap-4 animate-fade-in">
                        <button onclick="App.Router.navigate('dashboard')" class="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-500">
                            <i class="fa-solid fa-house"></i>
                        </button>
                        <h2 class="text-lg font-bold text-slate-800 dark:text-white capitalize">${view}</h2>
                    </div>
                `;
            }
        },

        renderDashboard() {
            const container = document.getElementById('main-view');
            const history = App.Store.getHistory();
            const totalQs = history.reduce((acc, h) => acc + h.total, 0);
            
            let html = `
                <section class="mb-6 animate-slide-up">
                    <div class="glass-card p-6 rounded-3xl relative overflow-hidden">
                        <div class="relative z-10">
                            <div class="flex justify-between items-end mb-2">
                                <div>
                                    <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Target ${App.state.user.target}</span>
                                    <h2 class="text-3xl font-black text-slate-800 dark:text-white mt-2">${totalQs}</h2>
                                    <p class="text-xs text-slate-500 font-bold uppercase">Questions Solved</p>
                                </div>
                                <div class="text-right">
                                    <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-200">
                                        <i class="fa-solid fa-trophy"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="mb-2 flex gap-3 animate-slide-up" style="animation-delay: 0.1s;">
                    <button onclick="App.Router.startQuickQuiz('random')" class="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                        <i class="fa-solid fa-shuffle text-2xl text-amber-500"></i>
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Random 10</span>
                    </button>
                     <button onclick="App.Router.startQuickQuiz('mistakes')" class="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                        <i class="fa-solid fa-rotate-left text-2xl text-red-500"></i>
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Mistakes</span>
                    </button>
                </section>
                
                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-1">GS Paper 1</h3>
                <div class="grid grid-cols-2 gap-3 pb-24">
            `;

            CONFIG.subjectsGS1.forEach(sub => {
                html += `
                    <div onclick="App.Router.openSubject('${sub.id}')" class="glass-card p-4 rounded-2xl flex flex-col items-center text-center gap-3 cursor-pointer active:scale-95 transition-transform hover:border-${sub.color}-400">
                        <div class="w-10 h-10 rounded-xl bg-${sub.color}-50 text-${sub.color}-600 flex items-center justify-center text-lg">
                            <i class="fa-solid fa-${sub.icon}"></i>
                        </div>
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">${sub.name}</span>
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;
        },

        renderQuestion(idx) {
            const q = App.state.quiz.questions[idx];
            App.state.quiz.currentIdx = idx;
            const container = document.getElementById('main-view');

            let html = `
                <div class="animate-fade-in pb-24">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-xs font-bold text-slate-400 uppercase">Q ${idx + 1} of ${App.state.quiz.questions.length}</span>
                        <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">${App.state.quiz.config.subjectName}</span>
                    </div>
                    
                    <p class="text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed mb-6 font-display">
                        ${q.text}
                    </p>

                    <div class="space-y-3">
            `;

            q.options.forEach((opt, i) => {
                const isSel = App.state.quiz.answers[q.id] === i;
                const activeClass = isSel ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-transparent bg-white/50 dark:bg-slate-800/50';
                
                html += `
                    <div onclick="App.UI.selectOption('${q.id}', ${i})" class="glass-card p-4 rounded-xl border-2 ${activeClass} cursor-pointer flex items-start gap-3 transition-all active:scale-98">
                        <div class="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-400 mt-0.5">
                            ${String.fromCharCode(65 + i)}
                        </div>
                        <span class="text-sm text-slate-700 dark:text-slate-300">${opt}</span>
                    </div>
                `;
            });

            html += `
                    </div>
                    <div class="fixed bottom-0 left-0 w-full p-4 glass-nav flex justify-between gap-4 z-40">
                         <button onclick="App.UI.prevQ()" class="w-12 h-12 rounded-full glass-card flex items-center justify-center text-slate-500" ${idx===0 ? 'disabled opacity-50':''}>
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <button onclick="App.UI.nextQ()" class="flex-1 btn-primary h-12 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
                            ${idx === App.state.quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        </button>
                    </div>
                </div>
            `;
            container.innerHTML = html;
        },

        renderResult(result) {
             const container = document.getElementById('main-view');
             container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center animate-slide-up pb-20">
                    <div class="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mb-6 shadow-xl">
                        <i class="fa-solid fa-medal"></i>
                    </div>
                    <h2 class="text-3xl font-black text-slate-800 dark:text-white mb-2">Quiz Complete!</h2>
                    <p class="text-sm text-slate-500 mb-8">You scored</p>
                    
                    <div class="text-6xl font-black text-blue-600 mb-2 tracking-tighter">${result.score}</div>
                    <div class="text-xs font-bold text-slate-400 uppercase mb-8">Out of ${result.total * 2}</div>
                    
                    <div class="grid grid-cols-2 gap-4 w-full mb-8">
                        <div class="glass-card p-4 rounded-2xl">
                            <div class="text-2xl font-bold text-emerald-500">${result.stats.correct}</div>
                            <div class="text-[10px] uppercase font-bold text-slate-400">Correct</div>
                        </div>
                        <div class="glass-card p-4 rounded-2xl">
                            <div class="text-2xl font-bold text-red-500">${result.stats.wrong}</div>
                            <div class="text-[10px] uppercase font-bold text-slate-400">Wrong</div>
                        </div>
                    </div>

                    <button onclick="App.Router.navigate('dashboard')" class="btn-primary w-full py-4 rounded-2xl font-bold shadow-lg active:scale-95">
                        Back to Home
                    </button>
                </div>
             `;
        },

        // --- NEW: NOTES RENDERER ---
        renderNotes() {
            const container = document.getElementById('main-view');
            container.innerHTML = `
                <div class="animate-slide-up pb-24">
                    <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-1 px-1">Library</h2>
                    <p class="text-xs font-bold text-slate-400 uppercase mb-6 px-1">Premium Resources & Drive Links</p>

                    <div class="grid grid-cols-2 gap-3">
                        
                        <div onclick="window.open('https://drive.google.com/drive/folders/1-2kk78IRyyhx3TFV2_87cm_iGgdWMwQH', '_blank')" 
                             class="glass-card row-span-2 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-h-[220px]">
                            <div class="absolute -right-12 -top-12 w-40 h-40 bg-purple-100 dark:bg-purple-900/30 rounded-full blur-2xl"></div>
                            
                            <div class="relative z-10">
                                <div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl mb-3">
                                    <i class="fa-solid fa-landmark-dome"></i>
                                </div>
                                <span class="px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-[9px] font-bold uppercase border border-purple-100">Drive Link</span>
                            </div>
                            
                            <div class="relative z-10 mt-4">
                                <h3 class="text-xl font-black text-slate-800 dark:text-white leading-none">PSIR<br><span class="text-purple-500">Optional</span></h3>
                                <div class="mt-4 flex items-center gap-2 text-[10px] font-bold text-white bg-purple-600 w-full justify-center py-2.5 rounded-xl shadow-md">
                                    <span>Open Drive</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                </div>
                            </div>
                        </div>

                        <div onclick="App.UI.showTopperLinks()" 
                             class="glass-card row-span-2 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-h-[220px]">
                            <div class="absolute -right-12 -top-12 w-40 h-40 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl"></div>
                            
                            <div class="relative z-10">
                                <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-3">
                                    <i class="fa-solid fa-pen-fancy"></i>
                                </div>
                                <span class="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold uppercase border border-blue-100">Archive</span>
                            </div>
                            
                            <div class="relative z-10 mt-4">
                                <h3 class="text-xl font-black text-slate-800 dark:text-white leading-none">Topper<br><span class="text-blue-500">Copies</span></h3>
                                <div class="mt-4 flex items-center gap-2 text-[10px] font-bold text-white bg-blue-600 w-full justify-center py-2.5 rounded-xl shadow-md">
                                    <span>View List</span> <i class="fa-solid fa-list"></i>
                                </div>
                            </div>
                        </div>

                        <div class="col-span-2 rounded-3xl p-6 relative overflow-hidden bg-slate-900 shadow-xl border border-white/10 h-32 flex flex-col justify-center">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                            <div class="relative z-10">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Today's Brief</span>
                                </div>
                                <h3 class="text-lg font-bold text-white leading-tight">The Hindu & Express Summary</h3>
                                <button class="text-xs text-slate-400 mt-2 font-bold hover:text-white transition-colors">Read Analysis <i class="fa-solid fa-arrow-right ml-1"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        showTopperLinks() {
            const modalHtml = `
                <div class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in" onclick="this.remove()">
                    <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up border border-white/10" onclick="event.stopPropagation()">
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Topper Archives</h3>
                        <div class="grid grid-cols-3 gap-3">
                            ${App.UI._renderLink('Vision', 'V', 'slate', 'http://www.visionias.in/resources/toppers_answers.php')}
                            ${App.UI._renderLink('Forum', 'F', 'red', 'https://forumias.com/blog/testimonials/')}
                            ${App.UI._renderLink('Insights', 'I', 'teal', 'https://www.insightsonindia.com/upsc-toppers-answer-copies-download-ias-topper-mains-copies-by-insightsias/')}
                            ${App.UI._renderLink('Next IAS', 'N', 'emerald', 'https://www.nextias.com/toppers-answers-ias')}
                            ${App.UI._renderLink('Drishti', 'D', 'amber', 'https://www.drishtiias.com/free-downloads/toppers-copy/')}
                            ${App.UI._renderLink('Vajiram', 'VR', 'yellow', 'https://vajiramandravi.com/upsc-ias-toppers-copy-and-answer-sheets/')}
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="w-full mt-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs">Close</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        },

        _renderLink(name, char, color, url) {
            const colors = {
                slate: 'bg-slate-900', red: 'bg-red-600', teal: 'bg-teal-600',
                emerald: 'bg-emerald-600', amber: 'bg-amber-600', yellow: 'bg-yellow-500 text-black'
            };
            const bgClass = colors[color] || 'bg-blue-600';
            
            return `
                <a href="${url}" target="_blank" class="flex flex-col items-center group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div class="w-12 h-12 rounded-xl ${bgClass} text-white flex items-center justify-center text-xl font-black shadow-md mb-2">
                        ${char}
                    </div>
                    <span class="text-[10px] font-bold text-slate-600 dark:text-slate-400">${name}</span>
                </a>
            `;
        },

        // Helpers
        selectOption(qid, idx) {
            App.state.quiz.answers[qid] = idx;
            App.UI.renderQuestion(App.state.quiz.currentIdx);
        },
        nextQ() {
            const s = App.state.quiz;
            if (s.currentIdx < s.questions.length - 1) {
                this.renderQuestion(s.currentIdx + 1);
            } else {
                App.Engine.submitQuiz();
            }
        },
        prevQ() {
            const s = App.state.quiz;
            if (s.currentIdx > 0) this.renderQuestion(s.currentIdx - 1);
        },
        toggleDark() {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            const settings = App.Store.getSettings();
            settings.theme = isDark ? 'dark' : 'light';
            App.Store.set('settings', settings);
        },
        showLoader(show) {
            const el = document.getElementById('main-view');
            if(show) el.innerHTML = '<div class="flex h-full items-center justify-center"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i></div>';
        }
    },

    /* =========================================
       MODULE 5: ROUTER (Navigation)
       ========================================= */
    Router: {
        navigate(view, data = null) {
            App.state.activeView = view;
            App.UI.renderHeader(view);
            
            // Toggle Bottom Nav
            const nav = document.getElementById('app-nav');
            if (view === 'dashboard' || view === 'stats' || view === 'notes') {
                nav.classList.remove('translate-y-full');
                this.renderNav(view);
            } else {
                nav.classList.add('translate-y-full');
            }

            // Render View Content
            if (view === 'dashboard') App.UI.renderDashboard();
            if (view === 'result') App.UI.renderResult(data);
            if (view === 'notes') App.UI.renderNotes();
            if (view === 'stats') this.renderStats();
        },

        renderNav(active) {
            const nav = document.getElementById('app-nav');
            const color = (v) => active === v ? 'text-blue-600 scale-110' : 'text-slate-400';
            
            nav.innerHTML = `
                <div class="glass-nav rounded-3xl px-6 py-4 flex justify-between items-center shadow-2xl">
                    <button onclick="App.Router.navigate('dashboard')" class="flex flex-col items-center gap-1 transition-all ${color('dashboard')}">
                        <i class="fa-solid fa-house text-xl"></i>
                        <span class="text-[9px] font-bold">Home</span>
                    </button>

                    <button onclick="App.Router.navigate('notes')" class="flex flex-col items-center gap-1 transition-all ${color('notes')}">
                        <i class="fa-solid fa-book-open text-xl"></i>
                        <span class="text-[9px] font-bold">Notes</span>
                    </button>

                    <button onclick="App.Router.startQuickQuiz('random')" class="w-14 h-14 -mt-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900 transition-transform active:scale-95">
                        <i class="fa-solid fa-play ml-1 text-lg"></i>
                    </button>

                    <button onclick="App.Router.navigate('stats')" class="flex flex-col items-center gap-1 transition-all ${color('stats')}">
                        <i class="fa-solid fa-chart-pie text-xl"></i>
                        <span class="text-[9px] font-bold">Stats</span>
                    </button>
                </div>
            `;
        },

        startQuickQuiz(type) {
            const config = {
                type: type, // 'random' or 'mistakes'
                count: 10,
                timeLimit: 600,
                mode: 'test',
                subjectName: type === 'random' ? 'Random Mix' : 'Mistake Review',
                paper: 'gs1'
            };
            App.Engine.startQuiz(config);
        },
        
        openSubject(id) {
            const all = [...CONFIG.subjectsGS1, ...CONFIG.subjectsCSAT];
            const sub = all.find(s => s.id === id);
            
            const config = {
                type: 'subject',
                subjectId: sub.id,
                subjectName: sub.name,
                count: CONFIG.defaults.qCount,
                timeLimit: CONFIG.defaults.qCount * CONFIG.defaults.timePerQ_GS,
                mode: 'test',
                paper: 'gs1'
            };
            App.Engine.startQuiz(config);
        },

        renderStats() {
            const history = App.Store.getHistory();
            const container = document.getElementById('main-view');
            
            if(history.length === 0) {
                container.innerHTML = '<div class="flex h-full items-center justify-center text-slate-400">No history yet.</div>';
                return;
            }

            let html = `<h2 class="text-xl font-bold mb-4 px-2">History</h2><div class="space-y-3 pb-24">`;
            history.forEach(h => {
                html += `
                    <div class="glass-card p-4 rounded-2xl flex justify-between items-center">
                        <div>
                            <div class="text-xs font-bold text-slate-400 uppercase">${h.subject}</div>
                            <div class="text-sm font-bold text-slate-800 dark:text-white">${new Date(h.date).toLocaleDateString()}</div>
                        </div>
                        <div class="text-xl font-black text-blue-600">${h.score}</div>
                    </div>
                `;
            });
            html += `</div>`;
            container.innerHTML = html;
        }
    },

    /* =========================================
       INITIALIZATION
       ========================================= */
    init() {
        // Load Theme
        const settings = App.Store.getSettings();
        if (settings.theme === 'dark') document.documentElement.classList.add('dark');
        
        // Initial Render
        this.Router.navigate('dashboard');
        
        console.log("App Initialized v" + CONFIG.version);
    }
};

// Start the Engine
document.addEventListener('DOMContentLoaded', () => App.init());

