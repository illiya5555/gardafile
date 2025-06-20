import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // First, save the user message to the database
      await supabase.from('chat_messages').insert({
        message: inputText,
        sender_type: 'user',
        created_at: new Date().toISOString()
      });

      // Simple AI response simulation for the chat widget
      // In a real scenario this would call the AI edge function
      const aiResponses = [
        "Привет! Я помощник Garda Racing Yacht Club в Рива-дель-Гарда. У нас проходят ежедневные регаты на быстрых яхтах J70. Можно присоединиться в любую дату, даже если ты никогда не гонял — на борту будет шкипер! Участие от 195€. Хочешь посмотреть доступные даты?",
        "На нашем сайте вы можете забронировать место в регате уже сегодня. Стоимость участия — от 195€ за человека, включая профессионального шкипера, все снаряжение и медали победителям. Какую дату вы рассматриваете для участия?",
        "Garda Racing Yacht Club — это новый способ попробовать яхтинг и участвовать в регатах на современных яхтах J70. Мы находимся в Рива-дель-Гарда, на озере Гарда в Италии. Наши регаты доступны новичкам. Могу я помочь вам с бронированием?"
      ];
      
      // Choose a response based on input
      let responseIndex = 0;
      const lowerInput = inputText.toLowerCase();
      
      if (lowerInput.includes("дата") || lowerInput.includes("когда") || 
          lowerInput.includes("бронирование") || lowerInput.includes("цена")) {
        responseIndex = 1;
      } else if (lowerInput.includes("что") || lowerInput.includes("клуб") || 
                lowerInput.includes("где") || lowerInput.includes("как")) {
        responseIndex = 2;
      }
      
      const aiResponseText = aiResponses[responseIndex];

      // Save the AI response to the database
      await supabase.from('chat_messages').insert({
        message: aiResponseText,
        sender_type: 'bot',
        created_at: new Date().toISOString()
      });

      // Add bot response to chat
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isBot: true,
        timestamp: new Date()
      };

      // Simulate a small delay for more natural conversation flow
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error in chat interaction:", error);
      
      // Fallback response in case of error
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('chat.auto_response', 'Thank you for your message! Our team will get back to you shortly. For immediate assistance, please call +39 344 777 00 77.'),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">{t('chat.support_title', 'Garda Racing Support')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
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
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('chat.placeholder', 'Type your message...')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !inputText.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;