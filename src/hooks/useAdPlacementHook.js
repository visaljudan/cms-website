import { useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

export const useAdPlacementHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [adPlacements, setAdPlacements] = useState([]);

  useEffect(() => {
    getAdPlacements();
  }, []);

  // Fetch all ad placements
  const getAdPlacements = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/ad-placements", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = response.data.data;
      setAdPlacements(data);
      return { data };
    } catch (error) {
      const data =
        error?.response?.data?.message || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single ad placement
  const getAdPlacement = async (adPlacementId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/ad-placements/${adPlacementId}`, {
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

  // Create a new ad placement
  const createAdPlacement = async (adPlacementData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/ad-placements", adPlacementData, {
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

  // Update an existing ad placement
  const updateAdPlacement = async (adPlacementId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/v1/ad-placements/${adPlacementId}`,
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

  // Delete an ad placement
  const deleteAdPlacement = async (adPlacementId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/ad-placements/${adPlacementId}`, {
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

  const handleAdPlacementCreated = (newAdPlacement) => {
    setAdPlacements((prevAdPlacements) => ({
      ...prevAdPlacements,
      data: [...prevAdPlacements.data, newAdPlacement],
      total: prevAdPlacements.total + 1,
    }));
  };

  const handleAdPlacementUpdated = (updatedAdPlacement) => {
    setAdPlacements((prevAdPlacements) => ({
      ...prevAdPlacements,
      data: prevAdPlacements.data.map((adPlacement) =>
        adPlacement._id === updatedAdPlacement._id
          ? updatedAdPlacement
          : adPlacement
      ),
    }));
  };

  const handleAdPlacementDeleted = (deletedAdPlacementId) => {
    setAdPlacements((prevAdPlacements) => ({
      ...prevAdPlacements,
      data: prevAdPlacements.data.filter(
        (adPlacement) => adPlacement._id !== deletedAdPlacementId
      ),
      total: prevAdPlacements.total > 0 ? prevAdPlacements.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("adPlacementCreated", handleAdPlacementCreated);
    socket.on("adPlacementUpdated", handleAdPlacementUpdated);
    socket.on("adPlacementDeleted", handleAdPlacementDeleted);

    return () => {
      socket.off("adPlacementCreated", handleAdPlacementCreated);
      socket.off("adPlacementUpdated", handleAdPlacementUpdated);
      socket.off("adPlacementDeleted", handleAdPlacementDeleted);
    };
  }, []);

  return {
    adPlacements,
    loading,
    getAdPlacements,
    getAdPlacement,
    createAdPlacement,
    updateAdPlacement,
    deleteAdPlacement,
  };
};
