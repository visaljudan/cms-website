import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPassword from "./pages/auth/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import AdminCategoryManagementPage from "./pages/admin/AdminCategoryManagementPage";
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage";
import AdminRoleManagementPage from "./pages/admin/AdminRoleManagementPage";
import AdminCreateUpdateArticlePage from "./pages/admin/AdminCreateUpdateArticlePage";
import AdminCommentManagementPage from "./pages/admin/AdminCommentManagementPage";
import WriteNews from "./pages/_test/WriteNews";
import AdminArticleManagementPage from "./pages/admin/AdminArticleManagementPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import AdminAdManagementPage from "./pages/admin/AdminAdManagementPage";
import AdminAdvertiserManagementPage from "./pages/admin/AdminAdvertiserManagementPage";
import SavePage from "./pages/SavePage";
import CategoryArticlesPage from "./pages/CategoryArticlesPage";

const App = () => {
  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/save" element={<SavePage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/test" element={<WriteNews />} />
          <Route path="/article/:articleId" element={<ArticleDetailPage />} />
          <Route
            path="/category/:categorySlug"
            element={<CategoryArticlesPage />}
          />
          {/* Admin */}
          <Route
            path="/admin/categories"
            element={<AdminCategoryManagementPage />}
          />
          <Route path="/admin/users" element={<AdminUserManagementPage />} />
          <Route path="/admin/roles" element={<AdminRoleManagementPage />} />
          <Route
            path="/admin/comments"
            element={<AdminCommentManagementPage />}
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
        </Routes>
      </Router>
    </>
  );
};

export default App;
