import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Loading from "../components/Loading";
import ArticleCard from "../components/ArticleCard";
import { useArticleHook } from "../hooks/useArticleHook";

const SearchPage = () => {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const { articles, getArticles, loading } = useArticleHook();

  const articlesParams = useMemo(() => {
    return {
      limit: 100,
      sort: "views",
      order: "desc",
      status: "published",
    };
  });

  const fetchArticles = useCallback(async () => {
    await getArticles(articlesParams);
  }, [articlesParams]);

  useEffect(() => {
    fetchArticles();
  }, []);

  // Extract tag from URL hash (#tag-name)
  useEffect(() => {
    if (location.hash) {
      setQuery(decodeURIComponent(location.hash.substring(1))); // Remove "#" and decode URI
    }
  }, [location]);

  // Search function
  const filteredArticles = articles?.data?.filter((article) => {
    const lowerCaseQuery = query.toLowerCase();

    return (
      article.title?.toLowerCase().includes(lowerCaseQuery) ||
      article.excerpt?.toLowerCase().includes(lowerCaseQuery) ||
      article.content?.toLowerCase().includes(lowerCaseQuery) ||
      article.tags?.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)) ||
      article.userId?.name?.toLowerCase().includes(lowerCaseQuery) ||
      article.categoryId?.name?.toLowerCase().includes(lowerCaseQuery) ||
      article.categoryId?.slug?.toLowerCase().includes(lowerCaseQuery)
    );
  });

  return (
    <MainLayout>
      <div className="w-10/12 mx-auto my-8">
        <form className="mb-6">
          <input
            type="text"
            placeholder="Search by title, tags, content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring focus:ring-primary"
          />
        </form>

        {loading ? (
          <Loading />
        ) : filteredArticles?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No results found.</p>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchPage;
