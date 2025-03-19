import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const images = [
  {
    src: "https://plus.unsplash.com/premium_photo-1681487769650-a0c3fbaed85a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmluYW5jZXxlbnwwfHwwfHx8MA%3D%3D",
    title: "Explore the Beauty of Nature",
    author: "Visal",
    category: "Eco",
    createAt: "12 May 2025",
    link: "#",
  },
  {
    src: "https://media.lendingkart.com/wp-content/uploads/2020/02/finance-loan.jpg",
    title: "Discover Stunning Cityscapes",
    author: "Visal",
    category: "Eco",
    createAt: "12 May 2025",
    link: "#",
  },
  {
    src: "https://img.freepik.com/free-vector/flat-design-south-korea-map-design_23-2149598670.jpg",
    title: "Adventure Awaits in the Mountains",
    author: "Visal",
    category: "Eco",
    createAt: "12 May 2025",
    link: "#",
  },
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div
      className="relative w-full h-fit overflow-hidden shadow-lg group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Wrapper with Hover Zoom */}
      <div className="relative">
        <img
          src={images[currentIndex].src}
          alt="Slider"
          className="w-full h-[200px] md:h-[300px] lg:h-[400px] object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          onError={(e) => (e.target.src = "/images/placeholder.jpg")}
        />

        {/* Overlay Content */}
        <div className=" hidden absolute inset-0 md:flex justify-end items-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="top-0 right-0 w-2/5 h-full absolute z-10 bg-black opacity-70"></div>
          <div className=" relative z-20 flex flex-col space-y-4 w-2/5 px-6 py-6 transition-all duration-500">
            <h2 className="text-xl lg:text-3xl font-bold">
              {images[currentIndex].title}
            </h2>
            <div className="text-sm lg:text-base">
              {images[currentIndex].author} | {images[currentIndex].category} |{" "}
              {images[currentIndex].createAt}
            </div>
            <div className="w-full flex items-center justify-center space-x-4">
              <NavLink className="w-fit text-xs lg:text-base flex items-center gap-2 py-2 px-4 font-semibold border border-third text-third rounded-xl hover:border-primary hover:bg-primary hover:text-bold hover:text-white transition-all duration-300">
                Read More <ArrowRight size={18} />
              </NavLink>
              <NavLink className="w-fit  text-xs lg:text-base flex items-center gap-2 py-2 px-4 font-semibold border border-third text-third rounded-xl hover:border-primary hover:bg-primary hover:text-bold hover:text-white transition-all duration-300">
                View Author <User size={18} />
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Show on Hover */}
      <button
        onClick={goToPrev}
        className={`z-20 absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 p-3 rounded-full transition-all duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100`}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className={`z-20 absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 p-3 rounded-full transition-all duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100`}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default ImageSlider;
