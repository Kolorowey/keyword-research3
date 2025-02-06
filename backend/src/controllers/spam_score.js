// Custom Spam Score Algorithm

const blacklist = ["free money", "click here", "100% guarantee", "buy now", "make money fast"];
const stopWords = ["and", "the", "is", "in", "at", "of", "on", "for", "to", "with"];

function calculateSpamScore(keyword) {
    let score = 0;

    // 1. Keyword Length
    const wordCount = keyword.trim().split(/\s+/).length;
    if (wordCount < 2 || wordCount > 5) {
        score += 10;
    }

    // 2. Repetitive Words
    const words = keyword.toLowerCase().split(/\s+/);
    const wordFrequency = {};
    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    for (let word in wordFrequency) {
        if (wordFrequency[word] > 2) {
            score += 10;
            break;
        }
    }

    // 3. Special Characters
    const specialCharCount = (keyword.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > 3) {
        score += 15;
    }

    // 4. Stop Words Density
    const stopWordsCount = words.filter(word => stopWords.includes(word)).length;
    if (stopWordsCount / wordCount > 0.4) {
        score += 5;
    }

    // 5. Unnatural Capitalization
    if (keyword.match(/[A-Z]{2,}/)) {
        score += 5;
    }

    // 6. Blacklist Terms
    blacklist.forEach(term => {
        if (keyword.toLowerCase().includes(term)) {
            score += 20;
        }
    });

    return Math.min(score, 100); // Limit score to 100
}

// Example Usage
console.log(calculateSpamScore("Buy Buy Buy Cheap Laptop!!!")); // Spammy
console.log(calculateSpamScore("iphone"));   // Clean
