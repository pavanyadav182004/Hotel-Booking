import React, { useEffect, useState } from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useNavigate } from 'react-router-dom'
import { apiRequest, toRoomCard } from '../api'

const FeaturedDastination = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([])
  const [message, setMessage] = useState('Loading destinations...')

  useEffect(() => {
    apiRequest('/hotels')
      .then((res) => {
        setRooms((res.data || []).map(toRoomCard).slice(0, 4))
        setMessage('')
      })
      .catch((err) => setMessage(err.message || 'Unable to load destinations'))
  }, [])

  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>
      <Title title='Featured Destination'
       subTitle='Discover our handpiced selection of exceptional properties around rhe world, offering unparalleled luxury and unforgettable experiences'/>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-10 md:mt-20 w-full">
        {rooms.map((room,index)=>(
            <HotelCard key={room._id} room={room} index={index}/>
        ))}
      </div>

      {message && <p className='text-gray-500 mt-8'>{message}</p>}
      {!message && rooms.length === 0 && <p className='text-gray-500 mt-8'>No destinations found. Add rooms from admin dashboard.</p>}

      <button onClick={()=>{navigate ('/rooms'); scrollTo(0,0)}} 
      className='my-16 px-4 py-2 test-sm font-medium border border-gray-300 
      rounded bg-white hover:bg-gray-50 transition-all cursor-pointer'>
        View All Distinations
      </button>
    </div>
  )
}

export default FeaturedDastination;
