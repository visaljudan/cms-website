import React from "react";
import { NavLink } from "react-router-dom";

const ArticleCard = ({ article }) => {
  const {
    _id,
    thumbnail,
    title,
    userId,
    views,
    createdAt,
    tags = [],
  } = article;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <NavLink
      to={`/article/${_id}`}
      className=" bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <img
        src={thumbnail}
        alt={title}
        className="w-96 h-48 object-cover hover:scale-105 transition duration-500"
      />
      <div className="p-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 my-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded hover:text-red-500 cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <div className="mt-2 text-xl font-semibold hover:cursor-pointer hover:underline transition duration-5 00">
          {title}
        </div>

        <div className="flex items-center space-x-4 mt-8 mb-2 ">
          <div>
            <img
              src={userId?.avatar}
              alt={userId?.name}
              className="h-12 w-12 object-cover rounded-full"
            />
          </div>
          <div>
            <p className="text-lg font-bold">{userId?.name}</p>
            <p className="text-sm text-gray-500">{formattedDate}</p>
            <p className="text-sm text-gray-500">{views} views</p>
          </div>
        </div>
      </div>
    </NavLink>
  );
};

export default ArticleCard;
