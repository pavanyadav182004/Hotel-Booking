import Navbar from './Components/Navbar'
import './App.css'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'

import Home from './Pages/Home'
import Footer from './Components/Footer'
import AllRooms from './Pages/AllRooms'
import RoomDatails from './Pages/RoomDatails'
import MyBooking from './Pages/MyBooking'
import HotelReg from './Components/HotelReg'

import Layout from './Pages/Hotel Owner/Layout'
import Dashboard from './Pages/Hotel Owner/Dashboard'
import Addroom from './Pages/Hotel Owner/Addroom'
import ListRoom from './Pages/Hotel Owner/ListRoom'
import Login from './Pages/Login'
import Register from './Pages/Register'

function App() {

  const location = useLocation()
  const isOwnerPath = location.pathname.includes("owner")

  const user = JSON.parse(localStorage.getItem("user"))
  const isAdmin = user?.role === "admin"

  return (
    <>
      {!isOwnerPath && <Navbar />}

      <div className="min-h-[70vh]">

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDatails />} />
          <Route path="/my-bookings" element={<MyBooking />} />

          {/* Owner Admin Routes */}
          <Route
            path="/owner"
            element={isAdmin ? <Layout /> : <Navigate to="/" />}
          >

            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<Addroom />} />
            <Route path="list-room" element={<ListRoom />} />

          </Route>

        </Routes>

      </div>

      {!isOwnerPath && <Footer />}
    </>
  )
}

export default App