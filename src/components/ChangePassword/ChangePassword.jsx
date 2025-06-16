import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../../Context/UserContext.jsx';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';

const ChangePassword = () => {
    const { user } = useUser();
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Password visibility states
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Formik setup
    const formik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object({
            currentPassword: Yup.string()
                .required('Current password is required')
                .min(8, 'Write your password right')
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&/*])/,
                    'Password must contain at least one lowercase letter, one uppercase letter, and one special character'
                ),
            newPassword: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&/*])/,
                    'Password must contain at least one lowercase letter, one uppercase letter, and one special character'
                )
                .required('New password is required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                .required('Please confirm your password')
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const token = user?.token;
                if (!token) throw new Error('Authentication token not found');

                await axios.put(
                    'https://knowledge-sharing-pied.vercel.app/user/changePassword',
                    {
                        password: values.currentPassword,
                        newPassword: values.newPassword,
                        confirmPassword: values.confirmPassword
                    },
                    {
                        headers: {
                            token: token,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                setPopupMessage('Password changed successfully!');
                setIsSuccess(true);
                setShowPopup(true);
                resetForm();
            } catch (error) {
                let errorMsg = 'An error occurred. Please try again.';

                if (error.response) {
                    if (error.response.status === 401) {
                        errorMsg = 'Current password is incorrect';
                    } else if (error.response.data?.error) {
                        errorMsg = error.response.data.error;
                    }
                }

                setPopupMessage(errorMsg);
                setIsSuccess(false);
                setShowPopup(true);
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4"
        >
            {/* Animated Form Card */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                    {/* Header with gradient */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center"
                    >
                        <motion.h2
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-3xl font-bold text-white mb-2"
                        >
                            Update Password
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-purple-100"
                        >
                            Secure your account with a new password
                        </motion.p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={formik.handleSubmit} className="p-8 space-y-6">
                        {/* Current Password Field */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type={showPassword.current ? "text" : "password"}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.currentPassword}
                                    className={`w-full px-5 py-3 rounded-xl border-2 ${formik.touched.currentPassword && formik.errors.currentPassword ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                />
                                <motion.button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-500 hover:text-purple-600 focus:outline-none"
                                    onClick={() => togglePasswordVisibility('current')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showPassword.current ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </motion.button>
                                {formik.touched.currentPassword && formik.errors.currentPassword && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute right-10 top-3 text-red-500"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </motion.div>
                                )}
                            </div>
                            {formik.touched.currentPassword && formik.errors.currentPassword && (
                                <motion.p
                                    initial={{ y: -5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="mt-1 text-sm text-red-600 flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formik.errors.currentPassword}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* New Password Field */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword.new ? "text" : "password"}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.newPassword}
                                    className={`w-full px-5 py-3 rounded-xl border-2 ${formik.touched.newPassword && formik.errors.newPassword ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                />
                                <motion.button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-500 hover:text-purple-600 focus:outline-none"
                                    onClick={() => togglePasswordVisibility('new')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showPassword.new ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </motion.button>
                                {formik.touched.newPassword && formik.errors.newPassword && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute right-10 top-3 text-red-500"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </motion.div>
                                )}
                            </div>
                            {formik.touched.newPassword && formik.errors.newPassword && (
                                <motion.p
                                    initial={{ y: -5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="mt-1 text-sm text-red-600 flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formik.errors.newPassword}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Confirm Password Field */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword.confirm ? "text" : "password"}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.confirmPassword}
                                    className={`w-full px-5 py-3 rounded-xl border-2 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                />
                                <motion.button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-500 hover:text-purple-600 focus:outline-none"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showPassword.confirm ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </motion.button>
                                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute right-10 top-3 text-red-500"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </motion.div>
                                )}
                            </div>
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <motion.p
                                    initial={{ y: -5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="mt-1 text-sm text-red-600 flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formik.errors.confirmPassword}
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.button
                            type="submit"
                            disabled={formik.isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all ${formik.isSubmitting ? 'opacity-80' : ''}`}
                        >
                            {formik.isSubmitting ? (
                                <motion.span
                                    animate={{
                                        opacity: [0.8, 1, 0.8],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="flex items-center justify-center"
                                >
                                    <svg
                                        className="w-5 h-5 mr-2 animate-spin"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                    Updating...
                                </motion.span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Change Password
                                </span>
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* Animated Popup */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center p-4 bg-gradient-to-r from-blue-200/60 via-indigo-300/60 to-purple-200/60 z-50"
                        onClick={() => setShowPopup(false)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className={`relative max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 text-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ duration: 0.6 }}
                                    className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'} mb-4`}
                                >
                                    {isSuccess ? (
                                        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </motion.div>
                                <h3 className={`text-lg font-medium ${isSuccess ? 'text-green-800' : 'text-red-800'} mb-2`}>
                                    {isSuccess ? 'Success!' : 'Error!'}
                                </h3>
                                <p className={`mb-6 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                    {popupMessage}
                                </p>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className={`w-full py-2 px-4 rounded-lg ${isSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'} font-medium transition-colors`}
                                >
                                    {isSuccess ? 'Continue' : 'Try Again'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChangePassword;