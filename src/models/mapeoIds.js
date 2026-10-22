// Colección auxiliar en MongoDB que guarda ambos ids (Mongo + Firebase).
// Facilita localizar la réplica en updates/deletes y documentar la redundancia.
const mongoose = require("mongoose");

const esquema = new mongoose.Schema(
  {
    mongoId: { type: String, required: true, unique: true, index: true },
    firebaseId: { type: String, required: true, unique: true, index: true },
    nombre: { type: String, required: true },
  },
  { timestamps: true, collection: "mapeo_ids" }
);

const Mapeo = mongoose.model("MapeoIds", esquema);

const aObjeto = (doc) =>
  doc && {
    id: doc._id.toString(),
    mongoId: doc.mongoId,
    firebaseId: doc.firebaseId,
    nombre: doc.nombre,
    creadoEn: doc.createdAt,
  };

const crear = async ({ mongoId, firebaseId, nombre }) =>
  aObjeto(await Mapeo.create({ mongoId, firebaseId, nombre }));

const buscarPorMongoId = async (mongoId) => aObjeto(await Mapeo.findOne({ mongoId }));

const buscarPorFirebaseId = async (firebaseId) => aObjeto(await Mapeo.findOne({ firebaseId }));

const eliminarPorMongoId = async (mongoId) => aObjeto(await Mapeo.findOneAndDelete({ mongoId }));

const listar = async () => {
  const docs = await Mapeo.find().sort({ createdAt: -1 });
  return docs.map(aObjeto);
};

module.exports = {
  crear,
  buscarPorMongoId,
  buscarPorFirebaseId,
  eliminarPorMongoId,
  listar,
};
