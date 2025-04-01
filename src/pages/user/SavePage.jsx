import { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { useSaveHook } from "../../hooks/useSaveHook";
import Loading from "../../components/Loading";
import MainLayout from "../../layouts/MainLayout";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

const SavePage = () => {
  const { saves, loading, deleteSave } = useSaveHook();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSaved = saves?.data?.filter((save) =>
    save.articleId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemove = async (id) => {
    const response = await deleteSave(id);
    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <MainLayout>
      <div className="w-10/12 mx-auto my-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Saved Items</h2>
        <input
          type="text"
          placeholder="Search saved items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 w-full border rounded-lg mb-4"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <Loading />
          ) : filteredSaved?.length === 0 ? (
            <p>No saved items found.</p>
          ) : (
            <ul className="space-y-4">
              {filteredSaved?.map((save) => {
                const formattedDate = new Date(
                  save?.articleId?.createdAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={save.articleId._id}
                    className="bg-white shadow-lg rounded-lg overflow-hidden relative"
                  >
                    <NavLink to={`/article/${save.articleId._id}`}>
                      <img
                        src={save.articleId.thumbnail}
                        alt={save.articleId.title}
                        className="w-full lg:w-[400px] h-48 object-cover hover:scale-105 transition duration-500"
                      />
                      <div className="p-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 my-2">
                          {save.articleId.tags?.map((tag, index) => (
                            <span
                              key={index}
                              className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded hover:text-red-500 cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <div className="mt-2 text-xl font-semibold hover:cursor-pointer hover:underline transition duration-500">
                          {save.articleId.title}
                        </div>

                        {/* Author and Date */}
                        <div className="flex items-center space-x-4 mt-8 mb-2">
                          <div>
                            <img
                              src={save.userId?.avatar}
                              alt={save.userId?.name}
                              className="h-12 w-12 object-cover rounded-full"
                            />
                          </div>
                          <div>
                            <p className="text-lg font-bold">
                              {save.userId?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formattedDate}
                            </p>
                            <p className="text-sm text-gray-500">
                              {save.articleId.views} views
                            </p>
                          </div>
                        </div>
                      </div>
                    </NavLink>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(save.articleId?._id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SavePage;
