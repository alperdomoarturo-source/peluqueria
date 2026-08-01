import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getAppointments, updateAppointment, deleteAppointment } from '../../services/database'
import { Appointment, AppointmentStatus } from '../../types'
import { formatPrice, formatDate, formatTime } from '../../utils/cn'
import { Search, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Eye } from 'lucide-react'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, dateFilter])

  const loadAppointments = async () => {
    try {
      const data = await getAppointments()
      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.client_phone.includes(searchTerm)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    if (dateFilter) {
      filtered = filtered.filter((apt) => apt.date === dateFilter)
    }

    setFilteredAppointments(filtered)
  }

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateAppointment(id, { status })
      await loadAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta cita?')) return
    
    try {
      await deleteAppointment(id)
      await loadAppointments()
    } catch (error) {
      console.error('Error deleting appointment:', error)
    }
  }

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'completed':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'confirmed':
        return 'Confirmada'
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
    }
  }

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-600">Cargando citas...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No hay citas que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.client_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.client_phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.service_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(appointment.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(appointment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(appointment.time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowDetails(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <select
                            value={appointment.status}
                            onChange={(e) => handleStatusChange(appointment.id, e.target.value as AppointmentStatus)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetails && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles de la Cita</h2>
              <div className="space-y-3">
                <p><strong>Cliente:</strong> {selectedAppointment.client_name}</p>
                <p><strong>Teléfono:</strong> {selectedAppointment.client_phone}</p>
                <p><strong>Servicio:</strong> {selectedAppointment.service_name}</p>
                <p><strong>Precio:</strong> {formatPrice(selectedAppointment.price)}</p>
                <p><strong>Fecha:</strong> {formatDate(selectedAppointment.date)}</p>
                <p><strong>Hora:</strong> {formatTime(selectedAppointment.time)}</p>
                <p><strong>Duración:</strong> {selectedAppointment.duration} minutos</p>
                <p><strong>Estado:</strong> {getStatusLabel(selectedAppointment.status)}</p>
                <p><strong>Código:</strong> {selectedAppointment.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="mt-6 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
