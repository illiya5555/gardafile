// ChatWidget.tsx (ИСПРАВЛЕННЫЙ КОД)

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const API_URL = 'https://genai-app-animalinformationchatbot-1-175036711755-444678468039.us-central1.run.app';
const API_KEY = 'vk4lll3o0neshm7b';

const ChatWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chat.initial_message', 'Hello! How can I help you with your yacht racing experience today?'),
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedInput,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmedInput }), 
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      // Проверяем разные возможные ключи в ответе API
      const botReply = data.reply || data.response || data.text || "Sorry, I couldn't process that.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Failed to fetch bot response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('chat.error_message', 'Sorry, something went wrong. Please try again later.'),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open chat"
      >
        <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-72 sm:w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-primary-600 text-white p-3 md:p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold text-sm md:text-base">{t('chat.support_title', 'Garda Racing Support')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-2 md:space-y-3">
            {/* === НАЧАЛО ИСПРАВЛЕННОГО БЛОКА === */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-2 md:p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  <p className="text-xs md:text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isBot ? 'text-gray-500' : 'text-primary-100'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {/* === КОНЕЦ ИСПРАВЛЕННОГО БЛОКА === */}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-2 md:p-3 rounded-lg">
                  <p className="text-xs md:text-sm flex items-center">
                    <span className="animate-pulse">●</span> 
                    <span className="animate-pulse [animation-delay:0.2s]">●</span> 
                    <span className="animate-pulse [animation-delay:0.4s]">●</span>
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-2 md:p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('chat.placeholder', 'Type your message...')}
                className="flex-1 px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs md:text-sm"
                aria-label="Type a message"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white p-1 md:p-2 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Send message"
                disabled={isLoading}
              >
                <Send className="h-3 w-3 md:h-4 md:w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;