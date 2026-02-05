import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= FIREBASE =================
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

// ================= DOM =================
const perfumeContainer = document.getElementById("perfumeContainer");
const carritoCount = document.getElementById("carritoCount");
const carritoLista = document.getElementById("carritoLista");

// ================= DATA =================
let productos = {};
let carrito = [];

// ================= CARGAR PERFUMES =================
async function cargarPerfumes() {
  const snap = await getDocs(collection(db, "productos"));

  snap.forEach(docu => {
    productos[docu.id] = { id: docu.id, ...docu.data() };
  });

  renderPerfumes();
}

// ================= RENDER PERFUMES =================
function renderPerfumes() {
  perfumeContainer.innerHTML = "";

  for (let key in productos) {
    const perfume = productos[key];

    perfumeContainer.innerHTML += `
      <div class="col">
        <div class="card h-100 shadow-sm">
          <img src="${perfume.imagen}" class="card-img-top">
          <div class="card-body text-center">
            <h5 class="card-title">${perfume.titulo}</h5>
            <p class="card-text"><strong>Familia:</strong> ${perfume.descripcion?.familia || ""}</p>
            <p class="card-text text-info"><strong>Género:</strong> ${perfume.genero}</p>
            <p class="card-text text-success"><strong>Precio:</strong> $${perfume.precio.toFixed(2)}</p>

            <div class="input-group mb-2 justify-content-center" style="max-width:120px;margin:auto;">
              <span class="input-group-text">Cant.</span>
              <input type="number" min="0" value="0" class="form-control" id="cantidad-${key}">
            </div>

            <div class="d-flex justify-content-center gap-2 mt-2">
              <button class="btn btn-grad-info" onclick="verDescripcion('${key}')">Ver descripción</button>
              <button class="btn btn-grad-dark" onclick="agregarAlCarrito('${key}')">Agregar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// ================= MODAL =================
window.verDescripcion = function (key) {
  const perfume = productos[key];

  document.getElementById("descripcionTitulo").textContent = perfume.titulo;
  document.getElementById("descripcionImg").src = perfume.imagen;
  document.getElementById("descFamilia").textContent = perfume.descripcion?.familia || "";
  document.getElementById("descSalida").textContent = perfume.descripcion?.salida || "";
  document.getElementById("descCorazon").textContent = perfume.descripcion?.corazon || "";
  document.getElementById("descFondo").textContent = perfume.descripcion?.fondo || "";
  document.getElementById("descPrecio").textContent = `$${perfume.precio.toFixed(2)}`;
  document.getElementById("descGenero").textContent = perfume.genero;

  new bootstrap.Modal(document.getElementById("modalDescripcion")).show();
};

// ================= CARRITO =================
window.agregarAlCarrito = function (key) {
  const cantidadInput = document.getElementById(`cantidad-${key}`);
  const cantidad = parseInt(cantidadInput.value);

  if (!cantidad || cantidad <= 0) {
    mostrarToast("Agrega una cantidad válida.");
    return;
  }

  const index = carrito.findIndex(i => i.key === key);

  if (index !== -1) {
    carrito[index].cantidad += cantidad;
  } else {
    carrito.push({ key, ...productos[key], cantidad });
  }

  cantidadInput.value = 0;
  carritoCount.textContent = carrito.reduce((a, i) => a + i.cantidad, 0);
  renderCarrito();
};

// ================= RENDER CARRITO =================
function renderCarrito() {
  if (!carrito.length) {
    carritoLista.innerHTML = `<p class="text-muted">Tu carrito está vacío.</p>`;
    return;
  }

  let totalP = 0;
  let total$ = 0;

  carritoLista.innerHTML = `
    <ul class="list-group mb-3">
      ${carrito.map((item, i) => {
        totalP += item.cantidad;
        total$ += item.precio * item.cantidad;

        return `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>${item.titulo}</strong><br>
              <small>$${item.precio} x ${item.cantidad}</small>
            </div>
            <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${i})">🗑</button>
          </li>
        `;
      }).join("")}
    </ul>
    <p><strong>Total productos:</strong> ${totalP}</p>
    <p><strong>Total a pagar:</strong> $${total$.toFixed(2)}</p>
  `;
}

window.eliminarDelCarrito = function (i) {
  carrito.splice(i, 1);
  carritoCount.textContent = carrito.reduce((a, i) => a + i.cantidad, 0);
  renderCarrito();
};

// ================= WHATSAPP =================
window.finalizarCompra = function () {
  if (!carrito.length) {
    mostrarToast("El carrito está vacío.");
    return;
  }

  let msg = "🛍️ Pedido:\n\n";
  let total = 0;

  carrito.forEach(i => {
    msg += `${i.titulo} x${i.cantidad} - $${(i.precio * i.cantidad).toFixed(2)}\n`;
    total += i.precio * i.cantidad;
  });

  msg += `\nTotal: $${total.toFixed(2)}`;

  window.open(`https://wa.me/593992570322?text=${encodeURIComponent(msg)}`, "_blank");
};

// ================= TOAST =================
function mostrarToast(m) {
  alert(m);
}

// ================= INIT =================
cargarPerfumes();
