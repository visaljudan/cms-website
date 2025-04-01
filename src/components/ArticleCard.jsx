import React from "react";
import { NavLink } from "react-router-dom";

const ArticleCard = ({ article }) => {
  const formattedDate = new Date(article.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className=" bg-white shadow-lg rounded-lg overflow-hidden">
      <NavLink to={`/article/${article.articleId}`}>
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full lg:w-[400px] h-48 object-cover hover:scale-105 transition duration-500"
        />
      </NavLink>
      <div className="p-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 my-2">
          {article.tags.map((tag, index) => (
            <NavLink key={index} to={`/search/#${tag}`}>
              <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded hover:text-red-500 cursor-pointer">
                #{tag}
              </span>
            </NavLink>
          ))}
        </div>
        {/* Title */}
        <div className="mt-2 text-xl font-semibold hover:cursor-pointer hover:underline transition duration-500">
          <NavLink to={`/article/${article.articleId}`}>
            {article.title}
          </NavLink>
        </div>
        <NavLink className="text-sm" to={`/article/${article.articleId}`}>
          {article.excerpt}
        </NavLink>
        <div className="flex items-center space-x-4 mt-8 mb-2 ">
          <div>
            <img
              src={article?.userId?.avatar}
              alt={article?.userId?.name}
              className="h-12 w-12 object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <NavLink
              to={`/author/${article.userId._id}`}
              className="text-lg font-bold"
            >
              {article.userId?.name}
            </NavLink>
            <NavLink
              to={`/category/${article.categoryId?.slug}`}
              className="text-sm text-gray-500"
            >
              {article.categoryId?.name}
            </NavLink>
            <p className="text-sm text-gray-500">{formattedDate}</p>
            <p className="text-sm text-gray-500">{article.views} views</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
