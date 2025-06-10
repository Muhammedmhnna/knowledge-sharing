import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { useUser } from "../../Context/UserContext";

export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const token = user?.token;

  // Get current post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `https://knowledge-sharing-pied.vercel.app/post/list_specific/${postId}`
        );

        const post = response.data.post;

        setTitle(post.title);
        setContent(post.content);
      } catch (err) {
        toast.error("Failed to load post.");
      }
    };

    fetchPost();
  }, [postId]);

  // Handle form submit with validation
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title && !content && !files) {
      toast.error("No changes detected.");
      return;
    }



    if (!token) {
      toast.error("You must be logged in to update a post.");
      return;
    }

    const formData = new FormData();

    if (title) formData.append("title", title);

    if (content) formData.append("content", content);

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    setIsLoading(true);

    try {
      await axios.put(
        `https://knowledge-sharing-pied.vercel.app/post/update/${postId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: token,
          },
        }
      );
      toast.success("Post updated successfully!");
      navigate("/post");
    } catch (err) {
      toast.error("Failed to update post.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl m-8 border border-white/20 relative overflow-hidden">
      {/* Decorative floating elements (optional) */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/10 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-400/10 rounded-full filter blur-3xl"></div>

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Edit Your Post
        </h2>
        <p className="text-gray-500/90">Refine your thoughts and share with the world ✨</p>
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-6 relative z-10">
        {/* Title Field */}
        <div className="group relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder=" "
            className="w-full px-4 py-3 bg-white/70 rounded-xl border border-gray-200/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 outline-none transition-all peer"
          />
          <label className="absolute left-3 px-1 text-gray-400 pointer-events-none transition-all duration-200 
                       peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                       peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 peer-focus:bg-white
                       -top-2.5 text-sm text-blue-600 bg-white">
            Post Title
          </label>
        </div>

        {/* Content Field */}
        <div className="group relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder=" "
            className="w-full px-4 py-3 bg-white/70 rounded-xl border border-gray-200/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 h-48 resize-none outline-none transition-all peer"
          ></textarea>
          <label className="absolute left-3 px-1 text-gray-400 pointer-events-none transition-all duration-200 
                       peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                       peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 peer-focus:bg-white
                       -top-2.5 text-sm text-blue-600 bg-white">
            What's on your mind?
          </label>
        </div>

        {/* File Upload & Submit */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Custom File Upload Button */}
          <label className="flex-1 cursor-pointer">
            <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl border border-gray-200/80 flex items-center justify-center gap-2 transition-all hover:shadow-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {files?.length > 0 ? `${files.length} files selected` : "Add Attachments"}
              </span>
              <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="hidden" />
            </div>
          </label>

          {/* Submit Button (3D Effect) */}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-blue-300/40 active:scale-95 transition-all transform flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <ClipLoader size={20} color={"#ffffff"} />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span>Update Post</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
