import React, { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import { motion } from "framer-motion";
import { FaShoppingCart, FaHeart, FaStar } from "react-icons/fa";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  useEffect(() => {
    fetch("https://knowledge-sharing-pied.vercel.app/product")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 mt-10">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-xl text-gray-500"
        >
          NO PRODUCTS AVAILABLE
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 max-w-7xl mx-auto"
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={itemVariants}
              whileHover="hover"
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative"
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="relative overflow-hidden">
                <motion.img
                  src={
                    product.productImage?.url ||
                    "https://via.placeholder.com/300"
                  }
                  alt={product.name || "Product image"}
                  className="w-full h-64 object-cover"
                  variants={imageVariants}
                  whileHover="hover"
                />
                {hoveredProduct === product._id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-2 right-2 flex space-x-2"
                  ></motion.div>
                )}
              </div>
              <div className="p-6 flex flex-col h-64">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800 line-clamp-2">
                    {truncateText(product.name, 50) || "No product name"}
                  </h2>
                  {product.rating && (
                    <div className="flex items-center bg-indigo-100 px-2 py-1 rounded-full">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                  {truncateText(product.description, 150) ||
                    "No description available"}
                </p>
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    {product.originalPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        ${product.originalPrice}
                      </p>
                    )}
                  </div>
                  <motion.a
                    href={product.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block text-center bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Buy Now
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
