import { MARKET_CONFIG } from '../config/markets.js';
import { eventExists } from '../database/marketStore.js';

/**
 * Event Validator Service
 * Validates events before market creation
 */
export function validateEvent(event) {
    const errors = [];
    const warnings = [];

    // Check required fields
    for (const field of MARKET_CONFIG.validation.requiredFields) {
        if (!event[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate question
    if (event.question) {
        const questionLength = event.question.length;

        if (questionLength < MARKET_CONFIG.validation.minQuestionLength) {
            errors.push(`Question too short (min ${MARKET_CONFIG.validation.minQuestionLength} chars)`);
        }

        if (questionLength > MARKET_CONFIG.validation.maxQuestionLength) {
            errors.push(`Question too long (max ${MARKET_CONFIG.validation.maxQuestionLength} chars)`);
        }

        // Check for ambiguous keywords
        const questionLower = event.question.toLowerCase();
        for (const keyword of MARKET_CONFIG.validation.ambiguousKeywords) {
            if (questionLower.includes(keyword)) {
                warnings.push(`Question contains ambiguous keyword: "${keyword}"`);
            }
        }

        // Check if it's a yes/no question
        if (!isYesNoQuestion(event.question)) {
            warnings.push('Question may not be a clear yes/no question');
        }
    }

    // Validate closeTime
    if (event.closeTime) {
        const now = Math.floor(Date.now() / 1000);
        const timeToClose = event.closeTime - now;

        if (timeToClose < MARKET_CONFIG.minTimeToClose) {
            errors.push(`Close time too soon (min ${MARKET_CONFIG.minTimeToClose / 3600} hours)`);
        }

        if (timeToClose > MARKET_CONFIG.maxTimeToClose) {
            errors.push(`Close time too far (max ${MARKET_CONFIG.maxTimeToClose / (24 * 3600)} days)`);
        }
    }

    // Check for duplicate events
    if (event.eventId && eventExists(event.eventId)) {
        errors.push('Event already exists in database');
    }

    // Validate source URL
    if (event.sourceUrl && !isValidUrl(event.sourceUrl)) {
        warnings.push('Invalid source URL format');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate multiple events
 */
export function validateEvents(events) {
    const results = [];

    for (const event of events) {
        const validation = validateEvent(event);
        results.push({
            event,
            ...validation,
        });
    }

    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.length - validCount;

    console.log(`\n✅ Validation complete: ${validCount} valid, ${invalidCount} invalid`);

    return results;
}

/**
 * Filter to only valid events
 */
export function getValidEvents(validationResults) {
    return validationResults
        .filter(r => r.valid)
        .map(r => r.event);
}

/**
 * Check if question is a yes/no question
 */
function isYesNoQuestion(question) {
    const questionLower = question.toLowerCase().trim();

    // Starts with "will", "is", "does", "can", "should", etc.
    const yesNoStarters = ['will', 'is', 'does', 'can', 'should', 'has', 'did', 'was', 'were'];

    for (const starter of yesNoStarters) {
        if (questionLower.startsWith(starter + ' ')) {
            return true;
        }
    }

    // Ends with question mark
    if (!questionLower.endsWith('?')) {
        return false;
    }

    return true;
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Log validation results
 */
export function logValidationResults(results) {
    console.log('\n📋 Validation Results:\n');

    for (const result of results) {
        if (result.valid) {
            console.log(`✅ ${result.event.question}`);
            if (result.warnings.length > 0) {
                result.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
            }
        } else {
            console.log(`❌ ${result.event.question}`);
            result.errors.forEach(e => console.log(`   ❌ ${e}`));
        }
    }
}
