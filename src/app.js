// Configuración de Express: middlewares, vista estática y rutas.
const path = require("path");
const express = require("express");
const animalRoutes = require("./routes/animalRoutes");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// API única: crear/actualizar/eliminar replica automáticamente a Firebase
app.use("/api/animales", animalRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

module.exports = app;
