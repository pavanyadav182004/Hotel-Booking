import React from 'react'
import { assets } from '../assets/assets'

const StarRatting = ({ rating = 4, onChange }) => {
  return (
    <div className='flex gap-1'>
      {Array(5).fill('').map((_, index) => {
        const value = index + 1
        const star = (
          <img
            src={rating >= value ? assets.starIconFilled : assets.starIconOutlined}
            alt='star-icon'
            className='w-4.5 h-4.5'
          />
        )

        if (!onChange) {
          return <span key={value}>{star}</span>
        }

        return (
          <button
            type='button'
            key={value}
            onClick={() => onChange(value)}
            className='cursor-pointer active:scale-90 transition-transform'
            aria-label={`${value} star`}
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}

export default StarRatting
