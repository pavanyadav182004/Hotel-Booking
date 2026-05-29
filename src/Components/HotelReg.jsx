import React, { useState } from 'react'
import assets, { cities } from '../assets/assets'
import { apiRequest } from '../api'

const HotelReg = ({ setShow }) => {
    const [form, setForm] = useState({
        name: '',
        contact: '',
        address: '',
        city: '',
        pricePerNight: 3500,
        roomType: 'Luxury Room',
        imageUrl: '',
    })
    const [message, setMessage] = useState('')

    const close = () => {
        if (setShow) setShow(false)
    }

    const submitHotel = async (e) => {
        e.preventDefault()
        setMessage('')
        try {
            await apiRequest('/hotels', {
                method: 'POST',
                body: JSON.stringify({
                    name: form.name,
                    city: form.city,
                    address: form.address,
                    description: `Contact: ${form.contact}`,
                    pricePerNight: Number(form.pricePerNight),
                    rating: 4.5,
                    imageUrl: form.imageUrl,
                    roomType: form.roomType,
                    available: true,
                    amenities: ['Free Wi-Fi', 'Room Service', 'Free Breakfast'],
                })
            })
            setMessage('Hotel registered successfully')
            setTimeout(close, 700)
        } catch (err) {
            setMessage(err.message || 'Unable to register hotel')
        }
    }

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70'>
            <form onSubmit={submitHotel} className='flex bg-white rounded-xl max-w-4xl max-md:mx-2'>
                <img src={assets.regImage} alt="reg-image" className='w-1/2 rounded-xl hidden md:block' />

                <div className='relative flex flex-col items-center md:w-1/2 p-8 md:p-10'>
                    <img src={assets.closeIcon} alt="close-icons" onClick={close}
                        className='absolute top-4 right-4 h-4 w-4 cursor-pointer' />

                    <p className='text-2xl font-semibold mt-6'>Register Your Hotel</p>
                    {message && <p className='text-sm text-blue-600 mt-3'>{message}</p>}

                    <div className='w-full mt-4'>
                        <label htmlFor="name" className='font-medium text-gray-500'>Hotel Name</label>
                        <input type="text" id="name" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder='Type here'
                            className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light'
                            required />
                    </div>

                    <div className='w-full mt-4'>
                        <label htmlFor="contact" className='font-medium text-gray-500'>Phone</label>
                        <input type="text" id="contact" value={form.contact}
                            onChange={(e) => setForm({ ...form, contact: e.target.value })}
                            placeholder='Type here'
                            className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light'
                            required />
                    </div>

                    <div className='w-full mt-4'>
                        <label htmlFor="address" className='font-medium text-gray-500'>Address</label>
                        <input type="text" id="address" value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder='Type here'
                            className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light'
                            required />
                    </div>

                    <div className='w-full mt-4 max-w-60 mr-auto'>
                        <label htmlFor="city" className='font-medium text-gray-500'>City</label>
                        <select id="city" value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light'
                            required>
                            <option value=''>Select City</option>
                            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>

                    <div className='w-full mt-4 grid grid-cols-2 gap-3'>
                        <input type="number" min="1" value={form.pricePerNight}
                            onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                            className='border border-gray-200 rounded px-3 py-2.5 outline-indigo-500 font-light'
                            placeholder='Price' />
                        <select value={form.roomType}
                            onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                            className='border border-gray-200 rounded px-3 py-2.5 outline-indigo-500 font-light'>
                            <option>Single Bed</option>
                            <option>Double Bed</option>
                            <option>Luxury Room</option>
                            <option>Family Suite</option>
                        </select>
                    </div>

                    <input type="text" value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        placeholder='Image URL optional'
                        className='border border-gray-200 rounded w-full px-3 py-2.5 mt-4 outline-indigo-500 font-light' />

                    <button className='bg-indigo-500 hover:bg-indigo-600 transition-all text-white mr-auto px-6 py-2 rounded cursor-pointer mt-6'>
                        Register
                    </button>
                </div>
            </form>
        </div>
    )
}

export default HotelReg
