// Inicializar carrito
let carrito = {};

// Renderizar tarjetas de perfumes
const container = document.getElementById("perfumeContainer");

Object.keys(descripciones).forEach(id => {
  const perfume = descripciones[id];

  const card = document.createElement("div");
  card.className = "col";

  card.innerHTML = `
    <div class="card shadow-sm h-100">
      <img src="${perfume.img}" class="card-img-top" alt="${perfume.titulo}">
      <div class="card-body text-center d-flex flex-column">
        <h5 class="card-title">${perfume.titulo}</h5>
        <div class="mt-auto d-flex justify-content-between">
          <button class="btn btn-primary" onclick="verDescripcion('${id}')">Ver descripción</button>
          <button class="btn btn-success" onclick="agregarAlCarrito('${id}')">🛒 Añadir</button>
        </div>
      </div>
    </div>
  `;

  container.appendChild(card);
});

// --- FUNCIONES DEL CARRITO ---
function agregarAlCarrito(id) {
  if (carrito[id]) {
    carrito[id].cantidad++;
  } else {
    carrito[id] = { ...descripciones[id], cantidad: 1 };
  }
  actualizarCarrito();
}

function eliminarDelCarrito(id) {
  delete carrito[id];
  actualizarCarrito();
}

function cambiarCantidad(id, nuevaCantidad) {
  nuevaCantidad = parseInt(nuevaCantidad);
  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(id);
  } else {
    carrito[id].cantidad = nuevaCantidad;
  }
  actualizarCarrito();
}

function vaciarCarrito() {
  carrito = {};
  actualizarCarrito();
}

function actualizarCarrito() {
  const carritoItems = document.getElementById("carritoItems");
  const carritoCount = document.getElementById("carritoCount");
  const carritoTotal = document.getElementById("carritoTotal");

  carritoItems.innerHTML = "";
  let total = 0;

  Object.keys(carrito).forEach(id => {
    const item = carrito[id];
    total += item.cantidad;

    carritoItems.innerHTML += `
      <tr>
        <td>${item.titulo}</td>
        <td>
          <input type="number" min="1" value="${item.cantidad}" 
            onchange="cambiarCantidad('${id}', this.value)" 
            class="form-control w-50 mx-auto">
        </td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito('${id}')">❌</button>
        </td>
      </tr>
    `;
  });

  carritoCount.textContent = total;
  carritoTotal.textContent = total;
}
