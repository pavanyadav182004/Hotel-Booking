import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { saveLogin } from "../auth";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uemail: "",
    upass: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.uemail,
          password: formData.upass
        })
      });

      saveLogin(res.data);
      
      const role = String(res.data.user?.role || "USER").toUpperCase();
      if (role === "ADMIN") {
        navigate("/owner");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-[380px]">
        <h2 className="text-center text-2xl font-semibold mb-6">Login</h2>

        <input type="email" placeholder="Enter Email" name="uemail" onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded mb-3" required />

        <input type="password" placeholder="Enter Password" name="upass" onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded mb-3" required />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-60">
          {loading ? "Login..." : "Login"}
        </button>

        <p className="text-center mt-4 text-sm">
          Don't have account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
        <p className="text-center mt-2 text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
        </p>
      </form>
    </div>
  );
}
