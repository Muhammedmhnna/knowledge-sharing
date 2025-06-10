import { useState, useEffect } from 'react';
import { ArrowRightIcon, AcademicCapIcon, UserGroupIcon, LightBulbIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';


const WelcomePage = () => {
    const [currentFeature, setCurrentFeature] = useState(0);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const controls = useAnimation();
    const [ref, inView] = useInView();
    const navigate = useNavigate();

    const features = [
        {
            icon: <AcademicCapIcon className="h-10 w-10" />,
            title: "Inclusive Learning",
            description: "Content designed for all abilities with multiple accessibility options"
        },
        {
            icon: <UserGroupIcon className="h-10 w-10" />,
            title: "Community Support",
            description: "Connect with experts and peers in our supportive network"
        },
        {
            icon: <LightBulbIcon className="h-10 w-10" />,
            title: "Tailored Resources",
            description: "Personalized knowledge paths based on your needs"
        },
        {
            icon: <ShieldCheckIcon className="h-10 w-10" />,
            title: "Safe Environment",
            description: "Moderated platform with zero tolerance for discrimination"
        }
    ];

    const rotatingTexts = [
        "Empowering individuals with disabilities through accessible knowledge sharing",
        "Breaking barriers through inclusive education",
        "Knowledge without limitations",
        "Building bridges to accessible learning"
    ];

    // Text rotation effect
    useEffect(() => {
        const textInterval = setInterval(() => {
            setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
        }, 3000);
        return () => clearInterval(textInterval);
    }, []);

    // Feature carousel animation
    useEffect(() => {
        const featureInterval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 4000);
        return () => clearInterval(featureInterval);
    }, []);

    // Scroll trigger animation
    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white overflow-hidden">
            {/* Floating particles background */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            scale: Math.random() * 0.5 + 0.5
                        }}
                        animate={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            transition: {
                                duration: Math.random() * 30 + 20,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }
                        }}
                        style={{
                            width: `${Math.random() * 10 + 5}px`,
                            height: `${Math.random() * 10 + 5}px`
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 max-w-6xl mx-auto">
                {/* Animated header */}
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-12 md:mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-6"
                    >
                        <AcademicCapIcon className="h-16 w-16 text-indigo-300" />
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-400">KnowledgeBridge</span>
                    </h1>

                    <div className="h-16 flex items-center justify-center">
                        <AnimatePresence mode='wait'>
                            <motion.p
                                key={currentTextIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto"
                            >
                                {rotatingTexts[currentTextIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Features showcase */}
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={controls}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 ${currentFeature === index ? 'ring-2 ring-indigo-400 shadow-lg' : 'opacity-70 hover:opacity-90'}`}
                            onMouseEnter={() => setCurrentFeature(index)}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-lg ${currentFeature === index ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-blue-200'}`}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                                    <p className="text-blue-100">{feature.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
                >
                    <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/login')}
                        className="cursor-pointer flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center space-x-2"
                    >
                        <span>Sign In</span>
                        <ArrowRightIcon className="h-5 w-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/register')}
                        className="cursor-pointer flex-1 bg-transparent border-2 border-indigo-400 text-indigo-100 py-4 px-6 rounded-xl font-medium hover:bg-indigo-500/20 transition-colors"
                    >
                        Create Account
                    </motion.button>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-12 text-center text-blue-200 text-sm"
                >
                    <button
                        onClick={() => navigate('/guest')}
                        className="cursor-pointer hover:text-white underline underline-offset-4 decoration-blue-300/50 hover:decoration-white transition-colors"
                    >
                        Continue as guest
                    </button>
                    <p className="mt-2">Need help? <button className="cursor-pointer hover:text-white underline underline-offset-4">Contact support</button></p>
                </motion.div>
            </div>

            {/* Feature spotlight animation */}
            <AnimatePresence>
                <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full filter blur-3xl pointer-events-none"
                />
            </AnimatePresence>
        </div>
    );
};

export default WelcomePage;