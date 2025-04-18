import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import socket from "../api/socketConfig";
import api from "../api/axiosConfig";

export const useSaveHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [saves, setSaves] = useState([]);
  useEffect(() => {
    getSaves();
  }, []);

  // Fetch all saves
  const getSaves = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/saves", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = response.data.data;
      setSaves(data);
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single save
  const getSave = async (saveId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/saves/${saveId}`, {
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

  // Create a new save
  const createSave = async (saveData) => {
    setLoading(true);
    try {
      const response = await api.post(
        "/v1/saves",
        { articleId: saveData },
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

  // Delete a save
  const deleteSave = async (saveId) => {
    setLoading(true);
    try {
      const response = await api.delete("/v1/saves", {
        headers: { Authorization: `Bearer ${token}` },
        data: { articleId: saveId }, // Correct way to pass data in DELETE requests
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

  const handleSaveCreated = (newSave) => {
    if (token) {
      setSaves((prevSaves) => ({
        ...prevSaves,
        data: [...prevSaves?.data, newSave],
        total: prevSaves.total + 1,
      }));
    }
  };

  const handleSaveDeleted = (deletedSaveId) => {
    if (token) {
      setSaves((prevSaves) => ({
        ...prevSaves,
        data: prevSaves?.data?.filter(
          (save) => save.articleId._id !== deletedSaveId
        ),
        total: prevSaves.total > 0 ? prevSaves.total - 1 : 0,
      }));
    }
  };

  useEffect(() => {
    socket.on("articleSaved", handleSaveCreated);
    socket.on("articleUnsaved", handleSaveDeleted);

    return () => {
      socket.off("articleSaved", handleSaveCreated);
      socket.off("articleUnsaved", handleSaveDeleted);
    };
  }, []);

  return {
    saves,
    loading,
    getSaves,
    getSave,
    createSave,
    deleteSave,
  };
};
