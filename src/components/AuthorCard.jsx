import { Link } from "react-router-dom";

const AuthorCard = ({ author }) => {
  if (!author) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg px-4 py-2 flex items-center text-center border w-96 ">
      {/* Author Image */}
      <img
        src={author.avatar || "/images/default-avatar.png"}
        alt={author.name}
        className="w-20 h-20 rounded-full border shadow-sm"
      />

      <div className="flex flex-col items-start justify-between space-y-2 px-3">
        {/* Author Name */}
        <h3 className="text-lg font-bold mt-2">{author.name}</h3>

        {/* Author Bio */}
        <p className="text-gray-500 text-sm mt-1">
          {author.bio || "No bio available"}
        </p>

        {/* Social Links */}
        <div className="flex space-x-3 mt-3">
          {author?.socials?.twitter && (
            <a
              href={author.socials.twitter}
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
          )}
          {author?.socials?.linkedin && (
            <a
              href={author.socials.linkedin}
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          )}
        </div>

        {/* View Profile Button */}
        <Link
          to={`/author/${author._id}`}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default AuthorCard;
