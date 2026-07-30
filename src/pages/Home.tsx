import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import ServiceCard from '../components/ServiceCard'
import { getServices } from '../services/database'
import { Service } from '../types'

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const data = await getServices()
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Tu estilo, nuestra pasión</h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Descubre la mejor experiencia de cuidado personal
          </p>
          <Link
            to="/booking"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
          >
            Reservar mi cita
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Nuestros Servicios
          </h2>
          
          {loading ? (
            <div className="text-center text-gray-600">Cargando servicios...</div>
          ) : services.length === 0 ? (
            <div className="text-center text-gray-600">
              No hay servicios disponibles en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contáctanos</h2>
          <p className="text-gray-600 mb-8">
            Estamos aquí para atenderte. ¡Reserva tu cita hoy!
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div>
              <h3 className="font-semibold text-gray-900">Teléfono</h3>
              <p className="text-gray-600">+57 300 123 4567</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email</h3>
              <p className="text-gray-600">info@peluqueria.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Horario</h3>
              <p className="text-gray-600">Lun - Sáb: 8:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 Peluquería. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
