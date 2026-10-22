// MODELO réplica (Firebase / Firestore): colección "animales".
const { db, FieldValue } = require("../config/firebase");

const coleccion = db.collection("animales");

const aObjeto = (doc) => {
  if (!doc.exists) return null;
  const datos = doc.data();
  return {
    id: doc.id,
    nombre: datos.nombre,
    especie: datos.especie,
    periodo: datos.periodo,
    dieta: datos.dieta,
    habitat: datos.habitat,
    longitudMetros: datos.longitudMetros ?? null,
    descripcion: datos.descripcion,
    mongoId: datos.mongoId ?? null,
    creadoEn: datos.creadoEn ? datos.creadoEn.toDate() : null,
    actualizadoEn: datos.actualizadoEn ? datos.actualizadoEn.toDate() : null,
  };
};

const listar = async () => {
  const snap = await coleccion.orderBy("creadoEn", "desc").get();
  return snap.docs.map(aObjeto);
};

const obtenerPorId = async (id) => aObjeto(await coleccion.doc(id).get());

const crear = async ({ nombre, especie, periodo, dieta, habitat, longitudMetros, descripcion, mongoId }) => {
  const ref = await coleccion.add({
    nombre,
    especie,
    periodo,
    dieta,
    habitat,
    longitudMetros: longitudMetros ?? null,
    descripcion: descripcion || "",
    mongoId: mongoId || null,
    creadoEn: FieldValue.serverTimestamp(),
    actualizadoEn: FieldValue.serverTimestamp(),
  });
  return aObjeto(await ref.get());
};

const actualizar = async (id, datos) => {
  const ref = coleccion.doc(id);
  if (!(await ref.get()).exists) return null;
  await ref.update({ ...datos, actualizadoEn: FieldValue.serverTimestamp() });
  return aObjeto(await ref.get());
};

const eliminar = async (id) => {
  const ref = coleccion.doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;
  await ref.delete();
  return aObjeto(doc);
};

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
