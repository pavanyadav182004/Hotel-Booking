
import Navbar from './Components/Navbar'
import './App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
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

function App() {
  const isOwnerPath = useLocation().pathname.includes("owner")
  


  return (
    <>
      {!isOwnerPath && <Navbar />}
      {true && <HotelReg />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDatails />} />
          <Route path="/my-bookings" element={<MyBooking />} />
          <Route path='/owner' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='add-room' element={<Addroom />} />
            <Route path='list-room' element={<ListRoom />} />
          </Route>
        </Routes>

      </div>
      <Footer />
    </>
  )
}

export default App
