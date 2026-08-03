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
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🌸</div>
          <div className="absolute top-20 right-20 text-6xl">🌺</div>
          <div className="absolute bottom-10 left-1/4 text-7xl">🌷</div>
          <div className="absolute bottom-20 right-1/3 text-5xl">🌹</div>
          <div className="absolute top-1/2 left-10 text-6xl">🌼</div>
          <div className="absolute top-1/3 right-10 text-7xl">💐</div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Tu estilo, nuestra pasión</h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100 drop-shadow-md" style={{ fontFamily: 'Lato, sans-serif' }}>
            Descubre la mejor experiencia de cuidado personal
          </p>
          <Link
            to="/booking"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Reservar mi cita
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 relative" style={{ backgroundImage: 'url(https://img.freepik.com/fotos-premium/patron-salon-belleza_288990-5669.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <style>{`
          @media (min-width: 768px) {
            #services {
              background-attachment: fixed;
            }
          }
        `}</style>
        <div className="absolute inset-0 bg-white/90"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Nuestros Servicios
            </h2>
          </div>
          
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
      <section className="bg-gradient-to-b from-white to-primary-50 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center gap-2 text-3xl mb-4">
            <span>📞</span>
            <span>💌</span>
            <span>🕐</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Contáctanos</h2>
          <p className="text-gray-600 mb-8" style={{ fontFamily: 'Lato, sans-serif' }}>
            Estamos aquí para atenderte. ¡Reserva tu cita hoy!
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📞</div>
              <h3 className="font-semibold text-gray-900">Teléfono</h3>
              <p className="text-gray-600">+57 300 123 4567</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">💌</div>
              <h3 className="font-semibold text-gray-900">Email</h3>
              <p className="text-gray-600">info@peluqueria.com</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🕐</div>
              <h3 className="font-semibold text-gray-900">Horario</h3>
              <p className="text-gray-600">Lun - Sáb: 8:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary-800 to-primary-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center gap-2 text-2xl mb-4">
            <span>🌸</span>
            <span>💇</span>
            <span>💅</span>
            <span>🌺</span>
          </div>
          <p className="text-lg mb-2">&copy; 2024 Peluquería. Todos los derechos reservados.</p>
          <p className="text-primary-200 text-sm">Hecho con 💖 para ti</p>
        </div>
      </footer>
    </div>
  )
}
