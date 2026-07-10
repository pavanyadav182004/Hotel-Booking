// ─── Base URL ─────────────────────────────────────────────────────────────
// Reads from .env (VITE_API_URL) or falls back to the live Render backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hotel-booking-backend-java.onrender.com/api'



// ─── Core request helper ───────────────────────────────────────────────────
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Attempt JSON parse – fall back to a structured error object
  const data = await response.json().catch(() => {
    let message = 'Server did not return JSON'
    if (response.status === 401 || response.status === 403) {
      message = 'Session expired. Please login again.'
    } else if (response.status === 404) {
      message = 'API endpoint not found (404)'
    } else if (response.status >= 500) {
      message = 'Server error. Please try again later.'
    }
    return { success: false, message, data: null }
  })

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

// ─── Fetch available rooms for a hotel + date range ───────────────────────
// GET /api/rooms/available?hotelId=X&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
export async function fetchAvailableRooms(hotelId, checkIn, checkOut) {
  const params = new URLSearchParams({ hotelId, checkIn, checkOut })
  return apiRequest(`/rooms/available?${params}`)
}

// ─── Create a booking ─────────────────────────────────────────────────────
// POST /api/bookings  body: { hotelId, roomId, checkIn, checkOut, guests }
export async function createBooking(payload) {
  return apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ─── Confirm payment ──────────────────────────────────────────────────────
// POST /api/payments  body: { bookingId, razorpayOrderId }
export async function confirmPayment(bookingId, razorpayOrderId) {
  return apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify({ bookingId, razorpayOrderId }),
  })
}

// ─── Create Razorpay Order ────────────────────────────────────────────────
export async function createRazorpayOrder(bookingId) {
  return apiRequest(`/payments/create-order/${bookingId}`, {
    method: 'POST'
  })
}

// ─── Map a hotel API response → room card shape used across the UI ─────────
export function toRoomCard(hotel) {
  const defaultImg = '/src/assets/roomImg1.png'
  let images = hotel.images || []
  
  // Ensure we have at least 4 images for the UI layout
  if (images.length === 0) {
    images = [defaultImg, defaultImg, defaultImg, defaultImg]
  } else {
    while (images.length < 4) {
      images.push(images[0]) // Repeat the first image if fewer than 4
    }
  }

  return {
    _id:         hotel.id,
    hotelId:     hotel.id,
    hotel: {
      name:    hotel.name,
      city:    hotel.city,
      address: hotel.address,
    },
    images:       images,
    amenities:    hotel.amenities?.length ? hotel.amenities : ['Free Wi-Fi', 'Room Service'],
    roomType:     hotel.roomType || 'Luxury Room',
    pricePerNight: hotel.pricePerNight,
    isAvailable:  hotel.available !== false,
    description:  hotel.description,
    heading:      hotel.heading,
    rating:       hotel.rating,
    rooms:        hotel.rooms || [],
    policies:     hotel.policies,
    customDetails: hotel.customDetails,
  }
}

// ─── Fetch all reviews for homepage ───────────────────────────────────────
export async function fetchAllReviews() {
  return apiRequest('/reviews')
}

// ─── Fetch hotel specific reviews ─────────────────────────────────────────
export async function fetchHotelReviews(hotelId) {
  return apiRequest(`/reviews/hotel/${hotelId}`)
}
