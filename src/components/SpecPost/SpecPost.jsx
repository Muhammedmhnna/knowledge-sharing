import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaBookmark,
  FaEdit,
  FaFilePdf,
  FaRegCommentDots,
  FaSearch,
  FaMicrophoneSlash,
  FaMicrophone,
  FaTimes,
  FaVolumeUp,
  FaUserCircle,
  FaReply,
  FaTrash,
  FaEllipsisV,
  FaPlus,
} from "react-icons/fa";
import { BiSolidLike } from "react-icons/bi";
import { ThreeDots } from "react-loader-spinner";
import { MdDelete } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../Context/UserContext";

export default function SpecPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [likeCounts, setLikeCounts] = useState({});
  const [saveCounts, setSaveCounts] = useState({});
  const [comments, setComments] = useState({});
  const [text, setText] = useState("");
  const [parentId, setParentId] = useState(null);
  const [showComments, setShowComments] = useState({});
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const { user } = useUser();
  const token = user?.token;

  // Load interactions from localStorage
  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likes")) || {};
    const storedSaves = JSON.parse(localStorage.getItem("saves")) || {};

    const storedShowComments =
      JSON.parse(localStorage.getItem("showComments")) || {};

    const storedComments = JSON.parse(localStorage.getItem("comments")) || {};

    setLikeCounts(storedLikes);
    setSaveCounts(storedSaves);

    setShowComments(storedShowComments);

    setComments(storedComments);

    // Load saved posts from server if user is logged in
    const loadSavedPosts = async () => {
      try {
        if (token) {
          const response = await axios.get(
            "https://knowledge-sharing-pied.vercel.app/interaction/saved_posts",
            {
              headers: {
                token: token,
              },
            }
          );

          const savedPosts = response.data.savedPosts || [];
          const savedState = {};
          savedPosts.forEach((post) => {
            savedState[post._id] = true;
          });

          setSaveCounts((prev) => ({ ...prev, ...savedState }));
          localStorage.setItem(
            "saves",
            JSON.stringify({ ...storedSaves, ...savedState })
          );
        }
      } catch (error) {
        console.error("Error loading saved posts:", error);
      }
    };

    loadSavedPosts();
  }, [token]);

  // Save showComments state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("showComments", JSON.stringify(showComments));
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [showComments, comments]);

  // Fetch specific post
  const fetchPost = async () => {
    try {
      const { data } = await axios.get(
        `https://knowledge-sharing-pied.vercel.app/post/list_specific/${id}`
      );
      setPost(data.post);

      // Fetch comments if they were shown before refresh
      const savedShowComments =
        JSON.parse(localStorage.getItem("showComments")) || {};
      if (savedShowComments[data.post._id]) {
        await fetchComments(data.post._id);
      }

      getLikesCount(data.post._id);
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Failed to load the post. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  // Fetch comments when post changes
  useEffect(() => {
    if (post?._id) {
      const savedShowComments =
        JSON.parse(localStorage.getItem("showComments")) || {};
      if (savedShowComments[post._id]) {
        fetchComments(post._id);
      }
    }
  }, [post?._id]);

  // Handle delete post
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(
        `https://knowledge-sharing-pied.vercel.app/post/delete/${postId}`,
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("Post deleted successfully!");
      navigate("/posts");
    } catch (error) {
      toast.error("Failed to delete post. Try again.");
      console.error("Delete post error:", error);
    }
  };

  // Handle like post
  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error("Please login to like posts");
      navigate("/login");
      return;
    }

    setIsLoadingLike(true);

    try {
      const response = await axios.post(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/like`,
        {},

        { headers: { token: token } }
      );

      setLikeCounts((prev) => ({
        ...prev,
        [postId]: {
          count: response.data.likes_count,
          isLiked: !prev[postId]?.isLiked,
        },
      }));

      localStorage.setItem(
        "likes",
        JSON.stringify({
          ...likeCounts,
          [postId]: {
            count: response.data.likes_count,
            isLiked: !likeCounts[postId]?.isLiked,
          },
        })
      );

      toast.success(response.data.message || "Post liked!");
    } catch (error) {
      console.error("Like post error:", error);
      toast.error(error.response?.data?.message || "Failed to like post.");
    } finally {
      setIsLoadingLike(false);
    }
  };

  // Handle save post
  const handleSavePost = async (postId) => {
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
        {
          headers: {
            token: token,
          },
        }
      );

      setSaveCounts((prev) => {
        const newState = {
          ...prev,
          [postId]: !prev[postId],
        };
        localStorage.setItem("saves", JSON.stringify(newState));
        return newState;
      });

      toast.success(
        saveCounts[postId]
          ? "Post removed from saved!"
          : "Post saved successfully!"
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save post.");
    } finally {
      setIsLoadingSave(false);
    }
  };

  // Get likes count for a post
  const getLikesCount = async (postId) => {
    try {
      const response = await axios.get(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/likes_count`
      );

      setLikeCounts((prevCounts) => ({
        ...prevCounts,
        [postId]: {
          count: response.data.likes_count,
          isLiked: prevCounts[postId]?.isLiked || false,
        },
      }));
    } catch (error) {
      console.error("Error fetching like count:", error);
      setLikeCounts((prevCounts) => ({
        ...prevCounts,
        [postId]: {
          count: 0,
          isLiked: prevCounts[postId]?.isLiked || false,
        },
      }));
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

  // Fetch comments for a post

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `https://knowledge-sharing-pied.vercel.app/comment/${postId}/get`
      );

      const fetchedComments = res.data || [];

      setComments((prev) => {
        const newComments = {
          ...prev,

          [postId]: fetchedComments,
        };
        localStorage.setItem("comments", JSON.stringify(newComments));
        return newComments;
      });

      if (post && post._id === postId) {
        setPost((prev) => ({
          ...prev,
          comments_count: fetchedComments.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    }
  };

  // Toggle comments visibility

  const toggleComments = async (postId) => {
    const shouldShow = !showComments[postId];
    setShowComments((prev) => ({
      ...prev,
      [postId]: shouldShow,
    }));

    if (shouldShow) {
      try {
        await fetchComments(postId);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }
  };

  // Handle add comment

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
        {
          text,
          parent_comment: parentId || null,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      setText("");
      setParentId(null);

      setComments((prev) => {
        const newComments = {
          ...prev,
          [postId]: [data.comment, ...(prev[postId] || [])],
        };
        localStorage.setItem("comments", JSON.stringify(newComments));
        return newComments;
      });

      setPost((prev) => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1,
      }));

      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };
  // Handle delete comment
  const handleDeleteComment = async (commentId, postId) => {
    if (!user) {
      return;
    }

    try {
      await axios.delete(
        `https://knowledge-sharing-pied.vercel.app/comment/${commentId}/delete`,
        {
          headers: {
            token: token,
          },
        }
      );

      // Update comments state
      setComments((prev) => {
        const updatedComments = {
          ...prev,
          [postId]: prev[postId].filter((comment) => comment._id !== commentId),
        };
        localStorage.setItem("comments", JSON.stringify(updatedComments));
        return updatedComments;
      });

      toast.success("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  // Render comments with nested replies

  const renderComments = (commentsArray, postId, parent = null, depth = 0) => {
    if (!commentsArray || !Array.isArray(commentsArray)) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          Loading comments...
        </div>
      );
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

    return filteredComments.map((comment) => (
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
            {comment.author?.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                {comment.author?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-xl p-3 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    {comment.author?.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(comment.createdAt).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

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
              </div>

              <p className="text-sm text-gray-700 mt-1">{comment.text}</p>

              <div className="flex items-center mt-2 space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setParentId(parentId === comment._id ? null : comment._id);
                  }}
                  className="text-xs flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <FaReply className="mr-1" size={12} />
                  Reply
                </button>
              </div>
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
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <FaUserCircle className="text-gray-400 text-2xl flex-shrink-0" />
                  )}
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Reply to ${comment.author?.name || "this comment"
                      }...`}
                    className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white"
                    autoFocus
                  />
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
    ));
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
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-full mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen"
    >
      {/* Post Content */}
      <motion.div
        whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
        className="bg-white p-6 mb-8 duration-300 flex flex-col md:flex-row justify-between items-start gap-6 rounded-xl border border-gray-100"
      >
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
              {post.author?.name?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <div className="text-sm text-gray-500 flex">
                <div className="mr-1">by</div>
                <span className="font-medium text-gray-700">
                  {post.author?.name || "Unknown"}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {post.sub_category && (
            <div className="mb-3">
              <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-md">
                {post.sub_category.name}
              </span>
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-900 leading-snug mb-3">
            {post.title}
          </h2>

          <p className="text-gray-700 text-base mb-6 leading-relaxed">
            {post.content}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              speakText(post.title, post.content);
            }}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                transition: { repeat: Infinity, duration: 2 },
              }}
            >
              <FaVolumeUp className="text-xl" />
            </motion.div>
            <span className="font-medium">Listen to this post</span>
          </motion.button>

          {post.files?.urls?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Attachments
              </h4>
              <div className="flex flex-wrap gap-3">
                {post.files.urls.map((file) => (
                  <motion.a
                    key={file._id}
                    whileHover={{ y: -2 }}
                    href={file.secure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <FaFilePdf className="mr-2" />
                    <span className="text-sm font-medium">
                      {file.original_filename?.slice(0, 20) || "Download File"}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm gap-5">
              {/* Like */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikePost(post._id);
                }}
                className={`flex cursor-pointer items-center gap-1 ${likeCounts[post._id]?.isLiked
                  ? "text-indigo-500"
                  : "text-gray-500"
                  }`}
              >
                <motion.div
                  animate={{
                    scale: likeCounts[post._id]?.isLiked ? [1, 1.3, 1] : 1,
                    transition: { duration: 0.3 },
                  }}
                >
                  <BiSolidLike className="text-xl" />
                </motion.div>
                <span className="text-sm">
                  {likeCounts[post._id]?.count || 0}
                </span>
              </motion.div>

              {/* Comment */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.stopPropagation();

                  toggleComments(post._id);
                }}
                className="flex items-center cursor-pointer gap-1 text-gray-500 hover:text-indigo-500"
              >
                <FaRegCommentDots className="text-xl" />
                <span className="text-sm">
                  {post.comments_count || comments[post._id]?.length || 0}
                </span>
              </motion.div>

              {/* Save */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSavePost(post._id);
                }}
                className={`cursor-pointer flex items-center ${saveCounts[post._id] ? "text-green-500" : "text-gray-500"
                  }`}
              >
                <FaBookmark className="text-xl" />
                {saveCounts[post._id] && <span className="text-sm">Saved</span>}
              </motion.div>
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

          {/* Comments Section */}
          <AnimatePresence>
            {showComments[post._id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
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
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <FaUserCircle className="text-gray-400 text-3xl flex-shrink-0" />
                      )}
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 bg-white"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-indigo-500 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-600 transition-colors flex-shrink-0"
                        disabled={!text.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </form>

                  <div className="mb-4">
                    {comments[post._id] && comments[post._id].length > 0 ? (
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

        {post.thumbnail && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-64 h-64 md:h-auto flex-shrink-0"
          >
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover rounded-lg shadow-sm"
            />
          </motion.div>
        )}
      </motion.div>

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
