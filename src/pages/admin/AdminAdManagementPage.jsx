import { useEffect, useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { Edit, Eye, Plus, Trash } from "lucide-react";
import { useAdHook } from "../../hooks/useAdHook";
import { toast } from "react-toastify";
import DashboardLayout from "../../layouts/DashboardLayout";
import Loading from "../../components/Loading";
import { useAdvertiserHook } from "../../hooks/useAdvertiserHook";
import { useAdPlacementHook } from "../../hooks/useAdPlacementHook";
import Divider from "../../components/Divider";

const AdminAdManagementPage = () => {
  const {
    ads,
    loading: adsLoading,
    getAds,
    createAd,
    updateAd,
    deleteAd,
  } = useAdHook();
  const { advertisers, loading: advertisersLoading } = useAdvertiserHook();
  const { adPlacements, loading: adPlacementLoading } = useAdPlacementHook();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(ads?.total / itemsPerPage);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    advertiserId: "",
    adPlacementId: "",
    title: "",
    description: "",
    image: "",
    targetUrl: "",
    type: "",
    placement: "",
    startDate: "",
    endDate: "",
    budget: "",
  });

  const initialAdState = {
    advertiserId: "",
    adPlacementId: "",
    title: "",
    description: "",
    image: "",
    targetUrl: "",
    type: "",
    placement: "",
    startDate: "",
    endDate: "",
    budget: "",
  };

  // Pagenegation
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) return;
    if (pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  const filteredAds = ads?.data
    ?.filter((ad) => {
      const matchesSearchQuery =
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.placement.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearchQuery;
    })
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  useEffect(() => {
    const fetchAds = async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      await getAds(params);
    };

    fetchAds();
  }, [itemsPerPage, currentPage, searchQuery]);

  //
  const [initialState, setInitialState] = useState(initialAdState);

  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialState);
  };

  const clearStateAd = () => {
    setFormData(initialAdState);
    setErrors("");
    setIsEditing(false);
    setInitialState(initialAdState);
    setShowAddForm(false);
  };

  const [uploadMode, setUploadMode] = useState("file");

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

      console.log("work");

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
            console.log(imageUrl);
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

      // ✅ UNCOMMENT THIS
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    const response = await createAd(formData);
    if (response.data.success) {
      toast.success(response.data.message);
      clearStateAd();
    } else {
      setErrors(response.data.message);
    }
  };

  const handleEdit = (ad) => {
    setFormData({
      id: ad._id,
      advertiserId: ad.advertiserId._id,
      adPlacementId: ad.adPlacementId._id,
      title: ad.title,
      description: ad.description,
      image: ad.image,
      targetUrl: ad.targetUrl,
      type: ad.type,
      placement: ad.placement,
      startDate: ad.startDate
        ? new Date(ad.startDate).toISOString().split("T")[0]
        : "",
      endDate: ad.endDate
        ? new Date(ad.endDate).toISOString().split("T")[0]
        : "",
      budget: ad.budget,
      status: ad.status,
    });
    setInitialState({
      id: ad._id,
      advertiserId: ad.advertiserId._id,
      adPlacementId: ad.adPlacementId._id,
      title: ad.title,
      description: ad.description,
      image: ad.image,
      targetUrl: ad.targetUrl,
      type: ad.type,
      placement: ad.placement,
      startDate: ad.startDate
        ? new Date(ad.startDate).toISOString().split("T")[0]
        : "",
      endDate: ad.endDate
        ? new Date(ad.endDate).toISOString().split("T")[0]
        : "",
      budget: ad.budget,
      status: ad.status,
    });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    setErrors("");
    const response = await updateAd(formData.id, formData);
    if (response.data.success) {
      toast.success(response.data.message);
      clearStateAd();
    } else {
      setErrors(response.data.message);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  const openModal = (ad) => {
    setSelectedAd(ad);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedAd) {
      handleDeleteAd(selectedAd._id);
      setShowModal(false);
      setSelectedAd(null);
    }
  };

  const handleDeleteAd = async (adId) => {
    const response = await deleteAd(adId);
    toast.success(response.data.message);
    clearStateAd();
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewAd, setViewAd] = useState(null);

  const handleView = (ad) => {
    setViewAd(ad);
    setShowViewModal(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Ad Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center bg-secondary border border-secondary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-third hover:text-secondary"
          >
            <Plus className="mr-2" /> Add Ad
          </button>
        </div>
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Advertiser</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Placement</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">End Date</th>
              <th className="px-4 py-2">Budget</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adsLoading ? (
              <tr>
                <td colSpan={8}>
                  <Loading />
                </td>
              </tr>
            ) : filteredAds?.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No ad available
                </td>
              </tr>
            ) : (
              filteredAds?.map((ad, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{ad.title}</td>
                  <td className="px-4 py-2">{ad.advertiserId.name}</td>
                  <td className="px-4 py-2">{ad.adPlacementId.type}</td>
                  <td className="px-4 py-2">{ad.adPlacementId.location}</td>
                  <td className="px-4 py-2">
                    {new Date(ad.startDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(ad.endDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-4 py-2">${ad.budget}</td>
                  <td className="px-4 py-2 flex-row items-center justify-center space-x-2">
                    <button
                      onClick={() => handleView(ad)}
                      className="text-blue-500 hover:text-blue-600"
                      title="View"
                    >
                      <Eye />
                    </button>

                    <button
                      onClick={() => handleEdit(ad)}
                      className="text-yellow-500 hover:text-yellow-600"
                      title="Edit"
                    >
                      <Edit />
                    </button>
                    <button
                      onClick={() => openModal(ad)}
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
        {/* Show View Modal */}
        {showViewModal && (
          <div className="fixed inset-0 ml-auto w-5/6 bg-gray-200 overflow-auto">
            <div className="bg-white w-10/12 mx-auto p-6 rounded-lg shadow-lg space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Ad Details
              </h3>
              <img
                className="w-full h-fit rounded-lg object-cover "
                src={viewAd?.image}
                alt={viewAd?.title}
              />
              <div>
                <p className="font-semibold text-gray-400">Advertiser</p>
                <div className="w-full h-[1px] bg-primary"></div>
                <p>
                  <strong>Advertiser Name:</strong> {viewAd?.advertiserId?.name}
                </p>
                <p>
                  <strong>Advertiser company:</strong>{" "}
                  {viewAd?.advertiserId?.company}
                </p>
                <p>
                  <strong>Advertiser Email:</strong>{" "}
                  {viewAd?.advertiserId?.email}
                </p>
                <p>
                  <strong>Advertiser Phone:</strong>{" "}
                  {viewAd?.advertiserId?.phone}
                </p>
                <p>
                  <strong>Advertiser Website:</strong>{" "}
                  {viewAd?.advertiserId?.website}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-400">Ad Placement</p>
                <div className="w-full h-[1px] bg-primary"></div>
                <p>
                  <strong>Placement:</strong> {viewAd?.adPlacementId?.name}
                </p>
                <p>
                  <strong>Type:</strong> {viewAd?.adPlacementId?.type}
                </p>
                <p>
                  <strong>Location:</strong> {viewAd?.adPlacementId?.location}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-400">Ad Infromation</p>
                <div className="w-full h-[1px] bg-primary"></div>
                <p>
                  <strong>Title:</strong> {viewAd?._id}
                </p>
                <p>
                  <strong>Title:</strong> {viewAd?.title}
                </p>
                <p>
                  <strong>Description:</strong> {viewAd?.description || "-"}
                </p>
                <p>
                  <strong>Budget:</strong> ${viewAd?.budget}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {new Date(viewAd.startDate).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {new Date(viewAd.endDate).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <p>
                  <strong>Total Click:</strong> {viewAd?.clicks}
                </p>
                <p>
                  <strong>Total Impressions:</strong> {viewAd?.impressions}
                </p>
                <p>
                  <strong>Target URL:</strong>{" "}
                  <a
                    href={viewAd?.targetUrl}
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {viewAd?.targetUrl || "-"}
                  </a>
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200 ">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Confirm Deletion
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete the ad{" "}
                <span className="font-bold">{selectedAd?.title}</span>?
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
        <div className="fixed inset-0 ml-auto w-5/6 flex items-center justify-center bg-gray-200">
          <div className="bg-white w-4/5 p-4 rounded-lg shadow-lg max-h-11/12 overflow-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {isEditing ? "Edit Ad" : "Add New Ad"}
            </h3>
            <form onSubmit={isEditing ? handleUpdateAd : handleCreateAd}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Advertiser <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="advertiserId"
                    value={formData.advertiserId}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  >
                    <option value="">Select an Advertiser</option>
                    {advertisers?.data?.map((advertiser) => (
                      <option key={advertiser._id} value={advertiser._id}>
                        {advertiser.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Ad Placement <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="adPlacementId"
                    value={formData.adPlacementId}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  >
                    <option value="">Select Status</option>
                    {adPlacements?.data?.map((place) => (
                      <option key={place._id} value={place._id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Target URL</label>
                  <input
                    type="text"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Budget <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
                {/* <div>
                  <label className="block text-gray-700 mb-2">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  >
                    <option value="">Select Type</option>
                    <option value="banner">Banner</option>
                    <option value="video">Video</option>
                    <option value="popup">Popup</option>
                    <option value="native">Native</option>
                  </select>
                </div> */}
                {/* <div>
                  <label className="block text-gray-700 mb-2">Placement</label>
                  <select
                    name="placement"
                    value={formData.placement}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  >
                    <option value="">Select Placement</option>
                    <option value="header">Header</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="footer">Footer</option>
                    <option value="article">Article</option>
                    <option value="popup">Popup</option>
                  </select>
                </div> */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="px-4 py-2 w-full border rounded-lg focus:ring-primary"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                {/* Image */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Upload Image <span className="text-red-500">*</span>
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
                        name="image"
                        id="image"
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
                <div>
                  <span className="text-red-500 text-sm font-semibold">
                    * You need to complete the field.
                  </span>
                </div>
              </div>

              <div className="space-x-4">
                <button
                  type="submit"
                  disabled={adsLoading}
                  className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 disabled:opacity-50"
                >
                  {adsLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update Ad"
                    : "Save Ad"}
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
                    clearStateAd();
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

export default AdminAdManagementPage;
