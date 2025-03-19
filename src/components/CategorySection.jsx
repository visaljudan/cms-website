import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useArticleHook } from "../hooks/useArticleHook";
import ArticleCard from "./ArticleCard";

const CategorySection = ({ category }) => {
  const { articles, loading, getArticles } = useArticleHook();

  useEffect(() => {
    const fetchArticle = async () => {
      const params = {
        limit: 3,
        status: "published",
      };

      await getArticles(params);
    };

    fetchArticle();
  }, [category._id]);

  const filteredArticles = articles?.data?.filter(
    (article) => article.categoryId._id === category._id
  );

  return (
    <div className="my-16">
      <div className="block lg:flex items-start justify-between w-full">
        <div className="flex flex-col lg:w-1/4 mr-4 my-2">
          <h2 className="text-2xl font-bold text-primary">{category.name}</h2>
          <h5 className="text-sm font-semibold text-gray-500">
            {category.description}
          </h5>
          <NavLink
            to={`/category/${category.slug}`}
            className="text-xs md:text-sm lg:text-base  border border-primary w-fit py-2 px-4 rounded-full bg-primary my-2 md:my-4 lg:my-8 text-white hover:bg-transparent hover:text-primary "
          >
            See More
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p>Loading articles...</p>
          ) : articles?.total === 0 ? (
            <p>No articles found for this category.</p>
          ) : filteredArticles?.length > 0 ? (
            articles?.data
              ?.filter((article) => article.categoryId._id === category._id)
              .map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))
          ) : (
            <p className="">No articles found for this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
