import { useCallback, useEffect, useState } from "react";
import {
  useParams,
  NavLink,
  useNavigation,
  useNavigate,
} from "react-router-dom";
import { useArticleHook } from "../../hooks/useArticleHook";
import { useCommentHook } from "../../hooks/useCommentHook";
import MainLayout from "../../layouts/MainLayout";
import DOMPurify from "dompurify";
import Loading from "../../components/Loading";
import {
  Bookmark,
  BookmarkCheck,
  ChevronsLeft,
  Link,
  MoreVertical,
  Save,
  Send,
  SendToBack,
  Tag,
  ThumbsUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import CommentTimeAgo from "../../components/CommentTimeAgo";
import { useSaveHook } from "../../hooks/useSaveHook";
import { useLikeCommentHook } from "../../hooks/useLikeCommentHook";
import api from "../../api/axiosConfig";
import Modal from "../../components/Modal";

const ArticleDetailPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;
  const { articleId } = useParams();
  const navigate = useNavigate();

  // States
  const [article, setArticle] = useState(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [openMenus, setOpenMenus] = useState({});
  const [likes, setLikes] = useState({});

  // Hooks
  const { loading: articlesLoading, getArticle } = useArticleHook();
  const {
    comments,
    loading: commentsLoading,
    getComments,
    createComment,
    updateComment,
    deleteComment,
  } = useCommentHook(articleId);

  // Fetch Article
  const fetchArticle = useCallback(async () => {
    try {
      const response = await getArticle(articleId);
      if (response.data.success) {
        setArticle(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to load article.");
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  // Comment
  const fetchComments = useCallback(async () => {
    try {
      const params = {
        articleId: article?._id,
      };
      const response = await getComments(params);
      if (response.data.success) {
        // Handle successful response if needed
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to fetch comments. Please try again later.");
    }
  }, [articleId]);

  useEffect(() => {
    if (article?._id !== null) {
      fetchComments();
    }
  }, [article?._id]);

  // Create Comment
  const handlePostComment = async () => {
    if (!comment.trim()) return;
    setLoadingCreate(true);
    if (user) {
      try {
        const response = await createComment({
          articleId: article._id,
          content: comment,
        });
        if (response.data.success) {
          setComment("");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        toast.error("Failed to post comment. Please try again later.");
      } finally {
        setLoadingCreate(false);
      }
    } else {
      setShowModal(true);
      setLoadingCreate(false);
    }
  };

  // Edit Comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditedContent(comment.content);
    setOpenMenus(false);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editedContent.trim()) return;
    setLoadingUpdate(true);

    try {
      const response = await updateComment(commentId, {
        content: editedContent,
      });
      if (response.data.success) {
        setEditingCommentId(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment. Please try again later.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent("");
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;
    setLoadingDelete(true);
    try {
      const response = await deleteComment(commentId);
      if (response.data.success) {
        setComment("");
        setOpenMenus(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment. Please try again later.");
    } finally {
      setLoadingDelete(false);
    }
  };

  // Oppen Menus
  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    setReplyingTo(null);
  };

  // Reply
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const handleReplyClick = (commentId) => {
    if (user) {
      setReplyingTo(commentId);
      setReplyContent("");
      setOpenMenus(false);
    } else {
      setShowModal(true);
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyContent.trim()) return;
    setLoadingReply(true);

    try {
      const response = await createComment({
        articleId: article._id,
        parentId: commentId,
        content: replyContent,
      });
      if (response.data.success) {
        setReplyingTo(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply. Please try again later.");
    } finally {
      setLoadingReply(false);
    }
  };

  // Format Article Content
  const sanitizedContent = DOMPurify.sanitize(article?.content);
  const formattedDate = new Date(article?.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Article Tacking
  const [timeSpent, setTimeSpent] = useState(0);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [hasTracked, setHasTracked] = useState(false);

  // Track Time on Page
  useEffect(() => {
    if (hasTracked) return;

    const interval = setInterval(() => {
      setTimeSpent((prev) => {
        const newTime = prev + 1000;
        if (newTime >= 10000) checkTrackingCondition(newTime); // Check condition with updated time
        return newTime;
      });
    }, 1000);

    const handleUnload = () => {
      if (!hasTracked) checkTrackingCondition(timeSpent);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [article?._id, hasTracked]);

  // Track Scroll Depth
  useEffect(() => {
    if (hasTracked) return;

    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      const scrollPercent = Math.round((scrolled / totalHeight) * 100);

      if (scrollPercent >= 50 && scrollDepth < 50) {
        setScrollDepth(50);
        checkTrackingCondition(timeSpent);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article?._id, scrollDepth]);

  // Function to track when both conditions are met
  const checkTrackingCondition = async (currentTime) => {
    if (!hasTracked && currentTime >= 10000 && scrollDepth >= 50) {
      console.log("✅ Tracking triggered");
      await trackingArticle();
      setHasTracked((prev) => true);
    }
  };

  // API Tracking Function
  const trackingArticle = async () => {
    try {
      await api.post("/v1/articles/track-article", {
        articleId: article?._id,
        eventType: "view",
        metadata: { timeSpent, scrollDepth },
      });
      setHasTracked(true);
    } catch (error) {
      console.error("Tracking failed:", error);
    }
  };

  // Like Comment
  const {
    likeComments,
    createLikeComment,
    getLikeComments,
    deleteLikeComment,
  } = useLikeCommentHook();

  const handleLike = (commentId) => {
    if (user) {
      const likeComment = likeComments?.data?.find(
        (like) => like.commentId._id === commentId
      );
      if (likeComment) {
        deleteLikeComment(commentId);
      } else {
        createLikeComment(commentId);
      }
    } else {
      setShowModal(true);
    }
  };

  // Save
  const { createSave, getSaves, deleteSave } = useSaveHook();
  const [isSaved, setIsSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleToSignUp = () => {
    navigate("/signup");
    setShowModal(false);
  };

  useEffect(() => {
    const checkSavedStatus = async () => {
      const response = await getSaves(article?._id);
      if (response.data.total > 0) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }
    };

    checkSavedStatus();
  }, [articleId]);

  const handleSaveArticle = async (articleId) => {
    if (user) {
      const response = await createSave(articleId);
      if (response.data.success) {
        setIsSaved(true);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleUnsaveArticle = async (articleId) => {
    const response = await deleteSave(articleId);
    if (response.data.success) {
      setIsSaved(false);
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <MainLayout>
      <div className="w-10/12 mx-auto space-y-4">
        {/* <div className="flex flex-col items-center justify-center space-y-2">
          <div className="bg-red-900 h-32 w-full rounded-lg"></div>
          <div className="bg-red-900 h-32 w-full rounded-lg"></div>
          <div className="bg-red-900 h-32 w-full rounded-lg"></div>
        </div> */}
        {articlesLoading ? (
          <Loading />
        ) : (
          <div className="container mx-auto my-4">
            <div className="space-x-2 my-2">
              {article?.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs lg:text-base text-gray-600 bg-gray-200 px-2 py-1 rounded hover:text-red-500 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-xl lg:text-4xl font-bold mb-4">
              {article?.title}
            </h1>
            <div className="lg:flex items-center justify-between w-full lg:w-3/5">
              <div className="space-x-1 my-2 font-semibold text-gray-500">
                <NavLink
                  to={`/author/${article?.userId?._id}`}
                  className="text-xs hover:underline hover:text-red-500"
                >
                  {article?.userId?.name}
                </NavLink>
                |{" "}
                <NavLink className="text-xs hover:underline hover:text-red-500">
                  {article?.categoryId?.name}
                </NavLink>
                | <span className="text-xs">{formattedDate}</span> |{" "}
                <span className="text-xs">{article?.views} views</span>
              </div>
              <button
                onClick={
                  isSaved
                    ? () => handleUnsaveArticle(article._id)
                    : () => handleSaveArticle(article._id)
                }
                className={`pr-6 ${
                  isSaved ? "text-green-500" : "text-gray-500"
                }`}
              >
                {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            </div>

            {/* Article Content */}
            <div className="flex">
              <div className="w-full lg:w-3/5">
                <img
                  src={article?.thumbnail}
                  alt={article?.title}
                  className="aspect-[16/9] object-contain mb-4"
                />

                <div
                  className="text-sm lg:text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                ></div>

                {/* Author Section */}
                <NavLink
                  to={
                    user?._id === article?.userId?._id
                      ? `/profile`
                      : `/author/${article?.userId?._id}`
                  }
                  className="flex items-center space-x-4 my-4 shadow-lg p-4 border-t-2"
                >
                  {/* <AuthorCard author={article?.userId} /> */}
                  <img
                    src={article?.userId?.avatar}
                    alt={article?.userId?.name}
                    className="h-16 w-16 lg:w-32 lg:h-32 object-cover rounded-full"
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
                </NavLink>
              </div>
              {/* <div className="w-2/5 bg-red-900 rounded-lg h-96 ml-4 shadow-lg"></div> */}
            </div>

            {/* Comment Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-base lg:text-2xl font-bold mb-4">
                  Comments
                </h2>
                <p className="text-xs lg:text-base font-semibold">
                  {comments?.total} comments
                </p>
              </div>
              {/* Comment Input */}
              <div className="flex items-center lg:items-start justify-start space-x-2 lg:space-x-6 my-4">
                {user ? (
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  ""
                )}

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-2 lg:p-3 lg:py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden resize-none custom-scrollbar"
                  rows={1}
                  // style={{
                  //   maxHeight: "120px",
                  //   minHeight: "40px",
                  //   overflowY: "auto",
                  // }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(
                      e.target.scrollHeight,
                      120
                    )}px`;
                  }}
                />

                <button
                  onClick={handlePostComment}
                  className="hidden lg:flex w-48 px-3 py-2 text-third border border-primary bg-primary hover:bg-third  hover:text-primary font-bold rounded-xl transition-all"
                >
                  {loadingCreate ? "loading..." : "Post Comment"}
                </button>
                <button
                  onClick={handlePostComment}
                  className={`flex items-cente justify-center ${
                    loadingCreate ? "text-gray-500" : "text-primary"
                  }`}
                >
                  <Send />
                </button>
              </div>

              {/* Comment List */}
            <div className="space-y-4 text-xs lg:text-base">
                {comments?.total > 0 ? (
                  comments?.data
                    .filter((comment) => !comment.parentId)
                    .map((comment, index) => (
                      <div key={comment._id} className="p-4 shadow-sm relative">
                        {/* Parent Comment */}
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
                              {editingCommentId === comment._id ? (
                                <input
                                  type="text"
                                  value={editedContent}
                                  onChange={(e) =>
                                    setEditedContent(e.target.value)
                                  }
                                  className="border border-gray-300 rounded p-1 w-full"
                                />
                              ) : (
                                comment?.content
                              )}
                            </p>

                            {editingCommentId === comment._id && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleSaveEdit(comment._id)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-gray-400 text-white rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            <div className="flex items-center space-x-4 mt-2">
                              <button
                                onClick={() => handleLike(comment._id)}
                                className="text-gray-500 flex "
                              >
                                {likeComments?.data?.some(
                                  (like) => like.commentId?._id === comment?._id
                                ) ? (
                                  <span className="flex items-center space-x-2">
                                    <ThumbsUp fill="gray" size={16} />
                                    <p>{` ${comment.likes || 0}`}</p>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-2">
                                    <ThumbsUp size={16} />
                                    <p>{` ${comment.likes || 0}`}</p>
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() => handleReplyClick(comment._id)}
                                className="text-green-500 hover:underline"
                              >
                                Reply
                              </button>
                            </div>

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
                                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                                >
                                  {loadingReply ? "Replying..." : "Reply"}
                                </button>
                              </div>
                            )}

                            {/* Child Comments */}
                            <div className="mt-4 pl-8 border-l-2 border-gray-300">
                              {comments?.data
                                .filter(
                                  (reply) =>
                                    reply?.parentId?._id === comment._id
                                )
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

                                        <div className="flex items-center space-x-4 mt-2">
                                          <button
                                            onClick={() =>
                                              handleLike(reply._id)
                                            }
                                            className="text-gray-500 flex"
                                          >
                                            {likeComments?.data?.some(
                                              (like) =>
                                                like.commentId._id === reply._id
                                            ) ? (
                                              <span className="flex items-center space-x-2">
                                                <ThumbsUp
                                                  fill="gray"
                                                  size={16}
                                                />
                                                <p>{` ${reply.likes || 0}`}</p>
                                              </span>
                                            ) : (
                                              <span className="flex items-center space-x-2">
                                                <ThumbsUp size={16} />
                                                <p>{` ${reply.likes || 0}`}</p>
                                              </span>
                                            )}
                                          </button>
                                        </div>

                                        {replyingTo === reply._id && (
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
                                              onClick={() =>
                                                handleReplySubmit(reply._id)
                                              }
                                              className="bg-green-500 text-white px-4 py-2 rounded-lg"
                                            >
                                              {loadingReply
                                                ? "Replying..."
                                                : "Reply"}
                                            </button>
                                          </div>
                                        )}
                                      </div>

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
                                              handleDeleteComment(reply._id)
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

                          {user?._id === comment?.userId?._id && (
                            <button
                              className="ml-auto p-2 rounded-full hover:bg-gray-200"
                              onClick={() => toggleMenu(index)}
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          )}

                          {openMenus[index] && (
                            <div className="absolute right-4 top-12 bg-white shadow-lg border rounded-lg w-32">
                              <button
                                onClick={() => handleEditClick(comment)}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
                              >
                                {loadingDelete ? "Deleting..." : "Delete"}
                              </button>
                              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                                Report
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : comments.total === 0 ? (
                  <p className="text-gray-500 p-6 text-sx lg:text-base">
                    No comments yet. Be the first to comment!
                  </p>
                ) : commentsLoading ? (
                  <Loading />
                ) : (
                  <p className="text-gray-500 text-xs lg:text-base">
                    Failed to load comments
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAction={handleToSignUp}
        title="Sign Up Required"
        message="You need to create an account before you can save this article. Would you like to sign up now?"
        actionText="Sign Up"
        cancelText="Cancel"
      />

      {}
    </MainLayout>
  );
};

export default ArticleDetailPage;
