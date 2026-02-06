import React from 'react'
import Title from './Title'
import assets, { exclusiveOffers } from '../assets/assets'

const ExclusiveOffer = () => {
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 pt-20 pb-20'>

        {/* Title + Button */}
      <div className='flex flex-col md:flex-row items-center justify-between w-full'>
        <Title align='left'
          title='Exclusive offers'
          subTitle='Take advantage of our limited-time offers and special packages to echance your stay and create unforgettable memories.' />

        <button className='group flex items-center gap-2 font-medium cursor-pointer max-md:mt-12'>
          View All Offers
          <img src={assets.arrowIcon} alt="arrowIcon"
            className='group-hover:translate-x-1 transition-all' />
        </button>
      </div>

  {/* Cards */}
      <div className='grid grid-cols-1 md-grid-cols-2 lg:grid-cols-3 gap-6 mt-12'>
        {exclusiveOffers.map((item) => (
          <div key={item._id} className='group relative flex-col items-start justify-between gap-1 pt-12 md:pt-18 
          px-4 rounded-xl text-white bg-no-repeat bg-cover bg-center'
            style={{ backgroundImage: `url(${item.image})` }}>
              
            <p className='px-3 py-1 absolute top-4 left-4 text-xs
             bg-white text-gray-800 font-medium rounded-full'>
              {item.priceOff}% oFF</p>


            <div>
              <p className='text-2xl font-playfair'>{item.title}</p>
              <p className=''>{item.description}</p>
              <p className='text-xs text-white/70 mt-3'>{item.expiryDate}</p>

            </div>
            <button className='flex items-center gap-2 font-mediun cursor-pointer mt-3 mb-5'>
              View offers
              <img src={assets.arrowIcon} alt="arrowIcon"
                className='invert group-hover:translate-x-1 transition-all'
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExclusiveOffer;
