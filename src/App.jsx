import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from "framer-motion";
import { IoSend, IoRocketOutline } from "react-icons/io5"; // Import icons
import { ScaleLoader } from 'react-spinners'; // Import loading spinner

const OpenAITrainer = () => {
  const [messages, setMessages] = useState([]); // Store messages in an array
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const ollamaApiUrl = "http://dev.aux-rolplay.com/v1/chat/completions"; // <---- CHANGED HERE

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const startTraining = async () => {
    setLoading(true);
    setMessages([{ role: "assistant", content: "Starting the diagnostic training... Please wait." }]); // Initial message

    const initialMessages = [
      {
        role: "system",
        content: `
        You are an AI assistant trained to provide guidance on the Strategic Based Diagnostic approach for identifying, analyzing, and solving production line problems. Your responses should be structured, clear, and instructional. Use direct observation, data analysis, and strategic methodologies to help users apply effective problem-solving techniques.

        ## Knowledge Base:
        ### Fundamentals of Strategic Based Diagnostic
        - **Definition:** A systematic approach combining observation, data analysis, and proven strategies to resolve operational issues.
        - **Importance:** Enhances efficiency, reduces downtime, improves quality, and enables informed decision-making.
        - **Key Principles:**
          1. Observation and Recording: Document anomalies.
          2. Data Analysis: Use KPIs and metrics.
          3. Root Cause Identification: Apply methods like the 5 Whys, Ishikawa Diagram.
          4. Implementation of Corrective Actions.
          5. Feedback and Follow-Up.

        ### Tools and Techniques
        - **5 Whys:** Ask "why" iteratively to uncover the root cause.
        - **Ishikawa Diagram:** A cause-and-effect tool categorizing potential problem sources.
        - **Data Analysis:** Using statistical tools to detect trends.
        - **Checklists & Protocols:** Ensuring all diagnostic steps are followed.

        ### Strategic Diagnostic Procedure
        1. **Problem Identification:** Observe and report anomalies.
        2. **Data Collection:** Record sensor data and consult historical records.
        3. **Analysis & Classification:** Apply diagnostic techniques and classify impact.
        4. **Solution Strategy Development:** Design and evaluate potential solutions.
        5. **Implementation & Follow-Up:** Execute, monitor, and refine solutions.

        ## Question-Answering Guidelines:
        ### General Concept Questions
        1. **What is Strategic Based Diagnostic?**
          - Expected: Explanation of identifying, analyzing, and solving problems using structured techniques.
        2. **What are the key principles?**
          - Expected: Observation, data analysis, root cause identification, corrective actions, and follow-up.
        3. **Name and describe two diagnostic tools.**
          - Expected: 5 Whys (iterative questioning) and Ishikawa Diagram (visual cause categorization).

        ### Situational Analysis Questions
        4. **First steps during an unexpected line stoppage?**
          - Expected: Check records, observe the site, collect sensor data, talk to personnel.
        5. **How to use the 5 Whys for a recurring error?**
          - Expected: Iteratively ask “why?” until the root cause is uncovered.
        6. **How to create an Ishikawa Diagram for a quality issue?**
          - Expected: Identify the problem, categorize causes (e.g., machinery, personnel), and analyze sub-causes.

        ### Practical Application Questions
        7. **Key indicators to monitor declining performance?**
          - Expected: Cycle times, defect rates, material consumption—explaining their relevance.
        8. **Describe a real or hypothetical application of Strategic Based Diagnostic.**
          - Expected: Case study covering problem identification, data analysis, tools, and results.
        9. **How to document and communicate findings?**
          - Expected: Structured reports, diagrams, and clear communication with teams.

        **🎯 Your Role:**
        - Simulate a **real-world training session** using Markdown formatting.
        - Ask **scenario-based diagnostic questions**.
        - Analyze user responses and provide **detailed feedback** in Markdown.
        - Continue until **9 questions** are answered from the above questions list..
        - Conclude with a **final evaluation & improvement plan**.

        **Important:** Format all responses using **Markdown** for readability.
      `,
      },
      { role: "user", content: "Start the diagnostic test" },
    ];

    try {
      console.log("Api url: ", ollamaApiUrl);
      const response = await fetch(ollamaApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama3.2", messages: initialMessages, temperature: 0.7 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const firstQuestion = data.choices[0].message.content;

      setMessages([{ role: "assistant", content: firstQuestion }]); // Display the first question
    } catch (error) {
      console.error("Error starting training:", error);
      setMessages([{ role: "assistant", content: "Failed to start training. Please check the console for errors." }]);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return; // Prevent sending empty messages
    setLoading(true);

    const newUserMessage = { role: "user", content: userAnswer };
    setMessages(prevMessages => [...prevMessages, newUserMessage]); // Display user's message

    const apiMessages = [
      {
        role: "system",
        content: "Evaluate user's response based on Strategic Based Diagnostics principles. Provide feedback and suggest the next question if appropriate.",
      },
      ...messages,
      newUserMessage,
    ];

    try {
      const response = await fetch(ollamaApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama3.2", messages: apiMessages, temperature: 0.7 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: aiResponse }]); // Display AI response
    } catch (error) {
      console.error("Error submitting answer:", error);
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "Failed to get a response. Please check the console for errors." }]);
    } finally {
      setUserAnswer("");
      setLoading(false);
    }
  };

  // ReactMarkdown configuration for code syntax highlighting
  const renderers = {
    code: ({ language, value }) => (
      <div className="overflow-x-auto bg-gray-900 p-3 rounded-lg">
        <SyntaxHighlighter
          style={dracula}
          language={language}
          children={value}
          className="rounded-md"
        />
      </div>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-700">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 bg-gray-200 px-4 py-2 text-left">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-4 py-2">{children}</td>
    ),
  };




  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 text-center shadow-md">
        <h1 className="text-2xl font-bold">🏭 Strategic Based Diagnostic Training</h1>
        <p className="text-sm opacity-80">Master problem-solving with AI guidance.</p>
      </header>

      {/* Chat Container */}
      <main
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`rounded-xl shadow-sm p-3 max-w-3/4 break-words ${msg.role === 'user' ? 'bg-blue-100 self-end text-gray-800' : 'bg-white self-start text-gray-800'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm md:text-base leading-relaxed">
              <ReactMarkdown
                children={msg.content}
                remarkPlugins={[remarkGfm]}
                components={renderers}
              />
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="bg-white self-start text-gray-800 rounded-xl shadow-sm p-3">
            <div className="flex items-center text-sm md:text-base">
              <ScaleLoader color="#3498db" height={20} width={4} radius={2} margin={2} />
              <span className="ml-2">Thinking...</span>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="bg-gray-100 p-3 border-t border-gray-300">
        <div className="container mx-auto flex items-center">
          <textarea
            className="flex-grow p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm md:text-base"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitAnswer();
              }
            }}
          />
          <button
            className="ml-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-400"
            onClick={handleSubmitAnswer}
            disabled={loading}
          >
            {loading ? <ScaleLoader color="#fff" height={15} width={3} radius={2} margin={2} /> : <IoSend />}
          </button>
        </div>
      </footer>

      {/* Start Button */}
      {!messages.length > 0 && (
        <motion.button
          className="mx-auto mt-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl py-3 px-6 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:bg-gray-400 flex items-center"
          onClick={startTraining}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "Loading..." : (
            <>
              🚀 Start Training
              <IoRocketOutline className="ml-2" />
            </>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default OpenAITrainer;