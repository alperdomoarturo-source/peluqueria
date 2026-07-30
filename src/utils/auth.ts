export const setAdminSession = (admin: any) => {
  sessionStorage.setItem('admin', JSON.stringify(admin))
}

export const getAdminSession = () => {
  const admin = sessionStorage.getItem('admin')
  return admin ? JSON.parse(admin) : null
}

export const clearAdminSession = () => {
  sessionStorage.removeItem('admin')
}

export const isAuthenticated = () => {
  return !!sessionStorage.getItem('admin')
}
