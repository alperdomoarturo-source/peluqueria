import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getServices, getWorkersByService, createWorker, deleteWorker } from '../../services/database'
import { Service, Worker } from '../../types'
import { Users, Plus, Trash2, Edit2, Scissors } from 'lucide-react'

export default function AdminWorkers() {
  const [services, setServices] = useState<Service[]>([])
  const [workers, setWorkers] = useState<Record<string, Worker[]>>({})
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<string | null>(null)
  const [newWorkerName, setNewWorkerName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const servicesData = await getServices()
      setServices(servicesData)

      const workersData: Record<string, Worker[]> = {}
      for (const service of servicesData) {
        const serviceWorkers = await getWorkersByService(service.id)
        workersData[service.id] = serviceWorkers
      }
      setWorkers(workersData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWorker = async (serviceId: string) => {
    if (!newWorkerName.trim()) return

    try {
      await createWorker({ name: newWorkerName.trim(), service_id: serviceId })
      setNewWorkerName('')
      await loadData()
    } catch (error) {
      console.error('Error adding worker:', error)
      alert('Error al agregar trabajador')
    }
  }

  const handleDeleteWorker = async (workerId: string) => {
    if (!confirm('¿Estás seguro de eliminar este trabajador?')) return

    try {
      await deleteWorker(workerId)
      await loadData()
    } catch (error) {
      console.error('Error deleting worker:', error)
      alert('Error al eliminar trabajador')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-600">Cargando trabajadores...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Trabajadores</h1>

        <div className="grid grid-cols-1 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Scissors className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingService(editingService === service.id ? null : service.id)
                    setNewWorkerName('')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Trabajadores asignados: {workers[service.id]?.length || 0}</span>
                </div>

                {workers[service.id] && workers[service.id].length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {workers[service.id].map((worker) => (
                      <div
                        key={worker.id}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700">{worker.name}</span>
                        <button
                          onClick={() => handleDeleteWorker(worker.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-2">No hay trabajadores asignados</p>
                )}

                {editingService === service.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre del trabajador"
                        value={newWorkerName}
                        onChange={(e) => setNewWorkerName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleAddWorker(service.id)
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleAddWorker(service.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay servicios disponibles. Primero crea servicios en la sección de Servicios.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
