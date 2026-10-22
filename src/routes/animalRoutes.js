// RUTAS: una sola API de escritura; endpoints de lectura para verificar réplicas.
const { Router } = require("express");
const controlador = require("../controllers/animalController");

const router = Router();

// Escritura: UNA petición → Mongo + Firebase
router.post("/", controlador.crear);
router.put("/:id", controlador.actualizar);
router.delete("/:id", controlador.eliminar);

// Lectura primaria (Mongo) y verificación de réplicas
router.get("/", controlador.listar);
router.get("/replicas/firebase", controlador.listarFirebase);
router.get("/replicas/mapeos", controlador.listarMapeos);
router.get("/replicas/comparar", controlador.comparar);
router.get("/:id", controlador.obtener);

module.exports = router;
