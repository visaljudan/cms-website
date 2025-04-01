import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, Save, Settings, LayoutDashboard } from "lucide-react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import MainLayout from "../../layouts/MainLayout";
import Loading from "../../components/Loading";
import ArticleCard from "../../components/ArticleCard";
import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
} from "../../app/user/userSlice";
import { useArticleHook } from "../../hooks/useArticleHook";

const ProfilePage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getArticles, loading: articlesLoading } = useArticleHook();
  const [article, setArticle] = useState();

  const isAdmin = user?.roleId?.slug === "admin";

  const fetchArticles = async () => {
    const params = { userId: user?._id };
    const response = await getArticles(params);
    setArticle(response);
    console.log(response);
  };

  useEffect(() => {
    fetchArticles();
  }, [user]);

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      dispatch(signOutStart());
      try {
        dispatch(signOutSuccess());
        navigate("/signin");
        toast.success("Signout successful!");
      } catch (error) {
        dispatch(signOutFailure());
        toast.error("Signout failed.");
      }
    }
  };

  return (
    <MainLayout>
      <div className="w-10/12 mx-auto my-8 ">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          {/* Profile Image */}
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary shadow-lg"
          />

          {/* Profile Info */}
          <div className="w-full md:ml-6 mt-4 md:mt-0 text-center md:text-left my-2 space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-primary">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>

            <div className="flex flex-wrap gap-3 mt-6 items-center justify-center md:justify-start">
              {isAdmin && (
                <NavLink
                  to="/admin/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </NavLink>
              )}

              <NavLink
                to="/profile/save-list"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300"
              >
                <Save size={20} />
                Save List
              </NavLink>

              <NavLink
                to="/profile-setting"
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
              >
                <Settings size={20} />
                Settings
              </NavLink>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articlesLoading ? (
                <Loading />
              ) : //  error ? (
              //   <p className="text-red-500">{error}</p>
              // ) :
              article?.data.total === 0 ? (
                <p>No articles found.</p>
              ) : article?.data.total > 0 ? (
                article?.data.data?.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
