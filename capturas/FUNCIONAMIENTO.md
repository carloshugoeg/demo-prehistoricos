# Demostración de funcionamiento — Prehistóricos (Mongo → Firebase)

Aplicación Node + Express con **base de datos redundante**: una sola petición escribe en MongoDB y replica en Firebase.

## Arranque verificado

```
Firebase (Firestore) inicializado
MongoDB conectado
Servidor listo en http://localhost:3060
```

## 1. Creación con una sola petición

`POST /api/animales`

Resultado observado:

- Documento en Mongo (`animales`) con `firebaseId`
- Documento réplica en Firestore (`animales`) con `mongoId`
- Par de ids en colección `mapeo_ids`

Ejemplo:

| Campo | Valor |
|-------|-------|
| mongoId | `6ada56e43dc71810170497fa` |
| firebaseId | `An1jRJV3mOA1nnKJ9hFh` |
| nombre | Rex (Tyrannosaurus rex) |

## 2. Pruebas de réplicas

| Endpoint | Resultado |
|----------|-----------|
| `GET /api/animales` | Lista Mongo (primario) |
| `GET /api/animales/replicas/firebase` | Lista Firebase (réplica) |
| `GET /api/animales/replicas/mapeos` | Pares mongoId ↔ firebaseId |
| `GET /api/animales/replicas/comparar` | `todoSincronizado: true` |

Tras crear Rex + Lanudo:

```json
{
  "totales": { "mongo": 2, "firebase": 2, "mapeos": 2 },
  "todoSincronizado": true
}
```

## 3. Actualización y eliminación (también 1 petición)

- `PUT /api/animales/:id` → cambia hábitat/descripción en **ambas** bases
- `DELETE /api/animales/:id` → borra Mongo + Firebase + mapeo

## 4. Postman

Colección: `postman/Prehistoricos-Mongo-Firebase.postman_collection.json`

Variables:

- `SERVIDOR_BASE` = `http://localhost:3060`
- `RUTA_ANIMALES` = `/api/animales`

Flujo recomendado: **Crear animal** → **Listar Mongo** → **Listar Firebase** → **Comparar réplicas**.
