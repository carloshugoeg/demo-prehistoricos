// Punto de entrada: carga .env, conecta MongoDB y arranca Express.
require("dotenv").config();

const app = require("./src/app");
const conectarMongo = require("./src/config/mongo");

const PUERTO = process.env.PUERTO || 3060;

const iniciar = async () => {
  try {
    await conectarMongo();
    app.listen(PUERTO, () => {
      console.log(`Servidor listo en http://localhost:${PUERTO}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
  }
};

iniciar();
