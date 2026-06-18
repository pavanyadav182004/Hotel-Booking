import React from 'react'
import Navbar from '../../Components/Hotel Owner/Navbar'
import Sidebar from '../../Components/Hotel Owner/Sidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className='flex flex-col h-screen overflow-hidden bg-gray-50'>
      <Navbar/>
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar/>

        <div className='flex-1 p-4 pt-6 md:p-8 md:pt-10 overflow-y-auto'>
           <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default Layout
