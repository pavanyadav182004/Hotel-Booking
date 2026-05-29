import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import assets from '../../assets/assets'
import { getUser, logout } from '../../auth'

const Navbar = () => {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300'>
      <Link to='/'>
        <img src={assets.pavan} alt='logo' className='h-12 w-29 invert opacity-80' />
      </Link>

      <div className='flex items-center gap-3'>
        <div className='text-right max-sm:hidden'>
          <p className='text-sm font-medium text-gray-800'>{user?.name || 'Admin'}</p>
          <p className='text-xs text-gray-500'>{user?.email || user?.uemail || 'admin'}</p>
        </div>
        <button onClick={handleLogout} className='bg-red-500 text-white px-4 py-2 rounded text-sm'>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
