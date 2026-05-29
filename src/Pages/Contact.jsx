import React, { useState } from 'react'
import { apiRequest } from '../api'
import { assets } from '../assets/assets'

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const submitMessage = async (e) => {
    e.preventDefault()
    setStatus('')
    setLoading(true)

    try {
      await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          subject: form.subject || `Message from ${form.name}`,
          message: `Name: ${form.name}\n\n${form.message}`,
        }),
      })

      setStatus('Message sent successfully. Our team will contact you soon.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus(err.message || 'Unable to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='pt-28 md:pt-32 pb-20 px-6 md:px-16 lg:px-24 xl:px-32'>
      <div className='grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start'>
        <section>
          <p className='text-primary font-semibold tracking-wide uppercase text-sm'>Contact Us</p>
          <h1 className='font-playfair text-4xl md:text-5xl text-gray-900 mt-3 leading-tight'>
            Send us a message about your booking, hotel, or support need.
          </h1>
          <p className='text-gray-600 mt-5 leading-8 max-w-xl'>
            Fill the form and your message will reach the admin dashboard. You can ask about hotel booking,
            cancellation, room availability, hotel registration, payment, or account support.
          </p>

          <div className='mt-8 space-y-4'>
            <div className='flex items-start gap-3'>
              <img src={assets.locationFilledIcon} alt='location' className='w-5 mt-1' />
              <div>
                <p className='font-medium text-gray-900'>Office</p>
                <p className='text-gray-500'>Pavan Hotel Booking Support, India</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <img src={assets.userIcon} alt='support' className='w-5 mt-1' />
              <div>
                <p className='font-medium text-gray-900'>Support</p>
                <p className='text-gray-500'>Messages are visible to admin in dashboard.</p>
              </div>
            </div>
          </div>

          <img
            src={assets.regImage}
            alt='contact hotel support'
            className='w-full max-w-lg h-64 object-cover rounded-lg shadow-lg mt-10'
          />
        </section>

        <form onSubmit={submitMessage} className='bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Write Message</h2>

          {status && (
            <p className={`text-sm mb-4 ${status.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-500'}`}>
              {status}
            </p>
          )}

          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-700'>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className='w-full border border-gray-300 rounded p-3 mt-1 outline-primary'
                placeholder='Your name'
                required
              />
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700'>Email</label>
              <input
                type='email'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className='w-full border border-gray-300 rounded p-3 mt-1 outline-primary'
                placeholder='you@example.com'
                required
              />
            </div>
          </div>

          <div className='mt-4'>
            <label className='text-sm font-medium text-gray-700'>Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className='w-full border border-gray-300 rounded p-3 mt-1 outline-primary'
              placeholder='Booking help, hotel registration, payment issue...'
            />
          </div>

          <div className='mt-4'>
            <label className='text-sm font-medium text-gray-700'>Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className='w-full border border-gray-300 rounded p-3 mt-1 outline-primary min-h-40 resize-y'
              placeholder='Write your message here'
              required
            />
          </div>

          <button
            disabled={loading}
            className='bg-primary text-white px-7 py-3 rounded mt-6 disabled:opacity-60'
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Contact
