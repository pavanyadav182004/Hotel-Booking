
import Navbar from './Components/Navbar'
import './App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home'
import Footer from './Components/Footer'
import AllRooms from './Pages/AllRooms'
import RoomDatails from './Pages/RoomDatails'
import MyBooking from './Pages/MyBooking'
import HotelReg from './Components/HotelReg'

function App() {
  const isOwnerPath=useLocation().pathname.includes("owner")


  return (
    <>
    {!isOwnerPath && <Navbar />}
    {false && <HotelReg/>}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
           <Route path="/rooms" element={<AllRooms />} />
            <Route path="/rooms/:id" element={<RoomDatails />} />
            <Route path="/my-bookings" element={<MyBooking />} />
        </Routes>

      </div>
      <Footer/>
    </>
  )
}

export default App
