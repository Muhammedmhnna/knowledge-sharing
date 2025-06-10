import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThreeDots } from "react-loader-spinner";
import { FiFlag, FiUsers, FiShoppingBag, FiUserPlus, FiLogOut, FiX, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import FlaggedPosts from "../FlaggedPosts/FlaggedPosts.jsx";
import AddProduct from "../AddProduct/AddProduct.jsx";
import AllNationalIds from "../AllNationalIds/AllNationalIds.jsx";
import AllProducts from "../AllProducts/AllProducts.jsx";
import { useAdmin } from "../../Context/AdminContext.jsx";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const { admin, clearAdmin } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("flagged");
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const token = admin?.token;

  const buttonClass = (tabName) =>
    `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 ${activeTab === tabName ? "bg-white text-indigo-600 shadow-md font-medium" : "text-gray-700"
    }`;

  const handleAddAdmin = async () => {
    try {

      const response = await axios.post(
        "https://knowledge-sharing-pied.vercel.app/admin/createAdmin",
        { email, name },
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("Admin created successfully!");
      setShowModal(false);
      setEmail("");
      setName("");
    } catch (error) {
      toast.error("Failed to create admin. Please check the data.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-indigo-600 p-4 flex flex-col fixed left-0 top-0 bottom-0 transition-all duration-300 z-10`}>
        <div className="flex items-center justify-between mb-8">
          {!isSidebarCollapsed && <h2 className="text-2xl font-bold text-white">Admin Panel</h2>}
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
          title="Logout"
        >
          <FiLogOut className="text-lg" />
          {!isSidebarCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === "flagged" && "Flagged Posts Management"}
              {activeTab === "allIds" && "National ID Verification"}
              {activeTab === "allProducts" && "Products Catalog"}
            </h1>
            <p className="text-gray-500">
              {activeTab === "flagged" && "Review and manage reported content"}
              {activeTab === "allIds" && "Verify and manage user identities"}
              {activeTab === "allProducts" && "Manage your product inventory"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {activeTab === "flagged" && <FlaggedPosts />}
            {activeTab === "allIds" && <AllNationalIds />}
            {activeTab === "allProducts" && <AllProducts />}
          </div>
        </div>
      </div>

      {/* Modal */}
      {
        showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-96 shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Admin</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAdmin}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
                >
                  Add Admin
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Toast Messages */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName="rounded-lg shadow-lg"
        progressClassName="bg-indigo-600"
      />
    </div >
  );
}