const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpush = require('web-push');
const { networkInterfaces } = require('os');
const axios = require('axios');

const app = express();
const PORT = 5001;

// Permitir el uso de CORS
app.use(cors());

// Configurar body-parser para JSON
app.use(bodyParser.json());

// Servir archivos estáticos (como HTML, CSS y JS)
app.use(express.static(path.join(__dirname, 'public'))); // Esto busca archivos estáticos en la carpeta 'public'

// Claves VAPID (mantén estas claves seguras)
const publicVapidKey = 'BAvJThBSIt_13X7E498WBbaKLfCGa_nu9XOMqJO7jfnChUpY0JqfyCgxbsMDLaOHfqOP7WB-PsHSgXAfuxRcwCQ';
const privateVapidKey = 's3MUYjz3Eyg6AzsaZ4FRBM2Wtk_t-K5sK-JQ3hfQg6g';

// Configurar las claves VAPID
webpush.setVapidDetails('mailto:example@example.com', publicVapidKey, privateVapidKey);

let subscriptions = [];

// Permitir tanto GET como POST en /subscribe
app.route('/subscribe')
  .get((req, res) => {
    // Mostrar las suscripciones almacenadas (solo por ejemplo)
    res.status(200).json(subscriptions);
  })
  .post((req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    console.log('📩 Nueva suscripción almacenada:', subscription);
    res.status(201).json({ message: 'Suscripción almacenada' });
  });

// Ruta para enviar notificaciones push
app.post('/sendNotification', (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });

  if (subscriptions.length === 0) {
    return res.status(400).json({ message: 'No hay suscriptores registrados' });
  }

  // Enviar notificación a todos los suscriptores
  subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, payload).catch(err => console.error('❌ Error al enviar notificación:', err));
  });

  console.log('✅ Notificación enviada.');
  res.json({ message: 'Notificación enviada con éxito' });
});

// Función para obtener la IP local
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'No se pudo obtener la IP';
}

// Iniciar el servidor y mostrar IPs
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
  console.log(`🌍 IP LOCAL: http://${getLocalIP()}:${PORT}`);

  try {
    const { data: publicIP } = await axios.get('https://ifconfig.me', { timeout: 5000 });
    console.log(`🌐 IP PÚBLICA: http://${publicIP}:${PORT}`);
    console.log('🔎 Verifica si el puerto está abierto en: https://www.canyouseeme.org/');
  } catch (error) {
    console.log('⚠️ No se pudo obtener la IP pública. Intenta ejecutar "curl ifconfig.me" manualmente.');
  }
});
