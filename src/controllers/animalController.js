// CONTROLADOR: valida la petición y delega al servicio de réplica.
// El cliente hace UNA sola petición; el servicio escribe en Mongo y Firebase.
const replica = require("../services/replicaService");

const PERIODOS = ["Triásico", "Jurásico", "Cretácico", "Paleógeno", "Neógeno", "Pleistoceno"];
const DIETAS = ["Herbívoro", "Carnívoro", "Omnívoro", "Piscívoro"];

const manejarError = (res, error) => {
  if (error.name === "CastError") {
    return res.status(400).json({ error: "El id no tiene un formato válido" });
  }
  if (error.name === "ValidationError" || error.name === "ReplicaError") {
    return res.status(400).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: "Error interno del servidor" });
};

const validarCampos = (datos, { parcial = false } = {}) => {
  const { nombre, especie, periodo, dieta, habitat, longitudMetros, descripcion } = datos;

  if (!parcial || nombre !== undefined) {
    if (typeof nombre !== "string" || !nombre.trim()) return "nombre debe ser un texto no vacío";
  }
  if (!parcial || especie !== undefined) {
    if (typeof especie !== "string" || !especie.trim()) return "especie debe ser un texto no vacío";
  }
  if (!parcial || periodo !== undefined) {
    if (!PERIODOS.includes(periodo)) return `periodo debe ser uno de: ${PERIODOS.join(", ")}`;
  }
  if (!parcial || dieta !== undefined) {
    if (!DIETAS.includes(dieta)) return `dieta debe ser una de: ${DIETAS.join(", ")}`;
  }
  if (!parcial || habitat !== undefined) {
    if (typeof habitat !== "string" || !habitat.trim()) return "habitat debe ser un texto no vacío";
  }
  if (longitudMetros !== undefined && longitudMetros !== null) {
    if (typeof longitudMetros !== "number" || Number.isNaN(longitudMetros) || longitudMetros < 0) {
      return "longitudMetros debe ser un número >= 0";
    }
  }
  if (descripcion !== undefined && descripcion !== null) {
    if (typeof descripcion !== "string" || descripcion.length > 500) {
      return "descripcion debe ser un texto de máximo 500 caracteres";
    }
  }
  return null;
};

const normalizar = (body) => {
  const out = {};
  if (body.nombre !== undefined) out.nombre = body.nombre.trim();
  if (body.especie !== undefined) out.especie = body.especie.trim();
  if (body.periodo !== undefined) out.periodo = body.periodo;
  if (body.dieta !== undefined) out.dieta = body.dieta;
  if (body.habitat !== undefined) out.habitat = body.habitat.trim();
  if (body.longitudMetros !== undefined) out.longitudMetros = body.longitudMetros;
  if (body.descripcion !== undefined) out.descripcion = body.descripcion.trim();
  return out;
};

const listar = async (req, res) => {
  try {
    res.json(await replica.listarMongo());
  } catch (error) {
    manejarError(res, error);
  }
};

const listarFirebase = async (req, res) => {
  try {
    res.json(await replica.listarFirebase());
  } catch (error) {
    manejarError(res, error);
  }
};

const listarMapeos = async (req, res) => {
  try {
    res.json(await replica.listarMapeos());
  } catch (error) {
    manejarError(res, error);
  }
};

const comparar = async (req, res) => {
  try {
    res.json(await replica.compararReplicas());
  } catch (error) {
    manejarError(res, error);
  }
};

const obtener = async (req, res) => {
  try {
    const resultado = await replica.obtenerPorId(req.params.id);
    if (!resultado) return res.status(404).json({ error: "Animal no encontrado" });
    res.json(resultado);
  } catch (error) {
    manejarError(res, error);
  }
};

const crear = async (req, res) => {
  try {
    const body = req.body || {};
    const requeridos = ["nombre", "especie", "periodo", "dieta", "habitat"];
    for (const campo of requeridos) {
      if (!body[campo]) {
        return res.status(400).json({ error: `${campo} es obligatorio` });
      }
    }
    const problema = validarCampos(body);
    if (problema) return res.status(400).json({ error: problema });

    const resultado = await replica.crearConReplica(normalizar(body));
    res.status(201).json(resultado);
  } catch (error) {
    manejarError(res, error);
  }
};

const actualizar = async (req, res) => {
  try {
    const body = req.body || {};
    if (Object.keys(body).length === 0) {
      return res.status(400).json({ error: "Envía al menos un campo para actualizar" });
    }
    const problema = validarCampos(body, { parcial: true });
    if (problema) return res.status(400).json({ error: problema });

    const resultado = await replica.actualizarConReplica(req.params.id, normalizar(body));
    if (!resultado) return res.status(404).json({ error: "Animal no encontrado" });
    res.json(resultado);
  } catch (error) {
    manejarError(res, error);
  }
};

const eliminar = async (req, res) => {
  try {
    const resultado = await replica.eliminarConReplica(req.params.id);
    if (!resultado) return res.status(404).json({ error: "Animal no encontrado" });
    res.json(resultado);
  } catch (error) {
    manejarError(res, error);
  }
};

module.exports = {
  listar,
  listarFirebase,
  listarMapeos,
  comparar,
  obtener,
  crear,
  actualizar,
  eliminar,
};
