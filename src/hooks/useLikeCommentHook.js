import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import socket from "../api/socketConfig";
import api from "../api/axiosConfig";

export const useLikeCommentHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [likeComments, setLikeComments] = useState([]);
  useEffect(() => {
    getLikeComments();
  }, []);

  // Fetch all like comments
  const getLikeComments = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/like-comments", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = response.data.data;
      setLikeComments(data);
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single like comment
  const getLikeComment = async (likeCommentId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/like-comments/${likeCommentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Create a new like comment
  const createLikeComment = async (likeCommentId) => {
    setLoading(true);
    try {
      const response = await api.post(
        "/v1/like-comments",
        { commentId: likeCommentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { data: response.data };
    } catch (error) {
      return {
        data: error?.response?.data || "An unexpected error occurred.",
      };
    } finally {
      setLoading(false);
    }
  };

  // Delete a like comment
  const deleteLikeComment = async (likeCommentId) => {
    setLoading(true);
    try {
      const response = await api.delete("/v1/like-comments", {
        headers: { Authorization: `Bearer ${token}` },
        data: { commentId: likeCommentId },
      });
      return { data: response.data };
    } catch (error) {
      return {
        data: error?.response?.data?.message || "An unexpected error occurred.",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleLikeCommentCreated = (newLikeComment) => {
    setLikeComments((prevLikeComments) => ({
      ...prevLikeComments,
      data: [...prevLikeComments.data, newLikeComment],
      total: prevLikeComments.total + 1,
    }));
  };

  const handleLikeCommentDeleted = (deletedLikeCommentId) => {
    setLikeComments((prevLikeComments) => ({
      ...prevLikeComments,
      data: prevLikeComments.data.filter(
        (likeComment) => likeComment.commentId._id !== deletedLikeCommentId
      ),
      total: prevLikeComments.total > 0 ? prevLikeComments.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("commentLiked", handleLikeCommentCreated);
    socket.on("commentUnliked", handleLikeCommentDeleted);

    return () => {
      socket.off("commentLiked", handleLikeCommentCreated);
      socket.off("commentUnliked", handleLikeCommentDeleted);
    };
  }, []);

  return {
    likeComments,
    loading,
    getLikeComments,
    getLikeComment,
    createLikeComment,
    deleteLikeComment,
  };
};
