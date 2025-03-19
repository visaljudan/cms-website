import { useCallback, useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

export const useArticleHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    getArticles();
  }, []);

  // Fetch all articles
  const getArticles = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/articles", {
        headers: { Authorization: `Bearer ${token}` },
        params: params,
      });
      const data = response.data.data;
      setArticles(data);
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  });

  // Fetch a single article
  const getArticle = async (articleId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/articles/${articleId}`, {
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

  // Create a new article
  const createArticle = async (articleData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/articles", articleData, {
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

  // Update an existing article
  const updateArticle = async (articleId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/v1/articles/${articleId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Delete an article
  const deleteArticle = async (articleId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/articles/${articleId}`, {
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

  const handleArticleCreated = (newArticle) => {
    setArticles((prevArticles) => ({
      ...prevArticles,
      data: [...prevArticles.data, newArticle],
      total: prevArticles.total + 1,
    }));
  };

  const handleArticleUpdated = (updatedArticle) => {
    setArticles((prevArticles) => ({
      ...prevArticles,
      data: prevArticles.data.map((article) =>
        article._id === updatedArticle._id ? updatedArticle : article
      ),
    }));
  };

  const handleArticleDeleted = (deletedArticleId) => {
    setArticles((prevArticles) => ({
      ...prevArticles,
      data: prevArticles.data.filter(
        (article) => article._id !== deletedArticleId
      ),
      total: prevArticles.total > 0 ? prevArticles.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("articleCreated", handleArticleCreated);
    socket.on("articleUpdated", handleArticleUpdated);
    socket.on("articleDeleted", handleArticleDeleted);

    return () => {
      socket.off("articleCreated", handleArticleCreated);
      socket.off("articleUpdated", handleArticleUpdated);
      socket.off("articleDeleted", handleArticleDeleted);
    };
  }, []);

  return {
    articles,
    loading,
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
  };
};
