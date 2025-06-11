import React, { useEffect, useState } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdmin } from "../../Context/AdminContext.jsx";

const FlaggedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRemove, setLoadingRemove] = useState("");
  const [loadingDeactivate, setLoadingDeactivate] = useState("");
  const { admin } = useAdmin();
  const token = admin?.token;

  useEffect(() => {
    const fetchFlaggedPosts = async () => {
      try {
        const res = await axios.get(
          "https://knowledge-sharing-pied.vercel.app/admin/flaggedPosts",
          { headers: { token } }
        );
        setPosts(res.data.results.flaggedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err.response?.data?.message || "Failed to fetch flagged posts");
        toast.error(err.response?.data?.message || "Failed to fetch flagged posts");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchFlaggedPosts();
    } else {
      setError("Authentication required. Please log in.");
      setLoading(false);
    }
  }, [token]);

  const removePost = async (postId) => {
    setLoadingRemove(postId);
    try {
      await axios.delete(
        `https://knowledge-sharing-pied.vercel.app/admin/remove-post/${postId}`,
        { headers: { token } }
      );
      toast.success("Post removed successfully");
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove post");
    } finally {
      setLoadingRemove("");
    }
  };

  const deactivateUser = async (postId) => {
    setLoadingDeactivate(postId);
    try {
      await axios.put(
        `https://knowledge-sharing-pied.vercel.app/admin/deactivate_user/${postId}`,
        {},
        { headers: { token } }
      );
      toast.success("User deactivated successfully");
      // Optionally update the posts list if needed
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deactivate user");
    } finally {
      setLoadingDeactivate("");
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
        <div className="text-red-500 text-xl">{error}</div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-3xl font-bold text-gray-700">
          No Flagged Posts Available
        </h2>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Flagged Posts</h2>
        <p className="text-gray-500">
          {posts.length} {posts.length === 1 ? "post" : "posts"} flagged
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
              <p className="text-gray-700 mt-2">{post.content}</p>
            </div>

            <div className="flex flex-wrap justify-between items-center text-sm text-gray-500">
              <div>
                <p>Posted by: {post.author?.name || "Unknown user"}</p>
                <p>Posted on: {new Date(post.createdAt).toLocaleString()}</p>
              </div>
              <p>Post ID: {post._id}</p>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => removePost(post._id)}
                className={`px-4 py-2 rounded-md ${loadingRemove === post._id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
                  } text-white transition-colors`}
                disabled={loadingRemove === post._id}
              >
                {loadingRemove === post._id ? (
                  <span className="flex items-center gap-2">
                    <ThreeDots height="20" width="20" color="#fff" />
                    Removing...
                  </span>
                ) : (
                  "Remove Post"
                )}
              </button>

              <button
                onClick={() => deactivateUser(post._id)}
                className={`px-4 py-2 rounded-md ${loadingDeactivate === post._id
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
                  } text-white transition-colors`}
                disabled={loadingDeactivate === post._id}
              >
                {loadingDeactivate === post._id ? (
                  <span className="flex items-center gap-2">
                    <ThreeDots height="20" width="20" color="#fff" />
                    Deactivating...
                  </span>
                ) : (
                  "Deactivate User"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlaggedPosts;