// SERVICIO DE RÉPLICA: una sola operación del cliente → Mongo (primario) + Firebase (réplica).
// Flujo de creación: MongoDB → Firebase → guardar ambos ids en mapeo_ids.
const animalMongo = require("../models/animalMongo");
const animalFirebase = require("../models/animalFirebase");
const mapeoIds = require("../models/mapeoIds");

const camposAnimal = (datos) => ({
  nombre: datos.nombre,
  especie: datos.especie,
  periodo: datos.periodo,
  dieta: datos.dieta,
  habitat: datos.habitat,
  longitudMetros: datos.longitudMetros,
  descripcion: datos.descripcion,
});

/**
 * Crea en MongoDB, luego replica en Firebase y guarda ambos ids.
 * Una sola petición HTTP dispara todo el proceso.
 */
const crearConReplica = async (datos) => {
  const enMongo = await animalMongo.crear(camposAnimal(datos));

  let enFirebase;
  try {
    enFirebase = await animalFirebase.crear({
      ...camposAnimal(datos),
      mongoId: enMongo.id,
    });
  } catch (error) {
    // Si falla Firebase, deshacemos el alta en Mongo para no dejar datos huérfanos
    await animalMongo.eliminar(enMongo.id);
    throw error;
  }

  await animalMongo.vincularFirebase(enMongo.id, enFirebase.id);
  const mapeo = await mapeoIds.crear({
    mongoId: enMongo.id,
    firebaseId: enFirebase.id,
    nombre: enMongo.nombre,
  });

  return {
    mensaje: "Creado en MongoDB y replicado en Firebase",
    mongo: { ...enMongo, firebaseId: enFirebase.id },
    firebase: enFirebase,
    mapeo,
  };
};

/**
 * Actualiza en MongoDB y propaga el cambio a Firebase usando el mapeo de ids.
 */
const actualizarConReplica = async (mongoId, datos) => {
  const existente = await animalMongo.obtenerPorId(mongoId);
  if (!existente) return null;

  const mapeo = await mapeoIds.buscarPorMongoId(mongoId);
  const firebaseId = mapeo?.firebaseId || existente.firebaseId;
  if (!firebaseId) {
    const error = new Error("No hay réplica en Firebase para este animal");
    error.name = "ReplicaError";
    throw error;
  }

  const enMongo = await animalMongo.actualizar(mongoId, camposAnimal({ ...existente, ...datos }));
  const enFirebase = await animalFirebase.actualizar(firebaseId, camposAnimal({ ...existente, ...datos }));

  return {
    mensaje: "Actualizado en MongoDB y replicado en Firebase",
    mongo: enMongo,
    firebase: enFirebase,
  };
};

/**
 * Elimina en MongoDB y en Firebase, y borra el registro de mapeo.
 */
const eliminarConReplica = async (mongoId) => {
  const existente = await animalMongo.obtenerPorId(mongoId);
  if (!existente) return null;

  const mapeo = await mapeoIds.buscarPorMongoId(mongoId);
  const firebaseId = mapeo?.firebaseId || existente.firebaseId;

  const enMongo = await animalMongo.eliminar(mongoId);

  let enFirebase = null;
  if (firebaseId) {
    enFirebase = await animalFirebase.eliminar(firebaseId);
  }

  if (mapeo) {
    await mapeoIds.eliminarPorMongoId(mongoId);
  }

  return {
    mensaje: "Eliminado en MongoDB y en Firebase",
    mongo: enMongo,
    firebase: enFirebase,
  };
};

/** Listados independientes para verificar que las réplicas coinciden. */
const listarMongo = () => animalMongo.listar();
const listarFirebase = () => animalFirebase.listar();
const listarMapeos = () => mapeoIds.listar();

const obtenerPorId = async (mongoId) => {
  const mongo = await animalMongo.obtenerPorId(mongoId);
  if (!mongo) return null;

  const mapeo = await mapeoIds.buscarPorMongoId(mongoId);
  const firebaseId = mapeo?.firebaseId || mongo.firebaseId;
  const firebase = firebaseId ? await animalFirebase.obtenerPorId(firebaseId) : null;

  return { mongo, firebase, mapeo };
};

/**
 * Compara ambas bases y reporta coincidencias / diferencias.
 * Útil para las pruebas de réplica del entregable.
 */
const compararReplicas = async () => {
  const [mongo, firebase, mapeos] = await Promise.all([
    animalMongo.listar(),
    animalFirebase.listar(),
    mapeoIds.listar(),
  ]);

  const pares = mapeos.map((m) => {
    const docMongo = mongo.find((a) => a.id === m.mongoId);
    const docFirebase = firebase.find((a) => a.id === m.firebaseId);
    const sincronizado =
      !!docMongo &&
      !!docFirebase &&
      docMongo.nombre === docFirebase.nombre &&
      docMongo.especie === docFirebase.especie &&
      docMongo.periodo === docFirebase.periodo &&
      docMongo.dieta === docFirebase.dieta &&
      docMongo.habitat === docFirebase.habitat;

    return {
      mongoId: m.mongoId,
      firebaseId: m.firebaseId,
      nombre: m.nombre,
      existeEnMongo: !!docMongo,
      existeEnFirebase: !!docFirebase,
      sincronizado,
    };
  });

  return {
    totales: {
      mongo: mongo.length,
      firebase: firebase.length,
      mapeos: mapeos.length,
    },
    pares,
    todoSincronizado: pares.length > 0 && pares.every((p) => p.sincronizado),
  };
};

module.exports = {
  crearConReplica,
  actualizarConReplica,
  eliminarConReplica,
  listarMongo,
  listarFirebase,
  listarMapeos,
  obtenerPorId,
  compararReplicas,
};
