import { useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

export const useAdHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    getAds();
  }, []);

  // Fetch all ads
  const getAds = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/ads", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = response.data.data;
      setAds(data);
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single ad
  const getAd = async (adId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/ads/${adId}`, {
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

  // Create a new ad
  const createAd = async (adData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/ads", adData, {
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

  // Update an existing ad
  const updateAd = async (adId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(`/v1/ads/${adId}`, updatedData, {
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

  // Delete an ad
  const deleteAd = async (adId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/ads/${adId}`, {
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

  const handleAdCreated = (newAd) => {
    setAds((prevAds) => ({
      ...prevAds,
      data: [...prevAds.data, newAd],
      total: prevAds.total + 1,
    }));
  };

  const handleAdUpdated = (updatedAd) => {
    setAds((prevAds) => ({
      ...prevAds,
      data: prevAds.data.map((ad) =>
        ad._id === updatedAd._id ? updatedAd : ad
      ),
    }));
  };

  const handleAdDeleted = (deletedAdId) => {
    setAds((prevAds) => ({
      ...prevAds,
      data: prevAds.data.filter((ad) => ad._id !== deletedAdId),
      total: prevAds.total > 0 ? prevAds.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("adCreated", handleAdCreated);
    socket.on("adUpdated", handleAdUpdated);
    socket.on("adDeleted", handleAdDeleted);

    return () => {
      socket.off("adCreated", handleAdCreated);
      socket.off("adUpdated", handleAdUpdated);
      socket.off("adDeleted", handleAdDeleted);
    };
  }, []);

  return {
    ads,
    loading,
    getAds,
    getAd,
    createAd,
    updateAd,
    deleteAd,
  };
};
