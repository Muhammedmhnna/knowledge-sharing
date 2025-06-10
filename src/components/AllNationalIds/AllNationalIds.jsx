import React, { useEffect, useState } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdmin } from "../../Context/AdminContext.jsx";
import { FiCheckCircle, FiClock, FiUser, FiMail, FiFileText } from "react-icons/fi";
import { MdVerified } from "react-icons/md";

export default function AllNationalIds() {
  const [nationalIds, setNationalIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(null);
  const { admin } = useAdmin();
  const token = admin?.token;

  useEffect(() => {
    if (!token) {
      setError("No token provided. Please log in.");
      setLoading(false);
      return;
    }

    const fetchNationalIds = async () => {
      try {
        const res = await axios.get(
          "https://knowledge-sharing-pied.vercel.app/admin/AllNationalIds",
          { headers: { token } }
        );
        setNationalIds(res.data.data);
      } catch (err) {
        console.error("Error fetching national IDs:", err);
        setError(err.response?.data?.message || "Failed to fetch national IDs");
      } finally {
        setLoading(false);
      }
    };

    fetchNationalIds();
  }, [token]);

  const handleVerify = async (userId, doctorName) => {
    setLoadingVerify(userId);
    try {
      const response = await axios.put(
        `https://knowledge-sharing-pied.vercel.app/admin/verifyDoctor/${userId}`,
        {},
        { headers: { token } }
      );

      // تحقق من الـ success أولاً
      if (response.data.success) {
        // لو true: امسحه من القائمة
        setNationalIds((prev) => prev.filter((item) => item._id !== userId));
        toast.success(response.data.message || `Dr. ${doctorName} تم توثيقه بنجاح ✅`);
      } else {
        // لو false: اظهر رسالة خطأ (مش هتحذفه)
        toast.error(response.data.message || "فشل التوثيق، حاول مرة أخرى");
      }
    } catch (err) {
      // لو حصل error في الـ request أصلاً
      toast.error(err.response?.data?.message || "حدث خطأ أثناء التوثيق");
    } finally {
      setLoadingVerify(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeDots height="80" width="80" color="#4f46e5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl bg-red-50 p-6 rounded-lg shadow-sm max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Doctor Verification</h1>
          <p className="text-gray-500 mt-2">Review and verify doctor credentials</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
          {nationalIds.length} {nationalIds.length === 1 ? "Submission" : "Submissions"}
        </div>
      </div>

      {nationalIds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiFileText className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">No verification requests</h3>
          <p className="text-gray-500 mt-1">All pending national IDs have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {nationalIds.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-64 h-48 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                    <img
                      src={item.nationalID.url}
                      alt={`National ID of ${item.name}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          {item.name}
                          {item.isVerified && (
                            <span className="text-green-500 text-sm bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                              <MdVerified className="text-base" />
                              Verified
                            </span>
                          )}
                        </h3>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center text-gray-600">
                            <FiMail className="mr-2 text-gray-400" />
                            <span>{item.email}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FiUser className="mr-2 text-gray-400" />
                            <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {!item.isVerified && (
                        <button
                          onClick={() => handleVerify(item._id, item.name)}
                          disabled={loadingVerify === item._id}
                          className={`px-5 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${loadingVerify === item._id
                            ? "bg-indigo-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700"
                            } transition-colors shadow-sm`}
                        >
                          {loadingVerify === item._id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="text-lg" />
                              Approve
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!item.isVerified && (
                <div className="bg-yellow-50 border-t border-yellow-100 px-6 py-3 flex items-center text-yellow-700">
                  <FiClock className="mr-2" />
                  <span className="text-sm font-medium">Pending verification</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}