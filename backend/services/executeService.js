const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, '..', 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const getLanguageConfig = (language, filename) => {
    const configs = {
        python: {
            image: 'python:3.9-slim',
            filename: `${filename}.py`,
            runCommand: `python ${filename}.py`,
        },
        javascript: {
            image: 'node:18-alpine',
            filename: `${filename}.js`,
            runCommand: `node ${filename}.js`,
        },
        c: {
            image: 'gcc:latest',
            filename: `${filename}.c`,
            runCommand: `gcc ${filename}.c -o ${filename} && ./${filename}`,
        },
        cpp: {
            image: 'gcc:latest',
            filename: `${filename}.cpp`,
            runCommand: `g++ ${filename}.cpp -o ${filename} && ./${filename}`,
        },
        java: {
            image: 'openjdk:11-jdk-slim',
            filename: `Main.java`,
            runCommand: `javac Main.java && java Main`,
        },
    };
    return configs[language];
};

const executeCode = async (code, language, testCases = []) => {
    return new Promise(async (resolve, reject) => {
        const jobId = uuidv4();
        const config = getLanguageConfig(language, jobId);

        if (!config) {
            return reject({ error: "Unsupported language" });
        }

        const jobDir = path.join(TEMP_DIR, jobId);
        fs.mkdirSync(jobDir, { recursive: true });

        const filePath = path.join(jobDir, config.filename);
        fs.writeFileSync(filePath, code);

        const isWindows = process.platform === 'win32';

        let runCommand = config.runCommand;
        if (isWindows && language === 'python') {
            runCommand = `python "${filePath}"`;
        } else if (language === 'javascript') {
            runCommand = `node "${filePath}"`;
        } else if (isWindows && language === 'c') {
            runCommand = `gcc "${filePath}" -o "${path.join(jobDir, jobId)}.exe" && "${path.join(jobDir, jobId)}.exe"`;
        } else if (isWindows && language === 'cpp') {
            runCommand = `g++ "${filePath}" -o "${path.join(jobDir, jobId)}.exe" && "${path.join(jobDir, jobId)}.exe"`;
        } else if (isWindows && language === 'java') {
            runCommand = `cd "${jobDir}" && javac Main.java && java Main`;
        } else {
            runCommand = `cd "${jobDir}" && ${config.runCommand.replace(config.filename, `"${config.filename}"`)}`;
        }

        // Helper function to run a single command with input
        const runProcessAsync = (cmd, input = "") => {
            return new Promise((res, rej) => {
                const child = exec(cmd, { timeout: 10000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                    res({ error, stdout, stderr });
                });
                if (input) {
                    child.stdin.write(input);
                    child.stdin.end();
                }
            });
        };

        const sanitize = (text) => {
            if (!text) return "";
            let cleanText = String(text);
            const winPath = jobDir.replace(/\\/g, '\\\\');
            const unixPath = jobDir.replace(/\\/g, '/');
            cleanText = cleanText.replace(new RegExp(winPath, 'g'), '[Sandbox]');
            cleanText = cleanText.replace(new RegExp(unixPath, 'g'), '[Sandbox]');
            cleanText = cleanText.split('\n').filter(line => !line.includes('node:internal/modules')).join('\n');
            return cleanText.trim();
        };

        const mockMemoryMB = (Math.random() * 15 + 10).toFixed(2);
        const memoryUsage = `${mockMemoryMB} MB`;

        // If there are test cases, run them sequentially
        if (testCases && testCases.length > 0) {
            let passedCount = 0;
            const results = [];
            let overallError = null;
            let firstFailure = null;

            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                const input = tc.input || "";

                // Add a small delay between runs to prevent file locking issues
                if (i > 0) await new Promise(r => setTimeout(r, 100));

                const { error, stdout, stderr } = await runProcessAsync(runCommand, input);

                const cleanStdout = sanitize(stdout);
                const cleanStderr = sanitize(stderr || (error ? error.message : ""));

                if (error) {
                    overallError = error.killed ? "Execution Timeout (10 seconds limit exceeded)." : cleanStderr;
                    results.push({ passed: false, expected: tc.expectedOutput, actual: cleanStderr || cleanStdout, isHidden: tc.isHidden });
                    if (!firstFailure) firstFailure = overallError;
                    break; // stop on first runtime error
                }

                if (cleanStdout === tc.expectedOutput.trim()) {
                    passedCount++;
                    results.push({ passed: true, isHidden: tc.isHidden });
                } else {
                    results.push({ passed: false, expected: tc.expectedOutput, actual: cleanStdout, isHidden: tc.isHidden });
                    if (!firstFailure) firstFailure = `Failed test case ${i + 1}. Actual output did not match expected.`;
                }
            }

            fs.rm(jobDir, { recursive: true, force: true }, () => { });

            const isSuccess = passedCount === testCases.length;

            // Format output for UI
            let summaryOutput = `${passedCount}/${testCases.length} Test Cases Passed.\n`;
            if (firstFailure) summaryOutput += `\nError: ${firstFailure}`;

            resolve({
                output: summaryOutput,
                error: isSuccess ? null : (overallError || "Test Case Failure"),
                memory: memoryUsage,
                testResults: results,
                isSuccess
            });

        } else {
            // Standard execution with no test cases
            const { error, stdout, stderr } = await runProcessAsync(runCommand);
            fs.rm(jobDir, { recursive: true, force: true }, () => { });

            const cleanStdout = sanitize(stdout);
            const cleanStderr = sanitize(stderr || (error ? error.message : ""));

            if (error) {
                if (error.killed) {
                    resolve({ output: cleanStdout, error: "Execution Timeout (10 seconds limit exceeded).", memory: memoryUsage });
                } else {
                    resolve({ output: cleanStdout, error: cleanStderr, memory: memoryUsage });
                }
            } else {
                resolve({ output: cleanStdout, error: cleanStderr, memory: memoryUsage });
            }
        }
    });
};

module.exports = { executeCode };
