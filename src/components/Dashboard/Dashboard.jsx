import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThreeDots } from "react-loader-spinner";
import { FiFlag, FiUsers, FiShoppingBag, FiUserPlus, FiLogOut, FiX, FiChevronRight, FiChevronLeft, FiMenu, FiCheckCircle } from "react-icons/fi";
import FlaggedPosts from "../FlaggedPosts/FlaggedPosts.jsx";
import AllNationalIds from "../AllNationalIds/AllNationalIds.jsx";
import AllProducts from "../AllProducts/AllProducts.jsx";
import { useAdmin } from "../../Context/AdminContext.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const { admin, clearAdmin } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("flagged");
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const token = admin?.token;

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "Email is required.";
    if (!emailRegex.test(value)) return "Please enter a valid email address.";
    return "";
  };


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const buttonClass = (tabName) =>
    `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 ${activeTab === tabName
      ? "bg-white text-indigo-600 shadow-md font-medium"
      : "text-gray-100 hover:text-white"
    }`;

  const handleAddAdmin = async () => {
    const error = validateEmail(email);
    setEmailTouched(true);
    setEmailError(error);
    if (error) return;

    try {
      const response = await axios.post(
        "https://knowledge-sharing-pied.vercel.app/admin/createAdmin",
        { email, name },
        { headers: { token: token } }
      );

      setShowSuccess(true); // Show success message

      // Delay for 2 seconds before closing
      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);
        handleClearAdminForm();
        setEmailError("");
        setEmailTouched(false);
      }, 2000);

    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to create administrator. Please check data.";
      setEmailError(errorMsg);
    }
  };


  const handleClearAdminForm = async () => {
    setEmail("");
    setName("");
  }




  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans relative">
      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-indigo-600 shadow-md">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white">Control Panel</h1>

          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 text-white focus:outline-none"
            aria-label="Menu"
          >
            {isMobileNavOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMobileNavOpen && (
          <div className="bg-white shadow-lg rounded-b-lg">
            <nav className="flex flex-col space-y-1 p-2">
              <button
                onClick={() => {
                  setActiveTab("flagged");
                  setIsMobileNavOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg ${activeTab === "flagged" ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-indigo-50"}`}
              >
                <FiFlag className="text-lg" />
                <span>Flagged Posts</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("allIds");
                  setIsMobileNavOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg ${activeTab === "allIds" ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-indigo-50"}`}
              >
                <FiUsers className="text-lg" />
                <span> National IDs</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("allProducts");
                  setIsMobileNavOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg ${activeTab === "allProducts" ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-indigo-50"}`}
              >
                <FiShoppingBag className="text-lg" />
                <span>Products</span>
              </button>

              <button
                onClick={() => {
                  setShowModal(true);
                  setIsMobileNavOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50"
              >
                <FiUserPlus className="text-lg" />
                <span>Add Admin</span>
              </button>

              <button
                onClick={() => {
                  clearAdmin();
                  navigate("/admin/login");
                }}
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50"
              >
                <FiLogOut className="text-lg" />
                <span>Log Out</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={`hidden md:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
                   bg-indigo-600 p-4 flex-col fixed left-0 top-0 bottom-0 
                   transition-all duration-300 z-20 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-8">
          {!isSidebarCollapsed && <h2 className="text-2xl font-bold text-white">Control Panel</h2>}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-full hover:bg-indigo-700 text-white"
          >
            <FiChevronLeft className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("flagged")}
            className={buttonClass("flagged") + " w-full text-left"}
            title="Flagged Posts"
          >
            <FiFlag className="text-lg" />
            {!isSidebarCollapsed && <span>Flagged Posts</span>}
          </button>

          <button
            onClick={() => setActiveTab("allIds")}
            className={buttonClass("allIds") + " w-full text-left"}
            title="National IDs"
          >
            <FiUsers className="text-lg" />
            {!isSidebarCollapsed && <span>National IDs</span>}
          </button>

          <button
            onClick={() => setActiveTab("allProducts")}
            className={buttonClass("allProducts") + " w-full text-left"}
            title="Products"
          >
            <FiShoppingBag className="text-lg" />
            {!isSidebarCollapsed && <span>Products</span>}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 p-3 rounded-lg w-full text-left text-gray-100 hover:bg-indigo-700 transition-colors duration-200"
            title="Add Admin"
          >
            <FiUserPlus className="text-lg" />
            {!isSidebarCollapsed && <span>Add Admin</span>}
          </button>
        </nav>

        <button
          onClick={() => {
            clearAdmin();
            navigate("/admin/login");
          }}
          className="flex items-center gap-3 p-3 rounded-lg text-left text-gray-100 hover:bg-indigo-700 transition-colors duration-200 mt-auto"
          title="Log Out"
        >
          <FiLogOut className="text-lg" />
          {!isSidebarCollapsed && <span>Log Out</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-4 md:p-6 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        } mt-16 md:mt-0`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              {activeTab === "flagged" && "Manage flagged posts"}
              {activeTab === "allIds" && "Verify national identities"}
              {activeTab === "allProducts" && "Product Registry"}
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              {activeTab === "flagged" && "Review and manage flagged content"}
              {activeTab === "allIds" && "Verify and manage user identities"}
              {activeTab === "allProducts" && "Manage your product inventory"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            {activeTab === "flagged" && <FlaggedPosts />}
            {activeTab === "allIds" && <AllNationalIds />}
            {activeTab === "allProducts" && <AllProducts />}
          </div>
        </div>
      </div>

      {/* Modal - Add Admin */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/40 to-blue-500/50 flex items-center justify-center z-50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white p-6 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-100"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Admin</h2>
                <p className="text-sm text-gray-500 mt-1">Enter admin details below</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Email Address <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailTouched) {
                        setEmailError(validateEmail(e.target.value));
                      }
                    }}
                    onBlur={() => {
                      setEmailTouched(true);
                      setEmailError(validateEmail(email));
                    }}
                    className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 transition-all ${emailError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      }`}
                    required
                  />

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
                {showSuccess && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-600 bg-green-100 px-4 py-2 rounded-lg animate-fade-in">
                    <FiCheckCircle className="w-5 h-5" />
                    <span>Admin created successfully!</span>
                  </div>
                )}

                {emailTouched && emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Full Name <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>



            {/* Modal Footer */}
            <div className="mt-8 flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleClearAdminForm();
                  setShowModal(false);
                }}

                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddAdmin}
                disabled={!email || !name}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-sm ${!email || !name
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
              >
                Add Admin
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Messages */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName="rounded-lg shadow-lg"
        progressClassName="bg-indigo-600"
        rtl={true}
      />
    </div>
  );
}