/**
 * Analyzes code and compiler/runtime errors (if any) using the local fallback analyzer since the AI API was removed.
 * @param {string} code - The source code.
 * @param {string} language - The programming language used.
 * @param {string} error - The raw error output from the execution environment (optional).
 * @returns {Promise<Object|null>}
 */
const analyzeCode = async (code, language, error = null) => {
    const errorStr = String(error);
    return basicFallbackAnalyzer(errorStr);
};

/**
 * Basic fallback analyzer if the AI model fails or isn't configured
 */
const basicFallbackAnalyzer = (cleanError) => {
    const lines = cleanError.split('\n').filter(l => l.trim().length > 0);
    const lastLine = lines[lines.length - 1] || "Unknown Execution Error";

    // Attempt basic line number extraction
    const lineMatch = cleanError.match(/line (\d+)/i) || cleanError.match(/:(\d+):/);
    const line = lineMatch ? lineMatch[1] : "Unknown";

    const isError = cleanError && cleanError !== "null" && cleanError !== "";

    return {
        explanation: isError ? `Terminal Error: ${lastLine}` : "Code executed successfully.",
        suggestedAction: isError ? "Please review your syntax and logic carefully. The execution engine crashed." : "None.",
        line: line,
        timeComplexity: "Unknown (Offline Mode)",
        spaceComplexity: "Unknown (Offline Mode)",
        optimizationSuggestion: "Unable to analyze optimization.",
        securityVulnerabilities: "Unable to analyze security.",
        edgeCases: "Unable to predict edge cases.",
        alternativeApproach: "Unable to suggest alternatives.",
        codeQualityScore: isError ? 0 : 5
    };
};

module.exports = { analyzeCode, analyzeError: analyzeCode };
