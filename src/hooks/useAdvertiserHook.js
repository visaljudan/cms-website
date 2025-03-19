import { useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

export const useAdvertiserHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [advertisers, setAdvertisers] = useState([]);

  useEffect(() => {
    getAdvertisers();
  }, []);

  // Fetch all advertisers
  const getAdvertisers = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/advertisers", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = response.data.data;
      setAdvertisers(data);
      return { data };
    } catch (error) {
      const data =
        error?.response?.data?.message || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single advertiser
  const getAdvertiser = async (advertiserId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/advertisers/${advertiserId}`, {
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

  // Create a new advertiser
  const createAdvertiser = async (advertiserData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/advertisers", advertiserData, {
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

  // Update an existing advertiser
  const updateAdvertiser = async (advertiserId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/v1/advertisers/${advertiserId}`,
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

  // Delete an advertiser
  const deleteAdvertiser = async (advertiserId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/advertisers/${advertiserId}`, {
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

  const handleAdvertiserCreated = (newAdvertiser) => {
    setAdvertisers((prevAdvertisers) => ({
      ...prevAdvertisers,
      data: [...prevAdvertisers.data, newAdvertiser],
      total: prevAdvertisers.total + 1,
    }));
  };

  const handleAdvertiserUpdated = (updatedAdvertiser) => {
    setAdvertisers((prevAdvertisers) => ({
      ...prevAdvertisers,
      data: prevAdvertisers.data.map((advertiser) =>
        advertiser._id === updatedAdvertiser._id
          ? updatedAdvertiser
          : advertiser
      ),
    }));
  };

  const handleAdvertiserDeleted = (deletedAdvertiserId) => {
    setAdvertisers((prevAdvertisers) => ({
      ...prevAdvertisers,
      data: prevAdvertisers.data.filter(
        (advertiser) => advertiser._id !== deletedAdvertiserId
      ),
      total: prevAdvertisers.total > 0 ? prevAdvertisers.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("advertiserCreated", handleAdvertiserCreated);
    socket.on("advertiserUpdated", handleAdvertiserUpdated);
    socket.on("advertiserDeleted", handleAdvertiserDeleted);

    return () => {
      socket.off("advertiserCreated", handleAdvertiserCreated);
      socket.off("advertiserUpdated", handleAdvertiserUpdated);
      socket.off("advertiserDeleted", handleAdvertiserDeleted);
    };
  }, []);

  return {
    advertisers,
    loading,
    getAdvertisers,
    getAdvertiser,
    createAdvertiser,
    updateAdvertiser,
    deleteAdvertiser,
  };
};
