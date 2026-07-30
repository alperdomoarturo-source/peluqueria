import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Booking from './pages/Booking'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminServices from './pages/admin/AdminServices'
import AdminSchedules from './pages/admin/AdminSchedules'
import { isAuthenticated } from './utils/auth'

function App() {
  return (
    <Router>
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
