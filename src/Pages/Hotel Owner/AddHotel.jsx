import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Title from '../../Components/Title'
import { apiRequest } from '../../api'

const AddHotel = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [hotel, setHotel] = useState({
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

  const handleImageUpload = (e, index) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 800
        const scale = Math.min(1, maxWidth / image.width)
        canvas.width = image.width * scale
        canvas.height = image.height * scale
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        const newImgs = [...hotel.images]
        newImgs[index] = compressed
        setHotel({ ...hotel, images: newImgs })
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hotel.name || !hotel.city || !hotel.address) {
      toast.error('Please fill all required fields.')
      return
    }
    setLoading(true)
    try {
      await apiRequest('/hotels', {
        method: 'POST',
        body: JSON.stringify({
          ...hotel,
          pricePerNight: Number(hotel.pricePerNight),
          rating: Number(hotel.rating),
          images: hotel.images.filter(img => img.trim() !== ''),
        }),
      })
      toast.success('✅ Hotel added successfully!')
      setTimeout(() => navigate('/owner'), 1500)
    } catch (err) {
      toast.error(err.message || 'Failed to add hotel.')
    } finally {
      setLoading(false)
    }
  }

  const AMENITIES = ['Free Wi-Fi', 'Room Service', 'Free Breakfast', 'Swimming Pool', 'Gym', 'Parking', 'Air Conditioning']

  return (
    <div>
      <Title align='left' font='outfit' title='Add New Hotel'
        subTitle='Fill in the details below to add a new hotel to the system.' />

      {/* ── Hotel Form ── */}
      <form onSubmit={handleSubmit} className='mt-8 max-w-4xl bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
        <div className='grid sm:grid-cols-2 gap-4'>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Hotel Name <span className='text-red-500'>*</span></label>
            <input className='border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400'
              value={hotel.name} onChange={e => setHotel({ ...hotel, name: e.target.value })}
              placeholder='e.g. Grand Palace Hotel' required />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>City <span className='text-red-500'>*</span></label>
            <input className='border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400'
              value={hotel.city} onChange={e => setHotel({ ...hotel, city: e.target.value })}
              placeholder='e.g. Mumbai' required />
          </div>

          <div className='sm:col-span-2 flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Address <span className='text-red-500'>*</span></label>
            <input className='border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400'
              value={hotel.address} onChange={e => setHotel({ ...hotel, address: e.target.value })}
              placeholder='Full address' required />
          </div>

          <div className='sm:col-span-2 flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Heading</label>
            <input className='border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400'
              value={hotel.heading} onChange={e => setHotel({ ...hotel, heading: e.target.value })}
              placeholder='e.g. Experience Luxury Like Never Before' />
          </div>

          <div className='sm:col-span-2 flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Description</label>
            <textarea rows={3} className='border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400 resize-none'
              value={hotel.description} onChange={e => setHotel({ ...hotel, description: e.target.value })}
              placeholder='Brief description of the hotel...' />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Room Type</label>
            <select className='border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400'
              value={hotel.roomType} onChange={e => setHotel({ ...hotel, roomType: e.target.value })}>
              <option value='SINGLE'>Single Room</option>
              <option value='DOUBLE'>Double Room</option>
              <option value='DELUXE'>Deluxe Room</option>
              <option value='FAMILY'>Family Room</option>
            </select>
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Price Per Night (₹)</label>
            <input type='number' min='1'
              className='border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400'
              value={hotel.pricePerNight} onChange={e => setHotel({ ...hotel, pricePerNight: e.target.value })}
              placeholder='e.g. 2500' required />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Rating (0–5)</label>
            <input type='number' step='0.1' min='0' max='5'
              className='border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-400'
              value={hotel.rating} onChange={e => setHotel({ ...hotel, rating: e.target.value })} />
          </div>

          <div className='flex items-center gap-2 mt-2'>
            <input type='checkbox' id='avail' className='w-4 h-4 text-blue-600 rounded'
              checked={hotel.available} onChange={e => setHotel({ ...hotel, available: e.target.checked })} />
            <label htmlFor='avail' className='text-sm font-medium text-gray-700'>Available for Booking</label>
          </div>

          {/* Images */}
          <div className='sm:col-span-2 border-t pt-4 mt-2'>
            <p className='text-sm font-medium text-gray-700 mb-3'>Hotel Images (Main + 4 Room Photos)</p>
            <div className='grid sm:grid-cols-2 gap-4'>
              {hotel.images.map((img, idx) => (
                <div key={idx} className='flex flex-col gap-1 border border-gray-200 p-2 rounded-lg bg-gray-50'>
                  <span className='text-xs font-semibold text-gray-500'>{idx === 0 ? 'Main Image' : `Room Photo ${idx}`}</span>
                  <input className='border border-gray-300 rounded p-1.5 text-xs w-full'
                    value={img.startsWith('data:image') ? 'Uploaded File' : img}
                    onChange={e => {
                      const imgs = [...hotel.images]; imgs[idx] = e.target.value
                      setHotel({ ...hotel, images: imgs })
                    }}
                    placeholder='Enter Image URL' />
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs text-gray-400'>OR</span>
                    <input type='file' accept='image/*'
                      className='text-xs w-full text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                      onChange={e => handleImageUpload(e, idx)} />
                  </div>
                  {img && <img src={img} alt='preview' className='h-12 w-full object-cover mt-2 rounded' />}
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className='sm:col-span-2 border-t pt-4 mt-2'>
            <p className='text-sm font-medium text-gray-700 mb-3'>Amenities</p>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              {AMENITIES.map(amenity => (
                <label key={amenity} className='flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer'>
                  <input type='checkbox' className='w-4 h-4 text-blue-600 rounded'
                    checked={hotel.amenities.includes(amenity)}
                    onChange={e => {
                      if (e.target.checked) setHotel({ ...hotel, amenities: [...hotel.amenities, amenity] })
                      else setHotel({ ...hotel, amenities: hotel.amenities.filter(a => a !== amenity) })
                    }} />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className='flex gap-3 mt-8'>
          <button type='submit' disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-60 shadow-sm'>
            {loading ? 'Adding Hotel...' : '🏨 Add Hotel'}
          </button>
          <button type='button' onClick={() => navigate('/owner')}
            className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-all'>
            Cancel
          </button>
        </div>
      </form>

      {/* ── Policy Headings ── */}
      <div className='mt-12 max-w-4xl'>
        <h2 className='text-xl font-semibold text-gray-800 mb-6'>Hotel Policies & Important Information</h2>
        <div className='bg-white border border-gray-200 rounded-xl p-6 space-y-5 text-sm text-gray-700 shadow-sm'>
          {[
            { num: 1, title: 'Check-in and Check-out Times', content: <><strong>Check-in:</strong> Starts from <em>2:00 PM</em> onwards.<br /><strong>Check-out:</strong> Until <em>11:00 AM</em>.</> },
            { num: 2, title: 'Cancellation Policy', content: <><strong>Free Cancellation:</strong> Available up to <em>48 hours</em> before check-in.<br /><strong>Late Cancellation:</strong> Incurs a fee equal to the <em>first night's</em> stay.</> },
            { num: 3, title: 'Pet Policy & Extra Beds', content: <><strong>Pets:</strong> Pets are <em>not allowed</em> on the premises.<br /><strong>Extra Beds:</strong> Available upon request for an additional <strong>₹1000/night</strong>.</> },
            { num: 4, title: 'Dining & Restaurant', content: <><strong>Breakfast:</strong> Complimentary breakfast from <em>7:30 AM to 10:30 AM</em>.<br /><strong>Dinner:</strong> Multi-cuisine restaurant available till <em>11:00 PM</em>.</> },
            { num: 5, title: 'Parking Facility', content: <><strong>Valet Parking:</strong> <em>Free valet parking</em> for all guests.<br /><strong>EV Charging:</strong> Dedicated spots available: subject to availability.</> },
            { num: 6, title: 'Pool & Fitness Center', content: <><strong>Swimming Pool:</strong> Open from <em>6:00 AM to 8:00 PM</em>.<br /><strong>Gymnasium:</strong> 24/7 access: requires room key card.</> },
            { num: 7, title: 'Additional Services', content: <><strong>Laundry:</strong> Same-day laundry service available.<br /><strong>Airport Shuttle:</strong> Paid service: inform reception <em>24 hours</em> prior.</> },
          ].map(({ num, title, content }) => (
            <div key={num}>
              <h3 className='text-base font-semibold text-gray-800 mb-1'>{num}. {title}</h3>
              <p className='leading-relaxed'>{content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Weekly Schedule Table ── */}
      <div className='mt-10 max-w-4xl mb-12'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Weekly Schedule & Services</h2>
        <div className='border border-gray-200 rounded-xl overflow-x-auto shadow-sm'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-gray-700'>
              <tr>
                <th className='py-3 px-4 text-left'>Day</th>
                <th className='py-3 px-4 text-left'>Room Cleaning</th>
                <th className='py-3 px-4 text-left'>Breakfast Timings</th>
                <th className='py-3 px-4 text-left'>Special Events/Dinners</th>
              </tr>
            </thead>
            <tbody>
              {[
                { day: 'Monday',    clean: '9:00 AM – 1:00 PM',  bfast: '7:30 AM – 10:00 AM', event: 'Welcome Drink Session' },
                { day: 'Tuesday',   clean: '9:00 AM – 1:00 PM',  bfast: '7:30 AM – 10:00 AM', event: '—' },
                { day: 'Wednesday', clean: '9:00 AM – 1:00 PM',  bfast: '7:30 AM – 10:00 AM', event: 'Live Music Night' },
                { day: 'Thursday',  clean: '9:00 AM – 1:00 PM',  bfast: '7:30 AM – 10:00 AM', event: '—' },
                { day: 'Friday',    clean: '9:00 AM – 1:00 PM',  bfast: '7:30 AM – 10:30 AM', event: 'Seafood Buffet' },
                { day: 'Saturday',  clean: '10:00 AM – 2:00 PM', bfast: '8:00 AM – 11:00 AM', event: 'Gala Dinner & DJ' },
                { day: 'Sunday',    clean: '10:00 AM – 2:00 PM', bfast: '8:00 AM – 11:00 AM', event: 'Sunday Brunch' },
              ].map(({ day, clean, bfast, event }) => (
                <tr key={day} className='border-t hover:bg-gray-50'>
                  <td className='py-3 px-4 font-medium'>{day}</td>
                  <td className='py-3 px-4'>{clean}</td>
                  <td className='py-3 px-4'>{bfast}</td>
                  <td className='py-3 px-4'>{event}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AddHotel
