import { useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

export const useCommentHook = (articleId) => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    getComments();
  }, []);

  // Fetch all comments
  const getComments = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/comments", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = response.data.data;
      setComments(data);
      return { data };
    } catch (error) {
      const data =
        error?.response?.data?.message || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single comment
  const getComment = async (commentId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return { data };
    } catch (error) {
      const data =
        error?.response?.data?.message || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Create a new comment
  const createComment = async (commentData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/comments", commentData, {
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

  // Update an existing comment
  const updateComment = async (commentId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/v1/comments/${commentId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;
      return { data };
    } catch (error) {
      const data =
        error?.response?.data?.message || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/comments/${commentId}`, {
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

  const handleCommentCreated = (newComment) => {
    setComments((prevComments) => {
      if (newComment.articleId?.articleId.toString() !== articleId)
        return prevComments;

      return {
        ...prevComments,
        data: [newComment, ...prevComments.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ),
        total: prevComments.total + 1,
      };
    });
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments((prevComments) => ({
      ...prevComments,
      data: prevComments?.data.map((comment) =>
        comment._id === updatedComment._id ? updatedComment : comment
      ),
    }));
  };

  const handleCommentDeleted = (deletedCommentId) => {
    setComments((prevComments) => ({
      ...prevComments,
      data: prevComments.data.filter(
        (comment) => comment._id !== deletedCommentId
      ),
      total: prevComments.total > 0 ? prevComments.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("commentCreated", handleCommentCreated);
    socket.on("commentUpdated", handleCommentUpdated);
    socket.on("commentDeleted", handleCommentDeleted);

    return () => {
      socket.off("commentCreated", handleCommentCreated);
      socket.off("commentUpdated", handleCommentUpdated);
      socket.off("commentDeleted", handleCommentDeleted);
    };
  }, []);

  return {
    comments,
    loading,
    getComments,
    getComment,
    createComment,
    updateComment,
    deleteComment,
  };
};
