import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useArticleHook } from "../hooks/useArticleHook";
import { useCommentHook } from "../hooks/useCommentHook";
import MainLayout from "../layouts/MainLayout";
import DOMPurify from "dompurify";
import Loading from "../components/Loading";
import { ChevronsLeft, MoreVertical, ThumbsUp } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import CommentTimeAgo from "../components/CommentTimeAgo";

const ArticleDetailPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;
  const { articleId } = useParams();
  const { loading: articlesLoading, getArticle } = useArticleHook();
  const {
    comments,
    loading: commentsLoading,
    getComments,
    createComment,
    updateComment,
    deleteComment,
  } = useCommentHook(articleId);
  const [article, setArticle] = useState();
  const [error, setError] = useState();
  const [comment, setComment] = useState("");
  const fetchArticle = async () => {
    const response = await getArticle(articleId);
    if (response.data.success) {
      setArticle(response.data.data);
    } else {
      setError(response.data.message);
    }
  };

  const fetchComments = async () => {
    const response = await getComments({ articleId });
    if (response.data.success) {
    } else {
      setError(response.data.message);
    }
  };

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [articleId]);

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    const response = await createComment({ articleId, content: comment });
    if (response.data.success) {
      setComment("");
    } else {
      toast.error(response.data);
      console.error("Failed to post comment");
    }
  };

  const handleCommentDelete = async (commentId) => {
    const response = await deleteComment(commentId);
    if (response.data.success) {
      setComment("");
      setOpenMenus(false);
    } else {
      toast.error(response.data);
      console.error("Failed to post comment");
    }
  };

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditedContent(comment.content);
    setOpenMenus(false);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editedContent.trim()) return;
    const response = await updateComment(commentId, { content: editedContent });
    if (response.data.success) {
      setEditingCommentId(null);
      fetchComments();
    } else {
      toast.error("Failed to update comment");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent("");
  };

  const [likes, setLikes] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const handleLike = (commentId) => {
    setLikes((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + 1,
    }));
  };

  //Like and Reply
  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
    setReplyContent(""); // Reset reply input
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyContent.trim()) return;

    const response = await createComment({
      articleId,
      parentId: commentId,
      content: replyContent,
    });

    if (response.data.success) {
      setReplyingTo(null);
      fetchComments();
    } else {
      toast.error("Failed to post reply");
    }
  };

  const sanitizedContent = DOMPurify.sanitize(article?.content);
  const formattedDate = new Date(article?.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <MainLayout>
      <div className="w-10/12 mx-auto space-y-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="bg-red-900 h-32 w-full rounded-lg"></div>
          <div className="bg-red-900 h-32 w-full rounded-lg"></div>
          <div className="bg-red-900 h-32 w-full rounded-lg"></div>
        </div>
        {articlesLoading ? (
          <Loading />
        ) : (
          <div className="container mx-auto">
            <div className="space-x-2 my-2">
              {article?.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="text-base text-gray-600 bg-gray-200 px-2 py-1 rounded hover:text-red-500 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-4">{article?.title}</h1>
            <div className="space-x-2 my-2 font-semibold text-gray-500">
              <NavLink className="hover:underline hover:text-red-500">
                {article?.userId?.name}
              </NavLink>
              |{" "}
              <NavLink className="hover:underline hover:text-red-500">
                {article?.categoryId?.name}
              </NavLink>
              | <span>{formattedDate}</span> |{" "}
              <span>{article?.views} views</span>
            </div>

            {/* Article Content */}
            <div className="flex">
              <div className="w-3/5">
                <img
                  src={article?.thumbnail}
                  alt={article?.title}
                  className="w-full h-80 object-cover mb-4"
                />

                <div
                  className="text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                ></div>

                {/* Author Section */}
                <div className="flex items-center space-x-4 my-4 shadow-lg p-4">
                  <img
                    src={article?.userId?.avatar}
                    alt={article?.userId?.name}
                    className="h-32 w-32 object-cover rounded-full"
                  />
                  <div>
                    <p className="text-lg font-medium">
                      {article?.userId?.name}
                    </p>
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                    <p className="text-sm text-gray-500">
                      {article?.views} views
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-2/5 bg-red-900 rounded-lg h-96 ml-4 shadow-lg"></div>
            </div>

            {/* Comment Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold mb-4">Comments</h2>
                <p className="font-semibold">{comments?.total} comments</p>
              </div>

              {/* Comment Input */}
              <div className="flex items-start justify-start space-x-6 my-4">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden resize-none custom-scrollbar"
                  rows={1}
                  style={{
                    maxHeight: "120px",
                    minHeight: "40px",
                    overflowY: "auto",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(
                      e.target.scrollHeight,
                      120
                    )}px`;
                  }}
                />

                <button
                  onClick={handleCommentSubmit}
                  className="w-48 px-3 py-2 text-third border border-primary bg-primary hover:bg-third  hover:text-primary font-bold rounded-xl transition-all"
                >
                  Post Comment
                </button>
              </div>

              {/* Comment List */}
              <div className="space-y-4">
                {comments?.data?.length > 0 ? (
                  comments.data
                    .filter((comment) => !comment.parentId) // Show only parent comments
                    .map((comment, index) => (
                      <div key={comment._id} className="p-4 shadow-sm relative">
                        <div className="flex items-start space-x-4">
                          <img
                            src={comment?.userId?.avatar}
                            alt={comment?.userId?.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div className="w-full">
                            <div className="flex items-center space-x-4">
                              <p className="text-gray-700 font-medium">
                                {comment?.userId?.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                <CommentTimeAgo
                                  createdAt={comment?.createdAt}
                                />
                              </p>
                            </div>
                            <p className="mt-2 text-gray-600">
                              {comment?.content}
                            </p>

                            {/* Like & Reply Buttons */}
                            <div className="flex items-center space-x-4 mt-2">
                              <button
                                onClick={() => handleLike(comment._id)}
                                className="text-blue-500 hover:underline"
                              >
                                Like {likes[comment._id] || 0}
                              </button>
                              <button
                                onClick={() => handleReplyClick(comment._id)}
                                className="text-green-500 hover:underline"
                              >
                                Reply
                              </button>
                            </div>

                            {/* Reply Input Field */}
                            {replyingTo === comment._id && (
                              <div className="mt-2 flex space-x-2">
                                <input
                                  type="text"
                                  value={replyContent}
                                  onChange={(e) =>
                                    setReplyContent(e.target.value)
                                  }
                                  placeholder="Write a reply..."
                                  className="border p-2 rounded w-full"
                                />
                                <button
                                  onClick={() => handleReplySubmit(comment._id)}
                                  className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                  Reply
                                </button>
                              </div>
                            )}

                            {/* Child Comments (Replies) */}
                            <div className="mt-4 pl-8 border-l-2 border-gray-300">
                              {comments.data
                                .filter(
                                  (reply) => reply.parentId === comment._id
                                ) // Get only child comments
                                .map((reply, replyIndex) => (
                                  <div key={reply._id} className="p-2">
                                    <div className="flex items-start space-x-3">
                                      <img
                                        src={reply?.userId?.avatar}
                                        alt={reply?.userId?.name}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                      <div className="w-full">
                                        <div className="flex items-center space-x-4">
                                          <p className="text-gray-700 font-medium">
                                            {reply?.userId?.name}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            <CommentTimeAgo
                                              createdAt={reply?.createdAt}
                                            />
                                          </p>
                                        </div>
                                        <p className="mt-1 text-gray-600">
                                          {reply?.content}
                                        </p>
                                      </div>

                                      {/* Options Button (For Child Comment) */}
                                      {user?._id === reply?.userId?._id && (
                                        <button
                                          className="ml-auto p-2 rounded-full hover:bg-gray-200"
                                          onClick={() =>
                                            toggleMenu(`${index}-${replyIndex}`)
                                          }
                                        >
                                          <MoreVertical className="h-5 w-5" />
                                        </button>
                                      )}

                                      {/* Dropdown Menu (For Child Comment) */}
                                      {openMenus[`${index}-${replyIndex}`] && (
                                        <div className="absolute right-4 top-12 bg-white shadow-lg border rounded-lg w-32">
                                          <button
                                            onClick={() =>
                                              handleEditClick(reply)
                                            }
                                            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleCommentDelete(reply._id)
                                            }
                                            className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
                                          >
                                            Delete
                                          </button>
                                          <button className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                                            Report
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Options Button (For Parent Comment) */}
                          {user?._id === comment?.userId?._id && (
                            <button
                              className="ml-auto p-2 rounded-full hover:bg-gray-200"
                              onClick={() => toggleMenu(index)}
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          )}

                          {/* Dropdown Menu (For Parent Comment) */}
                          {openMenus[index] && (
                            <div className="absolute right-4 top-12 bg-white shadow-lg border rounded-lg w-32">
                              <button
                                onClick={() => handleEditClick(comment)}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCommentDelete(comment._id)}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
                              >
                                Delete
                              </button>
                              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                                Report
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ArticleDetailPage;
