import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaVolumeUp, FaArrowRight, FaFilePdf, FaRegCommentDots, FaBookmark, FaEdit } from 'react-icons/fa';
import { BiSolidLike } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import Modal from 'react-modal';


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
        <div className="max-w-[1200px] mx-auto p-4">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Continue as Guest</h1>
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

                                >
                                    {post.title}
                                </h2>

                                <p
                                    className="text-gray-600 text-lg mb-4 line-clamp-3 cursor-pointer"

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
                                            <div
                                                key={file._id}
                                                className="inline-flex items-center text-indigo-600 hover:underline text-xl mr-3 mb-2 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    handleGuestAction(e);
                                                }}
                                            >
                                                <FaFilePdf className="mr-1" size={20} />
                                                <span>{file.original_filename?.slice(0, 15) || "File"}</span>
                                            </div>
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
                overlayClassName="fixed inset-0 flex items-center justify-center p-4 bg-blue-400/80 backdrop-blur-xs transition-all duration-700"
                closeTimeoutMS={700}
            >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                    }}
                    className="relative w-full max-w-sm"
                >
                    {/* Geometric background elements */}
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-200/30 rounded-full mix-blend-overlay animate-float-slow"></div>
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-300/30 rotate-45 mix-blend-overlay animate-float-slow-delay"></div>

                    {/* Card container */}
                    <div className="relative bg-blue-50 border border-blue-100 rounded-2xl shadow-xl overflow-hidden">
                        {/* Animated header */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 180 }}
                            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative bg-gradient-to-br from-blue-100 to-purple-50 overflow-hidden"
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6, type: "spring" }}
                                    className="text-center p-6"
                                >
                                    <h2 className="text-3xl font-bold text-blue-900 mb-2">Join Us</h2>
                                    <p className="text-blue-700/80">Unlock all features</p>
                                </motion.div>
                            </div>

                            {/* Floating dots pattern */}
                            <div className="absolute inset-0 opacity-20">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.02, duration: 0.6 }}
                                        className="absolute w-1 h-1 bg-blue-600 rounded-full"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Content area */}
                        <div className="p-6 space-y-5">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="space-y-4"
                            >
                                <button
                                    onClick={() => navigateToAuth('register')}
                                    className="w-full relative overflow-hidden bg-blue-500 hover:bg-blue-600 border border-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <span className="h-2 w-2 bg-green-300 rounded-full animate-pulse"></span>
                                        Create Account
                                    </span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                                </button>

                                <button
                                    onClick={() => navigateToAuth('login')}
                                    className="w-full relative overflow-hidden bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 py-3 px-6 rounded-lg font-medium transition-all duration-300 group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></span>
                                        Sign In
                                    </span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                                </button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="pt-2 text-center"
                            >
                                <button
                                    onClick={closeAuthModal}
                                    className="text-blue-600/80 hover:text-blue-800 text-sm transition-colors duration-300 flex items-center justify-center gap-1 mx-auto"
                                >
                                    <span>Not now</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </motion.div>
                        </div>

                        {/* Animated footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="px-6 py-3 bg-blue-100/50 border-t border-blue-200 text-center"
                        >
                            <p className="text-xs text-blue-700/60">By continuing, you agree to our Terms</p>
                        </motion.div>
                    </div>
                </motion.div>
            </Modal>

        </div>
    );
};

export default ContinueAsGuest;