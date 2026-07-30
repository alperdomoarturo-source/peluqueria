import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getStatistics } from '../../services/database'
import { formatPrice } from '../../utils/cn'
import { Calendar, Scissors, DollarSign, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStatistics()
      setStats(data)
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-600">Cargando estadísticas...</div>
      </AdminLayout>
    )
  }

  const statCards = [
    { label: 'Citas de hoy', value: stats?.todayAppointments || 0, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Pendientes', value: stats?.pendingAppointments || 0, icon: AlertCircle, color: 'bg-yellow-500' },
    { label: 'Confirmadas', value: stats?.confirmedAppointments || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Completadas', value: stats?.completedAppointments || 0, icon: Clock, color: 'bg-purple-500' },
    { label: 'Canceladas', value: stats?.cancelledAppointments || 0, icon: XCircle, color: 'bg-red-500' },
    { label: 'Servicios', value: stats?.totalServices || 0, icon: Scissors, color: 'bg-indigo-500' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Revenue Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos de hoy</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.todayRevenue || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos del mes</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.monthRevenue || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
