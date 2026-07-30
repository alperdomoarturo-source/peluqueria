# 🪒 Peluquería Booking System

Una aplicación web completa y moderna para la gestión de reservas de peluquería/barbería con panel administrativo.

## ✨ Características

### Para Clientes
- 📱 Diseño responsive (celular, tablet, desktop)
- 🎨 Interfaz moderna y elegante
- 📋 Visualización de servicios y precios
- 📅 Sistema de reservas con calendario
- ⏰ Selección de horarios disponibles
- ✅ Confirmación de citas con código de reserva

### Para Administradores
- 🔐 Panel administrativo protegido con login
- 📊 Dashboard con estadísticas en tiempo real
- 📋 Gestión completa de citas (ver, confirmar, cancelar, eliminar)
- ✂️ Gestión de servicios (crear, editar, eliminar, activar/desactivar)
- ⏰ Configuración de horarios semanales
- 🚫 Bloqueo de fechas y horarios específicos
- 🔍 Búsqueda y filtrado de citas

### Características Técnicas
- 💾 Almacenamiento permanente en Supabase + PostgreSQL
- 🔄 Prevención de reservas duplicadas (validación backend)
- 🚀 React + TypeScript + Vite
- 🎨 Tailwind CSS para estilos
- 📦 Componentes reutilizables
- 🔒 Variables de entorno para configuración sensible

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Supabase (gratuita en supabase.com)

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd peluqueria-booking
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API y copia:
   - Project URL
   - anon public key

### 4. Ejecutar el esquema de base de datos

1. En tu proyecto de Supabase, ve al SQL Editor
2. Copia el contenido del archivo `supabase-schema.sql`
3. Ejecuta el SQL para crear las tablas y datos iniciales

### 5. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_project_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

El archivo `.env.example` contiene las variables necesarias como referencia.

### 6. Ejecutar el proyecto en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🌐 Despliegue en GitHub Pages

### 1. Crear repositorio en GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/peluqueria.git
git push -u origin main
```

### 2. Configurar Vite para GitHub Pages

Edita `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/peluqueria/', // Cambia esto al nombre de tu repositorio
  // ... resto de la configuración
})
```

### 3. Construir el proyecto

```bash
npm run build
```

### 4. Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings > Pages
3. Source: Deploy from a branch
4. Branch: main / (root)
5. Save

Tu sitio estará disponible en: `https://tu-usuario.github.io/peluqueria/`

## 📁 Estructura del Proyecto

```
peluqueria-booking/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Header.tsx
│   │   ├── ServiceCard.tsx
│   │   └── AdminLayout.tsx
│   ├── pages/              # Páginas principales
│   │   ├── Home.tsx
│   │   └── Booking.tsx
│   ├── pages/admin/        # Páginas de administración
│   │   ├── AdminLogin.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminAppointments.tsx
│   │   ├── AdminServices.tsx
│   │   └── AdminSchedules.tsx
│   ├── services/           # Servicios de base de datos
│   │   └── database.ts
│   ├── lib/                # Configuración de librerías
│   │   └── supabase.ts
│   ├── types/              # Definiciones TypeScript
│   │   └── index.ts
│   ├── utils/              # Utilidades
│   │   ├── cn.ts
│   │   └── auth.ts
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                 # Archivos estáticos
├── .env.example            # Ejemplo de variables de entorno
├── supabase-schema.sql     # Esquema de base de datos
├── package.json            # Dependencias
├── tsconfig.json           # Configuración TypeScript
├── tailwind.config.js      # Configuración Tailwind
├── vite.config.ts          # Configuración Vite
└── README.md               # Este archivo
```

## 🔐 Credenciales por Defecto

**Panel Administrativo:**
- Email: `admin@peluqueria.com`
- Contraseña: `admin123`

⚠️ **Importante:** Cambia estas credenciales en producción implementando un sistema de autenticación seguro con hashing de contraseñas.

## 🗄️ Base de Datos

### Tablas

- **admins**: Administradores del sistema
- **services**: Servicios ofrecidos
- **clients**: Información de clientes
- **appointments**: Citas/reservas
- **schedules**: Horarios de atención
- **blocks**: Bloqueos de fechas/horarios

### Datos Iniciales

El esquema SQL incluye:
- 1 usuario administrador
- 4 servicios de ejemplo
- Horarios de lunes a sábado (8:00 AM - 6:00 PM)

## 🔄 Actualizar el Proyecto

### Actualizar código

```bash
git pull origin main
npm install
npm run dev
```

### Actualizar base de datos

Si hay cambios en el esquema:
1. Ve al SQL Editor en Supabase
2. Ejecuta los nuevos comandos SQL

### Actualizar despliegue

```bash
npm run build
git add .
git commit -m "Update"
git push
```

GitHub Pages se actualizará automáticamente.

## 🧪 Pruebas

### Flujo de Cliente

1. Accede a la página principal
2. Visualiza los servicios y precios
3. Selecciona un servicio
4. Ingresa tus datos
5. Selecciona fecha y hora
6. Confirma la cita
7. Recibe confirmación con código

### Flujo de Administrador

1. Accede a `/admin`
2. Inicia sesión
3. Visualiza el dashboard
4. Gestiona citas (cambiar estado, eliminar)
5. Gestiona servicios (crear, editar, eliminar)
6. Configura horarios
7. Bloquea fechas/horarios

### Persistencia

- Cierra el navegador y vuelve a abrir
- Verifica que las citas, servicios y configuraciones persisten
- Los datos se guardan permanentemente en Supabase

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Estilos**: Tailwind CSS
- **Enrutamiento**: React Router
- **Base de Datos**: Supabase (PostgreSQL)
- **Iconos**: Lucide React
- **Utilidades**: clsx, tailwind-merge, date-fns

## 📝 Notas Importantes

### Seguridad

- Las contraseñas están en texto plano en el demo (implementar hashing en producción)
- Las políticas RLS son permisibles para demo (restringir en producción)
- Usa variables de entorno para datos sensibles
- Nunca commits el archivo `.env`

### Mejoras Futuras

- Implementar autenticación segura con Supabase Auth
- Agregar notificaciones por email
- Implementar recordatorios de citas
- Agregar sistema de pagos
- Crear API para integraciones
- Agregar reportes y exportación de datos

## 🤝 Contribuciones

Este es un proyecto de demostración. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🆘 Soporte

Para problemas o preguntas:
- Revisa la documentación de Supabase
- Revisa la documentación de React
- Abre un issue en el repositorio

---

**Desarrollado con ❤️ para peluquerías modernas**
