/**
 * ADAPTER.JS - The Smart Translator
 * Normalizes rich UPSC JSON data into a standard App format.
 */
const Adapter = {
    normalize(rawData) {
        // 1. Handle both single objects and arrays
        let list = Array.isArray(rawData) ? rawData : (rawData.questions || [rawData]);

        return list.map((q, index) => ({
            id: q.id || `upsc_${Date.now()}_${index}`,
            // 2. Prioritize 'question_text' from your JSON
            text: q.question_text || q.text || "Question content missing",
            options: Array.isArray(q.options) ? q.options : [],
            // 3. Ensure correct index is an integer for Engine.js math
            correct: this._extractCorrect(q),
            explanation: q.explanation || "No explanation provided.",
            
            metadata: {
                // 4. Force year to String to prevent rendering errors in UI.js
                year: String(q.year || (q.source ? q.source.year : 'N/A')),
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
        // Explicitly parse as Int to ensure Engine.js can compare userAns === item.correct
        if (q.correct_option_index !== undefined) return parseInt(q.correct_option_index);
        if (q.correct !== undefined) return parseInt(q.correct);
        
        // 5. Fallback to Label (A=0, B=1, etc.)
        const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const label = String(q.correct_option_label || '').toUpperCase();
        return map[label] !== undefined ? map[label] : 0;
    }
};

