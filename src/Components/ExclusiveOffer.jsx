import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Title from './Title'
import assets from '../assets/assets'
import { fetchOffers } from '../api'

const ExclusiveOffer = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const res = await fetchOffers();
      if (res.data) setOffers(res.data);
    } catch (err) {
      console.error('Failed to load exclusive offers', err);
    }
  };

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 pt-20 pb-20'>

        {/* Title + Button */}
      <div className='flex flex-col md:flex-row items-center justify-between w-full'>
        <Title align='left'
          title='Exclusive offers'
          subTitle='Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories.' />

        <button onClick={() => navigate('/hotels')} className='group flex items-center gap-2 font-medium cursor-pointer max-md:mt-12'>
          View All Offers
          <img src={assets.arrowIcon} alt="arrowIcon"
            className='group-hover:translate-x-1 transition-all' />
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12'>
        {offers.map((item) => (
          <div key={item.id || item._id} className='group relative flex flex-col justify-end min-h-[280px] p-5 rounded-2xl text-white bg-no-repeat bg-cover bg-center overflow-hidden shadow-md'
            style={{ backgroundImage: `url(${item.image})` }}>
              
            {/* Dark Gradient Overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none transition-opacity group-hover:opacity-90"></div>
              
            <p className='px-3 py-1.5 absolute top-5 left-5 text-xs
             bg-white text-gray-900 font-bold rounded-full z-10 shadow-sm'>
              {item.priceOff}% OFF</p>

            <div className='relative z-10 mt-auto'>
              <p className='text-2xl font-playfair font-semibold mb-1'>{item.title}</p>
              <p className='text-sm text-gray-200 line-clamp-2'>{item.description}</p>
              <p className='text-xs text-gray-300 mt-2 font-medium'>{item.expiryDate}</p>
            </div>
            
            <button onClick={() => navigate('/hotels')} className='relative z-10 flex items-center gap-2 text-sm font-semibold cursor-pointer mt-4 hover:text-gray-200 transition-colors w-fit'>
              View offers
              <img src={assets.arrowIcon} alt="arrowIcon"
                className='invert group-hover:translate-x-1 transition-transform w-4'
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExclusiveOffer;
