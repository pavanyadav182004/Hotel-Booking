import React from 'react'
import { Link } from 'react-router-dom';
import assets from '../assets/assets';

const HotelCard = ({ room, index }) => {
    return (

        <Link 
            to={'/rooms/' + room._id} 
            onClick={() => scrollTo(0, 0)} 
            key={room._id}
            className='group relative max-w-[300px] w-full rounded-2xl overflow-hidden bg-white 
            shadow-md hover:shadow-2xl transition-all  duration-500  transform hover:-translate-y-2'
        >

            {/* Image Section */}
            <div className="overflow-hidden">
                <img 
                    src={room.images[0]} 
                    alt="hotel"
                    // hover-scale-110 zoom-in ke liyee
                    className='w-full h-52 object-cover group-hover:scale-110 transition duration-500'
                />
            </div>

            {/* Best Seller Badge */}
            {index % 2 === 0 && (
                <p className='absolute top-3 left-3 px-3 py-1 text-xs bg-white 
                text-red-500 font-semibold rounded-full shadow'>
                    Best Seller
                </p>
            )}

            {/* Content Section */}
            <div className='p-4'>

                <div className='flex items-center justify-between'>
                    <p className='text-lg font-semibold text-gray-800 truncate'>
                        {room.hotel.name}
                    </p>

                    <div className='flex items-center gap-1 text-yellow-500 text-sm'>
                        <img 
                            src={assets.starIconOutlined} 
                            alt="star" 
                            className='w-4'
                        />
                        4.5
                    </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <img 
                        src={assets.locationIcon} 
                        alt="location" 
                        className='w-4'
                    />
                    <span className='truncate'>{room.hotel.address}</span>
                </div>

                {/* Price + Button */}
                <div className="flex items-center justify-between mt-4">
                    <p className='text-gray-800 font-semibold'>
                        ₹{room.pricePerNight}
                        <span className='text-sm text-gray-500'> /night</span>
                    </p>

                    <button 
                        className='px-4 py-2 text-sm font-medium text-white 
                        bg-red-500 rounded-lg 
                        hover:bg-red-600 active:scale-95 
                        transition-all duration-300'
                    >
                        Book Now
                    </button>
                </div>
            </div>

        </Link>
    )
}

export default HotelCard;