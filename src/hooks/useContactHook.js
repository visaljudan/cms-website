import { useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

export const useContactHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    getContacts();
  }, []);

  // Fetch all contacts
  const getContacts = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/contacts", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = response.data.data;
      setContacts(data);
      return { data };
    } catch (error) {
      const data =
        error?.response?.data?.message || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single contact
  const getContact = async (contactId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      console.log(data);
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Create a new contact
  const createContact = async (contactData) => {
    console.log(contactData);
    setLoading(true);
    try {
      const response = await api.post("/v1/contacts", contactData, {
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

  // Update an existing contact
  const updateContact = async (contactId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/v1/contacts/${contactId}`,
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

  // Delete a contact
  const deleteContact = async (contactId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/contacts/${contactId}`, {
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

  const handleContactCreated = (newContact) => {
    setContacts((prevContacts) => {
      return {
        ...prevContacts,
        data: [newContact, ...prevContacts.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ),
        total: prevContacts.total + 1,
      };
    });
  };

  const handleContactUpdated = (updatedContact) => {
    setContacts((prevContacts) => ({
      ...prevContacts,
      data: prevContacts.data.map((contact) =>
        contact._id === updatedContact._id ? updatedContact : contact
      ),
    }));
  };

  const handleContactDeleted = (deletedContactId) => {
    setContacts((prevContacts) => ({
      ...prevContacts,
      data: prevContacts.data.filter(
        (contact) => contact._id !== deletedContactId
      ),
      total: prevContacts.total > 0 ? prevContacts.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("contactCreated", handleContactCreated);
    socket.on("contactUpdated", handleContactUpdated);
    socket.on("contactDeleted", handleContactDeleted);

    return () => {
      socket.off("contactCreated", handleContactCreated);
      socket.off("contactUpdated", handleContactUpdated);
      socket.off("contactDeleted", handleContactDeleted);
    };
  }, []);

  return {
    contacts,
    loading,
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
  };
};
