# Sport GT — Sistema de Gestión de Tienda Deportiva

Aplicación web fullstack para gestionar el inventario y las ventas de una tienda deportiva. Incluye frontend en React, API REST con Node.js/Express, base de datos MariaDB y despliegue completo con Docker Compose.

Link para verlo deployado: http://209.126.125.149:5174/login

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

No es necesario tener Node.js instalado localmente.

---

## Levantar el proyecto

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>

# 2. Copiar las variables de entorno
cp .env.example .env

# 3. Levantar todos los servicios
docker compose up
```

Eso es todo. Docker construirá las imágenes, aplicará el esquema de base de datos y levantará los tres servicios.

| Servicio  | URL local                  |
|-----------|----------------------------|
| Frontend  | http://localhost:5174       |
| Backend   | http://localhost:3001/api   |
| Base de datos (MariaDB) | localhost:3307 |

> La primera vez puede tardar ~60 segundos mientras la base de datos inicializa y el backend espera a que esté lista.


## Credenciales de acceso

Al iniciar por primera vez el backend crea automáticamente los usuarios de prueba:

| Rol      | Email                  | Contraseña    |
|----------|------------------------|---------------|
| Admin    | admin@tienda.com       | Admin123!     |
| Empleado | luis@tienda.com        | Empleado123!  |
| Empleado | sofia@tienda.com       | Empleado123!  |

### Credenciales de base de datos

| Variable      | Valor           |
|---------------|-----------------|
| DB_USER       | proy2           |
| DB_PASSWORD   | secret          |
| DB_NAME       | tienda_deportes |

---

## Variables de entorno

```bash
cp .env.example .env
```

---

## Estructura del proyecto

```
├── backend/
│   ├── src/
│   │   ├── controllers/   # Lógica de rutas
│   │   ├── services/      # Lógica de negocio
│   │   ├── daos/          # Acceso a base de datos
│   │   ├── middleware/     # Auth JWT
│   │   ├── routes/        # Definición de rutas
│   │   └── utils/         # Helpers 
│   ├── tests/             # Pruebas unitarias
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/           # Cliente HTTP
│   │   ├── context/       # AuthContext 
│   │   └── pages/         # Vistas de la aplicación
│   └── Dockerfile
├── database/
│   └── schema.sql         # Esquema + datos de prueba
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## API REST — Endpoints

Todos los endpoints (excepto `/api/auth/login`) requieren el header:

```
Authorization: Bearer <token>
```

### Autenticación

| Método | Endpoint          | Descripción          |
|--------|-------------------|----------------------|
| POST   | /api/auth/login   | Login, retorna JWT   |

**Body:**
```json
{ "email": "admin@tienda.com", "password": "Admin123!" }
```

**Respuesta:**
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "nombre": "Administrador", "email": "...", "rol": "admin" }
}
```

---

### Productos

| Método | Endpoint                       | Descripción                          |
|--------|--------------------------------|--------------------------------------|
| GET    | /api/productos                 | Listar todos (filtros: search, categoria, deporte) |
| GET    | /api/productos/:id             | Obtener por ID                       |
| POST   | /api/productos                 | Crear producto                       |
| PUT    | /api/productos/:id             | Actualizar producto                  |
| DELETE | /api/productos/:id             | Eliminar producto                    |
| GET    | /api/productos/stock-bajo      | Productos bajo stock mínimo          |
| GET    | /api/productos/mas-vendidos    | Top 10 más vendidos (con CTE)        |
| GET    | /api/productos/sin-ventas      | Productos sin ninguna venta          |

**Ejemplo crear producto:**
```json
{
  "nombre": "Tenis Nike Air",
  "precio": 850.00,
  "stock": 10,
  "stock_minimo": 5,
  "id_categoria": 1,
  "id_marca": 1,
  "id_deporte": 1,
  "id_proveedor": 1
}
```

---

### Clientes

| Método | Endpoint                              | Descripción                             |
|--------|---------------------------------------|-----------------------------------------|
| GET    | /api/clientes                         | Listar (filtro: search)                 |
| GET    | /api/clientes/:id                     | Obtener por ID                          |
| POST   | /api/clientes                         | Crear cliente                           |
| PUT    | /api/clientes/:id                     | Actualizar cliente                      |
| DELETE | /api/clientes/:id                     | Eliminar (falla si tiene ventas)        |
| GET    | /api/clientes/historial               | Ranking de clientes con total de compras|
| GET    | /api/clientes/por-deporte/:id_deporte | Clientes que compraron ese deporte      |

---

### Ventas

| Método | Endpoint                | Descripción                                  |
|--------|-------------------------|----------------------------------------------|
| GET    | /api/ventas             | Listar (filtros: estado, fecha_desde, fecha_hasta) |
| GET    | /api/ventas/:id         | Detalle de venta con líneas                  |
| POST   | /api/ventas             | Crear venta (descuenta stock, transacción)   |
| PUT    | /api/ventas/:id/anular  | Anular venta (restaura stock)                |
| GET    | /api/ventas/reporte     | Reporte por empleado y categoría             |

**Ejemplo crear venta:**
```json
{
  "id_cliente": 1,
  "id_empleado": 1,
  "items": [
    { "id_producto": 3, "cantidad": 2 },
    { "id_producto": 10, "cantidad": 1 }
  ]
}
```

---

### Catálogos

Los siguientes recursos exponen CRUD completo (GET all, POST, PUT /:id, DELETE /:id):

| Recurso      | Base URL         |
|--------------|------------------|
| Categorías   | /api/categorias  |
| Marcas       | /api/marcas      |
| Deportes     | /api/deportes    |
| Proveedores  | /api/proveedores |
| Empleados    | /api/empleados (solo GET) |

---

### Códigos de error

La API retorna siempre JSON en los errores:

```json
{ "error": "Descripción del error" }
```

| Código | Significado                              |
|--------|------------------------------------------|
| 400    | Datos inválidos o faltantes              |
| 401    | Token ausente, expirado o inválido       |
| 403    | Acción restringida (solo admin)          |
| 404    | Recurso no encontrado                    |
| 409    | Conflicto (duplicado, referencia activa) |
| 500    | Error interno del servidor               |



## Pruebas

```bash
# Desde el directorio backend/
npm test
```

Las pruebas usan el runner nativo de Node.js (`node:test`) y cubren las utilidades de validación:

- `requireFields` — lanza 400 cuando falta un campo requerido
- `assertPositiveNumber` — rechaza cero y negativos
- `assertEmail` — acepta emails vacíos opcionales, rechaza malformados
- `toNull` — normaliza valores vacíos a `null`

---

## Linter

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

Ambos proyectos usan ESLint 9 con configuración flat config (`eslint.config.js`).

---

## Stack tecnológico

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, React Router v6   |
| Backend    | Node.js 20, Express 4             |
| Base de datos | MariaDB 11                     |
| Auth       | JWT (jsonwebtoken) + bcrypt       |
| Contenedores | Docker + Docker Compose         |
| Linter     | ESLint 9 (flat config)            |
| Tests      | node:test (runner nativo)         |