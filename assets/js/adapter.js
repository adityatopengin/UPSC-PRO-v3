/**
 * ADAPTER.JS - The Smart Translator
 * Normalizes rich UPSC JSON data into a standard App format.
 * * CRITICAL FIXES INCLUDED:
 * 1. Safe Integer Parsing (Prevents NaN)
 * 2. Robust Metadata Extraction
 * 3. Fallback for missing fields
 */

const Adapter = {
    /**
     * Main Normalization Function
     * Converts raw JSON (array or object) into App-standard format
     */
    normalize(rawData) {
        // 1. Handle both single objects and arrays
        // Some files might be wrapped in { questions: [...] } or just [...]
        let list = Array.isArray(rawData) ? rawData : (rawData.questions || [rawData]);

        return list.map((q, index) => ({
            // Generate a unique ID if missing
            id: q.id || `upsc_${Date.now()}_${index}`,
            
            // 2. Text Normalization: Prioritize specific keys
            text: q.question_text || q.text || "Question content missing",
            
            // 3. Options: Ensure it's an array
            options: Array.isArray(q.options) ? q.options : [],
            
            // 4. Correct Answer Extraction (Critical Logic)
            correct: this._extractCorrect(q),
            
            // 5. Explanation Fallback
            explanation: q.explanation || "No explanation provided for this question.",
            
            // 6. Metadata: Rich Categorization for Analysis
            metadata: {
                // Ensure year is a string to prevent UI errors
                year: String(q.year || (q.source ? q.source.year : 'N/A')),
                exam: q.source ? q.source.exam.replace(/_/g, ' ') : 'UPSC Prelims',
                difficulty: q.difficulty || 'Moderate',
                topic: q.topic || 'General Studies',
                subtopic: q.subtopic || '',
                tags: q.tags || [],
                concepts: q.linked_concepts || []
            },
            
            // 7. Extra Notes
            notes: q.notes || ""
        }));
    },

    /**
     * Helper: Extract Correct Index Safely
     * Handles 0-based index, string index ("0"), or Label ("A"/"B")
     */
    _extractCorrect(q) {
        // Priority 1: 'correct_option_index' (Numeric/String)
        if (q.correct_option_index !== undefined) {
            const parsed = parseInt(q.correct_option_index);
            // Safety Check: Is it a valid number?
            if (!isNaN(parsed) && parsed >= 0) return parsed;
        }
        
        // Priority 2: 'correct' (Common alternate key)
        if (q.correct !== undefined) {
            const parsed = parseInt(q.correct);
            if (!isNaN(parsed) && parsed >= 0) return parsed;
        }
        
        // Priority 3: Label Fallback (A, B, C, D)
        const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        const label = String(q.correct_option_label || '').toUpperCase().trim();
        
        if (label in map) return map[label];
        
        // Final Fallback: Log warning and default to 0 (First option)
        console.warn(`[Adapter] Could not extract correct answer for question ID: ${q.id || 'Unknown'}`);
        return 0; 
    }
};



