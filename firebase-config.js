// firebase-config.js
// Configuración de Firebase + Autenticación

const firebaseConfig = {
  apiKey: "AIzaSyAgb0COCN5TD5FANNFgf48aij0fbogaX8I",
  authDomain: "simplex-pl.firebaseapp.com",
  projectId: "simplex-pl",
  storageBucket: "simplex-pl.firebasestorage.app",
  messagingSenderId: "677094038209",
  appId: "1:677094038209:web:6b9aeee3cef1d5a2971240",
  measurementId: "G-TNXLCKV882"
};

// Importar Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

console.log("Firebase inicializado correctamente");

// ==================== VARIABLES GLOBALES ====================

let usuarioActual = null;

// ==================== AUTENTICACIÓN ====================

// Login con Google
async function loginConGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    usuarioActual = result.user;
    console.log("Usuario logueado:", usuarioActual.email);
    actualizarUIAutenticacion();
    return true;
  } catch (error) {
    console.error("Error en login:", error);
    alert("Error al iniciar sesión: " + error.message);
    return false;
  }
}

// Logout
async function logout() {
  try {
    await signOut(auth);
    usuarioActual = null;
    console.log("Usuario deslogueado");
    actualizarUIAutenticacion();
  } catch (error) {
    console.error("Error en logout:", error);
  }
}

// Verificar estado de autenticación al cargar
onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioActual = user;
    console.log("Usuario recuperado:", user.email);
  } else {
    usuarioActual = null;
    console.log("Usuario no autenticado");
  }
  actualizarUIAutenticacion();
});

// ==================== FUNCIONES DE FIRESTORE ====================

// Guardar teoría (solo si es admin)
async function guardarTeoriaFirebase(metodo, contenido) {
  // Verificar autenticación
  if (!usuarioActual) {
    alert("Debes iniciar sesión para guardar");
    await loginConGoogle();
    return false;
  }

  // Verificar si es admin
  if (!window.esAdmin(usuarioActual.email)) {
    alert(`Acceso denegado.\n\nTu email (${usuarioActual.email}) no tiene permisos de edición.\n\nContacta al administrador.`);
    return false;
  }

  try {
    await setDoc(doc(db, "teorias", metodo), {
      contenido: contenido,
      actualizado: new Date().toISOString(),
      editadoPor: usuarioActual.email
    });
    console.log(`Teoría "${metodo}" guardada por ${usuarioActual.email}`);
    return true;
  } catch (error) {
    console.error("Error guardando en Firebase:", error);
    alert("Error guardando en Firebase: " + error.message);
    return false;
  }
}

// Cargar teoría desde Firestore
async function cargarTeoriaFirebase(metodo) {
  try {
    const docRef = doc(db, "teorias", metodo);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`Teoría "${metodo}" cargada desde Firebase`);
      return docSnap.data().contenido;
    } else {
      console.log(`Teoría "${metodo}" no existe en Firebase (primera vez)`);
      return null;
    }
  } catch (error) {
    console.error("Error cargando desde Firebase:", error);
    return null;
  }
}

// Sincronizar teoría
async function sincronizarTeoria(metodo, defaultContent) {
  const fromFirebase = await cargarTeoriaFirebase(metodo);
  
  if (fromFirebase) {
    localStorage.setItem(`teoria_${metodo}`, fromFirebase);
    return fromFirebase;
  }
  
  const fromLocal = localStorage.getItem(`teoria_${metodo}`) || defaultContent;
  
  if (usuarioActual && window.esAdmin(usuarioActual.email)) {
    await guardarTeoriaFirebase(metodo, fromLocal);
  }
  
  return fromLocal;
}

// ==================== ACTUALIZAR UI ====================

// Actualizar botones de Login/Logout
function actualizarUIAutenticacion() {
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const userInfo = document.getElementById('user-info');
  
  if (!btnLogin || !btnLogout || !userInfo) {
    console.log("Elementos de auth no encontrados aún en DOM");
    return;
  }

  if (usuarioActual) {
    // Usuario logueado
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'inline-block';
    userInfo.innerHTML = `
      <small style="color: var(--text-secondary);">
         ${usuarioActual.email}
        ${window.esAdmin(usuarioActual.email) ? '(Admin)' : '(Lector)'}
      </small>
    `;
  } else {
    // Usuario no logueado
    btnLogin.style.display = 'inline-block';
    btnLogout.style.display = 'none';
    userInfo.innerHTML = `<small style="color: var(--text-secondary);"> No autenticado</small>`;
  }
}

// ==================== EXPORTAR FUNCIONES ====================

window.loginConGoogle = loginConGoogle;
window.logout = logout;
window.guardarTeoriaFirebase = guardarTeoriaFirebase;
window.cargarTeoriaFirebase = cargarTeoriaFirebase;
window.sincronizarTeoria = sincronizarTeoria;
window.actualizarUIAutenticacion = actualizarUIAutenticacion;
window.getUsuarioActual = () => usuarioActual;
