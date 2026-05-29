import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { getUser, logout as logoutUser, updateUserImage } from "../auth.js";
import { apiRequest } from "../api.js";
import { toast } from "react-toastify";

const Navbar = () => {

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" }
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const refreshUser = () => {
    setUser(getUser());
  };

  useEffect(() => {
    refreshUser();
    window.addEventListener('auth-changed', refreshUser);

    if (location.pathname !== "/") {
      setIsScrolled(true);
      return () => window.removeEventListener('auth-changed', refreshUser);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('auth-changed', refreshUser);
    };

  }, [location]);

  const logout = () => {
    logoutUser();
    setUser(null);
    navigate("/");
  };

  return (
    <nav
      className={`fixed h-20 top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-26 
      transition-all duration-500 z-50
      ${
        isScrolled
          ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
          : "bg-black/50 py-4 md:py-6"
      }`}
    >

      {/* Logo */}
      <Link to="/">
        <img
          src={assets.pavan}
          alt="logo"
          className={`h-14 w-35 ${isScrolled && "invert opacity-80"}`}
        />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">

        {navLinks.map((link, i) => {
          return link.path.startsWith("http") ? (
            <a
              key={i}
              href={link.path}
              target="_blank"
              rel="noreferrer"
              className={`group flex flex-col gap-0.5 ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {link.name}
              <div
                className={`${
                  isScrolled ? "bg-gray-700" : "bg-white"
                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
              />
            </a>
          ) : (
            <Link
              key={i}
              to={link.path}
              className={`group flex flex-col gap-0.5 ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {link.name}
              <div
                className={`${
                  isScrolled ? "bg-gray-700" : "bg-white"
                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
              />
            </Link>
          );
        })}
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden md:flex items-center gap-4">

        <img
          src={assets.searchIcon}
          alt="search"
          className={`${isScrolled && "invert"} h-8 mr-2`}
        />

        {/* 🔥 PROFILE SECTION */}
        {user ? (
          <div className="relative group flex items-center gap-3 cursor-pointer py-2">
            
            {/* Profile Image */}
            <img
              src={
                user.imageUrl
                  ? user.imageUrl
                  : "https://i.pravatar.cc/100"
              }
              onError={(e) => {
                e.currentTarget.src = "https://i.pravatar.cc/100";
              }}
              alt="profile"
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-gray-200 transition-all duration-300 group-hover:ring-blue-400"
            />

            {/* Name */}
            <span
              className={`font-semibold tracking-tight ${
                isScrolled ? "text-black" : "text-white"
              }`}
            >
              {user.name}
            </span>

            {/* Hover Dropdown Menu */}
            <div className="absolute top-full right-0 mt-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                    >
                        My Profile
                    </button>
                    {user.role === "ADMIN" && (
                        <button 
                            onClick={() => navigate('/owner')} 
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                            Dashboard
                        </button>
                    )}
                    <button 
                        onClick={() => navigate('/my-bookings')} 
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                    >
                        My Booking
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                        onClick={logout} 
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                        Logout
                    </button>
                </div>
            </div>

          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className={`px-8 py-2.5 rounded-full ml-2 font-semibold shadow-md hover:scale-105 transition-transform
            ${isScrolled ? "text-white bg-red-600" : "bg-red-500 text-white"}`}
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        <img
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          src={assets.menuIcon}
          alt="menu"
          className={`${isScrolled && "invert"} h-6 cursor-pointer`}
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white flex flex-col md:hidden items-center justify-center gap-6 z-50
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300`}
      >

        <button
          className="absolute top-6 right-6"
          onClick={() => setIsMenuOpen(false)}
        >
          <img src={assets.closeIcon} alt="close" className="h-6" />
        </button>

        {navLinks.map((link, i) => {
          return link.path.startsWith("http") ? (
            <a key={i} href={link.path} target="_blank" rel="noreferrer" className="text-xl font-semibold text-gray-800" onClick={() => setIsMenuOpen(false)}>
              {link.name}
            </a>
          ) : (
            <Link key={i} to={link.path} className="text-xl font-semibold text-gray-800" onClick={() => setIsMenuOpen(false)}>
              {link.name}
            </Link>
          );
        })}

        {user ? (
          <div className="flex flex-col items-center gap-4 w-full px-8 mt-6">
            <div className="flex flex-col items-center gap-2">
              <img
                src={user.imageUrl || "https://i.pravatar.cc/100"}
                onError={(e) => {
                  e.currentTarget.src = "https://i.pravatar.cc/100";
                }}
                alt="profile"
                className="w-20 h-20 rounded-full object-cover border-4 shadow-md"
              />
              <p className="font-bold text-xl text-gray-800">{user.name}</p>
            </div>
            
            <div className="w-full bg-gray-50 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                <button 
                    onClick={() => { setIsMenuOpen(false); navigate('/profile'); }} 
                    className="w-full py-3 bg-white border border-gray-100 rounded-xl text-gray-700 font-medium shadow-sm active:scale-95 transition-transform"
                >
                    My Profile
                </button>

                {user.role === "ADMIN" && (
                    <button 
                        onClick={() => { setIsMenuOpen(false); navigate('/owner'); }} 
                        className="w-full py-3 bg-white border border-gray-100 rounded-xl text-gray-700 font-medium shadow-sm active:scale-95 transition-transform"
                    >
                        Dashboard
                    </button>
                )}

                <button 
                    onClick={() => { setIsMenuOpen(false); navigate('/my-bookings'); }} 
                    className="w-full py-3 bg-white border border-gray-100 rounded-xl text-gray-700 font-medium shadow-sm active:scale-95 transition-transform"
                >
                    My Booking
                </button>

                <button 
                    onClick={() => { setIsMenuOpen(false); logout(); }} 
                    className="w-full py-3 mt-2 bg-red-500 text-white rounded-xl font-medium shadow-sm active:scale-95 transition-transform"
                >
                    Logout
                </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => { setIsMenuOpen(false); navigate("/login"); }} 
            className="bg-red-500 text-white px-10 py-3 rounded-full text-lg font-semibold mt-4 shadow-lg active:scale-95 transition-transform"
          >
            Login
          </button>
        )}

      </div>

    </nav>
  );
};

export default Navbar;
