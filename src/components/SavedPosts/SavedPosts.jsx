import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../../Context/UserContext";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
import { FiBookmark, FiTrash2, FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchSavedPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "https://knowledge-sharing-pied.vercel.app/interaction/saved_posts",
        {
          headers: {
            token: user?.token,
          },
        }
      );
      // Filter out any null or invalid posts
      const validPosts = response.data.filter(
        post => post && post._id && (post.title || post.content)
      );
      setSavedPosts(validPosts);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to load saved posts.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (postId) => {
    try {
      await axios.delete(
        `https://knowledge-sharing-pied.vercel.app/interaction/unsave/${postId}`,
        {
          headers: {
            token: user?.token,
          },
        }
      );
      toast.success("Post unsaved successfully");
      setSavedPosts(savedPosts.filter(post => post._id !== postId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unsave post");
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  useEffect(() => {
    if (user?.token) {
      fetchSavedPosts();
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <FiBookmark className="text-indigo-600 text-2xl mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Saved Posts</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <ThreeDots
            height="60"
            width="60"
            radius="9"
            color="#6366f1"
            ariaLabel="three-dots-loading"
            visible={true}
          />
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center"
        >
          {error}
        </motion.div>
      ) : savedPosts.length > 0 ? (
        <motion.ul className="space-y-4">
          <AnimatePresence>
            {savedPosts.map((post) => (
              post && ( // Additional null check
                <motion.li
                  key={post._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {post.title || "Untitled Post"}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {post.content || "No content available"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnsave(post._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        aria-label="Unsave post"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Unknown date"}
                      </span>
                      <button
                        onClick={() => handleViewPost(post._id)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
                      >
                        View post <FiArrowRight className="ml-1" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              )
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center"
        >
          <FiBookmark className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No saved posts yet</h3>
          <p className="text-gray-500">Posts you save will appear here</p>
        </motion.div>
      )}
    </div>
  );
};

export default SavedPosts;