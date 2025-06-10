import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineArrowLeft, AiOutlineLock, AiOutlineKey, AiOutlineMail } from "react-icons/ai";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], "Passwords must match")
    .required("Confirm Password is required"),
  forgetCode: Yup.string()
    .required("Reset code is required")
});

export default function AdminResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      forgetCode: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        formik.setStatus(null);
        const res = await axios.put(
          "https://knowledge-sharing-pied.vercel.app/admin/resetPassword",
          values
        );
        toast.success(res.data.message || "Password reset successfully!");
        setTimeout(() => navigate("/admin/login"), 1500);
      } catch (err) {
        formik.setStatus(
          err.response?.data?.message || "Reset failed. Please check your details."
        );
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center relative">
            <Link
              to="/admin/forgetPassword"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
            >
              <AiOutlineArrowLeft className="h-5 w-5" />
            </Link>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
              <AiOutlineLock className="text-white text-2xl" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">
              Reset Password
            </h1>
            <p className="text-white/80 mt-1">
              Enter your new password and verification code
            </p>
          </div>

          <div className="p-8">
            {formik.status && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg"
              >
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2 text-sm text-red-100">
                    {formik.status}
                  </span>
                </div>
              </motion.div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineMail className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder="admin@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${formik.touched.email && formik.errors.email
                        ? "border-red-400 focus:ring-red-400"
                        : "border-white/10 focus:ring-indigo-400"
                      } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-300"
                  >
                    {formik.errors.email}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineLock className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-white/5 border ${formik.touched.password && formik.errors.password
                        ? "border-red-400 focus:ring-red-400"
                        : "border-white/10 focus:ring-indigo-400"
                      } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <AiFillEyeInvisible className="h-5 w-5" />
                    ) : (
                      <AiFillEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-300"
                  >
                    {formik.errors.password}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineLock className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.confirmPassword}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-white/5 border ${formik.touched.confirmPassword && formik.errors.confirmPassword
                        ? "border-red-400 focus:ring-red-400"
                        : "border-white/10 focus:ring-indigo-400"
                      } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <AiFillEyeInvisible className="h-5 w-5" />
                    ) : (
                      <AiFillEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-300"
                  >
                    {formik.errors.confirmPassword}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineKey className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    name="forgetCode"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.forgetCode}
                    placeholder="Enter verification code"
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${formik.touched.forgetCode && formik.errors.forgetCode
                        ? "border-red-400 focus:ring-red-400"
                        : "border-white/10 focus:ring-indigo-400"
                      } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                </div>
                {formik.touched.forgetCode && formik.errors.forgetCode && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-300"
                  >
                    {formik.errors.forgetCode}
                  </motion.p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={formik.isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${formik.isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition-all`}
              >
                {formik.isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/70">
                Remember your password?{" "}
                <Link
                  to="/admin/login"
                  className="font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/50">
                    Secure Password Reset
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}