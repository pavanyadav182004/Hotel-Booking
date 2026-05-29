import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Title from '../Components/Title'
import assets from '../assets/assets'
import { apiRequest, confirmPayment } from '../api'

// Cancel booking API helper
async function cancelBookingApi(bookingId) {
  // PATCH or DELETE depending on backend, here PATCH is assumed
  return apiRequest(`/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
  })
}

import StarRatting from '../Components/StarRatting'
import PaymentModal from '../Components/PaymentModal'

const MyBooking = () => {
  const [bookings, setBookings] = useState([])
  const [message,  setMessage]  = useState('Loading bookings...')
  const [payingId, setPayingId] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [reviewingId, setReviewingId] = useState(null)
  const [reviewForms, setReviewForms] = useState({})

  const loadBookings = () => {
    apiRequest('/bookings/user')   // 🔥 FIX (yahi change hai)
      .then(res => {

        console.log("BOOKINGS:", res) // 🔥 DEBUG

        // 🔥 FIX (response handling)
        const raw = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : []

        const list = raw.map(b => ({
          id:           b.id,
          hotelName:    b.hotel?.name    || '—',
          hotelCity:    b.hotel?.city    || '',
          hotelAddress: b.hotel?.address || '',
          hotelImage:   b.hotel?.imageUrl || '/src/assets/roomImg1.png',
          roomType:     b.room?.type     || 'Room',
          roomPrice:    b.room?.price    || 0,
          guests:       b.guests         || 1,
          totalPrice:   b.totalPrice,
          checkIn:      b.checkIn,
          checkOut:     b.checkOut,
          status:       b.status,
          reviewed:     b.reviewed || false,
        }))

        setBookings(list)
        setMessage(list.length === 0 ? 'No bookings found.' : '')
      })
      .catch(err => setMessage(err.message || 'Please login to view bookings.'))
  }

  useEffect(() => { loadBookings() }, [])

  const handlePayClick = (booking) => {
    setSelectedBooking(booking)
    setShowPaymentModal(true)
  }

  const finalizeBooking = async (razorpayOrderId) => {
    if (!selectedBooking) return
    setPayingId(selectedBooking.id)
    try {
      await confirmPayment(selectedBooking.id, razorpayOrderId)
      toast.success('Payment successful! Booking confirmed. ✅')
      loadBookings()
    } catch (err) {
      toast.error(err.message || 'Payment failed.')
    } finally {
      setPayingId(null)
      setShowPaymentModal(false)
      setSelectedBooking(null)
    }
  }

  const updateReviewForm = (bookingId, patch) => {
    setReviewForms((prev) => ({
      ...prev,
      [bookingId]: {
        rating: 5,
        comment: '',
        ...(prev[bookingId] || {}),
        ...patch,
      },
    }))
  }

  const handleReview = async (bookingId) => {
    const form = reviewForms[bookingId] || { rating: 5, comment: '' }
    if (!form.comment.trim()) {
      toast.error('Please write a short review.')
      return
    }

    setReviewingId(bookingId)
    try {
      await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId,
          rating: Number(form.rating),
          comment: form.comment.trim(),
        }),
      })
      toast.success('Review submitted. Thank you!')
      setReviewForms((prev) => ({ ...prev, [bookingId]: { rating: 5, comment: '', open: false } }))
      loadBookings()
    } catch (err) {
      toast.error(err.message || 'Unable to submit review')
    } finally {
      setReviewingId(null)
    }
  }

  const statusChip = (status) => {
    const map = {
      CONFIRMED: 'bg-green-100 text-green-700',
      PENDING:   'bg-yellow-100 text-yellow-700',
      CANCELLED: 'bg-red-100  text-red-600',
      CHECKED_OUT: 'bg-purple-100 text-purple-700',
    }
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    )
  }

  // Cancel booking handler
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBookingApi(bookingId)
      toast.info('Your booking has been cancelled. Your payment will be refunded within 5 days.')
      loadBookings()
    } catch (err) {
      toast.error(err.message || 'Unable to cancel booking.')
    }
  }

  return (
    <div className="py-20 md:mb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <ToastContainer position="top-right" autoClose={4000} />

      <Title
        title="My Bookings"
        subTitle="Easily manage your past, current, and upcoming hotel reservations."
        align="left"
      />

      <div className="max-w-5xl mt-8 w-full text-gray-800">

        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr_1fr] w-full border-b border-gray-300
                        font-medium text-sm py-3 text-gray-500 uppercase tracking-wide">
          <div>Hotel / Room</div>
          <div>Dates</div>
          <div>Total</div>
          <div>Status</div>
        </div>

        {message && <p className="text-gray-500 py-8">{message}</p>}

        {bookings.map(b => {
          const nights = b.checkIn && b.checkOut
            ? Math.round((new Date(b.checkOut) - new Date(b.checkIn)) / 86_400_000)
            : 0

          return (
            <div key={b.id}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr_1fr]
                         w-full border-b border-gray-300 py-6 first:border-t gap-3">

              <div className="flex gap-4">
                <img className="w-24 h-20 rounded-lg shadow object-cover flex-shrink-0"
                  src={b.hotelImage} alt="hotel" />
                <div className="flex flex-col gap-1">
                  <p className="font-playfair text-xl font-semibold leading-tight">{b.hotelName}</p>
                  <p className="text-xs text-gray-400">{b.roomType}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <img src={assets.locationIcon} alt="loc" className="w-3.5" />
                    <span>{b.hotelAddress || b.hotelCity}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <img src={assets.guestsIcon} alt="guests" className="w-3.5" />
                    <span>{b.guests} guest(s)</span>
                  </div>
                  <p className="text-xs text-gray-400">Booking #{b.id}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1 justify-center text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Check-In</p>
                  <p className="font-medium">
                    {new Date(b.checkIn).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Check-Out</p>
                  <p className="font-medium">
                    {new Date(b.checkOut).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
                <p className="text-xs text-gray-400">{nights} night(s)</p>
              </div>

              <div className="flex items-center">
                <p className="text-base font-semibold">
                  ₹{b.totalPrice?.toLocaleString('en-IN')}
                </p>
              </div>


              <div className="flex flex-col gap-2 justify-center">
                {statusChip(b.status)}

                {b.status === 'PENDING' && (
                  <button
                    onClick={() => handlePayClick(b)}
                    disabled={payingId === b.id}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-60 mt-1">
                    {payingId === b.id ? 'Processing...' : '💳 Pay Now'}
                  </button>
                )}

                {b.status === 'CONFIRMED' && (
                  <>
                    {b.reviewed ? (
                      <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg text-center">
                        Reviewed
                      </span>
                    ) : (
                      <button
                        onClick={() => updateReviewForm(b.id, { open: !reviewForms[b.id]?.open })}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">
                        Give Review
                      </button>
                    )}
                    {/* Cancel Button for CONFIRMED bookings */}
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg mt-1">
                      Cancel Booking
                    </button>
                  </>
                )}
              </div>

              {b.status === 'CONFIRMED' && !b.reviewed && reviewForms[b.id]?.open && (
                <div className="md:col-span-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-800 mb-2">How was your stay at {b.hotelName}?</p>
                  <StarRatting
                    rating={reviewForms[b.id]?.rating || 5}
                    onChange={(rating) => updateReviewForm(b.id, { rating })}
                  />
                  <textarea
                    value={reviewForms[b.id]?.comment || ''}
                    onChange={(e) => updateReviewForm(b.id, { comment: e.target.value })}
                    className="w-full border border-gray-300 rounded p-2 mt-3 text-sm"
                    rows="3"
                    placeholder="Write your hotel review"
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleReview(b.id)}
                      disabled={reviewingId === b.id}
                      className="bg-primary text-white px-4 py-2 rounded text-sm disabled:opacity-60">
                      {reviewingId === b.id ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button
                      onClick={() => updateReviewForm(b.id, { open: false })}
                      className="bg-gray-500 text-white px-4 py-2 rounded text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={finalizeBooking}
        amount={selectedBooking?.totalPrice || 0}
        hotelName={selectedBooking?.hotelName || "Hotel"}
        bookingId={selectedBooking?.id}
      />
      </div>
    </div>
  )
}

export default MyBooking
