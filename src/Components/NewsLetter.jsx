import React, { useState } from 'react'
import { assets } from '../assets/assets'
import Title from './Title';
import { apiRequest } from '../api';
const NewsLetter = () => {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const subscribe = async (e) => {
        e.preventDefault()
        setMessage('')
        try {
            await apiRequest('/contact', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    subject: 'Newsletter subscription',
                    message: 'Please send me hotel booking offers and updates.',
                }),
            })
            setEmail('')
            setMessage('Subscribed successfully. We received your email.')
        } catch (err) {
            setMessage(err.message || 'Unable to subscribe')
        }
    }

    return (

        <div className="flex flex-col items-center max-w-5xl lg:w-full rounded-2xl px-4 py-12 md:py-16 mx-4 lg:mx-auto my-16 md:my-30 bg-gray-900 text-white">

<Title title='Stay Inspired' subTitle='Join our newsletter and be thr first to discover new destinations, exclusive offers, and travel inspiration.' />
            <form onSubmit={subscribe} className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 w-full">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 px-4 py-2.5 border border-white/20 rounded outline-none w-full md:max-w-66" placeholder="Enter your email" required />
                <button className="flex items-center justify-center gap-2 group bg-black px-4 md:px-7 py-2.5 rounded active:scale-95 transition-all w-full md:w-auto">Subscribe
                    <img src={assets.arrowIcon} alt="arrow-icon" className='w-3.5 invert group-hover:translate-x-1 transition-all' />
                </button>
            </form>
            {message && <p className="text-gray-300 mt-4 text-sm text-center">{message}</p>}
            <p className="text-gray-500 mt-6 text-xs text-center">By subscribing, you agree to our Privacy Policy and consent to receive updates.</p>
        </div>

    )
}

export default NewsLetter;
