import React, { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import { motion } from "framer-motion";
import { FaShoppingCart, FaStar, FaSearch, FaBoxOpen } from "react-icons/fa";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    fetch("https://knowledge-sharing-pied.vercel.app/product")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3,
      },
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto mb-12"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20"
        >
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaBoxOpen className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-2xl font-medium text-gray-700 mb-2">
            {searchTerm ? "No matching products found" : "No Products Available"}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm
              ? "Try a different search term"
              : "We couldn't find any products. Please check back later."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Clear search
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-center mb-8"
          >
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            {searchTerm && ` for "${searchTerm}"`}
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                whileHover="hover"
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 relative group border border-gray-100 flex flex-col h-full" // Added flex-col and h-full
              >
                {/* Product Image with fixed aspect ratio */}
                <div className="relative overflow-hidden aspect-square">
                  <motion.img
                    src={product.productImage?.url || "https://via.placeholder.com/300"}
                    alt={product.name || "Product image"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    variants={imageVariants}
                  />
                  {/* Badges remain the same */}
                </div>

                {/* Product Details - now uses flex-grow */}
                <div className="p-5 flex flex-col flex-grow"> {/* Added flex-grow */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                      {product.name || "No product name"}
                    </h3>
                    {product.rating && (
                      <div className="flex items-center bg-indigo-50 px-2 py-1 rounded-full">
                        <FaStar className="text-yellow-400 text-sm mr-1" />
                        <span className="text-xs font-medium">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow"> {/* Added flex-grow */}
                    {product.description || "No description available"}
                  </p>

                  {/* Price Section */}
                  <div className="flex items-center mb-4">
                    {/* Price content remains the same */}
                  </div>

                  {/* Action Button */}
                  <motion.a
                    href={product.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 text-center text-sm font-medium shadow-sm"
                  >
                    Buy Now
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}