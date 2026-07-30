export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Admin {
  id: string
  name: string
  email: string
  password_hash: string
  created_at: string
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  image?: string
  duration: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  created_at: string
}

export interface Appointment {
  id: string
  client_id: string | null
  client_name: string
  client_phone: string
  service_id: string
  service_name: string
  price: number
  date: string
  time: string
  duration: number
  status: AppointmentStatus
  created_at: string
}

export interface Schedule {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  interval: number
  is_active: boolean
}

export interface Block {
  id: string
  date: string
  start_time: string
  end_time: string
  reason?: string
  is_active: boolean
}
