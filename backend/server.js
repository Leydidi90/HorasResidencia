require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 10000; // Render usa el puerto 10000 por defecto

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Configuración de Nodemailer (Ajustar con tus credenciales reales)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Ej: usar gmail
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Ruta básica requerida para que Render sepa que la app está viva (Health check)
app.get('/', (req, res) => {
  res.send('Backend de Notificaciones de Prácticas de Ingeniería Corriendo 🚀');
});

// Tarea Cron que corre todos los días a las 18:00 (6 PM)
cron.schedule('0 18 * * *', async () => {
  console.log('Ejecutando verificación de check-in...');
  const today = new Date().toLocaleDateString('es-ES');

  try {
    // 1. Obtener todos los practicantes
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'resident');

    if (userError) throw userError;

    // 2. Obtener los logs de 'in' de hoy
    const { data: logs, error: logsError } = await supabase
      .from('logs')
      .select('*')
      .eq('type', 'in')
      .eq('date', today);

    if (logsError) throw logsError;

    // Obtener los IDs de quienes hicieron checkin hoy
    const usersWithCheckin = new Set(logs.map(l => l.user_id));

    // 3. Enviar correo a los que NO hicieron check-in
    for (const user of users) {
      if (!usersWithCheckin.has(user.id)) {
        console.log(`Enviando alerta a ${user.email}`);
        
        /* 
        // DESCOMENTAR CUANDO TENGAS CREDENCIALES DE CORREO
        await transporter.sendMail({
          from: '"Portal de Prácticas" <noreply@residencia.com>',
          to: user.email,
          subject: '⚠️ Alerta: Registro de Asistencia Faltante',
          text: `Hola ${user.name},\n\nHemos notado que no has registrado tu entrada el día de hoy (${today}).\n\nRecuerda que debes cumplir 500 horas, ¡no olvides hacer Check-in!\n\nSaludos,\nSistema de Prácticas de Ingeniería.`
        });
        */
      }
    }
  } catch (error) {
    console.error('Error en el cron job:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Cron escuchando en el puerto ${PORT}`);
});
