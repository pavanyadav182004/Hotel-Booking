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
    <div className='flex items-center justify-between px-3 sm:px-6 md:px-8 border-b border-gray-300 py-3 bg-white w-full'>
      <Link to='/'>
        <img src={assets.pavan} alt='logo' className='h-8 sm:h-10 md:h-12 w-auto invert opacity-80' />
      </Link>

      <div className='flex items-center gap-2 sm:gap-4'>
        <div className='text-right hidden sm:block'>
          <p className='text-sm font-medium text-gray-800'>{user?.name || 'Admin'}</p>
          <p className='text-xs text-gray-500 truncate max-w-[120px] md:max-w-[200px]'>{user?.email || user?.uemail || 'admin'}</p>
        </div>
        <button onClick={handleLogout} className='bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors'>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
