import { useEffect, useMemo, useState, useCallback } from "react";
import MainLayout from "../layouts/MainLayout";
import Loading from "../components/Loading";
import ImageSlider from "../components/ImageSlider";
import ScrollToTop from "../components/ScrollToTop";
import CategorySection from "../components/CategorySection";
import { useCategoryHook } from "../hooks/useCategoryHook";
import { useArticleHook } from "../hooks/useArticleHook";
import { NavLink } from "react-router-dom";
import ArticleCard from "../components/ArticleCard";
import CategoryCard from "../components/CategoryCard";

const HomePage = () => {
  const {
    categories,
    getCategories,
    loading: categoryLoading,
  } = useCategoryHook();
  const { articles, getArticles } = useArticleHook();
  const [newestArticles, setNewestArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [popularArticlesInThisMonth, setPopularArticlesInThisMonth] = useState(
    []
  );
  const [loading, setLoading] = useState();
  const [error, setError] = useState(null);

  // Fetch newest articles
  const articleNewestParams = useMemo(
    () => ({
      status: "published",
      sort: "createdAt",
      order: "desc",
      limit: 3,
    }),
    []
  );

  const fetchArticleNewest = useCallback(async () => {
    try {
      const response = await getArticles(articleNewestParams);
      setNewestArticles(response.data);
    } catch (error) {
      console.error("Error fetching newest articles:", error);
      setError("Failed to fetch newest articles. Please try again later.");
    }
  }, [articleNewestParams]);

  // Fetch popular articles
  const articlePopularParams = useMemo(
    () => ({
      status: "published",
      sort: "views",
      order: "desc",
      limit: 3,
    }),
    []
  );

  const fetchArticlePopular = useCallback(async () => {
    try {
      const response = await getArticles(articlePopularParams);
      setPopularArticles(response.data);
    } catch (error) {
      console.error("Error fetching popular articles:", error);
      setError("Failed to fetch popular articles. Please try again later.");
    }
  }, [articlePopularParams]);

  // Fetch popular articles in this month
  const articlePopularInThisMonthParams = useMemo(
    () => ({
      status: "published",
      sort: "views",
      order: "desc",
      filter: "thisMonth",
      limit: 3,
    }),
    []
  );

  const fetchArticlePopularInThisMonth = useCallback(async () => {
    try {
      const response = await getArticles(articlePopularInThisMonthParams);
      setPopularArticlesInThisMonth(response.data);
    } catch (error) {
      console.error("Error fetching popular articles in this month:", error);
      setError(
        "Failed to fetch popular articles in this month. Please try again later."
      );
    }
  }, [articlePopularInThisMonthParams]);

  // Category
  const categoryParams = useMemo(
    () => ({
      status: "active",
      sort: "slug",
      order: "desc",
    }),
    []
  );

  const fetchCategories = useCallback(async () => {
    try {
      await getCategories(categoryParams);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories. Please try again later.");
    }
  }, [categoryParams]);

  useEffect(() => {
    setLoading(true);
    fetchCategories().finally(() => {
      setLoading(false);
    });
    fetchArticleNewest().finally(() => {
      setLoading(false);
    });
    fetchArticlePopular().finally(() => {
      setLoading(false);
    });
    fetchArticlePopularInThisMonth().finally(() => {
      setLoading(false);
    });
  }, []);

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
          <>
            <ImageSlider />
            <div className="my-16">
              <div className="block lg:flex items-start justify-between w-full">
                <div className="flex flex-col lg:w-1/4 mr-4 my-2">
                  <h2 className="text-2xl font-bold text-primary">
                    Newest Articles
                  </h2>
                  <h5 className="text-sm font-semibold text-gray-500">
                    Three latest articles from our writers.
                  </h5>
                  <NavLink
                    to="/category/newest-articles"
                    className="text-xs w-fit py-1 px-2 md:text-sm lg:text-base  border border-primary lg-py-2 lg-px-4 rounded-full bg-primary my-2 md:my-4 lg:my-8 text-white hover:bg-transparent hover:text-primary "
                  >
                    See More
                  </NavLink>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loading title="Loading data..." />
                    </div>
                  ) : newestArticles?.total === 0 ? (
                    <p>No articles abliveable for this category.</p>
                  ) : newestArticles?.total > 0 ? (
                    newestArticles?.data?.map((article) => (
                      <ArticleCard key={article._id} article={article} />
                    ))
                  ) : (
                    <div className="flex justify-center items-center pt-16">
                      <p className="text-red-500">No articles found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="my-16">
              <div className="block lg:flex items-start justify-between w-full">
                <div className="flex flex-col lg:w-1/4 mr-4 my-2">
                  <h2 className="text-2xl font-bold text-primary">
                    Categories
                  </h2>
                  <h5 className="text-sm font-semibold text-gray-500">
                    Explore articles by category.
                  </h5>
                  <NavLink
                    to={`/categories`}
                    className="text-xs w-fit py-1 px-2 md:text-sm lg:text-base  border border-primary lg-py-2 lg-px-4 rounded-full bg-primary my-2 md:my-4 lg:my-8 text-white hover:bg-transparent hover:text-primary "
                  >
                    See More
                  </NavLink>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loading title="Loading data..." />
                    </div>
                  ) : categories?.total === 0 ? (
                    <p>No categories found.</p>
                  ) : categories?.total > 0 ? (
                    categories?.data?.map((category) => (
                      <CategoryCard key={category._id} category={category} />
                    ))
                  ) : (
                    <div className="flex justify-center items-center pt-16">
                      <p className="text-red-500">No category found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="my-16">
              <div className="block lg:flex items-start justify-between w-full">
                {/* Popular Articles Section */}
                <div className="flex flex-col lg:w-1/4 mr-4 my-2">
                  <h2 className="text-2xl font-bold text-primary">
                    Popular Articles
                  </h2>
                  <h5 className="text-sm font-semibold text-gray-500">
                    Most viewed articles.
                  </h5>
                  <NavLink
                    to={`/category/popular-articles`}
                    className="text-xs w-fit py-1 px-2 md:text-sm lg:text-base  border border-primary lg-py-2 lg-px-4 rounded-full bg-primary my-2 md:my-4 lg:my-8 text-white hover:bg-transparent hover:text-primary "
                  >
                    See More
                  </NavLink>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularArticles?.data?.map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Articles This Month Section */}
            <div className="my-16">
              <div className="block lg:flex items-start justify-between w-full">
                <div className="flex flex-col lg:w-1/4 mr-4 my-2">
                  <h2 className="text-2xl font-bold text-primary">
                    Popular Articles This Month
                  </h2>
                  <h5 className="text-sm font-semibold text-gray-500">
                    Most viewed articles this month.
                  </h5>
                  <NavLink
                    to={`/category/popular-articles-in-this-month`}
                    className="text-xs w-fit py-1 px-2 md:text-sm lg:text-base  border border-primary lg-py-2 lg-px-4 rounded-full bg-primary my-2 md:my-4 lg:my-8 text-white hover:bg-transparent hover:text-primary "
                  >
                    See More
                  </NavLink>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularArticlesInThisMonth?.data?.map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default HomePage;
