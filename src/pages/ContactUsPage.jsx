import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, User } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import MainLayout from "../layouts/MainLayout";
import ScrollToTop from "../components/ScrollToTop";
import { useContactHook } from "../hooks/useContactHook";

const ContactUsPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;
  const { createContact, loading: contactsLoading } = useContactHook();

  const [form, setForm] = useState({
    name: user ? user.name : "",
    email: user ? user.email : "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const maxMessageLength = 500;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!form.name) {
      formErrors.name = "Name is required.";
      isValid = false;
    }
    if (!form.email) {
      formErrors.email = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      formErrors.email = "Email is not valid.";
      isValid = false;
    }
    if (!form.subject) {
      formErrors.subject = "Subject is required.";
      isValid = false;
    }
    if (!form.message) {
      formErrors.message = "Message is required.";
      isValid = false;
    } else if (form.message.length > maxMessageLength) {
      formErrors.message = "Message must be under 500 words.";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    try {
      const response = await createContact(form);
      if (response.data.success) {
        toast.success("Message sent successfully!");
        setForm({
          name: user ? user.name : "",
          email: user ? user.email : "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
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
            Contact Us
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-4 text-primary" size={20} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              {errors.name && (
                <p className="text-red-500 text-xs my-2">{errors.name}</p>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-4 text-primary" size={20} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              {errors.email && (
                <p className="text-red-500 text-xs my-2">{errors.email}</p>
              )}
            </div>
            <div className="relative">
              <MessageSquare
                className="absolute left-3 top-4 text-primary"
                size={20}
              />
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full p-3 pl-10 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              {errors.subject && (
                <p className="text-red-500 text-xs my-2">{errors.subject}</p>
              )}
            </div>
            <div className="relative">
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="4"
                className="w-full p-3 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-hidden"
              />
              {errors.message && (
                <p className="text-red-500 text-xs my-2">{errors.message}</p>
              )}
              <div className="absolute bottom-2 right-3 text-sm">
                <span
                  className={`${
                    form.message.length > maxMessageLength
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {form.message.length} / {maxMessageLength}
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full p-3 text-white bg-primary rounded-lg hover:bg-primary-dark transition-all"
            >
              {contactsLoading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ContactUsPage;
