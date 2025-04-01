import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="container mx-auto px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-700 pb-6">
          {/* Logo & About */}
          <div>
            <h2 className="text-3xl font-bold text-white">CMS</h2>
            <p className="mt-2 text-sm">
              A powerful content management system for modern web applications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold text-white">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <NavLink to="/" className="hover:text-white">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/categories" className="hover:text-white">
                  Categories
                </NavLink>
              </li>
              <li>
                <NavLink to="/authors" className="hover:text-white">
                  Authors
                </NavLink>
              </li>
              <li>
                <NavLink to="/about-us" className="hover:text-white">
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact-us" className="hover:text-white">
                  Contact
                </NavLink>
              </li>
              <li>
                <NavLink to="/search" className="hover:text-white">
                  Search
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-semibold text-white">Follow Us</h3>
            <div className="mt-2 flex space-x-4">
              <NavLink to="#" className="hover:text-white">
                <i className="fab fa-facebook"></i> Facebook
              </NavLink>
              <NavLink to="#" className="hover:text-white">
                <i className="fab fa-twitter"></i> Twitter
              </NavLink>
              <NavLink to="#" className="hover:text-white">
                <i className="fab fa-instagram"></i> Instagram
              </NavLink>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} CMS. All rights reserved.</p>
          <div className="flex space-x-4">
            <NavLink to="/terms" className="hover:text-white">
              Terms of Service
            </NavLink>
            <NavLink to="/privacy" className="hover:text-white">
              Privacy Policy
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
