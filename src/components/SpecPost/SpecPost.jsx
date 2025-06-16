import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBookmark,
  FaEdit,
  FaRegCommentDots,
  FaVolumeUp,
  FaUserCircle,
  FaTrash,
  FaEllipsisV,
  FaPlus,
  FaMicrophone,
  FaMicrophoneSlash,
  FaTimes,

} from "react-icons/fa";
import { BiSolidLike } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../Context/UserContext";

export default function SpecPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const token = user?.token;

  // State management
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [tempSaved, setTempSaved] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [saveCounts, setSaveCounts] = useState({});
  const [comments, setComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [text, setText] = useState("");
  const [parentId, setParentId] = useState(null);



  // Fetch specific post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `https://knowledge-sharing-pied.vercel.app/post/list_specific/${id}`
        );

        const processedPost = {
          ...data.post,
          title: data.post.title || "Untitled Post",
          content: data.post.content || "",
          files: data.post.files || { urls: [] },
          sub_category: data.post.sub_category || null,
          isFlagged: data.post.isFlagged || false,
          comments: data.post.comments || []
        };

        setPost(processedPost);

        // Initialize comment count
        setCommentCounts(prev => ({
          ...prev,
          [processedPost._id]: processedPost.comments?.length || 0
        }));

        // Get likes count
        const likesResponse = await axios.get(
          `https://knowledge-sharing-pied.vercel.app/interaction/${processedPost._id}/likes_count`
        );

        setLikeCounts(prev => ({
          ...prev,
          [processedPost._id]: {
            count: likesResponse.data.likes_count || 0,
            isLiked: prev[processedPost._id]?.isLiked || false
          }
        }));

        // Get saved status if user is logged in
        if (user?.token) {
          try {
            const savedResponse = await axios.get(
              "https://knowledge-sharing-pied.vercel.app/interaction/saved_posts",
              { headers: { token: user.token } }
            );

            const savedPosts = savedResponse.data.savedPosts || [];
            const isSaved = savedPosts.some(sp => sp._id === processedPost._id);

            setSaveCounts(prev => ({
              ...prev,
              [processedPost._id]: isSaved
            }));
          } catch (error) {
            console.error("Error loading saved posts:", error);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Failed to load the post. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, user?.token]);

  // Verified Badge Component
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

      if (wasLiked) {
        toast.info(
          <div className="flex items-center">
            <BiSolidLike className="text-blue-500 mr-2" />
            <span>You unliked the post</span>
          </div>,
          {
            icon: false,
            className: "border-l-4 border-blue-500",
          }
        );
      } else {
        toast.success(
          <div className="flex items-center">
            <BiSolidLike className="text-blue-500 mr-2" />
            <span>You liked the post</span>
          </div>,
          {
            icon: false,
            className: "border-l-4 border-blue-500",
          }
        );
      }

      // Get updated count from server
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
      console.error("Like post error:", error);
      // Revert changes on error
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: {
          count: currentCount,
          isLiked: wasLiked,
        },
      }));
      toast.error(error.response?.data?.message || "Failed to like post.");
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

        toast.success(
          <div className="flex items-center">
            <FaBookmark className="text-green-500 mr-2" />
            <span>Post saved successfully!</span>
          </div>,
          {
            icon: false,
            className: "border-l-4 border-green-500",
          }
        );
      } else {
        toast.info(
          <div className="flex items-center">
            <FaBookmark className="text-blue-500 mr-2" />
            <span>Post removed from saved</span>
          </div>,
          {
            icon: false,
            className: "border-l-4 border-blue-500",
          }
        );
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error(error.response?.data?.message || "Failed to save post");
    } finally {
      setIsLoadingSave(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    try {
      const postToDelete = post?._id === postId ? post : null;

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
      toast.success("Post deleted successfully!");
      navigate("/post");
    } catch (error) {
      toast.error("Failed to delete post. Try again.");
      console.error("Delete post error:", error);
    }
  };

  // Comments functions
  const toggleComments = async (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    // If comments are already in the post data, use them
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
        console.error("Error fetching comments:", error);
        toast.error("Failed to load comments");
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
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

      // Update comment count immediately
      setCommentCounts(prev => ({
        ...prev,
        [postId]: (prev[postId] || 0) + 1
      }));

      setComments(prev => ({
        ...prev,
        [postId]: [data.comment, ...(prev[postId] || [])],
      }));

      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
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
      setCommentCounts(prev => ({
        ...prev,
        [postId]: Math.max((prev[postId] || 0) - 1, 0)
      }));

      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((comment) => comment._id !== commentId),
      }));

      toast.success("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };


  // Render comments with nested replies
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

  if (!post) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 text-lg font-semibold">Post not found</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8 min-h-screen bg-gray-50">
      <motion.article
        key={post._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{
          y: -4,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:border-indigo-200"
      >
        {/* Thumbnail Section */}
        {post.thumbnail && (
          <div
            className="w-full h-64 sm:h-80 relative overflow-hidden cursor-pointer"
            onClick={() => navigate(`/post/${post._id}`)}
          >
            <motion.img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/15 to-transparent"></div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 sm:p-8">
          {/* Author Info */}
          <div
            className="flex items-center mb-6 cursor-pointer"
            onClick={() => navigate(`/post/${post._id}`)}
          >
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-lg">
              {post.author?.profileImage.url ? (
                <img
                  src={post.author.profileImage.url}
                  alt={post.author.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                post.author?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-lg sm:text-xl font-semibold text-gray-900">
                    {post.author?.name || "User"}
                  </p>
                  <VerifiedBadge author={post.author} />
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          {post.sub_category && (
            <div className="mb-4">
              <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1.5 rounded-lg">
                {post.sub_category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h2
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => navigate(`/post/${post._id}`)}
          >
            {post.title}
          </h2>

          {/* Content */}
          <div
            className="prose prose-sm sm:prose-base max-w-none text-gray-700 mb-6 cursor-pointer"
            onClick={() => navigate(`/post/${post._id}`)}
          >
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4 last:mb-0">
                {paragraph || <br />}
              </p>
            ))}
          </div>

          {/* Files Gallery */}
          {post.files?.urls?.length > 0 && (
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {post.files.urls.slice(0, 4).map((file) => (
                <motion.div
                  key={file._id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={file.secure_url}
                    alt={file.original_filename || "Post image"}
                    className="w-full h-40 sm:h-48 object-cover cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.secure_url, "_blank");
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Listen Button */}
          <motion.button
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(99, 102, 241, 0.1)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              speakText(post.title, post.content);
            }}
            className={`
              flex items-center justify-center gap-3 
              px-6 py-4 rounded-xl
              border border-indigo-200
              bg-white backdrop-blur-sm
              shadow-sm hover:shadow-md
              transition-all duration-200
              text-indigo-600 hover:text-indigo-700
              mb-8 w-full
              text-base sm:text-lg
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
              <FaVolumeUp className="text-2xl" />
              <motion.span
                className="absolute -left-1 -top-1 w-8 h-8 border-2 border-indigo-400 rounded-full"
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

            <span className="font-medium">
              Listen to this post
            </span>
          </motion.button>

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              {/* Like Button */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikePost(post._id);
                }}
                className={`flex cursor-pointer items-center gap-2 ${likeCounts[post._id]?.isLiked
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
                  } ${isLoadingLike
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
                disabled={isLoadingLike}
              >
                {isLoadingLike ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <motion.div
                      animate={{
                        scale: likeCounts[post._id]?.isLiked ? [1, 1.3, 1] : 1,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <BiSolidLike className="text-2xl" />
                    </motion.div>
                    <span className="text-base font-medium">
                      {likeCounts[post._id]?.count || 0}
                    </span>
                  </>
                )}
              </motion.div>

              {/* Comment Button */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComments(post._id);
                }}
                className="flex items-center cursor-pointer gap-2 text-gray-600 hover:text-indigo-600"
              >
                <FaRegCommentDots className="text-xl" />
                <span className="text-base font-medium">
                  {commentCounts[post._id] || 0}
                </span>
              </div>

              {/* Save Button */}
              <div
                onClick={(e) => handleSavePost(post._id, e)}
                className={`cursor-pointer flex items-center gap-2 ${saveCounts[post._id]
                  ? "text-green-600"
                  : "text-gray-600 hover:text-green-600"
                  }`}
              >
                <motion.div
                  animate={{
                    scale: saveCounts[post._id] ? [1, 1.3, 1] : 1,
                    transition: { duration: 0.3 },
                  }}
                >
                  <FaBookmark className="text-xl" />
                </motion.div>
                {tempSaved[post._id] && saveCounts[post._id] && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-green-600 text-base font-medium"
                  >
                    Saved
                  </motion.span>
                )}
              </div>
            </div>

            {/* Edit/Delete Buttons (for author) */}
            {post.author?._id === user?._id && (
              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/editPost/${post._id}`);
                  }}
                  className="cursor-pointer text-gray-500 hover:text-blue-700 transition-colors"
                  title="Edit"
                >
                  <FaEdit size={22} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePost(post._id);
                  }}
                  className="cursor-pointer text-gray-500 hover:text-red-700 transition-colors"
                  title="Delete"
                >
                  <MdDelete size={22} />
                </button>
              </div>
            )}
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
                <div className="border-t border-gray-200 pt-6">
                  <form
                    onSubmit={(e) => {
                      e.stopPropagation();
                      handleAddComment(e, post._id);
                    }}
                    className="mb-6"
                  >
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 text-base border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        autoFocus={!parentId}
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-base hover:bg-indigo-700 transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {comments[post._id]?.length > 0 ? (
                      renderComments(comments[post._id], post._id)
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-base">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.article>

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
        toastClassName="rounded-xl shadow-sm border border-gray-200 text-sm"
      />
    </div>
  );
}