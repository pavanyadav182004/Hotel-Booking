import React from 'react'
import Navbar from '../../Components/Hotel Owner/Navbar'
import Sidebar from '../../Components/Hotel Owner/Sidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className='flex flex-col h-screen'>
      <Navbar/>
      <div className='flex h-full'>
        <Sidebar/>

        <div className='flex-1 p-4 pt-10 md:px-10 h-full'>
           <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default Layout
