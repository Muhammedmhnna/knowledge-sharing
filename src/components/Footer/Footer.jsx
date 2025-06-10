import React from "react";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaRegEnvelope,
  FaShieldAlt,
  FaCode
} from "react-icons/fa";

const Footer = () => {
  const footerLinks = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Blog", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Policy", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "API Status", href: "#" },
        { name: "Help Center", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FaGithub />, name: "GitHub", href: "#" },
    { icon: <FaTwitter />, name: "Twitter", href: "#" },
    { icon: <FaLinkedin />, name: "LinkedIn", href: "#" },
    { icon: <FaRegEnvelope />, name: "Email", href: "#" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8 lg:px-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                AH
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Accessible Health
              </span>
            </motion.div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Making healthcare information accessible to everyone, everywhere.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4 pt-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-500 hover:text-indigo-600 text-lg transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <motion.li
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-indigo-600 text-sm transition-colors flex items-center"
                    >
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Stay Updated
            </h3>
            <p className="text-gray-600 text-sm">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form className="mt-2 space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4 md:mb-0">
            <FaShieldAlt className="text-indigo-500" />
            <span>Your data is always secure with us</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <FaCode className="text-indigo-500" />
              <span>Open-source friendly</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <FaHeart className="text-red-500 animate-pulse" />
              <span>Made with love</span>
            </div>
          </div>

          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            © {new Date().getFullYear()} Accessible Health Hub. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;