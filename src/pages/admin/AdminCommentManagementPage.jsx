import { useEffect, useState } from "react";
import { Edit, Plus, Trash } from "lucide-react";
import { useCommentHook } from "../../hooks/useCommentHook";
import { toast } from "react-toastify";
import DashboardLayout from "../../layouts/DashboardLayout";
import Loading from "../../components/Loading";
import { NavLink } from "react-router-dom";

const AdminCommentManagementPage = () => {
  const {
    comments,
    loading: commentsLoading,
    getComments,
    deleteComment,
  } = useCommentHook();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(comments?.total / itemsPerPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const filteredComments = comments.data
    ?.filter((comment) => {
      const matchesSearchQuery =
        comment._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.user.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatusFilter =
        statusFilter === "All" || comment.status === statusFilter;

      return matchesSearchQuery && matchesStatusFilter;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    const fetchComments = async () => {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      await getComments(params);
    };

    fetchComments();
  }, [itemsPerPage, currentPage]);

  const openModal = (comment) => {
    setSelectedComment(comment);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedComment) {
      handleDeleteComment(selectedComment._id);
      setShowModal(false);
      setSelectedComment(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const response = await deleteComment(commentId);
    toast.success(response.data.message);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            Comments Management
          </h2>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search comments..."
            className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-primary"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-base border border-primary rounded-lg focus:outline-none focus:ring focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Comments Table */}
        <div className="overflow-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Id
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  User
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Article
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Comment
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">
                  Status
                </th>

                <th className="px-4 py-2 font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commentsLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    <Loading />
                  </td>
                </tr>
              ) : filteredComments?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-4">
                    No comments available
                  </td>
                </tr>
              ) : (
                filteredComments?.map((comment) => (
                  <tr key={comment._id} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-gray-700">{comment._id}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex items-center space-x-2">
                        <img
                          src={comment.userId.avatar}
                          alt={comment.userId.name}
                          className="w-10 h-10 object-center rounded-full"
                        />
                        <p>{comment.userId.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <NavLink to={`/article/${comment?.articleId?._id}`}>
                        {comment?.articleId?.title}
                      </NavLink>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {comment.content}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
                          comment?.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {comment?.status?.charAt(0).toUpperCase() +
                          comment.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex items-center space-x-4">
                      <button
                        onClick={() => openModal(comment)}
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
                  Are you sure you want to delete this comment?
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
      </div>
    </DashboardLayout>
  );
};

export default AdminCommentManagementPage;
