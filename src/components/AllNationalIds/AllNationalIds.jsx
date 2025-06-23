import React, { useEffect, useState } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdmin } from "../../Context/AdminContext.jsx";
import { FiCheckCircle, FiClock, FiUser, FiMail, FiFileText, FiXCircle } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import Swal from 'sweetalert2';


export default function AllNationalIds() {
  const [nationalIds, setNationalIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingStates, setLoadingStates] = useState({
    verify: null,
    reject: null
  });
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

  // Make sure to import Swal at the top of your file:
  // import Swal from 'sweetalert2';

  const handleVerify = async (userId, doctorName) => {
    setLoadingStates(prev => ({ ...prev, verify: userId }));

    try {
      const response = await axios.put(
        `https://knowledge-sharing-pied.vercel.app/admin/verifyDoctor/${userId}`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setNationalIds((prev) => prev.filter((item) => item._id !== userId));
        // Success popup
        await Swal.fire({
          title: 'Verification Successful',
          html: response.data.message || `Dr. <strong>${doctorName}</strong> has been verified successfully`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 3000,
          showConfirmButton: false,
          background: '#f8f9fa',
          iconColor: '#28a745'
        });
      } else {
        // Error popup
        await Swal.fire({
          title: 'Verification Failed',
          text: response.data.message || "Verification failed, please try again",
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    } catch (err) {
      // Error popup
      await Swal.fire({
        title: 'Error',
        html: err.response?.data?.message || "An error occurred during verification",
        icon: 'error',
        confirmButtonColor: '#dc3545',
        background: '#f8f9fa'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, verify: null }));
    }
  };
  const handleReject = async (userId, doctorName) => {
    // Styled confirm popup (replaces window.confirm)
    const confirmResult = await Swal.fire({
      title: 'Confirm Rejection',
      html: `Are you sure you want to reject <strong>Dr. ${doctorName}</strong>'s application?<br><br>
             <span style="color: #dc3545;">This action cannot be undone.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      focusCancel: true,
      backdrop: 'rgba(0,0,0,0.4)'
    });

    if (!confirmResult.isConfirmed) return;

    setLoadingStates(prev => ({ ...prev, reject: userId }));

    try {
      const response = await axios.delete(
        `https://knowledge-sharing-pied.vercel.app/admin/rejectDoctor/${userId}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setNationalIds((prev) => prev.filter((item) => item._id !== userId));
        // Styled success popup (replaces toast.success)
        await Swal.fire({
          title: 'Success',
          html: response.data.message || `Dr. ${doctorName}'s application has been <strong>rejected</strong>`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 3000
        });
      } else {
        // Styled error popup (replaces toast.error)
        await Swal.fire({
          title: 'Error',
          html: response.data.message || 'Failed to reject application',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    } catch (err) {
      // Styled error popup (replaces toast.error)
      await Swal.fire({
        title: 'Error',
        html: err.response?.data?.message || 'An error occurred',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, reject: null }));
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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
                            <span>Submitted: {new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>                          </div>
                        </div>
                      </div>

                      {!item.isVerified && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(item._id, item.name)}
                            disabled={loadingStates.verify === item._id || loadingStates.reject === item._id}
                            className={`px-5 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${loadingStates.verify === item._id
                              ? "bg-indigo-400 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700"
                              } transition-colors shadow-sm`}
                          >
                            {loadingStates.verify === item._id ? (
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

                          <button
                            onClick={() => handleReject(item._id, item.name)}
                            disabled={loadingStates.reject === item._id || loadingStates.verify === item._id}
                            className={`px-5 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${loadingStates.reject === item._id
                              ? "bg-red-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                              } transition-colors shadow-sm`}
                          >
                            {loadingStates.reject === item._id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <FiXCircle className="text-lg" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
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