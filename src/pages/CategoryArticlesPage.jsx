import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Loading from "../components/Loading";
import { useCategoryHook } from "../hooks/useCategoryHook";
import { useEffect, useState } from "react";
import { useArticleHook } from "../hooks/useArticleHook";
import ArticleCard from "../components/ArticleCard";

const CategoryArticlesPage = () => {
  const { categorySlug } = useParams();
  const { loading, getCategories } = useCategoryHook();
  const { articles, getArticles } = useArticleHook();
  const [category, setCategory] = useState();
  const [error, setError] = useState();

  const fetchCategory = async () => {
    const params = { search: categorySlug };
    const response = await getCategories(params);
    console.log(response);
    if (response?.data?.data?.length > 0) {
      setCategory(response.data.data[0]);
    }
  };

  useEffect(() => {
    if (categorySlug) {
      fetchCategory();
    }
  }, [categorySlug]);

  useEffect(() => {
    if (category?._id) {
      const fetchArticle = async () => {
        const params = { status: "published", categoryId: category._id };
        await getArticles(params);
      };

      fetchArticle();
    }
  }, [category]);

  console.log(category);

  return (
    <MainLayout>
      <div className="w-10/12 mx-auto">
        {loading ? (
          <Loading />
        ) : (
          <div className="my-4">
            <div className="relative w-full mr-4 my-2">
              <img
                src={category?.image}
                alt={category?.name}
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
              <div className="absolute inset-0 opacity-80 flex flex-col justify-center items-center p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-white text-center">
                  {category?.name}
                </h2>
                <h5 className="text-sm font-semibold text-gray-300 text-center">
                  {category?.description}
                </h5>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <p>Loading articles...</p>
              ) : articles?.total === 0 ? (
                <p>No articles found for this category.</p>
              ) : articles?.total > 0 ? (
                articles?.data?.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))
              ) : (
                <p className="">No articles found for this category.</p>
              )}
            </div>
            {/* </div> */}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryArticlesPage;
