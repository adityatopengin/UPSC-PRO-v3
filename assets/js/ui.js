/**
 * UI.JS - THE ARCHITECT
 * Version: 2.3.0 (Premium Volumetric 3D)
 * Restores depth, texture, and tactile feel to the interface.
 */

const UI = {
    sanitize(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // 1. DYNAMIC HEADER (Solid 3D Pill)
    renderHeader(view) {
        const header = document.getElementById('app-header');
        if (!header) return;
        
        header.className = "fixed top-4 left-4 right-4 z-50 pointer-events-none";

        // Using .premium-nav class for that thick ceramic look
        const contentClass = "premium-nav rounded-full p-2 pl-3 pr-3 flex items-center justify-between pointer-events-auto mx-auto max-w-md";

        if (view === 'home') {
            header.innerHTML = `
            <div class="${contentClass} animate-view-enter">
                <div class="flex items-center gap-3">
                    <div class="relative w-9 h-9">
                        <img src="assets/images/Omg.jpg" 
                             onerror="this.src='https://ui-avatars.com/api/?name=Asp&background=3b82f6&color=fff'"
                             class="w-full h-full rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover" alt="Profile">
                    </div>
                    <div>
                        <h2 class="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none drop-shadow-sm">UPSC Pro</h2>
                    </div>
                </div>
                <button onclick="Main.navigate('settings')" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors active:scale-95 shadow-inner"><i class="fa-solid fa-gear text-sm"></i></button>
            </div>`;
        } else {
            const title = view.charAt(0).toUpperCase() + view.slice(1);
            header.innerHTML = `
            <div class="${contentClass} animate-view-enter">
                <button onclick="Main.navigate('home')" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 shadow-inner"><i class="fa-solid fa-arrow-left text-sm"></i></button>
                <h2 class="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest drop-shadow-sm">${title}</h2>
                <div class="w-9"></div>
            </div>`;
        }
    },

    // 2. FLOATING NAVIGATION (Solid 3D Bar)
    renderFooter(activeView) {
        const nav = document.getElementById('app-nav');
        if (!nav) return;
        const buttons = [
            { id: 'home', icon: 'house', label: 'Home' },
            { id: 'notes', icon: 'book-open', label: 'Notes' },
            { id: 'stats', icon: 'chart-simple', label: 'Stats' }
        ];
        nav.className = "fixed bottom-8 left-0 right-0 z-50 pointer-events-none flex justify-center";
        
        nav.innerHTML = `
        <div id="app-nav-inner" class="pointer-events-auto premium-nav px-8 py-3 rounded-full flex items-center gap-8 mx-4 animate-view-enter">
            ${buttons.map(btn => {
                const isActive = activeView === btn.id;
                // Active state has a 'lifted' glow
                const activeClass = isActive ? 'text-blue-600 dark:text-blue-400 -translate-y-2' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600';
                return `
                <button onclick="Main.navigate('${btn.id}')" 
                        class="nav-btn relative flex flex-col items-center justify-center w-10 h-10 transition-all duration-300 ${activeClass}">
                    <i class="fa-solid fa-${btn.icon} text-xl ${isActive ? 'drop-shadow-lg' : ''}"></i>
                    ${isActive ? '<div class="absolute -bottom-3 w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>' : ''}
                </button>`;
            }).join('')}
        </div>`;
        nav.classList.remove('hidden');
    },

    // 3. HOME VIEW (Volumetric Cards)
    drawHome(paper, subjects) {
        const main = document.getElementById('main-view');
        if (!main) return;
        
        // Gradient styles that simulate a colored light source from top-left
        const colorMap = {
            amber: 'from-amber-50 to-white dark:from-amber-900/30 dark:to-slate-800 border-b-4 border-amber-500/50',
            blue: 'from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-800 border-b-4 border-blue-500/50',
            pink: 'from-pink-50 to-white dark:from-pink-900/30 dark:to-slate-800 border-b-4 border-pink-500/50',
            cyan: 'from-cyan-50 to-white dark:from-cyan-900/30 dark:to-slate-800 border-b-4 border-cyan-500/50',
            green: 'from-green-50 to-white dark:from-green-900/30 dark:to-slate-800 border-b-4 border-green-500/50',
            emerald: 'from-emerald-50 to-white dark:from-emerald-900/30 dark:to-slate-800 border-b-4 border-emerald-500/50',
            indigo: 'from-indigo-50 to-white dark:from-indigo-900/30 dark:to-slate-800 border-b-4 border-indigo-500/50',
            purple: 'from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-800 border-b-4 border-purple-500/50',
            slate: 'from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b-4 border-slate-500/50'
        };

        main.innerHTML = `
        <div class="space-y-6 animate-view-enter">
            <!-- 3D Toggle Switch -->
            <div class="relative flex bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full p-1.5 mx-6 shadow-inner border border-white/10">
                <div class="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-700 rounded-full transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) shadow-[0_2px_5px_rgba(0,0,0,0.1)]" 
                     style="transform: translateX(${paper === 'gs1' ? '0' : '100%'})"></div>
                <button onclick="Main.togglePaper('gs1')" class="relative z-10 flex-1 py-2.5 text-[10px] font-black transition-colors ${paper === 'gs1' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}">GS PAPER I</button>
                <button onclick="Main.togglePaper('csat')" class="relative z-10 flex-1 py-2.5 text-[10px] font-black transition-colors ${paper === 'csat' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}">CSAT</button>
            </div>

            <!-- Volumetric Grid -->
            <div class="grid grid-cols-2 gap-4 pb-24">
                ${subjects.map(s => {
                    const gradientClass = colorMap[s.color] || colorMap.blue;
                    // Icon color extraction
                    const iconColor = s.color === 'slate' ? 'text-slate-600' : `text-${s.color}-500`;
                    
                    return `
                    <button type="button" 
                            onclick="UI.modals.setup('${s.name}')" 
                            class="premium-card bg-gradient-to-br ${gradientClass} w-full p-5 rounded-[24px] flex flex-col items-center gap-3 transition-transform cursor-pointer group">
                        <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/50 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform ${iconColor}">
                            <i class="fa-solid fa-${s.icon}"></i>
                        </div>
                        <span class="text-[10px] font-black text-center uppercase leading-tight text-slate-700 dark:text-slate-200 tracking-tighter opacity-90">${s.name}</span>
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
        <div class="pb-36 animate-view-enter">
            <!-- Meta Bar -->
            <div class="flex justify-between items-center mb-6 px-1">
                <div class="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[9px] font-black uppercase tracking-wider shadow-sm">
                    Q ${quizState.currentIdx + 1} / ${quizState.questions.length}
                </div>
                <div id="quiz-timer" class="premium-nav px-3 py-1 rounded-lg font-mono font-black text-sm tracking-widest text-slate-800 dark:text-white border-0">--:--</div>
            </div>

            <!-- Question Card (Thick) -->
            <div class="premium-card p-6 rounded-[32px] mb-5">
                <div class="flex gap-2 mb-3 opacity-80">
                    <span class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[8px] font-bold uppercase">${currentQ.metadata.year}</span>
                    <span class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[8px] font-bold uppercase">${currentQ.metadata.difficulty}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug font-display">${this.sanitize(currentQ.text)}</h3>
            </div>

            <!-- Options -->
            <div class="space-y-3">
                ${currentQ.options.map((opt, i) => {
                    const isSelected = quizState.answers[quizState.currentIdx] === i;
                    const isCorrect = currentQ.correct === i;
                    
                    // Default State: White/Dark Card
                    let bgClass = "bg-white dark:bg-slate-800";
                    let borderClass = "border-transparent";
                    let textClass = "text-slate-700 dark:text-slate-300";
                    let iconClass = "border-slate-300 text-slate-400";

                    if (quizState.config.mode === 'learning' && hasAnswered) {
                        if (isCorrect) { 
                            bgClass = "bg-emerald-50 dark:bg-emerald-900/30"; 
                            borderClass = "border-emerald-500"; 
                            iconClass = "bg-emerald-500 border-emerald-500 text-white";
                        } else if (isSelected) { 
                            bgClass = "bg-red-50 dark:bg-red-900/30"; 
                            borderClass = "border-red-500";
                            iconClass = "bg-red-500 border-red-500 text-white";
                        } else {
                            bgClass = "opacity-60 grayscale";
                        }
                    } else if (isSelected) {
                        bgClass = "bg-blue-50 dark:bg-blue-900/30";
                        borderClass = "border-blue-500";
                        iconClass = "bg-blue-500 border-blue-500 text-white";
                        textClass = "text-blue-900 dark:text-blue-100";
                    }

                    return `
                    <button type="button" 
                         onclick="Main.handleOption(${i})" 
                         class="premium-card w-full text-left p-4 rounded-[20px] flex items-start gap-4 transition-all ${bgClass} border-2 ${borderClass} group">
                        <div class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-black transition-colors ${iconClass} mt-0.5">
                            ${String.fromCharCode(65 + i)}
                        </div>
                        <span class="text-[13px] font-medium leading-relaxed ${textClass}">${this.sanitize(opt)}</span>
                    </button>`;
                }).join('')}
            </div>

            <!-- Explanation Box -->
            ${quizState.config.mode === 'learning' && hasAnswered ? `
            <div class="mt-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[28px] border-l-4 border-indigo-500 shadow-md animate-view-enter">
                <h4 class="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <i class="fa-solid fa-lightbulb"></i> Explanation
                </h4>
                <p class="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">${this.sanitize(currentQ.explanation)}</p>
            </div>` : ''}
        </div>

        <!-- Floating Action Bar -->
        <div class="fixed bottom-6 left-4 right-4 z-50 flex items-center gap-3">
            <button onclick="UI.modals.map()" class="w-14 h-14 premium-nav rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"><i class="fa-solid fa-table-cells text-lg"></i></button>
            <div class="flex-1 premium-nav rounded-2xl p-1 flex items-center">
                <button onclick="Main.moveQ(-1)" class="flex-1 py-3 rounded-l-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><i class="fa-solid fa-chevron-left"></i></button>
                <div class="w-[2px] h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <button onclick="Main.moveQ(1)" class="flex-1 py-3 rounded-r-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <button onclick="Main.finishQuiz()" class="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform"><i class="fa-solid fa-check text-xl"></i></button>
        </div>`;
        this.updateTimerDisplay(quizState.timeLeft);
    },

    drawAnalysis(result) {
        const main = document.getElementById('main-view');
        if (!main || !result) return;

        main.innerHTML = `
        <div class="pb-32 animate-view-enter">
            <!-- Hero Score Card -->
            <div class="premium-card p-8 rounded-[40px] text-center mb-6 bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Assessment Score</p>
                <div class="text-6xl font-black text-blue-600 dark:text-blue-400 mb-4 tracking-tighter drop-shadow-md">${result.score}</div>
                <div class="flex justify-center gap-6">
                     <div class="text-center">
                        <div class="text-emerald-500 font-black text-xl">${result.correct}</div>
                        <div class="text-[8px] font-bold text-slate-400 uppercase">Correct</div>
                     </div>
                     <div class="text-center">
                        <div class="text-red-500 font-black text-xl">${result.wrong}</div>
                        <div class="text-[8px] font-bold text-slate-400 uppercase">Wrong</div>
                     </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-2 gap-4 mb-8">
                 <button onclick="Main.navigate('home')" class="premium-card py-4 rounded-2xl text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest active:scale-95">Home</button>
                 <button onclick="Main.triggerStart('${result.subject}')" class="py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/30 active:scale-95">Retry Quiz</button>
            </div>

            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pl-2">Detailed Review</h3>
            <div class="space-y-4">
                ${result.fullData.map((q, i) => `
                    <div class="premium-card p-5 rounded-[24px] border-l-4 ${q.isCorrect ? 'border-emerald-500' : (q.attempted ? 'border-red-500' : 'border-slate-300')}">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-[10px] font-black text-slate-400 uppercase">Q${i + 1}</span>
                            <i class="fa-solid fa-${q.isCorrect ? 'check text-emerald-500' : 'xmark text-red-500'} text-sm"></i>
                        </div>
                        <p class="text-[13px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed">${this.sanitize(q.text)}</p>
                    </div>`).join('')}
            </div>
        </div>`;
    },

    drawNotes() {
        const main = document.getElementById('main-view');
        if (!main) return;
        main.innerHTML = `
        <div class="grid grid-cols-1 gap-4 pb-32 animate-view-enter">
            ${CONFIG.notesLibrary.map(n => `
            <div class="premium-card p-0 rounded-[28px] overflow-hidden relative min-h-[90px] flex items-center cursor-pointer group active:scale-95 transition-transform">
                <div class="absolute inset-0 bg-grad-${n.gradient} opacity-10 dark:opacity-20 transition-opacity group-hover:opacity-20"></div>
                
                <div class="relative z-10 p-6 flex items-center gap-5 w-full">
                    <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-white/50">
                        <i class="fa-solid fa-${n.icon} text-slate-700 dark:text-slate-200 text-lg"></i>
                    </div>
                    <div>
                        <h3 class="text-[14px] font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">${n.title}</h3>
                        <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400">${n.subtitle}</p>
                    </div>
                    <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                        <i class="fa-solid fa-chevron-right text-slate-400"></i>
                    </div>
                </div>
            </div>`).join('')}
        </div>`;
    },

    _renderSettings(container) {
        container.innerHTML = `
        <div class="px-2 pt-4 space-y-5 animate-view-enter pb-32">
            <div class="premium-card p-5 rounded-[28px] flex items-center justify-between">
                <div><h3 class="text-xs font-black">Appearance</h3><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dark Mode</p></div>
                <button onclick="Main.toggleTheme()" class="w-12 h-7 bg-slate-200 dark:bg-blue-600 rounded-full relative transition-colors shadow-inner"><div class="w-5 h-5 bg-white rounded-full absolute top-1 left-1 dark:left-6 transition-all shadow-md"></div></button>
            </div>
            
            <button onclick="UI.modals.orientation(false)" class="w-full premium-card p-5 rounded-[28px] flex items-center justify-between active:scale-95 transition-transform group">
                <div class="text-left"><h3 class="text-xs font-black">Orientation</h3><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Replay Audio</p></div>
                <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><i class="fa-solid fa-info"></i></div>
            </button>
            
            <button onclick="UI.modals.about()" class="w-full premium-card p-5 rounded-[28px] flex items-center justify-between active:scale-95 transition-transform group">
                <div class="text-left"><h3 class="text-xs font-black">About</h3><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Our Motive</p></div>
                <div class="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform"><i class="fa-solid fa-heart"></i></div>
            </button>

            <button onclick="Store.clearAll()" class="w-full premium-card p-5 rounded-[28px] flex items-center justify-between border-red-100 dark:border-red-900/30 text-red-500 active:scale-95 transition-transform group">
                <div class="text-left"><h3 class="text-xs font-black">Reset App</h3><p class="text-[9px] font-bold opacity-60 uppercase tracking-widest">Clear Data</p></div>
                <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center group-hover:rotate-12 transition-transform"><i class="fa-solid fa-trash-can"></i></div>
            </button>
            
            <div class="text-center pt-8"><p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">v${CONFIG.version} &bull; Pro Edition</p></div>
        </div>`;
    },

    _renderStats(container) {
        const history = Store.get('history', []);
        container.innerHTML = `
        <div class="px-2 pb-32 space-y-6 animate-view-enter">
            <div class="premium-card p-10 rounded-[48px] text-center bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
                <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3">Total Quizzes Attempted</p>
                <div class="text-7xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-sm">${history.length}</div>
            </div>
            
            <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-3">Recent Activity</h3>
            <div class="space-y-4">
                ${history.length > 0 ? history.slice(0, 10).map(h => `
                    <div class="premium-card p-5 rounded-3xl flex justify-between items-center transition-all active:scale-[0.98]">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-blue-500 shadow-inner">
                                <i class="fa-solid fa-graduation-cap text-sm"></i>
                            </div>
                            <div>
                                <h4 class="text-[12px] font-black">${h.subject}</h4>
                                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">${new Date(h.savedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-black text-blue-600 dark:text-blue-400">${h.score}</div>
                            <div class="text-[8px] font-bold text-slate-300 uppercase">Points</div>
                        </div>
                    </div>`).join('') : '<div class="text-center py-12 text-slate-400 text-xs italic">Start your journey today.</div>'}
            </div>
        </div>`;
    },

    modals: {
        setup(subject) {
            UI.showModal(`
            <div class="p-8">
                <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
                <h3 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-8 text-center">${subject}</h3>
                
                <div class="space-y-8">
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Question Count</label>
                        <div class="grid grid-cols-4 gap-3" id="q-counts">
                            ${[10, 20, 50, 100].map(n => `<button type="button" data-count="${n}" onclick="UI._selectToggle(this)" class="count-btn py-4 rounded-2xl ${n === 10 ? 'active bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} text-xs font-black transition-all">${n}</button>`).join('')}
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Mode</label>
                        <div class="grid grid-cols-2 gap-4" id="q-modes">
                            <button type="button" data-mode="test" onclick="UI._selectToggle(this)" class="mode-btn py-5 rounded-2xl active bg-slate-900 text-white shadow-lg text-[11px] font-black tracking-widest uppercase">Test Mode</button>
                            <button type="button" data-mode="learning" onclick="UI._selectToggle(this)" class="mode-btn py-5 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 text-[11px] font-black tracking-widest uppercase">Learn Mode</button>
                        </div>
                    </div>
                </div>
                <button type="button" onclick="Main.triggerStart('${subject}')" class="w-full mt-10 py-5 bg-blue-600 text-white rounded-3xl font-black tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase">Start Quiz</button>
            </div>`);
        },

        orientation(isFirstVisit = false) {
            const btnLabel = isFirstVisit ? "Begin Journey" : "Close";
            const btnAction = isFirstVisit ? "Main.completeOrientation()" : "UI.hideModal()";
            UI.showModal(`
            <div class="p-10 text-center">
                <div class="w-24 h-24 bg-blue-600 text-white rounded-[40px] mx-auto flex items-center justify-center text-4xl mb-8 shadow-2xl animate-pulse"><i class="fa-solid fa-microphone-lines"></i></div>
                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tighter">Orientation</h2>
                <p class="text-[12px] text-slate-500 mb-10 leading-relaxed">System orientation for 2026 Batch.</p>
                <div class="flex items-center justify-center gap-8 mb-10">
                    <button id="play-btn" class="w-20 h-20 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-3xl shadow-xl flex items-center justify-center hover:scale-105 transition-transform"><i class="fa-solid fa-play ml-1" id="play-icon"></i></button>
                    <audio id="welcome-audio" src="assets/audio/disclaimer.mp3"></audio>
                </div>
                <button onclick="${btnAction}" class="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-colors">${btnLabel}</button>
            </div>`);
            
            const audio = document.getElementById('welcome-audio');
            const btn = document.getElementById('play-btn');
            const icon = document.getElementById('play-icon');
            if (btn && audio) {
                btn.onclick = () => { if (audio.paused) { audio.play(); icon.className = 'fa-solid fa-pause'; } else { audio.pause(); icon.className = 'fa-solid fa-play ml-1'; } };
            }
        },

        about() {
            UI.showModal(`
            <div class="p-8 text-center">
                <div class="w-20 h-20 bg-pink-500 text-white rounded-[32px] mx-auto flex items-center justify-center text-3xl mb-6 shadow-2xl shadow-pink-500/30"><i class="fa-solid fa-heart"></i></div>
                <h2 class="text-xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter">Our Motive</h2>
                <div class="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 text-left">
                    <p><strong>UPSC Pro</strong> was built to democratize high-quality Civil Services preparation. We believe that technology can bridge the gap between aspiration and success.</p>
                </div>
                <button onclick="UI.hideModal()" class="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Back</button>
            </div>`);
        },

        map() {
            const q = Engine.state.activeQuiz;
            if (!q) return;
            const grid = q.questions.map((_, i) => {
                const isCurrent = i === q.currentIdx;
                const isAnswered = q.answers[i] !== undefined;
                let btnClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
                if (isCurrent) btnClass = "bg-blue-600 text-white shadow-lg shadow-blue-500/30";
                else if (isAnswered) btnClass = "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
                return `<button onclick="Main.jumpToQ(${i})" class="w-12 h-12 rounded-2xl text-[12px] font-black flex items-center justify-center transition-all active:scale-95 ${btnClass}">${i + 1}</button>`;
            }).join('');
            UI.showModal(`
            <div class="p-6">
                <div class="flex items-center justify-between mb-6"><h3 class="text-xl font-black text-slate-800 dark:text-white uppercase">Map</h3><div class="text-[11px] font-bold text-slate-400">${Object.keys(q.answers).length}/${q.questions.length} Done</div></div>
                <div class="grid grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar pb-2">${grid}</div>
                <button onclick="UI.hideModal()" class="w-full mt-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px]">Resume</button>
            </div>`);
        }
    },

    showModal(html) {
        const layer = document.getElementById('modal-layer');
        if (!layer) return;
        layer.innerHTML = `<div id="modal-overlay" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center transition-opacity duration-300"><div class="premium-card w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] animate-view-enter overflow-hidden shadow-2xl">${html}</div></div>`;
        document.getElementById('modal-overlay').onclick = (e) => { if (e.target.id === 'modal-overlay') this.hideModal(); };
    },
    hideModal() { const layer = document.getElementById('modal-layer'); if (layer) layer.innerHTML = ''; },
    loader(show) { const el = document.getElementById('loader'); if (el) el.classList[show ? 'remove' : 'add']('hidden'); },
    updateTimerDisplay(seconds) {
        const el = document.getElementById('quiz-timer');
        if (!el) return;
        const m = Math.floor(seconds / 60);
        const s = (seconds % 60).toString().padStart(2, '0');
        el.innerText = `${m}:${s}`;
        if (seconds < 60) { el.classList.add('text-red-500'); el.classList.remove('text-slate-800', 'dark:text-white'); } 
        else { el.classList.remove('text-red-500'); el.classList.add('text-slate-800', 'dark:text-white'); }
    },
    _selectToggle(btn) {
        const parent = btn.parentElement;
        if (!parent) return;
        parent.querySelectorAll('button').forEach(b => { b.classList.remove('active', 'bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900'); b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-500'); b.classList.remove('shadow-lg'); });
        btn.classList.add('active', 'bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900', 'shadow-lg'); btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-500');
    }
};
window.UI = UI;



