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
      return (
        JSON.parse(localStorage.getItem('studybuddy_ai_messages')) || [
          initialMessage
        ]
      );
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
    localStorage.setItem(
      'studybuddy_ai_messages',
      JSON.stringify(messages)
    );

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
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
        messages
          .slice(-6)
          .map((message) => ({
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

      showToast(
        'AI server not connected. Showing fallback answer.',
        'info'
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Your AI backend is not reachable right now.',
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
      showToast(
        'Speech is not supported in this browser.',
        'error'
      );
      return;
    }

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(text)
    );
  };

  const downloadChat = () => {
    const content = messages
      .map(
        (message) =>
          `${message.role.toUpperCase()}: ${message.content}`
      )
      .join('\n\n');

    const blob = new Blob([content], {
      type: 'text/plain'
    });

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);

    link.download = 'studybuddy-chat.txt';

    link.click();

    URL.revokeObjectURL(link.href);
  };

  const toggleRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast(
        'Speech recognition is not supported in this browser.',
        'error'
      );

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
      {/* Keep remaining JSX same as your existing code */}
    </div>
  );
};

export default AIStudyBuddy;
