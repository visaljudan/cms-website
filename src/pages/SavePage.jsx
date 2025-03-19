import { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { useSaveHook } from "../hooks/useSaveHook";
import Loading from "../components/Loading";
import MainLayout from "../layouts/MainLayout";

const SavePage = () => {
  const { savedItems, loading, getSavedItems, removeSavedItem } = useSaveHook();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getSavedItems();
  }, []);

  const filteredItems = savedItems?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemove = async (id) => {
    await removeSavedItem(id);
  };

  return (
    <MainLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Saved Items</h2>
        <input
          type="text"c
          placeholder="Search saved items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 w-full border rounded-lg mb-4"
        />
        {loading ? (
          <Loading />
        ) : filteredItems.length === 0 ? (
          <p>No saved items found.</p>
        ) : (
          <ul className="space-y-4">
            {filteredItems.map((item) => (
              <li
                key={item._id}
                className="flex justify-between items-center p-4 border rounded-lg shadow"
              >
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-gray-600">{item.type}</p>
                </div>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
};

export default SavePage;
