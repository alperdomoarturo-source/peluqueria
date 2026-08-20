import { Service } from '../types'
import { formatPrice } from '../utils/cn'
import { Link } from 'react-router-dom'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {service.image && (
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-6xl">🚗</span>
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-black">{formatPrice(service.price)}</span>
          <Link
            to={`/booking?service=${service.id}`}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Agendar
          </Link>
        </div>
      </div>
    </div>
  )
}
