import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import essamImage from "../../assets/images/essam.jpg"
import karimImage from "../../assets/images/karim.jpg"
import yaziedImage from "../../assets/images/yazied.jpg"
import alaaImage from "../../assets/images/alaa.jpg"
import yaraImage from "../../assets/images/yara.jpg"
import nadineImage from "../../assets/images/nadine.jpg"
import hebaImage from "../../assets/images/heba.jpg"

const teamGroups = [
    {
        title: "FRONT-END SPECIALISTS",
        members: [
            {
                name: "MUHAMMED ESSAM",
                role: "UI/UX ENGINEER",
                description: "Designed cutting-edge interfaces with reactive layouts and implemented neural network-assisted UI logic.",
                image: essamImage,
                tech: ["React-ARK", "NeonCSS", "CyberJS"],
            },
            {
                name: "ALAA MAHMOUD",
                role: "MOTION ENGINEER",
                description: "Crafted quantum animation systems and state management for zero-latency holographic interfaces.",
                image: alaaImage,
                tech: ["Framer-Q", "TensorFX", "PulseDB"],
            }
        ]
    },
    {
        title: "BACK-END ARCHITECTS",
        members: [
            {
                name: "KARIM MUHAMMED",
                role: "SYSTEMS ENGINEER",
                description: "Built distributed neural APIs with quantum encryption and nano-server infrastructure.",
                image: karimImage,
                tech: ["Node-42", "Mongo-EX", "CipherCore"],
            },
            {
                name: "YARA SAYED",
                role: "DATA ARCHITECT",
                description: "Designed fractal database schemas and implemented AI-driven query optimization.",
                image: yaraImage,
                tech: ["TensorDB", "NeuroSQL", "Flow-IO"],
            }
        ]
    },
    {
        title: "AI RESEARCH TEAM",
        members: [
            {
                name: "YAZIED MUHAMMED",
                role: "DEEP LEARNING SPECIALIST",
                description: "Developed sentient recommendation models and implemented real-time neural analysis.",
                image: yaziedImage,
                tech: ["PyTorch-X", "NeuroLab", "QuantumAI"],
            },
            {
                name: "NADINE IBRAHIM",
                role: "MACHINE VISION EXPERT",
                description: "Created augmented reality perception systems and multi-dimensional ML integrations.",
                image: nadineImage,
                tech: ["Vision-9", "TensorFlow-Z", "HoloML"],
            }
        ]
    },
    {
        title: "QUALITY SYNTHESIS",
        members: [
            {
                name: "HEBA MAHMOUD",
                role: "AUTOMATION SPECIALIST",
                description: "Implemented quantum test matrices and neural validation protocols for system integrity.",
                image: hebaImage,
                tech: ["CyberTest", "Auto-Validate", "NeuroQA"],
            }
        ]
    }
];

const CyberButton = ({ children, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{
                scale: 1.05,
                textShadow: "0 0 8px rgba(10, 235, 255, 0.8)",
                boxShadow: "0 0 15px rgba(10, 235, 255, 0.6)"
            }}
            whileTap={{ scale: 0.95 }}
            className="relative px-8 py-3 bg-black border-2 border-cyan-400 rounded-full font-mono font-bold text-cyan-300 
                overflow-hidden group"
        >
            <span className="relative z-10">{children}</span>
            <motion.span
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100"
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 border-t-2 border-b-2 border-cyan-400/30 pointer-events-none" />
        </motion.button>
    );
};

const CyberCard = ({ member, index }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.3,
        triggerOnce: true
    });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
                hidden: { opacity: 0, y: 50, rotateX: 45 },
                visible: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    transition: {
                        delay: index * 0.15,
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1]
                    }
                }
            }}
            className="w-full max-w-sm mx-auto perspective-1000"
        >
            <motion.div
                whileHover={{
                    y: -15,
                    rotateY: 5,
                    boxShadow: "0 25px 50px -12px rgba(10, 235, 255, 0.25)"
                }}
                className="bg-gray-900/80 rounded-xl p-6 shadow-2xl border border-cyan-400/20 overflow-hidden relative 
                   group transform-style-preserve-3d"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />

                <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                        <motion.div
                            className="w-32 h-32 rounded-full border-2 border-cyan-400 shadow-lg overflow-hidden relative"
                            whileHover={{ scale: 1.05 }}
                        >
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-cyan-400/10 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-300" />
                        </motion.div>
                    </div>

                    <motion.h3
                        className="text-2xl font-bold text-center text-cyan-100 mb-2 font-mono tracking-wider"
                        whileHover={{ color: "#0aefff", textShadow: "0 0 10px rgba(10, 235, 255, 0.7)" }}
                    >
                        {member.name}
                    </motion.h3>

                    <motion.p
                        className="text-sm font-medium text-center text-cyan-400 mb-4 font-mono tracking-widest"
                        whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(10, 235, 255, 0.5)" }}
                    >
                        {member.role}
                    </motion.p>

                    <motion.p
                        className="text-gray-300 text-center leading-relaxed mb-6 text-sm"
                        whileHover={{ color: "#f0f9ff" }}
                    >
                        {member.description}
                    </motion.p>

                    <div className="flex flex-wrap justify-center gap-2">
                        {member.tech.map((tech, i) => (
                            <motion.span
                                key={i}
                                whileHover={{
                                    scale: 1.1,
                                    backgroundColor: "rgba(10, 235, 255, 0.1)",
                                    borderColor: "#0aefff"
                                }}
                                className="px-3 py-1 text-xs font-mono border border-cyan-400/30 rounded-full text-cyan-300"
                            >
                                {tech}
                            </motion.span>
                        ))}
                    </div>
                </div>

                {/* Glowing edges */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 border-2 border-cyan-400/10 rounded-xl group-hover:border-cyan-400/30 transition-all duration-500" />
                    <div className="absolute -inset-1 bg-cyan-400/10 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                </div>
            </motion.div>
        </motion.div>
    );
};

const CyberSection = ({ group, index }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.2,
        triggerOnce: true
    });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    return (
        <motion.section
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.3
                    }
                }
            }}
            className="w-full py-16 relative overflow-hidden"
        >
            {/* Animated grid background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-gray-900/70 to-gray-900/0" />

            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
                <motion.h2
                    variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1]
                            }
                        }
                    }}
                    className="text-4xl md:text-5xl font-bold text-center mb-16 font-mono tracking-wider 
                     text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
                >
                    <span className="text-shadow-cyan">{group.title}</span>
                </motion.h2>

                <div className={`grid grid-cols-1 ${group.members.length > 2 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-8 justify-items-center`}>
                    {group.members.length === 1 ? (
                        <div className="col-span-full flex justify-center">
                            <CyberCard member={group.members[0]} index={0} />
                        </div>
                    ) : (
                        group.members.map((member, i) => (
                            <CyberCard key={i} member={member} index={i} />
                        ))
                    )}
                </div>
            </div>
        </motion.section>
    );
};

export default function teamPage() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans overflow-x-hidden">
            {/* Animated cyber grid background */}
            <div className="fixed inset-0 bg-grid-animated opacity-10 pointer-events-none" />

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="min-h-screen flex flex-col justify-center items-center text-center px-4 py-32 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-gray-900 to-blue-900/10" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 font-mono tracking-tighter
                       text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
                    >
                        <span className="text-shadow-cyan">SYNTHETIC CREW</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-mono"
                    >
                        MEET THE NEURAL NETWORK POWERING OUR DIGITAL REVOLUTION
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="flex justify-center"
                    >
                        <CyberButton onClick={() => document.getElementById("team-start")?.scrollIntoView({ behavior: "smooth" })}>
                            INITIATE SCAN
                        </CyberButton>
                    </motion.div>
                </div>

                <motion.div
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                </motion.div>
            </motion.section>

            {/* Team Sections */}
            <div id="team-start" />
            {teamGroups.map((group, i) => (
                <CyberSection key={i} group={group} index={i} />
            ))}

            {/* Thank You Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="py-32 bg-gradient-to-br from-gray-900/80 via-gray-900 to-blue-900/30 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-gray-900/30" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.h2
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-5xl font-bold mb-8 font-mono tracking-tighter
                       text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
                    >
                        <span className="text-shadow-cyan">SYSTEM ACKNOWLEDGED</span>
                    </motion.h2>

                    <motion.p
                        initial={{ y: 30 }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-mono"
                    >
                        GRATITUDE PROTOCOL INITIATED. THIS OPERATION WOULD BE IMPOSSIBLE WITHOUT THE NEURAL CONTRIBUTIONS OF EACH UNIT.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-16"
                    >
                        <CyberButton onClick={scrollToTop}>
                            RETURN TO ORIGIN
                        </CyberButton>
                    </motion.div>
                </div>
            </motion.section>

            {/* Add these styles for the cyber effects */}
            <style jsx global>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(10, 235, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 235, 255, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        .bg-grid-animated {
          background-image: 
            linear-gradient(to right, rgba(10, 235, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 235, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridScroll 100s linear infinite;
        }
        
        @keyframes gridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 1000px 1000px; }
        }
        
        .text-shadow-cyan {
          text-shadow: 0 0 10px rgba(10, 235, 255, 0.5);
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
        </div>
    );
}