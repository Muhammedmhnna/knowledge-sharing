import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineLock,
  AiOutlineMail,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useAdmin } from "../../Context/AdminContext.jsx";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { admin, updateAdmin } = useAdmin();
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState(false);

  useEffect(() => {
    if (admin?.token) {
      navigate("/admin/dashboard");
    }
  }, [admin, navigate]);

  const handleLogin = async (formValues) => {
    setIsLoading(true);
    setApiError("");
    setApiSuccess(false);

    try {
      const response = await axios.post(
        "https://knowledge-sharing-pied.vercel.app/admin/login",
        formValues
      );

      setApiSuccess(true);
      toast.success("Login successful! Redirecting...");

      const { token, admin: adminData } = response.data;

      // استدعاء updateAdmin لحفظ البيانات في context و localStorage
      updateAdmin({
        ...adminData,
        token: token.startsWith("noteApp__") ? token : `noteApp__${token}`,
      });

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (error) {
      setApiError(error.response?.data?.error || "Invalid email or password");
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: handleLogin,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
          {/* Decorative header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
              <AiOutlineLock className="text-white text-2xl" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-white/80 mt-1">
              Secure access to your dashboard
            </p>
          </div>

          <div className="p-8">
            {/* Success Message */}
            {apiSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-green-500/10 border-l-4 border-green-500 p-4 rounded-lg"
              >
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2 text-sm text-green-100">
                    Login successful! Redirecting...
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {apiError && (
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
                  <span className="ml-2 text-sm text-red-100">{apiError}</span>
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
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder="admin@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${
                      formik.touched.email && formik.errors.email
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
                  Password
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
                    className={`w-full pl-10 pr-12 py-3 bg-white/5 border ${
                      formik.touched.password && formik.errors.password
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-400 focus:ring-indigo-400 border-white/20 rounded bg-white/5"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-white/70"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  to="/admin/forgetPassword"
                  className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: apiSuccess ? 1 : 1.02 }}
                whileTap={{ scale: apiSuccess ? 1 : 0.98 }}
                type="submit"
                disabled={isLoading || apiSuccess}
                className={`w-full flex justify-center items-center py-4 px-6 rounded-xl text-sm font-medium text-white transition-all duration-300 shadow-lg ${
                  apiSuccess
                    ? "bg-green-500 hover:bg-green-600 cursor-default"
                    : isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                }`}
              >
                {apiSuccess ? (
                  <>
                    <svg
                      className="h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">Logged In Successfully</span>
                  </>
                ) : isLoading ? (
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
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/50">
                    Secure Admin Portal
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
