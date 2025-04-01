import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPassword from "./pages/auth/ForgotPasswordPage";
import ProfilePage from "./pages/user/ProfilePage";
import AdminCategoryManagementPage from "./pages/admin/AdminCategoryManagementPage";
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage";
import AdminRoleManagementPage from "./pages/admin/AdminRoleManagementPage";
import AdminCreateUpdateArticlePage from "./pages/admin/AdminCreateUpdateArticlePage";
import AdminCommentManagementPage from "./pages/admin/AdminCommentManagementPage";
import WriteNews from "./pages/_test/WriteNews";
import AdminArticleManagementPage from "./pages/admin/AdminArticleManagementPage";
import ArticleDetailPage from "./pages/article/ArticleDetailPage";
import AdminAdManagementPage from "./pages/admin/AdminAdManagementPage";
import AdminAdvertiserManagementPage from "./pages/admin/AdminAdvertiserManagementPage";
import CategoryArticlesPage from "./pages/article/CategoryArticlesPage";
import SavePage from "./pages/user/SavePage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import SearchPage from "./pages/SearchPage";
import AuthorProfilePage from "./pages/article/AuthorProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CategoryPage from "./pages/article/CategoryPage";
import AuthorPage from "./pages/article/AuthorPage";
import PrivateRoute from "./components/privateRoutes/PrivateRoute";
import AdminAdPlacementManagementPage from "./pages/admin/AdminAdPlacementManagementPage";
import SettingPage from "./pages/user/SettingPage";
import AdminContactManagementPage from "./pages/admin/AdminContactManagementPage";
import AdminRoute from "./components/privateRoutes/AdminRoute";
import PublicRoute from "./components/privateRoutes/PublicRoute";

const App = () => {
  return (
    <>
      <ToastContainer />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/authors" element={<AuthorPage />} />
          <Route path="/author/:authorId" element={<AuthorProfilePage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route
            path="/category/:categorySlug"
            element={<CategoryArticlesPage />}
          />
          <Route path="/article/:articleId" element={<ArticleDetailPage />} />
          {/* Publice Route */}
          <Route element={<PublicRoute />}>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Authenication */} 
          <Route element={<PrivateRoute />}>
            {/* User */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/save-list" element={<SavePage />} />
            <Route path="/profile-setting" element={<SettingPage />} />
            {/* Admin */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route
                path="/admin/categories"
                element={<AdminCategoryManagementPage />}
              />
              <Route
                path="/admin/users"
                element={<AdminUserManagementPage />}
              />
              <Route
                path="/admin/roles"
                element={<AdminRoleManagementPage />}
              />
              <Route
                path="/admin/comments"
                element={<AdminCommentManagementPage />}
              />
              <Route
                path="/admin/contacts"
                element={<AdminContactManagementPage />}
              />
              <Route
                path="/admin/article/create"
                element={<AdminCreateUpdateArticlePage />}
              />
              <Route
                path="/admin/article/update/:id"
                element={<AdminCreateUpdateArticlePage />}
              />
              <Route
                path="/admin/articles"
                element={<AdminArticleManagementPage />}
              />
              <Route path="/admin/ads" element={<AdminAdManagementPage />} />
              <Route
                path="/admin/advertisers"
                element={<AdminAdvertiserManagementPage />}
              />
              <Route
                path="/admin/ad-placement"
                element={<AdminAdPlacementManagementPage />}
              />
            </Route>
          </Route>
          <Route path="/test" element={<WriteNews />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
