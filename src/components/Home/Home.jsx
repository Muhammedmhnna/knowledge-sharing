import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomePic from "../../assets/images/homepic.jpg";
import About from "../About/About";
import Card from "../Card/Card";
import ChatPopup from "../ChatPopup/ChatPopup"; // سيتم استخدامه كمركب مستقل

export default function Home() {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  // Navigation handlers
  const goToKnowledgeCorner = () => navigate("/post");
  const goToChatPage = () => navigate("/chatbot");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98
    }
  };

  const titleHoverVariants = {
    hover: {
      color: ["#111827", "#1e40af", "#111827"],
      transition: { duration: 1, repeat: Infinity }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative"
    >
      {/* Main Hero Section */}
      <div className="bg-white min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 mb-[-1px]">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Text Content */}
          <motion.div
            variants={itemVariants}
            className="md:w-1/2 text-center md:text-left space-y-6"
          >
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
              whileHover={titleHoverVariants.hover}
            >
              Connect, <br className="hidden sm:block" /> Learn & Empower
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-gray-600 text-lg md:text-xl"
            >
              Empowering Individuals with Disabilities Through Technology.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <motion.button
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-full shadow-lg hover:bg-blue-700 transition-all"
                onClick={goToKnowledgeCorner}
              >
                Start Reading
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                className="px-8 py-3 bg-emerald-600 text-white text-lg font-medium rounded-full shadow-lg hover:bg-emerald-700 transition-all relative"
                onClick={goToChatPage}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Your Smart Assistant
                {isHovering && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.span>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            variants={itemVariants}
            className="md:w-1/2 flex justify-center"
            whileHover={{ scale: 1.02 }}
          >
            <motion.img
              src={HomePic}
              alt="Empowering through technology"
              className="max-w-md w-full h-auto object-contain mix-blend-multiply"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>
        </div>
      </div>

      {/* سيتم إضافة زر الدردشة العائم من خلال المكون المستقل */}
      <ChatPopup />

      {/* Page Sections */}
      <About />
      <Card />
    </motion.div>
  );
}