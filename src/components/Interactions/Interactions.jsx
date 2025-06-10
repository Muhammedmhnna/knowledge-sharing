import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaComment, FaBookmark, FaStar, FaHeart } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Interactions({ postId }) {
  const token = localStorage.getItem("token");
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [likeCounts, setLikeCounts] = useState({});
  const [ratingCounts, setRatingCounts] = useState({});

  // ✅ Like Post
  const handleLikePost = async (postId) => {
    setIsLoadingLike(true);
    if (likeCounts[postId] && likeCounts[postId] > 0) {
      toast.info("You already liked this post.");
      setIsLoadingLike(false);
      return;
    }
    try {
      await axios.post(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/like`,
        {},
        {
          headers: {
            token: `noteApp__${token}`,
          },
        }
      );
      toast.success("Post liked!");
      getLikesCount(postId);
    } catch (error) {
      toast.error("Failed to like post.");
    } finally {
      setIsLoadingLike(false);
    }
  };

  // ✅ Save Post
  const handleSavePost = async (postId) => {
    setIsLoadingSave(true);
    try {
      await axios.post(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/save`,
        {},
        {
          headers: {
            token: `noteApp__${token}`,
          },
        }
      );
      toast.success("Post saved!");
    } catch (error) {
      toast.error("Failed to save post.");
    } finally {
      setIsLoadingSave(false);
    }
  };

  // ✅ Rate Post
  const handleRatePost = async (postId, rating) => {
    setIsLoadingRate(true);
    if (ratingCounts[postId] && ratingCounts[postId] > 0) {
      toast.info("You already rated this post.");
      setIsLoadingRate(false);
      return;
    }
    try {
      await axios.post(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/rate`,
        { rating },
        {
          headers: {
            token: `noteApp__${token}`,
          },
        }
      );
      toast.success("Post rated!");
      getRatingsCount(postId);
    } catch (error) {
      toast.error("Failed to rate post.");
    } finally {
      setIsLoadingRate(false);
    }
  };

  // ✅ Get Like Count
  const getLikesCount = async (postId) => {
    try {
      const response = await axios.get(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/likes_count`
      );
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: response.data.likesCount,
      }));
    } catch (error) {
      console.error("Error fetching like count:", error);
    }
  };

  // ✅ Get Rating Count
  const getRatingsCount = async (postId) => {
    try {
      const response = await axios.get(
        `https://knowledge-sharing-pied.vercel.app/interaction/${postId}/ratings_count`
      );
      setRatingCounts((prev) => ({
        ...prev,
        [postId]: response.data.ratingCounts,
      }));
    } catch (error) {
      console.error("Error fetching rating count:", error);
    }
  };

  useEffect(() => {
    getLikesCount(postId);
    getRatingsCount(postId);
  }, [postId]);

  return (
    <div className="flex mt-3 space-x-4">
      <ToastContainer />
      <button
        onClick={() => handleLikePost(postId)}
        className="flex items-center space-x-1 text-red-500 hover:text-red-700"
        title="Like"
      >
        <FaHeart />
        <span>{likeCounts[postId] || 0}</span>
      </button>

      <button
        className="flex items-center space-x-1 text-blue-500 cursor-default"
        title="Comment"
      >
        <FaComment />
        <span>0</span>
      </button>

      <button
        onClick={() => {
          const userRating = prompt("Rate this post from 1 to 5:");
          const ratingValue = parseInt(userRating);
          if (ratingValue >= 1 && ratingValue <= 5) {
            handleRatePost(postId, ratingValue);
          } else {
            toast.error("Invalid rating. Please enter 1 to 5.");
          }
        }}
        className="flex items-center space-x-1 text-yellow-500 hover:text-yellow-700"
        title="Rate"
      >
        <FaStar />
        <span>{ratingCounts[postId] || 0}</span>
      </button>

      <button
        onClick={() => handleSavePost(postId)}
        className="flex items-center space-x-1 text-purple-500 hover:text-purple-700"
        title="Save"
      >
        <FaBookmark />
      </button>
    </div>
  );
}
