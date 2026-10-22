// Conexión a MongoDB con Mongoose.
const mongoose = require("mongoose");

const conectarMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB conectado");
};

module.exports = conectarMongo;
