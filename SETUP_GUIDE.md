# 🚀 Guía de Configuración - Peluquería Booking System

## ⚠️ Importante: Habilitar PowerShell para npm

Los comandos npm están bloqueados por la política de ejecución de PowerShell. Sigue estos pasos para habilitarlos:

### Opción 1: Habilitar temporalmente (recomendado)

Abre PowerShell como Administrador y ejecuta:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego cierra y vuelve a abrir PowerShell.

### Opción 2: Habilitar solo para la sesión actual

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

## 📋 Pasos de Instalación

### Paso 1: Instalar dependencias

```bash
npm install
```

Esto instalará:
- React 18
- TypeScript
- Vite
- React Router
- Supabase JS
- Tailwind CSS
- Lucide React (iconos)
- date-fns (fechas)
- clsx y tailwind-merge (utilidades)

### Paso 2: Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Espera a que el proyecto esté listo (puede tomar 1-2 minutos)
4. Ve a **Settings** > **API**
5. Copia:
   - **Project URL** (algo como: https://xxxxxxxx.supabase.co)
   - **anon public key** (algo como: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

### Paso 3: Ejecutar el esquema de base de datos

1. En tu proyecto de Supabase, ve al **SQL Editor**
2. Crea una nueva consulta
3. Copia todo el contenido del archivo `supabase-schema.sql`
4. Pégalo en el editor SQL
5. Haz clic en **Run** o presiona Ctrl+Enter

Esto creará:
- ✅ Tablas: admins, services, clients, appointments, schedules, blocks
- ✅ Índices para mejor rendimiento
- ✅ Políticas RLS (Row Level Security)
- ✅ Datos iniciales: 1 admin, 4 servicios, horarios de lunes a sábado

### Paso 4: Crear archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto (mismo nivel que package.json):

```env
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Reemplaza con los valores que copiaste de Supabase.

**⚠️ NUNCA commits el archivo .env a GitHub**

### Paso 5: Ejecutar el proyecto

```bash
npm run dev
```

El proyecto se abrirá en: `http://localhost:5173`

## 🔐 Credenciales de Acceso

### Panel Administrativo

- **URL**: `http://localhost:5173/admin`
- **Email**: `admin@peluqueria.com`
- **Contraseña**: `admin123`

## 🧪 Pruebas Recomendadas

### 1. Prueba de Cliente

1. Abre `http://localhost:5173`
2. Verifica que veas la página principal con el header
3. Verifica que veas los servicios (Corte de cabello, Corte + Barba, etc.)
4. Haz clic en "Agendar" en cualquier servicio
5. Ingresa tus datos (nombre, teléfono)
6. Selecciona una fecha futura
7. Selecciona un horario disponible
8. Confirma la cita
9. Verifica que recibes confirmación con código

### 2. Prueba de Administrador

1. Abre `http://localhost:5173/admin`
2. Inicia sesión con las credenciales
3. Verifica el dashboard con estadísticas
4. Ve a "Citas" y verifica que aparece la cita que creaste
5. Cambia el estado de la cita a "Confirmada"
6. Ve a "Servicios" y crea un nuevo servicio
7. Ve a "Horarios" y modifica algún horario
8. Crea un bloqueo de fecha/hora

### 3. Prueba de Persistencia

1. Cierra completamente el navegador
2. Vuelve a abrir `http://localhost:5173`
3. Verifica que los servicios siguen ahí
4. Inicia sesión en el admin
5. Verifica que la cita sigue ahí
6. Verifica que los cambios (nuevo servicio, horarios) persistieron

## 🌐 Despliegue en GitHub Pages

### Paso 1: Crear repositorio en GitHub

1. Ve a github.com y crea un nuevo repositorio llamado `peluqueria`
2. No inicialices con README (ya tenemos uno)

### Paso 2: Subir el código

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/peluqueria.git
git push -u origin main
```

### Paso 3: Configurar Vite para GitHub Pages

Edita el archivo `vite.config.ts` y agrega `base`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/peluqueria/', // Agrega esta línea
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Paso 4: Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** > **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: main
5. **Folder**: / (root)
6. **Save**

### Paso 5: Construir y desplegar

```bash
npm run build
git add .
git commit -m "Add build"
git push
```

GitHub Pages desplegará automáticamente. Tu sitio estará en:
`https://tu-usuario.github.io/peluqueria/`

## 🐛 Solución de Problemas

### Error: "Cannot find module 'react'"

**Solución**: Ejecuta `npm install`

### Error: "Missing Supabase environment variables"

**Solución**: Verifica que el archivo `.env` existe y tiene las variables correctas

### Error: "Policy execution is disabled"

**Solución**: Ejecuta en PowerShell como Administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "No hay horarios disponibles"

**Solución**: 
- Verifica que los horarios estén configurados en Supabase
- Verifica que la fecha seleccionada no esté bloqueada
- Verifica que el día de la semana tenga horario activo

### Error: "El horario ya está ocupado"

**Solución**: Este es normal - significa que alguien más reservó ese horario. Selecciona otro.

## 📞 Soporte

Si tienes problemas:

1. Verifica que npm esté instalado: `npm --version`
2. Verifica que Node.js esté instalado: `node --version`
3. Verifica que el archivo .env exista
4. Verifica que Supabase esté configurado correctamente
5. Revisa la consola del navegador (F12) para errores

## ✅ Checklist de Configuración

- [ ] PowerShell execution policy habilitada
- [ ] Dependencias instaladas (`npm install`)
- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Esquema SQL ejecutado
- [ ] Archivo .env creado con credenciales
- [ ] Proyecto ejecutándose (`npm run dev`)
- [ ] Prueba de cliente completada
- [ ] Prueba de administrador completada
- [ ] Prueba de persistencia completada

¡Listo! Tu sistema de reservas de peluquería está funcionando. 🎉
