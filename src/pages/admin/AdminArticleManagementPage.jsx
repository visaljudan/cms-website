import { useCallback, useEffect, useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useArticleHook } from "../../hooks/useArticleHook";
import { Edit, Eye, Plus, Trash } from "lucide-react";
import { storage } from "../../firebase";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Loading from "../../components/Loading";

const AdminArticleManagementPage = () => {
  const {
    articles,
    loading: articlesLoading,
    getArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  } = useArticleHook();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(articles?.total / itemsPerPage);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    status: "active",
  });

  const initialCategoryState = {
    name: "",
    description: "",
    image: "",
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
  const filteredArticles = articles.data
    ?.filter((article) => {
      const matchesSearchQuery = article.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesSearchQuery;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const fetchCategory = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (searchQuery === "" && statusFilter === "All") {
      await getArticles(params);
    } else {
      await getArticles();
    }
  }, [itemsPerPage, currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  const [initialState, setInitialState] = useState(initialCategoryState);

  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialState);
  };

  const [uploadMode, setUploadMode] = useState("file");

  const clearStateCategory = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      status: "active",
    });
    setErrors("");
    setIsEditing(false);
    setInitialState(initialCategoryState);

    setShowAddForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const filteredValue =
      name === "name" ? value.replace(/[^A-Za-z\s]/g, "") : value;
    setFormData({ ...formData, [name]: filteredValue });
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
      const storageRef = ref(storage, `cms/category/${file.name}`);
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
        setErrors({ ...errors, image: "File size must be under 2MB." });
        return;
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onload = function (event) {
        img.onload = async function () {
          if (img.width > 3000 || img.height > 3000) {
            setErrors({
              ...errors,
              image: "Image must be 3000x3000 pixels or smaller.",
            });
            return;
          }

          try {
            const imageUrl = await uploadImage(file);
            setFormData({ ...formData, image: imageUrl });
          } catch (error) {
            console.error("Image upload failed:", error);
            setErrors({
              ...errors,
              image: "Failed to upload image. Please try again.",
            });
          }
        };
        img.src = event.target.result;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();

    setErrors("");
    const response = await createArticle(formData);
    if (response.data.success) {
      toast.success(response.data.message);
      clearStateCategory();
    } else {
      setErrors(response.data.message);
    }
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();

    setErrors("");
    const response = await updateArticle(formData.id, formData);

    if (response.data.success) {
      toast.success(response.data.message);
      clearStateCategory();
    } else {
      setErrors(response.data.message);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const openModal = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedArticle) {
      handleDeleteArticle(selectedArticle._id);
      setShowModal(false);
      setSelectedArticle(null);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    const response = await deleteArticle(articleId);
    toast.success(response.data.message);
    clearStateCategory();
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            Article Management
          </h2>
          <NavLink
            to="/admin/article/create"
            className="flex items-center bg-secondary border border-secondary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-third hover:text-secondary"
          >
            <Plus className="mr-2" />
            Add Articles
          </NavLink>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center justify-between space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
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

        {/* articles Table */}
        <div>
          <div className="overflow-auto">
            {/* {articles.data?.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))} */}
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 w-2/12 text-left font-bold text-gray-600">
                    Id
                  </th>
                  <th className="px-4 py-2 w-3/12 text-left font-bold text-gray-600">
                    Thumbnail
                  </th>
                  <th className="px-4 py-2 w-2/12 text-left font-bold text-gray-600">
                    Title
                  </th>
                  <th className="px-4 py-2 w-3/12 text-left font-bold text-gray-600">
                    Author
                  </th>
                  <th className="px-4 py-2 w-1/12 text-left font-bold text-gray-600">
                    Category
                  </th>
                  <th className="px-4 py-2 w-1/12 text-left font-bold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2 w-1/12 font-bold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {articlesLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-4">
                      <Loading />
                    </td>
                  </tr>
                ) : filteredArticles?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-4">
                      No articles available
                    </td>
                  </tr>
                ) : filteredArticles?.length > 0 ? (
                  filteredArticles?.map((article) => (
                    <tr key={article._id} className="border-t border-gray-200">
                      {/* Id */}
                      <td className="px-4 py-3 text-gray-700">
                        {article.articleId}
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3 text-gray-700">
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="aspect-[4/3] object-cover"
                        />
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3 text-gray-700">
                        {article.title}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-gray-700">
                        {article?.userId?.name}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-gray-700">
                        {article?.categoryId?.name}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-gray-700">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-semibold ${
                            article.status === "published"
                              ? "bg-green-100 text-green-700"
                              : article.status === "draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {article.status?.charAt(0).toUpperCase() +
                            article.status?.slice(1)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className=" px-2 flex flex-row items-center justify-center space-x-4">
                          <NavLink
                            to={`/admin/article/update/${article._id}`}
                            className="text-yellow-500 hover:text-yellow-600"
                            title="Edit"
                          >
                            <Edit />
                          </NavLink>
                          <button
                            onClick={() => openModal(article)}
                            className="text-red-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash />
                          </button>
                          <a
                            href={`/article/${article._id}`}
                            className="text-blue-500 hover:text-blue-600"
                            title="View"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-red-500 py-4">
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
                    Are you sure you want to delete the article{" "}
                    <span className="font-bold">{selectedArticle?.name}</span>?
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

        {/* Add Category Form */}
        {showAddForm && (
          <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200 ">
            <div className="bg-white w-4/5 p-4 rounded-lg shadow-lg max-h-11/12 overflow-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {isEditing ? "Edit Category" : "Add New Category"}
              </h3>
              <form
                onSubmit={isEditing ? handleUpdateArticle : handleCreateArticle}
              >
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
                  {/* Image */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Upload Image
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
                        Use Image URL
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

                    {/* Image URL Input */}
                    {uploadMode === "url" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                          }
                          className="px-4 py-2 w-full border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
                          placeholder="Enter Image URL"
                        />
                      </div>
                    )}

                    {loading ? (
                      <Loading />
                    ) : (
                      formData.image && (
                        <div className="border my-4 border-gray-200">
                          <img
                            src={formData.image}
                            alt="Image Preview"
                            className="aspect-[16/9] h-auto object-contain mx-auto"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="space-x-4">
                  <button
                    type="submit"
                    disabled={articlesLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 disabled:opacity-50"
                  >
                    {articlesLoading
                      ? "Saving..."
                      : isEditing
                      ? "Update Category"
                      : "Save Category"}
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
                      clearStateCategory();
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

export default AdminArticleManagementPage;
