import { NavLink } from "react-router-dom";
import { Menu, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useSelector } from "react-redux";
import { useCategoryHook } from "../hooks/useCategoryHook";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;
  const { categories, loading, getCategories } = useCategoryHook();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-center w-full shadow-xl">
        <header className="w-10/12 py-4 sm:text-base">
          <nav className="flex items-center justify-between text-primary">
            <div className="text-lg font-bold">
              <NavLink to="/" className="text-3xl hover:font-bold">
                CMS
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:space-x-8 text-gray-500">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 hover:font-semibold ${
                    isActive ? "font-semibold text-primary" : "text-gray-500"
                  }`
                }
              >
                Home
                {/* <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-400 ease-in-out group-hover:w-full"></span> */}
              </NavLink>

              {/* Category Dropdown */}
              <div className="relative group">
                <NavLink
                  to="/category"
                  className="group relative flex items-center gap-2 hover:text-primary hover:font-semibold"
                >
                  Category
                  {/* <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-400 ease-in-out group-hover:w-full"></span> */}
                </NavLink>

                <div className="absolute z-20 -left-20 hidden w-[500px] mt-1 h-[250px] space-y-2 bg-white shadow-lg group-hover:block">
                  {loading ? (
                    <p className="text-center py-4 text-gray-500">
                      Loading categories...
                    </p>
                  ) : categories?.total === 0 ? (
                    <p className="text-center py-4 text-gray-500">
                      No categories available.
                    </p>
                  ) : categories?.data ? (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {categories.data.map((category) => (
                        <NavLink
                          key={category._id}
                          to={`category/${category.slug}`}
                          className="block px-4 py-2 text-base text-primary hover:bg-gray-100"
                        >
                          {category.name}
                        </NavLink>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-red-500">
                      Failed to load categories.
                    </p>
                  )}
                </div>
              </div>

              <NavLink
                to="/about-us"
                className="group relative flex items-center gap-2 hover:text-primary hover:font-semibold"
              >
                About Us
                {/* <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-400 ease-in-out group-hover:w-full"></span> */}
              </NavLink>
              <NavLink
                to="/contact-us"
                className="group relative flex items-center gap-2 hover:text-primary hover:font-semibold"
              >
                Contact Us
                {/* <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-400 ease-in-out group-hover:w-full"></span> */}
              </NavLink>
              <NavLink
                to="/search"
                className="group relative flex items-center gap-2 hover:text-primary hover:font-semibold"
              >
                <Search size={20} />
                {/* Search */}
                {/* <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-400 ease-in-out group-hover:w-full"></span> */}
              </NavLink>
            </div>

            {/* Join Button */}
            {user ? (
              <div>
                <NavLink to="/profile" className="flex items-center space-x-4">
                  <img
                    className="h-10 w-10 border border-primary rounded-full object-cover"
                    src={user.avatar}
                    alt={user.name}
                  />
                  <p>{user.name}</p>
                </NavLink>
              </div>
            ) : (
              <div>
                <NavLink
                  to="/signup"
                  className="w-full p-3 text-third border border-primary bg-primary hover:bg-third  hover:text-primary font-bold rounded-full transition-all"
                >
                  Join With Us
                </NavLink>
              </div>
            )}

            {/* Mobile Navigation (Hamburger Menu) */}
            <div className="lg:hidden flex items-center justify-center space-x-4">
              <button
                className="lg:hidden text-primary"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </nav>
        </header>
      </div>
      {/* Mobile Navigation */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="lg:hidden bg-white shadow-md p-4 space-y-4 text-center"
        >
          <NavLink
            to="/"
            className="block hover:text-primary hover:font-semibold"
          >
            Home
          </NavLink>

          {/* Categories with Toggle Icon */}
          <button
            onClick={() => setCategoryOpen(!categoryOpen)}
            className="flex items-center justify-center w-full hover:text-primary hover:font-semibold"
          >
            Categories
            {categoryOpen ? (
              <ChevronUp className="ml-2 w-4 h-4" />
            ) : (
              <ChevronDown className="ml-2 w-4 h-4" />
            )}
          </button>

          {categoryOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 w-full bg-white shadow-lg rounded-md overflow-hidden"
            >
              {categories.data?.map((category) => (
                <NavLink
                  key={category._id}
                  to={`/category/${category._id}`}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  {category.name}
                </NavLink>
              ))}
            </motion.div>
          )}

          <NavLink
            to="/about-us"
            className="block hover:text-primary hover:font-semibold"
          >
            About Us
          </NavLink>
          <NavLink
            to="/search"
            className="block hover:text-primary hover:font-semibold"
          >
            Search
          </NavLink>
        </motion.div>
      )}
      ;
    </div>
  );
};

export default Header;
