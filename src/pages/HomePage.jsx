import MainLayout from "../layouts/MainLayout";
import ImageSlider from "../components/ImageSlider";
import CategorySection from "../components/CategorySection";
import Loading from "../components/Loading";
import { useCategoryHook } from "../hooks/useCategoryHook";

const HomePage = () => {
  const { categories, loading } = useCategoryHook();
  return (
    <MainLayout>
      <div className="w-10/12 mx-auto">
        <ImageSlider />
        {loading ? (
          <Loading />
        ) : categories?.total === 0 ? (
          <p>No categories</p>
        ) : categories?.total > 0 ? (
          categories?.data?.map((category) => (
            <CategorySection key={category._id} category={category} />
          ))
        ) : (
          ""
        )}
      </div>
    </MainLayout>
  );
};

export default HomePage;
