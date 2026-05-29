// firebase-config.js
// Configuración de Firebase con tus credenciales

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
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Firebase inicializado correctamente");

// ==================== FUNCIONES PARA GUARDAR Y CARGAR ====================

// Guardar teoría en Firestore
async function guardarTeoriaFirebase(metodo, contenido) {
  try {
    await setDoc(doc(db, "teorias", metodo), {
      contenido: contenido,
      actualizado: new Date().toISOString()
    });
    console.log(`✅ Teoría "${metodo}" guardada en Firebase`);
    return true;
  } catch (error) {
    console.error("❌ Error guardando en Firebase:", error);
    alert("⚠️ Error guardando en Firebase: " + error.message);
    return false;
  }
}

// Cargar teoría desde Firestore
async function cargarTeoriaFirebase(metodo) {
  try {
    const docRef = doc(db, "teorias", metodo);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`✅ Teoría "${metodo}" cargada desde Firebase`);
      return docSnap.data().contenido;
    } else {
      console.log(`⚠️ Teoría "${metodo}" no existe en Firebase (primera vez)`);
      return null;
    }
  } catch (error) {
    console.error("❌ Error cargando desde Firebase:", error);
    return null;
  }
}

// Sincronizar: intenta cargar de Firebase, si no existe usa localStorage/default
async function sincronizarTeoria(metodo, defaultContent) {
  const fromFirebase = await cargarTeoriaFirebase(metodo);
  
  if (fromFirebase) {
    // Existe en Firebase, usar eso
    localStorage.setItem(`teoria_${metodo}`, fromFirebase);
    return fromFirebase;
  }
  
  // No existe en Firebase, usar localStorage o default
  const fromLocal = localStorage.getItem(`teoria_${metodo}`) || defaultContent;
  
  // Guardar en Firebase para la próxima vez
  await guardarTeoriaFirebase(metodo, fromLocal);
  
  return fromLocal;
}

// Exportar funciones para usar en el HTML (window global)
window.guardarTeoriaFirebase = guardarTeoriaFirebase;
window.cargarTeoriaFirebase = cargarTeoriaFirebase;
window.sincronizarTeoria = sincronizarTeoria;
