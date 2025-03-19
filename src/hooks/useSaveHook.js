import { useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
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
      const response = await api.post("/v1/saves", saveData, {
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

  // Update an existing save
  const updateSave = async (saveId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(`/v1/saves/${saveId}`, updatedData, {
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

  // Delete a save
  const deleteSave = async (saveId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/saves/${saveId}`, {
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

  const handleSaveCreated = (newSave) => {
    setSaves((prevSaves) => ({
      ...prevSaves,
      data: [...prevSaves.data, newSave],
      total: prevSaves.total + 1,
    }));
  };

  const handleSaveUpdated = (updatedSave) => {
    setSaves((prevSaves) => ({
      ...prevSaves,
      data: prevSaves.data.map((save) =>
        save._id === updatedSave._id ? updatedSave : save
      ),
    }));
  };

  const handleSaveDeleted = (deletedSaveId) => {
    setSaves((prevSaves) => ({
      ...prevSaves,
      data: prevSaves.data.filter((save) => save._id !== deletedSaveId),
      total: prevSaves.total > 0 ? prevSaves.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("saveCreated", handleSaveCreated);
    socket.on("saveUpdated", handleSaveUpdated);
    socket.on("saveDeleted", handleSaveDeleted);

    return () => {
      socket.off("saveCreated", handleSaveCreated);
      socket.off("saveUpdated", handleSaveUpdated);
      socket.off("saveDeleted", handleSaveDeleted);
    };
  }, []);

  return {
    saves,
    loading,
    getSaves,
    getSave,
    createSave,
    updateSave,
    deleteSave,
  };
};
