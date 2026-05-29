import React, { useEffect, useState } from 'react'
import Title from '../../Components/Title'
import { apiRequest, toRoomCard } from '../../api'

const ListRoom = () => {
  const [rooms, setRooms] = useState([])
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')

  const loadRooms = async () => {
    try {
      const res = await apiRequest('/hotels')
      setRooms((res.data || []).map(toRoomCard))
    } catch (err) {
      setMessage(err.message || 'Unable to load rooms')
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  const updateAvailability = async (room) => {
    try {
      await apiRequest(`/hotels/${room.hotelId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: room.hotel.name,
          city: room.hotel.city,
          address: room.hotel.address,
          description: room.description,
          pricePerNight: room.pricePerNight,
          rating: room.rating,
          imageUrl: room.images[0],
          roomType: room.roomType,
          amenities: room.amenities,
          available: !room.isAvailable,
        })
      })
      loadRooms()
    } catch (err) {
      alert(err.message || 'Unable to update room')
    }
  }

  const deleteRoom = async (id) => {
    if (!confirm('Delete this room?')) return
    try {
      await apiRequest(`/hotels/${id}`, { method: 'DELETE' })
      loadRooms()
    } catch (err) {
      alert(err.message || 'Unable to delete room')
    }
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      await apiRequest(`/hotels/${editing.hotelId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editing.hotel.name,
          city: editing.hotel.city,
          address: editing.hotel.address,
          description: editing.description,
          pricePerNight: Number(editing.pricePerNight),
          rating: Number(editing.rating),
          imageUrl: editing.images[0],
          roomType: editing.roomType,
          amenities: editing.amenities,
          available: editing.isAvailable,
        })
      })
      setEditing(null)
      loadRooms()
    } catch (err) {
      alert(err.message || 'Unable to update room')
    }
  }

  return (
    <div>
      <Title align='left' font='outfit' title='Room Listing'
        subTitle='View, edit or manage all listed rooms. Keep the information up-to-date to provide the best experience for users.' />
      {message && <p className='text-red-500 mt-4'>{message}</p>}

      {editing && (
        <form onSubmit={saveEdit} className='grid sm:grid-cols-2 gap-3 mt-8 max-w-3xl border border-gray-300 rounded-lg p-4'>
          <input className='border border-gray-300 rounded p-2' value={editing.hotel.name}
            onChange={e => setEditing({ ...editing, hotel: { ...editing.hotel, name: e.target.value } })} />
          <input className='border border-gray-300 rounded p-2' value={editing.hotel.city}
            onChange={e => setEditing({ ...editing, hotel: { ...editing.hotel, city: e.target.value } })} />
          <input className='border border-gray-300 rounded p-2 sm:col-span-2' value={editing.hotel.address}
            onChange={e => setEditing({ ...editing, hotel: { ...editing.hotel, address: e.target.value } })} />
          <input className='border border-gray-300 rounded p-2' value={editing.roomType}
            onChange={e => setEditing({ ...editing, roomType: e.target.value })} />
          <input className='border border-gray-300 rounded p-2' type='number' value={editing.pricePerNight}
            onChange={e => setEditing({ ...editing, pricePerNight: e.target.value })} />
          <input className='border border-gray-300 rounded p-2 sm:col-span-2' value={editing.images[0]}
            onChange={e => setEditing({ ...editing, images: [e.target.value] })} />
          <div className='sm:col-span-2 flex gap-3'>
            <button className='bg-primary text-white px-5 py-2 rounded'>Update</button>
            <button type='button' onClick={() => setEditing(null)} className='bg-gray-500 text-white px-5 py-2 rounded'>Cancel</button>
          </div>
        </form>
      )}

      <p className='text-gray-500 mt-8'>All Rooms</p>
      <div className='w-full max-w-4xl text-left border border-gray-300 rounded-lg max-h-96 overflow-y-scroll mt-8'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='py-3 px-4 text-gray-800 font-medium'>Name</th>
              <th className='py-3 px-4 text-gray-800 font-medium max:sm-hidden '>Facility</th>
              <th className='py-3 px-4 text-gray-800 font-medium text-center'>Price/night</th>
              <th className='py-3 px-4 text-gray-800 font-medium text-center'>Actions</th>
            </tr>
          </thead>

          <tbody className='text-sm'>
            {rooms.map((item) => (
              <tr key={item._id}>
                <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{item.roomType}</td>
                <td className='py-3 px-4 text-gray-700 border-t border-gray-300 max-sm-hidden'>{item.amenities.join(', ')}</td>
                <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>{item.pricePerNight}</td>
                <td className='py-3 px-4 border-t border-gray-300 text-sm'>
                  <div className='flex items-center justify-center gap-3'>
                    <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                      <input type="checkbox" className='sr-only peer' checked={item.isAvailable} onChange={() => updateAvailability(item)} />
                      <div className='w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200'> </div>
                      <span className='dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5'></span>
                    </label>
                    <button onClick={() => setEditing(item)} className='text-blue-600'>Edit</button>
                    <button onClick={() => deleteRoom(item.hotelId)} className='text-red-500'>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListRoom
