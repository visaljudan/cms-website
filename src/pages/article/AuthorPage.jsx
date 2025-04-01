import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import MainLayout from "../../layouts/MainLayout";
import AuthorCard from "../../components/AuthorCard";
import { useUserHook } from "../../hooks/useUserHook";
import Loading from "../../components/Loading";
import ScrollToTop from "../../components/ScrollToTop";

const AuthorPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;
  const { users, loading, getUsers } = useUserHook();
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [authorParams, setAuthorParams] = useState(null);

  useEffect(() => {
    if (user?._id) {
      setAuthorParams({ noUserId: user._id, roleSlug: "author" });
    } else {
      setAuthorParams({});
    }
  }, [user]);

  const fetchAuthors = useCallback(async () => {
    try {
      if (authorParams) {
        await getUsers(authorParams);
      } else {
        console.log("Fetching all authors");
        await getUsers();
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      setError("Failed to fetch authors. Please try again later.");
    }
  }, [getUsers, authorParams]);

  useEffect(() => {
    if (authorParams !== null) {
      fetchAuthors();
    }
  }, [fetchAuthors, authorParams]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  console.log(users);

  const filteredAuthors = users?.data?.filter(
    (author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="relative w-full mr-4 my-2 h-48 flex flex-col items-center justify-center bg-gray-200 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-black text-center">
                Authors
              </h2>
              <h5 className="text-sm font-semibold text-black text-center">
                Explore content by authors
              </h5>
            </div>
            <div className="my-4">
              <input
                type="text"
                placeholder="Search authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
              {filteredAuthors?.length === 0 ? (
                <p>No authors found.</p>
              ) : (
                filteredAuthors?.map((author) => (
                  <AuthorCard key={author._id} author={author} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AuthorPage;
