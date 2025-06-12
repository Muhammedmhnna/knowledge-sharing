import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThreeDots } from "react-loader-spinner";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiExternalLink,
  FiCheck,
  FiAlertTriangle,
  FiSearch,
  FiChevronUp,
  FiChevronDown
} from "react-icons/fi";
import { useAdmin } from "../../Context/AdminContext.jsx";

const AllProducts = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    link: ""
  });
  const [productImage, setProductImage] = useState(null);

  // Popup states
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication
  const { admin, isAdminAuthenticated, clearAdmin } = useAdmin();
  const token = admin?.token;

  // API endpoint
  const API_BASE_URL = "https://knowledge-sharing-pied.vercel.app";

  // Fetch products on mount
  useEffect(() => {
    if (!isAdminAuthenticated) {
      toast.error("Admin access required");
      return;
    }
    fetchProducts();
  }, [isAdminAuthenticated]);

  // Data fetching
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/product`);
      setProducts(response.data.products);
      setError("");
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Sorting functionality
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filteredProducts = [...products];

    const safeSearchTerm = (searchTerm ?? "").toLowerCase();

    // Filter by search term
    if (searchTerm) {
      filteredProducts = filteredProducts.filter((product) =>
        (product.name ?? "").toLowerCase().includes(safeSearchTerm) ||
        (product.description ?? "").toLowerCase().includes(safeSearchTerm)
      );
    }

    // Sort products
    return filteredProducts.sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [products, searchTerm, sortConfig]);

  // Product CRUD operations
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("productImage", productImage);
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("link", newProduct.link);


    try {
      await axios.post(`${API_BASE_URL}/admin/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      });

      toast.success("Product added successfully");
      fetchProducts();
      resetForm();
    } catch (err) {
      handleApiError(err, "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!token || !productToDelete?._id) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/${productToDelete._id}`, {
        headers: {
          "Content-Type": "application/json",
          token,
        },
      });

      toast.success("Product deleted successfully");
      setProducts(products.filter(p => p._id !== productToDelete._id));
    } catch (err) {
      handleApiError(err, "Failed to delete product");
      console.log(err);

    } finally {
      setShowDeletePopup(false);
      setProductToDelete(null);
    }
  };


  const handleEditClick = (product) => {
    setProductToUpdate(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      link: product.link,
    });
    setShowUpdatePopup(true);
  };

  const confirmUpdate = async (e) => {
    e.preventDefault();
    if (!token || !productToUpdate) return;

    setIsSubmitting(true);
    const payload = {
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      link: newProduct.link,
    };

    try {
      await axios.put(
        `${API_BASE_URL}/admin/${productToUpdate._id}`,
        payload,
        { headers: { "Content-Type": "application/json", token } }
      );

      toast.success("Product updated successfully");
      fetchProducts();
      setShowUpdatePopup(false);
      setProductToUpdate(null);
    } catch (err) {
      handleApiError(err, "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const resetForm = () => {
    setShowForm(false);
    setShowUpdatePopup(false);
    setProductToUpdate(null);
    setNewProduct({ name: "", description: "", price: "", link: "" });
    setProductImage(null);
  };

  const handleApiError = (err, defaultMessage) => {
    console.error("API Error:", err);

    if (err.response?.status === 401) {
      toast.error("Session expired, please login again");
      clearAdmin();
    } else {
      toast.error(err.response?.data?.message || defaultMessage);
    }
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ?
      <FiChevronUp className="ml-1" /> :
      <FiChevronDown className="ml-1" />;
  };

  // Render states
  if (!isAdminAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Admin credentials required to access this page.
          </p>
          <button
            onClick={() => window.location.href = "/admin/login"}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0  bg-gradient-to-r from-indigo-500/30 via-purple-500/40 to-blue-500/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiAlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                Delete Product
              </h3>
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowDeletePopup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Confirmation Popup */}
      {showUpdatePopup && (
        <div className="fixed inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/40 to-blue-500/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 animate-fade-in">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Update Product</h3>
              <button
                onClick={() => setShowUpdatePopup(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Product Preview */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={`${productToUpdate?.productImage?.url}?t=${new Date().getTime()}`}
                  alt={productToUpdate?.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{productToUpdate?.name}</h4>
                  <p className="text-sm text-gray-500">${productToUpdate?.price}</p>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={confirmUpdate} className="space-y-4">
              <div className="flex gap-5">

                {/* Left Column */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, description: e.target.value })
                      }
                      required
                      minLength={10}
                      maxLength={500}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={newProduct.link}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, link: e.target.value })
                      }
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpdatePopup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-1" size={16} />
                      Confirm Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Product Inventory</h1>
            <p className="text-gray-600">
              {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? "product" : "products"} found
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              {showForm ? <FiX size={18} /> : <FiPlus size={18} />}
              {showForm ? "Cancel" : "Add Product"}
            </button>
          </div>
        </div>

        {/* Add/Edit Product Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {productToUpdate ? "Edit Product" : "Add New Product"}
              </h2>

              <form onSubmit={productToUpdate ? confirmUpdate : handleAddProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Image {!productToUpdate && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProductImage(e.target.files[0])}
                            required={!productToUpdate}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id="productImage"
                          />
                          <label
                            htmlFor="productImage"
                            className="block w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-indigo-500 transition"
                          >
                            {productImage ? (
                              <span className="text-indigo-600 font-medium">
                                {productImage.name}
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                {productToUpdate ? "Change image (not supported)" : "Click to upload image"}
                              </span>
                            )}
                          </label>
                        </div>
                        {productToUpdate && productImage === null && (
                          <img
                            src={`${productToUpdate.productImage?.url}?t=${new Date().getTime()}`}
                            alt="Current product"
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                        minLength={2}
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        required
                        minLength={10}
                        maxLength={500}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Link <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={newProduct.link}
                        onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-200 min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : productToUpdate ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Product
                      {getSortIndicator("name")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      {getSortIndicator("price")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedProducts.length > 0 ? (
                  filteredAndSortedProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={`${product.productImage?.url}?t=${new Date().getTime()}`}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-indigo-600 hover:text-indigo-800"
                              >
                                <FiExternalLink className="mr-1" size={14} />
                                View Product
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          ${product.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No products found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;