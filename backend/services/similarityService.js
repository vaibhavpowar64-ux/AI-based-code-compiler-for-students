const Submission = require('../models/Submission');

// Basic Levenshtein Distance implementation for string similarity
const getLevenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

// Remove comments and whitespace for more accurate structural comparison
const normalizeCode = (code, language) => {
    let normalized = code;

    if (language === 'python') {
        normalized = normalized.replace(/#.*$/gm, ''); // remove comments
    } else {
        normalized = normalized.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ''); // C/JS comments
    }

    // Remove whitespace and newlines
    return normalized.replace(/\s+/g, '');
};

const checkSimilarity = async (submissionId) => {
    try {
        const targetSubmission = await Submission.findById(submissionId).populate("user", "name email");
        if (!targetSubmission || !targetSubmission.challenge) {
            return { error: 'Submission not found or not linked to a challenge' };
        }

        // Find all other successful submissions for this challenge EXCLUDING current user
        const otherSubmissions = await Submission.find({
            challenge: targetSubmission.challenge,
            user: { $ne: targetSubmission.user._id },
            status: "Success"
        }).populate("user", "name email");

        if (otherSubmissions.length === 0) {
            return { message: "No other submissions to compare against.", matches: [] };
        }

        const targetNormalized = normalizeCode(targetSubmission.code, targetSubmission.language);
        let highlySimilar = [];

        for (const sub of otherSubmissions) {
            const subNormalized = normalizeCode(sub.code, sub.language);

            // Skip empty comparisons
            if (targetNormalized.length === 0 || subNormalized.length === 0) continue;

            const distance = getLevenshteinDistance(targetNormalized, subNormalized);
            const maxLength = Math.max(targetNormalized.length, subNormalized.length);
            const similarityPercentage = ((maxLength - distance) / maxLength) * 100;

            // Flag if similarity is > 85%
            if (similarityPercentage > 85) {
                highlySimilar.push({
                    userId: sub.user._id,
                    userName: sub.user.name,
                    userEmail: sub.user.email,
                    submissionId: sub._id,
                    similarityPercentage: similarityPercentage.toFixed(2),
                    codeSnippet: sub.code.substring(0, 100) + "..."
                });
            }
        }

        // Sort by highest similarity
        highlySimilar.sort((a, b) => b.similarityPercentage - a.similarityPercentage);

        return {
            targetId: targetSubmission._id,
            targetUser: targetSubmission.user.name,
            totalComparisons: otherSubmissions.length,
            matches: highlySimilar
        };

    } catch (error) {
        throw new Error('Similarity check failed: ' + error.message);
    }
};

module.exports = { checkSimilarity };
