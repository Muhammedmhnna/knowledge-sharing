import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from "@gradio/client";

const ChatPopup = () => {
    // Chat states
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([{
        text: "Hello! I'm your AI assistant. How can I help you today? ✨",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [gradioClient, setGradioClient] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Initialize connection when popup opens
    useEffect(() => {
        const connectToAPI = async () => {
            setConnectionStatus('connecting');
            try {
                const client = await Client.connect("yazied49/nad");
                setGradioClient(client);
                setConnectionStatus('connected');
            } catch (err) {
                console.error("Connection error:", err);
                setConnectionStatus('disconnected');
                addSystemMessage("Connection error. Working in limited mode.");
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

    const addSystemMessage = (text) => {
        addMessage({
            text,
            sender: 'system'
        });
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        // Add user message
        addMessage({
            text: inputValue,
            sender: 'user'
        });

        setInputValue('');
        setIsLoading(true);
        setIsTyping(true);

        if (!gradioClient || connectionStatus !== 'connected') {
            addSystemMessage("Still connecting to the AI service...");
            setIsLoading(false);
            setIsTyping(false);
            return;
        }

        try {
            // Get AI response with timeout
            const result = await Promise.race([
                gradioClient.predict("/predict", { user_input: inputValue }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), 15000))
            ]);

            // Simulate typing delay
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            addMessage({
                text: result.data,
                sender: 'bot'
            });
        } catch (err) {
            console.error("API error:", err);
            const errorMessage = err.message.includes('timeout')
                ? "The request took too long. Please try again later."
                : "Sorry, I encountered an error. Please try again.";

            addSystemMessage(errorMessage);
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
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [inputValue]);

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

    const buttonVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.1,
            rotate: [0, 10, -10, 0],
            transition: { duration: 0.5 }
        },
        tap: { scale: 0.9 }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setOpen(!open)}
                className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:shadow-lg transition-all z-50"
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                animate={open ? "tap" : "initial"}
            >
                {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <motion.div
                        animate={{
                            rotate: connectionStatus === 'connected' ? 0 : [0, 10, -10, 0],
                            transition: {
                                rotate: connectionStatus === 'connected' ? {} : { repeat: Infinity, duration: 1 }
                            }
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </motion.div>
                )}
                {connectionStatus !== 'connected' && (
                    <motion.span
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
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
                        className="fixed bottom-24 right-8 w-90 h-[32rem] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col z-50 border border-gray-200"
                    >
                        {/* Chat header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <motion.div
                                    className="flex items-center space-x-3"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="relative">
                                        <motion.div
                                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                                            animate={{
                                                rotate: connectionStatus === 'connected' ? 360 : 0,
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
                                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' :
                                                connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
                                                }`}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </div>
                                    <div>
                                        <motion.h1 className="text-2xl font-bold text-white">
                                            Nova AI
                                        </motion.h1>
                                        <p className="text-xs opacity-80">
                                            {connectionStatus === 'connected' ? 'Online' :
                                                connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                                        </p>
                                    </div>
                                </motion.div>

                            </div>
                            <motion.button
                                onClick={() => setOpen(false)}
                                className="text-white hover:text-blue-200 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </motion.button>
                        </div>

                        {/* Messages container */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 p-4 overflow-y-auto bg-gray-50"
                        >
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.div
                                        className={`max-w-[85%] rounded-lg px-4 py-2 ${message.sender === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                                            : message.sender === 'system'
                                                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg'
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                            }`}
                                       
                                    >
                                        <p className="whitespace-pre-wrap">{message.text}</p>
                                        <p className={`text-xs mt-1 text-right ${message.sender === 'user' ? 'text-blue-200' :
                                            message.sender === 'system' ? 'text-yellow-600' : 'text-gray-500'
                                            }`}>
                                            {message.timestamp}
                                        </p>
                                    </motion.div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    className="flex justify-start mb-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="bg-white text-gray-800 px-4 py-2 rounded-lg rounded-bl-none max-w-[85%] border border-gray-200">
                                        <div className="flex space-x-1">
                                            <motion.div
                                                className="w-2 h-2 bg-gray-500 rounded-full"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-gray-500 rounded-full"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-gray-500 rounded-full"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input area */}
                        <div className="border-t border-gray-200 p-3 bg-white">
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        adjustTextareaHeight();
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder={
                                        connectionStatus === 'connected' ? "Type your message..." :
                                            connectionStatus === 'connecting' ? "Connecting to service..." :
                                                "Service unavailable"
                                    }
                                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="1"
                                    disabled={isLoading || connectionStatus !== 'connected'}
                                />
                                <motion.button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim() || connectionStatus !== 'connected'}
                                    className={`absolute right-3 bottom-4 ${isLoading || !inputValue.trim() || connectionStatus !== 'connected'
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-blue-600 hover:text-blue-800 cursor-pointer'
                                        }`}
                                    whileHover={(!isLoading && inputValue.trim() && connectionStatus === 'connected') ? { scale: 1.1 } : {}}
                                    whileTap={(!isLoading && inputValue.trim() && connectionStatus === 'connected') ? { scale: 0.9 } : {}}
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
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </motion.svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatPopup;