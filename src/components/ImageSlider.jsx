import { useState, useEffect, useMemo, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, User } from "lucide-react";
import Loading from "./Loading";
import { useArticleHook } from "../hooks/useArticleHook";
import ScrollToTop from "./ScrollToTop";

const ImageSlider = () => {
  // Hook
  const { getArticles, articles, loading } = useArticleHook();
  const [currentIndex, setCurrentIndex] = useState(0);

  // State
  const [hovered, setHovered] = useState(false);

  // Fetch articles
  const articlesParams = useMemo(
    () => ({ limit: 3, sort: "createdAt", status: "published" }),
    []
  );
  const fetchArticles = useCallback(async () => {
    await getArticles(articlesParams);
  });
  useEffect(() => {
    fetchArticles();
  }, []);

  // Auto slide
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === articles.data.length - 1 ? 0 : prevIndex + 1
    );
  }, [articles]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? articles.data.length - 1 : prevIndex - 1
    );
  }, [articles]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (articles?.total > 0) goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [goToNext]);

  // Check if articles are loading or empty
  if (loading || !articles?.total) {
    return;
  }

  // Format date
  const formattedDate = new Date(
    articles.data[currentIndex]?.createdAt
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <ScrollToTop />
      {/* Image Wrapper */}
      {loading ? (
        <></>
      ) : articles.total === 0 ? (
        ""
      ) : articles.total > 0 ? (
        <div
          className="relative w-full h-fit overflow-hidden shadow-lg group rounded-lg"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative">
            <img
              src={
                articles.data[currentIndex]?.thumbnail ||
                "/images/placeholder.jpg"
              }
              alt="Slider"
              className="w-full h-[200px] md:h-[300px] lg:h-[400px] object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 "
            />

            {/* Overlay Content */}
            <div className="absolute inset-0 flex justify-end items-center text-white transition-opacity duration-500">
              <div className="top-0 right-0 w-full lg:w-2/5 h-full absolute z-10 bg-black opacity-50"></div>
              <div className="relative z-20 flex flex-col space-y-4 w-full lg:w-2/5 px-6 py-6 transition-all duration-500">
                <h2 className="text-start text-base md:text-xl lg:text-3xl font-bold">
                  {articles.data[currentIndex]?.title}
                </h2>
                <div className="text-xs lg:text-base flex items-center justify-start space-x-1 font-semibold">
                  <NavLink
                    to={`/author/${articles.data[currentIndex]?.userId?._id}`}
                    className="text-white break-words"
                  >
                    {articles.data[currentIndex]?.userId?.name}
                  </NavLink>
                  <p>|</p>
                  <NavLink
                    to={`/category/${articles.data[currentIndex]?.categoryId?.slug}`}
                    className="text-white break-words"
                  >
                    {articles.data[currentIndex]?.categoryId?.name}
                  </NavLink>
                  <p>|</p>
                  <p>{formattedDate}</p>
                </div>
                <div className="w-full flex items-center justify-start space-x-4">
                  <NavLink
                    to={`/article/${articles.data[currentIndex]?.articleId}`}
                    className="w-fit text-xs py-1 px-2 font-semibold lg:text-base flex items-center border border-third text-third rounded-xl hover:border-primary hover:bg-primary hover:text-bold hover:text-white transition-all duration-300"
                  >
                    Read More
                    <ArrowRight size={18} className="ml-2" />
                  </NavLink>
                  <NavLink
                    to={`/author/${articles.data[currentIndex]?.userId?._id}`}
                    className="w-fit text-xs py-1 px-2 font-semibold lg:text-base flex items-center border border-third text-third rounded-xl hover:border-primary hover:bg-primary hover:text-bold hover:text-white transition-all duration-300"
                  >
                    View Author <User size={18} className="ml-2" />
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className={` hidden z-20 absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 p-3 rounded-full transition-all duration-300 ${
              hovered ? "opacity-100" : "opacity-0"
            } group-hover:opacity-100`}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className={`hidden z-20 absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 p-3 rounded-full transition-all duration-300 ${
              hovered ? "opacity-100" : "opacity-0"
            } group-hover:opacity-100`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-center items-center pt-16">
            <p className="text-red-500">No articles found for this category.</p>
          </div>
        </>
      )}
    </>
  );
};

export default ImageSlider;

// Done
