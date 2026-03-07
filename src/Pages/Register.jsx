import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uname: "",
    uemail: "",
    upass: "",
    ucpass: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});
  const [isAdminTaken, setIsAdminTaken] = useState(false);

  // Check if admin already exists
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const adminExists = users.some((u) => u.role === "admin");
    setIsAdminTaken(adminExists);
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.uname) newErrors.uname = "Name is required";
    if (!formData.uemail) newErrors.uemail = "Email is required";
    if (!formData.upass) newErrors.upass = "Password is required";
    if (!formData.ucpass) newErrors.ucpass = "Confirm password is required";

    if (formData.upass !== formData.ucpass) {
      newErrors.ucpass = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Only one admin allowed
    if (formData.role === "admin" && isAdminTaken) {
      alert("Admin already exists! Only one admin allowed.");
      return;
    }

    users.push(formData);
    localStorage.setItem("users", JSON.stringify(users));

    // Save current logged in user
    const currentUser = {
      uname: formData.uname,
      uemail: formData.uemail,
      role: formData.role,
    };

   // localStorage.setItem("user", JSON.stringify(currentUser));

    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

        {/* Name */}
        <input
          type="text"
          name="uname"
          placeholder="Enter Name"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 mb-1"
        />
        {errors.uname && (
          <p className="text-red-500 text-sm mb-2">{errors.uname}</p>
        )}

        {/* Email */}
        <input
          type="email"
          name="uemail"
          placeholder="Enter Email"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 mb-1"
        />
        {errors.uemail && (
          <p className="text-red-500 text-sm mb-2">{errors.uemail}</p>
        )}

        {/* Password */}
        <input
          type="password"
          name="upass"
          placeholder="Enter Password"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 mb-1"
        />
        {errors.upass && (
          <p className="text-red-500 text-sm mb-2">{errors.upass}</p>
        )}

        {/* Confirm Password */}
        <input
          type="password"
          name="ucpass"
          placeholder="Confirm Password"
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 mb-1"
        />
        {errors.ucpass && (
          <p className="text-red-500 text-sm mb-2">{errors.ucpass}</p>
        )}

        {/* Role */}
        <label className="text-sm font-medium">Select Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 mt-1"
        >
          <option value="user">User</option>
          {!isAdminTaken && <option value="admin">Admin</option>}
        </select>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Register
          </button>

          <button
            type="reset"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
          <Link to="/">Cancel</Link>  
          </button>
        </div>

        <p className="text-center text-sm mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}