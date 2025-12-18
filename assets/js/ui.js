/**
 * UI.JS - THE ARCHITECT
 * Version: 2.2.0 (Ultra Glass & Color Fusion)
 * Implements iOS-like transparency and vibrant uniform design.
 */

const UI = {
    sanitize(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // 1. DYNAMIC HEADER (Ultra Transparent)
    renderHeader(view) {
        const header = document.getElementById('app-header');
        if (!header) return;
        
        // Floating positioning
        header.className = "fixed top-3 left-4 right-4 z-50 transition-all duration-300 pointer-events-none";

        // THE PILL: Increased transparency (bg-white/30) and Blur (2xl)
        const contentClass = "rounded-full p-2 pl-3 pr-3 flex items-center justify-between shadow-lg pointer-events-auto mx-auto max-w-md bg-white/30 dark:bg-slate-900/30 backdrop-blur-2xl border border-white/20 dark:border-white/10 ring-1 ring-black/5";

        if (view === 'home') {
            header.innerHTML = `
            <div class="${contentClass} animate-view-enter">
                <div class="flex items-center gap-3">
                    <div class="relative w-8 h-8">
                        <img src="assets/images/Omg.jpg" 
                             onerror="this.src='https://ui-avatars.com/api/?name=Asp&background=3b82f6&color=fff'"
                             class="w-full h-full rounded-full border border-white/50 object-cover" alt="Profile">
                    </div>
                    <div>
                        <h2 class="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none opacity-90">UPSC Pro</h2>
                    </div>
                </div>
                <button onclick="Main.navigate('settings')" class="w-8 h-8 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors active:scale-90"><i class="fa-solid fa-gear text-xs"></i></button>
            </div>`;
        } else {
            const title = view.charAt(0).toUpperCase() + view.slice(1);
            header.innerHTML = `
            <div class="${contentClass} animate-view-enter">
                <button onclick="Main.navigate('home')" class="w-8 h-8 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-90"><i class="fa-solid fa-arrow-left text-xs"></i></button>
                <h2 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest opacity-90">${title}</h2>
                <div class="w-8"></div>
            </div>`;
        }
    },

    // 2. FLOATING NAVIGATION (Ultra Transparent)
    renderFooter(activeView) {
        const nav = document.getElementById('app-nav');
        if (!nav) return;
        const buttons = [
            { id: 'home', icon: 'house', label: 'Home' },
            { id: 'notes', icon: 'book-open', label: 'Notes' },
            { id: 'stats', icon: 'chart-simple', label: 'Stats' }
        ];
        nav.className = "fixed bottom-8 left-0 right-0 z-50 pointer-events-none flex justify-center";
        
        // THE TAB BAR: High transparency (bg-white/30) + 2XL Blur
        nav.innerHTML = `
        <div id="app-nav-inner" class="pointer-events-auto px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl bg-white/30 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 mx-4 animate-view-enter ring-1 ring-black/5">
            ${buttons.map(btn => {
                const isActive = activeView === btn.id;
                return `<button onclick="Main.navigate('${btn.id}')" class="nav-btn relative flex flex-col items-center justify-center w-10 h-10 transition-all duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400 -translate-y-1' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"><i class="fa-solid fa-${btn.icon} text-xl transition-transform ${isActive ? 'scale-110 drop-shadow-md' : ''}"></i>${isActive ? '<div class="absolute -bottom-2 w-1 h-1 bg-current rounded-full shadow-glow"></div>' : ''}</button>`;
            }).join('')}
        </div>`;
        nav.classList.remove('hidden');
    },

    // 3. HOME VIEW
    drawHome(paper, subjects) {
        const main = document.getElementById('main-view');
        if (!main) return;
        const colorMap = {
            amber: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
            blue: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
            pink: 'text-pink-600 bg-pink-500/10 border-pink-500/20',
            cyan: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20',
            green: 'text-green-600 bg-green-500/10 border-green-500/20',
            emerald: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
            indigo: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
            purple: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
            slate: 'text-slate-600 bg-slate-500/10 border-slate-500/20'
        };
        main.innerHTML = `
        <div class="space-y-6 animate-view-enter">
            <div class="relative flex bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full p-1 mx-8 shadow-sm border border-white/20">
                <div class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/80 dark:bg-slate-600/80 rounded-full transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-sm backdrop-blur-sm" style="transform: translateX(${paper === 'gs1' ? '0' : '100%'})"></div>
                <button onclick="Main.togglePaper('gs1')" class="relative z-10 flex-1 py-2 text-[9px] font-black transition-colors ${paper === 'gs1' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}">GS PAPER I</button>
                <button onclick="Main.togglePaper('csat')" class="relative z-10 flex-1 py-2 text-[9px] font-black transition-colors ${paper === 'csat' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}">CSAT</button>
            </div>
            <div class="grid grid-cols-2 gap-3 pb-24">
                ${subjects.map(s => {
                    const colorStyles = colorMap[s.color] || colorMap.blue;
                    return `<button type="button" onclick="UI.modals.setup('${s.name}')" class="glass-card w-full p-4 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 transition-all cursor-pointer border ${colorStyles} group hover:bg-white/40 dark:hover:bg-black/40"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform ${colorStyles.split(' ').slice(0,1).join(' ')}"><i class="fa-solid fa-${s.icon}"></i></div><span class="text-[10px] font-black text-center uppercase leading-tight text-slate-700 dark:text-slate-200 tracking-tighter">${s.name}</span></button>`;
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
        <div class="pb-32 animate-view-enter">
            <div class="flex justify-between items-center mb-6 px-2">
                <div class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider border border-blue-500/20">Q ${quizState.currentIdx + 1} / ${quizState.questions.length}</div>
                <div id="quiz-timer" class="font-mono font-black text-sm tracking-widest text-slate-800 dark:text-white drop-shadow-sm">--:--</div>
            </div>
            <div class="glass-card p-6 rounded-[32px] mb-4 border border-white/40 dark:border-white/10">
                <div class="flex gap-2 mb-3">
                    <span class="px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[8px] font-bold uppercase backdrop-blur-sm">${currentQ.metadata.year}</span>
                    <span class="px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[8px] font-bold uppercase backdrop-blur-sm">${currentQ.metadata.difficulty}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug font-display tracking-tight">${this.sanitize(currentQ.text)}</h3>
            </div>
            <div class="space-y-3">
                ${currentQ.options.map((opt, i) => {
                    const isSelected = quizState.answers[quizState.currentIdx] === i;
                    const isCorrect = currentQ.correct === i;
                    let borderClass = "border-white/20 dark:border-white/10", bgClass = "bg-white/20 dark:bg-black/20", opacity = "opacity-100";
                    if (quizState.config.mode === 'learning' && hasAnswered) {
                        if (isCorrect) { borderClass = "border-emerald-500"; bgClass = "bg-emerald-500/20"; }
                        else if (isSelected) { borderClass = "border-red-500"; bgClass = "bg-red-500/20"; }
                        else opacity = "opacity-50";
                    } else if (isSelected) { borderClass = "border-blue-500"; bgClass = "bg-blue-500/20"; }
                    return `<button type="button" onclick="Main.handleOption(${i})" class="w-full text-left glass-card p-4 rounded-[24px] flex items-start gap-4 transition-all border ${borderClass} ${bgClass} ${opacity} active:scale-[0.98] hover:bg-white/30 dark:hover:bg-white/5"><div class="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 mt-0.5">${String.fromCharCode(65 + i)}</div><span class="text-[13px] font-medium leading-relaxed text-slate-800 dark:text-slate-200">${this.sanitize(opt)}</span></button>`;
                }).join('')}
            </div>
            ${quizState.config.mode === 'learning' && hasAnswered ? `<div class="mt-6 p-5 bg-blue-600/10 rounded-[28px] border border-blue-500/20 animate-view-enter backdrop-blur-md"><h4 class="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase mb-2 tracking-widest">Explanation</h4><p class="text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed">${this.sanitize(currentQ.explanation)}</p></div>` : ''}
        </div>
        <div class="fixed bottom-6 left-4 right-4 z-50 flex items-center gap-2">
            <button onclick="UI.modals.map()" class="w-12 h-12 glass-card rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-black/60 shadow-lg backdrop-blur-xl border border-white/30"><i class="fa-solid fa-grid-2"></i></button>
            <div class="flex-1 glass-card rounded-full p-1 flex bg-white/60 dark:bg-black/60 shadow-lg backdrop-blur-xl border border-white/30">
                <button onclick="Main.moveQ(-1)" class="flex-1 py-3 rounded-l-full text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><i class="fa-solid fa-chevron-left"></i></button>
                <div class="w-px bg-slate-300 dark:bg-slate-600 my-2"></div>
                <button onclick="Main.moveQ(1)" class="flex-1 py-3 rounded-r-full text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <button onclick="Main.finishQuiz()" class="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-90 transition-transform"><i class="fa-solid fa-check"></i></button>
        </div>`;
        this.updateTimerDisplay(quizState.timeLeft);
    },

    drawAnalysis(result) {
        const main = document.getElementById('main-view');
        if (!main || !result) return;
        main.innerHTML = `
        <div class="pb-32 animate-view-enter">
            <div class="glass-card p-8 rounded-[40px] text-center mb-6 bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
                <p class="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Score</p>
                <div class="text-6xl font-black text-blue-600 dark:text-blue-400 mb-2 tracking-tighter drop-shadow-sm">${result.score}</div>
                <div class="flex justify-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest"><span class="text-emerald-500">${result.correct} Correct</span><span class="text-red-500">${result.wrong} Wrong</span></div>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-8">
                 <button onclick="Main.navigate('home')" class="py-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest border border-white/20">Home</button>
                 <button onclick="Main.triggerStart('${result.subject}')" class="py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/30">Retry</button>
            </div>
            <h3 class="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 pl-2">Review</h3>
            <div class="space-y-3">
                ${result.fullData.map((q, i) => `<div class="glass-card p-4 rounded-[24px] border-l-4 ${q.isCorrect ? 'border-emerald-500' : (q.attempted ? 'border-red-500' : 'border-slate-300')} hover:bg-white/40"><div class="flex justify-between items-center mb-1"><span class="text-[9px] font-black text-slate-400 uppercase">Q${i + 1}</span><i class="fa-solid fa-${q.isCorrect ? 'check text-emerald-500' : 'xmark text-red-500'} text-xs"></i></div><p class="text-[12px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed">${this.sanitize(q.text)}</p></div>`).join('')}
            </div>
        </div>`;
    },

    drawNotes() {
        const main = document.getElementById('main-view');
        if (!main) return;
        main.innerHTML = `<div class="grid grid-cols-1 gap-3 pb-32 animate-view-enter">${CONFIG.notesLibrary.map(n => `<div class="glass-card p-0 rounded-[24px] overflow-hidden relative min-h-[80px] flex items-center cursor-pointer active:scale-95 transition-transform"><div class="absolute inset-0 bg-grad-${n.gradient} opacity-20 dark:opacity-30 mix-blend-overlay"></div><div class="relative z-10 p-5 flex items-center gap-4 w-full"><div class="w-10 h-10 rounded-xl bg-white/60 dark:bg-black/40 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/20"><i class="fa-solid fa-${n.icon} text-slate-700 dark:text-slate-200"></i></div><div><h3 class="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">${n.title}</h3><p class="text-[9px] font-bold text-slate-600 dark:text-slate-400">${n.subtitle}</p></div></div></div>`).join('')}</div>`;
    },

    _renderSettings(container) {
        container.innerHTML = `
        <div class="px-2 pt-4 space-y-4 animate-view-enter pb-32">
            <div class="glass-card p-5 rounded-[28px] flex items-center justify-between">
                <div><h3 class="text-xs font-black">Appearance</h3><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dark Mode</p></div>
                <button onclick="Main.toggleTheme()" class="w-10 h-6 bg-slate-200 dark:bg-blue-600 rounded-full relative transition-colors"><div class="w-4 h-4 bg-white rounded-full absolute top-1 left-1 dark:left-5 transition-all shadow-sm"></div></button>
            </div>
            <button onclick="UI.modals.orientation(false)" class="w-full glass-card p-5 rounded-[28px] flex items-center justify-between active:scale-95 transition-transform hover:bg-white/40">
                <div class="text-left"><h3 class="text-xs font-black">Orientation</h3><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Replay Audio</p></div>
                <div class="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><i class="fa-solid fa-info"></i></div>
            </button>
            <button onclick="UI.modals.about()" class="w-full glass-card p-5 rounded-[28px] flex items-center justify-between active:scale-95 transition-transform hover:bg-white/40">
                <div class="text-left"><h3 class="text-xs font-black">About</h3><p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Our Motive</p></div>
                <div class="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center"><i class="fa-solid fa-heart"></i></div>
            </button>
            <button onclick="Store.clearAll()" class="w-full glass-card p-5 rounded-[28px] flex items-center justify-between border-red-500/30 text-red-500 active:scale-95 transition-transform hover:bg-red-500/5">
                <div class="text-left"><h3 class="text-xs font-black">Reset App</h3><p class="text-[9px] font-bold opacity-60 uppercase tracking-widest">Clear Data</p></div>
                <i class="fa-solid fa-trash-can"></i>
            </button>
            <div class="text-center pt-8"><p class="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">v${CONFIG.version}</p></div>
        </div>`;
    },

    _renderStats(container) {
        const history = Store.get('history', []);
        container.innerHTML = `
        <div class="px-2 pb-32 space-y-6 animate-view-enter">
            <div class="glass-card p-8 rounded-[40px] text-center bg-blue-500/10 border border-blue-500/20"><p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">Total Quizzes</p><div class="text-5xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-sm">${history.length}</div></div>
            <h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">History</h3>
            <div class="space-y-3">
                ${history.length > 0 ? history.slice(0, 10).map(h => `<div class="glass-card p-4 rounded-3xl flex justify-between items-center transition-all active:scale-[0.98] hover:bg-white/40"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-xl bg-white/50 dark:bg-black/50 flex items-center justify-center text-blue-500 shadow-sm"><i class="fa-solid fa-graduation-cap text-xs"></i></div><div><h4 class="text-[11px] font-black">${h.subject}</h4><p class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">${new Date(h.savedAt).toLocaleDateString()}</p></div></div><div class="text-right"><div class="text-base font-black text-blue-600 dark:text-blue-400">${h.score}</div></div></div>`).join('') : '<div class="text-center py-10 text-slate-400 text-xs">No attempts yet.</div>'}
            </div>
        </div>`;
    },

    modals: {
        setup(subject) {
            UI.showModal(`
            <div class="p-6">
                <div class="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
                <h3 class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6">${subject}</h3>
                <div class="space-y-6">
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Count</label>
                        <div class="grid grid-cols-4 gap-2" id="q-counts">
                            ${[10, 20, 50, 100].map(n => `<button type="button" data-count="${n}" onclick="UI._selectToggle(this)" class="count-btn py-3 rounded-xl ${n === 10 ? 'active bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'} text-[10px] font-black transition-all">${n}</button>`).join('')}
                        </div>
                    </div>
                    <div>
                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Mode</label>
                        <div class="grid grid-cols-2 gap-3" id="q-modes">
                            <button type="button" data-mode="test" onclick="UI._selectToggle(this)" class="mode-btn py-4 rounded-2xl active bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black tracking-widest uppercase">Test Mode</button>
                            <button type="button" data-mode="learning" onclick="UI._selectToggle(this)" class="mode-btn py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black tracking-widest uppercase">Learn Mode</button>
                        </div>
                    </div>
                </div>
                <button type="button" onclick="Main.triggerStart('${subject}')" class="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-black tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all uppercase text-[10px]">Start Quiz</button>
            </div>`);
        },

        orientation(isFirstVisit = false) {
            const btnLabel = isFirstVisit ? "Begin Journey" : "Close";
            const btnAction = isFirstVisit ? "Main.completeOrientation()" : "UI.hideModal()";
            const btnClass = isFirstVisit ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300";

            UI.showModal(`
            <div class="p-8 text-center">
                <div class="w-20 h-20 bg-blue-600 text-white rounded-[32px] mx-auto flex items-center justify-center text-3xl mb-6 shadow-xl animate-pulse"><i class="fa-solid fa-microphone-lines"></i></div>
                <h2 class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter">Orientation</h2>
                <p class="text-[11px] text-slate-500 mb-8 leading-relaxed">System orientation for 2026 Batch.</p>
                <div class="flex items-center justify-center gap-6 mb-8">
                    <button id="play-btn" class="w-16 h-16 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-2xl shadow-lg flex items-center justify-center"><i class="fa-solid fa-play ml-1" id="play-icon"></i></button>
                    <audio id="welcome-audio" src="assets/audio/disclaimer.mp3"></audio>
                </div>
                <button onclick="${btnAction}" class="w-full py-4 rounded-full font-black uppercase text-[10px] tracking-widest ${btnClass}">${btnLabel}</button>
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
                <div class="w-16 h-16 bg-pink-500 text-white rounded-[24px] mx-auto flex items-center justify-center text-2xl mb-6 shadow-xl shadow-pink-500/30"><i class="fa-solid fa-heart"></i></div>
                <h2 class="text-xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter">Our Motive</h2>
                <div class="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 text-left">
                    <p><strong>UPSC Pro</strong> was built to democratize high-quality Civil Services preparation. We believe that technology can bridge the gap between aspiration and success.</p>
                    <p>Our goal is to provide a distraction-free, high-performance environment where serious aspirants can test their mettle without the clutter of traditional apps.</p>
                </div>
                <button onclick="UI.hideModal()" class="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Back to Settings</button>
            </div>`);
        },

        map() {
            const q = Engine.state.activeQuiz;
            if (!q) return;
            const grid = q.questions.map((_, i) => {
                const isCurrent = i === q.currentIdx;
                const isAnswered = q.answers[i] !== undefined;
                let btnClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
                if (isCurrent) btnClass = "bg-blue-600 text-white border-2 border-blue-600";
                else if (isAnswered) btnClass = "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
                return `<button onclick="Main.jumpToQ(${i})" class="w-10 h-10 rounded-lg text-[10px] font-black flex items-center justify-center transition-all active:scale-95 ${btnClass}">${i + 1}</button>`;
            }).join('');
            UI.showModal(`
            <div class="p-6">
                <div class="flex items-center justify-between mb-4"><h3 class="text-lg font-black text-slate-800 dark:text-white uppercase">Map</h3><div class="text-[10px] font-bold text-slate-400">${Object.keys(q.answers).length}/${q.questions.length} Done</div></div>
                <div class="grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto no-scrollbar pb-2">${grid}</div>
                <button onclick="UI.hideModal()" class="w-full mt-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase text-[10px]">Resume</button>
            </div>`);
        }
    },

    showModal(html) {
        const layer = document.getElementById('modal-layer');
        if (!layer) return;
        layer.innerHTML = `<div id="modal-overlay" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center transition-opacity duration-300"><div class="glass-card w-full max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] animate-view-enter overflow-hidden border border-white/20 shadow-2xl">${html}</div></div>`;
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
        parent.querySelectorAll('button').forEach(b => { b.classList.remove('active', 'bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900'); b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-500'); });
        btn.classList.add('active', 'bg-slate-900', 'text-white', 'dark:bg-white', 'dark:text-slate-900'); btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-500');
    }
};
window.UI = UI;



