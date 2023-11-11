// ----------------------------------------------------------------
// Librerias
// ----------------------------------------------------------------
const { ipcRenderer } = require("electron");
const validator = require("validator");
// ----------------------------------------------------------------
const implementoNombre = document.getElementById("implemento");
const implementoTipo = document.getElementById("tipo");
const implementoDescripcion = document.getElementById("descripcion");
const implementoPrecio = document.getElementById("precio");
const implementoStock = document.getElementById("stock");
const implementoEstado = document.getElementById("estado");
const implementoFechaRegistro = document.getElementById("fechaRegistro");

const implementosList = document.getElementById("implementos");
let implementos = [];
let editingStatus = false;
let editImplementoId = "";

implementoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (validator.isEmpty(implementoNombre.value)) {
    mensajeError.textContent = "El nombre del implemento obligatorio.";
    implementoNombre.focus();
  } else if (validator.isEmpty(implementoTipo.value)) {
    mensajeError.textContent = "El tipo de implemento es obligatorio.";
    implementoTipo.focus();
  } else if (validator.isEmpty(implementoDescripcion.value)) {
    mensajeError.textContent = "La descripcion del implemento es obligatoria.";
    implementoDescripcion.focus();
  } else if (validator.isEmpty(implementoPrecio.value)) {
    mensajeError.textContent = "El precio del implemento es obligatorio.";
    implementoPrecio.focus();
  } else if (validator.isEmpty(implementoStock.value)) {
    mensajeError.textContent = "El stock del implemento es obligatorio.";
    implementoStock.focus();
  } else if (validator.isEmpty(implementoEstado.value)) {
    mensajeError.textContent = "El estado del implemento es obligatorio.";
    implementoEstado.focus();
  } else if (validator.isEmpty(implementoFechaRegistro.value)) {
    mensajeError.textContent =
      "La fecha de registro del implemento es obligatoria.";
    implementoFechaRegistro.focus();
  } else {
    const newImplemento = {
      nombre: implementoNombre.value,
      tipo: implementoTipo.value,
      descripcion: implementoDescripcion.value,
    };
    const newInventario = {
      precio: implementoPrecio.value,
      stock: implementoStock.value,
      estado: implementoEstado.value,
      fechaRegistro: implementoFechaRegistro.value,
    };

    if (!editingStatus) {
      const result = await ipcRenderer.invoke(
        "createImplemento",
        newImplemento,
        newInventario
      );
      console.log(result);
    } else {
      console.log("Editing implemento with electron");
      const result = await ipcRenderer.invoke(
        "updateImplemento",
        editImplementoId,
        newImplemento,
        newInventario
      );
      editingStatus = false;
      editImplementoId = "";
      console.log(result);
    }
    getImplementos();
    implementoForm.reset();
    implementoNombre.focus();
  }
});
function renderImplementos(implementos) {
  implementosList.innerHTML = "";
  implementos.forEach((implemento) => {
    implementosList.innerHTML += `
       <tr>
       <td>${implemento.implementosId}</td>
      <td>${implemento.nombre}</td>
      <td>${implemento.tipo}</td>
      <td>${implemento.descripcion}</td>
      <td>${implemento.stock}</td>
      <td>${implemento.precio}</td>

 
      <td>
      <button onclick="deleteImplemento('${implemento.implementosId}','${implemento.nombre}')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editImplemento('${implemento.implementosId}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
const editImplemento = async (id) => {
  const implemento = await ipcRenderer.invoke("getImplementoById", id);
  implementoNombre.value = implemento.nombre;
  implementoTipo.value = implemento.tipo;
  implementoDescripcion.value = implemento.descripcion;
  implementoStock.value = implemento.stock;
  implementoPrecio.value = implemento.precio;
  implementoEstado.value = implemento.estado;
  implementoFechaRegistro.value = formatearFecha(implemento.fechaRegistro);
  editingStatus = true;
  editImplementoId = implemento.implementosId;
  console.log(implemento);
};
const deleteImplemento = async (id,nombre) => {
  const response = confirm(
    "Estas seguro de eliminar "+nombre+" de los registros ?"
  );
  if (response) {
    console.log("id from implementos.js");
    const result = await ipcRenderer.invoke("deleteImplemento", id);
    console.log("Resultado implementos.js", result);
    getImplementos();
  }
};
const getImplementos = async () => {
  implementos = await ipcRenderer.invoke("getImplementos");
  console.log(implementos);
  renderImplementos(implementos);
};
async function init() {
  await getImplementos();
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
var fecha = document.getElementById("fechaRegistro");

// Obtener la fecha actual
var fechaActual = new Date();

// Formatear la fecha como "yyyy-mm-dd" (opcional)
var formatoFecha = fechaActual.toISOString().split("T")[0];

// Asignar la fecha al valor del input
fecha.value = formatoFecha;
// funciones del navbar
const abrirInicio = async () => {
  const url = "src/ui/principal.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirSocios = async () => {
  const url = "src/ui/socios.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirUsuarios = async () => {
  const url = "src/ui/usuarios.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirPagos = async () => {
  const url = "src/ui/planillas.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirPlanillas = async () => {
  const url = "src/ui/planillas-cuotas.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirParametros = async () => {
  const url = "src/ui/parametros.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirImplementos = async () => {
  const url = "src/ui/implementos.html";
  await ipcRenderer.send("abrirInterface", url);
};
const abrirContratos = async () => {
  const url = "src/ui/medidores.html";
  await ipcRenderer.send("abrirInterface", url);
};

init();
