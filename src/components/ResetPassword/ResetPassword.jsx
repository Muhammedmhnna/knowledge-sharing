import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetData, setResetData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem('resetPasswordData');
    if (!storedData) {
      navigate('/forget-password');
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setResetData(parsedData);
    } catch (error) {
      navigate('/forget-password');
    }
  }, [navigate]);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&/*])/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one special character'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        if (!resetData) {
          navigate('/forget-password');
          return;
        }

        const response = await axios.put(
          'https://knowledge-sharing-pied.vercel.app/user/resetPassword',
          {
            email: resetData.email,
            password: values.password,
            confirmPassword: values.confirmPassword,
            forgetCode: resetData.forgetCode
          }
        );

        if (response.data.success) {
          toast.success('Password reset successful! Try to login now :)');
          localStorage.removeItem('resetPasswordData');
          navigate('/login');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Something went wrong';
        toast.error(errorMessage);

        if (errorMessage.includes('code') || errorMessage.includes('session')) {
          localStorage.removeItem('resetPasswordData');
          navigate('/forget-password');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleBackToForgetPassword = () => {
    localStorage.removeItem('resetPasswordData');
    navigate('/forget-password');
  };

  if (!resetData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Floating bubbles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, x: Math.random() * 100 }}
            animate={{
              y: [0, Math.random() * 100 - 50, 0],
              x: [Math.random() * 100, Math.random() * 100 - 50, Math.random() * 100]
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className={`absolute rounded-full opacity-10 ${i % 2 ? 'bg-indigo-500' : 'bg-purple-500'}`}
            style={{
              width: `${50 + Math.random() * 100}px`,
              height: `${50 + Math.random() * 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={handleBackToForgetPassword}
            className="cursor-pointer flex items-center text-indigo-600 hover:text-indigo-500 mb-6 group"
          >
            <motion.div
              whileHover={{ x: -3 }}
              className="flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:text-indigo-700 transition-colors" />
              <span>Back to Forgot Password</span>
            </motion.div>
          </button>

          <div className="bg-white bg-opacity-80 backdrop-blur-md py-8 px-6 shadow-lg sm:rounded-xl sm:px-10 border border-white border-opacity-30">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4"
              >
                <Mail className="h-6 w-6 text-indigo-600" />
              </motion.div>

              <motion.h2
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 mb-2"
              >
                Reset Your Password
              </motion.h2>

              <motion.p
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-600 mb-6"
              >
                Enter your new password below
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center bg-indigo-50 rounded-lg py-2 px-4 mb-6"
              >
                <span className="text-indigo-700 font-medium">{resetData.email}</span>
              </motion.div>
            </div>

            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              {/* New Password Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    {...formik.getFieldProps('password')}
                    className={`block w-full px-4 py-3 rounded-xl bg-white bg-opacity-70 backdrop-blur-sm ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm pr-12`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <motion.p
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {formik.errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...formik.getFieldProps('confirmPassword')}
                    className={`block w-full px-4 py-3 rounded-xl bg-white bg-opacity-70 backdrop-blur-sm ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm pr-12`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <motion.p
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {formik.errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>

              {/* Reset Password Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </motion.div>

              {/* Remember Password Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-sm"
              >
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Remember your password? Sign in
                </Link>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}