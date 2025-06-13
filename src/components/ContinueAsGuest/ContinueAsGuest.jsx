import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaVolumeUp, FaArrowRight, FaFilePdf, FaRegCommentDots, FaBookmark, FaEdit } from 'react-icons/fa';
import { BiSolidLike } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import Modal from 'react-modal';
import styles from './ContinueAsGuest.module.css'; // Import CSS Module

Modal.setAppElement('#root'); // Set the root element for accessibility

const ContinueAsGuest = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('https://knowledge-sharing-pied.vercel.app/post/list');
                const result = await response.json();

                // Handle different response structures
                const postsArray = Array.isArray(result)
                    ? result
                    : result.posts || result.data || [];

                setPosts(postsArray);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleGuestAction = (e) => {
        e.stopPropagation();
        setShowAuthModal(true);
    };

    const closeAuthModal = () => {
        setShowAuthModal(false);
    };

    const navigateToAuth = (mode) => {
        navigate(`/${mode}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Continue as Guest</h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
                You're viewing posts as a guest. Register or login to interact with content.
            </p>

            <div className="space-y-8">
                {posts.map((post) => (
                    <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
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

                            <div className={`${post.thumbnail ? "md:w-3/5" : "w-full"} p-5`}>
                                <div
                                    className="flex items-center mb-3 cursor-pointer"
                                    onClick={() => navigate(`/post/${post._id}`)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-md">
                                        {post.author?.name?.charAt(0) || "U"}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-md font-medium text-gray-900">
                                            {post.author?.name || "User"}
                                        </p>
                                        <p className="text-sm text-gray-500">
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
                                        <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-2 rounded-md">
                                            {post.sub_category.name}
                                        </span>
                                    </div>
                                )}

                                <h2
                                    className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer"
                                    onClick={() => navigate(`/post/${post._id}`)}
                                >
                                    {post.title}
                                </h2>

                                <p
                                    className="text-gray-600 text-lg mb-4 line-clamp-3 cursor-pointer"
                                    onClick={() => navigate(`/post/${post._id}`)}
                                >
                                    {post.content}
                                </p>
                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGuestAction}
                                    className="flex items-center gap-3 px-3 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-indigo-200/50 transition-all duration-300 mb-6"
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        cursor: "pointer",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}
                                >
                                    <motion.span
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute left-0 top-0 w-full h-full bg-blue opacity-0 hover:opacity-10"
                                    />

                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            transition: { repeat: Infinity, duration: 2 },
                                        }}
                                        className="text-xl text-white"
                                    >
                                        <FaVolumeUp />
                                    </motion.div>

                                    <span className="font-semibold text-lg tracking-wide">Listen to this post</span>

                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="ml-1"
                                    >
                                        <FaArrowRight className="text-xl" />
                                    </motion.div>
                                </motion.button>

                                {post.files?.urls?.length > 0 && (
                                    <div className="mb-4">
                                        {post.files.urls.slice(0, 2).map((file) => (
                                            <a
                                                key={file._id}
                                                href={file.secure_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-indigo-600 hover:underline text-xl mr-3 mb-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FaFilePdf className="mr-1" size={20} />
                                                {file.original_filename?.slice(0, 15) || "File"}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleGuestAction}
                                            className="flex cursor-pointer items-center gap-1 text-gray-500 hover:text-indigo-500"
                                        >
                                            <motion.div title="Like">
                                                <BiSolidLike className="text-xl" />
                                            </motion.div>
                                            <span className="text-lg">
                                                {post.likes?.length || 0}
                                            </span>
                                        </motion.div>
                                        <div
                                            onClick={handleGuestAction}
                                            className="flex items-center cursor-pointer gap-1"
                                            title="Comment"
                                        >
                                            <FaRegCommentDots className="text-lg" />
                                            <span className="text-black text-lg">
                                                {post.comments?.length || 0}
                                            </span>
                                        </div>
                                        <div
                                            onClick={handleGuestAction}
                                            className="cursor-pointer flex items-center gap-1"
                                            title="Save"
                                        >
                                            <FaBookmark />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleGuestAction}
                                            className="cursor-pointer text-gray-500 hover:text-blue-800"
                                            title="Edit"
                                        >
                                            <FaEdit size={20} />
                                        </button>

                                        <button
                                            onClick={handleGuestAction}
                                            className="cursor-pointer text-gray-500 hover:text-red-800"
                                            title="Delete"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Authentication Modal */}
            <Modal
                isOpen={showAuthModal}
                onRequestClose={closeAuthModal}
                contentLabel="Authentication Required"
                className="outline-none"
                overlayClassName="fixed inset-0 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md transition-all duration-300"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="relative w-full max-w-md"
                >
                    {/* Floating gradient bubbles background */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/30 rounded-full filter blur-3xl animate-float"></div>
                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/40 rounded-full filter blur-3xl animate-float-delay"></div>

                    {/* Glass card */}
                    <div className="relative bg-gradient-to-r from-indigo-500/30 via-purple-500/40 to-blue-500/50 border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <motion.h2
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-3xl font-bold text-white drop-shadow-md mb-3"
                                >
                                    Welcome Back!
                                </motion.h2>
                                <motion.p
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-white/90"
                                >
                                    Join our community to unlock all features
                                </motion.p>
                            </div>

                            <div className="space-y-4">
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 8px 20px rgba(99, 102, 241, 0.4)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigateToAuth('register')}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
                                >
                                    Create Account
                                </motion.button>

                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 8px 20px rgba(255, 255, 255, 0.2)"
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigateToAuth('login')}
                                    className="w-full bg-white/20 border-2 border-white/30 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-white/20 transition-all duration-300 backdrop-blur-sm"
                                >
                                    Sign In
                                </motion.button>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="pt-4"
                                >
                                    <button
                                        onClick={closeAuthModal}
                                        className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
                                    >
                                        Continue exploring as guest →
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Modal>
        </div>
    );
};

export default ContinueAsGuest;