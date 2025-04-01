import React from "react";
import MainLayout from "../../layouts/MainLayout";
import CategoryCard from "../../components/CategoryCard";
import { useCategoryHook } from "../../hooks/useCategoryHook";
import Loading from "../../components/Loading";
import ScrollToTop from "../../components/ScrollToTop";

const CategoryPage = () => {
  const { categories, loading } = useCategoryHook();
  const [error, setError] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredCategories = categories?.data?.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
    [searchTerm, categories]
  );

  return (
    <MainLayout>
      <ScrollToTop />
      <div className="w-10/12 mx-auto ">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <Loading title="Loading data..." />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-screen">
            {/* <p className="text-center text-red-500">{error}</p> */}
          </div>
        ) : (
          <div className="my-4">
            <div className="relative w-full mr-4 my-2 h-48 flex flex-col items-center justify-center bg-gray-200 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-black  text-center">
                Categories
              </h2>
              <h5 className="text-sm font-semibold text-black text-center">
                Explore articles by category
              </h5>
            </div>
            <div className="my-4">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
              {filteredCategories?.length === 0 ? (
                <p>No categories found.</p>
              ) : (
                filteredCategories?.map((category) => (
                  <CategoryCard key={category._id} category={category} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {/* Add your category content here */}
    </MainLayout>
  );
};

export default CategoryPage;
