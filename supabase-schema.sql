-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  duration INTEGER NOT NULL, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  service_id UUID REFERENCES services(id),
  service_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  interval INTEGER DEFAULT 30, -- in minutes
  is_active BOOLEAN DEFAULT true
);

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_blocks_date ON blocks(date);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);

-- Insert default admin user (password: admin123)
-- In production, use proper password hashing!
INSERT INTO admins (name, email, password_hash) 
VALUES ('Administrador', 'admin@peluqueria.com', 'admin123')
ON CONFLICT (email) DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, price, duration, is_active) VALUES
  ('Corte de cabello', 'Corte moderno y personalizado', 25000, 30, true),
  ('Corte + Barba', 'Corte de cabello y arreglo de barba', 35000, 45, true),
  ('Barba', 'Arreglo profesional de barba', 15000, 20, true),
  ('Tintura', 'Coloración completa del cabello', 70000, 90, true)
ON CONFLICT DO NOTHING;

-- Insert default schedules (Monday to Saturday, 8:00 AM - 6:00 PM)
INSERT INTO schedules (day_of_week, start_time, end_time, interval, is_active) VALUES
  (1, '08:00:00', '18:00:00', 30, true), -- Monday
  (2, '08:00:00', '18:00:00', 30, true), -- Tuesday
  (3, '08:00:00', '18:00:00', 30, true), -- Wednesday
  (4, '08:00:00', '18:00:00', 30, true), -- Thursday
  (5, '08:00:00', '18:00:00', 30, true), -- Friday
  (6, '08:00:00', '18:00:00', 30, true)  -- Saturday
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes - adjust for production)
-- In production, you should implement proper authentication and authorization

-- Services: Public can read active services
CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Appointments: Public can create appointments
CREATE POLICY "Public can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Appointments: Public can read appointments (for demo - restrict in production)
CREATE POLICY "Public can view appointments"
  ON appointments FOR SELECT
  USING (true);

-- Schedules: Public can read schedules
CREATE POLICY "Public can view schedules"
  ON schedules FOR SELECT
  USING (is_active = true);

-- Blocks: Public can read blocks
CREATE POLICY "Public can view blocks"
  ON blocks FOR SELECT
  USING (is_active = true);

-- Admin policies: Full access for authenticated admin
-- Note: In production, implement proper authentication with Supabase Auth
CREATE POLICY "Admin can manage everything"
  ON admins FOR ALL
  USING (true);

CREATE POLICY "Admin can manage services"
  ON services FOR ALL
  USING (true);

CREATE POLICY "Admin can manage appointments"
  ON appointments FOR ALL
  USING (true);

CREATE POLICY "Admin can manage schedules"
  ON schedules FOR ALL
  USING (true);

CREATE POLICY "Admin can manage blocks"
  ON blocks FOR ALL
  USING (true);
