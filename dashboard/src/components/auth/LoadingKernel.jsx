import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './LoadingKernel.css';

const steps = [
  { text: "Authenticating LaunchAxis Kernel...", icon: "fa-solid fa-lock" },
  { text: "Analyzing founder parameters...", icon: "fa-solid fa-server" },
  { text: "Synthesizing brand & typography...", icon: "fa-solid fa-wand-magic-sparkles" },
  { text: "Compiling dashboard architecture...", icon: "fa-solid fa-cubes" },
  { text: "Establishing secure database uplink...", icon: "fa-solid fa-network-wired" }
];

const LoadingKernel = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const terminalRef = useRef(null);

  useEffect(() => {
    let currentStep = 0;
    let isApiFinished = false;
    let timerId;

    const logNextStep = () => {
      if (isApiFinished) return;

      if (currentStep < steps.length) {
        setLogs(prev => [...prev.map(log => ({ ...log, active: false })), { ...steps[currentStep], active: true }]);
        setProgress(((currentStep + 1) / steps.length) * 90);
        
        currentStep++;
        timerId = setTimeout(logNextStep, Math.random() * 1000 + 1000);
      }
    };

    const executeLaunchAxisKernel = async () => {
      try {
        const rawData = localStorage.getItem("launchAxisTempData");
        if (!rawData) throw new Error("No startup data found.");
        const userData = JSON.parse(rawData);
        
        const systemPrompt = `You are a strict JSON data generator for a SaaS platform. Return ONLY valid JSON. Do not include markdown \`\`\` wrappers. 
        Format requirements:
        {
          "businessName": "Generate a modern brand name if user provided 'Auto-Generate', otherwise use their input",
          "tagline": "A punchy 5-word marketing slogan based on their description",
          "targetAudience": "Detailed 1-sentence demographic target",
          "colorPalette": {
            "primary": "#HexCode (match industry vibe)",
            "secondary": "#HexCode",
            "accent": "#HexCode"
          }
        }`;
        
        const promptText = `User Data -> Name: ${userData.businessName}. Description: ${userData.businessDesc}. Type: ${userData.businessType}. Founder Profile: ${userData.userType}. Generate the JSON structure.`;
        
        // Secure Vercel API Call
        const response = await fetch('/api/gemini', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: systemPrompt + "\n\n" + promptText })
        });

        if (!response.ok) throw new Error(`API rejected request: HTTP ${response.status}`);
        const apiData = await response.json();
        
        let rawText = apiData.text;
        rawText = rawText.replace(/```json|```/g, '').trim();
        const aiGenerated = JSON.parse(rawText);

        const finalDatabaseEntry = {
            email: userData.email,
            businessType: userData.businessType,
            userType: userData.userType,
            features: userData.features,
            aiArchitecture: {
                businessName: aiGenerated.businessName,
                tagline: aiGenerated.tagline,
                targetAudience: aiGenerated.targetAudience,
                colorPalette: aiGenerated.colorPalette,
                businessDesc: userData.businessDesc
            },
            createdAt: serverTimestamp()
        };

        await setDoc(doc(db, "users", userData.email), finalDatabaseEntry);

        isApiFinished = true;
        setProgress(100);
        
        setLogs(prev => [
          ...prev.map(log => ({ ...log, active: false })),
          { text: "Kernel Execution Complete. Redirecting...", icon: "fa-solid fa-check-double", active: true, success: true }
        ]);

        setTimeout(() => {
            navigate("/admin"); 
        }, 1500);

      } catch (error) {
        console.error("Kernel Failure:", error);
        alert("LaunchAxis Kernel encountered an error: " + error.message);
      }
    };

    timerId = setTimeout(logNextStep, 500);
    executeLaunchAxisKernel();

    return () => clearTimeout(timerId);
  }, [navigate]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="loading-wrapper">
      <div className="space-ambient-glow"></div>
      <div className="cosmic-dust-overlay"></div>

      <div className="loader-container">
        <div className="rocket-container">
          <svg width="100%" height="100%" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 10px 15px rgba(45, 212, 191, 0.3))' }}>
            <path d="M50 150 Q60 185 70 150 Z" fill="#2dd4bf" />
            <path d="M40 100 L10 140 L40 140 Z" fill="#94a3b8" />
            <path d="M80 100 L110 140 L80 140 Z" fill="#94a3b8" />
            <path d="M60 10 C30 50 40 150 40 150 L80 150 C80 150 90 50 60 10 Z" fill="#f8fafc" />
            <circle cx="60" cy="70" r="14" fill="#030712" stroke="#2dd4bf" strokeWidth="4" />
          </svg>
        </div>

        <h1>Architecting Workspace</h1>
        <p className="subtitle">Axis AI is building your infrastructure.</p>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="terminal-window" ref={terminalRef}>
          {logs.map((log, idx) => (
            <div key={idx} className={`log-line ${log.active ? 'active' : ''}`} style={log.success ? { color: '#2dd4bf' } : {}}>
              <i className={log.icon}></i> {log.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingKernel;