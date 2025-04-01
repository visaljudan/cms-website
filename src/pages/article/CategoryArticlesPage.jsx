import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ScrollToTop from "../../components/ScrollToTop";
import Loading from "../../components/Loading";
import ArticleCard from "../../components/ArticleCard";
import { useCategoryHook } from "../../hooks/useCategoryHook";
import { useArticleHook } from "../../hooks/useArticleHook";

const CategoryArticlesPage = () => {
  const { categorySlug } = useParams();
  const { getCategories } = useCategoryHook();
  const { articles, getArticles } = useArticleHook();
  const [category, setCategory] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Fetch category by slug
  const categoryParam = useMemo(() => ({ slug: categorySlug }), [categorySlug]);

  console.log(categoryParam);
  const fetchCategory = useCallback(async () => {
    try {
      const response = await getCategories(categoryParam);
      console.log(response);
      if (response?.data?.total > 0) {
        setCategory(response.data.data[0]);
      } else {
        setError("Category not found.");
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      setError("Failed to fetch category. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [categoryParam]);

  // Fetch articles by category slug
  const articleParams = useMemo(() => {
    if (categorySlug === "newest-articles") {
      return {
        status: "published",
        sort: "createdAt",
        order: "desc",
      };
    }

    if (categorySlug === "popular-articles") {
      return {
        status: "published",
        sort: "views",
        order: "desc",
      };
    }

    if (categorySlug === "popular-articles-in-this-month") {
      return {
        status: "published",
        sort: "views",
        order: "desc",
        filter: "thisMonth",
      };
    }

    return { status: "published", categorySlug: categorySlug };
  }, [categorySlug]);

  const fetchArticles = useCallback(async () => {
    await getArticles(articleParams);
  }, [articleParams]);

  useEffect(() => {
    if (categorySlug) {
      setLoading(true);
      fetchArticles().finally(() => {
        setLoading(false);
      });
      if (
        categorySlug === "newest-articles" ||
        categorySlug === "popular-articles" ||
        categorySlug === "popular-articles-in-the-month"
      ) {
      } else {
        fetchCategory().finally(() => {
          setLoading(false);
        });
      }
    }
  }, [categorySlug]);

  const filteredArticles = useMemo(() => {
    return articles?.data?.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesDate = filterDate
        ? article.createdAt.split("T")[0] === filterDate
        : true;
      return matchesSearch && matchesDate;
    });
  }, [articles, searchTerm, filterDate]);
  console.log(category);
  return (
    <MainLayout>
      <ScrollToTop />
      <div className="w-10/12 mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <Loading title="Loading data..." />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-screen">
            <p className="text-center text-red-500">{error}</p>
          </div>
        ) : (
          <div className="my-4">
            <div className="relative w-full mr-4 my-2">
              <img
                src={
                  categorySlug === "newest-articles"
                    ? "https://example.com/newest-articles-image.jpg"
                    : categorySlug === "popular-articles"
                    ? "https://example.com/popular-articles-image.jpg"
                    : categorySlug === "popular-articles-in-this-month"
                    ? "https://example.com/popular-articles-this-month.jpg"
                    : category?.image
                }
                alt={category?.name || "Category"}
                className="w-full h-48 object-cover rounded-lg shadow-md opacity-70"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-black text-center">
                  {categorySlug === "newest-articles"
                    ? "Newest Articles"
                    : categorySlug === "popular-articles"
                    ? "Popular Articles"
                    : categorySlug === "popular-articles-in-this-month"
                    ? "Popular Articles This Month"
                    : category?.name}
                </h2>
                <h5 className="text-sm font-semibold text-black text-center">
                  {categorySlug === "newest-articles"
                    ? "Read the latest published articles."
                    : categorySlug === "popular-articles"
                    ? "Browse the most popular articles of all time."
                    : categorySlug === "popular-articles-in-this-month"
                    ? "Check out the trending articles this month."
                    : category?.description}
                </h5>
              </div>
            </div>

            <div className="flex justify-between items-center my-4">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-1/2"
              />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
              {filteredArticles?.length === 0 ? (
                <p>No articles found.</p>
              ) : (
                filteredArticles?.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryArticlesPage;

//Done
