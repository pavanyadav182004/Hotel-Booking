import React, { useState, useEffect } from 'react';
import { getUser, updateUserImage } from '../auth';
import { apiRequest } from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNo: '',
        address: '',
        gender: ''
    });

    useEffect(() => {
        const u = getUser();
        if (!u) {
            navigate('/login');
            return;
        }
        setUser(u);
        setFormData({
            name: u.name || '',
            email: u.email || '',
            mobileNo: u.mobileNo || '',
            address: u.address || '',
            gender: u.gender || ''
        });
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        try {
            const res = await apiRequest('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            if (res.success) {
                toast.success('Successful');
                setSuccessMessage('Save Successful!');
                const updatedUser = { ...user, ...res.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('auth-changed'));
                setUser(updatedUser);
                
                // Redirect after showing the message
                setTimeout(() => {
                    navigate('/'); // Navigate to home or dashboard
                }, 1500);
            } else {
                toast.error(res.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onload = () => {
            const image = new Image();
            image.onload = async () => {
                const canvas = document.createElement("canvas");
                const size = 400; 
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext("2d");
                const minSide = Math.min(image.width, image.height);
                const sx = (image.width - minSide) / 2;
                const sy = (image.height - minSide) / 2;

                ctx.drawImage(image, sx, sy, minSide, minSide, 0, 0, size, size);
                const compressedImage = canvas.toDataURL("image/jpeg", 0.9);

                try {
                    await apiRequest("/users/profile-image", {
                        method: "PUT",
                        body: JSON.stringify({ imageUrl: compressedImage }),
                    });
                    updateUserImage(compressedImage);
                    setUser((prev) => ({ ...prev, imageUrl: compressedImage }));
                    toast.success("Profile photo updated! ✨");
                } catch (err) {
                    toast.error(err.message || "Failed to update profile photo");
                } finally {
                    setUploading(false);
                }
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    if (!user) return null;

    return (
        <div className="pt-28 pb-16 px-4 max-w-3xl mx-auto min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Profile</h1>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div 
                        className="relative group cursor-pointer mb-4"
                        onClick={handleProfileClick}
                        title="Click to change profile photo"
                    >
                        <img
                            src={user.imageUrl || "https://i.pravatar.cc/150"}
                            onError={(e) => {
                                e.currentTarget.src = "https://i.pravatar.cc/150";
                            }}
                            alt="profile"
                            className={`w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-blue-100 transition-all duration-300 group-hover:brightness-75
                            ${uploading ? "animate-pulse opacity-50" : ""}`}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span className="text-white text-xs font-semibold drop-shadow-md">Change</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
                            <input 
                                type="text" 
                                name="mobileNo" 
                                value={formData.mobileNo} 
                                onChange={handleChange}
                                placeholder="Enter mobile number"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Gender</label>
                            <select 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Address</label>
                        <textarea 
                            name="address" 
                            value={formData.address} 
                            onChange={handleChange}
                            placeholder="Enter full address"
                            rows="3"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4">
                        {successMessage && (
                            <span className="text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                {successMessage}
                            </span>
                        )}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all
                            ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
