import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Booking from './pages/Booking'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminServices from './pages/admin/AdminServices'
import AdminSchedules from './pages/admin/AdminSchedules'
import { isAuthenticated } from './utils/auth'

function DebugLocation() {
  const location = useLocation()
  console.log('Current location:', location.pathname)
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'yellow',
      color: 'black',
      padding: '10px',
      zIndex: 9999,
      textAlign: 'center',
      fontSize: '14px'
    }}>
      Ruta actual: {location.pathname}
    </div>
  )
}

function App() {
  return (
    <Router>
      <DebugLocation />
      <Routes>
        {/* Client routes */}
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />

        {/* Admin routes */}
        <Route path="/admin" element={!isAuthenticated() ? <AdminLogin /> : <Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={isAuthenticated() ? <AdminDashboard /> : <Navigate to="/admin" />} />
        <Route path="/admin/appointments" element={isAuthenticated() ? <AdminAppointments /> : <Navigate to="/admin" />} />
        <Route path="/admin/services" element={isAuthenticated() ? <AdminServices /> : <Navigate to="/admin" />} />
        <Route path="/admin/schedules" element={isAuthenticated() ? <AdminSchedules /> : <Navigate to="/admin" />} />
      </Routes>
    </Router>
  )
}

export default App
