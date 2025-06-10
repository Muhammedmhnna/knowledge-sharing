import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThreeDots } from "react-loader-spinner";
import { useAdmin } from "../../Context/AdminContext.jsx";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    link: "",
  });
  const [productImage, setProductImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { admin, isAdminAuthenticated, clearAdmin } = useAdmin();
  const token = admin?.token;

  useEffect(() => {
    if (!isAdminAuthenticated) {
      toast.error("Admin access required");
      return;
    }
    fetchProducts();
  }, [isAdminAuthenticated]);

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get("https://knowledge-sharing-pied.vercel.app/product")
      .then((res) => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products.");
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      await axios.delete(
        `https://knowledge-sharing-pied.vercel.app/admin/${id}`,
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("Product deleted successfully");
      setProducts(products.filter((product) => product._id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired, please login again");
        clearAdmin();
      } else {
        toast.error(err?.response?.data?.message || "Failed to delete product");
      }
    }
  };

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
      await axios.post(
        "https://knowledge-sharing-pied.vercel.app/admin/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",

            token: token,
          },
        }
      );

      toast.success("Product added successfully");
      fetchProducts();
      resetForm();
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired, please login again");
        clearAdmin();
      } else {
        toast.error(err?.response?.data?.message || "Failed to add product");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      link: product.link,
    });
    setShowForm(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsSubmitting(true);

    if (productImage) {
      toast.error("Updating product image is not supported");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      link: newProduct.link,
    };

    try {
      await axios.put(
        `https://knowledge-sharing-pied.vercel.app/admin/${editingProduct._id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );

      toast.success("Product updated successfully");

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === editingProduct._id
            ? {
                ...product,
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                link: newProduct.link,
              }
            : product
        )
      );

      resetForm();
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        toast.error("Session expired, please login again");
        clearAdmin();
      } else {
        toast.error(err?.response?.data?.message || "Failed to update product");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setNewProduct({ name: "", description: "", price: "", link: "" });
    setProductImage(null);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">
          Admin access required. Please login.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeDots height="80" width="80" color="#000" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      <button
        onClick={() => (editingProduct ? resetForm() : setShowForm(!showForm))}
        className="mb-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
      >
        {showForm ? "Close Form" : "Add New Product"}
      </button>

      {showForm && (
        <form
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          className="mb-8 p-6 bg-white rounded-lg shadow-md"
        >
          <h2 className="text-xl font-bold mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block mb-2 font-medium">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProductImage(e.target.files[0])}
                required={!editingProduct}
                className="w-full p-2 border rounded"
              />
              {editingProduct && productImage === null && (
                <img
                  src={`${
                    editingProduct.productImage?.url
                  }?t=${new Date().getTime()}`}
                  alt="Current product"
                  className="w-20 h-20 object-cover mt-2 border rounded"
                />
              )}
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                minLength={2}
                maxLength={50}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Description</label>
              <textarea
                className="w-full p-2 border rounded"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                minLength={10}
                maxLength={500}
                rows={3}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Price ($)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                min={0.01}
                step="0.01"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Product Link</label>
              <input
                type="url"
                className="w-full p-2 border rounded"
                value={newProduct.link}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, link: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition"
            >
              {isSubmitting
                ? "Processing..."
                : editingProduct
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
          >
            <img
              src={`${product.productImage?.url}?t=${new Date().getTime()}`}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
              <p className="text-lg font-bold mb-4">${product.price}</p>

              <div className="flex flex-col gap-2">
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600 transition"
                >
                  View Product
                </a>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 flex-1 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 flex-1 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
