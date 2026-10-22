// Conexión a Firebase (Firestore) con el Admin SDK.
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const rutaCredenciales = path.resolve(process.env.FIREBASE_CREDENCIALES);
const credenciales = require(rutaCredenciales);

initializeApp({ credential: cert(credenciales) });

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

console.log("Firebase (Firestore) inicializado");

module.exports = { db, FieldValue };
