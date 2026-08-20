import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getStatistics, autoConfirmAppointments, fixFutureCompletedAppointments, deleteOldAppointments } from '../../services/database'
import { formatPrice } from '../../utils/cn'
import { Calendar, Smile, DollarSign, Clock, XCircle, AlertCircle, PieChart } from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    // Delete old appointments from previous months
    deleteOldAppointments().catch(console.error)
    // Fix future appointments marked as completed
    fixFutureCompletedAppointments().catch(console.error)
    // Auto-confirm appointments every minute
    const interval = setInterval(async () => {
      try {
        await autoConfirmAppointments()
        await fixFutureCompletedAppointments()
        await loadStats()
      } catch (error) {
        console.error('Error in appointment management:', error)
      }
    }, 60000)

    // Auto-confirm and fix on initial load
    autoConfirmAppointments().catch(console.error)
    fixFutureCompletedAppointments().catch(console.error)

    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStatistics()
      console.log('Stats data:', data)
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
    { label: 'Completadas', value: stats?.completedAppointments || 0, icon: Clock, color: 'bg-purple-500' },
    { label: 'Canceladas', value: stats?.cancelledAppointments || 0, icon: XCircle, color: 'bg-red-500' },
    { label: 'Servicios', value: stats?.totalServices || 0, icon: Smile, color: 'bg-indigo-500' },
  ]

  const pieData = stats?.monthlyServicesDistribution?.map((item: any) => ({
    name: item.name,
    value: item.count,
    percentage: item.percentage
  })) || []

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

        {/* Pie Chart Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Servicios realizados este mes</p>
              <p className="text-lg font-bold text-gray-900">Distribución por servicio</p>
            </div>
          </div>
          
          {pieData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} citas`, '']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              No hay servicios realizados este mes
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
