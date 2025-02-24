// Importar dependencias
const webpush = require("web-push");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { networkInterfaces } = require("os");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Claves VAPID generadas
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

// Función para obtener la IP local
function getLocalIP() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }
    return "No se pudo obtener la IP";
}

// Iniciar servidor y mostrar las IPs
const PORT = 5001;
app.listen(PORT, async () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
    console.log(`🌍 IP LOCAL: http://${getLocalIP()}:${PORT}`);

    try {
        const { data: publicIP } = await axios.get("https://ifconfig.me", { timeout: 5000 });
        console.log(`🌐 IP PÚBLICA: http://${publicIP}:${PORT}`);
    } catch (error) {
        console.log("⚠️ No se pudo obtener la IP pública. Intenta ejecutar 'curl ifconfig.me' manualmente.");
    }
});
