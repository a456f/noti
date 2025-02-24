// Importar dependencias
const webpush = require("web-push");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // Importa el módulo path para trabajar con rutas de archivos

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Claves VAPID generadas (reemplaza por las claves reales)
const publicVapidKey = "BAvJThBSIt_13X7E498WBbaKLfCGa_nu9XOMqJO7jfnChUpY0JqfyCgxbsMDLaOHfqOP7WB-PsHSgXAfuxRcwCQ";
const privateVapidKey = "s3MUYjz3Eyg6AzsaZ4FRBM2Wtk_t-K5sK-JQ3hfQg6g";

webpush.setVapidDetails("mailto:example@example.com", publicVapidKey, privateVapidKey);

let subscriptions = [];

// Ruta para suscribirse
app.post("/subscribe", (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({ message: "Suscripción almacenada" });
});

// Ruta para enviar notificación
app.post("/sendNotification", (req, res) => {
    const { title, body } = req.body;
    const payload = JSON.stringify({ title, body });

    subscriptions.forEach(subscription => {
        webpush.sendNotification(subscription, payload).catch(err => console.error(err));
    });

    res.json({ message: "Notificación enviada con éxito" });
});

// Servir archivos estáticos desde la carpeta actual
app.use(express.static(__dirname));

// Configurar servidor para escuchar en todas las interfaces y en el puerto 5001
app.listen(5001, '0.0.0.0', () => console.log("Servidor corriendo en el puerto 5001"));
