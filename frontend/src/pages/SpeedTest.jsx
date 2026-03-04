import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/api';
import { Play, RotateCcw, Award, Zap } from 'lucide-react';

const CODE_SNIPPETS = [
    {
        language: 'javascript',
        code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`
    },
    {
        language: 'python',
        code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`
    },
    {
        language: 'java',
        code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}`
    }
];

const SpeedTest = () => {
    const { user } = useContext(AuthContext);
    const [snippet, setSnippet] = useState(CODE_SNIPPETS[0]);
    const [userInput, setUserInput] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const inputRef = useRef(null);

    // Pick a random snippet
    const generateNewTest = () => {
        const randomSnippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
        setSnippet(randomSnippet);
        setUserInput('');
        setIsActive(false);
        setIsFinished(false);
        setWpm(0);
        setAccuracy(100);
        setStartTime(null);
        if (inputRef.current) inputRef.current.focus();
    };

    useEffect(() => {
        generateNewTest();
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;

        // Start timer on first keystroke
        if (!isActive && !isFinished && val.length > 0) {
            setIsActive(true);
            setStartTime(Date.now());
        }

        // Only allow typing up to the length of the string
        if (val.length <= snippet.code.length) {
            setUserInput(val);
        }

        // Calculate accuracy
        let correctChars = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] === snippet.code[i]) correctChars++;
        }
        const currentAcc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
        setAccuracy(currentAcc);

        // End test if length matches
        if (val.length === snippet.code.length) {
            setIsActive(false);
            setIsFinished(true);
            const timeElapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60; // in minutes
            const words = snippet.code.length / 5; // standard WPM calculation
            const finalWpm = Math.round(words / Math.max(timeElapsed, 0.01));
            setWpm(finalWpm);

            // Save to backend if successful
            if (currentAcc > 80 && user) {
                saveStats(finalWpm, currentAcc, snippet.language);
            }
        }
    };

    const saveStats = async (finalWpm, finalAcc, lang) => {
        try {
            await API.post('/users/wpm', { wpm: finalWpm, accuracy: finalAcc, language: lang });
        } catch (err) {
            console.error("Failed to save WPM stat");
        }
    };

    // Render characters with different colors based on correctness
    const renderText = () => {
        return snippet.code.split('').map((char, index) => {
            let color = 'text-gray-500'; // unreached
            if (index < userInput.length) {
                color = userInput[index] === char ? 'text-green-400' : 'text-red-500 bg-red-900 bg-opacity-30';
            }
            return <span key={index} className={color}>{char}</span>;
        });
    };

    return (
        <div className="flex-col min-h-screen p-8 animate-fade-in" style={{ overflowY: "auto", maxWidth: "1000px", margin: "0 auto" }}>
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold text-white flex items-center justify-center gap-3 mb-2">
                    <Zap size={40} className="text-yellow-400" /> Coding Speed Test
                </h2>
                <p className="text-muted text-lg">Test your syntax typing speed and accuracy.</p>
            </div>

            <div className="glass-panel p-8 mb-8 border border-gray-800 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
                    <div className="flex gap-4">
                        <div className="bg-black bg-opacity-40 px-4 py-2 rounded-lg border border-gray-800">
                            <span className="text-muted text-sm uppercase tracking-wider block mb-1">Language</span>
                            <span className="text-blue-400 font-bold capitalize">{snippet.language}</span>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-right">
                            <span className="text-muted text-sm uppercase tracking-wider block mb-1">WPM</span>
                            <span className="text-3xl font-mono text-white font-bold">{wpm || '--'}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-muted text-sm uppercase tracking-wider block mb-1">Accuracy</span>
                            <span className="text-3xl font-mono text-white font-bold">{accuracy}%</span>
                        </div>
                    </div>
                </div>

                {/* Text Display */}
                <div
                    className="font-mono text-xl leading-relaxed tracking-wide p-6 bg-black bg-opacity-60 rounded-xl whitespace-pre-wrap relative overflow-hidden ring-1 ring-gray-800"
                    style={{ minHeight: "200px" }}
                >
                    {renderText()}

                    {/* Hidden Input Layer */}
                    <textarea
                        ref={inputRef}
                        value={userInput}
                        onChange={handleChange}
                        disabled={isFinished}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none"
                        spellCheck="false"
                        autoFocus
                    />
                </div>

                {/* Start / Restart Overlay */}
                {!isActive && !isFinished && userInput.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-primary px-6 py-3 rounded-full text-white font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse">
                            <Play size={20} fill="currentColor" /> Start Typing
                        </div>
                    </div>
                )}

                {isFinished && (
                    <div className="mt-8 flex flex-col items-center justify-center p-6 bg-green-900 bg-opacity-20 border border-green-500 rounded-xl animate-fade-in">
                        <Award size={48} className="text-yellow-400 mb-4 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        <h3 className="text-2xl font-bold text-white mb-2">Test Complete!</h3>
                        <p className="text-green-400 mb-6">You type {snippet.language} at {wpm} WPM with {accuracy}% accuracy.</p>
                        <button onClick={generateNewTest} className="btn-primary py-2 px-6 flex items-center gap-2">
                            <RotateCcw size={18} /> Try Another Snippet
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SpeedTest;
