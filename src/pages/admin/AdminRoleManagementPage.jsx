import { useEffect, useState } from "react";
import { Edit, Plus, Trash } from "lucide-react";
import { useRoleHook } from "../../hooks/useRoleHook";
import { toast } from "react-toastify";
import DashboardLayout from "../../layouts/DashboardLayout";
import Loading from "../../components/Loading";

const AdminRoleManagementPage = () => {
  const {
    roles,
    loading: rolesLoading,
    getRoles,
    createRole,
    updateRole,
    deleteRole,
  } = useRoleHook();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(roles?.total / itemsPerPage);
  const [errors, setErrors] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const initialRoleState = {
    name: "",
    description: "",
    status: "active",
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

  const filteredRoles = roles?.data
    ?.filter((role) => {
      const matchesSearchQuery =
        role._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatusFilter =
        statusFilter === "All" || role.status === statusFilter;

      return matchesSearchQuery && matchesStatusFilter;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    const fetchRoles = async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchQuery === "" && statusFilter === "All") {
        await getRoles();
      } else {
        await getRoles(params);
      }
    };

    fetchRoles();
  }, [itemsPerPage, currentPage, searchQuery, statusFilter]);

  const [initialState, setInitialState] = useState(initialRoleState);

  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialState);
  };

  const clearStateRole = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
    });
    setErrors("");
    setIsEditing(false);
    setInitialState(initialRoleState);
    setShowAddForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const filteredValue =
      name === "name" ? value.replace(/[^A-Za-z\s]/g, "") : value;
    setFormData({ ...formData, [name]: filteredValue });
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setErrors("");
    const response = await createRole(formData);
    if (response.data.success) {
      toast.success(response.data.message);
      clearStateRole();
    } else {
      setErrors(response.data.message);
    }
  };

  const handleEdit = (role) => {
    setFormData({
      id: role._id,
      name: role.name,
      description: role.description,
      status: role.status,
    });
    setInitialState({
      id: role._id,
      name: role.name,
      description: role.description,
      status: role.status,
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();

    setErrors("");
    const response = await updateRole(formData.id, formData);

    if (response.data.success) {
      toast.success(response.data.message);
      clearStateRole();
    } else {
      setErrors(response.data.message);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const openModal = (role) => {
    setSelectedRole(role);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedRole) {
      handleDeleteRole(selectedRole._id);
      setShowModal(false);
      setSelectedRole(null);
    }
  };

  const handleDeleteRole = async (categoryId) => {
    const response = await deleteRole(categoryId);
    toast.success(response.data.message);
    clearStateRole();
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Roles Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center bg-secondary border border-secondary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-third hover:text-secondary"
          >
            <Plus className="mr-2" />
            Add Role
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles..."
            className="w-10/12 px-4 py-2 text-base border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-base border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Roles  Table */}
        <div>
          <div className="overflow-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-gray-600">
                    Id
                  </th>
                  <th className="px-4 py-2  text-left font-bold text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-2  text-left font-bold text-gray-600">
                    Slug
                  </th>
                  <th className="px-4 py-2  text-left font-bold text-gray-600">
                    Description
                  </th>
                  <th className="px-4 py-2  text-left font-bold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2 font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rolesLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <Loading />
                    </td>
                  </tr>
                ) : filteredRoles?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-4">
                      No roles available
                    </td>
                  </tr>
                ) : filteredRoles ? (
                  filteredRoles.map((role) => (
                    <tr key={role._id} className="border-t border-gray-200">
                      {/* ID */}
                      <td className="px-4 py-3 text-gray-700">{role._id}</td>

                      {/* Name */}
                      <td className="px-4 py-3 text-gray-700">{role.name}</td>

                      {/* Slug */}
                      <td className="px-4 py-3 text-gray-700">{role.slug}</td>

                      {/* Description */}
                      <td className="px-4 py-3 text-gray-700">
                        {role.description || "-"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-gray-700">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-semibold ${
                            role.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {role.status.charAt(0).toUpperCase() +
                            role.status.slice(1)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 flex items-center space-x-4">
                        <button
                          onClick={() => handleEdit(role)}
                          className="text-yellow-500 hover:text-yellow-600"
                          title="Edit"
                        >
                          <Edit />
                        </button>
                        <button
                          onClick={() => openModal(role)}
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
                    <td colSpan={6} className="text-center text-red-500 py-4">
                      An unexpected error occurred.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Delete Confirmation Modal */}
            {showModal && (
              <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200 ">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Confirm Deletion
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to delete the role{" "}
                    <span className="font-bold">{selectedRole?.name}</span>?
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
          </div>

          {/* Pagination controls */}
          {searchQuery === "" && statusFilter === "All" && (
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

        {/* Add Role Form */}
        {showAddForm && (
          <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200 ">
            <div className="bg-white w-4/5 p-4 rounded-lg shadow-lg max-h-11/12 overflow-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {isEditing ? "Edit Role" : "Add New Role"}
              </h3>
              <form onSubmit={isEditing ? handleUpdateRole : handleCreateRole}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-gray-700 mb-2">Slug</label>
                    <input
                      type="text"
                      value={formData.name.toLowerCase().replace(/\s+/g, "-")}
                      onChange={handleChange}
                      className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                      disabled
                    />
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value,
                        })
                      }
                      className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-x-4">
                  <button
                    type="submit"
                    disabled={rolesLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 disabled:opacity-50"
                  >
                    {rolesLoading
                      ? "Saving..."
                      : isEditing
                      ? "Update Role"
                      : "Save Role"}
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
                      clearStateRole();
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
      </div>
    </DashboardLayout>
  );
};

export default AdminRoleManagementPage;
