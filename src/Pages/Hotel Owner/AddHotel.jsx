import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Title from '../../Components/Title'
import { apiRequest } from '../../api'

const AddHotel = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [policies, setPolicies] = useState([])

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
          policies: JSON.stringify(policies),
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

  const insertFormat = (idx, prefix, suffix, placeholder) => {
    const ta = document.getElementById(`desc-${idx}`)
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const current = policies[idx].description
    const selected = current.substring(start, end) || placeholder
    const newText = current.substring(0, start) + prefix + selected + suffix + current.substring(end)
    const updated = [...policies]
    updated[idx].description = newText
    setPolicies(updated)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length) }, 0)
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

      {/* ── Policy Editor ── */}
      <div className='mt-12 max-w-4xl mb-12'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Hotel Policies & Important Information</h2>
          <button type='button'
            onClick={() => setPolicies([...policies, { heading: '', description: '' }])}
            className='bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-all active:scale-95'>
            + Add Policy
          </button>
        </div>

        <div className='space-y-4'>
          {policies.map((policy, idx) => (
            <div key={idx} className='bg-white border border-gray-200 rounded-xl p-5 shadow-sm'>

              {/* Heading row */}
              <div className='flex items-center gap-3 mb-3'>
                <span className='text-base font-bold text-blue-600 min-w-[28px]'>{idx + 1}.</span>
                <input
                  className='flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-400'
                  placeholder='Policy Heading (e.g. Check-in and Check-out Times)'
                  value={policy.heading}
                  onChange={e => {
                    const updated = [...policies]
                    updated[idx].heading = e.target.value
                    setPolicies(updated)
                  }}
                />
                <button type='button'
                  onClick={() => setPolicies(policies.filter((_, i) => i !== idx))}
                  className='text-red-400 hover:text-red-600 text-lg font-bold transition-colors px-1'>
                  ✕
                </button>
              </div>

              {/* Formatting toolbar */}
              <div className='flex flex-wrap gap-2 mb-2'>
                <button type='button'
                  onClick={() => insertFormat(idx, '**', '**', 'bold text')}
                  className='w-8 h-8 border border-gray-300 rounded font-bold text-sm hover:bg-blue-50 hover:border-blue-400 transition-colors'
                  title='Bold'>
                  B
                </button>
                <button type='button'
                  onClick={() => insertFormat(idx, '*', '*', 'italic text')}
                  className='w-8 h-8 border border-gray-300 rounded italic text-sm hover:bg-blue-50 hover:border-blue-400 transition-colors'
                  title='Italic'>
                  I
                </button>
                <button type='button'
                  onClick={() => insertFormat(idx, '**', ':** value', 'Label')}
                  className='h-8 px-2 border border-gray-300 rounded text-xs font-mono hover:bg-blue-50 hover:border-blue-400 transition-colors'
                  title='Bold + Colon'>
                  B:
                </button>
                <button type='button'
                  onClick={() => insertFormat(idx, '**', ':** *value*', 'Label')}
                  className='h-8 px-2 border border-gray-300 rounded text-xs font-mono hover:bg-blue-50 hover:border-blue-400 transition-colors'
                  title='Bold + Colon + Italic value'>
                  B:I
                </button>
                <span className='text-xs text-gray-400 self-center ml-1 hidden sm:block'>
                  **bold** &nbsp;|&nbsp; *italic* &nbsp;|&nbsp; **Label:** value
                </span>
              </div>

              {/* Description textarea */}
              <textarea
                id={`desc-${idx}`}
                rows={3}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none font-mono'
                placeholder='e.g. **Check-in:** Starts from *2:00 PM* onwards.'
                value={policy.description}
                onChange={e => {
                  const updated = [...policies]
                  updated[idx].description = e.target.value
                  setPolicies(updated)
                }}
              />

              {/* Live Preview */}
              {policy.description && (
                <div className='mt-2 text-sm text-gray-700 border-t pt-2'>
                  <span className='text-xs text-gray-400 mb-1 block font-medium'>Preview:</span>
                  <p dangerouslySetInnerHTML={{
                    __html: policy.description
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br/>')
                  }} />
                </div>
              )}
            </div>
          ))}

          {policies.length === 0 && (
            <div className='text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400'>
              <p className='text-base mb-1'>No policies added yet.</p>
              <p className='text-sm'>Click <strong className='text-blue-500'>+ Add Policy</strong> to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddHotel
