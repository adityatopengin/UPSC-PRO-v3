/**
 * ADAPTER.JS - The Smart Translator
 * Version: 1.1.0 (Production Ready)
 * Normalizes varied UPSC JSON formats into a strict Internal Schema.
 */

const Adapter = {
    /**
     * Main Entry: Converts raw JSON into a standardized Array
     */
    normalize(rawData) {
        if (!rawData) return [];

        // Handle various JSON wrapper formats (direct array vs {questions: []})
        let list = Array.isArray(rawData) ? rawData : (rawData.questions || [rawData]);

        return list.map((q, index) => {
            try {
                return {
                    // 1. Identification
                    id: q.id || `q_${Date.now()}_${index}`,
                    
                    // 2. Content (Prioritize UPSC-standard keys)
                    text: (q.question_text || q.text || "Question content missing").trim(),
                    
                    // 3. Options (Ensure valid array)
                    options: Array.isArray(q.options) ? q.options.map(opt => String(opt).trim()) : [],
                    
                    // 4. Correct Answer (Smart Extraction)
                    correct: this._extractCorrect(q),
                    
                    // 5. Educational Content
                    explanation: q.explanation || "No detailed explanation available for this question.",
                    
                    // 6. Metadata (Structured for Filtering/Analysis)
                    metadata: {
                        year: String(q.year || (q.source ? q.source.year : 'N/A')),
                        difficulty: q.difficulty || 'Moderate',
                        topic: q.topic || 'General Studies',
                        subtopic: q.subtopic || '',
                        tags: Array.isArray(q.tags) ? q.tags : [],
                        concepts: Array.isArray(q.linked_concepts) ? q.linked_concepts : []
                    }
                };
            } catch (err) {
                console.error("Adapter: Failed to normalize individual question:", q, err);
                return null;
            }
        }).filter(item => item !== null); // Remove any failed objects
    },

    /**
     * Helper: Safely determines the correct option index (0-3)
     */
    _extractCorrect(q) {
        // Priority 1: Numeric Index (0-based)
        if (q.correct_option_index !== undefined && q.correct_option_index !== null) {
            const idx = parseInt(q.correct_option_index);
            if (!isNaN(idx) && idx >= 0) return idx;
        }

        // Priority 2: Generic 'correct' key (common in standard formats)
        if (q.correct !== undefined && q.correct !== null) {
            const idx = parseInt(q.correct);
            if (!isNaN(idx) && idx >= 0) return idx;
        }

        // Priority 3: Label Translation (A -> 0, B -> 1, etc.)
        const labelMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const label = String(q.correct_option_label || q.answer || '').toUpperCase().trim();
        
        if (labelMap[label] !== undefined) {
            return labelMap[label];
        }

        // Final Fallback: Log warning for bad data and default to 0
        console.warn(`Adapter: Correct answer unresolvable for ID ${q.id}. Defaulting to index 0.`);
        return 0;
    }
};

// Ensure Adapter is globally accessible
window.Adapter = Adapter;


