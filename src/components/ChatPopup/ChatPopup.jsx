import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from "@gradio/client";

const ChatPopup = () => {
    // Chat states
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([{
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [gradioClient, setGradioClient] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize connection when popup opens
    useEffect(() => {
        const connectToAPI = async () => {
            try {
                const client = await Client.connect("yazied49/nad");
                setGradioClient(client);
            } catch (err) {
                console.error("Connection error:", err);
                addMessage({
                    text: "Connection error. Working in limited mode.",
                    sender: 'bot'
                });
            }
        };

        if (open) {
            connectToAPI();
        }
    }, [open]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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

    // Animation variants
    const popupVariants = {
        hidden: {
            opacity: 0,
            y: 50,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setOpen(!open)}
                className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-all z-50"
                whileHover={{
                    scale: 1.1,
                    rotate: [0, 10, -10, 0],
                    transition: { duration: 0.5 }
                }}
                whileTap={{ scale: 0.9 }}
            >
                {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </motion.button>

            {/* Chat Popup */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={popupVariants}
                        className="fixed bottom-24 right-8 w-80 h-[32rem] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col z-50 border border-gray-200"
                    >
                        {/* Chat header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold">AI Assistant</h3>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-white hover:text-blue-200 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages container */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-lg px-4 py-2 ${message.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.text}</p>
                                        <p className={`text-xs mt-1 text-right ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                                            }`}>
                                            {message.timestamp}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start mb-4">
                                    <div className="bg-white text-gray-800 px-4 py-2 rounded-lg rounded-bl-none max-w-[85%] border border-gray-200">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area */}
                        <div className="border-t border-gray-200 p-3 bg-white">
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="1"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim()}
                                    className={`absolute right-3 bottom-4 ${isLoading || !inputValue.trim()
                                            ? 'text-gray-400'
                                            : 'text-blue-600 hover:text-blue-800'
                                        }`}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatPopup;