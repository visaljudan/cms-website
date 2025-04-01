import { useEffect, useState } from "react";
import { Edit, Plus, Trash } from "lucide-react";
import { useAdvertiserHook } from "../../hooks/useAdvertiserHook";
import { toast } from "react-toastify";
import DashboardLayout from "../../layouts/DashboardLayout";
import Loading from "../../components/Loading";

const AdminAdvertiserManagementPage = () => {
  const {
    advertisers,
    loading: advertisersLoading,
    getAdvertisers,
    createAdvertiser,
    updateAdvertiser,
    deleteAdvertiser,
  } = useAdvertiserHook();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(advertisers?.total / itemsPerPage);
  const [errors, setErrors] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    phone: "",
  });

  const initialAdvertiserState = {
    name: "",
    email: "",
    company: "",
    website: "",
    phone: "",
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) return;
    if (pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const filteredAdvertisers = advertisers?.data
    ?.filter((advertiser) => {
      const matchesSearchQuery =
        advertiser._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advertiser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advertiser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advertiser.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advertiser.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advertiser.phone.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearchQuery;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    const fetchAdvertisers = async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      await getAdvertisers(params);
    };

    fetchAdvertisers();
  }, [itemsPerPage, currentPage, searchQuery]);

  const [initialState, setInitialState] = useState(initialAdvertiserState);

  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialState);
  };

  const clearStateAdvertiser = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      website: "",
      phone: "",
    });
    setErrors("");
    setIsEditing(false);
    setInitialState(initialAdvertiserState);
    setShowAddForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const filteredValue =
      name === "name" ? value.replace(/[^A-Za-z\s]/g, "") : value;
    setFormData({ ...formData, [name]: filteredValue });
  };

  const handleCreateAdvertiser = async (e) => {
    e.preventDefault();
    const response = await createAdvertiser(formData);
    if (response.data.success) {
      toast.success(response.data.message);
      clearStateAdvertiser();
    } else {
      setErrors(response.data.message);
    }
  };

  const handleEdit = (advertiser) => {
    setFormData({
      id: advertiser._id,
      name: advertiser.name,
      email: advertiser.email,
      company: advertiser.company,
      website: advertiser.website,
      phone: advertiser.phone,
    });
    setInitialState({
      id: advertiser._id,
      name: advertiser.name,
      email: advertiser.email,
      company: advertiser.company,
      website: advertiser.website,
      phone: advertiser.phone,
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleUpdateAdvertiser = async (e) => {
    e.preventDefault();
    setErrors("");
    const response = await updateAdvertiser(formData.id, formData);
    if (response.data.success) {
      toast.success(response.data.message);
      clearStateAdvertiser();
    } else {
      setErrors(response.data.message);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(null);

  const openModal = (role) => {
    setSelectedAdvertiser(role);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedAdvertiser) {
      handleDeleteAdvertiser(selectedAdvertiser._id);
      setShowModal(false);
      setSelectedAdvertiser(null);
    }
  };

  const handleDeleteAdvertiser = async (advertiserId) => {
    const response = await deleteAdvertiser(advertiserId);
    toast.success(response.data.message);
    clearStateAdvertiser();
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            Advertisers Management
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center bg-secondary border border-secondary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-third hover:text-secondary"
          >
            <Plus className="mr-2" /> Add Advertiser
          </button>
        </div>
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search advertisers..."
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Id
                </th>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Name
                </th>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Email
                </th>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Company
                </th>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Website
                </th>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Phone
                </th>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {advertisersLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <Loading />
                  </td>
                </tr>
              ) : filteredAdvertisers?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No advertisers available
                  </td>
                </tr>
              ) : filteredAdvertisers ? (
                filteredAdvertisers?.map((advertiser) => (
                  <tr key={advertiser._id} className="border-t border-gray-200">
                    <td className="px-4 py-2">{advertiser._id}</td>
                    <td className="px-4 py-2">{advertiser.name}</td>
                    <td className="px-4 py-2">{advertiser.email}</td>
                    <td className="px-4 py-2">{advertiser.company}</td>
                    <td className="px-4 py-2">{advertiser.website}</td>
                    <td className="px-4 py-2">{advertiser.phone}</td>
                    <td className="px-4 py-2 flex-row items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(advertiser)}
                        className="text-yellow-500 hover:text-yellow-600"
                        title="Edit"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => openModal(advertiser)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-red-500 py-4">
                    An unexpected error occurred.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200 ">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Confirm Deletion
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete the role{" "}
                <span className="font-bold">{selectedAdvertiser?.name}</span>?
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
        {/* Pagination controls */}
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
      {showAddForm && (
        <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200 ">
          <div className="bg-white w-4/5 p-4 rounded-lg shadow-lg max-h-11/12 overflow-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {isEditing ? "Edit Advertiser" : "Add New Advertiser"}
            </h3>
            <form
              onSubmit={
                isEditing ? handleUpdateAdvertiser : handleCreateAdvertiser
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-x-4">
                <button
                  type="submit"
                  disabled={advertisersLoading}
                  className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 disabled:opacity-50"
                >
                  {advertisersLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update Advertiser"
                    : "Save Advertiser"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isFormDirty()) {
                      const confirmCancel = window.confirm(
                        "You have unsaved changes. Are you sure you want to cancel?"
                      );
                      if (!confirmCancel) return;
                    }
                    clearStateAdvertiser();
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
              {errors && <p className="text-red-500 mt-4">{errors}</p>}
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAdvertiserManagementPage;
