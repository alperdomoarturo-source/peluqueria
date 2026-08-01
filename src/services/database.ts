import { supabase } from '../lib/supabase'
import { Service, Appointment, Schedule, Block, Admin, AppointmentStatus, Worker } from '../types'

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
  // Get workers for this service
  const { data: workers, error: workersError } = await supabase
    .from('workers')
    .select('*')
    .eq('service_id', appointment.service_id)

  if (workersError) throw workersError

  const workerCount = workers?.length || 0

  // Check for conflicting appointments
  const { data: conflicts, error: conflictError } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', appointment.date)
    .eq('service_id', appointment.service_id)
    .in('status', ['pending', 'confirmed'])

  if (conflictError) throw conflictError

  const conflictingAppointments = conflicts?.filter(conflict => {
    const conflictStart = parseInt(conflict.time.split(':')[0]) * 60 + parseInt(conflict.time.split(':')[1])
    const conflictEnd = conflictStart + conflict.duration
    const newStart = parseInt(appointment.time.split(':')[0]) * 60 + parseInt(appointment.time.split(':')[1])
    const newEnd = newStart + appointment.duration
    return (newStart < conflictEnd && newEnd > conflictStart)
  }) || []

  // Check if there are enough workers available
  if (conflictingAppointments.length >= workerCount) {
    throw new Error('Cupos llenos para este horario')
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
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  
  // Check if it's after 11 PM to reset daily revenue
  const isAfter11PM = now.getHours() >= 23
  const todayForRevenue = isAfter11PM ? '' : today

  const [todayAppointments, pendingAppointments, completedAppointments, cancelledAppointments, services, todayRevenueData, monthRevenueData, monthServicesData] = await Promise.all([
    supabase.from('appointments').select('*').eq('date', today),
    supabase.from('appointments').select('*').eq('status', 'pending'),
    supabase.from('appointments').select('*').eq('status', 'completed'),
    supabase.from('appointments').select('*').eq('status', 'cancelled'),
    supabase.from('services').select('*').eq('is_active', true),
    supabase.from('appointments').select('*').eq('date', todayForRevenue).eq('status', 'confirmed'),
    supabase.from('appointments').select('*').gte('date', monthStart).eq('status', 'confirmed'),
    supabase.from('appointments').select('service_name').gte('date', monthStart).eq('status', 'confirmed'),
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

// Fix future appointments marked as completed
export const fixFutureCompletedAppointments = async () => {
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0]
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const { data: futureCompleted, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('status', 'completed')
    .gte('date', currentDate)

  if (error) throw error

  for (const appointment of futureCompleted || []) {
    const isFuture =
      appointment.date > currentDate ||
      (appointment.date === currentDate && appointment.time > currentTime)

    if (isFuture) {
      console.log('Fixing future completed appointment:', appointment.id, appointment.date, appointment.time)
      await updateAppointment(appointment.id, { status: 'pending' })
    }
  }
}

// Fix incorrect appointment status
export const fixAppointmentStatus = async () => {
  // Change Laura's appointment from completed to pending
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'pending' })
    .eq('client_name', 'Laura Sofia Perdomo')
    .eq('date', '2026-08-01')
    .select()

  console.log('Fix appointment status result:', data, error)
  if (error) throw error
}

// Delete all appointments at the start of each month
export const deleteOldAppointments = async () => {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastCleanedMonth = localStorage.getItem('lastCleanedMonth')

  // If already cleaned this month, don't clean again
  if (lastCleanedMonth === currentMonth) {
    console.log('Already cleaned this month, skipping')
    return
  }

  // Delete ALL appointments when starting a new month
  const { error } = await supabase
    .from('appointments')
    .delete()
    .gte('date', '1900-01-01') // Delete all records with any date

  if (error) {
    console.error('Error deleting appointments:', error)
    throw error
  }

  // Mark this month as cleaned
  localStorage.setItem('lastCleanedMonth', currentMonth)
  console.log('Deleted all appointments for new month')
}

// Workers
export const getWorkers = async (serviceId?: string) => {
  let query = supabase.from('workers').select('*')
  if (serviceId) {
    query = query.eq('service_id', serviceId)
  }
  const { data, error } = await query.order('name')
  if (error) throw error
  return data as Worker[]
}

export const createWorker = async (worker: Omit<Worker, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('workers')
    .insert(worker)
    .select()
    .single()
  if (error) throw error
  return data as Worker
}

export const deleteWorker = async (id: string) => {
  const { error } = await supabase.from('workers').delete().eq('id', id)
  if (error) throw error
}

export const getWorkersByService = async (serviceId: string) => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('service_id', serviceId)
  if (error) throw error
  return data as Worker[]
}
