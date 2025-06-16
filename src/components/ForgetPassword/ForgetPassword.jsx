import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, RotateCw, Check, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../../Context/UserContext.jsx';


const ForgetPassword = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [forgetCode, setForgetCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeStatus, setCodeStatus] = useState(null); // null | 'valid' | 'invalid'
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema,
    onSubmit: async ({ email }) => {
      try {
        setApiError("");
        setLoading(true);
        const { data } = await axios.post(
          'https://knowledge-sharing-pied.vercel.app/user/forgetPassword',
          { email }
        );

        if (data.success) {
          setForgetCode(data.forgetCode);
          setShowCodeDialog(true);
          setCountdown(60);
          setCodeStatus(null);
          setEnteredCode('');
          toast.success('Verification code sent to your email!');
        }
      } catch (error) {
        console.log(error);
        setApiError(error.response?.data?.error);

      } finally {
        setLoading(false);
      }
    },
  });
  const handleBackFromHere = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      const { data } = await axios.post(
        'https://knowledge-sharing-pied.vercel.app/user/forgetPassword',
        { email: formik.values.email }
      );

      if (data.success) {
        setForgetCode(data.forgetCode);
        setCountdown(60);
        setCodeStatus(null);
        setEnteredCode('');
        toast.success('New code sent!');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const verifyCode = async () => {
    const trimmedCode = enteredCode.trim();

    if (trimmedCode.length !== 5) {
      setCodeStatus('invalid');
      toast.error('Please enter a valid 5-digit code');
      return;
    }

    try {
      setIsVerifying(true);
      const isValid = trimmedCode === forgetCode;

      if (isValid) {
        setCodeStatus('valid');
        toast.success('Code verified successfully!');

        localStorage.setItem(
          'resetPasswordData',
          JSON.stringify({
            email: formik.values.email,
            forgetCode: forgetCode,
          })
        );

        await new Promise((res) => setTimeout(res, 1000));
        navigate('/reset-password');
      } else {
        setCodeStatus('invalid');
        toast.error('Invalid code. Please try again.');
      }
    } catch {
      setCodeStatus('invalid');
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
      {/* Animated Background */}

      <div className="absolute inset-0 overflow-hidden">
        <button
          onClick={handleBackFromHere}
          className="cursor-pointer flex items-center text-indigo-600 hover:text-indigo-500 m-6 group"
        >
          <motion.div
            whileHover={{ x: -3 }}
            className="flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:text-indigo-700 transition-colors" />
            <span>Back from here</span>
          </motion.div>
        </button>
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, x: Math.random() * 100 }}
            animate={{
              y: [0, Math.random() * 100 - 50, 0],
              x: [Math.random() * 100, Math.random() * 100 - 50, Math.random() * 100],
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
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

      {/* Main Form */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-xl border border-white border-opacity-30"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center rounded-t-3xl">
            <h1 className="text-3xl font-bold text-white">Reset Password</h1>
            <p className="text-indigo-100 mt-2">Enter your email to receive a reset code</p>
          </div>

          <div className="p-8">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className={`w-full px-4 py-3 rounded-xl bg-white bg-opacity-70 backdrop-blur-sm ${formik.touched.email && formik.errors.email
                    ? 'border-red-500'
                    : 'border-gray-200'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm`}
                  placeholder="your@email.com"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>
              {apiError && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending Code...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>

              {/* Error message display */}


            </form>
          </div>
        </motion.div>
      </div>

      {/* Verification Modal */}
      {showCodeDialog && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                  <Mail className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Enter Verification Code</h3>
                <p className="text-gray-600 mt-2">
                  Sent to <span className="font-medium">{formik.values.email}</span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">5-digit Code</label>
                <div className="relative">
                  <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '');
                      if (onlyDigits.length <= 5) {
                        setEnteredCode(onlyDigits);
                        setCodeStatus(null);
                      }
                    }}
                    maxLength={5}
                    className={`w-full px-4 py-3 rounded-xl border ${codeStatus === 'valid'
                      ? 'border-green-500 bg-green-50'
                      : codeStatus === 'invalid'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    placeholder="12345"
                  />
                  {codeStatus === 'valid' && <Check className="absolute right-3 top-3 h-5 w-5 text-green-500" />}
                  {codeStatus === 'invalid' && <X className="absolute right-3 top-3 h-5 w-5 text-red-500" />}
                </div>
                {codeStatus === 'invalid' && (
                  <p className="mt-2 text-sm text-red-600">Invalid code. Please try again.</p>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={handleResendCode}
                  disabled={resendLoading || countdown > 0}
                  className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center disabled:opacity-50"
                >
                  <RotateCw className={`h-4 w-4 mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </button>
                <button
                  onClick={() => setShowCodeDialog(false)}
                  className="text-sm text-gray-600 hover:text-gray-500"
                >
                  Change Email
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCodeDialog(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyCode}
                  disabled={isVerifying || enteredCode.length !== 5}
                  className="flex-1 py-2 px-4 bg-indigo-700 text-white rounded-xl hover:bg-indigo-800 transition-colors disabled:opacity-70 flex items-center justify-center"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>
            </div>

          </motion.div>
        </div>

      )}
    </div>
  );
};

export default ForgetPassword;
