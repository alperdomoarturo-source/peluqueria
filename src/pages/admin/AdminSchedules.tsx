import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getSchedules, updateSchedule, getBlocks, createBlock, deleteBlock } from '../../services/database'
import { Schedule, Block } from '../../types'
import { formatTime } from '../../utils/cn'
import { Plus, Trash2, Calendar, Clock, X } from 'lucide-react'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockFormData, setBlockFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    reason: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [schedulesData, blocksData] = await Promise.all([
        getSchedules(),
        getBlocks(),
      ])
      setSchedules(schedulesData)
      setBlocks(blocksData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleUpdate = async (id: string, updates: Partial<Schedule>) => {
    try {
      await updateSchedule(id, updates)
      await loadData()
    } catch (error) {
      console.error('Error updating schedule:', error)
    }
  }

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createBlock({
        date: blockFormData.date,
        start_time: blockFormData.start_time,
        end_time: blockFormData.end_time,
        reason: blockFormData.reason,
        is_active: true,
      })
      await loadData()
      setShowBlockModal(false)
      setBlockFormData({ date: '', start_time: '', end_time: '', reason: '' })
    } catch (error) {
      console.error('Error creating block:', error)
    }
  }

  const handleBlockDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este bloqueo?')) return
    
    try {
      await deleteBlock(id)
      await loadData()
    } catch (error) {
      console.error('Error deleting block:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-600">Cargando horarios...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Horarios</h1>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horario Semanal
          </h2>
          <div className="space-y-4">
            {DAYS.map((day, index) => {
              const schedule = schedules.find(s => s.day_of_week === index)
              return (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-32 font-medium text-gray-900">{day}</div>
                  {schedule ? (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={schedule.start_time}
                          onChange={(e) => handleScheduleUpdate(schedule.id, { start_time: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={schedule.end_time}
                          onChange={(e) => handleScheduleUpdate(schedule.id, { end_time: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Intervalo:</label>
                        <select
                          value={schedule.interval}
                          onChange={(e) => handleScheduleUpdate(schedule.id, { interval: parseInt(e.target.value) })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">60 min</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schedule.is_active}
                          onChange={(e) => handleScheduleUpdate(schedule.id, { is_active: e.target.checked })}
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600">Activo</span>
                      </label>
                    </>
                  ) : (
                    <span className="text-gray-500">No configurado</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Blocked Dates/Times */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fechas y Horarios Bloqueados
            </h2>
            <button
              onClick={() => setShowBlockModal(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Agregar Bloqueo
            </button>
          </div>

          {blocks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay bloqueos configurados</p>
          ) : (
            <div className="space-y-3">
              {blocks.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(block.date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(block.start_time)} - {formatTime(block.end_time)}
                    </p>
                    {block.reason && (
                      <p className="text-sm text-gray-500 mt-1">Motivo: {block.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleBlockDelete(block.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    title="Eliminar bloqueo"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Block Modal */}
        {showBlockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Agregar Bloqueo</h2>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleBlockSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={blockFormData.date}
                    onChange={(e) => setBlockFormData({ ...blockFormData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora inicio *
                    </label>
                    <input
                      type="time"
                      value={blockFormData.start_time}
                      onChange={(e) => setBlockFormData({ ...blockFormData, start_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora fin *
                    </label>
                    <input
                      type="time"
                      value={blockFormData.end_time}
                      onChange={(e) => setBlockFormData({ ...blockFormData, end_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={blockFormData.reason}
                    onChange={(e) => setBlockFormData({ ...blockFormData, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Vacaciones, mantenimiento..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
