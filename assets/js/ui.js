/**
 * UI.JS - THE ARCHITECT
 * Version: 1.2.0 (Secure & Accessible)
 * Handles all rendering, view transitions, and the "Fog" design system.
 */

const UI = {
    /**
     * SECURITY: Sanitize user content to prevent XSS
     */
    sanitize(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // 1. DYNAMIC HEADER
    renderHeader(view) {
        const header = document.getElementById('app-header');
        if (!header) return;

        if (view === 'home') {
            header.innerHTML = `
            <div class="flex items-center justify-between p-4 glass-card rounded-3xl mx-2 mt-4 animate-view-enter">
                <div class="flex items-center gap-3">
                    <div class="relative w-10 h-10">
                        <img src="assets/images/Omg.jpg" 
                             onerror="this.src='https://ui-avatars.com/api/?name=Aspirant&background=3b82f6&color=fff'"
                             class="w-full h-full rounded-full border-2 border-blue-500 object-cover shadow-sm"
                             alt="Profile">
                    </div>
                    <div>
                        <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Aspirant</h2>
                        <p class="text-[13px] font-bold text-slate-800 dark:text-white mt-0.5">Target 2026</p>
                    </div>
                </div>
                <button onclick="Main.navigate('settings')" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-colors" aria-label="Settings">
                    <i class="fa-solid fa-gear"></i>
                </button>
            </div>`;
        } else {
            const title = view.charAt(0).toUpperCase() + view.slice(1);
            header.innerHTML = `
            <div class="flex items-center p-4 mt-2 gap-4 animate-view-enter">
                <button onclick="Main.navigate('home')" class="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-500" aria-label="Back">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                <h2 class="text-xl font-black text-slate-800 dark:text-white capitalize tracking-tight">${title}</h2>
            </div>`;
        }
    },

    // 2. THE FOG FOOTER (Bottom Navigation)
    renderFooter(activeView) {
        const nav = document.getElementById('app-nav');
        if (!nav) return;

        const buttons = [
            { id: 'home', icon: 'house-chimney', label: 'Home' },
            { id: 'notes', icon: 'book-open', label: 'Notes' },
            { id: 'stats', icon: 'chart-pie', label: 'Stats' }
        ];

        nav.innerHTML = `
        <div id="app-nav-inner" class="flex justify-around items-end pb-8 pt-8 px-4 bg-gradient-to-t from-white/90 via-white/80 to-transparent dark:from-slate-900/90 dark:via-slate-900/80 backdrop-blur-xl border-t border-white/20 dark:border-white/5">
            ${buttons.map(btn => {
                const isActive = activeView === btn.id;
                return `
                <button onclick="Main.navigate('${btn.id}')" 
                        class="nav-btn ${isActive ? 'active text-blue-600 dark:text-blue-400' : 'inactive text-slate-400'} flex flex-col items-center gap-1 transition-all duration-300 transform ${isActive ? 'scale-110' : ''}">
                    <div class="relative">
                        <i class="fa-solid fa-${btn.icon} text-lg"></i>
                        ${isActive ? '<div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full"></div>' : ''}
                    </div>
                    <span class="text-[9px] font-black uppercase tracking-widest mt-1">${btn.label}</span>
                </button>`;
            }).join('')}
        </div>`;
        nav.classList.remove('hidden');
    },

    // 3. HOME VIEW
    drawHome(paper, subjects) {
        const main = document.getElementById('main-view');
        if (!main) return;

        const colorMap = {
            amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200/50',
            blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200/50',
            pink: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 border-pink-200/50',
            cyan: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200/50',
            green: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200/50',
            emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/50',
            indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200/50',
            purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200/50',
            slate: 'text-slate-600 bg-slate-50 dark:bg-slate-900/20 border-slate-200/50'
        };

        main.innerHTML = `
        <div class="space-y-8 pb-32 animate-view-enter">
            <!-- Paper Toggle -->
            <div class="relative flex bg-slate-200 dark:bg-slate-800 rounded-full p-1 mx-4 shadow-inner">
                <div class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-full transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-md" 
                     style="transform: translateX(${paper === 'gs1' ? '0' : '100%'})"></div>
                <button onclick="Main.togglePaper('gs1')" class="relative z-10 flex-1 py-2.5 text-[10px] font-black transition-colors ${paper === 'gs1' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}">GENERAL STUDIES</button>
                <button onclick="Main.togglePaper('csat')" class="relative z-10 flex-1 py-2.5 text-[10px] font-black transition-colors ${paper === 'csat' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}">CSAT PAPER</button>
            </div>

            <!-- Subject Grid - Now using BUTTONS for Accessibility -->
            <div class="grid grid-cols-2 gap-4">
                ${subjects.map(s => {
                    const colorStyles = colorMap[s.color] || colorMap.blue;
                    return `
                    <button type="button" 
                            onclick="UI.modals.setup('${s.name}')" 
                            class="glass-card w-full p-5 rounded-[32px] flex flex-col items-center gap-4 active:scale-95 transition-all cursor-pointer border-b-4 ${colorStyles} group">
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${colorStyles.split(' ').slice(0,1).join(' ')}">
                            <i class="fa-solid fa-${s.icon}"></i>
                        </div>
                        <span class="text-[11px] font-black text-center uppercase leading-tight text-slate-700 dark:text-slate-200 tracking-tighter">${s.name}</span>
                    </button>`;
                }).join('')}
            </div>
        </div>`;
    },

    // 4. QUIZ VIEW
    drawQuiz(quizState) {
        const main = document.getElementById('main-view');
        if (!main || !quizState) return;

        const currentQ = quizState.questions[quizState.currentIdx];
        if (!currentQ) return;

        const hasAnswered = quizState.answers[quizState.currentIdx] !== undefined;

        main.innerHTML = `
        <div class="pb-40 animate-view-enter">
            <!-- Header Progress -->
            <div class="flex justify-between items-center mb-8">
                <div class="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-black uppercase">
                    Question ${quizState.currentIdx + 1} / ${quizState.questions.length}
                </div>
                <div id="quiz-timer" class="font-mono font-black text-lg tracking-tighter text-slate-800 dark:text-white">--:--</div>
            </div>

            <!-- Metadata Chips -->
            <div class="flex gap-2 mb-4">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold uppercase">${currentQ.metadata.year}</span>
                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold uppercase">${currentQ.metadata.difficulty}</span>
            </div>

            <!-- Question Text - Sanitized -->
            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-10 leading-snug font-display">${this.sanitize(currentQ.text)}</h3>

            <!-- Options List - Accessible Buttons -->
            <div class="space-y-4">
                ${currentQ.options.map((opt, i) => {
                    const isSelected = quizState.answers[quizState.currentIdx] === i;
                    const isCorrect = currentQ.correct === i;
                    
                    let borderClass = "border-transparent";
                    let bgClass = "bg-white/50 dark:bg-slate-800/50";
                    let opacity = "opacity-100";

                    if (quizState.config.mode === 'learning' && hasAnswered) {
                        if (isCorrect) {
                            borderClass = "border-emerald-500";
                            bgClass = "bg-emerald-50 dark:bg-emerald-900/20";
                        } else if (isSelected) {
                            borderClass = "border-red-500";
                            bgClass = "bg-red-50 dark:bg-red-900/20";
                        } else {
                            opacity = "opacity-50";
                        }
                    } else if (isSelected) {
                        borderClass = "border-blue-500";
                        bgClass = "bg-blue-50 dark:bg-blue-900/20";
                    }

                    return `
                    <button type="button" 
                         onclick="Main.handleOption(${i})" 
                         class="w-full text-left glass-card p-5 rounded-[24px] flex items-start gap-4 transition-all border-2 ${borderClass} ${bgClass} ${opacity} cursor-pointer active:scale-[0.98]">
                        <div class="w-7 h-7 rounded-full border-2 border-slate-200 flex-shrink-0 flex items-center justify-center text-[11px] font-black text-slate-400 mt-0.5">
                            ${String.fromCharCode(65 + i)}
                        </div>
                        <span class="text-[15px] font-medium leading-relaxed">${this.sanitize(opt)}</span>
                    </button>`;
                }).join('')}
            </div>

            <!-- Explanation (Learn Mode Only) - Sanitized -->
            ${quizState.config.mode === 'learning' && hasAnswered ? `
            <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[32px] border border-blue-100 dark:border-blue-800 animate-view-enter">
                <h4 class="text-[10px] font-black text-blue-600 uppercase mb-3 tracking-widest">Logic & Explanation</h4>
                <p class="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">${this.sanitize(currentQ.explanation)}</p>
            </div>` : ''}
        </div>

        <!-- Quiz Footer Controls -->
        <div class="fixed bottom-0 left-0 right-0 p-4 glass-card rounded-t-[40px] shadow-2xl z-50 flex items-center gap-3 max-w-md mx-auto border-t-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg">
            <button onclick="UI.modals.map()" class="w-14 h-14 glass-card rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-500" aria-label="Question Map">
                <i class="fa-solid fa-grip-vertical"></i>
            </button>
            <div class="flex-1 flex gap-3">
                <button onclick="Main.moveQ(-1)" class="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-600">Prev</button>
                <button onclick="Main.moveQ(1)" class="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg">Next</button>
            </div>
            <button onclick="Main.finishQuiz()" class="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-all" aria-label="Submit Quiz">
                <i class="fa-solid fa-check text-xl"></i>
            </button>
        </div>`;

        // Immediately update timer display if current
        this.updateTimerDisplay(quizState.timeLeft);
    },

    // 5. MODALS SYSTEM
    modals: {
        setup(subject) {
            UI.showModal(`
            <div class="p-8">
                <div class="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
                <h3 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8">${subject}</h3>
                
                <div class="space-y-8">
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Question Count</label>
                        <div class="grid grid-cols-4 gap-2" id="q-counts">
                            ${[10, 20, 50, 100].map(n => `
                                <button type="button" 
                                    data-count="${n}" 
                                    onclick="UI._selectToggle(this)" 
                                    class="count-btn py-4 rounded-2xl ${n === 10 ? 'active bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'} text-xs font-black transition-all">
                                    ${n}
                                </button>`).join('')}
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Quiz Protocol</label>
                        <div class="grid grid-cols-2 gap-3" id="q-modes">
                            <button type="button" 
                                data-mode="test"
                                onclick="UI._selectToggle(this)" 
                                class="mode-btn py-5 rounded-3xl active bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-black tracking-widest uppercase">
                                Test Mode
                            </button>
                            <button type="button" 
                                data-mode="learning"
                                onclick="UI._selectToggle(this)" 
                                class="mode-btn py-5 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-black tracking-widest uppercase">
                                Learn Mode
                            </button>
                        </div>
                    </div>
                </div>
                <button type="button"
                    onclick="Main.triggerStart('${subject}')" 
                    class="w-full mt-10 py-5 bg-blue-600 text-white rounded-3xl font-black tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase">
                    Initialize Quiz
                </button>
            </div>`);
        },

        orientation() {
            UI.showModal(`
            <div class="p-10 text-center">
                <div class="w-24 h-24 bg-blue-600 text-white rounded-[40px] mx-auto flex items-center justify-center text-4xl mb-8 shadow-2xl animate-pulse">
                    <i class="fa-solid fa-microphone-lines"></i>
                </div>
                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tighter">Orientation</h2>
                <p class="text-[13px] text-slate-500 mb-10 leading-relaxed">System orientation for the 2026 Batch by Pradeep Tripathi.</p>
                
                <div class="flex items-center justify-center gap-8 mb-10">
                    <button id="play-btn" class="w-20 h-20 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-3xl shadow-xl flex items-center justify-center" aria-label="Play Orientation">
                        <i class="fa-solid fa-play ml-1" id="play-icon"></i>
                    </button>
                    <audio id="welcome-audio" src="assets/audio/disclaimer.mp3"></audio>
                </div>

                <button onclick="Main.completeOrientation()" class="w-full py-5 bg-blue-600 text-white rounded-full font-black uppercase text-[11px] tracking-widest">Begin Journey</button>
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
        }
    },

    // 6. UTILITY FUNCTIONS
    showModal(html) {
        const layer = document.getElementById('modal-layer');
        if (!layer) return;

        layer.innerHTML = `
        <div id="modal-overlay" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center transition-opacity duration-300">
            <div class="glass-card w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] animate-view-enter overflow-hidden border-0 shadow-2xl">
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
        
        // Visual warning for last minute
        if (seconds < 60) {
            el.classList.add('text-red-500');
            el.classList.remove('text-slate-800', 'dark:text-white');
        } else {
            el.classList.remove('text-red-500');
            el.classList.add('text-slate-800', 'dark:text-white');
        }
    },

    _selectToggle(btn) {
        const parent = btn.parentElement;
        if (!parent) return;
        
        // Deselect siblings
        parent.querySelectorAll('button').forEach(b => {
            b.classList.remove('active', 'bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
            b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-500');
        });

        // Select clicked
        btn.classList.add('active', 'bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900');
        btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-500');
    }
};

// Expose to window
window.UI = UI;

