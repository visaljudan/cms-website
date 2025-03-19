import { useCallback, useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

export const useCategoryHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories();
  }, []);

  // Fetch all categories
  const getCategories = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/categories", {
        headers: { Authorization: `Bearer ${token}` },
        params: params,
      });
      console.log(params);
      const data = response.data.data;
      setCategories(response.data.data);
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  });

  // Fetch a single category
  const getCategory = async (categoryId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/categories/${categoryId}`, {
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

  // Create a new category
  const createCategory = async (categoryData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/categories", categoryData, {
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

  // Update an existing category
  const updateCategory = async (categoryId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/v1/categories/${categoryId}`,
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

  // Delete a category
  const deleteCategory = async (categoryId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/categories/${categoryId}`, {
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

  const handleCategoryCreated = (newCategory) => {
    setCategories((prevCategories) => ({
      ...prevCategories,
      data: [...prevCategories.data, newCategory],
      total: prevCategories.total + 1,
    }));
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategories((prevCategories) => ({
      ...prevCategories,
      data: prevCategories.data.map((category) =>
        category._id === updatedCategory._id ? updatedCategory : category
      ),
    }));
  };

  const handleCategoryDeleted = (deletedCategoryId) => {
    setCategories((prevCategories) => ({
      ...prevCategories,
      data: prevCategories.data.filter(
        (category) => category._id !== deletedCategoryId
      ),
      total: prevCategories.total > 0 ? prevCategories.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("categoryCreated", handleCategoryCreated);
    socket.on("categoryUpdated", handleCategoryUpdated);
    socket.on("categoryDeleted", handleCategoryDeleted);

    return () => {
      socket.off("categoryCreated", handleCategoryCreated);
      socket.off("categoryUpdated", handleCategoryUpdated);
      socket.off("categoryDeleted", handleCategoryDeleted);
    };
  }, []);

  return {
    categories,
    loading,
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
