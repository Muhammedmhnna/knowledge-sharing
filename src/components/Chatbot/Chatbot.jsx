import { useState, useRef, useEffect } from 'react';
import { Client } from "@gradio/client";
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

const Chatbot = () => {
  // Chat states
  const [messages, setMessages] = useState([{
    text: "Hello! I'm Nova, your AI assistant. How can I help you today? ✨",
    sender: 'bot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [gradioClient, setGradioClient] = useState(null);
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize connection
  useEffect(() => {
    const connectToAPI = async () => {
      try {
        const client = await Client.connect("yazied49/nad");
        setGradioClient(client);
        setConnectionStatus('connected');
      } catch (err) {
        console.error("Connection error:", err);
        setConnectionStatus('disconnected');
        addMessage({
          text: "Connection error. Working in limited mode.",
          sender: 'bot'
        });
      }
    };

    connectToAPI();
  }, []);

  // Enhanced scroll behavior
  const scrollToBottom = debounce((behavior = 'auto') => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollTop + container.clientHeight > container.scrollHeight - 100;

      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior
        });
        setShowNewMessagesButton(false);
        setUnreadCount(0);
      } else if (messages.length > 1) {
        setShowNewMessagesButton(true);
      }
    }
  }, 100);

  useEffect(() => {
    scrollToBottom('smooth');
    return () => scrollToBottom.cancel();
  }, [messages]);

  const addMessage = (message) => {
    setMessages(prev => [...prev, {
      ...message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !gradioClient) return;

    // Add user message
    addMessage({
      text: inputValue,
      sender: 'user'
    });

    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Get AI response
      const result = await gradioClient.predict("/predict", {
        user_input: inputValue
      });

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      addMessage({
        text: result.data,
        sender: 'bot'
      });
    } catch (err) {
      console.error("API error:", err);
      addMessage({
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'bot'
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Adjust textarea height dynamically
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Handle scroll events
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollTop + container.clientHeight > container.scrollHeight - 100;
      setShowNewMessagesButton(!isNearBottom);

      if (isNearBottom) {
        setUnreadCount(0);
      }
    }
  };

  // Count new messages when not at bottom
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 1) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollTop + container.clientHeight > container.scrollHeight - 100;

      if (!isNearBottom) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800">
      {/* Header */}
      <motion.div 
        className="p-4 shadow-md bg-gradient-to-r from-blue-600 to-purple-600"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="container mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <motion.div 
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </motion.div>
              <motion.span 
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <motion.h1 className="text-2xl font-bold text-white">
              Nova AI
            </motion.h1>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-100">
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </span>
            </div>
            {unreadCount > 0 && (
              <motion.span
                className="bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {unreadCount} new
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto container mx-auto p-4 w-full relative bg-transparent"
        onScroll={handleScroll}
      >
        {/* Floating gradient overlay */}
        <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none z-0" />
        
        {/* New messages button */}
        <AnimatePresence>
          {showNewMessagesButton && (
            <motion.button
              onClick={() => scrollToBottom('smooth')}
              className="sticky top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg z-50 transition-colors flex items-center bg-white hover:bg-gray-100 text-purple-600 border border-purple-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              New Messages
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto relative z-10">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message.sender === 'bot' && (
                <motion.div 
                  className="mr-2 self-end"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-red-500 to-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
              
              <motion.div
                className={`max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3 ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                whileHover={{ scale: 1.02 }}
              >
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                <p className={`text-xs mt-1 text-right ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp}
                </p>
              </motion.div>
              
              {message.sender === 'user' && (
                <motion.div 
                  className="ml-2 self-end"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              className="flex justify-start mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="mr-2 self-end"
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
              
              <div className="px-4 py-3 rounded-2xl rounded-bl-none max-w-[70%] bg-white border border-gray-200 shadow-sm">
                <div className="flex space-x-2">
                  <div className="typing-dot bg-gray-500" style={{ animationDelay: '0ms' }} />
                  <div className="typing-dot bg-gray-500" style={{ animationDelay: '150ms' }} />
                  <div className="typing-dot bg-gray-500" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <motion.div
        className="border-t p-4 border-gray-200 bg-white shadow-inner"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <motion.div 
              className="absolute left-3 top-3"
              whileHover={{ scale: 1.1 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </motion.div>
            
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message Nova..."
              className="w-full p-3 pl-10 pr-12 rounded-lg focus:outline-none resize-none overflow-hidden max-h-40 transition-all duration-200 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={isLoading}
            />
            
            <motion.button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className={`absolute right-2 bottom-2 p-2 rounded-full ${isLoading || !inputValue.trim()
                  ? 'text-gray-400'
                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                }`}
              whileHover={!isLoading && inputValue.trim() ? { scale: 1.1 } : {}}
              whileTap={!isLoading && inputValue.trim() ? { scale: 0.9 } : {}}
            >
              {isLoading ? (
                <motion.svg
                  className="h-7 w-7"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </motion.svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </motion.button>
          </div>
          
          {/* Footer with subtle branding */}
          <motion.div 
            className="text-center mt-2 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Powered by Nova AI • Ask me anything
          </motion.div>
        </div>
      </motion.div>

      {/* Floating particles for visual interest */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-100 opacity-40"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Typing animation styles */}
      <style jsx global>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          animation: typingAnimation 1.4s infinite ease-in-out;
        }
        
        @keyframes typingAnimation {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;