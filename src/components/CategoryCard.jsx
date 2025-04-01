import React from "react";
import { NavLink } from "react-router-dom";

const CategoryCard = ({ category, total }) => {
  const { slug, image, name, description } = category;
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <NavLink to={`/category/${slug}`}>
        <img
          src={image}
          alt={name}
          className="w-full lg:w-[400px] h-48 object-cover hover:scale-105 transition duration-500"
        />
      </NavLink>
      <div className="p-4">
        {/* Category Name */}
        <div className="mt-2 text-xl font-semibold hover:cursor-pointer hover:underline transition duration-500">
          <NavLink to={`/category/${slug}`}>{name}</NavLink>
        </div>
        {/* Description */}
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        {/* Article Count */}
      </div>
    </div>
  );
};

export default CategoryCard;
