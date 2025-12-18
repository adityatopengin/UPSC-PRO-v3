/**
 * ENGINE.JS - The Leogic Brain
 * Handles Timer, Randomization, and UPSC Marking Math.
 * * CRITICAL FIXES INCLUDED:
 * 1. Timer Logic Bug (Sequential Decrement)
 * 2. UPSC Scoring Math
 * 3. Null Safety Checks
 */
const Engine = {
    state: { activeQuiz: null, timer: null },

    /**
     * Initializes a new quiz session
     * @param {Object} config - { count, mode, paper }
     * @param {Array} questions - Normalized question array
     */
    startSession(config, questions) {
        // 1. Randomization: Shuffle and slice to requested count
        const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, config.count);
        
        // 2. Timer Calculation: GS (72s) vs CSAT (90s)
        const timePerQ = config.paper === 'csat' ? 90 : 72;
        
        // 3. Set Active State
        this.state.activeQuiz = {
            config: config,
            questions: shuffled,
            answers: {},        // Map of index -> selectedOptionIndex
            currentIdx: 0,
            timeLeft: config.count * timePerQ,
            startTime: Date.now()
        };

        // 4. Start Timer only in Test Mode
        if (config.mode === 'test') {
            this._runTimer();
        }
    },

    /**
     * Saves user answer for the current question
     */
    saveAnswer(optionIndex) {
        if (!this.state.activeQuiz) return;
        const q = this.state.activeQuiz;
        q.answers[q.currentIdx] = optionIndex;
    },

    /**
     * FIX #1: ROBUST TIMER LOGIC
     * Prevents race conditions and ensures accurate "Time's Up" event
     */
    _runTimer() {
        this._stopTimer(); // Clear any existing interval
        
        this.state.timer = setInterval(() => {
            const q = this.state.activeQuiz;
            
            // Safety check: Ensure a quiz is active before proceeding
            if (!q) {
                this._stopTimer();
                return;
            }
            
            // 1. Decrement FIRST
            q.timeLeft--;
            
            // 2. Update UI
            if (typeof UI !== 'undefined' && UI.updateTimerDisplay) {
                UI.updateTimerDisplay(q.timeLeft);
            }
            
            // 3. Check for Expiry
            if (q.timeLeft <= 0) {
                this._stopTimer();
                // Fire the event to finish the quiz
                window.dispatchEvent(new CustomEvent('timeUp'));
            }
        }, 1000);
    },

    _stopTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    },

    /**
     * Calculates Final Score using UPSC Logic
     */
    calculateFinal() {
        const q = this.state.activeQuiz;
        if (!q) return null;

        const isCsat = q.config.paper === 'csat';
        
        // UPSC Negative Marking Scheme
        // GS: +2 for correct, -0.666 for wrong (1/3rd penalty)
        // CSAT: +2.5 for correct, -0.833 for wrong
        const weights = isCsat ? { p: 2.5, n: 0.833 } : { p: 2.0, n: 0.666 };

        let correct = 0, wrong = 0, attempted = 0;
        
        // Map results to preserve original data + user answer
        const fullResults = q.questions.map((item, i) => {
            const userAns = q.answers[i];
            const isAttempted = userAns !== undefined;
            const isCorrect = isAttempted && (userAns === item.correct);
            
            if (isAttempted) {
                attempted++;
                if (isCorrect) correct++; else wrong++;
            }
            
            return { 
                ...item, 
                userAns, 
                isCorrect, 
                attempted: isAttempted 
            };
        });

        // Calculate Score (Fixed to 2 decimals)
        const rawScore = (correct * weights.p) - (wrong * weights.n);
        const score = Math.max(0, rawScore).toFixed(2); // Prevent negative total score display

        return {
            score,
            accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
            correct, 
            wrong, 
            total: q.questions.length, 
            fullData: fullResults,
            subject: q.config.subject // Useful for history tracking
        };
    }
};



