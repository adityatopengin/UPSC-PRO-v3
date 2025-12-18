/**
 * ADAPTER.JS - The Smart Translator
 * Normalizes rich UPSC JSON data into a standard App format.
 */
const Adapter = {
    normalize(rawData) {
        // Handle both single objects (Polity) and arrays (Ancient)
        let list = Array.isArray(rawData) ? rawData : (rawData.questions || [rawData]);

        return list.map((q, index) => ({
            id: q.id || `upsc_${Date.now()}_${index}`,
            // FIX: Prioritize 'question_text' from your JSON
            text: q.question_text || q.text || "Question content missing",
            options: Array.isArray(q.options) ? q.options : [],
            // FIX: Prioritize your 'correct_option_index'
            correct: this._extractCorrect(q),
            explanation: q.explanation || "No explanation provided.",
            
            // RICH CATEGORIZATION
            metadata: {
                year: q.year || (q.source ? q.source.year : 'N/A'),
                exam: q.source ? q.source.exam.replace(/_/g, ' ') : 'UPSC Prelims',
                difficulty: q.difficulty || 'Moderate',
                topic: q.topic || 'General Studies',
                subtopic: q.subtopic || '',
                tags: q.tags || [],
                concepts: q.linked_concepts || []
            },
            notes: q.notes || ""
        }));
    },

    _extractCorrect(q) {
        // FIX #5: SAFE PARSEINT
        // Try numeric index first
        if (q.correct_option_index !== undefined) {
            const parsed = parseInt(q.correct_option_index);
            if (!isNaN(parsed) && parsed >= 0) return parsed;
        }
        
        if (q.correct !== undefined) {
            const parsed = parseInt(q.correct);
            if (!isNaN(parsed) && parsed >= 0) return parsed;
        }
        
        // Fallback to Label (A=0, B=1, etc.)
        const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const label = String(q.correct_option_label || '').toUpperCase().trim();
        
        if (label in map) return map[label];
        
        console.warn(`[Adapter] Could not extract correct answer for question:`, q);
        return 0; // Default to first option if nothing works
    }
};


