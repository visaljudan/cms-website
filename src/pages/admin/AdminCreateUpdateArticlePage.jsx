import { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import { toast } from "react-toastify";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { useCategoryHook } from "../../hooks/useCategoryHook";
import { useArticleHook } from "../../hooks/useArticleHook";
import { useSelector } from "react-redux";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";

Quill.register("modules/imageResize", ImageResize);

const AdminCreateUpdateArticlePage = () => {
  const { id } = useParams();
  const isUpdateMode = Boolean(id);
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data?.user;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: user?._id,
    title: "",
    content: "",
    excerpt: "",
    tags: [],
    thumbnail: "",
    categoryId: "",
    status: "draft",
    isFeatured: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isQuillInitialized, setIsQuillInitialized] = useState(false);
  const quillRef = useRef(null);
  const { categories, loading: categoriesLoading } = useCategoryHook();
  const {
    createArticle,
    updateArticle,
    getArticle,
    loading: articlesLoading,
  } = useArticleHook();
  const [errors, setErrors] = useState("");

  useEffect(() => {
    if (quillRef.current) {
      setIsQuillInitialized(true);
    }
  }, [quillRef]);
  const [content, setContent] = useState();

  const fetchArticle = async () => {
    const response = await getArticle(id);
    if (response.data.success) {
      const data = response.data.data;
      setContent(data.content);
      // Set other fields first
      setFormData((prevData) => ({
        ...prevData,
        title: data.title || "",
        excerpt: data.excerpt || "",
        tags: data.tags || [],
        thumbnail: data.thumbnail || "",
        categoryId: data.categoryId?._id || "",
        status: data.status || "draft",
        isFeatured: data.isFeatured || false,
      }));
    } else {
      toast.error("Article not found");
      navigate("/admin/articles");
    }
  };
  useEffect(() => {
    if (isUpdateMode) {
      fetchArticle();
      setFormData((prevData) => ({
        ...prevData,
        content: content,
      }));
    }
  }, [id, content]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageUrl = await uploadImage(file);
        setFormData({ ...formData, thumbnail: imageUrl });
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
      }
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, categoryId: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setLoading(true);

    let response;
    if (isUpdateMode) {
      response = await updateArticle(id, formData);
    } else {
      response = await createArticle(formData);
    }

    if (response.data.success) {
      toast.success(response.data.message);
      navigate("/admin/articles");
    } else {
      setErrors(response.data.message);
    }
    setLoading(false);
  };

  const uploadImage = async (file) => {
    try {
      if (!file) throw new Error("No file selected");

      const storageRef = ref(storage, `cms/articles/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setLoading(true);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {},
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

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const imageUrl = await uploadImage(file);

          if (isQuillInitialized && quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            const index = range ? range.index : 0;

            // Insert the image into the editor
            quill.insertEmbed(index, "image", imageUrl);
            quill.setSelection(index + 1);
          } else {
            console.error("Quill editor is not initialized yet.");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    };
  };

  const modules = {
    toolbar: [
      [{ font: [] }, { size: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
    imageResize: {
      modules: ["Resize", "DisplaySize", "Toolbar"],
      displayStyles: {
        backgroundColor: "black",
        border: "none",
        color: "white",
      },
      handleStyles: {
        border: "1px solid #fff",
        backgroundColor: "black",
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          {isUpdateMode ? "Edit Article" : "Create Article"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData?.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary"
              placeholder="Enter news title..."
            />
          </div>

          {/* Content (Rich Text Editor) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-gray-700 text-lg font-semibold ">
                Content
              </label>
              <button
                type="button"
                onClick={imageHandler}
                disabled={loading}
                className=" flex items-center justify-center bg-secondary border border-secondary text-white px-4 py-1 rounded-lg shadow-lg hover:bg-third hover:text-secondary"
              >
                {loading ? "Uploading..." : "Upload Image"}
              </button>
            </div>
            <ReactQuill
              ref={quillRef}
              value={formData?.content}
              onChange={handleContentChange}
              modules={modules}
              placeholder="Write your article here..."
              className="min-h-24"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData?.tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center px-3 py-1 bg-gray-200 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveTag(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary"
                placeholder="Add tags"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Add
              </button>
            </div>
          </div>
          {/* Category Select */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold">
              Category
            </label>
            <select
              name="categoryId"
              value={formData?.categoryId}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary"
            >
              <option value="">Select category</option>
              {categories?.data?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-lg font-semibold">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData?.excerpt}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Short summary of the article..."
              rows="3"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-lg font-semibold">
              Thumbnail
            </label>
            <input
              type="file"
              onChange={handleThumbnailChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {formData?.thumbnail && (
              <img
                src={formData?.thumbnail}
                alt="Thumbnail"
                className="mt-2 w-32 h-32 object-cover"
              />
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-lg font-semibold">
              Status
            </label>
            <select
              name="status"
              value={formData?.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-lg font-semibold">
              Featured
            </label>
            <input
              type="radio"
              name="isFeatured"
              checked={formData?.isFeatured}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  isFeatured: e.target.checked,
                });
              }}
              className="mr-2"
            />
            Mark as Featured
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className=" w-full flex items-center justify-center bg-secondary border border-secondary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-third hover:text-secondary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
        {errors && <p className="text-red-500 mt-4">{errors}</p>}
      </div>
    </DashboardLayout>
  );
};

export default AdminCreateUpdateArticlePage;
