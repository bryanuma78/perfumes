// ===============================
// 🔥 FIREBASE
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDerAViXEfvWCFuzDoL-wrhTMxvI-Lu0s0",
  authDomain: "admin-perfumes.firebaseapp.com",
  projectId: "admin-perfumes",
  storageBucket: "admin-perfumes.appspot.com",
  messagingSenderId: "690143324027",
  appId: "1:690143324027:web:f4df0b6bf8350ea4087fde"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// 🛒 ELEMENTOS
// ===============================
const perfumeContainer = document.getElementById("perfumeContainer");
const carritoCount = document.getElementById("carritoCount");
const carritoLista = document.getElementById("carritoLista");

let carrito = [];
let descripciones = {};
let filtros = { tipo: "todo", genero: "todo" };

// ===============================
// 🔄 CARGAR PERFUMES
// ===============================
async function cargarPerfumes() {
  const querySnapshot = await getDocs(collection(db, "productos"));
  descripciones = {};

  querySnapshot.forEach((doc) => {
    descripciones[doc.id] = {
      key: doc.id,
      ...doc.data(),
      img: doc.data().imagen
    };
  });

  renderPerfumes();
}

// ===============================
// 🎨 RENDER
// ===============================
function renderPerfumes() {
  perfumeContainer.innerHTML = "";

  let lista = Object.values(descripciones);

  if (filtros.tipo !== "todo") {
    lista = lista.filter(p => p.tipo === filtros.tipo);
  }

  if (filtros.genero !== "todo") {
    lista = lista.filter(p => p.genero === filtros.genero);
  }

  lista.forEach((perfume) => {

    const precioHTML = perfume.descuento && perfume.descuento > 0
      ? `
        <p class="card-text mb-1">
          <span class="text-muted text-decoration-line-through">
            $${perfume.precio.toFixed(2)}
          </span>
        </p>
        <p class="card-text text-success fw-bold">
          $${(perfume.precio - (perfume.precio * perfume.descuento / 100)).toFixed(2)}
          <span class="badge bg-danger ms-2">-${perfume.descuento}%</span>
        </p>
      `
      : `
        <p class="card-text text-success fw-bold">
          $${perfume.precio.toFixed(2)}
        </p>
      `;

    perfumeContainer.innerHTML += `
      <div class="col">
        <div class="card h-100 shadow-sm">
          <img src="${perfume.img}" class="card-img-top" alt="${perfume.titulo}">
          <div class="card-body text-center">
            <h5 class="card-title">${perfume.titulo}</h5>
            <p class="card-text"><strong>Familia:</strong> ${perfume.descripcion.familia}</p>
            <p class="card-text text-info"><strong>Género:</strong> ${perfume.genero}</p>

            ${precioHTML}

            <div class="input-group mb-2 justify-content-center" style="max-width:120px;margin:auto;">
              <span class="input-group-text">Cant.</span>
              <input type="number" min="1" placeholder="0" class="form-control text-center" id="cantidad-${perfume.key}">

            </div>

            <div class="d-flex justify-content-center gap-2 mt-2">
              <button class="btn btn-grad-info" onclick="verDescripcion('${perfume.key}')">Ver</button>
              <button class="btn btn-grad-dark" onclick="agregarAlCarrito('${perfume.key}')">Agregar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

// ===============================
// 🔎 FILTRO NAVBAR
// ===============================
window.filtrarCategoria = function(tipo, genero) {
  filtros.tipo = tipo;
  filtros.genero = genero;
  renderPerfumes();
};

// ===============================
// 👁 MODAL
// ===============================
window.verDescripcion = function(key) {
  const perfume = descripciones[key];

  document.getElementById("descripcionTitulo").textContent = perfume.titulo;
  document.getElementById("descripcionImg").src = perfume.img;
  document.getElementById("descFamilia").textContent = perfume.descripcion.familia;
  document.getElementById("descSalida").textContent = perfume.descripcion.salida;
  document.getElementById("descCorazon").textContent = perfume.descripcion.corazon;
  document.getElementById("descFondo").textContent = perfume.descripcion.fondo;
  document.getElementById("descPrecio").textContent = `$${perfume.precio.toFixed(2)}`;
  document.getElementById("descGenero").textContent = perfume.genero;

  new bootstrap.Modal(document.getElementById("modalDescripcion")).show();
};

// ===============================
// ➕ CARRITO
// ===============================
window.agregarAlCarrito = function(key) {
  const cantidad = parseInt(document.getElementById(`cantidad-${key}`).value);

  if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");

  const existe = carrito.find(p => p.key === key);

  if (existe) existe.cantidad += cantidad;
  else carrito.push({ key, ...descripciones[key], cantidad });

  carritoCount.textContent = carrito.reduce((a,b)=>a+b.cantidad,0);
  renderCarrito();
};

function renderCarrito() {
  if (!carrito.length) {
    carritoLista.innerHTML = `<p class="text-muted">Tu carrito está vacío.</p>`;
    return;
  }

  let total = 0;

  carritoLista.innerHTML = `
    <ul class="list-group mb-3">
      ${carrito.map((p,i)=>{
        const precioFinal = p.descuento && p.descuento > 0
          ? p.precio - (p.precio * p.descuento / 100)
          : p.precio;

        total += precioFinal * p.cantidad;

        return `
          <li class="list-group-item d-flex justify-content-between">
            <div>
              <strong>${p.titulo}</strong><br>
              $${precioFinal.toFixed(2)} x ${p.cantidad}
            </div>
            <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${i})">🗑</button>
          </li>
        `;
      }).join("")}
    </ul>
    <strong>Total: $${total.toFixed(2)}</strong>
  `;
}

window.eliminarDelCarrito = function(i){
  carrito.splice(i,1);
  carritoCount.textContent = carrito.reduce((a,b)=>a+b.cantidad,0);
  renderCarrito();
};

// ===============================
// 📲 WHATSAPP
// ===============================
window.finalizarCompra = function() {
  if (!carrito.length) return alert("Carrito vacío");

  let msg = "🛍️ Pedido:\n\n";
  let total = 0;

  carrito.forEach(p=>{
    const precioFinal = p.descuento && p.descuento > 0
      ? p.precio - (p.precio * p.descuento / 100)
      : p.precio;

    msg += `${p.titulo} x${p.cantidad} - $${(precioFinal*p.cantidad).toFixed(2)}\n`;
    total += precioFinal*p.cantidad;
  });

  msg += `\nTotal: $${total.toFixed(2)}`;

  window.open(`https://wa.me/593992570322?text=${encodeURIComponent(msg)}`);
};

// ===============================
// 🚀 INIT
// ===============================
cargarPerfumes();
