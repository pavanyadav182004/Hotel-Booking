export function saveLogin(data) {
  const user = data.user || {}
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify({
    id: user.id,
    name: user.name,
    uname: user.name,
    email: user.email,
    uemail: user.email,
    imageUrl: user.imageUrl,
    role: String(user.role || 'USER').toUpperCase(),
    mobileNo: user.mobileNo || '',
    address: user.address || '',
    gender: user.gender || ''
  }))
  window.dispatchEvent(new Event('auth-changed'))
}

export function getUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('auth-changed'))
}

export function updateUserImage(imageUrl) {
  const user = getUser()
  if (user) {
    user.imageUrl = imageUrl
    localStorage.setItem('user', JSON.stringify(user))
    window.dispatchEvent(new Event('auth-changed'))
  }
}
