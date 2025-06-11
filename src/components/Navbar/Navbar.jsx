import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../Context/UserContext";
import {
  FaBell,
  FaRegBell,
  FaBars,
  FaTimes,
  FaStar,
  FaComment,
  FaThumbsUp,
  FaUserPlus,
  FaChevronRight,
  FaCheck,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = "https://knowledge-sharing-pied.vercel.app/notification";

const notificationService = {
  fetchAll: async (token) => {
    try {
      const response = await axios.get(API_URL, {
        headers: { token: token },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  },
  markAsRead: async (id, token) => {
    try {
      await axios.patch(
        `${API_URL}/${id}/read`,
        {},
        {
          headers: { token: token },
        }
      );
      return true;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return false;
    }
  },
};

const notificationIcons = {
  rate: <FaStar className="text-yellow-400" />,
  comment: <FaComment className="text-green-400" />,
  like: <FaThumbsUp className="text-blue-400" />,
  follow: <FaUserPlus className="text-purple-400" />,
  default: <FaBell className="text-pink-400" />,
};

const notificationMessages = {
  rate: (sender, post) => `${sender} rated your post "${post}"`,
  comment: (sender, post) => `${sender} commented on your post "${post}"`,
  like: (sender, post) => `${sender} liked your post "${post}"`,
  follow: (sender) => `${sender} started following you`,
  default: () => "You have a new notification",
};

export default function Navbar() {
  const { user, clearUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasUnread = notifications.some((n) => !n.isRead);

  const loadNotifications = async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const data = await notificationService.fetchAll(user.token);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    const notification = notifications.find(n => n._id === notificationId);
    if (!notification || notification.isRead) return;

    const success = await notificationService.markAsRead(
      notificationId,
      user.token
    );
    if (success) {
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    if (notification.postId?._id) {
      navigate(`/post/${notification.postId._id}`);
    } else if (notification.sender?._id) {
      navigate(`/profile/${notification.sender._id}`);
    } else {
      navigate("/notifications");
    }

    setShowNotifications(false);
    setMobileMenuOpen(false);
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const navItems = [
    { path: "/home", label: "Home" },
    { path: "/post", label: "Posts" },
    { path: "/shop", label: "Shop" },
    { path: "/profile", label: "Profile" },
  ];

  useEffect(() => {
    if (user?.token) {
      loadNotifications();
    }
  }, [user?.token]);

  useEffect(() => {
    setShowNotifications(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const NotificationItem = ({ notification }) => (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => handleNotificationClick(notification)}
      className={`p-3 rounded-lg cursor-pointer transition-colors ${!notification.isRead
        ? "bg-blue-50 border-l-2 border-blue-500"
        : "hover:bg-gray-50"
        }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div
            className={`p-3 rounded-full ${!notification.isRead ? "bg-white shadow-md" : "bg-gray-100"
              } flex items-center justify-center`}
          >
            {notificationIcons[notification.type] || notificationIcons.default}
          </div>
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p
              className={`text-sm font-semibold ${!notification.isRead ? "text-gray-900" : "text-gray-700"
                }`}
            >
              {notification.sender?.name || "System"}
            </p>
            <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">
              {formatDate(notification.createdAt)}
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {notificationMessages[notification.type]?.(
              notification.sender?.name || "Someone",
              notification.postId?.title || "your post"
            ) || notificationMessages.default()}
          </p>
          {notification.postId?.title && (
            <div className="mt-2 flex items-center">
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                {notification.postId.title}
              </span>
              <FaChevronRight className="ml-1 text-xs text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </motion.li>
  );

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate("/home")}
          >
            Accessible Health Hub
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {user && (
              <>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                        ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-inner"
                        : "text-gray-700 hover:bg-gray-100/50 hover:shadow-sm"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                {/* Notifications */}
                <div className="relative ml-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      loadNotifications();
                    }}
                    className="p-2 rounded-full relative group"
                    aria-label="Notifications"
                    style={{
                      background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
                      boxShadow: "5px 5px 10px #d9d9d9, -5px -5px 10px #ffffff",
                    }}
                  >
                    <div className="relative">
                      {hasUnread ? (
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ duration: 0.7 }}
                        >
                          <FaBell className="text-blue-500 text-xl group-hover:text-blue-600 transition-colors" />
                        </motion.div>
                      ) : (
                        <FaRegBell className="text-gray-500 text-xl group-hover:text-gray-600 transition-colors" />
                      )}
                      {hasUnread && (
                        <motion.span
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white"
                        ></motion.span>
                      )}
                    </div>
                  </motion.button>

                  {/* Enhanced Notifications Popup */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                        className="absolute right-0 mt-2 w-100 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100"
                      >
                        {/* Glowing header */}
                        <div className="p-4 flex justify-between items-center bg-gradient-to-r from-blue-50/80 to-purple-50/80">
                          <div className="flex items-center">
                            <FaBell className="text-purple-500 text-xl mr-3" />
                            <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              Your Notifications
                            </h3>
                          </div>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1 rounded-full hover:bg-gray-200/50 transition-all"
                          >
                            <FaTimes className="text-gray-500 hover:text-gray-700" />
                          </button>
                        </div>

                        {/* Notification list with glassmorphism effect */}
                        <div className="max-h-[70vh] overflow-y-auto p-2">
                          {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                              <p className="text-gray-500">
                                Loading your notifications...
                              </p>
                            </div>
                          ) : notifications.length > 0 ? (
                            <ul className="space-y-2">
                              {notifications.map((notification) => (
                                <NotificationItem
                                  key={notification._id}
                                  notification={notification}
                                />
                              ))}
                            </ul>
                          ) : (
                            <div className="p-6 flex flex-col items-center justify-center text-center">
                              <FaRegBell className="text-4xl text-gray-300 mb-4" />
                              <h4 className="text-lg font-medium text-gray-700 mb-1">
                                No notifications yet
                              </h4>
                              <p className="text-gray-500 max-w-xs">
                                When you receive notifications, they'll appear
                                here
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Glowing footer */}
                        <div className="p-3 text-center bg-gradient-to-r from-blue-50/100 to-purple-50/100">
                          <motion.button
                            onClick={() => {
                              navigate("/notifications");
                              setShowNotifications(false);
                            }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
                          >
                            View All Notifications
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    clearUser();
                    navigate("/login");
                  }}
                  className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 shadow-md hover:shadow-lg transition-all"
                >
                  Logout
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  loadNotifications();
                }}
                className="p-2 rounded-full relative"
                aria-label="Notifications"
                style={{
                  background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
                  boxShadow: "3px 3px 6px #d9d9d9, -3px -3px 6px #ffffff",
                }}
              >
                <div className="relative">
                  {hasUnread ? (
                    <FaBell className="text-blue-500 text-xl" />
                  ) : (
                    <FaRegBell className="text-gray-500 text-xl" />
                  )}
                  {hasUnread && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white"
                    ></motion.span>
                  )}
                </div>
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Menu"
              style={{
                background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
                boxShadow: "3px 3px 6px #d9d9d9, -3px -3px 6px #ffffff",
              }}
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </motion.button>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="md:hidden fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-lg overflow-hidden border-t border-gray-100 shadow-lg z-50"
                  style={{
                    maxHeight: 'calc(100vh - 4rem)'
                  }}
                >
                  <div className="px-2 pt-2 pb-4 space-y-1">
                    {navItems.map((item) => (
                      <motion.div
                        key={item.path}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `block px-3 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                              ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700"
                              : "text-gray-700 hover:bg-gray-100/50"
                            }`
                          }
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      </motion.div>
                    ))}

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <NavLink
                        to="/notifications"
                        className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100/50 flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Notifications
                        {hasUnread && (
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500"
                          />
                        )}
                      </NavLink>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                      className="mt-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          clearUser();
                          navigate("/login");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-3 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 shadow-md"
                      >
                        Logout
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Notifications Popup */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="md:hidden fixed top-0 right-0 left-0 z-50 min-h-screen bg-black/70 backdrop-blur-md flex items-end justify-center p-0"
                  onClick={() => setShowNotifications(false)}
                >
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                      mass: 0.5
                    }}
                    className="w-full max-w-full rounded-t-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col"
                    style={{ maxHeight: "90vh" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header with gradient and drag handle */}
                    <div className="sticky top-0 z-20 pt-3 pb-2 px-5 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex flex-col">
                      <div className="flex justify-center mb-1">
                        <div className="w-8 h-1 rounded-full bg-white/40"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FaBell className="text-white mr-3 text-lg" />
                          <h3 className="font-bold text-lg text-white">Notifications</h3>
                          {notifications.some(n => !n.isRead) && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs text-white">
                              {notifications.filter(n => !n.isRead).length} new
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <FaTimes className="text-white/90 text-lg" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                      {loading ? (
                        <div className="h-48 flex flex-col items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="rounded-full h-10 w-10 border-3 border-indigo-500 border-t-transparent mb-3"
                          />
                          <p className="text-gray-500 dark:text-gray-400">Loading your notifications...</p>
                        </div>
                      ) : notifications.length > 0 ? (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                          {notifications.map((notification) => (
                            <motion.li
                              key={notification._id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              onClick={() => handleNotificationClick(notification)}
                              className={`relative p-4 transition-all ${!notification.isRead
                                ? "bg-indigo-50/50 dark:bg-indigo-900/20"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 p-2 rounded-lg ${!notification.isRead
                                  ? "bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-300"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                                  {notificationIcons[notification.type] || notificationIcons.default}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-2">
                                    <p className={`text-sm font-semibold line-clamp-1 ${!notification.isRead
                                      ? "text-gray-900 dark:text-white"
                                      : "text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {notification.sender?.name || "System"}
                                    </p>
                                    <p className="text-xs text-gray-400 whitespace-nowrap">
                                      {formatDate(notification.createdAt)}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {notificationMessages[notification.type]?.(
                                      notification.sender?.name || "Someone",
                                      notification.postId?.title || "your post"
                                    ) || notificationMessages.default()}
                                  </p>
                                  {notification.postId?.title && (
                                    <motion.div
                                      whileHover={{ x: 2 }}
                                      className="mt-2 inline-flex items-center"
                                    >
                                      <span className="inline-block px-2.5 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                                        {notification.postId.title}
                                      </span>
                                      <FaChevronRight className="ml-1 text-xs text-gray-400 dark:text-gray-500" />
                                    </motion.div>
                                  )}
                                </div>
                                {!notification.isRead && (
                                  <div className="absolute top-4 right-4 flex-shrink-0">
                                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 block animate-pulse"></span>
                                  </div>
                                )}
                              </div>
                            </motion.li>
                          ))}
                        </ul>
                      ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-center p-6">
                          <div className="relative mb-4">
                            <FaRegBell className="text-4xl text-gray-300 dark:text-gray-600" />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute -inset-2 rounded-full bg-indigo-100/50 dark:bg-indigo-900/20"
                            />
                          </div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">No notifications yet</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            We'll notify you when something new arrives
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer with floating action button */}
                    <div className="sticky bottom-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleMarkAsRead}
                          className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm"
                          disabled={notifications.every(n => n.isRead)}
                        >
                          Mark all as read
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            navigate("/notifications");
                            setShowNotifications(false);
                          }}
                          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium text-sm shadow-md"
                        >
                          View all
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}