import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Title from '../../Components/Title'
import { apiRequest, toRoomCard } from '../../api'

const emptyEdit = {
  hotelId: '',
  hotel: { name: '', city: '', address: '' },
  heading: '',
  description: '',
  roomType: '',
  pricePerNight: 0,
  rating: 4.5,
  images: ['', '', '', '', ''],
  amenities: [],
  isAvailable: true,
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [hotels, setHotels] = useState([])
  const [messages, setMessages] = useState([])
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newHotel, setNewHotel] = useState({
    name: '',
    city: '',
    address: '',
    heading: '',
    description: '',
    pricePerNight: 0,
    rating: 4.5,
    images: ['', '', '', '', ''],
    roomType: 'DELUXE',
    available: true,
    amenities: ['Free Wi-Fi', 'Room Service', 'Free Breakfast'],
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)

  const handleImageUpload = (e, index, isEditing) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / image.width);
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressedImage = canvas.toDataURL("image/jpeg", 0.8);

        if (isEditing) {
          const newImgs = [...editing.images];
          newImgs[index] = compressedImage;
          setEditing({ ...editing, images: newImgs });
        } else {
          const newImgs = [...newHotel.images];
          newImgs[index] = compressedImage;
          setNewHotel({ ...newHotel, images: newImgs });
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const loadDashboard = async () => {
    setLoading(true)
    setMessage('')
    await Promise.all([
      apiRequest('/bookings/admin')
        .then((bookingRes) => {
      setBookings(Array.isArray(bookingRes?.data) ? bookingRes.data : [])
        })
        .catch((err) => {
          setBookings([])
          setMessage(err.message || 'Unable to load admin bookings. Please login again as admin.')
        }),
      apiRequest('/hotels')
        .then((hotelRes) => setHotels((hotelRes?.data || []).map(toRoomCard)))
        .catch((err) => setMessage(err.message || 'Unable to load hotels')),
      apiRequest('/contact')
        .then((contactRes) => setMessages(Array.isArray(contactRes?.data) ? contactRes.data : []))
        .catch(() => setMessages([])),
    ])
    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const stats = useMemo(() => {
    const confirmed = bookings.filter((item) => item.status === 'CONFIRMED')
    return {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((item) => item.status === 'PENDING').length,
      totalRevenue: confirmed.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0),
      totalHotels: hotels.length,
    }
  }, [bookings, hotels])

  const startEdit = (hotel) => {
    setEditing({ ...emptyEdit, ...hotel, images: hotel.images?.length ? hotel.images : [''] })
  }

  const createHotel = async (e) => {
    e.preventDefault()
    try {
      await apiRequest('/hotels', {
        method: 'POST',
        body: JSON.stringify({
          ...newHotel,
          pricePerNight: Number(newHotel.pricePerNight),
          rating: Number(newHotel.rating),
          images: newHotel.images.filter(img => img.trim() !== ''),
        }),
      })
      setAdding(false)
      setNewHotel({
        name: '',
        city: '',
        address: '',
        heading: '',
        description: '',
        pricePerNight: 0,
        rating: 4.5,
        images: ['', '', '', '', ''],
        roomType: 'DELUXE',
        available: true,
        amenities: ['Free Wi-Fi', 'Room Service', 'Free Breakfast'],
      })
      loadDashboard()
    } catch (err) {
      alert(err.message || 'Unable to add hotel')
    }
  }

  const saveHotel = async (e) => {
    e.preventDefault()
    if (!editing) return
    try {
      await apiRequest(`/hotels/${editing.hotelId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editing.hotel.name,
          city: editing.hotel.city,
          address: editing.hotel.address,
          heading: editing.heading,
          description: editing.description,
          pricePerNight: Number(editing.pricePerNight),
          rating: Number(editing.rating),
          images: editing.images.filter(img => img.trim() !== ''),
          roomType: editing.roomType,
          amenities: editing.amenities,
          available: editing.isAvailable,
        }),
      })
      setEditing(null)
      loadDashboard()
    } catch (err) {
      alert(err.message || 'Unable to update hotel')
    }
  }

  const deleteHotel = async (id) => {
    if (!confirm('Delete this hotel? Existing bookings may prevent deletion.')) return
    try {
      await apiRequest(`/hotels/${id}`, { method: 'DELETE' })
      loadDashboard()
    } catch (err) {
      alert(err.message || 'Unable to delete hotel')
    }
  }

  const toggleAvailability = async (hotel) => {
    try {
      await apiRequest(`/hotels/${hotel.hotelId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: hotel.hotel.name,
          city: hotel.hotel.city,
          address: hotel.hotel.address,
          heading: hotel.heading,
          description: hotel.description,
          pricePerNight: hotel.pricePerNight,
          rating: hotel.rating,
          images: hotel.images,
          roomType: hotel.roomType,
          amenities: hotel.amenities,
          available: !hotel.isAvailable,
        }),
      })
      loadDashboard()
    } catch (err) {
      alert(err.message || 'Unable to update availability')
    }
  }

  const saveRoom = async (e) => {
    e.preventDefault()
    if (!editingRoom) return
    try {
      await apiRequest(`/rooms/${editingRoom.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          price: Number(editingRoom.price),
          type: editingRoom.type,
          totalRooms: Number(editingRoom.totalRooms),
          personCount: Number(editingRoom.personCount),
          available: editingRoom.available,
        }),
      })
      setEditingRoom(null)
      loadDashboard()
    } catch (err) {
      alert(err.message || 'Unable to update room')
    }
  }

  const deleteRoom = async (id) => {
    if (!confirm('Delete this room type?')) return
    try {
      await apiRequest(`/rooms/${id}`, { method: 'DELETE' })
      loadDashboard()
    } catch (err) {
      alert(err.message || 'Unable to delete room')
    }
  }

  return (
    <div>
      <Title align='left' font='outfit' title='Admin Dashboard'
        subTitle='Manage hotels, rooms, availability, bookings and revenue from one place.' />

      {message && <p className='text-red-500 mt-4'>{message}</p>}
      {loading && <p className='text-gray-500 mt-4'>Loading dashboard...</p>}

      <div className='grid sm:grid-cols-2 xl:grid-cols-4 gap-4 my-8'>
        <Stat title='Total Hotels' value={stats.totalHotels} />
        <Stat title='Total Bookings' value={stats.totalBookings} />
        <Stat title='Pending Bookings' value={stats.pendingBookings} />
        <Stat title='Confirmed Revenue' value={`Rs.${stats.totalRevenue}`} />
      </div>

      <div className='flex items-center justify-between gap-3 mb-4'>
        <h2 className='text-xl text-blue-950/80 font-medium'>Hotel Management</h2>
        <button onClick={() => navigate('/owner/add-hotel')} className='bg-primary text-white px-4 py-2 rounded'>
          Add Hotel
        </button>
      </div>

      {adding && (
        <form onSubmit={createHotel} className='grid sm:grid-cols-2 gap-3 mb-8 max-w-4xl border border-gray-300 rounded-lg p-4 bg-white'>
          <input className='border border-gray-300 rounded p-2' value={newHotel.name}
            onChange={e => setNewHotel({ ...newHotel, name: e.target.value })} placeholder='Hotel name' required />
          <input className='border border-gray-300 rounded p-2' value={newHotel.city}
            onChange={e => setNewHotel({ ...newHotel, city: e.target.value })} placeholder='City' required />
          <input className='border border-gray-300 rounded p-2 sm:col-span-2' value={newHotel.address}
            onChange={e => setNewHotel({ ...newHotel, address: e.target.value })} placeholder='Address' required />
          <input className='border border-gray-300 rounded p-2 sm:col-span-2' value={newHotel.heading}
            onChange={e => setNewHotel({ ...newHotel, heading: e.target.value })} placeholder='Heading (e.g. Experience Luxury Like Never Before)' />
          <textarea className='border border-gray-300 rounded p-2 sm:col-span-2' value={newHotel.description}
            onChange={e => setNewHotel({ ...newHotel, description: e.target.value })} placeholder='Description' />
          <select className='border border-gray-300 rounded p-2' value={newHotel.roomType}
            onChange={e => setNewHotel({ ...newHotel, roomType: e.target.value })}>
            <option value="SINGLE">Single Room</option>
            <option value="DOUBLE">Double Room</option>
            <option value="DELUXE">Deluxe Room</option>
            <option value="FAMILY">Family Room</option>
          </select>
          <input className='border border-gray-300 rounded p-2' type='number' min='1' value={newHotel.pricePerNight}
            onChange={e => setNewHotel({ ...newHotel, pricePerNight: e.target.value })} placeholder='Price per night' required />
          <input className='border border-gray-300 rounded p-2' type='number' step='0.1' min='0' max='5' value={newHotel.rating}
            onChange={e => setNewHotel({ ...newHotel, rating: e.target.value })} placeholder='Rating' />
          
          <div className='sm:col-span-2 border-t pt-4 mt-2'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Hotel Images (Main + 4 Room Photos)</p>
            <div className='grid sm:grid-cols-2 gap-4'>
              {newHotel.images.map((img, idx) => (
                <div key={idx} className="flex flex-col gap-1 border border-gray-200 p-2 rounded bg-gray-50">
                  <span className="text-xs font-semibold text-gray-500">{idx === 0 ? 'Main Image' : `Room Photo ${idx}`}</span>
                  <input 
                    className='border border-gray-300 rounded p-1.5 text-xs w-full' 
                    value={img.startsWith('data:image') ? 'Uploaded File' : img}
                    onChange={e => {
                      const newImgs = [...newHotel.images];
                      newImgs[idx] = e.target.value;
                      setNewHotel({ ...newHotel, images: newImgs });
                    }} 
                    placeholder='Enter Image URL' 
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">OR</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="text-xs w-full text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => handleImageUpload(e, idx, false)}
                    />
                  </div>
                  {img && <img src={img} alt="preview" className="h-12 w-full object-cover mt-2 rounded" />}
                </div>
              ))}
            </div>
          </div>

          <div className='sm:col-span-2 border-t pt-4 mt-2'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Amenities</p>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              {['Free Wi-Fi', 'Room Service', 'Free Breakfast', 'Swimming Pool', 'Gym', 'Parking', 'Air Conditioning'].map((amenity) => (
                <label key={amenity} className='flex items-center gap-1.5 text-sm text-gray-600'>
                  <input 
                    type='checkbox' 
                    className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                    checked={newHotel.amenities.includes(amenity)}
                    onChange={e => {
                      if (e.target.checked) {
                        setNewHotel({ ...newHotel, amenities: [...newHotel.amenities, amenity] });
                      } else {
                        setNewHotel({ ...newHotel, amenities: newHotel.amenities.filter(a => a !== amenity) });
                      }
                    }} 
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={newHotel.available}
              onChange={e => setNewHotel({ ...newHotel, available: e.target.checked })} />
            Available for booking
          </label>
          <div className='sm:col-span-2 flex gap-3'>
            <button className='bg-primary text-white px-5 py-2 rounded'>Save Hotel</button>
            <button type='button' onClick={() => setAdding(false)} className='bg-gray-500 text-white px-5 py-2 rounded'>Cancel</button>
          </div>
        </form>
      )}


      {editing && (
        <form onSubmit={saveHotel} className='grid sm:grid-cols-2 gap-3 mb-8 max-w-4xl border border-gray-300 rounded-lg p-4'>
          <input className='border border-gray-300 rounded p-2' value={editing.hotel.name}
            onChange={e => setEditing({ ...editing, hotel: { ...editing.hotel, name: e.target.value } })} placeholder='Hotel name' required />
          <input className='border border-gray-300 rounded p-2' value={editing.hotel.city}
            onChange={e => setEditing({ ...editing, hotel: { ...editing.hotel, city: e.target.value } })} placeholder='City' required />
          <input className='border border-gray-300 rounded p-2 sm:col-span-2' value={editing.hotel.address}
            onChange={e => setEditing({ ...editing, hotel: { ...editing.hotel, address: e.target.value } })} placeholder='Address' required />
          <input className='border border-gray-300 rounded p-2 sm:col-span-2' value={editing.heading || ''}
            onChange={e => setEditing({ ...editing, heading: e.target.value })} placeholder='Heading (e.g. Experience Luxury Like Never Before)' />
          <textarea className='border border-gray-300 rounded p-2 sm:col-span-2' value={editing.description || ''}
            onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder='Description' />
          <input className='border border-gray-300 rounded p-2' value={editing.roomType}
            onChange={e => setEditing({ ...editing, roomType: e.target.value })} placeholder='Room type' />
          <input className='border border-gray-300 rounded p-2' type='number' value={editing.pricePerNight}
            onChange={e => setEditing({ ...editing, pricePerNight: e.target.value })} placeholder='Price' />
          
          <div className='sm:col-span-2 border-t pt-4 mt-2'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Edit Hotel Images</p>
            <div className='grid sm:grid-cols-2 gap-4'>
              {[0, 1, 2, 3, 4].map((idx) => {
                const img = editing.images[idx] || '';
                return (
                  <div key={idx} className="flex flex-col gap-1 border border-gray-200 p-2 rounded bg-gray-50">
                    <span className="text-xs font-semibold text-gray-500">{idx === 0 ? 'Main Image' : `Room Photo ${idx}`}</span>
                    <input 
                      className='border border-gray-300 rounded p-1.5 text-xs w-full' 
                      value={img.startsWith('data:image') ? 'Uploaded File' : img}
                      onChange={e => {
                        const newImgs = [...editing.images];
                        newImgs[idx] = e.target.value;
                        setEditing({ ...editing, images: newImgs });
                      }} 
                      placeholder='Enter Image URL' 
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">OR</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="text-xs w-full text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => handleImageUpload(e, idx, true)}
                      />
                    </div>
                    {img && <img src={img} alt="preview" className="h-12 w-full object-cover mt-2 rounded" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className='sm:col-span-2 border-t pt-4 mt-2'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Amenities</p>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              {['Free Wi-Fi', 'Room Service', 'Free Breakfast', 'Swimming Pool', 'Gym', 'Parking', 'Air Conditioning'].map((amenity) => (
                <label key={amenity} className='flex items-center gap-1.5 text-sm text-gray-600'>
                  <input 
                    type='checkbox' 
                    className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                    checked={editing.amenities?.includes(amenity) || false}
                    onChange={e => {
                      const currentAm = editing.amenities || [];
                      if (e.target.checked) {
                        setEditing({ ...editing, amenities: [...currentAm, amenity] });
                      } else {
                        setEditing({ ...editing, amenities: currentAm.filter(a => a !== amenity) });
                      }
                    }} 
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={editing.isAvailable}
              onChange={e => setEditing({ ...editing, isAvailable: e.target.checked })} />
            Available for booking
          </label>
          <div className='sm:col-span-2 flex gap-3'>
            <button className='bg-primary text-white px-5 py-2 rounded'>Update</button>
            <button type='button' onClick={() => setEditing(null)} className='bg-gray-500 text-white px-5 py-2 rounded'>Cancel</button>
          </div>
        </form>
      )}

      {editingRoom && (
        <form onSubmit={saveRoom} className='grid sm:grid-cols-2 gap-3 mb-8 max-w-4xl border border-blue-300 rounded-lg p-4 bg-blue-50/30'>
          <h3 className='sm:col-span-2 font-medium text-blue-900'>Edit Room: {editingRoom.type}</h3>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-gray-500'>Room Type</label>
            <select className='border border-gray-300 rounded p-2' value={editingRoom.type}
              onChange={e => setEditingRoom({ ...editingRoom, type: e.target.value })}>
              <option value="SINGLE">SINGLE</option>
              <option value="DOUBLE">DOUBLE</option>
              <option value="DELUXE">DELUXE</option>
              <option value="FAMILY">FAMILY</option>
            </select>
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-gray-500'>Price</label>
            <input className='border border-gray-300 rounded p-2' type='number' value={editingRoom.price}
              onChange={e => setEditingRoom({ ...editingRoom, price: e.target.value })} placeholder='Price' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-gray-500'>Total Rooms</label>
            <input className='border border-gray-300 rounded p-2' type='number' value={editingRoom.totalRooms}
              onChange={e => setEditingRoom({ ...editingRoom, totalRooms: e.target.value })} placeholder='Total Rooms' />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-gray-500'>Max Persons</label>
            <input className='border border-gray-300 rounded p-2' type='number' value={editingRoom.personCount}
              onChange={e => setEditingRoom({ ...editingRoom, personCount: e.target.value })} placeholder='Max Persons' />
          </div>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' checked={editingRoom.available}
              onChange={e => setEditingRoom({ ...editingRoom, available: e.target.checked })} />
            Available
          </label>
          <div className='sm:col-span-2 flex gap-3 mt-2'>
            <button className='bg-blue-600 text-white px-5 py-2 rounded'>Save Changes</button>
            <button type='button' onClick={() => setEditingRoom(null)} className='bg-gray-500 text-white px-5 py-2 rounded'>Cancel</button>
          </div>
        </form>
      )}

      <div className='w-full max-w-6xl border border-gray-300 rounded-lg overflow-x-auto mb-10'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 text-gray-700'>
            <tr>
              <th className='py-3 px-4 text-left'>Hotel</th>
              <th className='py-3 px-4 text-left'>City</th>
              <th className='py-3 px-4 text-left'>Rooms (Inventory)</th>
              <th className='py-3 px-4 text-center'>Price</th>
              <th className='py-3 px-4 text-center'>Available</th>
              <th className='py-3 px-4 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.hotelId} className='border-t'>
                <td className='py-3 px-4 font-medium'>{hotel.hotel.name}</td>
                <td className='py-3 px-4'>{hotel.hotel.city}</td>
                <td className='py-3 px-4'>
                  <div className='flex flex-wrap gap-2'>
                    {hotel.rooms && hotel.rooms.length > 0 ? (
                      hotel.rooms.map((room, idx) => (
                        <div key={idx} className='bg-blue-50 border border-blue-100 rounded px-2 py-1 text-[10px] flex flex-col items-center min-w-[70px] relative group'>
                          <span className='font-bold text-blue-700'>{room.type}</span>
                          <span className='text-gray-600'>{room.totalRooms} Rooms</span>
                          <div className='hidden group-hover:flex absolute -top-2 -right-2 gap-1 bg-white shadow-md rounded p-1 border'>
                            <button onClick={() => setEditingRoom(room)} className='text-blue-600 hover:scale-110'>✎</button>
                            <button onClick={() => deleteRoom(room.id)} className='text-red-500 hover:scale-110'>✕</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className='text-gray-400 text-xs italic'>No rooms added</span>
                    )}
                  </div>
                </td>
                <td className='py-3 px-4 text-center'>Rs.{hotel.pricePerNight}</td>
                <td className='py-3 px-4 text-center'>
                  <button onClick={() => toggleAvailability(hotel)}
                    className={`px-3 py-1 rounded-full text-xs ${hotel.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {hotel.isAvailable ? 'Available' : 'Not Available'}
                  </button>
                </td>
                <td className='py-3 px-4'>
                  <div className='flex justify-center gap-3'>
                    <button onClick={() => startEdit(hotel)} className='text-blue-600'>Edit</button>
                    <button onClick={() => deleteHotel(hotel.hotelId)} className='text-red-500'>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className='text-xl text-blue-950/80 font-medium mb-4'>Bookings</h2>
      <div className='w-full max-w-6xl border border-gray-300 rounded-lg overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 text-gray-700'>
            <tr>
              <th className='py-3 px-4 text-left'>Customer</th>
              <th className='py-3 px-4 text-left'>Hotel</th>
              <th className='py-3 px-4 text-left'>Dates</th>
              <th className='py-3 px-4 text-center'>Amount</th>
              <th className='py-3 px-4 text-center'>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan='5' className='text-center py-6 text-gray-500'>No bookings found</td></tr>
            ) : bookings.map((item) => (
              <tr key={item.id} className='border-t'>
                <td className='py-3 px-4'>
                  <p className='font-medium'>{item.user?.name || 'N/A'}</p>
                  <p className='text-xs text-gray-500'>{item.user?.email}</p>
                </td>
                <td className='py-3 px-4'>
                  <p className='font-medium'>{item.hotel?.name || 'Hotel'}</p>
                  <p className='text-xs text-gray-500'>{item.room?.type || 'Room'} - {item.guests} guest(s)</p>
                </td>
                <td className='py-3 px-4'>{item.checkIn} to {item.checkOut}</td>
                <td className='py-3 px-4 text-center'>Rs.{item.totalPrice}</td>
                <td className='py-3 px-4 text-center'>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    item.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                    item.status === 'CHECKED_OUT' ? 'bg-purple-100 text-purple-700' : 
                    item.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status || 'PENDING'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className='text-xl text-blue-950/80 font-medium mt-10 mb-4'>Emails / Messages</h2>
      <div className='w-full max-w-6xl border border-gray-300 rounded-lg overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 text-gray-700'>
            <tr>
              <th className='py-3 px-4 text-left'>Email</th>
              <th className='py-3 px-4 text-left'>Subject</th>
              <th className='py-3 px-4 text-left'>Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr><td colSpan='3' className='text-center py-6 text-gray-500'>No messages found</td></tr>
            ) : messages.map((item) => (
              <tr key={item.id} className='border-t'>
                <td className='py-3 px-4'>{item.email}</td>
                <td className='py-3 px-4'>{item.subject}</td>
                <td className='py-3 px-4'>{item.message || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className='w-full max-w-6xl border border-gray-300 rounded-lg overflow-x-auto mb-10'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 text-gray-700'>
            <tr>
              <th className='py-3 px-4 text-left'>Day / Policy</th>
              <th className='py-3 px-4 text-left'>Room Cleaning Service</th>
              <th className='py-3 px-4 text-left'>Breakfast Timings</th>
              <th className='py-3 px-4 text-left'>Special Events/Dinners</th>
              <th className='py-3 px-4 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className='border-t'>
              <td className='py-3 px-4 font-medium'>Monday</td>
              <td className='py-3 px-4'>9:00 AM - 1:00 PM</td>
              <td className='py-3 px-4'>7:30 AM - 10:00 AM</td>
              <td className='py-3 px-4'>Welcome Drink Session</td>
              <td className='py-3 px-4 text-center'>
                <button className='text-blue-600 mr-2 hover:underline'>Edit</button>
                <button className='text-red-500 hover:underline'>Delete</button>
              </td>
            </tr>
            <tr className='border-t'>
              <td className='py-3 px-4 font-medium'>Tuesday</td>
              <td className='py-3 px-4'>9:00 AM - 1:00 PM</td>
              <td className='py-3 px-4'>7:30 AM - 10:00 AM</td>
              <td className='py-3 px-4'>-</td>
              <td className='py-3 px-4 text-center'>
                <button className='text-blue-600 mr-2 hover:underline'>Edit</button>
                <button className='text-red-500 hover:underline'>Delete</button>
              </td>
            </tr>
            <tr className='border-t'>
              <td className='py-3 px-4 font-medium'>Wednesday</td>
              <td className='py-3 px-4'>9:00 AM - 1:00 PM</td>
              <td className='py-3 px-4'>7:30 AM - 10:00 AM</td>
              <td className='py-3 px-4'>Live Music Night</td>
              <td className='py-3 px-4 text-center'>
                <button className='text-blue-600 mr-2 hover:underline'>Edit</button>
                <button className='text-red-500 hover:underline'>Delete</button>
              </td>
            </tr>
            <tr className='border-t'>
              <td className='py-3 px-4 font-medium'>Thursday</td>
              <td className='py-3 px-4'>9:00 AM - 1:00 PM</td>
              <td className='py-3 px-4'>7:30 AM - 10:00 AM</td>
              <td className='py-3 px-4'>-</td>
              <td className='py-3 px-4 text-center'>
                <button className='text-blue-600 mr-2 hover:underline'>Edit</button>
                <button className='text-red-500 hover:underline'>Delete</button>
              </td>
            </tr>
            <tr className='border-t'>
              <td className='py-3 px-4 font-medium'>Friday</td>
              <td className='py-3 px-4'>9:00 AM - 1:00 PM</td>
              <td className='py-3 px-4'>7:30 AM - 10:30 AM</td>
              <td className='py-3 px-4'>Seafood Buffet</td>
              <td className='py-3 px-4 text-center'>
                <button className='text-blue-600 mr-2 hover:underline'>Edit</button>
                <button className='text-red-500 hover:underline'>Delete</button>
              </td>
            </tr>
            <tr className='border-t'>
              <td className='py-3 px-4 font-medium'>Saturday</td>
              <td className='py-3 px-4'>10:00 AM - 2:00 PM</td>
              <td className='py-3 px-4'>8:00 AM - 11:00 AM</td>
              <td className='py-3 px-4'>Gala Dinner & DJ</td>
              <td className='py-3 px-4 text-center'>
                <button className='text-blue-600 mr-2 hover:underline'>Edit</button>
                <button className='text-red-500 hover:underline'>Delete</button>
              </td>
            </tr>
            <tr className='border-t'>
              <td className='py-3 px-4 font-medium'>Sunday</td>
              <td className='py-3 px-4'>10:00 AM - 2:00 PM</td>
              <td className='py-3 px-4'>8:00 AM - 11:00 AM</td>
              <td className='py-3 px-4'>Sunday Brunch</td>
              <td className='py-3 px-4 text-center'>
                <button className='text-blue-600 mr-2 hover:underline'>Edit</button>
                <button className='text-red-500 hover:underline'>Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className='p-4 border-t'>
           <button className='bg-primary text-white px-4 py-2 rounded text-sm'>+ Add Policy/Schedule Row</button>
           <p className='text-xs text-gray-500 mt-2'>* Back-end integration to be added by your team.</p>
        </div>
      </div>
    </div>
  )
}

const Stat = ({ title, value }) => (
  <div className='border border-gray-200 rounded-lg bg-white p-4 shadow-sm'>
    <p className='text-sm text-gray-500'>{title}</p>
    <p className='text-2xl font-semibold text-blue-950/80 mt-1'>{value}</p>
  </div>
)

export default Dashboard
