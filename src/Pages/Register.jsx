import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [adminExists, setAdminExists] = useState(false);
  const [step, setStep] = useState("email");
  const [verificationToken, setVerificationToken] = useState("");
  const [formData, setFormData] = useState({
    uname: "",
    uemail: "",
    otp: "",
    upass: "",
    ucpass: "",
    role: "user",
    imageUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await apiRequest("/auth/admin-exists");
        setAdminExists(res);
      } catch (err) {
        console.error(err);
      }
    };
    checkAdmin();
  }, []);

  const validateEmailStep = () => {
    const newErrors = {};
    if (!formData.uname.trim()) newErrors.uname = "Name is required";
    if (!formData.uemail.trim()) newErrors.uemail = "Email is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordStep = () => {
    const newErrors = {};
    const pass = formData.upass;
    
    if (!pass) {
      newErrors.upass = "Password is required";
    } else {
      if (pass.length < 6) {
        newErrors.upass = "Minimum 6 characters required";
      } else if (!/[a-zA-Z]/.test(pass)) {
        newErrors.upass = "At least 1 letter required";
      } else if (!/[0-9]/.test(pass)) {
        newErrors.upass = "At least 1 number required";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
        newErrors.upass = "At least 1 special character required";
      } else if (/^(123456|654321|password|admin123)$/i.test(pass)) {
        newErrors.upass = "Too simple password, please choose a stronger one";
      }
    }

    if (!formData.ucpass) {
      newErrors.ucpass = "Confirm password is required";
    } else if (pass !== formData.ucpass) {
      newErrors.ucpass = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "uemail" || name === "role") {
      setStep("email");
      setVerificationToken("");
      setFormData((prev) => ({ ...prev, [name]: value, otp: "", upass: "", ucpass: "" }));
      setMessage("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setServerError("Please select a valid image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setServerError("Image size should be under 3MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 220;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        const minSide = Math.min(image.width, image.height);
        const sx = (image.width - minSide) / 2;
        const sy = (image.height - minSide) / 2;

        ctx.drawImage(image, sx, sy, minSide, minSide, 0, 0, size, size);
        const compressedImage = canvas.toDataURL("image/jpeg", 0.78);

        setFormData((prev) => ({ ...prev, imageUrl: compressedImage }));
        setServerError("");
      };
      image.onerror = () => setServerError("Could not read this image");
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmailStep()) return;

    setServerError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await apiRequest("/auth/register/send-otp", {
        method: "POST",
        body: JSON.stringify({
          email: formData.uemail,
          role: formData.role,
        }),
      });
      setStep("otp");
      setMessage(res.message || "OTP sent to your email");
    } catch (err) {
      setServerError(err.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setServerError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await apiRequest("/auth/register/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: formData.uemail,
          otp: formData.otp,
          role: formData.role,
        }),
      });
      setVerificationToken(res.data?.verificationToken || "");
      setStep("password");
      setMessage(res.message || "Email verified. Create your password.");
      setErrors({});
    } catch (err) {
      setServerError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    if (!validatePasswordStep()) return;

    setServerError("");
    setLoading(true);

    try {
      const endpoint = formData.role === "admin" ? "/auth/admin/register" : "/auth/register";
      await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({
          name: formData.uname,
          email: formData.uemail,
          password: formData.upass,
          imageUrl: formData.imageUrl,
          verificationToken,
        }),
      });

      navigate("/login");
    } catch (err) {
      setServerError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = step === "email" ? sendOtp : step === "otp" ? verifyOtp : register;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={submitHandler} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-2">Register</h2>
        <p className="text-center text-sm text-gray-500 mb-5">
          {step === "email" && "Verify your email first"}
          {step === "otp" && "Enter the OTP sent to your email"}
          {step === "password" && "Create your password"}
        </p>

        {serverError && <p className="text-red-500 text-sm mb-2">{serverError}</p>}
        {message && <p className="text-blue-600 text-sm mb-2">{message}</p>}

        <input
          type="text"
          name="uname"
          value={formData.uname}
          placeholder="Enter Name"
          onChange={handleChange}
          disabled={step !== "email"}
          className="w-full border border-gray-300 rounded p-2 mb-1 disabled:bg-gray-100"
        />
        {errors.uname && <p className="text-red-500 text-sm mb-2">{errors.uname}</p>}

        <input
          type="email"
          name="uemail"
          value={formData.uemail}
          placeholder="Enter Email"
          onChange={handleChange}
          disabled={step !== "email"}
          className="w-full border border-gray-300 rounded p-2 mb-1 disabled:bg-gray-100"
        />
        {errors.uemail && <p className="text-red-500 text-sm mb-2">{errors.uemail}</p>}

        {step === "email" && (
          <>
            <label className="text-sm font-medium">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 mt-1 mb-4"
            >
              <option value="user">User</option>
              {!adminExists && <option value="admin">Admin</option>}
            </select>

            <label className="text-sm font-medium text-gray-700">Profile Photo</label>
            {formData.imageUrl && (
              <div className="flex justify-center my-3">
                <img src={formData.imageUrl} alt="Profile preview" className="w-20 h-20 rounded-full object-cover border" />
              </div>
            )}
            <input
              type="file"
              name="imageUrl"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded p-2 mb-3"
            />
          </>
        )}

        {step === "otp" && (
          <>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              placeholder="Enter OTP"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 mb-1"
            />
            {errors.otp && <p className="text-red-500 text-sm mb-2">{errors.otp}</p>}
          </>
        )}

        {step === "password" && (
          <>
            <input
              type="password"
              name="upass"
              value={formData.upass}
              placeholder="Enter Password"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 mb-1"
            />
            {errors.upass && <p className="text-red-500 text-sm mb-2">{errors.upass}</p>}

            <input
              type="password"
              name="ucpass"
              value={formData.ucpass}
              placeholder="Confirm Password"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 mb-1"
            />
            {errors.ucpass && <p className="text-red-500 text-sm mb-2">{errors.ucpass}</p>}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-60 mt-2"
        >
          {loading && "Please wait..."}
          {!loading && step === "email" && "Send OTP"}
          {!loading && step === "otp" && "Verify OTP"}
          {!loading && step === "password" && "Register"}
        </button>

        {step === "otp" && (
          <button
            type="button"
            disabled={loading}
            onClick={sendOtp}
            className="w-full text-blue-600 text-sm mt-3 hover:underline disabled:opacity-60"
          >
            Resend OTP
          </button>
        )}

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
