/**
 * UI.JS - THE ARCHITECT
 * Version 4.1.0 - Full Feature Set
 * Handles all rendering, animations, and the "Fog Effect" UI components.
 */

const UI = {
    // 1. DYNAMIC HEADER
    renderHeader(view, paper = 'gs1') {
        const header = document.getElementById('app-header');
        if (!header) return;

        if (view === 'home') {
            header.innerHTML = `
            <div class="flex items-center justify-between p-4 glass-card rounded-3xl mx-2 mt-4 animate-view-enter">
                <div class="flex items-center gap-3">
                    <img src="assets/images/Omg.jpg" class="w-10 h-10 rounded-full border-2 border-blue-500 object-cover shadow-sm">
                    <div>
                        <h2 class="text-[11px] font-black text-slate-400 uppercase tracking-tighter leading-none">Aspirant</h2>
                        <p class="text-[13px] font-bold text-slate-800 dark:text-white mt-0.5">Target 2026</p>
                    </div>
                </div>
                <button onclick="Main.navigate('settings')" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-colors">
                    <i class="fa-solid fa-gear"></i>
                </button>
            </div>`;
        } else {
            header.innerHTML = `
            <div class="flex items-center p-4 mt-2 gap-4 animate-view-enter">
                <button onclick="Main.navigate('home')" class="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-500">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                <h2 class="text-xl font-black text-slate-800 dark:text-white capitalize tracking-tight">${view}</h2>
            </div>`;
        }
    },

    // 2. THE FOG FOOTER (3 Stylish Buttons)
    renderFooter(activeView) {
        const nav = document.getElementById('app-nav');
        if (!nav) return;
        nav.classList.remove('hidden');

        const buttons = [
            { id: 'home', icon: 'house-chimney', label: 'Home' },
            { id: 'notes', icon: 'book-open', label: 'Notes' },
            { id: 'stats', icon: 'chart-pie', label: 'Stats' }
        ];

        nav.innerHTML = `
        <div class="flex justify-around items-end pb-4 pt-8 px-4">
            ${buttons.map(btn => {
                const isActive = activeView === btn.id;
                return `
                <button onclick="Main.navigate('${btn.id}')" class="nav-btn ${isActive ? 'active' : 'inactive'}">
                    <div class="relative">
                        <i class="fa-solid fa-${btn.icon} text-lg"></i>
                    </div>
                    <span class="text-[9px] font-black uppercase tracking-widest mt-1">${btn.label}</span>
                </button>`;
            }).join('')}
        </div>`;
    },

    // 3. HOME VIEW (Dashboard)
    drawHome(paper, subjects) {
        const main = document.getElementById('main-view');
        if (!main) return;

        const colorMap = {
            amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:border-b-amber-500',
            blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:border-b-blue-500',
            pink: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 hover:border-b-pink-500',
            cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 hover:border-b-cyan-500',
            green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:border-b-green-500',
            emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:border-b-emerald-500',
            indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:border-b-indigo-500',
            purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:border-b-purple-500',
            slate: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 hover:border-b-slate-500',
            rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:border-b-rose-500',
            teal: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:border-b-teal-500'
        };

        main.innerHTML = `
        <div class="space-y-8 pb-32 animate-view-enter">
            <div class="relative flex bg-slate-200 dark:bg-slate-800 rounded-full p-1 mx-4 shadow-inner">
                <div class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-full transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-md" 
                     style="transform: translateX(${paper === 'gs1' ? '0' : '100%'})"></div>
                <button onclick="Main.togglePaper('gs1')" class="relative z-10 flex-1 py-2.5 text-[10px] font-black text-slate-800 dark:text-white">GENERAL STUDIES</button>
                <button onclick="Main.togglePaper('csat')" class="relative z-10 flex-1 py-2.5 text-[10px] font-black text-slate-800 dark:text-white">CSAT PAPER</button>
            </div>

            <div class="grid grid-cols-2 gap-4 px-1">
                ${subjects.map(s => {
                    const colors = colorMap[s.color] || colorMap.blue;
                    return `
                    <div onclick="UI.modals.setup('${s.name}')" class="glass-card p-5 rounded-[32px] flex flex-col items-center gap-4 active:scale-95 transition-all cursor-pointer border-b-4 border-b-transparent ${colors.split(' ').pop()} group">
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${colors.split(' ').slice(0,3).join(' ')}">
                            <i class="fa-solid fa-${s.icon}"></i>
                        </div>
                        <span class="text-[11px] font-black text-center uppercase leading-tight text-slate-700 dark:text-slate-200 tracking-tighter">${s.name}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    },

    // 4. NOTES VIEW (Eyecatchers & Resources)
    drawNotes() {
        const main = document.getElementById('main-view');
        if (!main) return;

        main.innerHTML = `
        <div class="space-y-8 pb-32 animate-view-enter">
            <div class="grid grid-cols-2 gap-3">
                <div onclick="window.open('${CONFIG.resources.psir.drive}', '_blank')" class="glass-card p-5 rounded-[32px] flex flex-col justify-between h-44 bg-purple-50/30 dark:bg-purple-900/10 cursor-pointer active:scale-95 transition-all">
                    <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-600 flex items-center justify-center text-xl"><i class="fa-brands fa-google-drive"></i></div>
                    <div>
                        <h3 class="text-sm font-black leading-tight">PSIR Drive</h3>
                        <p class="text-[9px] font-bold text-purple-500 uppercase mt-1 tracking-widest">Full Lectures</p>
                    </div>
                </div>
                <div onclick="window.open('${CONFIG.resources.psir.topperRepo}', '_blank')" class="glass-card p-5 rounded-[32px] flex flex-col justify-between h-44 bg-blue-50/30 dark:bg-blue-900/10 cursor-pointer active:scale-95 transition-all">
                    <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center text-xl"><i class="fa-solid fa-signature"></i></div>
                    <div>
                        <h3 class="text-sm font-black leading-tight">PSIR Topper</h3>
                        <p class="text-[9px] font-bold text-blue-500 uppercase mt-1 tracking-widest">Answer Copies</p>
                    </div>
                </div>
            </div>

            <div onclick="UI.modals.coaching()" class="glass-card p-6 rounded-[32px] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/10">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 flex items-center justify-center text-xl shadow-inner"><i class="fa-solid fa-building-columns"></i></div>
                    <div>
                        <h3 class="text-[13px] font-black text-slate-800 dark:text-white">Coaching Archives</h3>
                        <p class="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">Vision, Forum, Shubhra Ranjan +6</p>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right text-slate-300"></i>
            </div>

            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Smart Notes Library</h3>
            <div id="notes-grid" class="grid grid-cols-1 gap-4">
                ${CONFIG.notesLibrary.map(card => `
                <div class="eye-card rounded-[32px] p-6 bg-grad-${card.gradient} text-white shadow-xl relative overflow-hidden">
                    <div class="flex justify-between items-start mb-10">
                        <div>
                            <h3 class="text-lg font-black leading-none mb-1">${card.title}</h3>
                            <p class="text-[10px] font-bold opacity-80 uppercase tracking-widest">${card.subtitle}</p>
                        </div>
                        <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
                            <i class="fa-solid fa-${card.icon}"></i>
                        </div>
                    </div>
                    <div class="flex gap-4 opacity-30">
                        <div class="w-8 h-8 rounded-full border-2 border-white"></div>
                        <div class="w-12 h-2 bg-white rounded-full mt-3"></div>
                        <div class="w-6 h-2 bg-white rounded-full mt-3"></div>
                    </div>
                    <div class="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>`).join('')}
            </div>
        </div>`;
    },

    // 5. QUIZ VIEW (Fixed Metadata Paths)
    drawQuiz(q) {
        const main = document.getElementById('main-view');
        if (!main) return;
        const current = q.questions[q.currentIdx];

        main.innerHTML = `
        <div class="pb-40 animate-view-enter">
            <div class="flex justify-between items-center mb-8">
                <div class="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-black uppercase">
                    Question ${q.currentIdx + 1} / ${q.questions.length}
                </div>
                <div id="quiz-timer" class="font-mono font-black text-lg tracking-tighter text-slate-800 dark:text-white">--:--</div>
            </div>

            <div class="flex gap-2 mb-4">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold uppercase">
                    ${current.metadata.year}
                </span>
                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold uppercase">
                    ${current.metadata.difficulty}
                </span>
            </div>

            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-10 leading-snug font-display">${current.text}</h3>

            <div class="space-y-4">
                ${current.options.map((opt, i) => {
                    const isSel = q.answers[q.currentIdx] === i;
                    const isCorrect = current.correct === i;
                    let cls = "glass-card p-5 rounded-[24px] flex items-start gap-4 transition-all border-2 ";
                    
                    if (q.config.mode === 'learning' && q.answers[q.currentIdx] !== undefined) {
                        if (isCorrect) cls += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                        else if (isSel) cls += "border-red-500 bg-red-50 dark:bg-red-900/20";
                        else cls += "border-transparent opacity-50";
                    } else if (isSel) {
                        cls += "border-blue-600 bg-blue-50 dark:bg-blue-900/20";
                    } else {
                        cls += "border-transparent active:border-slate-300";
                    }

                    return `
                    <div onclick="Main.handleOption(${i})" class="${cls} cursor-pointer">
                        <div class="w-7 h-7 rounded-full border-2 border-slate-200 flex-shrink-0 flex items-center justify-center text-[11px] font-black text-slate-400 mt-0.5">${String.fromCharCode(65 + i)}</div>
                        <span class="text-[15px] font-medium leading-relaxed">${opt}</span>
                    </div>`;
                }).join('')}
            </div>

            ${q.config.mode === 'learning' && q.answers[q.currentIdx] !== undefined ? `
            <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[32px] border border-blue-100 dark:border-blue-800 animate-slide-up">
                <h4 class="text-[10px] font-black text-blue-600 uppercase mb-3 tracking-widest">Logic & Explanation</h4>
                <p class="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">${current.explanation}</p>
            </div>` : ''}
        </div>

        <div class="fixed bottom-0 left-0 right-0 p-4 glass-card rounded-t-[40px] shadow-2xl z-50 flex items-center gap-3 max-w-md mx-auto border-t-0">
            <button onclick="UI.modals.map()" class="w-14 h-14 glass-card rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-500"><i class="fa-solid fa-grip-vertical"></i></button>
            <div class="flex-1 flex gap-3">
                <button onclick="Main.moveQ(-1)" class="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-600">Prev</button>
                <button onclick="Main.moveQ(1)" class="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg">Next</button>
            </div>
            <button onclick="Main.finishQuiz()" class="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><i class="fa-solid fa-check text-xl"></i></button>
        </div>`;
    },

    // 6. MODALS
    modals: {
        setup(subject) {
            UI.showModal(`
            <div class="p-8">
                <div class="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-8"></div>
                <h3 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8">${subject}</h3>
                
                <div class="space-y-8">
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Question Count</label>
                        <div class="grid grid-cols-4 gap-2" id="q-counts">
                            <button data-count="10" type="button" onclick="UI._selectToggle(this)" class="count-btn py-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black transition-all active">10</button>
                            <button data-count="20" type="button" onclick="UI._selectToggle(this)" class="count-btn py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-black transition-all">20</button>
                            <button data-count="50" type="button" onclick="UI._selectToggle(this)" class="count-btn py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-black transition-all">50</button>
                            <button data-count="100" type="button" onclick="UI._selectToggle(this)" class="count-btn py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-black transition-all">100</button>
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Quiz Protocol</label>
                        <div class="grid grid-cols-2 gap-3" id="q-modes">
                            <button data-mode="test" type="button" onclick="UI._selectToggle(this)" class="mode-btn py-5 rounded-3xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-black tracking-widest uppercase active">Test Mode</button>
                            <button data-mode="learning" type="button" onclick="UI._selectToggle(this)" class="mode-btn py-5 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-black tracking-widest uppercase">Learn Mode</button>
                        </div>
                    </div>
                </div>
                <button type="button" onclick="Main.triggerStart('${subject}')" 
                    class="w-full mt-10 py-5 bg-blue-600 text-white rounded-3xl font-black tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase">
                    Initialize Quiz
                </button>
            </div>`);
        },

        coaching() {
            UI.showModal(`
            <div class="p-8">
                <h3 class="text-xl font-black text-slate-800 dark:text-white mb-8 uppercase tracking-tighter">Topper Archives</h3>
                <div class="grid grid-cols-3 gap-6">
                    ${CONFIG.resources.institutes.map(inst => `
                    <a href="${inst.url}" target="_blank" class="flex flex-col items-center gap-3 active:scale-90 transition-transform">
                        <div class="w-14 h-14 rounded-[20px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xl font-black shadow-sm">
                            ${inst.char}
                        </div>
                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-tighter text-center leading-none">${inst.name}</span>
                    </a>`).join('')}
                </div>
                <button onclick="UI.hideModal()" class="w-full mt-10 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Close</button>
            </div>`);
        },

        orientation() {
            UI.showModal(`
            <div class="p-10 text-center">
                <div class="w-24 h-24 bg-blue-600 text-white rounded-[40px] mx-auto flex items-center justify-center text-4xl mb-8 shadow-2xl animate-pulse">
                    <i class="fa-solid fa-microphone-lines"></i>
                </div>
                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tighter">Orientation</h2>
                <p class="text-[13px] text-slate-500 mb-10 leading-relaxed">Instructions by Pradeep Tripathi for the 2026 Batch.</p>
                <div class="flex items-center justify-center gap-8 mb-10">
                    <button id="play-btn" class="w-20 h-20 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-3xl shadow-xl flex items-center justify-center">
                        <i class="fa-solid fa-play ml-1" id="play-icon"></i>
                    </button>
                    <audio id="welcome-audio" src="assets/audio/disclaimer.mp3"></audio>
                </div>
                <button onclick="Main.completeOrientation()" class="w-full py-5 bg-blue-600 text-white rounded-full font-black uppercase text-[11px]">Begin Journey</button>
            </div>`);

            const audio = document.getElementById('welcome-audio');
            const btn = document.getElementById('play-btn');
            const icon = document.getElementById('play-icon');
            if (btn && audio) {
                btn.onclick = () => {
                    if (audio.paused) { 
                        audio.play(); 
                        icon.className = 'fa-solid fa-pause';
                    } else { 
                        audio.pause(); 
                        icon.className = 'fa-solid fa-play ml-1';
                    }
                };
            }
        },

        map() {
            const q = Engine.state.activeQuiz;
            if (!q) return;

            const qGrid = q.questions.map((_, i) => {
                const answered = q.answers[i] !== undefined;
                const isCorrect = q.answers[i] === q.questions[i].correct;
                const isCurrent = i === q.currentIdx;
                
                let className = 'w-8 h-8 rounded text-xs font-black cursor-pointer transition-all ';
                if (isCurrent) className += 'bg-blue-600 text-white scale-110 shadow-lg';
                else if (answered && isCorrect) className += 'bg-emerald-500 text-white';
                else if (answered && !isCorrect) className += 'bg-red-500 text-white';
                else if (answered) className += 'bg-slate-300 text-slate-700';
                else className += 'bg-slate-100 dark:bg-slate-800 text-slate-400';
                
                return `<button onclick="Main.moveQ(${i - q.currentIdx})" class="${className}">${i + 1}</button>`;
            }).join('');

            UI.showModal(`
                <div class="p-8">
                    <h3 class="text-lg font-black mb-6">Question Map</h3>
                    <div class="grid grid-cols-6 gap-2 mb-6">${qGrid}</div>
                    <div class="space-y-2 text-sm mt-4">
                        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-blue-600 rounded"></div> Current</div>
                        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-emerald-500 rounded"></div> Correct</div>
                        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-red-500 rounded"></div> Wrong</div>
                        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div> Unanswered</div>
                    </div>
                    <button onclick="UI.hideModal()" class="w-full mt-8 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm">Close</button>
                </div>
            `);
        }
    },
    
    // 7. CORE UI UTILITIES
    showModal(html) {
        const layer = document.getElementById('modal-layer');
        if (!layer) return;

        layer.innerHTML = `
        <div id="modal-overlay" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center transition-opacity duration-300">
            <div class="glass-card w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] animate-slide-up overflow-hidden border-0 shadow-2xl">
                ${html}
            </div>
        </div>`;
        
        document.getElementById('modal-overlay').onclick = (e) => {
            if (e.target.id === 'modal-overlay') this.hideModal();
        };
    },

    hideModal() { 
        const layer = document.getElementById('modal-layer');
        if (layer) layer.innerHTML = ''; 
    },

    loader(show) { 
        const el = document.getElementById('loader');
        if (el) el.classList[show ? 'remove' : 'add']('hidden');
    },

    updateTimerDisplay(seconds) {
        const el = document.getElementById('quiz-timer');
        if (!el) return;
        const m = Math.floor(seconds / 60);
        const s = (seconds % 60).toString().padStart(2, '0');
        el.innerText = `${m}:${s}`;
        if (seconds < 60) el.classList.add('text-red-500');
    },

    _selectToggle(btn) {
        const parent = btn.parentElement;
        if (!parent) return;
        parent.querySelectorAll('button').forEach(b => {
            b.classList.remove('active'); // RESTORED ACTIVE FLAG
            b.className = b.className.replace('bg-slate-900 text-white dark:bg-white dark:text-slate-900', 'bg-slate-100 dark:bg-slate-800 text-slate-500');
        });
        btn.classList.add('active'); // RESTORED ACTIVE FLAG
        btn.className = b.className.replace('bg-slate-100 dark:bg-slate-800 text-slate-500', 'bg-slate-900 text-white dark:bg-white dark:text-slate-900');
    },

    // 8. ANALYSIS VIEW
    drawAnalysis(result) {
        const main = document.getElementById('main-view');
        if (!main) return;
        const accuracy = result.accuracy || 0;
        
        main.innerHTML = `
        <div class="space-y-8 pb-32 animate-view-enter">
            <div class="glass-card p-8 rounded-[40px] text-center bg-blue-50 dark:bg-blue-900/10">
                <p class="text-[10px] font-black text-blue-600 uppercase mb-3 tracking-widest">Total Score</p>
                <div class="text-7xl font-black text-blue-600 tracking-tighter">${result.score}</div>
                <div class="flex justify-center gap-8 mt-8">
                    <div>
                        <div class="text-3xl font-black text-emerald-500">${result.correct}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase mt-1">Correct</div>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-red-500">${result.wrong}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase mt-1">Wrong</div>
                    </div>
                </div>
                <div class="mt-6 text-lg font-black text-slate-700 dark:text-slate-200">
                    Accuracy: <span class="text-blue-600">${accuracy}%</span>
                </div>
            </div>

            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Question Review</h3>
            <div class="space-y-4">
                ${result.fullData.map((q, i) => {
                    const borderCol = q.isCorrect ? 'border-l-emerald-500' : 'border-l-red-500';
                    const bgCol = q.isCorrect ? 'bg-emerald-50/20 dark:bg-emerald-900/10' : 'bg-red-50/20 dark:bg-red-900/10';
                    const textCol = q.isCorrect ? 'text-emerald-500' : 'text-red-500';
                    const icon = q.isCorrect ? '✓' : '✗';

                    return `
                    <div class="glass-card p-5 rounded-[28px] ${borderCol} ${bgCol}">
                        <div class="flex items-start justify-between mb-3">
                            <span class="text-[10px] font-black text-slate-400 uppercase">Q${i + 1}</span>
                            <span class="text-lg font-black ${textCol}">${icon}</span>
                        </div>
                        <p class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">${q.text}</p>
                        <div class="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white/30 dark:bg-slate-800/30 p-3 rounded-lg">
                            <p class="font-bold mb-2">Explanation:</p>
                            ${q.explanation}
                        </div>
                    </div>`;
                }).join('')}
            </div>
            <div class="pb-20">
                <button onclick="Main.navigate('home')" class="w-full py-4 bg-blue-600 text-white rounded-3xl font-black tracking-widest uppercase">Return to Home</button>
            </div>
        </div>`;
    }
};

