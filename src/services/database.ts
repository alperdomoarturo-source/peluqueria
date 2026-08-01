import { supabase } from '../lib/supabase'
import { Service, Appointment, Schedule, Block, Admin, AppointmentStatus } from '../types'

// Services
export const getServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data as Service[]
}

export const getAllServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Service[]
}

export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single()
  if (error) throw error
  return data as Service
}

export const updateService = async (id: string, service: Partial<Service>) => {
  const { data, error } = await supabase
    .from('services')
    .update({ ...service, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Service
}

export const deleteService = async (id: string) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Appointments
export const getAppointments = async (filters?: { date?: string; status?: AppointmentStatus }) => {
  let query = supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (filters?.date) {
    query = query.eq('date', filters.date)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Appointment[]
}

export const getAppointmentById = async (id: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Appointment
}

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at'>) => {
  // Check for conflicting appointments
  const { data: conflicts, error: conflictError } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', appointment.date)
    .in('status', ['pending', 'confirmed'])
  
  if (conflictError) throw conflictError

  const hasConflict = conflicts?.some(conflict => {
    const conflictStart = parseInt(conflict.time.split(':')[0]) * 60 + parseInt(conflict.time.split(':')[1])
    const conflictEnd = conflictStart + conflict.duration
    const newStart = parseInt(appointment.time.split(':')[0]) * 60 + parseInt(appointment.time.split(':')[1])
    const newEnd = newStart + appointment.duration
    return (newStart < conflictEnd && newEnd > conflictStart)
  })

  if (hasConflict) {
    throw new Error('El horario ya está ocupado')
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single()
  if (error) throw error
  return data as Appointment
}

export const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
  const { data, error } = await supabase
    .from('appointments')
    .update(appointment)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Appointment
}

export const deleteAppointment = async (id: string) => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export const getAvailableSlots = async (date: string, serviceDuration: number) => {
  // Get schedule for the day
  const dayOfWeek = new Date(date).getDay()
  const { data: schedule, error: scheduleError } = await supabase
    .from('schedules')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .single()
  
  if (scheduleError || !schedule) return []

  // Get existing appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', date)
    .in('status', ['pending', 'confirmed'])
  
  if (appointmentsError) throw appointmentsError

  // Get blocks
  const { data: blocks, error: blocksError } = await supabase
    .from('blocks')
    .select('*')
    .eq('date', date)
    .eq('is_active', true)
  
  if (blocksError) throw blocksError

  // Generate time slots
  const slots: string[] = []
  const [startHour, startMin] = schedule.start_time.split(':').map(Number)
  const [endHour, endMin] = schedule.end_time.split(':').map(Number)
  
  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const interval = schedule.interval

  while (currentMinutes + serviceDuration <= endMinutes) {
    const timeSlot = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`
    
    // Check if slot is available
    const slotStart = currentMinutes
    const slotEnd = currentMinutes + serviceDuration
    
    const isBooked = appointments?.some(apt => {
      const aptStart = parseInt(apt.time.split(':')[0]) * 60 + parseInt(apt.time.split(':')[1])
      const aptEnd = aptStart + apt.duration
      return (slotStart < aptEnd && slotEnd > aptStart)
    })

    const isBlocked = blocks?.some(block => {
      const blockStart = parseInt(block.start_time.split(':')[0]) * 60 + parseInt(block.start_time.split(':')[1])
      const blockEnd = parseInt(block.end_time.split(':')[0]) * 60 + parseInt(block.end_time.split(':')[1])
      return (slotStart < blockEnd && slotEnd > blockStart)
    })

    if (!isBooked && !isBlocked) {
      slots.push(timeSlot)
    }
    
    currentMinutes += interval
  }

  return slots
}

// Schedules
export const getSchedules = async () => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('day_of_week')
  if (error) throw error
  return data as Schedule[]
}

export const updateSchedule = async (id: string, schedule: Partial<Schedule>) => {
  const { data, error } = await supabase
    .from('schedules')
    .update(schedule)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Schedule
}

// Blocks
export const getBlocks = async (date?: string) => {
  let query = supabase
    .from('blocks')
    .select('*')
    .eq('is_active', true)
    .order('date')
    .order('start_time')
  
  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Block[]
}

export const createBlock = async (block: Omit<Block, 'id'>) => {
  const { data, error } = await supabase
    .from('blocks')
    .insert(block)
    .select()
    .single()
  if (error) throw error
  return data as Block
}

export const deleteBlock = async (id: string) => {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Admin Authentication
export const loginAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Credenciales inválidas')
  
  // Simple password check (in production, use proper hashing)
  if (data.password_hash !== password) {
    throw new Error('Credenciales inválidas')
  }
  
  return data as Admin
}

// Statistics
export const getStatistics = async () => {
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [todayAppointments, pendingAppointments, completedAppointments, cancelledAppointments, services, todayRevenueData, monthRevenueData, monthServicesData] = await Promise.all([
    supabase.from('appointments').select('*').eq('date', today),
    supabase.from('appointments').select('*').eq('status', 'pending'),
    supabase.from('appointments').select('*').eq('status', 'completed'),
    supabase.from('appointments').select('*').eq('status', 'cancelled'),
    supabase.from('services').select('*').eq('is_active', true),
    supabase.from('appointments').select('*').eq('date', today).eq('status', 'completed'),
    supabase.from('appointments').select('*').gte('date', monthStart).eq('status', 'completed'),
    supabase.from('appointments').select('service_name').gte('date', monthStart).eq('status', 'completed'),
  ])

  const calculateRevenue = (data: any) => {
    return data?.reduce((sum: number, apt: any) => sum + (apt.price || 0), 0) || 0
  }

  // Calculate monthly services distribution
  const monthlyServices = monthServicesData.data?.reduce((acc: any, apt: any) => {
    const serviceName = apt.service_name || 'Sin servicio'
    acc[serviceName] = (acc[serviceName] || 0) + 1
    return acc
  }, {}) || {}

  const totalMonthlyServices = Object.values(monthlyServices).reduce((sum: number, count: any) => sum + count, 0) || 0

  const monthlyServicesDistribution = Object.entries(monthlyServices).map(([name, count]) => ({
    name,
    count: count as number,
    percentage: totalMonthlyServices > 0 ? Math.round(((count as number) / totalMonthlyServices) * 100) : 0
  }))

  return {
    todayAppointments: todayAppointments.data?.length || 0,
    pendingAppointments: pendingAppointments.data?.length || 0,
    completedAppointments: completedAppointments.data?.length || 0,
    cancelledAppointments: cancelledAppointments.data?.length || 0,
    totalServices: services.data?.length || 0,
    todayRevenue: calculateRevenue(todayRevenueData.data),
    monthRevenue: calculateRevenue(monthRevenueData.data),
    monthlyServicesDistribution,
  }
}

// Auto-confirm appointments when date/time arrives
export const autoConfirmAppointments = async () => {
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0]
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const { data: pendingAppointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('status', 'pending')
    .lte('date', currentDate)

  if (error) throw error

  for (const appointment of pendingAppointments || []) {
    const shouldConfirm =
      appointment.date < currentDate ||
      (appointment.date === currentDate && appointment.time <= currentTime)

    if (shouldConfirm) {
      await updateAppointment(appointment.id, { status: 'confirmed' })
    }
  }
}

// Fix incorrect appointment status
export const fixAppointmentStatus = async () => {
  // Change Laura's appointment from completed to pending
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'pending' })
    .eq('client_name', 'Laura Sofia Perdomo')
    .eq('date', '2026-08-01')

  if (error) throw error
}
