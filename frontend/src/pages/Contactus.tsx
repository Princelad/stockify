import Navbar from "@/components/ui/Navbar";
import { useState } from "react";

export default function Contactus() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // You can integrate with your backend API here
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      type: "general",
    });
  };

  return (
    <div className="min-h-screen bg-[#181825] flex flex-row">
      <div>
        <Navbar />
      </div>
      <div className="flex flex-col pt-[10vh] mr-[5vw] ml-[5vw] items-start flex-1 px-8 max-w-full overflow-x-hidden">
        <h1 className="text-blue-600 text-4xl font-bold mb-8">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
          {/* Contact Information */}
          <div>
            <h2 className="text-blue-500 text-2xl font-bold mb-6">
              Get in Touch
            </h2>
            <p className="text-white text-lg mb-6">
              Have questions about Stockify? Want to contribute to the project?
              We'd love to hear from you! Reach out through any of the channels
              below.
            </p>

            {/* Contact Methods */}
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  GitHub Issues
                </h3>
                <p className="text-white text-sm mb-2">
                  For bug reports and feature requests
                </p>
                <a
                  href="https://github.com/Princelad/stockify/issues"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  github.com/Princelad/stockify/issues
                </a>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M7.414 15.414a2 2 0 01-2.828-2.828l3-3a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 00-1.414-1.414l-1.5 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Project Repository
                </h3>
                <p className="text-white text-sm mb-2">
                  View source code and contribute
                </p>
                <a
                  href="https://github.com/Princelad/stockify"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  github.com/Princelad/stockify
                </a>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Documentation
                </h3>
                <p className="text-white text-sm mb-2">
                  Find guides and API documentation
                </p>
                <a
                  href="https://github.com/Princelad/stockify/wiki"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Project Wiki & Docs
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8">
              <h3 className="text-blue-500 text-xl font-bold mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/Princelad/stockify/issues/new?template=bug_report.md"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  🐛 Report Bug
                </a>
                <a
                  href="https://github.com/Princelad/stockify/issues/new?template=feature_request.md"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  ✨ Request Feature
                </a>
                <a
                  href="https://github.com/Princelad/stockify/blob/main/CONTRIBUTING.md"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  🤝 Contribute
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-blue-500 text-2xl font-bold mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Inquiry Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="general">General Question</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="contribution">Contribution</option>
                  <option value="business">Business Partnership</option>
                  <option value="support">Technical Support</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-vertical"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Send Message
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-300 text-sm">
                <span className="text-blue-400 font-medium">Note:</span> This is
                an open-source project maintained by volunteers. We'll do our
                best to respond promptly, but please be patient as response
                times may vary.
              </p>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="w-full mt-12">
          <h2 className="text-blue-500 text-2xl font-bold mb-6">
            Join Our Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-blue-400 font-semibold mb-2">Contributors</h3>
              <p className="text-white text-sm">
                Join developers from around the world building the future of
                small business inventory management.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">🏪</div>
              <h3 className="text-blue-400 font-semibold mb-2">
                Business Users
              </h3>
              <p className="text-white text-sm">
                Connect with other business owners using Stockify to share
                experiences and best practices.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-blue-400 font-semibold mb-2">
                Early Adopters
              </h3>
              <p className="text-white text-sm">
                Help shape the future of Stockify by testing new features and
                providing valuable feedback.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm mt-8">
          Thank you for your interest in Stockify! Together, we're building
          something amazing for small businesses worldwide.
        </div>
      </div>
    </div>
  );
}
