import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Loading from "../../components/Loading";
import ArticleCard from "../../components/ArticleCard";
import { useUserHook } from "../../hooks/useUserHook";
import { useArticleHook } from "../../hooks/useArticleHook";
import AuthorCard from "../../components/AuthorCard";

const AuthorProfilePage = () => {
  const { authorId } = useParams();
  const { getUser, loading, getUsers } = useUserHook();
  const { getArticles, loading: loadingArticles } = useArticleHook();
  const [error, setError] = useState(null);
  const [author, setAuthor] = useState(null);
  const [authors, setAuthors] = useState(null);
  const [articles, setArticles] = useState(null);
  const [articleParams, setArticleParams] = useState(null);
  const [authorParams, setAuthorParams] = useState(null);

  useEffect(() => {
    if (!authorId) return;

    const fetchData = async () => {
      try {
        // Fetch Author
        const response = await getUser(authorId);
        if (response.data.success) {
          setAuthor(response.data.data);
        } else {
          setError(response.data.message);
        }

        // Set authorParams (Trigger separate effect)
        setAuthorParams({
          noUserId: authorId,
          roleSlug: "author",
        });

        // Set articleParams (Trigger separate effect)
        setArticleParams({
          userId: authorId,
          status: "published",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, [authorId]);

  // Fetch Articles only after `articleParams` is set
  useEffect(() => {
    if (!articleParams) return;

    const fetchArticles = async () => {
      try {
        const response = await getArticles(articleParams);
        setArticles(response.data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    fetchArticles();
  }, [articleParams]);

  // Fetch Other Authors only after `authorParams` is set
  useEffect(() => {
    if (!authorParams) return;

    const fetchAuthors = async () => {
      try {
        const response = await getUsers(authorParams);
        setAuthors(response.data);
      } catch (error) {
        console.error("Error fetching authors:", error);
      }
    };

    fetchAuthors();
  }, [authorParams]);

  return (
    <MainLayout>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loading title="Loading data..." />
        </div>
      ) : (
        <div className="w-10/12 mx-auto my-16">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <img
              src={author?.avatar}
              alt={author?.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border shadow-md"
            />
            <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
              <h2 className="text-2xl font-bold text-primary">
                {author?.name}
              </h2>
              <p className="text-gray-500">
                {author?.bio || "No bio available"}
              </p>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-700">
              Articles by {author?.name}
            </h3>
            {loadingArticles ? (
              <p>Loading articles...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : articles?.total === 0 ? (
              <p>No articles found for this author.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {articles?.data?.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            )}
          </div>
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-700">Other Authors</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
              {loading ? (
                <p>Loading authors...</p>
              ) : error ? (
                <p className="text-center text-red-500">{error}</p>
              ) : authors?.data?.length === 0 ? (
                <p>No other authors found.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
                  {authors?.data?.map((author) => (
                    <AuthorCard key={author._id} author={author} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AuthorProfilePage;
