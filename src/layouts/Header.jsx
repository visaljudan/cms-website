import { NavLink } from "react-router-dom";
import { Menu, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useSelector } from "react-redux";
import { useCategoryHook } from "../hooks/useCategoryHook";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Loading from "../components/Loading";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;
  const { categories, loading } = useCategoryHook();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  return (
    <div className="bg-white z-50 sticky top-0">
      <div className="flex justify-center w-full  shadow-xl">
        <header className="w-10/12 py-4 sm:text-base90 ">
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
                  `hover:font-semibold ${
                    isActive ? "font-semibold text-primary" : "text-gray-500"
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `hover:font-semibold  hover:text-primary ${
                    isActive ? "font-semibold text-primary" : "text-gray-500"
                  }`
                }
              >
                Categories
              </NavLink>

              <NavLink
                to="/authors"
                className={({ isActive }) =>
                  `hover:font-semibold  hover:text-primary ${
                    isActive ? "font-semibold text-primary" : "text-gray-500"
                  }`
                }
              >
                Authors
              </NavLink>

              <NavLink
                to="/about-us"
                className={({ isActive }) =>
                  `hover:font-semibold  hover:text-primary ${
                    isActive ? "font-semibold text-primary" : "text-gray-500"
                  }`
                }
              >
                About Us
              </NavLink>

              <NavLink
                to="/contact-us"
                className={({ isActive }) =>
                  `hover:font-semibold hover:text-primary ${
                    isActive ? "font-semibold text-primary" : "text-gray-500"
                  }`
                }
              >
                Contact Us
              </NavLink>

              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `flex items-center gap-2 hover:font-semibold hover:text-primary ${
                    isActive ? "font-semibold text-primary" : "text-gray-500"
                  }`
                }
              >
                <Search size={20} />
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
                  to={`/category/${category.slug}`}
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
    </div>
  );
};

export default Header;
