import { useCallback, useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

export const useUserHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  // Fetch all users
  const getUsers = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const response = await api.get("/v1/users", {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        });
        const data = response.data.data;
        setUsers(data);
        return { data };
      } catch (error) {
        const data = error?.response?.data || "An unexpected error occurred.";
        return { data };
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Fetch a single user
  const getUser = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { data: response.data };
    } catch (error) {
      return { data: error?.response?.data || "An unexpected error occurred." };
    } finally {
      setLoading(false);
    }
  };

  // Create a new user
  const createUser = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/auth/signup", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return { data };
    } catch (error) {
      return { data: error?.response?.data || "An unexpected error occurred." };
    } finally {
      setLoading(false);
    }
  };

  // Update an existing user
  const updateUser = async (userId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(`/v1/users/${userId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return { data };
    } catch (error) {
      return { data: error?.response?.data || "An unexpected error occurred." };
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const deleteUser = async (userId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/users/${userId}`, {
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

  // Handle user events via WebSocket
  const handleUserCreated = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const handleRoleCreated = (newUser) => {
    setUsers((prevUsers) => ({
      ...prevUsers,
      data: [...prevUsers.data, newUser],
      total: prevUsers.total + 1,
    }));
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) => ({
      ...prevUsers,
      data: prevUsers.data.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      ),
    }));
  };

  const handleUserDeleted = (deletedUserId) => {
    setUsers((prevUsers) => ({
      ...prevUsers,
      data: prevUsers.data.filter((user) => user._id !== deletedUserId),
      total: prevUsers.total > 0 ? prevUsers.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("userCreated", handleUserCreated);
    socket.on("userUpdated", handleUserUpdated);
    socket.on("userDeleted", handleUserDeleted);

    return () => {
      socket.off("userCreated", handleUserCreated);
      socket.off("userUpdated", handleUserUpdated);
      socket.off("userDeleted", handleUserDeleted);
    };
  }, []);

  return {
    users,
    loading,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  };
};
