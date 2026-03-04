import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import './AIAssistant.css';

const MODES = [
  { id: 'doubt',     label: 'Doubt Solver',     icon: '💬', desc: 'Ask any subject-related question' },
  { id: 'summarize', label: 'Summarize Notes',  icon: '📝', desc: 'Paste your notes for a clean summary' },
  { id: 'explain',   label: 'Explain Concept',  icon: '🧠', desc: 'Get any topic explained simply' },
  { id: 'quiz',      label: 'Generate Quiz',    icon: '❓', desc: 'Auto-generate MCQs on any topic' },
];

const PLACEHOLDERS = {
  doubt:     'e.g. What is the difference between TCP and UDP?',
  summarize: 'Paste your notes or textbook content here...',
  explain:   'e.g. Explain Recursion in simple terms',
  quiz:      'e.g. Generate a quiz on Operating System concepts',
};

export default function AIAssistant() {
  const [mode, setMode]       = useState('doubt');
  const [input, setInput]     = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: '👋 Hi! I\'m your **AI Study Assistant**. Select a mode and ask me anything!', id: Date.now() }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText, id: Date.now() }]);
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { mode, message: userText });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply, id: Date.now() + 1 }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Sorry, I encountered an error. Please try again.',
        id: Date.now() + 1,
        isError: true,
      }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'ai', text: '🔄 Chat cleared! What would you like to explore?', id: Date.now() }]);
  };

  // Render markdown-like bold text
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  };

  const currentMode = MODES.find(m => m.id === mode);

  return (
    <motion.div
      className="ai-assistant-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-header-icon">🤖</div>
          <div>
            <h1 className="ai-title">AI Study Assistant</h1>
            <p className="ai-subtitle">Powered by Google Gemini</p>
          </div>
        </div>
        <button className="ai-clear-btn" onClick={clearChat} title="Clear chat">
          🗑️ Clear
        </button>
      </div>

      {/* Mode Selector */}
      <div className="ai-mode-bar">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`ai-mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-label">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Mode description */}
      <motion.div
        className="ai-mode-desc"
        key={mode}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        <span>{currentMode.icon}</span>
        <span><strong>{currentMode.label}:</strong> {currentMode.desc}</span>
      </motion.div>

      {/* Chat Window */}
      <div className="ai-chat-window">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`ai-bubble-wrap ${msg.role}`}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`ai-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
                {msg.role === 'ai' && <span className="bubble-icon">🤖</span>}
                <div className="bubble-text">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{renderText(line)}</p>
                  ))}
                </div>
                {msg.role === 'user' && <span className="bubble-icon user-icon">👤</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {loading && (
          <motion.div
            className="ai-bubble-wrap ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="ai-bubble ai typing-indicator">
              <span className="bubble-icon">🤖</span>
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="ai-input-area">
        <textarea
          className="ai-textarea"
          placeholder={PLACEHOLDERS[mode]}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          disabled={loading}
        />
        <button
          className={`ai-send-btn ${loading ? 'loading' : ''}`}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <span className="send-spinner">⏳</span>
          ) : (
            <>
              <span>Send</span>
              <span>➤</span>
            </>
          )}
        </button>
      </div>
      <p className="ai-hint">Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line</p>
    </motion.div>
  );
}
