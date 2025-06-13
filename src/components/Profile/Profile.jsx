import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../Context/UserContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CameraIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  BookmarkIcon,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user: contextUser, clearUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);


  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    profileImage: null,
    profileImageFile: null,
  });

  // Get token from context (with prefix)
  const getToken = () => contextUser?.token || null;

  // Fetch user data with animation
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://knowledge-sharing-pied.vercel.app/user/userProfile",
          {
            headers: { token: token },
          }
        );

        if (response.data && response.data.userInformation) {
          const userData = response.data.userInformation.user;
          setProfileData({
            name: userData.name || "No name provided",
            email: userData.email || "No email provided",
            role: userData.role || "No role provided",
            profileImage:
              userData.profileImage?.url || "No Profile Image provided",
            profileImageFile: null,
          });

          // Set posts from the same response
          if (response.data.userPosts && response.data.userPosts.posts) {
            setPosts(response.data.userPosts.posts);
          }
        }

        setLoading(false);
        setLoadingPosts(false);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.message || "Failed to load profile");
        setLoading(false);
        setLoadingPosts(false);
      }
    };

    fetchUserProfile();
  }, [navigate, contextUser]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 2) {
      setError("File too large (max 2MB)");
      return;
    }

    const validTypes = ["image/jpg", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported Format (use JPG, JPEG, or PNG)");
      return;
    }

    try {
      // Store the file for later use in FormData
      setProfileData((prev) => ({ ...prev, profileImageFile: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setProfileData((prev) => ({ ...prev, profileImage: imageUrl }));
        setError(null); // Clear any previous errors
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload image");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("name", profileData.name);

      if (
        profileData.profileImageFile &&
        profileData.profileImage !== profileData.originalImage
      ) {
        formData.append("profileImage", profileData.profileImageFile);
      }

      const response = await axios.put(
        "https://knowledge-sharing-pied.vercel.app/user/updateUser",
        formData,
        {
          headers: {
            token: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setProfileData((prev) => ({ ...prev, profileImageFile: null }));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error("Update profile error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = () => {
    navigate("/reset-password");
  };
  const handlePrivacySettings = () => {
    navigate("/privacy");
  };

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleDeleteAccount = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(
        "https://knowledge-sharing-pied.vercel.app/user/deleteUser",
        {
          headers: { token: token },
        }
      );

      clearUser();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
    }
  };

  const handleNavigateToSavedPosts = () => {
    navigate("/savedPosts");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    const getErrorConfig = (errorMessage) => {
      if (errorMessage.toLowerCase().includes("deactivated")) {
        return {
          icon: (
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          title: "Account Deactivated",
          bgColor: "bg-red-50",
          borderColor: "border-red-100",
          textColor: "text-red-600",
          buttonColor: "bg-indigo-600 hover:bg-indigo-700",
          showDate: true,
        };
      } else if (
        errorMessage.toLowerCase().includes("failed to load") ||
        errorMessage.toLowerCase().includes("network error")
      ) {
        return {
          icon: (
            <svg
              className="h-12 w-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          title: "Connection Error",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-100",
          textColor: "text-yellow-600",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
          showDate: false,
        };
      } else if (
        errorMessage.toLowerCase().includes("file too large") ||
        errorMessage.toLowerCase().includes("unsupported format")
      ) {
        return {
          icon: (
            <svg
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          ),
          title: "Upload Error",
          bgColor: "bg-red-50",
          borderColor: "border-red-100",
          textColor: "text-red-600",
          buttonColor: "bg-indigo-600 hover:bg-indigo-700",
          showDate: false,
        };
      } else {
        return {
          icon: (
            <svg
              className="h-12 w-12 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          title: "Error",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-100",
          textColor: "text-gray-600",
          buttonColor: "bg-gray-600 hover:bg-gray-700",
          showDate: false,
        };
      }
    };

    const errorConfig = getErrorConfig(error);

    const handleMenuToggle = (postId, e) => {
      e.stopPropagation(); // Prevent triggering the post click
      setShowPostMenu(showPostMenu === postId ? null : postId);
    };

    const handleEditPost = (postId) => {
      setShowPostMenu(null);
      navigate(`/editPost/${post._id}`);
    };

    const handleDeletePost = async (postId) => {
      try {
        setIsDeletingPost(true);
        const token = getToken();

        await axios.delete(
          `https://knowledge-sharing-pied.vercel.app/post/delete/${post._id}`,
          {
            headers: { token: token },
          }
        );

        // Remove the deleted post from state
        setPosts(posts.filter(post => post._id !== postId));
        setSuccessMessage("Post deleted successfully!");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete post");
      } finally {
        setIsDeletingPost(false);
        setShowPostMenu(null);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 border ${errorConfig.borderColor}`}
        >
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className={`mb-6 p-4 ${errorConfig.bgColor} rounded-full`}
            >
              {errorConfig.icon}
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {errorConfig.title}
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>

            {errorConfig.showDate && (
              <div
                className={`w-full ${errorConfig.bgColor} rounded-lg p-4 mb-6`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className={`${errorConfig.textColor} font-medium`}>
                    Account will be reactivated on 5/16/2025
                  </span>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              className={`w-full text-white py-3 rounded-lg transition-colors shadow-md ${errorConfig.buttonColor}`}
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4"
    >
      <button
        onClick={handleBackToHome}
        className="cursor-pointer flex items-center text-indigo-600 hover:text-indigo-500 mb-6 group"
      >
        <motion.div whileHover={{ x: -3 }} className="flex items-center">
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:text-indigo-700 transition-colors" />
          <span>Back to Home</span>
        </motion.div>
      </button>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-blue-300/50 to-red-300/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <TrashIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Delete Account
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete your account? This action cannot
                be undone and all your data will be permanently lost.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="cursor-pointer flex-1 px-4 py-2.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    handleDeleteAccount();
                  }}
                  className="cursor-pointer flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
                <span className="font-medium">{successMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100"
        >
          {/* Profile Header with Gradient */}
          <div className="bg-gradient-to-r from-white to-indigo-100 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative group"
              >
                {profileData.profileImage ? (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-32 w-32 rounded-full object-cover border-4 border-indigo-200 shadow-lg"
                    src={profileData.profileImage}
                    alt="Profile"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-200 shadow-lg">
                    <UserCircleIcon className="h-24 w-24 text-indigo-400" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute bottom-0 right-0 flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current.click()}
                      className="cursor-pointer bg-indigo-600 p-2 rounded-full text-white hover:bg-indigo-700 transition-all shadow-lg"
                    >
                      <CameraIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </motion.div>

              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-indigo-900 bg-white w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-indigo-400"
                      placeholder="Enter your name"
                    />
                  </motion.div>
                ) : (
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-bold text-indigo-900"
                  >
                    {profileData.name}
                  </motion.h2>
                )}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm 
             bg-green-100 text-green-900"
                >
                  {profileData.role === "doctor" ? (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 122.88 116.87"
                        className="w-5 h-5"
                      >
                        <polygon
                          fill="#10a64a"
                          fillRule="evenodd"
                          points="61.37 8.24 80.43 0 90.88 17.79 111.15 22.32 109.15 42.85 122.88 
                58.43 109.2 73.87 111.15 94.55 91 99 80.43 116.87 61.51 108.62 42.45 116.87 
                32 99.08 11.73 94.55 13.73 74.01 0 58.43 13.68 42.99 11.73 22.32 31.88 17.87 
                42.45 0 61.37 8.24"
                        />
                        <path
                          fill="#fff"
                          d="M37.92,65c-6.07-6.53,3.25-16.26,10-10.1,2.38,2.17,5.84,5.34,8.24,7.49L74.66,39.66C81.1,
                33,91.27,42.78,84.91,49.48L61.67,77.2a7.13,7.13,0,0,1-9.9.44C47.83,73.89,42.05,68.5,37.92,65Z"
                        />
                      </svg>
                      <span className="tracking-wide">Verified Doctor</span>
                    </div>
                  ) : (
                    "Community Member"
                  )}
                </motion.span>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center md:justify-start gap-4 mt-6"
                >
                  <motion.button
                    whileHover={!isUpdating ? { scale: 1.05 } : {}}
                    whileTap={!isUpdating ? { scale: 0.95 } : {}}
                    disabled={isUpdating}
                    onClick={() =>
                      isEditing ? handleUpdateProfile() : setIsEditing(true)
                    }
                    className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all shadow-md
    ${isUpdating
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                      } text-white`}
                  >
                    {isUpdating ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                          />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-5 w-5" />
                        <span>
                          {isEditing ? "Save Changes" : "Edit Profile"}
                        </span>
                      </>
                    )}
                  </motion.button>

                  {!isEditing && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNavigateToSavedPosts}
                        className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                      >
                        <BookmarkIcon className="h-5 w-5" />
                        <span>Saved Posts</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowDeleteModal(true)}
                        className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                      >
                        <TrashIcon className="h-5 w-5" />
                        <span>Delete Account</span>
                      </motion.button>
                    </>
                  )}

                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="cursor-pointer px-5 py-2.5 bg-indigo-100 text-indigo-900 rounded-lg hover:bg-indigo-200 transition-all"
                    >
                      Cancel
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-indigo-50 p-6 rounded-xl shadow-sm"
              >
                <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <svg
                        className="h-5 w-5 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600">Email Address</p>
                      <p className="text-indigo-900 font-medium">
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <svg
                        className="h-5 w-5 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600">Account Type</p>
                      <p className="text-indigo-900 font-medium capitalize">
                        {profileData.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Account Security */}
              {!isEditing && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-indigo-50 p-6 rounded-xl shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-4">
                    Account Security
                  </h3>
                  <p className="text-sm text-indigo-600 mb-6">
                    Manage your account security settings and preferences
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={handleChangePassword}
                      className="cursor-pointer w-full flex items-center justify-between p-4 bg-white rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <svg
                            className="h-5 w-5 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-indigo-900">
                            Change Password
                          </p>
                          <p className="text-xs text-indigo-600">
                            Update your account password
                          </p>
                        </div>
                      </div>
                      <svg
                        className="h-5 w-5 text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    <button className="cursor-pointer w-full flex items-center justify-between p-4 bg-white rounded-lg hover:bg-indigo-100 transition-colors"
                    onClick={handlePrivacySettings}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <svg
                            className="h-5 w-5 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-indigo-900">
                            Privacy Settings
                          </p>
                          <p className="text-xs text-indigo-600">
                            Manage your privacy preferences
                          </p>
                        </div>
                      </div>
                      <svg
                        className="h-5 w-5 text-indigo-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Posts Section */}
          <div className="p-8 border-t border-indigo-100">
            <h3 className="text-xl font-semibold text-indigo-900 mb-6">
              Your Posts
            </h3>

            {loadingPosts ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-indigo-50 rounded-xl"
              >
                <div className="inline-block p-4 bg-white rounded-full mb-4 shadow-sm">
                  <svg
                    className="h-8 w-8 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-indigo-900 mb-2">
                  No Posts Yet
                </h4>
                <p className="text-indigo-600 mb-4">
                  You haven't created any posts yet. Start sharing your
                  knowledge with the community!
                </p>
                <button
                  onClick={() => navigate("/knowledgeCorner")}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Your First Post
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/post/${post._id}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {post.userName?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-indigo-900">
                              {post.userName}
                            </p>
                            <p className="text-sm text-indigo-600">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <h4 className="text-lg font-semibold text-indigo-900 mb-3">
                        {post.title}
                      </h4>
                      <p className="text-indigo-700 mb-4 line-clamp-3">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            <span>{post.likes?.length || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            <span>{post.comments?.length || 0}</span>
                          </button>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-700">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
