import Navbar from "@/components/ui/Navbar";

export default function Aboutus() {
  return (
    <div className="min-h-screen bg-[#181825] flex flex-row">
      <div>
        <Navbar />
      </div>
      <div className="flex flex-col ml-[5vw] mr-[5vw] pt-[10vh] items-start flex-1 px-8 max-w-full overflow-x-hidden">
        <h1 className="text-blue-600 text-4xl font-bold mb-8">
          About Stockify
        </h1>

        {/* Main Description */}
        <div className="mb-8">
          <p className="text-white text-lg mb-4">
            Stockify is an{" "}
            <span className="text-blue-400 font-semibold">
              open-source stock management and billing solution
            </span>{" "}
            specifically designed for small and medium-sized businesses. We help
            shopkeepers and business owners efficiently manage their inventory
            and streamline billing processes with essential functionality rather
            than complex enterprise features.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-8">
          <h2 className="text-blue-500 text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-white text-lg mb-4">
            We believe that every small business deserves access to powerful,
            yet simple tools to manage their operations. Stockify bridges the
            gap between basic spreadsheets and complex enterprise systems by
            providing:
          </p>
          <ul className="text-white text-lg list-disc list-inside space-y-2 ml-4">
            <li>
              <span className="text-blue-400">Stock Management:</span> Track
              product details and monitor goods coming in and out of shops
            </li>
            <li>
              <span className="text-blue-400">Integrated Billing:</span>{" "}
              Generate customer bills that automatically update stock levels
            </li>
            <li>
              <span className="text-blue-400">Business Insights:</span> Display
              trends and growth patterns to support business decisions
            </li>
            <li>
              <span className="text-blue-400">Customer Relations:</span> Manage
              customer purchase history and payment tracking
            </li>
          </ul>
        </div>

        {/* Key Features */}
        <div className="mb-8">
          <h2 className="text-blue-500 text-2xl font-bold mb-4">
            What Makes Us Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">
                Multi-tier Pricing
              </h3>
              <p className="text-white text-sm">
                Support both retail customers and wholesale dealers with
                different pricing structures
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">
                Payment Flexibility
              </h3>
              <p className="text-white text-sm">
                Accept multiple payment methods including UPI, Cash, and Card
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">
                Credit Management
              </h3>
              <p className="text-white text-sm">
                Track customer payment histories and set purchase permissions
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">
                Multi-supplier Support
              </h3>
              <p className="text-white text-sm">
                Track same products from different suppliers while maintaining
                unified inventory
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-8">
          <h2 className="text-blue-500 text-2xl font-bold mb-4">
            Built With Modern Technology
          </h2>
          <p className="text-white text-lg mb-4">
            Stockify leverages cutting-edge technologies to deliver a robust and
            scalable solution:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">Backend</h3>
              <ul className="text-white text-sm space-y-1">
                <li>• Node.js & Express.js</li>
                <li>• MongoDB with Mongoose</li>
                <li>• JWT Authentication</li>
                <li>• Jest Testing</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">Frontend</h3>
              <ul className="text-white text-sm space-y-1">
                <li>• React.js 18+ with hooks</li>
                <li>• Tailwind CSS</li>
                <li>• Chart.js & Recharts</li>
                <li>• React Hook Form</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-blue-400 font-semibold mb-2">DevOps</h3>
              <ul className="text-white text-sm space-y-1">
                <li>• Docker & Docker Compose</li>
                <li>• PM2 Process Management</li>
                <li>• Automated Testing</li>
                <li>• CI/CD Ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Open Source Commitment */}
        <div className="mb-8">
          <h2 className="text-blue-500 text-2xl font-bold mb-4">
            Open Source Commitment
          </h2>
          <p className="text-white text-lg mb-4">
            Stockify is built with ❤️ by the open-source community. We believe
            in transparency, collaboration, and making powerful business tools
            accessible to everyone. Our project is:
          </p>
          <ul className="text-white text-lg list-disc list-inside space-y-2 ml-4">
            <li>Completely free and open-source under MIT license</li>
            <li>Welcoming to contributors of all skill levels</li>
            <li>
              Focused on continuous improvement through community feedback
            </li>
            <li>Committed to documentation and knowledge sharing</li>
          </ul>
        </div>

        {/* Current Status */}
        <div className="mb-8">
          <h2 className="text-blue-500 text-2xl font-bold mb-4">
            Project Status
          </h2>
          <div className="bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-100">
              <span className="font-semibold">Current Phase:</span> Foundation
              Development (July 2025)
            </p>
            <p className="text-yellow-100 mt-2">
              We're actively building the core features including backend APIs,
              frontend components, and essential business logic. The project
              structure is ready and we're implementing key functionality
              outlined in our roadmap.
            </p>
          </div>
        </div>

        {/* Get Involved */}
        <div className="mb-8">
          <h2 className="text-blue-500 text-2xl font-bold mb-4">
            Get Involved
          </h2>
          <p className="text-white text-lg mb-4">
            Whether you're a business owner, developer, or someone passionate
            about helping small businesses thrive, there's a place for you in
            the Stockify community:
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/Princelad/stockify"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Star on GitHub
            </a>
            <a
              href="https://github.com/Princelad/stockify/issues"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Report Issues
            </a>
            <a
              href="https://github.com/Princelad/stockify/blob/main/CONTRIBUTING.md"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Contribute
            </a>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm mt-8">
          Built with ❤️ by the open-source community • Inspired by modern
          inventory management needs of small businesses
        </div>
      </div>
    </div>
  );
}
