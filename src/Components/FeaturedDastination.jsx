import React, { useEffect, useState } from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useNavigate } from 'react-router-dom'
import { apiRequest, toRoomCard } from '../api'

const FeaturedDastination = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const fetchDestinations = () => {
    setLoading(true)
    setMessage('')
    apiRequest('/hotels')
      .then((res) => {
        setRooms((res.data || []).map(toRoomCard).slice(0, 4))
        setLoading(false)
      })
      .catch((err) => {
        setMessage(err.message || 'Unable to load destinations')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDestinations()
  }, [])

  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>
      <Title title='Featured Destination'
       subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences'/>

      {loading ? (
        <div className='flex flex-col items-center justify-center my-16 gap-3'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
          <p className='text-gray-500 text-sm'>Loading destinations...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-10 md:mt-20 w-full">
            {rooms.map((room,index)=>(
                <HotelCard key={room._id} room={room} index={index}/>
            ))}
          </div>

          {message && (
            <div className='flex flex-col items-center gap-3 mt-8'>
              <p className='text-red-500 text-sm'>{message}</p>
              <button 
                onClick={fetchDestinations}
                className='px-4 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-all'>
                Retry Loading
              </button>
            </div>
          )}

          {!message && rooms.length === 0 && (
            <div className='flex flex-col items-center gap-3 mt-8'>
              <p className='text-gray-500'>No destinations found. Add rooms from admin dashboard.</p>
              <button 
                onClick={fetchDestinations}
                className='px-4 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all'>
                Refresh
              </button>
            </div>
          )}
        </>
      )}

      <button onClick={()=>{navigate ('/rooms'); scrollTo(0,0)}} 
      className='my-16 px-4 py-2 text-sm font-medium border border-gray-300 
      rounded bg-white hover:bg-gray-50 transition-all cursor-pointer'>
        View All Destinations
      </button>
    </div>
  )
}

export default FeaturedDastination;
