import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import assets, { facilityIcons, roomCommonData } from '../assets/assets'
import StarRatting from '../Components/StarRatting'
import { apiRequest, toRoomCard, fetchAvailableRooms, createBooking, confirmPayment, createRazorpayOrder, fetchHotelReviews } from '../api'
import PaymentModal from '../Components/PaymentModal'
import Testimonial from '../Components/Testimonial'

// ─── Step indicator ───────────────────────────────────────────────────────
const Step = ({ num, label, active, done }) => (
  <div className={`flex items-center gap-2 text-sm font-medium
    ${done ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-400'}`}>
    <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs
      ${done ? 'bg-green-600 border-green-600 text-white'
             : active ? 'bg-blue-600 border-blue-600 text-white'
             : 'border-gray-300'}`}>
      {done ? '✓' : num}
    </span>
    {label}
  </div>
)

const RoomDetails = () => {
  const { id } = useParams()          // hotel id
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // ── hotel data ─────────────────────────────────────────────────
  const [hotel, setHotel] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [pageError, setPageError] = useState('')
  const [hotelReviews, setHotelReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)

  // ── booking state ──────────────────────────────────────────────
  const [checkIn,  setCheckIn]  = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [guests,   setGuests]   = useState(searchParams.get('guests') || 1)

  // ── availability ───────────────────────────────────────────────
  const [availableRooms, setAvailableRooms] = useState([])
  const [selectedRoom,   setSelectedRoom]   = useState(null)
  const [availChecked,   setAvailChecked]   = useState(false)
  const [availLoading,   setAvailLoading]   = useState(false)

  // ── booking / payment ──────────────────────────────────────────
  const [step,           setStep]           = useState(1)   // 1=dates, 2=rooms, 3=payment
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingId,      setBookingId]      = useState(null)
  const [payLoading,     setPayLoading]     = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // ── load hotel & reviews ───────────────────────────────────────
  useEffect(() => {
    if (!/^\d+$/.test(String(id).trim())) {
      setPageError('Invalid hotel link. Please open from the Hotels page.')
      return
    }
    
    // Fetch hotel details
    apiRequest(`/hotels/${id}`)
      .then(res => {
        const h = toRoomCard(res.data)
        setHotel(h)
        setMainImage(h.images[0])
        setAverageRating(h.rating || 0) // Default to hotel rating if no reviews
      })
      .catch(err => setPageError(err.message || 'Hotel not found'))
      
    // Fetch hotel reviews
    fetchHotelReviews(id)
      .then(res => {
        const revs = res.data || []
        setHotelReviews(revs)
        if (revs.length > 0) {
          const sum = revs.reduce((acc, curr) => acc + curr.rating, 0)
          setAverageRating(sum / revs.length)
        }
      })
      .catch(console.error)
  }, [id])

  // ── today string for min date attr ─────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0]

  // ── date validation helper ─────────────────────────────────────
  const validateDates = () => {
    if (!checkIn || !checkOut) {
      toast.error('Please select both check-in and check-out dates.')
      return false
    }
    const ci = new Date(checkIn)
    const co = new Date(checkOut)
    if (ci < new Date(todayStr)) {
      toast.error('Check-in date cannot be in the past.')
      return false
    }
    if (co <= ci) {
      toast.error('Check-out must be after check-in.')
      return false
    }
    return true
  }

  // ── check available rooms ──────────────────────────────────────
  const handleCheckAvailability = async () => {
    if (!validateDates()) return
    setAvailLoading(true)
    setAvailChecked(false)
    setSelectedRoom(null)
    try {
      const res = await fetchAvailableRooms(id, checkIn, checkOut)
      setAvailableRooms(res.data || [])
      setAvailChecked(true)
      setStep(2)
      if (!res.data?.length) {
        toast.info('No rooms available for the selected dates. Try different dates.')
      } else {
        toast.success(`${res.data.length} room(s) available!`)
      }
    } catch (err) {
      toast.error(err.message || 'Could not check availability.')
    } finally {
      setAvailLoading(false)
    }
  }

  // ── create booking ─────────────────────────────────────────────
  const handleBook = async () => {
    if (!localStorage.getItem('token')) {
      toast.error('Please login first to book a room.')
      navigate('/login')
      return
    }
    if (!selectedRoom) {
      toast.error('Please select a room first.')
      return
    }
    if (!validateDates()) return

    setBookingLoading(true)
    try {
      const res = await createBooking({
        hotelId:  Number(id),
        roomId:   selectedRoom.id,
        checkIn,
        checkOut,
        guests:   Number(guests),
      })
      const bid = res.data?.id
      setBookingId(bid)
      setStep(3)
      toast.success(`Booking created! ID: ${bid} — Total: ₹${res.data?.totalPrice}`)
    } catch (err) {
      if (err.message?.toLowerCase().includes('session') ||
          err.message?.toLowerCase().includes('login')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
      toast.error(err.message || 'Booking failed. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  // ── confirm payment ────────────────────────────────────────────
  const handlePay = async () => {
    if (!bookingId) return
    setShowPaymentModal(true)
  }

  const finalizeBooking = async (razorpayOrderId) => {
    setPayLoading(true)
    try {
      await confirmPayment(bookingId, razorpayOrderId)
      toast.success('Payment successful! Booking confirmed. ✅')
      setTimeout(() => navigate('/my-bookings'), 2000)
    } catch (err) {
      toast.error(err.message || 'Payment confirmation failed.')
    } finally {
      setPayLoading(false)
      setShowPaymentModal(false)
    }
  }

  const calculateTotal = () => {
    if (!selectedRoom || nights <= 0) return 0
    return selectedRoom.price * nights
  }

  // ── early returns ──────────────────────────────────────────────
  if (pageError) return (
    <p className="text-center mt-32 text-red-500 text-lg">{pageError}</p>
  )
  if (!hotel) return (
    <p className="text-center mt-32 text-gray-500 animate-pulse">Loading hotel...</p>
  )

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000))
    : 0
  return (
    <div className="py-28 md:py-30 px-4 md:px-16 lg:px-24 xl:px-32">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* ── Hotel header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <h1 className="text-3xl md:text-4xl font-playfair">
          {hotel.hotel.name}
          <span className="font-inter text-sm ml-2 text-gray-500">({hotel.roomType})</span>
        </h1>
        <span className={`text-xs py-1.5 px-3 rounded-full font-medium
          ${hotel.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {hotel.isAvailable ? '✔ Available' : '✖ Not Available'}
        </span>
      </div>

      {/* ── Rating ── */}
      <div className="flex items-center gap-1 mt-2">
        <StarRatting rating={averageRating} />
        <p className="ml-2 text-sm text-gray-500">
          {hotelReviews.length > 0 ? `${hotelReviews.length} reviews` : 'No reviews yet'}
        </p>
      </div>

      {/* ── Address ── */}
      <div className="flex items-center gap-1 text-gray-500 mt-2">
        <img src={assets.locationFilledIcon} alt="location" className="w-4" />
        <span>{hotel.hotel.address}</span>
      </div>

      {/* ── Image gallery ── */}
      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        <div className="lg:w-1/2 w-full">
          <img className="w-full rounded-xl shadow-lg object-cover max-h-96"
            src={mainImage} alt="hotel" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
          {hotel.images.map((img, i) => (
            <img key={i}
              className={`w-full rounded-xl shadow-md object-cover cursor-pointer max-h-44
                ${mainImage === img ? 'outline outline-2 outline-orange-500' : ''}`}
              onClick={() => setMainImage(img)}
              src={img} alt="hotel view" />
          ))}
        </div>
      </div>

      {/* ── Amenities + price ── */}
      <div className="flex flex-col md:flex-row md:justify-between mt-10">
        <div className="flex flex-col">
          <h2 className="text-3xl md:text-4xl font-playfair">{hotel.heading || 'Experience Luxury Like Never Before'}</h2>
          {hotel.description && (
            <p className="text-gray-600 mt-3 leading-relaxed text-base max-w-3xl" dangerouslySetInnerHTML={{
              __html: (hotel.description || '')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br/>')
            }} />
          )}
          <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
            {hotel.amenities.map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                <img className="w-5 h-5" src={facilityIcons[item] || assets.locationIcon} alt={item} />
                <p className="text-xs">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-2xl font-medium self-start md:self-center">
          ₹{hotel.pricePerNight}<span className="text-base text-gray-500">/night</span>
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════
          BOOKING WORKFLOW — 3 steps
          ════════════════════════════════════════════════════════ */}
      <div className="mt-16 bg-white shadow-[0px_0px_24px_rgba(0,0,0,0.1)] p-6 rounded-2xl max-w-4xl mx-auto">

        {/* 🔥 Hotel Not Available — Block Booking */}
        {!hotel.isAvailable ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🚫</div>
            <h3 className="text-2xl font-semibold text-red-600">Hotel Not Available</h3>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">
              This hotel is currently not available for booking. 
              Please check back later or explore other hotels.
            </p>
            <button 
              onClick={() => navigate('/rooms')}
              className="mt-6 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all
                text-white rounded-xl px-8 py-3 font-semibold text-base">
              🔍 Browse Other Hotels
            </button>
          </div>
        ) : (
          <>
        {/* Step bar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 mb-8">
          <Step num={1} label="Select Dates"   active={step === 1} done={step > 1} />
          <div className="hidden sm:block flex-1 h-px bg-gray-200" />
          <Step num={2} label="Choose Room"    active={step === 2} done={step > 2} />
          <div className="hidden sm:block flex-1 h-px bg-gray-200" />
          <Step num={3} label="Confirm & Pay"  active={step === 3} done={false} />
        </div>

        {/* ── STEP 1: Date + guests ── */}
        {step === 1 && (
          <div className="w-full">
            <div className="flex flex-wrap items-end gap-4 w-full">
              <div className="flex flex-col flex-1 min-w-[140px]">
                <label className="text-sm font-medium text-gray-700 mb-1">Check-In</label>
                <input type="date" min={todayStr} value={checkIn}
                  onChange={e => { setCheckIn(e.target.value); setAvailChecked(false) }}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-400 w-full transition-all" />
              </div>
              <div className="flex flex-col flex-1 min-w-[140px]">
                <label className="text-sm font-medium text-gray-700 mb-1">Check-Out</label>
                <input type="date" min={checkIn || todayStr} value={checkOut}
                  onChange={e => { setCheckOut(e.target.value); setAvailChecked(false) }}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-400 w-full transition-all" />
              </div>
              <div className="flex flex-col min-w-[100px] flex-[0.5]">
                <label className="text-sm font-medium text-gray-700 mb-1">Guests</label>
                <input type="number" min="1" max="10" value={guests}
                  onChange={e => setGuests(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-400 w-full transition-all" />
              </div>
              <button onClick={handleCheckAvailability} disabled={availLoading}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm
                  text-white rounded-lg px-8 py-2.5 font-semibold disabled:opacity-60 whitespace-nowrap h-[46px] flex items-center justify-center flex-1 md:flex-initial min-w-[160px]">
                {availLoading ? 'Checking...' : '🔍 Check Availability'}
              </button>
            </div>
          </div>
        )}

        {/* Date summary (steps 2 & 3) */}
        {step > 1 && (
          <div className="flex flex-wrap gap-6 mb-4 text-sm text-gray-600 bg-blue-50 rounded-xl p-3">
            <span>📅 <strong>Check-In:</strong> {checkIn}</span>
            <span>📅 <strong>Check-Out:</strong> {checkOut}</span>
            <span>👥 <strong>Guests:</strong> {guests}</span>
            {nights > 0 && <span>🌙 <strong>Nights:</strong> {nights}</span>}
            <button onClick={() => { setStep(1); setAvailChecked(false); setSelectedRoom(null); setBookingId(null) }}
              className="text-blue-600 hover:underline ml-auto text-xs">Change dates</button>
          </div>
        )}

        {/* ── STEP 2: Room selection ── */}
        {step === 2 && availChecked && (
          <div>
            {availableRooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-red-500 font-medium">No rooms available for these dates.</p>
                <p className="text-gray-400 text-sm mt-1">Please try different dates.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {availableRooms.length} room(s) available — select one to book:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
                  {availableRooms.map(room => {
                    const isSelected = selectedRoom?.id === room.id
                    return (
                      <div key={room.id} onClick={() => setSelectedRoom(room)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all
                          ${isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {room.type || 'Standard Room'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Max guests: {room.personCount || '—'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-700">₹{room.price}</p>
                            <p className="text-xs text-gray-400">/night</p>
                          </div>
                        </div>
                        {nights > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Total for {nights} night(s): <strong>₹{room.price * nights}</strong>
                          </p>
                        )}
                        {isSelected && (
                          <p className="mt-2 text-xs text-blue-600 font-medium">✔ Selected</p>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
                  <button
                    onClick={() => { setStep(1); setAvailChecked(false); setSelectedRoom(null); setBookingId(null); }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl px-8 py-3 font-semibold text-base transition-all"
                  >
                    Cancel
                  </button>
                  <button onClick={handleBook}
                    disabled={!selectedRoom || bookingLoading}
                    className="bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all
                      text-white rounded-xl px-8 py-3 font-semibold text-base
                      disabled:opacity-50 disabled:cursor-not-allowed">
                    {bookingLoading ? 'Creating Booking...' : '📋 Book Now'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 3: Payment confirmation ── */}
        {step === 3 && bookingId && (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-800">Booking Created!</h3>
            <p className="text-gray-500 mt-1 mb-2">Booking ID: <strong>#{bookingId}</strong></p>
            {selectedRoom && nights > 0 && (
              <p className="text-gray-600 mb-4">
                Total amount: <strong>₹{selectedRoom.price * nights}</strong>
                <span className="text-sm text-gray-400 ml-1">({nights} night(s))</span>
              </p>
            )}
            <p className="text-sm text-gray-400 mb-6">
              Your booking is <span className="text-yellow-600 font-medium">PENDING</span>.
              Complete payment to confirm your stay.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => { setStep(2); setShowPaymentModal(false); setBookingId(null); }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl px-8 py-3 font-semibold text-base transition-all"
              >
                Cancel
              </button>
              <button onClick={handlePay} disabled={payLoading}
                className="bg-green-600 hover:bg-green-700 active:scale-95 transition-all
                  text-white rounded-xl px-10 py-3 font-semibold text-base
                  disabled:opacity-60">
                {payLoading ? 'Processing...' : '💳 Pay Now & Confirm'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              You will be redirected to My Bookings after payment.
            </p>
          </div>
        )}
          </>
        )}
      </div>

      {/* ── Common specs ── */}
      <div className="mt-20 space-y-4">
        {roomCommonData.map((spec, i) => (
          <div key={i} className="flex items-start gap-2">
            <img src={spec.icon} alt={spec.title} className="w-6" />
            <div>
              <p className="text-base font-medium">{spec.title}</p>
              <p className="text-gray-500 text-sm">{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Description ── */}
      <p className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
        Guests will be allocated on the ground floor according to availability.
        You get a comfortable apartment with a true city feeling.
        The price quoted is per room per night. Adjust the guests field for group pricing.
      </p>

      {/* ── Dynamic Policies ── */}
      {(() => {
        try {
          const raw = hotel?.policies
          if (!raw) return null
          const list = JSON.parse(raw)
          if (!Array.isArray(list) || list.length === 0) return null
          return (
            <div className="max-w-3xl mb-16">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hotel Policies & Important Information</h2>
              <div className="space-y-5 text-sm text-gray-700">
                {list.map((policy, idx) => (
                  <div key={idx}>
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      {idx + 1}. {policy.heading}
                    </h3>
                    <p className="leading-relaxed" dangerouslySetInnerHTML={{
                      __html: (policy.description || '')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                ))}
              </div>
            </div>
          )
        } catch { return null }
      })()}

      {/* ── Dynamic Custom Details ── */}
      {(() => {
        try {
          const raw = hotel?.customDetails
          if (!raw) return null
          const list = JSON.parse(raw)
          if (!Array.isArray(list) || list.length === 0) return null
          return (
            <div className="max-w-3xl mb-16 border-t pt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Additional Hotel Details</h2>
              <div className="space-y-6 text-sm text-gray-700">
                {list.map((detail, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                    {detail.heading && (
                      <h3 className="text-base font-bold text-gray-800 mb-2">
                        {detail.heading}
                      </h3>
                    )}
                    {detail.description && (
                      <p className="leading-relaxed" dangerouslySetInnerHTML={{
                        __html: detail.description
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br/>')
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        } catch { return null }
      })()}

      <div className="mt-16 mb-20">
        <Testimonial hotelId={id} preloadedReviews={hotelReviews} />
      </div>

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={finalizeBooking}
        amount={calculateTotal()}
        hotelName={hotel?.hotel?.name || "Hotel"}
        bookingId={bookingId}
      />
    </div>
  )
}

export default RoomDetails
