import React, { useState } from "react";
import { Edit, Eye, Plus, Trash } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Loading from "../../components/Loading";
import { useContactHook } from "../../hooks/useContactHook";
import { toast } from "react-toastify";

const ContactManagement = () => {
  const {
    contacts,
    loading: contactsLoading,
    deleteContact,
  } = useContactHook();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(contacts?.total / itemsPerPage);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete Contact
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const openModal = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedContact) {
      handleDeleteContact(selectedContact._id);
      setShowModal(false);
      setSelectedContact(null);
    }
  };

  const handleDeleteContact = async (contactId) => {
    const response = await deleteContact(contactId);
    toast.success(response.data.message);
    clearStateCategory();
  };

  // Page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) return;
    if (pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const filteredContacts = contacts?.data
    ?.filter((contact) => {
      const matchesSearchQuery =
        contact._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.message?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearchQuery;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            Contact Management
          </h2>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contact..."
            className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-primary"
          />
        </div>

        <div className="overflow-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Id
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Email
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Subject
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Message
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contactsLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <Loading />
                  </td>
                </tr>
              ) : filteredContacts?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-4">
                    No contact available
                  </td>
                </tr>
              ) : (
                filteredContacts?.map((contact) => (
                  <tr key={contact._id} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-gray-700">{contact._id}</td>
                    <td className="px-4 py-3 text-gray-700">{contact.name}</td>
                    <td className="px-4 py-3 text-gray-700">{contact.email}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {contact.subject}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {contact.message}
                    </td>
                    <td className="px-4 py-3 flex items-center space-x-4">
                      <button
                        onClick={() => openModal(contact)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Delete Confirmation Modal */}
          {showModal && (
            <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Confirm Deletion
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to delete this contact?
                </p>
                <div className="flex justify-end mt-4 gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {searchQuery === "" && (
            <div className="flex justify-between items-center mt-4">
              <div>
                <label>Items per page: </label>
                <select
                  className="border rounded p-1"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContactManagement;
