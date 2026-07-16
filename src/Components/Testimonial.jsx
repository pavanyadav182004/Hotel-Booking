import React, { useEffect, useState } from 'react'
import Title from './Title'
import StarRatting from './StarRatting'
import { fetchAllReviews, fetchHotelReviews } from '../api'
import assets from '../assets/assets'

const Testimonial = ({ hotelId, preloadedReviews }) => {
  const [reviews, setReviews] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (preloadedReviews) {
      setReviews(preloadedReviews)
      setLoading(false)
      return
    }

    setLoading(true)
    const fetchFn = hotelId ? fetchHotelReviews(hotelId) : fetchAllReviews()
    fetchFn
      .then(res => {
        setReviews(res.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching reviews:", err)
        setLoading(false)
      })
  }, [hotelId])

  if (loading) {
    return (
      <div className='flex flex-col items-center py-24 bg-slate-50'>
        <div className='animate-pulse flex flex-col items-center gap-4'>
          <div className='h-8 w-64 bg-gray-200 rounded'></div>
          <div className='h-4 w-96 bg-gray-200 rounded'></div>
          <div className='flex flex-wrap justify-center gap-6 mt-14'>
            {[1, 2, 3].map(i => (
              <div key={i} className='bg-white p-6 rounded-2xl shadow w-80 h-56 animate-pulse border border-gray-100'></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (reviews.length === 0) return null

  const displayReviews = showAll ? reviews : reviews.slice(0, 3)

  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-24'>
      <Title
        title={hotelId ? 'Ratings & Reviews' : 'What our Guests Say'}
        subTitle={hotelId ? 'See what previous guests have to say about their stay at this hotel.' : 'Real experiences shared by our community of travelers.'}
      />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14 w-full max-w-7xl'>
        {displayReviews.map((review, index) => (
          <div 
            key={review.id} 
            className='bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col group border border-gray-100 hover:-translate-y-1'
          >
            <div className='flex items-center gap-4'>
              <div className='relative flex-shrink-0'>
                <img 
                  className='w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm' 
                  src={review.userImage || assets.userIcon} 
                  alt={review.userName} 
                />
                <div className='absolute -bottom-0.5 -right-0.5 bg-blue-600 rounded-full p-0.5 border-2 border-white'>
                  <svg className='w-2 h-2 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'></path>
                  </svg>
                </div>
              </div>
              <div>
                <p className='font-playfair text-lg font-bold text-gray-800 leading-tight'>{review.userName}</p>
                {review.userAddress ? (
                  <p className='text-gray-500 text-[11px] font-medium mt-0.5 flex items-center gap-1'>
                    <svg className='w-3 h-3 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'></path>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'></path>
                    </svg>
                    {review.userAddress}
                  </p>
                ) : (
                  <p className='text-blue-600 text-[10px] font-bold uppercase tracking-wider mt-0.5'>Verified Guest</p>
                )}
              </div>
            </div>
            
            <div className='flex items-center gap-1 mt-4'>
              <StarRatting rating={review.rating} readOnly />
            </div>

            <p className='text-gray-600 mt-3 leading-relaxed italic flex-grow text-[14px] line-clamp-4'
              dangerouslySetInnerHTML={{
                __html: `"${(review.comment || '')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br/>')}"`
              }} 
            />

            <div className='mt-5 pt-4 border-t border-gray-50 flex justify-between items-center'>
              <div className='flex flex-col'>
                <span className='text-gray-400 text-[10px] uppercase tracking-tighter'>Stayed at</span>
                <span className='text-gray-700 text-xs font-semibold'>{review.hotelName}</span>
              </div>
              <span className='text-gray-400 text-[10px] font-medium'>
                {new Date(review.createdAt).toLocaleDateString('en-IN', { month:'short', year:'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className='mt-16 px-10 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-2'
        >
          {showAll ? 'Show Less' : `View All ${reviews.length} Reviews`}
          <svg className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'></path>
          </svg>
        </button>
      )}
    </div>
  )
}

export default Testimonial
