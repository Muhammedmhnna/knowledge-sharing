import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useUser } from '../../Context/UserContext.jsx';

const Login = () => {
  const { user, updateUser } = useUser();
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required'),
  });

  const handleLogin = async (formValues) => {
    setIsLoading(true);
    try {
      const apiResponse = await axios.post("https://knowledge-sharing-pied.vercel.app/user/login", formValues);

      setApiSuccess(apiResponse?.data?.message);
      setApiError("");

      const { token, user } = apiResponse.data;

      const userData = {
        ...user,
        token,
      };

      updateUser(userData);

      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Login failed. Please try again.";
      setApiError(errorMessage);
      setApiSuccess("");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: handleLogin,
  });

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
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

        {/* Main Form Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-xl"
        >
          {/* Glassmorphic Card */}
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white border-opacity-30">
            {/* Form Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white"
              >
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-indigo-100 mt-2"
              >
                Sign in to your account
              </motion.p>
            </div>

            {/* Form Content */}
            <div className="p-8">

              <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Email Field */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      className={`block w-full px-4 py-3 rounded-xl bg-white bg-opacity-70 backdrop-blur-sm ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all duration-300 shadow-sm`}
                      placeholder="your@email.com"
                    />
                    <motion.div
                      animate={{
                        width: formik.touched.email && formik.errors.email ? '100%' : '0%',
                        opacity: formik.touched.email && formik.errors.email ? 1 : 0
                      }}
                      className="absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300"
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <motion.div
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-red-500 text-xs mt-1 ml-1"
                    >
                      {formik.errors.email}
                    </motion.div>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                      className={`block w-full px-4 py-3 rounded-xl bg-white bg-opacity-70 backdrop-blur-sm ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all duration-300 shadow-sm pr-12`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-gray-500 hover:text-indigo-600 transition-colors" />
                      ) : (
                        <FaEye className="h-5 w-5 text-gray-500 hover:text-indigo-600 transition-colors" />
                      )}
                    </button>
                    <motion.div
                      animate={{
                        width: formik.touched.password && formik.errors.password ? '100%' : '0%',
                        opacity: formik.touched.password && formik.errors.password ? 1 : 0
                      }}
                      className="absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300"
                    />
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <motion.div
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-red-500 text-xs mt-1 ml-1"
                    >
                      {formik.errors.password}
                    </motion.div>
                  )}
                </motion.div>

                {/* Forgot Password Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-right"
                >
                  <Link
                    to="/forget-password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <button
                    type='submit'
                    disabled={isLoading || apiSuccess}
                    className={`w-full flex justify-center items-center py-4 px-6 rounded-xl text-sm font-medium text-white transition-all duration-300 shadow-lg ${apiSuccess
                      ? 'bg-green-500 hover:bg-green-600'
                      : isLoading
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                      }`}
                  >
                    {apiSuccess ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </>
                    ) : isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </motion.div>

                {/* Register Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center text-sm text-gray-600"
                >
                  Don't have an account?{' '}
                  <Link
                    to={"/register"}
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: 'bg-white text-gray-800 shadow-lg rounded-xl',
          duration: 2000,
          style: {
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          },
        }}
      />
    </>
  );
};

export default Login;