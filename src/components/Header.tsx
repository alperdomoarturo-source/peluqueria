import { Link } from 'react-router-dom'
import { Scissors } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-black" />
            <span className="text-xl font-bold text-gray-900">Peluquería</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-black transition-colors">
              Inicio
            </Link>
            <Link to="/#services" className="text-gray-700 hover:text-black transition-colors">
              Servicios
            </Link>
            <Link to="/booking" className="text-gray-700 hover:text-black transition-colors">
              Reservar Cita
            </Link>
          </nav>
          
          <Link
            to="/booking"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Agendar Cita
          </Link>
        </div>
      </div>
    </header>
  )
}
