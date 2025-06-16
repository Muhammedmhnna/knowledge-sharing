import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaRegCommentDots, FaBookmark, FaUserCircle } from "react-icons/fa";
import { BiSolidLike } from "react-icons/bi";
import { MdDateRange } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../../Context/UserContext";

const ProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const { user } = useUser();
    const token = user?.token;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://knowledge-sharing-pied.vercel.app/user/othersProfile/${id}`,
                    { headers: { token } }
                );

                if (response.data.success) {
                    setProfileData(response.data);
                } else {
                    setError("Failed to load profile data");
                }
            } catch (err) {
                console.error("Error fetching profile data:", err);
                setError(err.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id, token]);




    const handleLikePost = async (postId) => {
        if (!user) {
            toast.error("Please login to like posts");
            navigate("/login");
            return;
        }

        try {
            await axios.post(
                `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/like`,
                {},
                { headers: { token } }
            );

            setProfileData(prev => ({
                ...prev,
                userPosts: {
                    ...prev.userPosts,
                    posts: prev.userPosts.posts.map(post => {
                        if (post._id === postId) {
                            const isLiked = !post.isLiked;
                            return {
                                ...post,
                                isLiked,
                                interactions: isLiked
                                    ? [...post.interactions, user._id]
                                    : post.interactions.filter(id => id !== user._id)
                            };
                        }
                        return post;
                    })
                }
            }));

            toast.success(
                <div className="flex items-center">
                    <BiSolidLike className="text-blue-500 mr-2" />
                    <span>You {profileData.userPosts.posts.find(p => p._id === postId).isLiked ? "unliked" : "liked"} the post</span>
                </div>,
                {
                    icon: false,
                    className: "border-l-4 border-blue-500",
                }
            );
        } catch (error) {
            console.error("Like post error:", error);
            toast.error(error.response?.data?.message || "Failed to like post.");
        }
    };

    const handleSavePost = async (postId, e) => {
        e.stopPropagation();
        if (!user) {
            toast.error("Please login to save posts");
            navigate("/login");
            return;
        }

        try {
            const response = await axios.post(
                `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/save`,
                {},
                { headers: { token } }
            );

            const isSaved = response.data.Data.isSaved;

            setProfileData(prev => ({
                ...prev,
                userPosts: {
                    ...prev.userPosts,
                    posts: prev.userPosts.posts.map(post => {
                        if (post._id === postId) {
                            return {
                                ...post,
                                isSaved
                            };
                        }
                        return post;
                    })
                }
            }));

            toast.success(isSaved ? "Post saved successfully!" : "Post removed from saved");
        } catch (error) {
            console.error("Error saving post:", error);
            toast.error(error.response?.data?.message || "Failed to save post");
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
                    <p className="text-gray-600 mb-4">The requested profile could not be loaded.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { user: profileUser } = profileData.userInformation;
    const { posts } = profileData.userPosts;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Enhanced Profile Header */}
            <div className="relative bg-white shadow-sm">
                {/* Cover Photo with Gradient Overlay */}
                <div className="h-64 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden rounded-b-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>

                {/* Profile Content */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 md:-mt-20 px-6 pb-8">
                        {/* Profile Picture with Shadow and Border */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
                                <img
                                    src={profileUser.profileImage?.url || "https://via.placeholder.com/150"}
                                    alt={profileUser.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/150";
                                    }}
                                />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                            {profileUser.name}
                                        </h1>
                                        {profileUser.isVerified && profileUser.role === 'doctor' && (
                                            <span className="ml-2 text-green-500" title="Verified Doctor">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center text-gray-600 gap-4">
                                        <div className="flex items-center">
                                            <IoMdMail className="mr-1.5 text-indigo-500" />
                                            <span>{profileUser.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MdDateRange className="mr-1.5 text-indigo-500" />
                                            <span>Joined {formatDate(profileUser.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Badges */}
                                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full shadow-xs">
                                        {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full shadow-xs">
                                        {profileUser.role === 'doctor' ? 'Verified Doctor' : 'Community Member'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar - Enhanced Design */}
                    <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
                        {/* About Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                About
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        {profileUser.bio || "No bio provided yet."}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                                    <div className="flex items-center">
                                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${profileUser.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className="text-gray-700">{profileUser.isActive ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                Activity Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center bg-indigo-50 p-3 rounded-lg">
                                    <p className="text-2xl font-bold text-indigo-600">{posts.length}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Posts</p>
                                </div>
                                <div className="text-center bg-purple-50 p-3 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">
                                        {posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Comments</p>
                                </div>
                                <div className="text-center bg-blue-50 p-3 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {posts.reduce((acc, post) => acc + (post.interactions?.length || 0), 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Likes</p>
                                </div>
                                <div className="text-center bg-green-50 p-3 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">
                                        {posts.filter(post => post.isSaved).length}
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Saved</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full md:w-2/3 lg:w-3/4">
                        {/* Enhanced Tabs */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
                            <div className="flex border-b border-gray-200">
                                <button
                                    className={`px-6 py-3 font-medium text-sm flex-1 text-center transition-colors ${activeTab === "posts" ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Posts
                                </button>
                            </div>
                        </div>

                        {/* Posts Tab */}
                        {activeTab === "posts" && (
                            <div className="space-y-6">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <motion.div
                                            key={post._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all"
                                        >
                                            <div className="p-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3
                                                            className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 cursor-pointer transition-colors"
                                                            onClick={() => navigate(`/post/${post._id}`)}
                                                        >
                                                            {post.title}
                                                        </h3>
                                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                                            {post.content}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm text-gray-500 whitespace-nowrap ml-4">
                                                        {formatDateTime(post.createdAt)}
                                                    </div>
                                                </div>

                                                {post.files?.urls?.length > 0 && (
                                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {post.files.urls.map((file) => (
                                                            <motion.div
                                                                key={file._id}
                                                                whileHover={{ scale: 1.02 }}
                                                                className="overflow-hidden rounded-lg"
                                                            >
                                                                <img
                                                                    src={file.secure_url}
                                                                    alt="Post content"
                                                                    className="w-full h-48 object-cover cursor-pointer"
                                                                    onClick={() => window.open(file.secure_url, '_blank')}
                                                                />
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                                                    <div className="flex space-x-4">
                                                        <button
                                                            onClick={() => handleLikePost(post._id)}
                                                            className={`flex items-center space-x-1 transition-colors ${post.interactions?.includes(user?._id) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                                        >
                                                            <BiSolidLike />
                                                            <span>{post.interactions?.length || 0}</span>
                                                        </button>
                                                        <button
                                                            className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors"
                                                            onClick={() => navigate(`/post/${post._id}#comments`)}
                                                        >
                                                            <FaRegCommentDots />
                                                            <span>{post.comments?.length || 0}</span>
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleSavePost(post._id, e)}
                                                        className={`transition-colors ${post.isSaved ? 'text-green-600 hover:text-green-700' : 'text-gray-500 hover:text-gray-600'}`}
                                                        title={post.isSaved ? "Unsave post" : "Save post"}
                                                    >
                                                        <FaBookmark />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                                        <div className="max-w-md mx-auto">
                                            <div className="inline-flex p-4 bg-indigo-100 rounded-full mb-4">
                                                <FaUserCircle className="text-indigo-600" size={20} />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
                                            <p className="text-gray-500 text-sm">
                                                {profileUser.name} hasn't shared any knowledge yet.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                    </div>
                </div>
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
};

export default ProfilePage;