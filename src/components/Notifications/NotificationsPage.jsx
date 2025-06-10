import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../Context/UserContext";
import { FaBell, FaRegBell, FaStar, FaComment, FaThumbsUp, FaUserPlus, FaChevronLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = "https://knowledge-sharing-pied.vercel.app/notification";

const notificationService = {
    markAsRead: async (id, token) => {
        try {
            await axios.patch(`${API_URL}/${id}/read`, {}, {
                headers: { token: token }
            });
            return true;
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            return false;
        }
    }
};

const notificationIcons = {
    rate: <FaStar className="text-yellow-400" />,
    comment: <FaComment className="text-green-400" />,
    like: <FaThumbsUp className="text-blue-400" />,
    follow: <FaUserPlus className="text-green-400" />,
    default: <FaBell className="text-purple-400" />
};

const notificationMessages = {
    rate: (sender, post) => `${sender} rated your post "${post}"`,
    comment: (sender, post) => `${sender} commented on your post "${post}"`,
    like: (sender, post) => `${sender} liked your post "${post}"`,
    follow: (sender) => `${sender} started following you`,
    default: () => "You have a new notification"
};

export default function NotificationsPage() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // 'all', 'unread'

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.token) return;

            try {
                const response = await axios.get(API_URL, {
                    headers: { token: user.token }
                });
                setNotifications(response.data);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    const filteredNotifications = filter === "unread"
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const formatDate = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const handleMarkAsRead = async (notificationId) => {
        const notification = notifications.find(n => n._id === notificationId);
        if (!notification || notification.isRead) return;

        const success = await notificationService.markAsRead(notificationId, user.token);
        if (success) {
            setNotifications(notifications.map(n =>
                n._id === notificationId ? { ...n, isRead: true } : n
            ));
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read first if unread
        if (!notification.isRead) {
            await handleMarkAsRead(notification._id);
        }

        // Then navigate
        if (notification.postId?._id) {
            navigate(`/post/${notification.postId._id}`);
        } else if (notification.sender?._id) {
            navigate(`/profile/${notification.sender._id}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => navigate("/home")}
                        className="p-2 rounded-full hover:bg-gray-100 mr-2"
                    >
                        <FaChevronLeft className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                    <div className="ml-auto flex space-x-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${filter === "all"
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-500 hover:bg-gray-100"
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${filter === "unread"
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-500 hover:bg-gray-100"
                                }`}
                        >
                            Unread
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-500">Loading your notifications...</p>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <motion.ul
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                    >
                        {filteredNotifications.map((notification) => (
                            <motion.li
                                key={notification._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => handleNotificationClick(notification)}
                                className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer transition-all ${!notification.isRead ? "border-l-4 border-blue-500" : ""
                                    } hover:shadow-md`}
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-1 text-2xl">
                                        {notificationIcons[notification.type] || notificationIcons.default}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <p className={`text-sm font-semibold ${!notification.isRead ? "text-gray-900" : "text-gray-700"
                                                }`}>
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
                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                                <p className="text-xs text-blue-500 truncate">
                                                    {notification.postId.title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                    </motion.ul>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FaRegBell className="text-4xl text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">
                            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                        </h3>
                        <p className="text-gray-500 max-w-md">
                            {filter === "unread"
                                ? "You're all caught up! New notifications will appear here."
                                : "When you get notifications, they'll show up here."
                            }
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}