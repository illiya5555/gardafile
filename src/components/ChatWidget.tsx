import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ChatMessage } from '../lib/supabase';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  const quickReplies = [
    "What's included in the €199 package?",
    "Do I need sailing experience?",
    "What's the weather like?",
    "How do I book?",
    "Group discounts available?"
  ];

  useEffect(() => {
    if (user && isOpen) {
      loadChatHistory();
    }
  }, [user, isOpen]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // Add welcome message for new users
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          user_id: user.id,
          message: `Hello ${profile?.first_name || 'there'}! I'm here to help you with your sailing experience. How can I assist you today?`,
          sender_type: 'bot',
          created_at: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatMessage = async (message: string, senderType: 'user' | 'bot') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message,
          sender_type: senderType
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: user.id,
      message: inputText,
      sender_type: 'user',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    await saveChatMessage(inputText, 'user');
    setInputText('');
    setLoading(true);

    // Simulate bot response
    setTimeout(async () => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: user.id,
        message: "Thanks for your message! Our team will get back to you shortly. In the meantime, feel free to check our booking page or call us at +39 345 678 9012.",
        sender_type: 'bot',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botResponse]);
      await saveChatMessage(botResponse.message, 'bot');
      setLoading(false);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    if (!user) {
      // Show login prompt for non-authenticated users
      const guestMessage: ChatMessage = {
        id: 'guest',
        user_id: 'guest',
        message: "Hello! To use our chat support, please sign in or create an account. This helps us provide you with personalized assistance and keep track of your conversations.",
        sender_type: 'bot',
        created_at: new Date().toISOString()
      };
      setMessages([guestMessage]);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleOpenChat}
        className={`fixed bottom-6 right-6 z-50 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 hover:scale-110 ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        <MessageCircle className="h-6 w-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Garda Racing Support</h3>
                <p className="text-xs text-white/80">
                  {user ? 'Online now' : 'Sign in for support'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs ${
                  message.sender_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    message.sender_type === 'user' ? 'bg-primary-600' : 'bg-gray-200'
                  }`}>
                    {message.sender_type === 'user' ? (
                      <User className="h-3 w-3 text-white" />
                    ) : (
                      <Bot className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.sender_type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {user && messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {quickReplies.slice(0, 3).map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors duration-300"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            {user ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !inputText.trim()}
                  className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Sign in to start chatting</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors duration-300"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;