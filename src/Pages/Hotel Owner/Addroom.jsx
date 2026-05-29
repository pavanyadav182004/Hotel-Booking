import React, { useState, useEffect } from 'react'
import Title from '../../Components/Title'
import assets from '../../assets/assets'
import { apiRequest } from '../../api'
import { toast } from 'react-toastify'

const Addroom = () => {
  const [hotels, setHotels] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [input, setInput] = useState({
    hotelId: '',
    roomType: 'DELUXE',
    price: 0,
    totalRooms: 1,
    personCount: 2,
    available: true
  })

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await apiRequest('/hotels')
        setHotels(res.data || [])
        if (res.data?.length > 0) {
          setInput(prev => ({ ...prev, hotelId: res.data[0].id }))
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load hotels")
      }
    }
    fetchHotels()
  }, [])

  const submitRoom = async (e) => {
    e.preventDefault()
    setMessage('')
    if (!input.hotelId) {
      toast.error('Please select a hotel')
      return
    }
    
    setLoading(true)
    try {
      await apiRequest(`/rooms/${input.hotelId}`, {
        method: 'POST',
        body: JSON.stringify({
          price: Number(input.price),
          type: input.roomType,
          totalRooms: Number(input.totalRooms),
          personCount: Number(input.personCount),
          available: input.available,
          bookedRooms: 0
        })
      })
      toast.success('Room added successfully to hotel!')
      setInput(prev => ({
        ...prev,
        price: 0,
        totalRooms: 1,
        personCount: prev.roomType === 'SINGLE' ? 1 : prev.roomType === 'DOUBLE' ? 2 : prev.roomType === 'FAMILY' ? 6 : 4
      }))
    } catch (err) {
      toast.error(err.message || 'Unable to add room')
    } finally {
      setLoading(false)
    }
  }

  const handleRoomTypeChange = (type) => {
    let max = 2
    if (type === 'SINGLE') max = 1
    if (type === 'DELUXE') max = 4
    if (type === 'FAMILY') max = 6
    
    setInput({ ...input, roomType: type, personCount: max })
  }

  return (
    <div className='max-w-4xl'>
      <Title align='left' font='outfit' title='Add Room to Hotel' subTitle='Select a hotel and define the room type, pricing, and capacity.' />

      <form onSubmit={submitRoom} className='mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
        <div className='grid sm:grid-cols-2 gap-6'>
          
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-gray-700'>Select Hotel</label>
            <select 
              value={input.hotelId} 
              onChange={e => setInput({ ...input, hotelId: e.target.value })}
              className='border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all' 
              required
            >
              <option value="">-- Select Hotel --</option>
              {hotels.map(hotel => (
                <option key={hotel.id} value={hotel.id}>{hotel.name} ({hotel.city})</option>
              ))}
            </select>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-gray-700'>Room Type</label>
            <select 
              value={input.roomType} 
              onChange={e => handleRoomTypeChange(e.target.value)}
              className='border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all' 
              required
            >
              <option value="SINGLE">Single Room</option>
              <option value="DOUBLE">Double Room</option>
              <option value="DELUXE">Deluxe Room</option>
              <option value="FAMILY">Family Room</option>
            </select>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-gray-700'>Price per Night (Rs.)</label>
            <input 
              type="number" 
              placeholder='Enter price' 
              className='border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all' 
              value={input.price}
              onChange={e => setInput({ ...input, price: e.target.value })} 
              required 
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-gray-700'>Total Number of Rooms</label>
            <input 
              type="number" 
              placeholder='How many rooms available?' 
              className='border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all' 
              value={input.totalRooms}
              onChange={e => setInput({ ...input, totalRooms: e.target.value })} 
              required 
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium text-gray-700'>Max Persons</label>
            <input 
              type="number" 
              className='border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all' 
              value={input.personCount}
              onChange={e => setInput({ ...input, personCount: e.target.value })} 
              required 
            />
          </div>

          <div className='flex items-center gap-3 mt-6'>
            <input 
              type="checkbox" 
              id="available"
              className='w-5 h-5 text-blue-600 rounded focus:ring-blue-500'
              checked={input.available}
              onChange={e => setInput({ ...input, available: e.target.checked })} 
            />
            <label htmlFor="available" className='text-sm font-medium text-gray-700'>Available for Booking</label>
          </div>
        </div>

        <div className='mt-10 flex gap-4'>
          <button 
            type="submit" 
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-medium transition-all shadow-md active:scale-95 disabled:opacity-50'
          >
            {loading ? 'Adding...' : 'Add Room'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Addroom
