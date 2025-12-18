/**
 * ENGINE.JS - The Logic Brain
 * Version: 1.1.0 (Production Ready)
 * Handles State, Drift-Proof Timer, and UPSC Scoring.
 */

const Engine = {
    state: {
        activeQuiz: null,
        timer: null
    },

    /**
     * Start a new quiz session
     * @param {Object} config - { count, mode, paper, subject }
     * @param {Array} questions - Normalized array from Adapter
     */
    startSession(config, questions) {
        // 1. Randomization: Shuffle and slice
        const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, config.count);
        
        // 2. Timing calculation using CONFIG defaults
        const secondsPerQ = config.paper === 'csat' ? CONFIG.defaults.timer.csat : CONFIG.defaults.timer.gs1;
        const totalDuration = config.count * secondsPerQ;

        // 3. Initialize Session State
        this.state.activeQuiz = {
            config: config,
            questions: shuffled,
            answers: {},        // Map of { questionIndex: selectedOptionIndex }
            currentIdx: 0,
            totalDuration: totalDuration,
            timeLeft: totalDuration,
            startTime: Date.now()
        };

        // 4. Start Timer only for Test Mode
        if (config.mode === 'test') {
            this._runTimer();
        }
    },

    /**
     * Save user's answer for the current question
     */
    saveAnswer(optionIndex) {
        if (!this.state.activeQuiz) return;
        this.state.activeQuiz.answers[this.state.activeQuiz.currentIdx] = optionIndex;
    },

    /**
     * DRIFT-PROOF TIMER
     * Instead of decrementing a variable, it calculates the delta from 
     * the start time. This ensures accuracy even if the browser tab 
     * goes to sleep or the CPU throttles.
     */
    _runTimer() {
        this._stopTimer();
        const quiz = this.state.activeQuiz;
        if (!quiz) return;

        // Reset start time to exactly now when the timer actually begins
        quiz.startTime = Date.now();

        this.state.timer = setInterval(() => {
            const q = this.state.activeQuiz;
            if (!q) {
                this._stopTimer();
                return;
            }

            // Calculate elapsed time precisely (in seconds)
            const elapsed = Math.floor((Date.now() - q.startTime) / 1000);
            q.timeLeft = Math.max(0, q.totalDuration - elapsed);

            // Update UI via global UI object
            if (typeof UI !== 'undefined' && UI.updateTimerDisplay) {
                UI.updateTimerDisplay(q.timeLeft);
            }

            // Termination condition
            if (q.timeLeft <= 0) {
                this._stopTimer();
                // Broadcast timeUp event for main.js to capture
                window.dispatchEvent(new CustomEvent('timeUp'));
            }
        }, 500); // Check twice a second for higher UI precision
    },

    /**
     * Stop the current timer interval
     */
    _stopTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    },

    /**
     * UPSC SCORING ENGINE
     * Implements precise negative marking based on the Paper Type.
     */
    calculateFinal() {
        const q = this.state.activeQuiz;
        if (!q) return null;

        const isCsat = q.config.paper === 'csat';
        const weights = isCsat ? CONFIG.defaults.scoring.csat : CONFIG.defaults.scoring.gs1;

        let stats = {
            correct: 0,
            wrong: 0,
            attempted: 0,
            skipped: 0
        };

        // Process results and maintain original data integrity
        const detailedResults = q.questions.map((item, i) => {
            const userAns = q.answers[i];
            const isAttempted = userAns !== undefined;
            const isCorrect = isAttempted && (userAns === item.correct);

            if (isAttempted) {
                stats.attempted++;
                if (isCorrect) stats.correct++; else stats.wrong++;
            } else {
                stats.skipped++;
            }

            return {
                ...item,
                userAns,
                isCorrect,
                attempted: isAttempted
            };
        });

        // UPSC Formula: (Correct * MarkingWeight) - (Wrong * PenaltyWeight)
        const rawScore = (stats.correct * weights.correct) - (stats.wrong * weights.wrong);
        
        return {
            score: parseFloat(Math.max(0, rawScore).toFixed(2)),
            accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
            correct: stats.correct,
            wrong: stats.wrong,
            skipped: stats.skipped,
            total: q.questions.length,
            subject: q.config.subject,
            paper: q.config.paper,
            fullData: detailedResults
        };
    }
};

// Ensure Engine is globally accessible
window.Engine = Engine;


