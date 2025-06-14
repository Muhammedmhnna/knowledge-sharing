import React, { useState, useEffect } from "react";
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

  // Real-time validation states
  const [titleError, setTitleError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [filesError, setFilesError] = useState(false);

  // Validation effects
  useEffect(() => {
    if (title.length > 0 && title.length < 5) {
      if (!titleError) {
        toast.warning("Title should be at least 5 characters", { toastId: "title-length-warning" });
        setTitleError(true);
      }
    } else if (titleError && title.length >= 5) {
      setTitleError(false);
    }
  }, [title, titleError]);

  useEffect(() => {
    if (content.length > 0 && content.length < 50) {
      if (!contentError) {
        toast.warning("Content should be at least 50 characters", { toastId: "content-length-warning" });
        setContentError(true);
      }
    } else if (contentError && content.length >= 50) {
      setContentError(false);
    }

    if (content.length > 4500) {
      toast.error("Maximum content length exceeded (5000 characters)", { toastId: "content-max-error" });
    }
  }, [content, contentError]);

  useEffect(() => {
    if (files.length > 5) {
      if (!filesError) {
        toast.error("Maximum 5 files allowed", { toastId: "files-max-error" });
        setFilesError(true);
      }
    } else if (filesError && files.length <= 5) {
      setFilesError(false);
    }
  }, [files, filesError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submit
    if (title.length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }

    if (content.length < 50) {
      toast.error("Content must be at least 50 characters");
      return;
    }

    if (content.length > 5000) {
      toast.error("Content cannot exceed 5000 characters");
      return;
    }

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
      toast.success("Post Created Successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An error occurred while creating the post. Please try again.");
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
            className={`w-full pt-6 pb-2 px-4 text-3xl font-bold border-b-2 ${titleError ? "border-red-500" : "border-gray-200"} focus:border-blue-500 focus:outline-none peer`}
          />
          <motion.label
            className="absolute left-4 top-2 text-gray-500 text-sm font-medium transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500 peer-focus:font-medium"
            layout
          >
            Post Title
          </motion.label>
          <motion.div
            className={`absolute bottom-0 left-0 w-full h-0.5 ${titleError ? "bg-red-500" : "bg-blue-500"} origin-left scale-x-0 peer-focus:scale-x-100 transition-transform duration-300`}
            initial={{ scaleX: 0 }}
            whileFocus={{ scaleX: 1 }}
          />
          {titleError && (
            <motion.p
              className="absolute -bottom-6 left-0 text-red-500 text-xs"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Minimum 5 characters required
            </motion.p>
          )}
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
            className={`w-full pt-8 pb-4 px-4 text-lg border-2 ${contentError || content.length > 4500 ? "border-red-500" : "border-gray-200"} rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 peer resize-none leading-relaxed`}
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
              color: content.length > 4500 ? "#ef4444" : contentError ? "#ef4444" : "#9ca3af",
              scale: content.length > 4500 || contentError ? [1, 1.05, 1] : 1,
            }}
            transition={{
              repeat: content.length > 4500 || contentError ? Infinity : 0,
              duration: 1,
            }}
          >
            {content.length}/5000
          </motion.div>
          {(contentError || content.length > 4500) && (
            <motion.p
              className="absolute -bottom-6 left-0 text-red-500 text-xs"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {contentError ? "Minimum 50 characters required" : "Maximum length exceeded"}
            </motion.p>
          )}
        </motion.div>

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
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -2 }}
                >
                  {file.type.includes("image") ? (
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                      {file.type.includes("pdf") ? (
                        <FaFilePdf className="text-red-500 mr-2" size={16} />
                      ) : (
                        <FaFileAlt className="text-gray-500 mr-2" size={16} />
                      )}
                      <span className="text-sm text-gray-700 truncate max-w-[100px]">
                        {file.name}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFiles(files.filter((_, i) => i !== index));
                      if (files.length === 6) {
                        toast.success("File removed - now under maximum limit");
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FaTimes size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.label
              htmlFor="files"
              className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (files.length >= 5) {
                  toast.error("Maximum 5 files allowed");
                }
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  transition: { repeat: Infinity, duration: 2 },
                }}
              >
                <FaPlus className="text-gray-400 mb-1" size={18} />
              </motion.div>
              <span className="text-xs text-gray-500">Add files</span>
            </motion.label>
            <input
              id="files"
              type="file"
              multiple
              onChange={(e) => {
                const newFiles = Array.from(e.target.files || []);
                if (files.length + newFiles.length > 5) {
                  toast.error("Maximum 5 files allowed");
                  return;
                }
                setFiles([...files, ...newFiles]);
              }}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.mp4,.mov"
            />
          </div>
          {files?.length > 0 && (
            <p className={`mt-2 text-xs ${filesError ? "text-red-500" : "text-gray-500"}`}>
              {files.length} file{files.length !== 1 ? 's' : ''} selected
              {filesError && " (Maximum 5 allowed)"}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6 flex justify-end">
          <motion.button
            type="submit"
            disabled={isLoading || titleError || contentError || filesError || content.length > 5000}
            className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-8 py-3 rounded-lg shadow-md ${isLoading || titleError || contentError || filesError || content.length > 5000
                ? "opacity-60 cursor-not-allowed"
                : "hover:shadow-lg hover:from-blue-700 hover:to-blue-600"
              }`}
            whileHover={
              !isLoading && !titleError && !contentError && !filesError && content.length <= 5000
                ? { scale: 1.03, y: -2 }
                : {}
            }
            whileTap={
              !isLoading && !titleError && !contentError && !filesError && content.length <= 5000
                ? { scale: 0.98 }
                : {}
            }
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