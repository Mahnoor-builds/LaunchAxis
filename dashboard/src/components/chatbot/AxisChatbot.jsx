import React, { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { doc, getDoc } from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { db, auth } from "../../firebaseConfig";

import "./AxisChatbot.css";

const MAX_MESSAGES_PER_SESSION = 20;

const MESSAGE_COOLDOWN_MS = 3000;

const AxisChatbot = () => {
  const navigate = useNavigate();

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([]);

  const [isTyping, setIsTyping] = useState(false);

  const [statusLabel, setStatusLabel] = useState(
    "LaunchAxis Neural Core Online",
  );

  const [currentUserContext, setCurrentUserContext] = useState(null);

  const [activeUserKey, setActiveUserKey] = useState("guest");

  const chatBoxRef = useRef(null);

  const getStorageKey = (key) => `axisChatHistory_${key}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let welcomeMessage = "";

      let currentKey = "guest";

      if (user) {
        currentKey = user.uid || user.email;

        setActiveUserKey(currentKey);

        try {
          let userDocRef = doc(db, "users", user.uid);

          let snap = await getDoc(userDocRef);

          if (!snap.exists() && user.email) {
            userDocRef = doc(db, "users", user.email);

            snap = await getDoc(userDocRef);
          }

          if (snap.exists()) {
            const data = snap.data();

            setCurrentUserContext(data);

            const bName =
              data.aiArchitecture?.businessName ||
              data.businessName ||
              "Your Startup";

            setStatusLabel(`Connected: ${bName}`);

            welcomeMessage = `Welcome back. I am <b>Axis</b>, your LaunchAxis AI Co-Founder. I have your operational architecture for <b>${bName}</b> synchronized. Where do you need tactical assistance in your dashboard or business today?`;
          } else {
            setStatusLabel("Founder Connected");

            welcomeMessage =
              "Welcome. I am <b>Axis</b>, your AI Co-Founder. Your workspace is active. Ask me anything about configuring your store, managing your Omni-Ledger, or branding.";
          }
        } catch (err) {
          console.warn("Firestore sync error:", err);

          setStatusLabel("Founder Connected");

          welcomeMessage =
            "System online. I am <b>Axis</b>. How can I assist your business operations today?";
        }
      } else {
        const rawTemp =
          localStorage.getItem("launchAxisTempData") ||
          localStorage.getItem("pendingLaunchAxisData");

        if (rawTemp) {
          try {
            const parsedData = JSON.parse(rawTemp);

            setCurrentUserContext(parsedData);

            currentKey = parsedData.email || "onboarding_user";

            setActiveUserKey(currentKey);

            const bName =
              parsedData.businessName &&
              parsedData.businessName !== "Auto-Generate"
                ? parsedData.businessName
                : "Your New Venture";

            setStatusLabel(`Onboarding: ${bName}`);

            welcomeMessage = `Hello. I am <b>Axis</b>. I see you are setting up <b>${bName}</b>. Need advice on completing the form, selecting your business model, or structuring your product description? Ask below.`;
          } catch (e) {
            currentKey = "guest";

            setActiveUserKey(currentKey);
          }
        } else {
          currentKey = "guest";

          setActiveUserKey(currentKey);

          setStatusLabel("Platform Guest Mode");

          welcomeMessage =
            "System Online. I am <b>Axis</b>, the LaunchAxis AI Co-Founder. If you are new, ask me how to fill out the <b>Start Building</b> form, how our automated <b>Omni-Ledger</b> works, or how to launch an e-commerce storefront in minutes.";
        }
      }

      const savedHistory = localStorage.getItem(getStorageKey(currentKey));

      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      } else {
        const initialMessage = { sender: "AI", text: welcomeMessage };

        setMessages([initialMessage]);

        localStorage.setItem(
          getStorageKey(currentKey),
          JSON.stringify([initialMessage]),
        );
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleClearChat = (e) => {
    e.preventDefault();

    if (
      window.confirm(
        "Are you sure you want to clear your chat memory with Axis?",
      )
    ) {
      localStorage.removeItem(getStorageKey(activeUserKey));

      window.location.reload();
    }
  };

  const handleExit = (e) => {
    e.preventDefault();

    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/admin");
    }
  };

  const fetchGeminiResponse = async (prompt) => {
    let systemPrompt = `You are Axis, the executive AI Co-Founder embedded natively inside LaunchAxis.

Your persona: Highly intelligent, deeply practical, direct, and supportive. You speak in simple, clear English without corporate jargon.



STRICT FORMATTING AND RESPONSE RULES:

1. NEVER use any emojis under any circumstance.

2. ALWAYS use Markdown bolding (**text**) for every UI button, section, tab, field, and important metric.

3. WHEN GIVING STEP-BY-STEP INSTRUCTIONS ON HOW TO SOLVE A PROBLEM OR USE THE DASHBOARD, YOU MUST USE NUMBERED LISTS (1., 2., 3.). Never use thick paragraphs for instructions. Keep steps short, punchy, and sequential.

4. Keep answers brief, actionable, and straight to the point.



LAUNCHAXIS PLATFORM ARCHITECTURE & DASHBOARD KNOWLEDGE:

- **Navigation Sidebar**: Left panel with tabs: **Dashboard**, **Finance**, **Branding**, **Website**, **Products**, **Orders**, **Projects**, **Leads**, and **Settings**.

- **Onboarding Form (/start-building)**:

- If a user is new or asks how to set up: Guide them to fill the **Business Name** (or leave blank for AI generation), provide an **Admin Email**, write a clear **Product or Service Description** explaining the target audience, choose **Offering Type** (Physical/Digital Products vs Service/Agency), select their **Founder Profile**, and check the modules they want (**Brand Identity Kit**, **Website / Storefront**, **Finance Ledger**). Click **Initialize Kernel Sequence**.

- **Omni-Ledger / Finance Section (FinancePro)**:

- Includes a currency switcher (**PKR Rs**, **USD $**, **EUR €**) and 4 tabs:

1. **Overview**: Record transactions and invoices. Options include **Sales Invoice** (customer owes you), **Payment Received** (cash in), **Purchase Bill** (you owe supplier), and **Payment Sent** (cash out). Select Target Account, Category (**Website Sales**, **Inventory Purchase**, **Payroll**, **Shipping**, **Marketing**, **Capital**, **General**), enter amount, and click **Record Transaction**. Shows real-time **Audit Trail**.

2. **Directory**: Client & CRM ledger. Add or edit entities (Customer, Supplier, Employee, Bank) with Name, Phone, Address. Shows **Accounts Payable & Receivable** with live status (**Customer Owes You**, **You Owe Supplier**, **Settled**, **Available Funds**).

3. **Inventory**: Stockroom manager. Tracks **Finished Goods** (for sale) or **Raw Materials** (supplies/packaging). Computes **Landed Cost** per unit: Base Cost + (Batch Shipping / Qty). For Finished Goods, enters **Selling Price** and reveals pure expected profit per sale.

4. **Reports**: Statement generator. Select an account or **Master Ledger**, pick **From Date** and **To Date**, and click **Generate PDF Statement** to print official statement records.

- **Branding Studio**:

- AI generators for business names, taglines, ad copy, and logos. Allows configuring brand hex colors.

- **Website Editor & Storefront (/store)**:

- Controls live storefront appearance, hero banners, contact emails, social links, and product catalogs.

- **Orders & Leads**:

- View incoming storefront orders, manage order fulfillment status, assign tracking numbers, and view customer inquiries.`;

    if (currentUserContext) {
      const bName =
        currentUserContext.aiArchitecture?.businessName ||
        currentUserContext.businessName ||
        "Unknown Startup";

      const bType = currentUserContext.businessType || "E-commerce";

      const bDesc =
        currentUserContext.aiArchitecture?.businessDesc ||
        currentUserContext.businessDesc ||
        "General commerce";

      systemPrompt += `\n\nACTIVE FOUNDER CONTEXT IN MEMORY:

Business Name: ${bName}

Industry / Type: ${bType}

Description: ${bDesc}`;
    } else {
      systemPrompt += `\n\nACTIVE FOUNDER CONTEXT: Guest User (Guide them to test features or click Start Building to launch).`;
    }

    const finalPrompt = `${systemPrompt}\n\nUser Question: ${prompt}`;

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || `HTTP ${response.status}`);

      if (data.text) {
        let cleanText = data.text;

        cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

        cleanText = cleanText.replace(/\n/g, "<br>");

        return cleanText;
      } else {
        return "Kernel notice: Neural Core could not process this request.";
      }
    } catch (error) {
      return `Connection error: ${error.message}`;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    const text = input.trim();

    if (!text) return;

    let msgCount = sessionStorage.getItem("axisMsgCount")
      ? parseInt(sessionStorage.getItem("axisMsgCount"))
      : 0;

    let lastMsgTime = sessionStorage.getItem("axisLastMsgTime")
      ? parseInt(sessionStorage.getItem("axisLastMsgTime"))
      : 0;

    const now = Date.now();

    if (now - lastMsgTime < MESSAGE_COOLDOWN_MS) {
      const warningMsg = {
        sender: "AI",
        text: "<i class='fa-solid fa-shield-halved' style='color:#ef4444;'></i> Neural Core cooling down. Please wait 3 seconds.",
      };

      setMessages((prev) => [...prev, warningMsg]);

      return;
    }

    if (msgCount >= MAX_MESSAGES_PER_SESSION) {
      const limitMsg = {
        sender: "AI",
        text: "<i class='fa-solid fa-lock' style='color:#ef4444;'></i> Session query quota reached. Clear chat to restart your session.",
      };

      setMessages((prev) => [...prev, limitMsg]);

      return;
    }

    sessionStorage.setItem("axisLastMsgTime", now.toString());

    sessionStorage.setItem("axisMsgCount", (msgCount + 1).toString());

    const newUserMsg = { sender: "User", text };

    const updatedMessages = [...messages, newUserMsg];

    setMessages(updatedMessages);

    localStorage.setItem(
      getStorageKey(activeUserKey),
      JSON.stringify(updatedMessages),
    );

    setInput("");

    setIsTyping(true);

    const responseText = await fetchGeminiResponse(text);

    setIsTyping(false);

    const newAiMsg = { sender: "AI", text: responseText };

    const finalMessages = [...updatedMessages, newAiMsg];

    setMessages(finalMessages);

    localStorage.setItem(
      getStorageKey(activeUserKey),
      JSON.stringify(finalMessages),
    );
  };

  return (
    <div className="chatbot-page-wrapper">
      <div className="ambient-glow"></div>

      <div className="ambient-glow-secondary"></div>

      <div className="chat-wrapper">
        <header className="chat-header">
          <div className="header-brand">
            <div className="axis-avatar">
              <i className="fa-solid fa-atom"></i>
            </div>

            <div>
              <h1>
                AXIS <span className="badge-tag">AI CO-FOUNDER</span>
              </h1>

              <p>
                <span className="status-dot"></span> <span>{statusLabel}</span>
              </p>
            </div>
          </div>

          <div>
            <a
              href="#!"
              onClick={handleClearChat}
              className="close-btn"
              style={{ marginRight: "15px", fontSize: "1.1rem" }}
              title="Clear Chat Memory"
            >
              <i className="fa-solid fa-trash-can"></i>
            </a>

            <a
              href="#!"
              onClick={handleExit}
              className="close-btn"
              title="Exit Axis"
            >
              <i className="fa-solid fa-xmark"></i>
            </a>
          </div>
        </header>

        <main className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${msg.sender === "AI" ? "ai-row" : "user-row"}`}
            >
              {msg.sender === "AI" && (
                <div className="message-icon ai-icon">
                  <i className="fa-solid fa-atom"></i>
                </div>
              )}

              <div
                className={`message-bubble ${msg.sender === "AI" ? "ai-message" : "user-message"}`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}

          {isTyping && (
            <div className="message-row ai-row">
              <div className="message-icon ai-icon">
                <i className="fa-solid fa-atom"></i>
              </div>

              <div className="message-bubble ai-message">
                <span className="typing-dots">
                  Axis is analyzing system architecture<span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            </div>
          )}
        </main>

        <div className="chat-input-area">
          <form onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Axis anything about your startup or LaunchAxis..."
              autoComplete="off"
              required
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              id="sendBtn"
            >
              <i className="fa-solid fa-arrow-up"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AxisChatbot;
