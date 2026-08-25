/**
 * EJEMPLO: Sistema de Notificaciones Cron (Backend)
 * 
 * Este script es una demostración de cómo implementar la lógica
 * para verificar si los residentes no han hecho check-in.
 * 
 * Dependencias necesarias en un entorno real:
 * npm install node-cron nodemailer
 */

const cron = require('node-cron');
// const nodemailer = require('nodemailer');

// Mock de base de datos
const mockResidents = [
  { id: 1, name: "Dr. Ana Pérez", email: "ana.perez@hospital.com", lastCheckInDate: "2023-10-25" },
  { id: 2, name: "Dr. Carlos Gómez", email: "carlos.gomez@hospital.com", lastCheckInDate: "2023-10-26" } // Hizo checkin hoy
];

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Configuración simulada de Nodemailer
/*
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  auth: { user: 'user@example.com', pass: 'password' }
});
*/

const sendWarningEmail = async (residentEmail, residentName) => {
  console.log(`[NOTIFICACIÓN] Enviando correo de alerta a ${residentEmail}...`);
  console.log(`Asunto: RECORDATORIO: Registro de Entrada Pendiente`);
  console.log(`Cuerpo: Hola ${residentName}, hemos notado que no has registrado tu entrada el día de hoy. Por favor accede al portal para hacer tu Check-In.\n`);
  
  // Lógica real de Nodemailer:
  // await transporter.sendMail({ from: 'admin@hospital.com', to: residentEmail, subject: '...', text: '...' });
};

const checkMissingCheckIns = () => {
  console.log("\n--- Ejecutando tarea programada (Cron Job) ---");
  const today = getTodayDateString();
  
  const missingResidents = mockResidents.filter(r => r.lastCheckInDate !== today);
  
  if (missingResidents.length > 0) {
    console.log(`Se encontraron ${missingResidents.length} residentes sin check-in hoy.`);
    missingResidents.forEach(resident => {
      sendWarningEmail(resident.email, resident.name);
    });
  } else {
    console.log("Todos los residentes han hecho check-in hoy.");
  }
  console.log("--- Tarea finalizada ---\n");
};

// Programar tarea para que se ejecute todos los días a las 9:00 AM
// Formato: 'Minuto Hora DíaDelMes Mes DíaDeLaSemana'
console.log("Iniciando servicio de notificaciones...");
console.log("El cron job está configurado para ejecutarse a las 09:00 AM todos los días.");

// cron.schedule('0 9 * * *', checkMissingCheckIns);

// Para propósitos de demostración, ejecutamos la función inmediatamente:
checkMissingCheckIns();
