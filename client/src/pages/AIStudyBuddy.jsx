import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  User,
  Bot,
  Trash2,
  Copy,
  Download,
  Brain,
  Lightbulb,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { aiService } from '../services/api';

const initialMessage = {
  role: 'assistant',
  content:
    "Hello! I'm your AI Study Buddy. I can help you explain topics, create revision notes, generate quizzes, and keep you motivated.",
  timestamp: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
};

const AIStudyBuddy = () => {
  const { showToast } = useToast();

  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studybuddy_ai_messages')) || [initialMessage];
    } catch {
      return [initialMessage];
    }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('studybuddy_ai_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (customText = input) => {
    const text = customText.trim();
    if (!text) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.chat(
        text,
        messages.slice(-6).map((message) => ({
          role: message.role,
          content: message.content
        }))
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            response.data.response ||
            response.data.message ||
            'I could not generate a response.',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ]);
    } catch (error) {
      console.error(error);
      showToast('AI server not connected. Showing fallback answer.', 'info');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Your AI backend is not reachable right now. Check that your server is running and that /api/ai/chat exists.',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([initialMessage]);
    localStorage.removeItem('studybuddy_ai_messages');
    showToast('Chat cleared.', 'info');
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard.', 'success');
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech is not supported in this browser.', 'error');
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const downloadChat = () => {
    const content = messages
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'studybuddy-chat.txt';
    link.click();

    URL.revokeObjectURL(link.href);
  };

  const toggleRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser.', 'error');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onerror = () => {
      setIsRecording(false);
      showToast('Voice input failed.', 'error');
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInput(text);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const quickPrompts = [
    { text: 'Explain Quantum Tunneling', icon: Brain },
    { text: 'How to improve memory?', icon: Lightbulb },
    { text: 'Create a MCQ quiz on DSA', icon: Zap },
    { text: 'Motivate me to study', icon: Sparkles }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-600 rounded-xl shadow-lg shadow-violet-600/20">
            <Bot className="text-white" size={20} />
          </div>

          <div>
            <h2 className="text-2xl font-bold">AI Study Buddy</h2>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">
              Neural Link Active
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadChat}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all"
          >
            <Download size={18} />
          </button>

          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-red-400 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 glass-card overflow-hidden flex flex-col relative border-white/5">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          {messages.map((msg, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === 'user' ? 'bg-cyan-500' : 'bg-violet-600'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-white" />
                  )}
                </div>

                <div>
                  <div
                    className={`p-4 rounded-2xl break-words ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    {msg.role === 'assistant' && (
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => copyText(msg.content)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-slate-500 hover:text-white"
                        >
                          <Copy size={12} />
                        </button>

                        <button
                          onClick={() => speakText(msg.content)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-slate-500 hover:text-white"
                        >
                          <Volume2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[9px] text-slate-500 font-bold mt-1.5 block ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 md:px-6 pb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => {
            const Icon = prompt.icon;

            return (
              <button
                key={prompt.text}
                onClick={() => sendMessage(prompt.text)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/5"
              >
                <Icon size={14} />
                {prompt.text}
              </button>
            );
          })}
        </div>

        <div className="p-4 md:p-6 bg-[#161B2E]/80 border-t border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-xl border border-white/10 transition-all ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Mic size={18} />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask your AI Study Buddy..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50"
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="p-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudyBuddy;
