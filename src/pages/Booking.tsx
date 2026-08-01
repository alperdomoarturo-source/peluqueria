import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { getServices, getAvailableSlots, createAppointment } from '../services/database'
import { Service } from '../types'
import { formatPrice, formatDate, formatTime } from '../utils/cn'

type BookingStep = 'service' | 'info' | 'datetime' | 'confirm'

export default function Booking() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [step, setStep] = useState<BookingStep>('service')
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  })
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  useEffect(() => {
    loadServices()
    const serviceId = searchParams.get('service')
    if (serviceId) {
      loadServiceById(serviceId)
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadAvailableSlots()
    }
  }, [selectedDate, selectedService])

  const loadServices = async () => {
    try {
      const data = await getServices()
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  const loadServiceById = async (id: string) => {
    try {
      const data = await getServices()
      const service = data.find(s => s.id === id)
      if (service) {
        setSelectedService(service)
      }
    } catch (error) {
      console.error('Error loading service:', error)
    }
  }

  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedService) return
    
    setLoading(true)
    setDebugLogs([])
    
    // Override console.log to capture logs
    const originalLog = console.log
    const logs: string[] = []
    console.log = (...args) => {
      logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '))
      originalLog(...args)
    }
    
    try {
      const slots = await getAvailableSlots(selectedDate, selectedService.duration, selectedService.id)
      setAvailableSlots(slots)
      setDebugLogs(logs)
    } catch (error) {
      console.error('Error loading slots:', error)
      setAvailableSlots([])
      setDebugLogs(logs)
    } finally {
      console.log = originalLog
      setLoading(false)
    }
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep('info')
  }

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      setError('Por favor completa todos los campos requeridos')
      return
    }
    setStep('datetime')
  }

  const handleBookingConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !formData.name || !formData.phone) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const appointment = await createAppointment({
        client_id: null,
        client_name: formData.name,
        client_phone: formData.phone,
        service_id: selectedService.id,
        service_name: selectedService.name,
        price: selectedService.price,
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration,
        status: 'pending',
      })

      setConfirmedAppointment(appointment)
      setStep('confirm')
    } catch (error: any) {
      setError(error.message || 'Error al crear la cita')
    } finally {
      setLoading(false)
    }
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 2)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reservar Cita</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center ${step === 'service' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'service' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Servicio</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className={`flex items-center ${step === 'info' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'info' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Datos</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
          <div className={`flex items-center ${step === 'datetime' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'datetime' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Fecha y Hora</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Selecciona un servicio</h2>
            {services.length === 0 ? (
              <p className="text-gray-600">No hay servicios disponibles.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-gray-600 mb-2">{service.description}</p>
                    <p className="text-xl font-bold text-primary-600">{formatPrice(service.price)}</p>
                    <p className="text-sm text-gray-500">Duración: {service.duration} minutos</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Customer Info */}
        {step === 'info' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tus datos</h2>
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('service')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Date and Time */}
        {step === 'datetime' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Selecciona fecha y hora</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horario disponible
                  </label>
                  {loading ? (
                    <p className="text-gray-600">Cargando horarios...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-600">No hay horarios disponibles para esta fecha.</p>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            selectedTime === slot
                              ? 'border-primary-600 bg-primary-50 text-primary-600'
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          {formatTime(slot)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Debug logs */}
                  {debugLogs.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono">
                      <p className="font-bold mb-2">Logs de depuración:</p>
                      {debugLogs.map((log, index) => (
                        <p key={index} className="mb-1">{log}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleBookingConfirm}
                  disabled={!selectedDate || !selectedTime || loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Confirmar Cita'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {step === 'confirm' && confirmedAppointment && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Cita reservada correctamente!</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
              <p className="mb-2"><strong>Cliente:</strong> {confirmedAppointment.client_name}</p>
              <p className="mb-2"><strong>Servicio:</strong> {confirmedAppointment.service_name}</p>
              <p className="mb-2"><strong>Precio:</strong> {formatPrice(confirmedAppointment.price)}</p>
              <p className="mb-2"><strong>Fecha:</strong> {formatDate(confirmedAppointment.date)}</p>
              <p className="mb-2"><strong>Hora:</strong> {formatTime(confirmedAppointment.time)}</p>
              <p><strong>Código de reserva:</strong> {confirmedAppointment.id.slice(0, 8).toUpperCase()}</p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
