import React from 'react'
import { assets } from '../assets/assets'

const values = [
  { title: 'Verified stays', text: 'Every listed hotel is managed with clear room details, pricing, amenities, and availability.' },
  { title: 'Simple booking', text: 'Search a destination, choose dates, check available rooms, and confirm your booking without confusion.' },
  { title: 'Admin control', text: 'Hotel owners can manage hotels, bookings, availability, customers, and revenue from one dashboard.' },
]

const stats = [
  { value: '50+', label: 'Destinations' },
  { value: '24/7', label: 'Booking access' },
  { value: '100%', label: 'Secure login' },
]

const About = () => {
  return (
    <div className='pt-28 md:pt-32 pb-20'>
      <section className='px-6 md:px-16 lg:px-24 xl:px-32'>
        <div className='grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center'>
          <div>
            <p className='text-primary font-semibold tracking-wide uppercase text-sm'>About QuickStay</p>
            <h1 className='font-playfair text-4xl md:text-5xl leading-tight mt-3 text-gray-900'>
              A smoother way to discover, book, and manage hotel stays.
            </h1>
            <p className='text-gray-600 mt-5 text-base md:text-lg leading-8 max-w-2xl'>
              Pavan Hotels, travelers, and hotel owners into one clean platform.
              Guests can search by city, check room availability, and book with confidence.
              Admins get a practical dashboard to add hotels, update details, control availability,
              and see who booked.
            </p>

            <div className='grid sm:grid-cols-3 gap-4 mt-8 max-w-2xl'>
              {stats.map((item) => (
                <div key={item.label} className='border border-gray-200 rounded-lg p-4 bg-white shadow-sm'>
                  <p className='text-2xl font-semibold text-gray-900'>{item.value}</p>
                  <p className='text-sm text-gray-500 mt-1'>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className='relative'>
            <img
              src={assets.hotel}
              alt='Hotel stay'
              className='w-full h-[360px] md:h-[460px] object-cover rounded-lg shadow-xl'
            />
            <div className='absolute left-5 right-5 bottom-5 bg-white/95 backdrop-blur rounded-lg p-4 shadow'>
              <p className='text-sm text-gray-500'>Built for real booking workflows</p>
              <p className='font-semibold text-gray-900 mt-1'>Search, book, pay, and manage from one place.</p>
            </div>
          </div>
        </div>
      </section>

      <section className='px-6 md:px-16 lg:px-24 xl:px-32 mt-20 bg-slate-50 py-16'>
        <div className='max-w-3xl'>
          <p className='text-primary font-semibold tracking-wide uppercase text-sm'>What we focus on</p>
          <h2 className='font-playfair text-3xl md:text-4xl mt-3 text-gray-900'>
            Clear information, reliable availability, and easy control.
          </h2>
        </div>

        <div className='grid md:grid-cols-3 gap-6 mt-10'>
          {values.map((item) => (
            <div key={item.title} className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm'>
              <h3 className='font-semibold text-xl text-gray-900'>{item.title}</h3>
              <p className='text-gray-600 mt-3 leading-7'>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='px-6 md:px-16 lg:px-24 xl:px-32 mt-20'>
        <div className='grid lg:grid-cols-2 gap-10 items-center'>
          <img
            src={assets.regImage}
            alt='Hotel registration'
            className='w-full h-[320px] md:h-[420px] object-cover rounded-lg shadow-lg'
          />
          <div>
            <p className='text-primary font-semibold tracking-wide uppercase text-sm'>For hotel owners</p>
            <h2 className='font-playfair text-3xl md:text-4xl mt-3 text-gray-900'>
              Your admin panel is designed for daily hotel work.
            </h2>
            <p className='text-gray-600 mt-5 leading-8'>
              Add hotels, update prices, toggle availability, review bookings, and track revenue.
              The dashboard keeps important actions close, so hotel data stays fresh and guests see
              the right availability when they book.
            </p>
            <div className='mt-7 flex flex-wrap gap-3 text-sm text-gray-700'>
              <span className='bg-gray-100 px-4 py-2 rounded-full'>Hotel CRUD</span>
              <span className='bg-gray-100 px-4 py-2 rounded-full'>Booking list</span>
              <span className='bg-gray-100 px-4 py-2 rounded-full'>Revenue view</span>
              <span className='bg-gray-100 px-4 py-2 rounded-full'>Availability control</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
