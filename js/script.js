const perfumeContainer = document.getElementById("perfumeContainer");
const carritoCount = document.getElementById("carritoCount");
const carritoLista = document.getElementById("carritoLista");

// Inicializar carrito
let carrito = [];

function renderPerfumes() {
  perfumeContainer.innerHTML = "";
  for (let key in descripciones) {
    const perfume = descripciones[key];
    perfumeContainer.innerHTML += `
      <div class="col">
        <div class="card h-100 shadow-sm">
          <img src="${perfume.img}" class="card-img-top" alt="${perfume.titulo}">
          <div class="card-body text-center">
            <h5 class="card-title">${perfume.titulo}</h5>
            <p class="card-text"><strong>Familia:</strong> ${perfume.descripcion.familia}</p>
            <p class="card-text text-info"><strong>Género:</strong> ${perfume.genero}</p>  <!-- AÑADIDO -->
            <p class="card-text text-success"><strong>Precio:</strong> $${perfume.precio.toFixed(2)}</p>
            
            <div class="input-group mb-2 justify-content-center" style="max-width: 120px; margin: auto;">
              <span class="input-group-text">Cant.</span>
              <input type="number" min="0" value="0" class="form-control cantidadInput" id="cantidad-${key}">
            </div>
            <div class="d-flex justify-content-center gap-2 mt-2">
  <button class="btn btn-grad-info" onclick="verDescripcion('${key}')">Ver descripción</button>
  <button class="btn btn-grad-dark" onclick="agregarAlCarrito('${key}')">Agregar al carrito</button>
</div>



          </div>
        </div>
      </div>
    `;
  }
}


// Mostrar descripción en modal
function verDescripcion(key) {
  const perfume = descripciones[key];
  document.getElementById("descripcionTitulo").textContent = perfume.titulo;
  document.getElementById("descripcionImg").src = perfume.img;
  document.getElementById("descripcionImg").alt = perfume.titulo;
  document.getElementById("descFamilia").textContent = perfume.descripcion.familia;
  document.getElementById("descSalida").textContent = perfume.descripcion.salida;
  document.getElementById("descCorazon").textContent = perfume.descripcion.corazon;
  document.getElementById("descFondo").textContent = perfume.descripcion.fondo;
  document.getElementById("descPrecio").textContent = `$${perfume.precio.toFixed(2)}`;
  document.getElementById("descGenero").textContent = perfume.genero; // <-- Agregado

  const modal = new bootstrap.Modal(document.getElementById("modalDescripcion"));
  modal.show();
}


// Agregar al carrito con cantidad
function agregarAlCarrito(key) {
  const cantidadInput = document.getElementById(`cantidad-${key}`);
  const cantidad = parseInt(cantidadInput.value);

  if (!cantidad || cantidad <= 0) {
    mostrarToast("Agrega una cantidad válida antes de agregar al carrito.");
    return;
  }

  // Buscar si el producto ya está en el carrito
  const indexExistente = carrito.findIndex(item => item.key === key);
  if (indexExistente !== -1) {
    carrito[indexExistente].cantidad += cantidad;
  } else {
    carrito.push({
      key: key,
      ...descripciones[key],
      cantidad: cantidad
    });
  }

  carritoCount.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  renderCarrito();
  cantidadInput.value = 0; // Reiniciar input
}

// Renderizar carrito
function renderCarrito() {
  if (carrito.length === 0) {
    carritoLista.innerHTML = `<p class="text-muted">Tu carrito está vacío.</p>`;
    return;
  }

  let totalProductos = 0;
  let totalPrecio = 0;

  carritoLista.innerHTML = `
    <ul class="list-group mb-3">
      ${carrito.map((item, i) => {
        totalProductos += item.cantidad;
        totalPrecio += item.precio * item.cantidad;
        return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>${item.titulo}</strong><br>
            <small class="text-muted">${item.descripcion.familia}</small><br>
            <small class="text-success">Precio: $${item.precio.toFixed(2)} x ${item.cantidad} = $${(item.precio * item.cantidad).toFixed(2)}</small>
          </div>
          <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${i})">🗑</button>
        </li>
      `}).join("")}
    </ul>
    <p><strong>Total de productos:</strong> ${totalProductos}</p>
    <p><strong>Total a pagar:</strong> $${totalPrecio.toFixed(2)}</p>
  `;
}

// Eliminar del carrito
function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  carritoCount.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  renderCarrito();
}

// -----------------------------
// FUNCION FINALIZAR COMPRA (WhatsApp)
// -----------------------------
function finalizarCompra() {
  if (carrito.length === 0) {
    mostrarToast("El carrito está vacío.");
    return;
  }

  let mensaje = "🛍️ *Nuevo Pedido:*\n\n";
  let totalProductos = 0;
  let totalPrecio = 0;

  carrito.forEach(item => {
    mensaje += `${item.titulo} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}\n`;
    totalProductos += item.cantidad;
    totalPrecio += item.precio * item.cantidad;
  });

  mensaje += `\n📦 Total de productos: ${totalProductos}`;
  mensaje += `\n💰 Total a pagar: $${totalPrecio.toFixed(2)}`;
  mensaje += "\n✅ Por favor confirme el pedido.";

  let numeroVendedora = "593992570322";
  let url = `https://wa.me/${numeroVendedora}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

// -----------------------------
// TOAST
// -----------------------------
function mostrarToast(mensaje) {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "position-fixed bottom-0 end-0 p-3";
    toastContainer.style.zIndex = 1060;
    document.body.appendChild(toastContainer);
  }

  const toastEl = document.createElement("div");
  toastEl.className = "toast align-items-center text-bg-warning border-0";
  toastEl.role = "alert";
  toastEl.ariaLive = "assertive";
  toastEl.ariaAtomic = "true";
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${mensaje}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();

  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
}

// Inicializar
renderPerfumes();
