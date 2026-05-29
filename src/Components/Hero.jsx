import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import assets, { cities } from '../assets/assets';

const Hero = () => {
    const navigate = useNavigate()
    const [destination, setDestination] = useState('')
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [guests, setGuests] = useState(1)

    const searchDestination = (e) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (destination.trim()) params.set('city', destination.trim())
        if (checkIn) params.set('checkIn', checkIn)
        if (checkOut) params.set('checkOut', checkOut)
        if (guests) params.set('guests', guests)
        const query = params.toString()
        navigate(query ? `/rooms?${query}` : '/rooms')
        scrollTo(0, 0)
    }

    return (
        <div className='flex flex-col items-start justify-center px-6 
    md:px-16 lg:px-24 xl:px-32 text-white 
    bg-[url("/src/assets/hotel.jpg")] 
    bg-no-repeat bg-cover bg-center h-screen '>
            <div>
                <p className='bg-[#49b9ff]/50 px-3.5 py-1 w-max text-sm md:text-base rounded-full mt-24 md:mt-20'>
                    The Ultimate Hotel Experience</p>

                <h1 className='font-playfair text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4'>
                    Discover your perfect Geteway Destination</h1>

                <p className='text-sm md:text-base mt-2 md:mt-4'>Unparalleled luxury and comfort await at the world's most exclusive <br className="hidden md:block" /> hotels and resorts. Start your journey today.</p>

                <form onSubmit={searchDestination} className='bg-white text-gray-500 rounded-lg px-4 md:px-6 py-4 mt-8 flex flex-col 
                md:flex-row md:items-end gap-4 w-full max-w-full md:max-w-fit'>
                    <div>
                        <div className='flex items-center gap-2'>
                            <img src={assets.calenderIcon} alt="" className='h-4' />
                            <label htmlFor="destinationInput">Destination</label>
                        </div>

                        <input required value={destination} onChange={(e) => setDestination(e.target.value)}
                            list='destinations' id="destinationInput" type="text" className="w-full rounded border border-gray-200 px-3 py-2 md:py-1.5 mt-1.5 text-sm outline-none" placeholder="Type here" />
                        <datalist id='destinations'>
                            {cities.map((city, index) => (
                                <option value={city} key={index} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <div className='flex items-center gap-2'>
                            <img src={assets.calenderIcon} alt="" className='h-4' />
                            <label htmlFor="checkIn">Check in</label>
                        </div>
                        <input required id="checkIn" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full rounded border border-gray-200 px-3 py-2 md:py-1.5 mt-1.5 text-sm outline-none" />
                    </div>

                    <div>
                        <div className='flex items-center gap-2'>
                            <img src={assets.calenderIcon} alt="" className='h-4' />
                            <label htmlFor="checkOut">Check out</label>
                        </div>
                        <input required id="checkOut" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full rounded border border-gray-200 px-3 py-2 md:py-1.5 mt-1.5 text-sm outline-none" />
                    </div>

                    <div className='flex flex-col gap-0'>
                        <label htmlFor="guests" className="mb-1.5">Guests</label>
                        <input min={1} max={10} id="guests" type="number" value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full rounded border border-gray-200 px-3 py-2 md:py-1.5 text-sm outline-none md:max-w-16" placeholder="0" />
                    </div>

                    <button className='flex items-center justify-center gap-1 rounded-md bg-black py-2.5 md:py-3 px-4 text-white w-full md:w-auto cursor-pointer mt-2 md:mt-0' >
                        <img src={assets.searchIcon} alt="search-icon" className='h-6 md:h-7' />
                        <span>Search</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Hero;
