import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import MainLayout from "../../layouts/MainLayout";
import ScrollToTop from "../../components/ScrollToTop";
import { useUserHook } from "../../hooks/useUserHook";
import {
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../../app/user/userSlice";
import { toast } from "react-toastify";

const SettingPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;
  console.log(currentUser);
  const dispatch = useDispatch();
  const { updateUser, loading: usersLoading } = useUserHook();
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name,
    username: user?.username,
    email: user?.email,
    password: "",
    bio: user?.bio,
    avatar: user?.avatar,
    // cover: user.cover,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //Upload Image
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadImage = async (file) => {
    try {
      if (!file) throw new Error("No file selected");
      const storageRef = ref(storage, `cms/avatar/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          setLoading(true),
          (error) => reject(error),
          () => resolve()
        );
      });
      const downloadURL = await getDownloadURL(storageRef);
      console.log("File available at", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, image: "File size must be under 2MB." });
        return;
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onload = function (event) {
        img.onload = async function () {
          if (img.width > 3000 || img.height > 3000) {
            setErrors({
              ...errors,
              image: "Image must be 3000x3000 pixels or smaller.",
            });
            return;
          }

          try {
            const imageUrl = await uploadImage(file);
            setForm({ ...form, avatar: imageUrl });
          } catch (error) {
            console.error("Image upload failed:", error);
            setErrors({
              ...errors,
              image: "Failed to upload image. Please try again.",
            });
          }
        };
        img.src = event.target.result;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const response = await updateUser(user._id, formData);
      const data = response.data;
      dispatch(updateUserSuccess(data));
      toast.success(data.message);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";
      setErrors({
        ...errors,
        form: errorMessage,
      });
      dispatch(updateUserFailure(errorMessage));
    }
  };

  return (
    <MainLayout>
      <ScrollToTop />
      <div className="flex items-center justify-center h-fit my-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-xl"
        >
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Settings
          </h2>

          {/* Profile Avatar Preview */}
          <div className="relative flex flex-col items-center mb-6">
            <img
              onClick={handleButtonClick}
              src={formData.avatar || "https://via.placeholder.com/150"}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full border-2 border-gray-300 shadow-md cursor-pointer"
            />
            <input
              type="file"
              name="avatar"
              id="avatar"
              ref={fileInputRef}
              className="hidden"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
              />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
            />
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="New Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
            />

            {/* <input
            type="text"
            name="cover"
            value={formData.cover}
            onChange={handleChange}
            placeholder="Cover Photo URL"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400"
          /> */}
            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              {usersLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default SettingPage;
