import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaSearch, FaTimes } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";
import debounce from "lodash.debounce";

const CategoriesSidebar = ({ onCategorySelect, onSubCategorySelect }) => {
  // State management
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({
    category: null,
    subCategory: null,
  });
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Color scheme
  const colors = {
    primary: "#4F46E5",
    secondary: "#10B981",
    accent: "#F59E0B",
    background: "#F9FAFB",
    card: "#FFFFFF",
    text: "#1F2937",
    muted: "#6B7280",
    hover: "#EDE9FE",
    selected: "#E0E7FF",
  };

  // Memoized data processing
  const getSubCategories = useCallback(
    (categoryId) => {
      return subCategories.filter((subCat) => subCat.category === categoryId);
    },
    [subCategories]
  );

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return categories.map(category => ({
        ...category,
        isCategory: true,
        subCategories: getSubCategories(category._id)
      }));
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Filter categories
    const filteredCats = categories.filter(category =>
      category.name.toLowerCase().includes(lowerSearchTerm)
    );
    
    // Filter subcategories
    const filteredSubCats = subCategories.filter(subCat =>
      subCat.name.toLowerCase().includes(lowerSearchTerm)
    );

    // Combine results
    const result = [];
    
    // Add matching categories with their subcategories
    filteredCats.forEach(category => {
      result.push({
        ...category,
        isCategory: true,
        subCategories: getSubCategories(category._id)
      });
    });

    // Add parent categories of matching subcategories
    filteredSubCats.forEach(subCat => {
      const parentCategory = categories.find(cat => cat._id === subCat.category);
      if (parentCategory && !result.some(item => item._id === parentCategory._id)) {
        result.push({
          ...parentCategory,
          isCategory: true,
          subCategories: getSubCategories(parentCategory._id)
        });
      }
    });

    // Mark which categories should be expanded
    const newExpanded = new Set();
    filteredSubCats.forEach(subCat => {
      newExpanded.add(subCat.category);
    });
    setExpandedCategories(newExpanded);

    return result;
  }, [categories, subCategories, searchTerm, getSubCategories]);

  // API data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, subCategoriesRes] = await Promise.all([
          axios.get("https://knowledge-sharing-pied.vercel.app/category/get"),
          axios.get("https://knowledge-sharing-pied.vercel.app/sub_category/get"),
        ]);

        setCategories(categoriesRes.data.data);
        setSubCategories(subCategoriesRes.data.data);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handlers
  const toggleCategory = (categoryId) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleCategorySelect = (category) => {
    setSelectedItems({
      category,
      subCategory: null,
    });
    if (onCategorySelect) onCategorySelect(category);
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedItems((prev) => ({
      ...prev,
      subCategory,
    }));
    if (onSubCategorySelect) onSubCategorySelect(subCategory);
  };

  const clearAllFilters = () => {
    setSelectedItems({ category: null, subCategory: null });
    if (onCategorySelect) onCategorySelect(null);
    if (onSubCategorySelect) onSubCategorySelect(null);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setExpandedCategories(new Set());
  };

  // Debounced search
  const handleSearchChange = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <ThreeDots
          visible={true}
          height="80"
          width="80"
          color={colors.primary}
          ariaLabel="loading"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full md:w-80 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col"
    >
      {/* Search bar with clear button */}
      <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search categories or subcategories..."
            className="block w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
            defaultValue={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Clear search"
            >
              <FaTimes className="text-gray-400 hover:text-gray-600 text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Categories list */}
      <div className="overflow-y-auto flex-1">
        {filteredItems.length > 0 ? (
          <ul>
            {filteredItems.map((item) => (
              <li
                key={item._id}
                className="border-b border-gray-100 last:border-0"
              >
                {/* Category header */}
                <motion.div
                  whileHover={{ backgroundColor: colors.hover }}
                  className={`px-4 py-3 flex justify-between items-center cursor-pointer transition-colors ${
                    selectedItems.category?._id === item._id
                      ? "bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => {
                    toggleCategory(item._id);
                    handleCategorySelect(item);
                  }}
                >
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {selectedItems.category?._id === item._id && (
                      <span className="ml-2 w-2 h-2 rounded-full bg-indigo-500"></span>
                    )}
                  </div>
                  {item.subCategories.length > 0 && (
                    expandedCategories.has(item._id) || activeCategory === item._id ? (
                      <FaChevronUp className="text-gray-500 text-sm" />
                    ) : (
                      <FaChevronDown className="text-gray-500 text-sm" />
                    )
                  )}
                </motion.div>

                {/* Subcategories with animation */}
                <AnimatePresence>
                  {(expandedCategories.has(item._id) || activeCategory === item._id) && item.subCategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <ul className="pl-8 pb-2">
                        {item.subCategories.map((subCat) => (
                          <motion.li
                            key={subCat._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`py-2 text-sm cursor-pointer transition-colors ${
                              selectedItems.subCategory?._id === subCat._id
                                ? "text-indigo-600 font-medium bg-indigo-50 px-2 rounded"
                                : "text-gray-600 hover:text-indigo-600"
                            }`}
                            onClick={() => handleSubCategorySelect(subCat)}
                          >
                            {subCat.name}
                            {selectedItems.subCategory?._id === subCat._id && (
                              <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            )}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-40">
            <FaSearch className="text-gray-300 text-2xl mb-2" />
            <p>No categories found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try a different search term
            </p>
          </div>
        )}
      </div>

      {/* Selected items summary */}
      {(selectedItems.category || selectedItems.subCategory) && (
        <div className="border-t border-gray-100 p-3 bg-gray-50 text-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-500 mb-1">Selected:</div>
              {selectedItems.category && (
                <div className="font-medium text-gray-700">
                  {selectedItems.category.name}
                </div>
              )}
              {selectedItems.subCategory && (
                <div className="text-gray-600 ml-2">
                  → {selectedItems.subCategory.name}
                </div>
              )}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

CategoriesSidebar.defaultProps = {
  onCategorySelect: () => {},
  onSubCategorySelect: () => {}
};

export default React.memo(CategoriesSidebar);