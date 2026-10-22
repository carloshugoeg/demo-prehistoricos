# Demo prehistóricos — MongoDB → Firebase (BD redundante)

Aplicación Node + Express que implementa una **base de datos redundante**: cada escritura va primero a **MongoDB** y después se **replica en Firebase (Firestore)** con una sola petición HTTP.

## Entregables

| Entregable | Ubicación |
|------------|-----------|
| Aplicación | este proyecto (`npm start` → `http://localhost:3060`) |
| Colección Postman | `postman/Prehistoricos-Mongo-Firebase.postman_collection.json` |
| Pruebas de réplicas | `GET /api/animales/replicas/*` + UI (botón *Comparar réplicas*) |

## Flujo diseñado

```
Cliente (Postman / UI)
        │  1 sola petición
        ▼
   POST /api/animales
        │
        ├─1─► MongoDB  (colección animales)     ← primario
        ├─2─► Firebase (colección animales)     ← réplica
        └─3─► MongoDB  (colección mapeo_ids)    ← ambos ids
```

Lo mismo aplica a `PUT` (actualización) y `DELETE` (eliminación): **no** se ejecutan dos consultas en Postman; el servidor propaga el cambio.

## Requisitos

- Node.js
- MongoDB en `localhost:27017` (sin contraseña, como en la demo anterior)
- `serviceAccountKey.json` de Firebase (ya incluido si se copia desde `demo-red-social`)

## Arranque

```bash
cd demo-prehistoricos
cp .env.example .env   # si hace falta
npm install
npm start
```

Abrir `http://localhost:3060`.

Variables de entorno:

| Variable | Ejemplo |
|----------|---------|
| `PUERTO` | `3060` |
| `MONGO_URI` | `mongodb://localhost:27017/prehistoricos` |
| `FIREBASE_CREDENCIALES` | `./serviceAccountKey.json` |

## API (una petición por operación de escritura)

| Método | Ruta | Qué hace |
|--------|------|----------|
| `POST` | `/api/animales` | Crea en Mongo → replica en Firebase → guarda mapeo |
| `PUT` | `/api/animales/:id` | Actualiza Mongo y propaga a Firebase |
| `DELETE` | `/api/animales/:id` | Elimina en ambas bases + mapeo |
| `GET` | `/api/animales` | Lista Mongo (primario) |
| `GET` | `/api/animales/replicas/firebase` | Lista Firebase (réplica) |
| `GET` | `/api/animales/replicas/mapeos` | Lista pares `mongoId` / `firebaseId` |
| `GET` | `/api/animales/replicas/comparar` | Verifica sincronización |
| `GET` | `/api/animales/:id` | Devuelve Mongo + Firebase + mapeo |

### Ejemplo de creación

```json
POST /api/animales
{
  "nombre": "Rex",
  "especie": "Tyrannosaurus rex",
  "periodo": "Cretácico",
  "dieta": "Carnívoro",
  "habitat": "Llanuras de Laramidia",
  "longitudMetros": 12.3,
  "descripcion": "Depredador ápice del Cretácico superior"
}
```

Respuesta (resumen): `mongo`, `firebase` y `mapeo` con ambos ids.

## Postman

1. Importar `postman/Prehistoricos-Mongo-Firebase.postman_collection.json`
2. Variables de colección: `SERVIDOR_BASE=http://localhost:3060`, `RUTA_ANIMALES=/api/animales`
3. Ejecutar **Crear animal** → guarda `MONGO_ID` automáticamente
4. Ejecutar **Listar Mongo**, **Listar Firebase** y **Comparar réplicas**

## Modelo de datos

Animal prehistórico: `nombre`, `especie`, `periodo`, `dieta`, `habitat`, `longitudMetros`, `descripcion`.

Periodos: Triásico, Jurásico, Cretácico, Paleógeno, Neógeno, Pleistoceno.  
Dietas: Herbívoro, Carnívoro, Omnívoro, Piscívoro.
