import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";

// Connect to the backend
const socket = io("http://127.0.0.1:5000");

const CodeEditor = ({ code, setCode, language, onLanguageChange }) => {
    // Prevent infinite loops where an incoming change triggers an outgoing change
    const isLocalChange = useRef(true);

    useEffect(() => {
        // Join a default shared room for now
        socket.emit("join-room", "global-collab-room");

        // Listen for incoming code changes
        socket.on("receive-code-change", (newCode) => {
            isLocalChange.current = false;
            setCode(newCode);
        });

        return () => {
            socket.off("receive-code-change");
        };
    }, [setCode]);

    const handleEditorChange = (value) => {
        if (isLocalChange.current) {
            setCode(value);
            // Broadcast the change
            socket.emit("code-change", { roomId: "global-collab-room", code: value });
        }
        // Reset local change flag so next input works correctly
        isLocalChange.current = true;
    };

    return (
        <div className="flex-col w-full h-full" style={{ height: "100%", flex: 1 }}>
            <div className="flex justify-between items-center mb-2" style={{ padding: "0 10px" }}>
                <h3 className="text-primary font-semibold" style={{ margin: 0 }}>Code Editor</h3>
                <select
                    className="input-glass"
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    style={{ width: "150px", padding: "0.25rem 0.5rem", height: "auto", backgroundColor: "rgba(0,0,0,0.6)" }}
                >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                </select>
            </div>
            <div style={{ flex: 1, borderRadius: "8px", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
