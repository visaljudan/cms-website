import { useCallback, useEffect, useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Edit, Plus, Trash } from "lucide-react";
import { useUserHook } from "../../hooks/useUserHook";
import { useRoleHook } from "../../hooks/useRoleHook";
import { useSelector } from "react-redux";
import { storage } from "../../firebase";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import DashboardLayout from "../../layouts/DashboardLayout";

const AdminUserManagementPage = () => {
  const {
    users,
    loading: usersLoading,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useUserHook();
  const { roles, loading: rolesLoading } = useRoleHook();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(users?.total / itemsPerPage);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusRole, setStatusRole] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    avatar: "",
    roleId: "",
    status: "pending",
  });

  const initialUserState = {
    name: "",
    username: "",
    email: "",
    password: "",
    avatar: "",
    roleId: "",
    status: "pending",
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

  const filteredUsers = users.data
    ?.filter((user) => {
      const matchesSearchQuery =
        user._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatusFilter =
        statusFilter === "All" || user.status === statusFilter;

      const matchesRoleFilter =
        statusRole === "All" || user.roleId.slug === statusRole;

      return matchesSearchQuery && matchesStatusFilter && matchesRoleFilter;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const fetchUsers = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (searchQuery === "" && statusFilter === "All" && statusRole === "All") {
      await getUsers(params);
    } else {
      await getUsers();
    }
  }, [itemsPerPage, currentPage, searchQuery, statusFilter, statusRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const [initialState, setInitialState] = useState(initialUserState);

  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialState);
  };

  const [uploadMode, setUploadMode] = useState("file");

  const statusOptions = [
    "active",
    "inactive",
    "pending",
    "suspended",
    "banned",
    "deleted",
  ];

  const clearStateUser = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      avatar: "",
      roleId: "",
      status: "pending",
    });
    setErrors("");
    setIsEditing(false);
    setInitialState(initialUserState);

    setShowAddForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      const regex = /^[a-z0-9]*$/;
      if (!regex.test(value)) return;
      setFormData({ ...formData, username: value.toLowerCase() });
    } else if (name === "name") {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setFormData({ ...formData, name: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  //Upload Image
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadImage = async (file) => {
    try {
      if (!file) throw new Error("No file selected");
      const storageRef = ref(storage, `cms/avatar/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          setLoading(true),
          (error) => reject(error),
          () => resolve()
        );
      });
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, avatar: "File size must be under 2MB." });
        return;
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onload = function (event) {
        img.onload = async function () {
          if (img.width > 3000 || img.height > 3000) {
            setErrors({
              ...errors,
              avatar: "Avatar must be 3000x3000 pixels or smaller.",
            });
            return;
          }

          try {
            const imageUrl = await uploadImage(file);
            setFormData({ ...formData, avatar: imageUrl });
          } catch (error) {
            console.error("Avatar upload failed:", error);
            setErrors({
              ...errors,
              avatar: "Failed to upload avatar. Please try again.",
            });
          }
        };
        img.src = event.target.result;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    setErrors("");
    const response = await createUser(formData);
    if (response.data.success) {
      toast.success(response.data.message);
      clearStateUser();
    } else {
      setErrors(response.data.message);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
    });
    setInitialState({
      id: user._id,
      name: user.name,  
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setErrors("");
    const response = await updateUser(formData.id, formData);

    if (response.data.success) {
      toast.success(response.data.message);
      clearStateUser();
    } else {
      setErrors(response.data.message);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      handleDeleteUser(selectedUser._id);
      setShowModal(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    deleteUser(userId);
    toast.success(result.message);
    clearStateUser();
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">User Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center bg-secondary border border-secondary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-third hover:text-secondary"
          >
            <Plus className="mr-2" />
            Add User
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-10/12 px-4 py-2 text-base border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
          />
          <select
            value={statusRole}
            onChange={(e) => setStatusRole(e.target.value)}
            className="px-4 py-2 text-base border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
          >
            <option value="All">All Role</option>
            {roles?.data?.map((role, index) => (
              <option key={index} value={role.slug}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-base border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0)?.toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Users Table */}
        <div>
          <div className="overflow-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 w-1/12 text-center font-bold text-gray-600">
                    Id
                  </th>
                  <th className="px-4 py-2 w-1/12 text-center font-bold text-gray-600">
                    Avatar
                  </th>
                  <th className="px-4 py-2 w-2/12 text-start font-bold text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-2 w-2/12 text-start font-bold text-gray-600">
                    Username
                  </th>
                  <th className="px-4 py-2 w-3/12 text-start font-bold text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-2 w-1/12 text-center font-bold text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-2 w-1/12 text-center font-bold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2 w-2/12 text-center font-bold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-4">
                      <Loading />
                    </td>
                  </tr>
                ) : filteredUsers?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-4">
                      No users available
                    </td>
                  </tr>
                ) : filteredUsers?.length > 0 ? (
                  filteredUsers?.map((user) => (
                    <tr key={user._id} className="border-t border-gray-200">
                      {/* Id */}
                      <td className="px-4 py-3 text-gray-700">{user._id}</td>

                      {/* Avatar */}
                      <td className="px-4 py-3 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.name} avatar`}
                            className=" w-8 h-8 object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-gray-400 italic">
                            No Avatar
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3 text-gray-700">{user.name}</td>

                      {/* Username */}
                      <td className="px-4 py-3 text-gray-700">
                        {user.username}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-gray-700">{user.email}</td>

                      {/* Role */}
                      <td className="px-4 py-3 text-center text-gray-700">
                        {user.roleId.name}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center text-gray-700">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-semibold ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status?.charAt(0).toUpperCase() +
                            user.status?.slice(1)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 flex items-center justify-center space-x-4">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-yellow-500 hover:text-yellow-600"
                          title="Edit"
                        >
                          <Edit />
                        </button>
                        <button
                          onClick={() => openModal(user)}
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
                    Are you sure you want to delete the user{" "}
                    <span className="font-bold">{selectedUser?.name}</span>?
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

        {/* Add User Form */}
        {showAddForm && (
          <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200 ">
            <div className="bg-white w-4/5 p-4 rounded-lg shadow-lg max-h-11/12 overflow-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {isEditing ? "Edit User" : "Add New User"}
              </h3>
              <form onSubmit={isEditing ? handleUpdateUser : handleCreateUser}>
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
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-gray-700 mb-2">Password</label>
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
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
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  </div>

                  {/* Roles */}
                  <div>
                    <label className="block text-gray-700 mb-2">Role</label>
                    <select
                      name="role"
                      value={formData.roleId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          roleId: e.target.value,
                        })
                      }
                      className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                    >
                      {roles?.data?.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Upload Avatar
                    </label>

                    <div className="flex gap-2">
                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setUploadMode("file")}
                        className={`px-4 py-2 rounded-lg transition ${
                          uploadMode === "file"
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        Upload File
                      </button>

                      <button
                        type="button"
                        onClick={() => setUploadMode("url")}
                        className={`px-4 py-2 rounded-lg transition ${
                          uploadMode === "url"
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        Use Avatar URL
                      </button>
                    </div>

                    {/* Upload File Input */}
                    {uploadMode === "file" && (
                      <div className="mt-2">
                        <input
                          type="file"
                          name="avatar"
                          id="avatar"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={handleButtonClick}
                          className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                        >
                          Upload Your Profile
                        </button>
                      </div>
                    )}

                    {/* Avatar URL Input */}
                    {uploadMode === "url" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          name="avatar"
                          value={formData.avatar}
                          onChange={(e) =>
                            setFormData({ ...formData, avatar: e.target.value })
                          }
                          className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                          placeholder="Enter Avatar URL"
                        />
                      </div>
                    )}

                    {loading ? (
                      <Loading />
                    ) : (
                      formData.avatar && (
                        <div className="my-4">
                          <img
                            src={formData.avatar}
                            alt="Avatar Preview"
                            className="h-32 w-32  object-cover rounded-full mx-auto"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="space-x-4">
                  <button
                    type="submit"
                    disabled={usersLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 disabled:opacity-50"
                  >
                    {usersLoading
                      ? "Saving..."
                      : isEditing
                      ? "Update User"
                      : "Save User"}
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
                      clearStateUser();
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

export default AdminUserManagementPage;
