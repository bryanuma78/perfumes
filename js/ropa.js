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
const ropaContainer = document.getElementById("ropaContainer");
const carritoCount = document.getElementById("carritoCount");
const carritoLista = document.getElementById("carritoLista");

let carrito = [];
let productos = {};

// ===============================
// 🔄 CARGAR ROPA
// ===============================
async function cargarRopa() {
  const querySnapshot = await getDocs(collection(db, "ropa"));
  productos = {};

  querySnapshot.forEach((doc) => {
    productos[doc.id] = {
      key: doc.id,
      ...doc.data()
    };
  });

  renderRopa();
}

// ===============================
// 🎨 RENDER
// ===============================
function renderRopa() {
  ropaContainer.innerHTML = "";

  Object.values(productos).forEach((p) => {

    const precioHTML = p.descuento && p.descuento > 0
      ? `
        <p class="card-text mb-1">
          <span class="text-muted text-decoration-line-through">
            $${p.precio.toFixed(2)}
          </span>
        </p>
        <p class="card-text text-success fw-bold">
          $${(p.precio - (p.precio * p.descuento / 100)).toFixed(2)}
          <span class="badge bg-danger ms-2">-${p.descuento}%</span>
        </p>
      `
      : `
        <p class="card-text text-success fw-bold">
          $${p.precio.toFixed(2)}
        </p>
      `;

    ropaContainer.innerHTML += `
      <div class="col">
        <div class="card h-100 shadow-sm">
          <img src="${p.imagen}" class="card-img-top" alt="${p.titulo}">
          <div class="card-body text-center">
            <h5 class="card-title">${p.titulo}</h5>
            <p class="card-text"><strong>Talla:</strong> ${p.talla}</p>
            <p class="card-text"><strong>Color:</strong> ${p.color}</p>
            <p class="card-text"><strong>Material:</strong> ${p.material}</p>
            <p class="card-text text-info"><strong>Género:</strong> ${p.genero}</p>

            ${precioHTML}

            <div class="input-group mb-2 justify-content-center" style="max-width:120px;margin:auto;">
              <span class="input-group-text">Cant.</span>
              <input type="number" min="1" placeholder="0" class="form-control text-center" id="cantidad-${p.key}">
            </div>

            <div class="d-flex justify-content-center gap-2 mt-2">
              <button class="btn btn-grad-info" onclick="verDescripcion('${p.key}')">Ver</button>
              <button class="btn btn-grad-dark" onclick="agregarAlCarrito('${p.key}')">Agregar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

// ===============================
// 👁 MODAL
// ===============================
window.verDescripcion = function(key) {
  const p = productos[key];

  document.getElementById("descripcionTitulo").textContent = p.titulo;
  document.getElementById("descripcionImg").src = p.imagen;
  document.getElementById("descTalla").textContent = p.talla;
  document.getElementById("descColor").textContent = p.color;
  document.getElementById("descMaterial").textContent = p.material;
  document.getElementById("descStock").textContent = p.stock;

  const precioFinal = p.descuento && p.descuento > 0
    ? p.precio - (p.precio * p.descuento / 100)
    : p.precio;

  document.getElementById("descPrecio").textContent = `$${precioFinal.toFixed(2)}`;
  document.getElementById("descGenero").textContent = p.genero;

  new bootstrap.Modal(document.getElementById("modalDescripcion")).show();
};

// ===============================
// ➕ CARRITO
// ===============================
window.agregarAlCarrito = function(key) {
  const p = productos[key];
  const cantidad = parseInt(document.getElementById(`cantidad-${key}`).value);

  if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");
  if (cantidad > p.stock) return alert("No hay suficiente stock");

  const existe = carrito.find(i => i.key === key);

  if (existe) {
    if (existe.cantidad + cantidad > p.stock) {
      alert("Supera el stock disponible");
      return;
    }
    existe.cantidad += cantidad;
  } else {
    carrito.push({ ...p, key, cantidad });
  }

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

  let msg = "🛍️ Pedido de Ropa:\n\n";
  let total = 0;

  carrito.forEach(p=>{
    const precioFinal = p.descuento && p.descuento > 0
      ? p.precio - (p.precio * p.descuento / 100)
      : p.precio;

    msg += `${p.titulo} (${p.talla}, ${p.color}) x${p.cantidad} - $${(precioFinal*p.cantidad).toFixed(2)}\n`;
    total += precioFinal*p.cantidad;
  });

  msg += `\nTotal: $${total.toFixed(2)}`;

  window.open(`https://wa.me/593992570322?text=${encodeURIComponent(msg)}`);
};

// ===============================
// 🚀 INIT
// ===============================
cargarRopa();
