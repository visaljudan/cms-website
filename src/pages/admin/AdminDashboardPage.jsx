import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, FileText, Folder, Users } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { NavLink } from "react-router-dom";
import api from "../../api/axiosConfig";
import Loading from "../../components/Loading";
import { useUserHook } from "../../hooks/useUserHook";
import { useArticleHook } from "../../hooks/useArticleHook";
import { useCategoryHook } from "../../hooks/useCategoryHook";

const AdminDashboardPage = () => {
  const { users } = useUserHook();
  const { articles, getArticles } = useArticleHook();
  const { categories } = useCategoryHook();
  const [popularArticles, setPopularArticles] = useState([]);
  const [mostViewArticle, setMostViewArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const articlePopularParams = useMemo(
    () => ({ status: "published", sort: "views", order: "desc", limit: 5 }),
    []
  );

  const fetchArticlePopular = useCallback(async () => {
    try {
      const response = await getArticles(articlePopularParams);
      setPopularArticles(response.data);
      setMostViewArticle(response.data.data[0]);
    } catch (error) {
      console.error("Error fetching popular articles:", error);
      setError("Failed to fetch popular articles. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [articlePopularParams]);

  useEffect(() => {
    fetchArticlePopular();
  }, [fetchArticlePopular]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              count={users?.total}
              icon={<Users className="text-blue-500" />}
            />
            <StatCard
              title="Total Articles"
              count={articles?.total}
              icon={<FileText className="text-green-500" />}
            />
            <StatCard
              title="Total Categories"
              count={categories?.total}
              icon={<Folder className="text-orange-500" />}
            />
            <StatCard
              title="Most Viewed"
              count={mostViewArticle?.views || 0}
              icon={<BarChart3 className="text-red-500" />}
              details={mostViewArticle?.title || "No data"}
            />
          </div>
        )}

        <ArticleSection
          loading={loading}
          error={error}
          title="Top 5 Articles"
          articles={popularArticles.data}
        />
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, count, icon, details }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4">
    <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
    <div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-2xl font-bold">{count}</p>
      {details && <p className="text-gray-500 text-sm">{details}</p>}
    </div>
  </div>
);

const ArticleSection = ({ title, articles, loading, error }) => (
  <div className="mt-10">
    <h3 className="text-2xl font-bold text-gray-700 mb-4">{title}</h3>
    <div className="bg-white shadow-lg rounded-lg p-4">
      <ul className="divide-y divide-gray-200">
        {loading ? (
          <Loading />
        ) : error ? (
          <p className="text-red-500">
            Failed to load articles. Please try again.
          </p>
        ) : articles?.length > 0 ? (
          <ul>
            {articles.map((article) => (
              <li
                key={article._id}
                className="py-3 flex justify-between items-center"
              >
                <NavLink
                  to={`/article/${article._id}`}
                  className="text-blue-600 hover:underline"
                >
                  {article.title}
                </NavLink>
                <span className="text-gray-500 text-sm">
                  {article.views} views
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No articles found.</p>
        )}
      </ul>
    </div>
  </div>
);

export default AdminDashboardPage;
