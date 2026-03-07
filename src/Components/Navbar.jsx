import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";

const Navbar = () => {

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "About", path: "/" },
    { name: "My Booking", path: "/my-bookings" },
    { name: "Food Order", path: "https://food-delivery-mu-mauve.vercel.app/" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    setUser(currentUser);

    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, [location]);

  const logout = () => {
    localStorage.removeItem("user");
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

          // My Booking only for admin
          if (link.name === "My Booking" && user?.role !== "admin") {
            return null;
          }

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

        {/* Admin Dashboard */}
        {user?.role === "admin" && (
          <button
            className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer 
            ${isScrolled ? "text-black" : "text-white"} transition-all`}
            onClick={() => navigate("/owner")}
          >
            Dashboard
          </button>
        )}

      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4">

        <img
          src={assets.searchIcon}
          alt="search"
          className={`${isScrolled && "invert"} h-8 transition-all duration-500`}
        />

        {/* Username */}
        {user && (
          <span
            className={`${
              isScrolled ? "text-black" : "text-white"
            } font-medium`}
          >
            {user.uname}
          </span>
        )}

        {user ? (
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-500 text-white rounded-full"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500
            ${isScrolled ? "text-white bg-black" : "bg-white text-black"}`}
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
          className={`${isScrolled && "invert"} h-4`}
        />

      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

        <button
          className="absolute top-4 right-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <img src={assets.closeIcon} alt="close-menu" className="h-6" />
        </button>

        {navLinks.map((link, i) => {

          if (link.name === "My Booking" && user?.role !== "admin") {
            return null;
          }

          return link.path.startsWith("http") ? (

            <a
              key={i}
              href={link.path}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </a>

          ) : (

            <Link
              key={i}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>

          );
        })}

        {user?.role === "admin" && (
          <button
            className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer"
            onClick={() => navigate("/owner")}
          >
            Dashboard
          </button>
        )}

        {user ? (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-8 py-2.5 rounded-full"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-8 py-2.5 rounded-full"
          >
            Login
          </button>
        )}

      </div>

    </nav>
  );
};

export default Navbar;