const { ipcRenderer } = require("electron");
const parametroParametro = document.getElementById("parametro");
const parametroDescripcion = document.getElementById("descripcion");
const parametroEstado = document.getElementById("estado");
const parametroValor = document.getElementById("valor");
const parametrosList = document.getElementById("parametros");
let parametros = [];
let editingStatus = false;
let editParametroId = "";
parametroForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  var estadoParametro = "Innactivo";
  if (parametroEstado.checked) {
    estadoParametro = "Activo";
  }
  const newParametro = {
    nombreParametro: parametroParametro.value,
    descripcion: parametroDescripcion.value,
    estado: estadoParametro,
    valor: parametroValor.value,
  };
  if (!editingStatus) {
    const result = await ipcRenderer.invoke("createParametro", newParametro);
    console.log(result);
  } else {
    console.log("Editing parametro with electron");
    const result = await ipcRenderer.invoke(
      "updateParametro",
      editParametroId,
      newParametro
    );
    editingStatus = false;
    editParametroId = "";
    console.log(result);
  }
  getParametros();
  parametroForm.reset();
  parametroParametro.focus();
});
function renderParametros(parametros) {
  parametrosList.innerHTML = "";
  parametros.forEach((parametro) => {
    parametrosList.innerHTML += `
       <tr>
      <td>${parametro.nombreParametro}</td>
      <td>${parametro.descripcion}</td>
      <td>${parametro.estado}</td>
      <td>${parametro.valor}</td>
      <td>
      <button onclick="deleteParametro('${parametro.id}')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editParametro('${parametro.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
const editParametro = async (id) => {
  const parametro = await ipcRenderer.invoke("getParametroById", id);
  parametroParametro.value = parametro.nombreParametro;
  parametroDescripcion.value = parametro.descripcion;
  if (parametro.estado == "Activo") {
    parametroEstado.checked=true;
  } else {
    parametroEstado.checked = false;
  }
  parametroEstado.value = parametro.estado;
  parametroValor.value = parametro.valor;
  editingStatus = true;
  editParametroId = parametro.id;
  console.log(parametro);
};
const deleteParametro = async (id) => {
  const response = confirm("Estas seguro de eliminar este parametro?");
  if (response) {
    console.log("id from parametros.js");
    const result = await ipcRenderer.invoke("deleteParametro", id);
    console.log("Resultado parametros.js", result);
    getParametros();
  }
};
const getParametros = async () => {
  parametros = await ipcRenderer.invoke("getParametros");
  console.log(parametros);
  renderParametros(parametros);
};
async function init() {
  await getParametros();
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}

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
