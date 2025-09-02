import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      {/* Floating Island Navbar */}
      <nav className="bg-white/90 backdrop-blur-lg border border-blue-200/30 rounded-2xl shadow-lg px-6 w-[90vw] h-9.5">
        <div className="grid grid-cols-3 items-center h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 justify-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
              <svg
                className="h-5 w-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 6h-2c0-2.21-1.79-4-4-4S10 3.79 10 6H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H8V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-blue-900 hidden sm:block">
              Stockify
            </span>
          </div>

          {/* Navigation Menu */}
          <div className="flex justify-center">
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="flex items-center space-x-1">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/"
                      className="group inline-flex h-9 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 focus:outline-none"
                    >
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/about"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 focus:outline-none"
                  >
                    About Us
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/contact"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 focus:outline-none"
                  >
                    Contact Us
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 justify-end">
            <Button
              asChild
              size="sm"
              className="hidden sm:flex items-center px-4 py-2 rounded-lg bg-black hover:bg-gray-900 text-white text-sm font-medium transition-colors"
            >
              <a
                href="https://github.com/Princelad/stockify"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link to="/login">Get Started</Link>
            </Button>
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </nav>

      {/* Floating shadow effect */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-3/4 h-4 bg-blue-900/20 blur-xl rounded-full"></div>
    </div>
  );
};

export default Navbar;
