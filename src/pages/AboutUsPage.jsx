import MainLayout from "../layouts/MainLayout";

const AboutUsPage = () => {
  return (
    <MainLayout>
      {" "}
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          {/* Introduction Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">About Me</h1>
            <p className="text-lg text-gray-700 mt-2">
              Hi, I'm [Your Name], a passionate [Your Profession] from [Your
              Location].
            </p>
          </div>

          {/* Skills Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-primary mb-4">Skills</h2>
            <ul className="grid grid-cols-2 gap-4">
              <li className="bg-gray-200 p-4 rounded-lg shadow-md">Skill 1</li>
              <li className="bg-gray-200 p-4 rounded-lg shadow-md">Skill 2</li>
              <li className="bg-gray-200 p-4 rounded-lg shadow-md">Skill 3</li>
              <li className="bg-gray-200 p-4 rounded-lg shadow-md">Skill 4</li>
            </ul>
          </section>

          {/* Experience Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-primary mb-4">
              Experience
            </h2>
            <p className="text-gray-700">
              I have worked in various roles such as [Your Roles] where I gained
              experience in [Key Areas].
            </p>
          </section>

          {/* Contact Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-primary mb-4">
              Contact
            </h2>
            <p className="text-gray-700">
              Feel free to reach out to me for any projects or opportunities!
            </p>
            <div className="mt-4 flex justify-center gap-6">
              <a
                href="mailto:your-email@example.com"
                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
              >
                Email Me
              </a>
              <a
                href="https://www.linkedin.com/in/yourprofile"
                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/yourgithub"
                className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
              >
                GitHub
              </a>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutUsPage;
