import LightRays from "@/Backgrounds/LightRays/LightRays";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Package, BarChart3, Receipt, Users, ArrowRight, Play, BookOpen, Star, Zap, Shield, TrendingUp } from "lucide-react";

function Landing() {
  return (
    <div className="w-screen min-h-screen static overflow-x-hidden bg-[#181825]">
      {/* Background */}
      <div className="fixed inset-0 z-[1]">
        <LightRays
          raysOrigin="top-center"
          raysColor="#2563eb"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>

      {/* Content */}
      <div className="relative z-[2]">
        <Navbar />
        
        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center min-h-screen px-4 pt-20">
          <div className="text-center max-w-6xl mx-auto">
            <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-2 text-sm font-medium">
              <Star className="w-4 h-4 mr-2" />
              Open Source Inventory Management
            </Badge>
            
            <div className="mb-6">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight">
                Stockify
              </h1>
            </div>
            
            <div className="text-xl md:text-2xl text-blue-200 mb-4 font-medium">
              Smart Inventory • Seamless Billing • Powerful Analytics
            </div>
            
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              The complete open-source solution for small and medium businesses. 
              Manage inventory, process sales, track customers, and gain insights - all in one place.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/login">
                <Button size="lg" className="text-lg bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                className="text-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
              
              <Button 
                size="lg" 
                className="text-lg bg-gray-800/50 hover:bg-gray-700/60 text-gray-300 hover:text-white border border-gray-600/40 hover:border-gray-500/60 px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Documentation
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything Your Business Needs
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Streamline your operations with our comprehensive suite of business tools
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="bg-blue-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Inventory Management</h3>
                <p className="text-gray-400">
                  Track stock levels, manage suppliers, and automate reorder points with ease.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="bg-green-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Receipt className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Smart Billing</h3>
                <p className="text-gray-400">
                  Generate professional invoices, process payments, and manage customer transactions.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="bg-purple-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Analytics Dashboard</h3>
                <p className="text-gray-400">
                  Real-time insights, sales reports, and business intelligence at your fingertips.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="bg-orange-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Customer Management</h3>
                <p className="text-gray-400">
                  Build relationships with detailed customer profiles and purchase history.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-transparent to-blue-950/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge className="mb-6 bg-green-600/20 text-green-300 border-green-500/30">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Proven Results
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Built for Small Business Success
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Join hundreds of businesses that have streamlined their operations and increased profits with Stockify.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/5 rounded-xl p-6 border border-gray-700/30">
                    <div className="flex items-center mb-3">
                      <Zap className="w-6 h-6 text-yellow-400 mr-3" />
                      <span className="text-2xl font-bold text-white">85%</span>
                    </div>
                    <p className="text-gray-400">Faster inventory processing</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-6 border border-gray-700/30">
                    <div className="flex items-center mb-3">
                      <Shield className="w-6 h-6 text-blue-400 mr-3" />
                      <span className="text-2xl font-bold text-white">99.9%</span>
                    </div>
                    <p className="text-gray-400">System uptime reliability</p>
                  </div>
                </div>
                
                <Link to="/login">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4 rounded-xl shadow-2xl shadow-blue-500/25">
                    Start Your Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 h-32">
                    <Package className="w-8 h-8 text-blue-400 mb-2" />
                    <p className="text-sm text-gray-300">Multi-location inventory tracking</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 h-40">
                    <Receipt className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-sm text-gray-300">Automated billing and invoicing system</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 h-40">
                    <BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
                    <p className="text-sm text-gray-300">Real-time analytics and reporting</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 h-32">
                    <Users className="w-8 h-8 text-orange-400 mb-2" />
                    <p className="text-sm text-gray-300">Customer relationship management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join the growing community of businesses using Stockify to streamline their operations.
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-12 py-4 rounded-xl text-lg shadow-2xl shadow-blue-500/25">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Landing;
