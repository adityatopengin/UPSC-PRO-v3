/**
 * ENGINE.JS - The Logic Brain
 * Handles Timer, Randomization, and UPSC Marking Math.
 */
const Engine = {
    state: { activeQuiz: null, timer: null },

    startSession(config, questions) {
        // Shuffle and take required count
        const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, config.count);
        
        // UPSC Time: GS (72s) vs CSAT (90s)
        const timePerQ = config.paper === 'csat' ? 90 : 72;
        
        this.state.activeQuiz = {
            config: config,
            questions: shuffled,
            answers: {},
            currentIdx: 0,
            timeLeft: config.count * timePerQ,
            startTime: Date.now()
        };

        if (config.mode === 'test') this._runTimer();
    },

    _runTimer() {
        this._stopTimer();
        this.state.timer = setInterval(() => {
            const q = this.state.activeQuiz;
            if (!q || q.timeLeft <= 0) {
                this._stopTimer();
                if (q && q.timeLeft <= 0) window.dispatchEvent(new CustomEvent('timeUp'));
                return;
            }
            q.timeLeft--;
            UI.updateTimerDisplay(q.timeLeft);
        }, 1000);
    },

    _stopTimer() {
        if (this.state.timer) clearInterval(this.state.timer);
    },

    calculateFinal() {
        const q = this.state.activeQuiz;
        const isCsat = q.config.paper === 'csat';
        // Correct UPSC Negative Marking
        const weights = isCsat ? { p: 2.5, n: 0.833 } : { p: 2.0, n: 0.666 };

        let correct = 0, wrong = 0, attempted = 0;
        const fullResults = q.questions.map((item, i) => {
            const userAns = q.answers[i];
            const attempted = userAns !== undefined;
            const isCorrect = userAns === item.correct;
            
            if (attempted) {
                if (isCorrect) correct++; else wrong++;
            }
            return { ...item, userAns, isCorrect, attempted };
        });

        return {
            score: ((correct * weights.p) - (wrong * weights.n)).toFixed(2),
            accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
            correct, wrong, total: q.questions.length, fullData: fullResults
        };
    }
};

