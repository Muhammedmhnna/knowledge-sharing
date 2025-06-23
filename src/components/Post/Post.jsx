import React, { useEffect, useRef, useState } from "react";
import CategoriesSidebar from "../CategoriesSidebar/CategoriesSidebar.jsx";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import {
  FaFilePdf,
  FaRegCommentDots,
  FaBookmark,
  FaEdit,
  FaSearch,
  FaMicrophoneSlash,
  FaMicrophone,
  FaTimes,
  FaVolumeUp,
  FaPlus,
  FaFileAlt,
  FaDownload,
  FaEllipsisV,
  FaUserCircle,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { BiSolidLike } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../Context/UserContext";
import ChatPopup from "../ChatPopup/ChatPopup.jsx";

export default function Post() {
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [tempSaved, setTempSaved] = useState({});
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [comments, setComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [saveCounts, setSaveCounts] = useState({});
  const [text, setText] = useState("");
  const [parentId, setParentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const token = user?.token;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        const { data } = await axios.get(
          `https://knowledge-sharing-pied.vercel.app/post/list?page=${currentPage}&limit=${limit}`
        );

        const processedPosts = data.posts.map((post) => ({
          ...post,
          title: post.title || "Untitled Post",
          content: post.content || "",
          files: post.files || { urls: [] },
          sub_category: post.sub_category || null,
          isFlagged: post.isFlagged || false,
          comments: post.comments || []
        }));

        setPosts(processedPosts);
        setTotalPages(data.totalPages || 1);

        // Initialize comment counts by fetching for each post
        const commentCountPromises = processedPosts.map(post =>
          axios.get(`https://knowledge-sharing-pied.vercel.app/comment/${post._id}/get_count`)
        );

        const commentCountResponses = await Promise.all(commentCountPromises);
        const initialCommentCounts = {};

        commentCountResponses.forEach((response, index) => {
          const postId = processedPosts[index]._id;
          initialCommentCounts[postId] = response.data.comments_count || 0;
        });

        setCommentCounts(initialCommentCounts);

        const likesPromises = processedPosts.map((post) =>
          axios.get(
            `https://knowledge-sharing-pied.vercel.app/interaction/${post._id}/likes_count`
          )
        );

        const likesResponses = await Promise.all(likesPromises);

        const newLikeCounts = {};
        processedPosts.forEach((post, index) => {
          newLikeCounts[post._id] = {
            count: likesResponses[index].data.likes_count || 0,
            isLiked: likeCounts[post._id]?.isLiked || false,
          };
        });

        setLikeCounts(newLikeCounts);

        if (user?.token) {
          try {
            const response = await axios.get(
              "https://knowledge-sharing-pied.vercel.app/interaction/saved_posts",
              { headers: { token: user.token } }
            );

            const savedPosts = response.data.savedPosts || [];
            const savedState = {};

            savedPosts.forEach((post) => {
              savedState[post._id] = true;
            });

            setSaveCounts(savedState);
          } catch (error) {
 
          }
        }

        setIsLoading(false);
      } catch (error) {
  
        setError("Failed to load posts. Please try again later.");
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user?.token, currentPage, limit]);

  // Filter posts based on category, subcategory and search
  useEffect(() => {
    let filtered = posts;

    if (selectedSubCategory) {
      filtered = filtered.filter(
        (post) => post.sub_category?._id === selectedSubCategory._id
      );
    } else if (selectedCategory) {
      filtered = filtered.filter(
        (post) => post.sub_category?.category === selectedCategory._id
      );
    }

    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        return (
          (post.title && post.title.toLowerCase().includes(searchLower)) ||
          (post.content && post.content.toLowerCase().includes(searchLower)) ||
          (post.author?.name &&
            post.author.name.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredPosts(filtered);
  }, [selectedCategory, selectedSubCategory, posts, searchQuery]);

  // Voice Search setup
  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      toast.warn("Speech Recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success(`Searching for: ${transcript}`);
    };

    recognition.onerror = (event) => {
      toast.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast.warn("Voice search not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
      toast.info("Listening... Speak now");
    }
  };

  const VerifiedBadge = ({ author }) => {
    const isDoctor = author?.role === "doctor";

    if (!isDoctor) return null;

    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="ml-1 inline-flex items-center"
        title="Verified Doctor"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 text-green-500"
        >
          <path
            fillRule="evenodd"
            d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
      </motion.span>
    );
  };

  // Handle like post
  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error("Please login to like posts");
      navigate("/login");
      return;
    }
    if (isLoadingLike) return;
    setIsLoadingLike(true);

    const wasLiked = likeCounts[postId]?.isLiked || false;
    const currentCount = likeCounts[postId]?.count || 0;

    setLikeCounts((prev) => ({
      ...prev,
      [postId]: {
        count: wasLiked ? currentCount - 1 : currentCount + 1,
        isLiked: !wasLiked,
      },
    }));

    try {
      await axios.post(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/like`,
        {},
        { headers: { token: token } }
      );

    

      const countResponse = await axios.get(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/likes_count`
      );

      setLikeCounts((prev) => ({
        ...prev,
        [postId]: {
          count: countResponse.data.likes_count || 0,
          isLiked: !wasLiked,
        },
      }));
    } catch (error) {
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: {
          count: currentCount,
          isLiked: wasLiked,
        },
      }));
    } finally {
      setIsLoadingLike(false);
    }
  };

  // Handle save post
  const handleSavePost = async (postId, e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save posts");
      navigate("/login");
      return;
    }

    setIsLoadingSave(true);
    try {
      const response = await axios.post(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/save`,
        {},
        { headers: { token: token } }
      );

      const isSaved = response.data.Data.isSaved;

      setSaveCounts((prev) => ({
        ...prev,
        [postId]: isSaved,
      }));

      if (isSaved) {
        setTempSaved((prev) => ({
          ...prev,
          [postId]: true,
        }));

        setTimeout(() => {
          setTempSaved((prev) => ({
            ...prev,
            [postId]: false,
          }));
        }, 3000);

      } 
    } catch (error) {
      toast.error("Error saving post:", error);
    } finally {
      setIsLoadingSave(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    try {
      const postToDelete = posts.find((post) => post._id === postId);

      if (!postToDelete) {
        toast.error("Post not found");
        return;
      }

      if (postToDelete.author._id !== user?._id) {
        toast.error("You can only delete your own posts");
        return;
      }

      await axios.delete(
        `https://knowledge-sharing-pied.vercel.app/post/delete/${postId}`,
        { headers: { token: token } }
      );
    
      // Refresh posts after deletion
      const { data } = await axios.get(
        `https://knowledge-sharing-pied.vercel.app/post/list?page=${currentPage}&limit=${limit}`
      );
      setPosts(data.posts);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error("Delete post error:", error);
    }
  };

  // Comments functions
  const toggleComments = async (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    const post = posts.find(p => p._id === postId);

    if (post?.comments?.length > 0 && !comments[postId]) {
      setComments((prev) => ({
        ...prev,
        [postId]: post.comments,
      }));
      return;
    }

    if (!showComments[postId] && !comments[postId]) {
      try {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));
        const res = await axios.get(
          `https://knowledge-sharing-pied.vercel.app/comment/${postId}/get`
        );
        setComments((prev) => ({
          ...prev,
          [postId]: res.data.comments || [],
        }));
      } catch (error) {
        toast.error("Failed to load comments");
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const fetchCommentCount = async (postId) => {
    try {
      const res = await axios.get(
        `https://knowledge-sharing-pied.vercel.app/comment/${postId}/get_count`
      );
      setCommentCounts(prev => ({
        ...prev,
        [postId]: res.data.comments_count || 0
      }));
    } catch (error) {
      toast.error("Error fetching comment count:", error);
    }
  };

  // Add Comment
  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) {
      toast.error("Please login to comment");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.post(
        `https://knowledge-sharing-pied.vercel.app/comment/${postId}/add`,
        { text, parent_comment: parentId || null },
        { headers: { token: token } }
      );

      setText("");
      setParentId(null);

      // Update comment count
      await fetchCommentCount(postId);

      setComments(prev => ({
        ...prev,
        [postId]: [data.comment, ...(prev[postId] || [])],
      }));

      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error("Error adding comment:", error);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId, postId) => {
    if (!user) return;

    try {
      await axios.delete(
        `https://knowledge-sharing-pied.vercel.app/comment/${commentId}/delete`,
        { headers: { token: token } }
      );

      // Update comment count
      await fetchCommentCount(postId);

      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((comment) => comment._id !== commentId),
      }));

      toast.success("Comment deleted successfully!");
    } catch (error) {
      toast.error("Error deleting comment:", error);
    }
  };

  // Text-to-speech function
  const speakText = (title, content) => {
    if ("speechSynthesis" in window) {
      const text = `${title}. ${content}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.pitch = 1;
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.warning("Text-to-speech not supported in your browser");
    }
  };

  // Render comments
  const renderComments = (commentsArray, postId, parent = null, depth = 0) => {
    if (loadingComments[postId]) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          Loading comments...
        </div>
      );
    }

    if (!commentsArray || !Array.isArray(commentsArray)) {
      return null;
    }

    const filteredComments = commentsArray.filter(
      (c) => String(c.parent_comment) === String(parent)
    );

    if (filteredComments.length === 0 && depth === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          No comments yet. Be the first to comment!
        </div>
      );
    }

    return filteredComments.map((comment) => {
      const author = comment.author || {};

      return (
        <motion.div
          key={comment._id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-3 ${depth > 0
            ? "ml-6 pl-4 relative before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-gray-200"
            : ""
            }`}
        >
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0">
              {author.profileImage?.url ? (
                <img
                  src={author.profileImage.url}
                  alt={author.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/40";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                  {author.name?.charAt(0) || "A"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-xl p-3 relative group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        {author.name}
                      </span>
                      <VerifiedBadge author={author} />
                    </div>
                    <span className="text-xs text-gray-500 ml-2 mt-1">
                      {new Date(comment.createdAt).toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {author._id && author._id === user?._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComment(comment._id, postId);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete comment"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>

                <p className="text-md text-gray-700 mt-1">{comment.text}</p>
              </div>

              {parentId === comment._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <form
                    onSubmit={(e) => {
                      e.stopPropagation();
                      handleAddComment(e, postId);
                    }}
                    className="flex gap-2 items-center"
                  >
                    {user?.profileImage?.url ? (
                      <img
                        src={user.profileImage?.url}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <FaUserCircle className="text-gray-400 text-2xl flex-shrink-0" />
                    )}

                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-3 py-2 rounded-full text-sm hover:bg-blue-600 transition-colors flex-shrink-0"
                      disabled={!text.trim()}
                    >
                      Post
                    </button>
                  </form>
                </motion.div>
              )}

              {renderComments(commentsArray, postId, comment._id, depth + 1)}
            </div>
          </div>
        </motion.div>
      );
    });
  };

  // Post options dropdown component
  const PostOptions = ({ post }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
   
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100"
            >
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/editPost/${post._id}`);
                    setIsOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FaEdit className="mr-2" size={14} />
                  Edit Post
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePost(post._id);
                    setIsOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <FaTrash className="mr-2" size={14} />
                  Delete Post
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Pagination controls
  const PaginationControls = () => {
    return (
      <div className="flex justify-center mt-8 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-full ${currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:bg-indigo-50"
              }`}
          >
            <FaChevronLeft />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-full ${currentPage === pageNum
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-2">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-10 h-10 rounded-full ${currentPage === totalPages
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full ${currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:bg-indigo-50"
              }`}
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="ml-4 flex items-center">
          <span className="text-sm text-gray-600 mr-2">Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing limit
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-screen"
      >
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row md:gap-20 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full md:w-64 flex-shrink-0"
        >
          <CategoriesSidebar
            onCategorySelect={setSelectedCategory}
            onSubCategorySelect={setSelectedSubCategory}
          />
        </motion.div>

        <div className="flex-1 space-y-4">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center flex-1 w-full gap-2">
              <motion.div
                whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                className="flex items-center w-full bg-white rounded-lg shadow-xs border border-gray-200 hover:border-indigo-300 px-4 py-2 transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200/50"
              >
                <FaSearch className="text-gray-400 mr-3" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full border-none focus:ring-0 focus:outline-none text-sm placeholder-gray-400 bg-transparent"
                  autoFocus
                />
                {searchQuery && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                    }}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimes size={12} />
                  </motion.button>
                )}
              </motion.div>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVoiceSearch();
                }}
                className={`p-2.5 rounded-lg ${isListening
                  ? "bg-red-100 text-red-500 shadow-sm"
                  : "text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-gray-100"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FaMicrophoneSlash size={16} />
                  </motion.div>
                ) : (
                  <FaMicrophone size={16} />
                )}
              </motion.button>
            </div>

            <motion.button
              onClick={() => navigate("/addPost")}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-xs hover:shadow-sm whitespace-nowrap"
            >
              <FaPlus size={14} />
              <span>Create Post</span>
            </motion.button>
          </motion.div>

          <div className="space-y-5">
            {filteredPosts.length > 0 ? (
              <>
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{
                      y: -2,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    className="bg-white rounded-xl overflow-hidden shadow-xs border border-gray-100 transition-all duration-300 hover:border-indigo-100"
                  >
                    <div className="flex flex-col md:flex-row">
                      {post.thumbnail && (
                        <div
                          className="md:w-2/5 h-48 md:h-auto relative overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/post/${post._id}`)}
                        >
                          <motion.img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent"></div>
                        </div>
                      )}

                      <div
                        className={`${post.thumbnail ? "md:w-3/5" : "w-full"
                          } p-5`}
                      >
                        <div className="flex items-center mb-3">
                          <div
                            className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-base cursor-pointer"
                            onClick={() => navigate(`/profile/${post.author._id}`)}
                          >
                            {post.author?.profileImage.url ? (
                              <img
                                src={post.author.profileImage.url}
                                alt={post.author.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              post.author?.name?.charAt(0) || "U"
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <div
                                className="flex items-center cursor-pointer"
                                onClick={() => navigate(`/profile/${post.author._id}`)}
                              >
                                <p className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                                  {post.author?.name || "User"}
                                </p>
                                <VerifiedBadge author={post.author} />
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(post.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        {post.sub_category && (
                          <div className="mb-2">
                            <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-md">
                              {post.sub_category.name}
                            </span>
                          </div>
                        )}

                        <h2
                          className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer"
                          onClick={() => navigate(`/post/${post._id}`)}
                        >
                          {post.title}
                        </h2>

                        <div className="mb-4">
                          <p className="text-gray-600 text-lg">
                            {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                          </p>

                          {post.content.length > 200 && (
                            <button
                              onClick={() => navigate(`/post/${post._id}`)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-1 focus:outline-none"
                            >
                              Read more
                            </button>
                          )}
                        </div>
                        {post.files?.urls?.length > 0 && (
                          <div className="mb-4">
                            {post.files.urls.slice(0, 2).map((file) => (
                              <img
                                key={file._id}
                                src={file.secure_url}
                                alt={file.original_filename || "Post image"}
                                className="max-w-70 h-auto rounded mb-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(file.secure_url, "_blank");
                                }}
                                style={{ cursor: "pointer" }}
                              />
                            ))}
                          </div>
                        )}
                        <motion.button
                          whileHover={{
                            scale: 1.03,
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(post.title, post.content);
                          }}
                          className={`
    flex items-center gap-3 
    px-4 py-3 rounded-xl
    border border-indigo-200
    bg-white/80 backdrop-blur-sm
    shadow-sm hover:shadow-md
    transition-all duration-200
    text-indigo-600 hover:text-indigo-700
    mb-6 w-full sm:w-auto
  `}
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              transition: {
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut",
                              },
                            }}
                            className="relative"
                          >
                            <FaVolumeUp className="text-xl" />
                            <motion.span
                              className="absolute -left-1 -top-1 w-7 h-7 border-2 border-indigo-400 rounded-full"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.8, 0, 0.8],
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 2,
                                delay: 0.3,
                              }}
                            />
                          </motion.div>

                          <span className="font-medium text-sm sm:text-base">
                            Listen to this post
                          </span>

                          <motion.div
                            className="ml-auto hidden sm:block"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <svg
                              className="w-5 h-5 text-indigo-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </motion.div>
                        </motion.button>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-4">
                            <motion.div
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikePost(post._id);
                              }}
                              className={`flex cursor-pointer items-center gap-1 ${likeCounts[post._id]?.isLiked
                                ? "text-blue-600"
                                : "text-blue-600"
                                } ${isLoadingLike
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                                }`}
                              disabled={isLoadingLike}
                            >
                              {isLoadingLike ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <motion.div
                                    animate={{
                                      scale: likeCounts[post._id]?.isLiked
                                        ? [1, 1.2, 1]
                                        : 1,
                                      transition: { duration: 0.2 },
                                    }}
                                  >
                                    <BiSolidLike className="text-xl" />
                                  </motion.div>
                                  <span className="text-sm font-medium">
                                    {likeCounts[post._id]?.count || 0}
                                  </span>
                                </>
                              )}
                            </motion.div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleComments(post._id);
                              }}
                              className="flex items-center cursor-pointer gap-1"
                              title="Comment"
                            >
                              <FaRegCommentDots />
                              <span className="text-black">
                                {commentCounts[post._id] || 0}
                              </span>
                            </div>
                            <div
                              onClick={(e) => handleSavePost(post._id, e)}
                              className={`cursor-pointer flex items-center gap-1 ${saveCounts[post._id]
                                ? "text-green-600"
                                : "text-green-600"
                                }`}
                              title={
                                saveCounts[post._id] ? "Unsave post" : "Save post"
                              }
                            >
                              <motion.div
                                animate={{
                                  scale: saveCounts[post._id] ? [1, 1.2, 1] : 1,
                                  transition: { duration: 0.3 },
                                }}
                              >
                                <FaBookmark />
                              </motion.div>

                              {tempSaved[post._id] && saveCounts[post._id] && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="text-green-600 text-sm font-medium"
                                >
                                  Saved
                                </motion.span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {post.author?._id === user?._id && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/editPost/${post._id}`);
                                  }}
                                  className="cursor-pointer text-gray-500 hover:text-blue-800"
                                  title="Edit"
                                >
                                  <FaEdit size={20} />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(post._id);
                                  }}
                                  className="cursor-pointer text-gray-500 hover:text-red-800"
                                  title="Delete"
                                >
                                  <MdDelete size={20} />
                                </button>
                              </>
                            )}
                            <PostOptions post={post} />
                          </div>
                        </div>

                        <AnimatePresence>
                          {showComments[post._id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4"
                            >
                              <div className="border-t border-gray-200 pt-4">
                                <form
                                  onSubmit={(e) => {
                                    e.stopPropagation();
                                    handleAddComment(e, post._id);
                                  }}
                                  className="mb-4"
                                >
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={text}
                                      onChange={(e) => setText(e.target.value)}
                                      placeholder="Write a comment..."
                                      className="flex-1 text-sm border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-200"
                                      autoFocus={!parentId}
                                    />
                                    <button
                                      type="submit"
                                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                                    >
                                      Post
                                    </button>
                                  </div>
                                </form>

                                <div className="mb-4">
                                  {comments[post._id]?.length > 0 ? (
                                    renderComments(comments[post._id], post._id)
                                  ) : (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                      No comments yet. Be the first to comment!
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.article>
                ))}
                <PaginationControls />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100"
              >
                <div className="max-w-md mx-auto">
                  <div className="inline-flex p-4 bg-indigo-100 rounded-full mb-4">
                    <FaSearch className="text-indigo-600" size={20} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? "No posts found" : "No posts yet"}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try different keywords.`
                      : "Be the first to share your knowledge!"}
                  </p>
                  <button
                    onClick={() => navigate("/addPost")}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700"
                  >
                    Create Post
                  </button>
                </div>
                
              </motion.div>
            )}
          </div>
        </div>
        <ChatPopup />
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg shadow-sm border border-gray-100 text-sm"
      />
    </div>
  );
}