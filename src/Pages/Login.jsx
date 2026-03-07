import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uemail: "",
    upass: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) =>
        u.uemail === formData.uemail &&
        u.upass === formData.upass
    );

    if (!user) {
      setError("Invalid Email or Password");
      return;
    }

    // login success
    localStorage.setItem("user", JSON.stringify(user));

    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-[380px]"
      >

        <h2 className="text-center text-2xl font-semibold mb-6">
          Login
        </h2>

        <input
          type="email"
          placeholder="Enter Email"
          name="uemail"
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Enter Password"
          name="upass"
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded mb-3"
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Login
        </button>

        <p className="text-center mt-4 text-sm">
          Don't have account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>

      </form>

    </div>
  );
}