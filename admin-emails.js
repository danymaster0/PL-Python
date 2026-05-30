// admin-emails.js
// Lista de correos que pueden editar las teorías

const ADMIN_EMAILS = [
  "danymaster0@gmail.com",           // Cambia esto por TU email
  "jesusmorales.hdz.2002@gmail.com",         // Añade más si quieres
];

// Verificar si un email es admin
function esAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}

// Exportar para usar en HTML
window.ADMIN_EMAILS = ADMIN_EMAILS;
window.esAdmin = esAdmin;
