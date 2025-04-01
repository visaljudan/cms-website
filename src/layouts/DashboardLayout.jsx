import {
  Contact,
  FileText,
  Gauge,
  HomeIcon,
  MessageCircle,
  ShieldCheck,
  Tag,
  User,
  Video,
} from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import SignOut from "../components/SignOut";
import Divider from "../components/Divider";

const DashboardLayout = ({ children }) => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;
  const userRole = currentUser?.data?.user?.roleId?.slug;

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/6 min-h-screen bg-gradient-to-b from-primary to-black text-white flex flex-col shadow-xl sticky top-0 z-10">
        <div className="p-6 text-xl font-bold tracking-wider border-b border-white/10">
          {userRole === "admin"
            ? "Admin Panel"
            : userRole === "author"
            ? "Author Panel"
            : "Editor Panel"}
        </div>

        <nav className="flex-1 mt-4 space-y-2 text-sm">
          <Divider label="Main Items" />
          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <Gauge
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Dashboard
          </NavLink>
          {/* Website */}
          <NavLink
            to="/"
            target="newBlank"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "text-white hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <HomeIcon
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Website
          </NavLink>
          <Divider label="Articles" />
          {/* Categories */}
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <Tag
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Categories
          </NavLink>
          {/* Articles */}
          <NavLink
            to="/admin/articles"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <FileText
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Articles
          </NavLink>
          {/* Comments */}
          <NavLink
            to="/admin/comments"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <MessageCircle
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Comments
          </NavLink>
          <Divider label="Users" />
          {/* Users */}
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <User
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Users
          </NavLink>
          {/* Roles */}
          <NavLink
            to="/admin/roles"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <ShieldCheck
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Roles
          </NavLink>
          <Divider label="Messages" />
          <NavLink
            to="/admin/contacts"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <Contact
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Contacts
          </NavLink>

          <Divider label="Ads" />
          {/* Advertisers */}
          <NavLink
            to="/admin/advertisers"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <Video
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Advertisers
          </NavLink>
          {/* Ads */}
          <NavLink
            to="/admin/ads"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <Video
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Ads
          </NavLink>
          {/* Ad Placement */}
          <NavLink
            to="/admin/ad-placement"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-yellow-300 font-semibold"
                  : "hover:bg-white/10 hover:text-yellow-200"
              }`
            }
          >
            <Video
              size={18}
              className="text-inherit transition-all duration-200"
            />
            Ad Placement
          </NavLink>
          <Divider label="Setting" />
          {/* Sign Out */}
          <div className="px-4 py-2 mx-2 rounded-lg hover:bg-white/10 transition">
            <SignOut />
          </div>
        </nav>
      </div>

      <div className="w-5/6 bg-gray-50 min-h-screen">
        <div className="sticky top-0 shadow-lg bg-white rounded p-3 flex items-center justify-end space-x-2">
          <p className="text-red-900 font-semibold">{user?.name}</p>
          <p className="text-red-900 ">(Role: {user?.roleId?.name})</p>
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-8 h-8 rounded-full border"
          />
        </div>
        <div className="py-4 px-8">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
