import { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const FullEditor = () => {
  const [content, setContent] = useState("");
  const quillRef = useRef(null);

  // Upload image to Cloudinary and insert into editor
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "your_upload_preset"); // Replace with your Cloudinary upload preset

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      const url = data.secure_url; // Get the uploaded image URL

      // Insert image into React Quill editor
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      editor.insertEmbed(range.index, "image", url);
    };
  };

  // Full toolbar options
  const modules = {
    toolbar: {
      container: [
        [{ font: [] }, { size: [] }], // Font & size
        [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headings
        ["bold", "italic", "underline", "strike"], // Text formatting
        [{ color: [] }, { background: [] }], // Text & background color
        [{ script: "sub" }, { script: "super" }], // Superscript / Subscript
        [{ list: "ordered" }, { list: "bullet" }], // Lists
        [{ indent: "-1" }, { indent: "+1" }], // Indents
        [{ align: [] }], // Alignments
        ["blockquote", "code-block"], // Blockquote & Code block
        ["link", "image", "video"], // Links, Images, Video
        ["clean"], // Remove formatting
      ],
      handlers: {
        image: handleImageUpload, // Custom image upload handler
      },
    },
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md mt-5">
      <h2 className="text-2xl font-bold mb-4">Full Featured Text Editor</h2>
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={setContent}
        modules={modules}
        placeholder="Write your article here..."
      />
      <button
        onClick={() => console.log(content)}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        Save Article
      </button>
    </div>
  );
};

export default FullEditor;
