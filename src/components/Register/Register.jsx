import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaUserCircle, FaUserMd, FaUser, FaUpload, FaIdCard } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useUser } from '../../Context/UserContext.jsx';

const Register = () => {
  const { updateUser } = useUser();
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewNationalId, setPreviewNationalId] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringId, setIsHoveringId] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(25, 'Name must be less than 25 characters')
      .required('Name is required'),

    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),

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

    profileImage: Yup.mixed()
      .nullable()
      .test(
        'fileSize',
        'File too large (max 2MB)',
        value => !value || (value && value.size <= 2 * 1024 * 1024)
      )
      .test(
        'fileFormat',
        'Unsupported Format (use JPG, JPEG, or PNG)',
        value => !value || (value && ['image/jpg', 'image/jpeg', 'image/png'].includes(value.type))
      ),

    role: Yup.string()
      .oneOf(['doctor', 'user'], 'Select a valid role')
      .required('Role is required'),

    nationalID: Yup.mixed()
      .nullable()
      .when('role', (role, schema) => {
        if (role === 'doctor') {
          return schema
            .required('National ID image is required for doctors')
            .test(
              'fileSize',
              'File too large (max 2MB)',
              value => value && value.size <= 2 * 1024 * 1024
            )
            .test(
              'fileFormat',
              'Unsupported Format (use JPG, JPEG, or PNG)',
              value => value && ['image/jpg', 'image/jpeg', 'image/png'].includes(value.type)
            );
        }
        return schema;
      })

  });


  const handleRegister = async (values) => {
    try {
      setIsLoading(true);
      setApiError("");
      const formData = new FormData();

      // Add text fields
      formData.append('email', values.email.trim());
      formData.append('name', values.name.trim());
      formData.append('password', values.password);
      formData.append('confirmPassword', values.confirmPassword);
      formData.append('role', values.role);

      // Add profile image if exists
      if (values.profileImage) {
        formData.append('profileImage', values.profileImage);
      }

      // Only add nationalID for doctors
      if (values.role === 'doctor' && values.nationalID) {
        formData.append('nationalID', values.nationalID);
      }

      const response = await axios.post(
        'https://knowledge-sharing-pied.vercel.app/user/register',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        setApiSuccess(true);
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => {
          setApiSuccess(false); // optional cleanup
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';
      setApiError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue('profileImage', file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  const handleNationalIdChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue('nationalID', file);
    setPreviewNationalId(file ? URL.createObjectURL(file) : null);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      profileImage: null,
      role: 'user',
      nationalID: null
    },
    validationSchema,
    onSubmit: handleRegister,
  });

  const roleIcons = {
    user: <FaUser className="mr-2 text-indigo-500" />,
    doctor: <FaUserMd className="mr-2 text-indigo-500" />,
  };

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
          className="relative z-10 w-full max-w-3xl"
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
                Join Our Community
              </motion.h1>
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-indigo-100 mt-2"
              >
                Create your account to get started
              </motion.p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Profile Image Upload */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center"
                >
                  <label
                    htmlFor="profileImage"
                    className="cursor-pointer group"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <div className="relative">
                      {previewImage ? (
                        <motion.img
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          src={previewImage}
                          alt="Profile preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white border-opacity-50 group-hover:border-opacity-80 transition-all duration-300 shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-white bg-opacity-30 flex items-center justify-center border-4 border-white border-opacity-50 group-hover:border-opacity-80 transition-all duration-300 shadow-md">
                          <FaUserCircle className="text-gray-500 text-5xl" />
                        </div>
                      )}
                      <motion.div
                        animate={{
                          scale: isHovering ? 1.1 : 1,
                          backgroundColor: isHovering ? 'rgba(99, 102, 241, 0.9)' : 'rgba(99, 102, 241, 0.7)'
                        }}
                        className="absolute -bottom-2 -right-2 bg-indigo-500 bg-opacity-70 rounded-full p-3 transition-all duration-300 shadow-md"
                      >
                        <FaUpload className="h-4 w-4 text-white" />
                      </motion.div>
                    </div>
                    <input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </motion.div>
                {formik.touched.profileImage && formik.errors.profileImage && (
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-red-500 text-xs text-center mt-3"
                  >
                    {formik.errors.profileImage}
                  </motion.div>
                )}

                {/* Name Field */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.name}
                      className={`block w-full px-4 py-3 rounded-xl bg-white bg-opacity-70 backdrop-blur-sm ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all duration-300 shadow-sm`}
                      placeholder="John Doe"
                    />
                    <motion.div
                      animate={{
                        width: formik.touched.name && formik.errors.name ? '100%' : '0%',
                        opacity: formik.touched.name && formik.errors.name ? 1 : 0
                      }}
                      className="absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300"
                    />
                  </div>
                  {formik.touched.name && formik.errors.name && (
                    <motion.div
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-red-500 text-xs mt-3 ml-1"
                    >
                      {formik.errors.name}
                    </motion.div>
                  )}
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
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
                      className="text-red-500 text-xs mt-3 ml-1"
                    >
                      {formik.errors.email}
                    </motion.div>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
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
                      className="text-red-500 text-xs mt-3 ml-1"
                    >
                      {formik.errors.password}
                    </motion.div>
                  )}
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.confirmPassword}
                      className={`block w-full px-4 py-3 rounded-xl bg-white bg-opacity-70 backdrop-blur-sm ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-transparent'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all duration-300 shadow-sm pr-12`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-gray-500 hover:text-indigo-600 transition-colors" />
                      ) : (
                        <FaEye className="h-5 w-5 text-gray-500 hover:text-indigo-600 transition-colors" />
                      )}
                    </button>
                    <motion.div
                      animate={{
                        width: formik.touched.confirmPassword && formik.errors.confirmPassword ? '100%' : '0%',
                        opacity: formik.touched.confirmPassword && formik.errors.confirmPassword ? 1 : 0
                      }}
                      className="absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300"
                    />
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <motion.div
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-red-500 text-xs mt-3 ml-1"
                    >
                      {formik.errors.confirmPassword}
                    </motion.div>
                  )}
                </motion.div>

                {/* Role Selection */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                    I am joining as:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['user', 'doctor'].map((role) => (
                      <motion.label
                        key={role}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${formik.values.role === role
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                          : 'bg-white bg-opacity-70 border-gray-200 hover:border-indigo-300 text-gray-700'
                          } border backdrop-blur-sm shadow-sm`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={formik.values.role === role}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm font-medium capitalize flex items-center">
                          {roleIcons[role]}
                          {role}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                  {formik.touched.role && formik.errors.role && (
                    <motion.div
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-red-500 text-xs mt-3 ml-1"
                    >
                      {formik.errors.role}
                    </motion.div>
                  )}
                </motion.div>

                {/* National ID Image Upload - Only shown for doctors */}
                {formik.values.role === 'doctor' && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      Doctor's National ID Image
                    </label>
                    <div className="text-xs text-gray-500 mb-2 ml-1">
                      Upload a clear photo of your government-issued medical ID
                    </div>
                    <label
                      htmlFor="nationalID"
                      className="cursor-pointer group"
                      onMouseEnter={() => setIsHoveringId(true)}
                      onMouseLeave={() => setIsHoveringId(false)}
                    >
                      <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${formik.touched.nationalID && formik.errors.nationalID ? 'border-red-500' : 'border-gray-300 hover:border-indigo-400'} bg-white bg-opacity-70 backdrop-blur-sm`}>
                        {previewNationalId ? (
                          <div className="relative">
                            <motion.img
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              src={previewNationalId}
                              alt="National ID preview"
                              className="w-full h-32 object-contain rounded-lg mb-2"
                            />
                            <motion.div
                              animate={{
                                scale: isHoveringId ? 1.1 : 1,
                                backgroundColor: isHoveringId ? 'rgba(99, 102, 241, 0.9)' : 'rgba(99, 102, 241, 0.7)'
                              }}
                              className="absolute top-2 right-2 bg-indigo-500 bg-opacity-70 rounded-full p-2 transition-all duration-300 shadow-md"
                            >
                              <FaUpload className="h-3 w-3 text-white" />
                            </motion.div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6">
                            <FaIdCard className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                              Click to upload National ID
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, JPEG, or PNG (max 2MB)
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        id="nationalID"
                        name="nationalID"
                        type="file"
                        accept="image/*"
                        onChange={handleNationalIdChange}
                        className="hidden"
                      />
                    </label>
                    {formik.touched.nationalID && formik.errors.nationalID && (
                      <motion.div
                        initial={{ y: -5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-red-500 text-xs mt-1 ml-1"
                      >
                        {formik.errors.nationalID}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
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
                        User Created Successfully...
                      </>
                    ) : isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </motion.div>

                {/* Login Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="text-center text-sm text-gray-600"
                >
                  Already have an account?{' '}
                  <Link
                    to={"/login"}
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Sign in
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
          duration: 4000,
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

export default Register; 