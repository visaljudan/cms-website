import { useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { Mail, Lock, User, EyeOff, Eye, ImageIcon } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import {
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from "../../app/user/userSlice";
import { useDispatch } from "react-redux";
import Loading from "../../components/Loading";
import api from "../../api/axiosConfig";
import ButtonGoogle from "../../components/ButtonGoogle";
import ScrollToTop from "../../components/ScrollToTop";

const SignUpPage = () => {
  //Variable
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
  });

  //Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Create a new form object to avoid multiple state updates
    let updatedForm = { ...form };

    if (name === "username") {
      const regex = /^[a-z0-9]*$/;
      if (!regex.test(value)) return;
      updatedForm.username = value.toLowerCase().trim();
    } else if (name === "name") {
      if (/^[a-zA-Z\s]*$/.test(value)) {
        updatedForm.name = value.trim();
      }
    } else {
      updatedForm[name] = value;
    }
    setForm(updatedForm);
    setErrors({ ...errors, [name]: "" });
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

  //Validate Form
  const validateForm = () => {
    let formErrors = { ...errors };
    let isValid = true;

    if (!form.name) {
      formErrors.name = "Full Name is required.";
      isValid = false;
    }

    if (!form.username) {
      formErrors.username = "Username is required.";
      isValid = false;
    }

    if (!form.email) {
      formErrors.email = "Email Address is required.";
      isValid = false;
    }

    if (form.password.length < 8) {
      formErrors.password = "Password must be at least 8 characters long.";
      isValid = false;
    }

    if (!form.password) {
      formErrors.password = "Password is required.";
      isValid = false;
    }

    if (!form.confirmPassword) {
      formErrors.confirmPassword = "Confirm Password is required.";
      isValid = false;
    }
    if (form.password !== form.confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }
    if (!form.avatar) {
      formErrors.avatar = "Profile avatar is required.";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  // Submit Sign Up
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        dispatch(signUpStart());
        const response = await api.post("/v1/auth/signup", form);
        const data = response.data;
        dispatch(signUpSuccess(data));
        navigate("/");
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || "An unexpected error occurred.";
        setErrors({
          ...errors,
          form: errorMessage,
        });
        dispatch(signUpFailure(errorMessage));
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Form has errors. Fix them first.");
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
          <h2 className="text-2xl font-bold text-center text-primary cursor-default">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-4 text-primary" size={20} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              {errors.name && (
                <p className="text-red-500 text-xs my-2">{errors.name}</p>
              )}
            </div>
            <div className="relative">
              <User className="absolute left-3 top-4 text-primary" size={20} />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              {errors.username && (
                <p className="text-red-500 text-xs my-2">{errors.username}</p>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-4 text-primary" size={20} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              {errors.email && (
                <p className="text-red-500 text-xs my-2">{errors.email}</p>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-4 text-primary" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs my-2">{errors.password}</p>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-4 text-primary" size={20} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-4 text-primary"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs my-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div className="relative">
              {loading ? (
                <Loading />
              ) : (
                form.avatar && (
                  <div className="mb-4">
                    <img
                      src={form.avatar}
                      alt="Profile Preview"
                      className="w-32 h-32 object-cover rounded-full mx-auto"
                    />
                  </div>
                )
              )}
              <ImageIcon
                className={`absolute left-3 text-primary ${
                  form.avatar ? "top-39" : "top-4"
                }`}
                size={20}
              />
              <input
                type="file"
                name="avatar"
                id="avatar"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {/* Upload button */}

              <button
                type="button"
                onClick={handleButtonClick}
                className="w-full text-start text-gray-500 p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              >
                Upload Your Profile
              </button>
              {errors.avatar && (
                <p className="text-red-500 text-xs my-2">{errors.avatar}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 text-third border border-primary bg-primary hover:bg-third  hover:text-primary font-bold rounded-xl transition-all"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
            {errors.form && (
              <p className="text-red-500 text-xs text-center">{errors.form}</p>
            )}
            <div className="text-center text-sm text-gray-500">
              Or continue with
            </div>

            {/* <div className="text-center my-2 ">
              <p className="text-sm">
                <span>Are you forgot password? </span>
                <NavLink
                  to="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Reset Password
                </NavLink>
              </p>
            </div> */}
          </form>
          <ButtonGoogle />
          <div className="text-center my-2">
            <p className="text-sm">
              <span>Already have an account? </span>
              <NavLink to="/signin" className="text-primary hover:underline">
                Sign In
              </NavLink>
            </p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default SignUpPage;
