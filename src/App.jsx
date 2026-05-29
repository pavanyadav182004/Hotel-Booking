import Navbar from './Components/Navbar'
import './App.css'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Home from './Pages/Home'
import Footer from './Components/Footer'
import AllRooms from './Pages/AllRooms'
import RoomDatails from './Pages/RoomDatails'
import MyBooking from './Pages/MyBooking'
import About from './Pages/About'
import Contact from './Pages/Contact'

import Layout from './Pages/Hotel Owner/Layout'
import Dashboard from './Pages/Hotel Owner/Dashboard'
import Addroom from './Pages/Hotel Owner/Addroom'
import ListRoom from './Pages/Hotel Owner/ListRoom'

import Login from './Pages/Login'
import Register from './Pages/Register'
import ForgotPassword from './Pages/ForgotPassword'
import Profile from './Pages/Profile'
import { getUser } from './auth'

function App() {

  const location = useLocation()
  const isOwnerPath = location.pathname.includes("owner")

  const [user, setUser] = useState(getUser())

  // 🔥 FIX: case-safe admin check
  const isAdmin = user?.role?.toUpperCase() === "ADMIN"

  // Sync user (login/logout)
  useEffect(() => {
    const syncUser = () => setUser(getUser())

    window.addEventListener('auth-changed', syncUser)
    window.addEventListener('storage', syncUser)

    return () => {
      window.removeEventListener('auth-changed', syncUser)
      window.removeEventListener('storage', syncUser)
    }
  }, [])

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />

      {!isOwnerPath && <Navbar />}

      <div className="min-h-[70vh]">

        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={isAdmin ? <Navigate to="/owner" /> : <Home />} />
          <Route path="/rooms" element={isAdmin ? <Navigate to="/owner" /> : <AllRooms />} />
          <Route path="/rooms/:id" element={isAdmin ? <Navigate to="/owner" /> : <RoomDatails />} />
          <Route path="/my-bookings" element={isAdmin ? <Navigate to="/owner" /> : <MyBooking />} />
          <Route path="/about" element={isAdmin ? <Navigate to="/owner" /> : <About />} />
          <Route path="/contact" element={isAdmin ? <Navigate to="/owner" /> : <Contact />} />
          <Route path="/profile" element={<Profile />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ADMIN / OWNER ROUTES */}
          <Route
            path="/owner"
            element={
              isAdmin ? <Layout /> : <Navigate to="/login" />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<Addroom />} />
            <Route path="list-room" element={<ListRoom />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>

      </div>

      {!isOwnerPath && <Footer />}
    </>
  )
}

export default App
