import { useEffect, useState } from "react";
import { Edit, Plus, Trash } from "lucide-react";
import { useAdPlacementHook } from "../../hooks/useAdPlacementHook"; // Assuming you have a hook for ad placements
import { toast } from "react-toastify";
import DashboardLayout from "../../layouts/DashboardLayout";
import Loading from "../../components/Loading";

const AdminAdPlacementManagementPage = () => {
  const {
    adPlacements,
    loading: adPlacementsLoading,
    getAdPlacements,
    createAdPlacement,
    updateAdPlacement,
    deleteAdPlacement,
  } = useAdPlacementHook();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(adPlacements?.total / itemsPerPage);
  const [errors, setErrors] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "",
    dimensions: "",
  });

  const initialAdPlacementState = {
    name: "",
    location: "",
    type: "",
    dimensions: "",
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

  const filteredAdPlacements = adPlacements?.data
    ?.filter((adPlacement) => {
      const matchesSearchQuery =
        adPlacement.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        adPlacement.location
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        adPlacement.type?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        adPlacement.dimensions
          ?.toLowerCase()
          .includes(searchQuery?.toLowerCase());

      return matchesSearchQuery;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    const fetchAdPlacements = async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      await getAdPlacements(params);
    };

    fetchAdPlacements();
  }, [itemsPerPage, currentPage, searchQuery]);

  const clearStateAdPlacement = () => {
    setFormData(initialAdPlacementState);
    setErrors("");
    setIsEditing(false);
    setShowAddForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateAdPlacement = async (e) => {
    e.preventDefault();
    const response = await createAdPlacement(formData);
    if (response.data.success) {
      toast.success(response.data.message);
      clearStateAdPlacement();
    } else {
      setErrors(response.data.message);
    }
  };

  const handleEdit = (adPlacement) => {
    setFormData({
      id: adPlacement._id,
      name: adPlacement.name,
      location: adPlacement.location,
      type: adPlacement.type,
      dimensions: adPlacement.dimensions,
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleUpdateAdPlacement = async (e) => {
    e.preventDefault();
    setErrors("");
    const response = await updateAdPlacement(formData.id, formData);
    if (response.data.success) {
      toast.success(response.data.message);
      clearStateAdPlacement();
    } else {
      setErrors(response.data.message);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedAdPlacement, setSelectedAdPlacement] = useState(null);

  const openModal = (adPlacement) => {
    setSelectedAdPlacement(adPlacement);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedAdPlacement) {
      handleDeleteAdPlacement(selectedAdPlacement._id);
      setShowModal(false);
      setSelectedAdPlacement(null);
    }
  };

  const handleDeleteAdPlacement = async (adPlacementId) => {
    const response = await deleteAdPlacement(adPlacementId);
    toast.success(response.data.message);
    clearStateAdPlacement();
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            Ad Placement Management
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center bg-secondary border border-secondary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-third hover:text-secondary"
          >
            <Plus className="mr-2" /> Add Ad Placement
          </button>
        </div>
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ad placements..."
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
                  Location
                </th>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Type
                </th>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Dimensions
                </th>
                <th className="px-4 py-2 font-bold text-gray-600 text-start">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {adPlacementsLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <Loading />
                  </td>
                </tr>
              ) : filteredAdPlacements?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No ad placements available
                  </td>
                </tr>
              ) : (
                filteredAdPlacements?.map((adPlacement) => (
                  <tr
                    key={adPlacement._id}
                    className="border-t border-gray-200"
                  >
                    <td className="px-4 py-2">{adPlacement._id}</td>
                    <td className="px-4 py-2">{adPlacement.name}</td>
                    <td className="px-4 py-2">{adPlacement.location}</td>
                    <td className="px-4 py-2">{adPlacement.type}</td>
                    <td className="px-4 py-2">{adPlacement.dimensions}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => handleEdit(adPlacement)}
                        className="text-yellow-500 hover:text-yellow-600"
                        title="Edit"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => openModal(adPlacement)}
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
        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200 ">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Confirm Deletion
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete the ad placement{" "}
                <span className="font-bold">{selectedAdPlacement?.name}</span>?
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

        {/* Add/Edit Ad Placement Form */}
        {showAddForm && (
          <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200 ">
            <div className="bg-white w-4/5 p-4 rounded-lg shadow-lg max-h-11/12 overflow-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {isEditing ? "Edit Ad Placement" : "Add New Ad Placement"}
              </h3>
              <form
                onSubmit={
                  isEditing ? handleUpdateAdPlacement : handleCreateAdPlacement
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
                    <label className="block text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Type</label>
                    <select
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                    >
                      <option value="">Select Type</option>
                      <option value="banner">Banner</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="popup">Popup</option>
                      <option value="inline">Inline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-x-4">
                  <button
                    type="submit"
                    disabled={adPlacementsLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 disabled:opacity-50"
                  >
                    {adPlacementsLoading
                      ? "Saving..."
                      : isEditing
                      ? "Update Ad Placement"
                      : "Save Ad Placement"}
                  </button>
                  <button
                    type="button"
                    onClick={clearStateAdPlacement}
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
      </div>
    </DashboardLayout>
  );
};

export default AdminAdPlacementManagementPage;
