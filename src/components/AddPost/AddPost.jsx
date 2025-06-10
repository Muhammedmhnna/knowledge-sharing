import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaTrash,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaPlus,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";
import { useUser } from "../../Context/UserContext.jsx";
import { ClipLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function AddPost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const token = user?.token;
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length > 5) {
      toast.error("You can upload a maximum of 5 files.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    files.forEach((file) => formData.append("files", file));

    try {
      setIsLoading(true);
      const response = await axios.post(
        "https://knowledge-sharing-pied.vercel.app/post/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: token,
          },
        }
      );

      navigate("/post");
      toast.success("Post Created!");
    } catch (error) {
      console.error("Error creating post:", error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error("invalid information , please try again");
      } else {
        toast.error(
          "An error occurred while creating the post. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-5 p-6 min-h-screen bg-white rounded-xl shadow-sm border border-gray-100 mt-8 mb-12 md:mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title Input with Enhanced Floating Label */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <input
            type="text"
            placeholder=" "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full pt-6 pb-2 px-4 text-3xl font-bold border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none peer"
          />
          <motion.label
            className="absolute left-4 top-2 text-gray-500 text-sm font-medium transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500 peer-focus:font-medium"
            layout
          >
            Post Title
          </motion.label>
          <motion.div
            className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 origin-left scale-x-0 peer-focus:scale-x-100 transition-transform duration-300"
            initial={{ scaleX: 0 }}
            whileFocus={{ scaleX: 1 }}
          />
        </motion.div>

        {/* Content Editor with Floating Label */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <textarea
            placeholder=" "
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full pt-8 pb-4 px-4 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 peer resize-none leading-relaxed"
          />
          <motion.label
            className="absolute left-4 top-2 text-gray-500 text-sm font-medium transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500 peer-focus:font-medium"
            layout
          >
            Your Story
          </motion.label>
          <motion.div
            className="absolute bottom-3 right-3 text-gray-400 text-sm"
            animate={{
              color: content.length > 4500 ? "#ef4444" : "#9ca3af",
              scale: content.length > 4500 ? [1, 1.05, 1] : 1,
            }}
            transition={{
              repeat: content.length > 4500 ? Infinity : 0,
              duration: 1,
            }}
          >
            {content.length}/5000
          </motion.div>
        </motion.div>

        {/* Media Upload Section */}
        <div className="space-y-6">
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Featured Image
            </label>
            <div className="flex items-center gap-4">
              <motion.label
                htmlFor="thumbnail"
                className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {thumbnail ? (
                  <>
                    <img
                      src={URL.createObjectURL(thumbnail)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <motion.div
                      className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <FaCamera className="text-white text-xl" />
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{
                        y: [0, -3, 0],
                        transition: { repeat: Infinity, duration: 2 },
                      }}
                    >
                      <FaCamera className="text-gray-400 text-xl mb-2" />
                    </motion.div>
                    <span className="text-xs text-gray-500 text-center px-2">
                      Upload Thumbnail
                    </span>
                  </>
                )}
              </motion.label>
              <AnimatePresence>
                {thumbnail && (
                  <motion.button
                    type="button"
                    onClick={() => setThumbnail(null)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaTrash size={14} />
                    Remove
                  </motion.button>
                )}
              </AnimatePresence>
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Attachments (PDF, Images, Videos)
            </label>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {files?.map((file, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ y: -2 }}
                  >
                    {file.type.includes("pdf") ? (
                      <FaFilePdf className="text-red-500 mr-2" />
                    ) : file.type.includes("image") ? (
                      <FaFileImage className="text-blue-500 mr-2" />
                    ) : (
                      <FaFileAlt className="text-gray-500 mr-2" />
                    )}
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(files.filter((_, i) => i !== index));
                      }}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTimes size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.label
                htmlFor="files"
                className="flex items-center justify-center w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 2 },
                  }}
                >
                  <FaPlus className="text-gray-400" />
                </motion.div>
              </motion.label>
              <input
                id="files"
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 flex justify-end">
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-8 py-3 rounded-lg shadow-md ${
              isLoading
                ? "opacity-80 cursor-not-allowed"
                : "hover:shadow-lg hover:from-blue-700 hover:to-blue-600"
            }`}
            whileHover={!isLoading ? { scale: 1.03, y: -2 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <ClipLoader size={18} color="#fff" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{
                    x: [0, 5, 0],
                    transition: { repeat: Infinity, duration: 2 },
                  }}
                >
                  <FaPaperPlane size={16} />
                </motion.div>
                <span>Publish Post</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg shadow-lg border border-gray-100"
      />
    </motion.div>
  );
}
