import {
  FileText,
  Gauge,
  MessageCircle,
  ShieldCheck,
  Tag,
  User,
  Video,
} from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;

  console.log(user);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/6 h-screen bg-gradient-to-b from-primary to-black text-white flex flex-col shadow-lg sticky top-0">
        <div className="p-6 text-2xl font-bold tracking-wider">Admin Panel</div>
        <nav className="flex-grow-0">
          <ul>
            {/* Dashboard */}
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `transition duration-300 ${
                  isActive ? "text-yellow-300 font-semibold" : ""
                }`
              }
            >
              <li className="p-4 flex items-center hover:bg-primary">
                <Gauge size={24} color="currentColor" className="mr-2" />
                Dashboard
              </li>
            </NavLink>

            {/* Categories */}
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `transition duration-300 ${
                  isActive ? "text-yellow-500 font-semibold" : ""
                }`
              }
            >
              <li className="p-4 flex items-center hover:bg-primary">
                <Tag size={24} color="currentColor" className="mr-2" />
                Categories
              </li>
            </NavLink>

            {/* Articles */}
            <NavLink
              to="/admin/articles"
              className={({ isActive }) =>
                `transition duration-300 ${
                  isActive ? "text-yellow-300 font-semibold" : ""
                }`
              }
            >
              <li className="p-4 flex items-center hover:bg-primary">
                <FileText size={24} color="currentColor" className="mr-2" />
                Articles
              </li>
            </NavLink>

            {/* Categories */}
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `transition duration-300 ${
                  isActive ? "text-yellow-300 font-semibold" : ""
                }`
              }
            >
              <li className="p-4 flex items-center hover:bg-primary">
                <User size={24} color="currentColor" className="mr-2" />
                Users
              </li>
            </NavLink>

            {/* Comments */}
            <NavLink
              to="/admin/comments"
              className={({ isActive }) =>
                `transition duration-300 ${
                  isActive ? "text-yellow-300 font-semibold" : ""
                }`
              }
            >
              <li className="p-4 flex items-center hover:bg-primary">
                <MessageCircle
                  size={24}
                  color="currentColor"
                  className="mr-2"
                />
                Comments
              </li>
            </NavLink>

            <NavLink
              to="/admin/advertisers"
              className={({ isActive }) =>
                `transition duration-300 ${
                  isActive ? "text-yellow-300 font-semibold" : ""
                }`
              }
            >
              <li className="p-4 flex items-center hover:bg-primary">
                <Video size={24} color="currentColor" className="mr-2" />
                Advertisers
              </li>
            </NavLink>
            <NavLink
              to="/admin/ads"
              className={({ isActive }) =>
                `transition duration-300 ${
                  isActive ? "text-yellow-300 font-semibold" : ""
                }`
              }
            >
              <li className="p-4 flex items-center hover:bg-primary">
                <Video size={24} color="currentColor" className="mr-2" />
                Ads
              </li>
            </NavLink>

            {/* Roles */}
            <NavLink
              to="/admin/roles"
              className={({ isActive }) =>
                `transition duration-300 ${
                  isActive ? "text-yellow-300 font-semibold" : ""
                }`
              }
            >
              <li className="p-4 flex items-center hover:bg-primary">
                <ShieldCheck size={24} color="currentColor" className="mr-2" />
                Roles
              </li>
            </NavLink>
          </ul>
        </nav>
      </div>

      <div className="w-5/6 p-6 bg-gray-50 min-h-screen text-red-900">
        <div className="shadow-lg bg-white mb-4 rounded p-4 flex items-center justify-start">
          <p className="text-red-900">{user?.roleId?.name}</p>
          <img src={user?.avatar} alt={user?.name} className="w-8 h-8" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
