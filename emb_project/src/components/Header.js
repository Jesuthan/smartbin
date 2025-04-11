// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Project Name */}
      <h1 className="text-2xl font-bold text-green-600">Smart Waste Bin</h1>

      {/* Navigation Links - Now Horizontal with Space */}
      <nav>
        <ul className="flex space-x-8 text-gray-700 font-medium">
          <li>
            <Link to="/" className="hover:text-green-600 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-green-600 transition">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-green-600 transition">
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
