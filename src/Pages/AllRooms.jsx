import React, { useEffect, useState } from 'react'
import assets, { facilityIcons } from '../assets/assets'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StarRatting from '../Components/StarRatting';
import { apiRequest, toRoomCard } from '../api';

// check box
const CheckBox = ({ label, selected = false, onChange = () => { } }) => {
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type="checkbox" checked={selected} onChange={(e) => onChange(e.target.checked, label)} />
            <span className='font-light select-none'>{label}</span>
        </label>
    )

}

// Radio buttom
const RadioButton = ({ label, selected = false, onChange = () => { } }) => {
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type="radio" name='sortOption' checked={selected} onChange={(e) => onChange(e.target.checked, label)} />
            <span className='font-light select-none'>{label}</span>
        </label>
    )

}


// Rooms 
const AllRooms = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams()
    const [rooms, setRooms] = useState([])
    const [city, setCity] = useState(searchParams.get('city') || '')
    const selectedCheckIn = searchParams.get('checkIn') || ''
    const selectedCheckOut = searchParams.get('checkOut') || ''
    const selectedGuests = searchParams.get('guests') || ''
    const [message, setMessage] = useState('')
    const [selectedRoomTypes, setSelectedRoomTypes] = useState([])
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([])
    const [selectedSort, setSelectedSort] = useState('')

    // Filer Show and hide
    const [openFilters, setOpenFilters] = useState(false)

    const loadRooms = async (searchCity = '') => {
        try {
            setMessage('Loading rooms...')
            const path = searchCity ? `/hotels/search?city=${encodeURIComponent(searchCity)}` : '/hotels'
            const res = await apiRequest(path)
            setRooms((res.data || []).map(toRoomCard))
            setMessage('')
        } catch (err) {
            setMessage(err.message || 'Unable to load rooms')
        }
    }

    useEffect(() => {
        const queryCity = searchParams.get('city') || ''
        setCity(queryCity)
        loadRooms(queryCity)
    }, [searchParams])

    const handleSearch = (e) => {
        e.preventDefault()
        const queryCity = city.trim()
        if (queryCity) {
            setSearchParams({ city: queryCity })
        } else {
            setSearchParams({})
        }
    }

    // CheckBox
    const roomType = [
        'Single Bed',
        'Double Bed',
        'Luxury Room',
        'Family Room'
    ];

    const priceRange = [
        '0 to 500',
        '500 to 1000',
        '1000 to 2000',
        '2000 to 3000',
        '3000 to 5000',
        '5000 to 8000'
    ];

    const sortOptions = [
        'Price Low to High',
        'Price High to Low',
        'Newest First'
    ];

    const toggleRoomType = (checked, label) => {
        setSelectedRoomTypes((prev) => checked ? [...prev, label] : prev.filter((item) => item !== label))
    }

    const togglePriceRange = (checked, label) => {
        setSelectedPriceRanges((prev) => checked ? [...prev, label] : prev.filter((item) => item !== label))
    }

    const clearFilters = () => {
        setSelectedRoomTypes([])
        setSelectedPriceRanges([])
        setSelectedSort('')
    }

    const isInRange = (price, label) => {
        const clean = label.replace('Rs.', '').trim()
        const [min, max] = clean.split(' to ').map(Number)
        return Number(price) >= min && Number(price) <= max
    }

    // Map filter labels to backend roomType values
    const filteredRooms = rooms
        .filter((room) => {
            if (selectedRoomTypes.length === 0) return true;
            const rType = (room.roomType || '').toLowerCase();
            const hotelRoomTypes = room.rooms?.map(r => (r.type || '').toLowerCase()) || [];
            
            return selectedRoomTypes.some(type => {
                const t = type.toLowerCase();
                
                const matchType = (typeStr) => {
                    if (t.includes('family')) return typeStr.includes('family');
                    if (t.includes('single')) return typeStr.includes('single');
                    if (t.includes('double')) return typeStr.includes('double');
                    if (t.includes('luxury') || t.includes('deluxe')) return typeStr.includes('luxury') || typeStr.includes('deluxe');
                    return typeStr.includes(t);
                };
                
                return matchType(rType) || hotelRoomTypes.some(matchType);
            });
        })
        .filter((room) => selectedPriceRanges.length === 0 || selectedPriceRanges.some((range) => isInRange(room.pricePerNight, range)))
        .sort((a, b) => {
            if (selectedSort === 'Price Low to High') return a.pricePerNight - b.pricePerNight
            if (selectedSort === 'Price High to Low') return b.pricePerNight - a.pricePerNight
            if (selectedSort === 'Newest First') return b.hotelId - a.hotelId
            return 0
        })


    return (
        <div className='flex flex-col-reverse lg:flex-row 
    items-start justify-between pt-28 md:pt-24 
    px-6 md:px-16 lg:px-24 xl:px-32 gap-10 lg:gap-8'>

            <div>
                {/* Title And description Rooms */}
                <div className='flex flex-col items-start text-left w-full'>
                    <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
                    <p
                        className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>
                        Take advantage of our limited-time offers
                        and special packages to enhance your and create
                        unforgettable memories.
                    </p>
                </div>

                <form onSubmit={handleSearch} className='flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-xl'>
                    <input value={city} onChange={(e) => setCity(e.target.value)}
                        className='border border-gray-300 rounded px-4 py-2 flex-1'
                        placeholder='Search by city' />
                    <button className='bg-primary text-white px-6 py-2 rounded'>Search</button>
                    <button type='button' onClick={() => { setCity(''); setSearchParams({}) }}
                        className='border border-gray-300 px-6 py-2 rounded'>Clear</button>
                </form>

                {message && <p className='text-gray-500 mt-8'>{message}</p>}

                {/* Rooms */}
                {filteredRooms.map((room) => (
                    <div key={room._id}
                        className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
                        <img onClick={() => {
                            const params = new URLSearchParams()
                            if (selectedCheckIn) params.set('checkIn', selectedCheckIn)
                            if (selectedCheckOut) params.set('checkOut', selectedCheckOut)
                            if (selectedGuests) params.set('guests', selectedGuests)
                            const query = params.toString()
                            navigate(`/rooms/${room._id}${query ? `?${query}` : ''}`);
                            scrollTo(0, 0);
                        }}
                            src={room.images[0]} alt="hotel-img" title='View RoomsDetails'
                            className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer' />

                        <div className='md:w-1/2 flex flex-col gap-2'>
                            <p className='text-gray-500'>{room.hotel.city}</p>
                            <p onClick={() => {
                                const params = new URLSearchParams()
                                if (selectedCheckIn) params.set('checkIn', selectedCheckIn)
                                if (selectedCheckOut) params.set('checkOut', selectedCheckOut)
                                if (selectedGuests) params.set('guests', selectedGuests)
                                const query = params.toString()
                                navigate(`/rooms/${room._id}${query ? `?${query}` : ''}`);
                                scrollTo(0, 0);
                            }}
                                className='text-gray-800 text-3xl font-playfair cursor-pointer'>{room.hotel.name}</p>

                            <div className='flex items-center'>
                                <StarRatting />
                                <p>200+ review</p>

                            </div>

                            {/* location icons and name */}
                            <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                                <img src={assets.locationIcon} alt="location-icon" />
                                {/* hotel address */}
                                <span>{room.hotel.address}</span>
                            </div>

                            {/* Room Amenities */}
                            <div className='flex flex-wrap item-center mt-3 mb-6 gap-4'>
                                {room.amenities.map((item, index) => (
                                    <div className='flex items-center gap-2  px-3 py-2 rounded-lg bg-[#f5f5ff]/70'
                                        key={index}>
                                        <img className='w-5 h-5'
                                            src={facilityIcons[item]} alt="item" />
                                        <p className='text-xs'>{item}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Rooms Price er niht  */}
                            <p className='text-xl font-medium text-gray-700'>Rs.{room.pricePerNight}/night</p>
                        </div>
                    </div>
                ))}
                {!message && filteredRooms.length === 0 && <p className='text-gray-500 mt-8'>No rooms found.</p>}
            </div>

            {/* Filters */}
            <div className='bg-white w-full lg:w-80 border border-gray-300 rounded-lg lg:rounded-none text-gray-600 max-lg:mb-8 lg:mt-16'>

                <div className={`flex items-center justify-between px-5 py-2.5 lg:border-b border-gray-300 ${openFilters && 'border-b'}`}>
                    <p className='text-base font-medium text-gray-800'>FILTER</p>
                    <div className='text-xs cursor-pointer'>
                        <span onClick={() => setOpenFilters(!openFilters)} className='lg:hidden'> {openFilters ? 'HIDE' : 'SHOW'}</span>
                        <span onClick={clearFilters} className='hidden lg:block'>CLEAR</span>
                    </div>
                </div>

                {/* Filers Option */}
                <div className={`${openFilters ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
                    <div className='px-5 pt-5'>
                        <p className='font-medium text-gray-800 pb-2'>Popular Filters</p>
                        {roomType.map((room, index) => (
                            <CheckBox key={index} label={room} selected={selectedRoomTypes.includes(room)} onChange={toggleRoomType} />
                        ))}
                    </div>

                    {/* Price Range */}
                     <div className='px-5 pt-5'>
                        <p className='font-medium text-gray-800 pb-2'>Price Range</p>
                        {priceRange.map((range, index) => (
                            <CheckBox key={index} label={`Rs. ${range}`} selected={selectedPriceRanges.includes(`Rs. ${range}`)} onChange={togglePriceRange} />
                        ))}
                    </div>

                    
                     {/* Sort By */}
                     <div className='px-5 pt-5 pb-6'>
                        <p className='font-medium text-gray-800 pb-2'>Sort By</p>
                        {sortOptions.map((option, index) => (
                            <RadioButton key={index} label={option} selected={selectedSort === option} onChange={() => setSelectedSort(option)} />
                        ))}
                    </div>

                </div>
            </div>


        </div>


    )
}

export default AllRooms
