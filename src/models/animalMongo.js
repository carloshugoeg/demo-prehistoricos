// MODELO primario (MongoDB): colección "animales".
const mongoose = require("mongoose");

const esquema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    especie: { type: String, required: true, trim: true },
    periodo: {
      type: String,
      required: true,
      enum: ["Triásico", "Jurásico", "Cretácico", "Paleógeno", "Neógeno", "Pleistoceno"],
    },
    dieta: {
      type: String,
      required: true,
      enum: ["Herbívoro", "Carnívoro", "Omnívoro", "Piscívoro"],
    },
    habitat: { type: String, required: true, trim: true },
    longitudMetros: { type: Number, min: 0 },
    descripcion: { type: String, trim: true, maxlength: 500, default: "" },
    // Id del documento réplica en Firestore (se guarda tras crear en Firebase)
    firebaseId: { type: String, default: null },
  },
  { timestamps: true, collection: "animales" }
);

const Animal = mongoose.model("Animal", esquema);

const aObjeto = (doc) =>
  doc && {
    id: doc._id.toString(),
    nombre: doc.nombre,
    especie: doc.especie,
    periodo: doc.periodo,
    dieta: doc.dieta,
    habitat: doc.habitat,
    longitudMetros: doc.longitudMetros ?? null,
    descripcion: doc.descripcion,
    firebaseId: doc.firebaseId,
    creadoEn: doc.createdAt,
    actualizadoEn: doc.updatedAt,
  };

const listar = async () => {
  const docs = await Animal.find().sort({ createdAt: -1 });
  return docs.map(aObjeto);
};

const obtenerPorId = async (id) => aObjeto(await Animal.findById(id));

const crear = async (datos) => aObjeto(await Animal.create(datos));

const actualizar = async (id, datos) =>
  aObjeto(
    await Animal.findByIdAndUpdate(id, { $set: datos }, { returnDocument: "after", runValidators: true })
  );

const eliminar = async (id) => aObjeto(await Animal.findByIdAndDelete(id));

const vincularFirebase = async (id, firebaseId) =>
  aObjeto(
    await Animal.findByIdAndUpdate(id, { $set: { firebaseId } }, { returnDocument: "after" })
  );

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  vincularFirebase,
};
