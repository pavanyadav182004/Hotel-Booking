import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Title from '../../Components/Title'
import { fetchOffers, createOffer, updateOffer, deleteOffer } from '../../api'

const ManageOffers = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceOff: 0,
    expiryDate: '',
    image: ''
  })

  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    try {
      const res = await fetchOffers()
      setOffers(res.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load offers')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 800
        const scale = Math.min(1, maxWidth / image.width)
        canvas.width = image.width * scale
        canvas.height = image.height * scale
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        setFormData({ ...formData, image: compressed })
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.image) {
      toast.error('Please fill all required fields and upload an image')
      return
    }
    setLoading(true)
    try {
      if (editingId) {
        await updateOffer(editingId, formData)
        toast.success('Offer updated successfully')
      } else {
        await createOffer(formData)
        toast.success('Offer added successfully')
      }
      setEditingId(null)
      setFormData({ title: '', description: '', priceOff: 0, expiryDate: '', image: '' })
      loadOffers()
    } catch (err) {
      toast.error(err.message || 'Failed to save offer')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (offer) => {
    setEditingId(offer.id)
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      priceOff: offer.priceOff || 0,
      expiryDate: offer.expiryDate || '',
      image: offer.image || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return
    try {
      await deleteOffer(id)
      toast.success('Offer deleted successfully')
      loadOffers()
    } catch (err) {
      toast.error(err.message || 'Failed to delete offer')
    }
  }

  return (
    <div>
      <Title align='left' font='outfit' title='Manage Offers' subTitle='Add, edit, or remove exclusive offers for the homepage.' />

      <form onSubmit={handleSubmit} className='mt-8 max-w-3xl bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
        <h3 className='text-lg font-semibold mb-4'>{editingId ? 'Edit Offer' : 'Add New Offer'}</h3>
        <div className='grid sm:grid-cols-2 gap-4'>
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Offer Title *</label>
            <input className='border border-gray-300 rounded-lg p-2.5'
              value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder='e.g. Summer Escape Package' required />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Discount Percentage (%)</label>
            <input type='number' min='0' max='100' className='border border-gray-300 rounded-lg p-2.5'
              value={formData.priceOff} onChange={e => setFormData({ ...formData, priceOff: Number(e.target.value) })}
              placeholder='e.g. 25' />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Expiry Date/Text</label>
            <input className='border border-gray-300 rounded-lg p-2.5'
              value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              placeholder='e.g. Aug 31' />
          </div>

          <div className='sm:col-span-2 flex flex-col gap-1'>
            <label className='text-sm font-medium text-gray-700'>Description *</label>
            <textarea rows={2} className='border border-gray-300 rounded-lg p-2.5'
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder='e.g. Enjoy a complimentary night and daily breakfast' required />
          </div>

          <div className='sm:col-span-2 flex flex-col gap-1 border-t pt-4 mt-2'>
            <label className='text-sm font-medium text-gray-700'>Offer Background Image *</label>
            <input type='file' accept='image/*' className='text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              onChange={handleImageUpload} />
            {formData.image && <img src={formData.image} alt='preview' className='h-32 w-48 object-cover mt-3 rounded-lg shadow-sm border border-gray-200' />}
          </div>
        </div>

        <div className='flex gap-3 mt-6'>
          <button type='submit' disabled={loading} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all'>
            {loading ? 'Saving...' : (editingId ? 'Update Offer' : 'Add Offer')}
          </button>
          {editingId && (
            <button type='button' onClick={() => { setEditingId(null); setFormData({ title: '', description: '', priceOff: 0, expiryDate: '', image: '' }) }}
              className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all'>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className='mt-12'>
        <h3 className='text-lg font-semibold mb-4'>Existing Offers</h3>
        {offers.length === 0 ? (
          <p className='text-gray-500'>No offers found. Add some above.</p>
        ) : (
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {offers.map(offer => (
              <div key={offer.id} className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col'>
                <div className='h-32 bg-cover bg-center' style={{ backgroundImage: `url(${offer.image})` }} />
                <div className='p-4 flex flex-col flex-1'>
                  <div className='flex justify-between items-start'>
                    <h4 className='font-bold text-gray-800 line-clamp-1'>{offer.title}</h4>
                    <span className='bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded'>{offer.priceOff}% OFF</span>
                  </div>
                  <p className='text-sm text-gray-500 mt-1 line-clamp-2'>{offer.description}</p>
                  <p className='text-xs text-gray-400 mt-2 font-medium'>Expires: {offer.expiryDate}</p>
                  
                  <div className='mt-auto pt-4 flex gap-2'>
                    <button onClick={() => handleEdit(offer)} className='text-sm text-blue-600 font-medium hover:underline'>Edit</button>
                    <button onClick={() => handleDelete(offer.id)} className='text-sm text-red-500 font-medium hover:underline'>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageOffers
