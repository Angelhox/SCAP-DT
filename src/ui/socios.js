const { ipcRenderer } = require("electron");
const validator = require("validator");
const Swal = require("sweetalert2");

const mensajeError = document.getElementById("mensajeError");
const socioPrimerNombre = document.getElementById("primernombre");
const socioSegundoNombre = document.getElementById("segundonombre");
const socioPrimerApellido = document.getElementById("primerapellido");
const socioSegundoApellido = document.getElementById("segundoapellido");
const socioCedula = document.getElementById("cedula");
const socioNacimiento = document.getElementById("nacimiento");
const socioFijo = document.getElementById("fijo");
const socioMovil = document.getElementById("movil");
const socioCorreo = document.getElementById("correo");
const socioProvincia = document.getElementById("provincia");
const socioCanton = document.getElementById("canton");
const socioParroquia = document.getElementById("parroquia");
const socioBarrio = document.getElementById("barrio");
const socioPrincipal = document.getElementById("principal");
const socioSecundaria = document.getElementById("secundaria");
const socioCasa = document.getElementById("numerocasa");
const socioReferencia = document.getElementById("referencia");
const sociosList = document.getElementById("socios");
const buscarSocios = document.getElementById("buscarSocios");
const crearContrato = document.getElementById("crearContrato");
const criterio = document.getElementById("criterio");
const criterioContent = document.getElementById("criterio-content");
let socios = [];
let editingStatus = false;
let editSocioId = "";
socioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  var segundoNombreSociodf = "NA";
  var segundoApellidoSociodf = "NA";
  var correoSociodf = "actualizarCorreo@mail.com";
  var fijoSociodf = "9999999999";
  var movilSociodf = "9999999999";
  var casaSociodf = "NA";
  var barrioSociodf = "NA";
  var principalSociodf = "Principal";
  var secundariaSociodf = "Secundaria";
  var parroquiaSociodf = "Ayora";

  if (socioSegundoNombre.value !== null && socioSegundoNombre.value !== "") {
    segundoNombreSociodf = socioSegundoNombre.value;
  }

  if (
    socioSegundoApellido.value !== null &&
    socioSegundoApellido.value !== ""
  ) {
    segundoApellidoSociodf = socioSegundoApellido.value;
  }

  if (socioCorreo.value !== null && socioCorreo.value !== "") {
    correoSociodf = socioCorreo.value;
  }

  if (socioFijo.value !== null && socioFijo.value !== "") {
    fijoSociodf = socioFijo.value;
  }

  if (socioMovil.value !== null && socioMovil.value !== "") {
    movilSociodf = socioMovil.value;
  }
  if (socioCasa.value !== null && socioCasa.value !== "") {
    casaSociodf = socioCasa.value;
  }
  if (socioBarrio.value !== null && socioBarrio.value !== "") {
    barrioSociodf = socioBarrio.value;
  }
  if (socioPrincipal.value !== null && socioPrincipal.value !== "") {
    principalSociodf = socioPrincipal.value;
  }
  if (socioSecundaria.value !== null && socioSecundaria.value !== "") {
    secundariaSociodf = socioSecundaria.value;
  }
  if (socioParroquia.value !== null && socioParroquia.value !== "") {
    parroquiaSociodf = socioParroquia.value;
  }
  if (validator.isEmpty(socioPrimerNombre.value)) {
    mensajeError.textContent = "El primer nombre es obligatorio.";
    socioPrimerNombre.focus();
  } else if (validator.isEmpty(socioPrimerApellido.value)) {
    mensajeError.textContent = "El primer apellido es obligatorio.";
    socioPrimerApellido.focus();
  } else if (
    validator.isEmpty(socioCedula.value) ||
    !validator.isLength(socioCedula.value, { max: 13, min: 10 })
  ) {
    mensajeError.textContent = "Ingresa un número de cédula válido.";
    socioCedula.focus();
  } else if (validator.isEmpty(socioNacimiento.value)) {
    mensajeError.textContent = "Ingresa una fecha de nacimiento válida.";
    socioNacimiento.focus();
  } else if (validator.isEmpty(socioProvincia.value)) {
    mensajeError.textContent = "Ingresa una provincia válida";
    socioProvincia.focus();
  } else if (validator.isEmpty(socioCanton.value)) {
    mensajeError.textContent = "Ingresa un canton válido.";
    socioCanton.focus();
  } else if (
    validator.isEmpty(socioReferencia.value) ||
    !validator.isLength(socioReferencia.value, { min: 0, max: 45 })
  ) {
    mensajeError.textContent =
      "Ingresa una referencia valida de máximo 45 caracteres.";
    socioReferencia.focus();
    // } else if (!validator.isEmail(socioCorreo.value)) {
    //   mensajeError.textContent = "Ingresa un correo válido.";
    //   socioCorreo.focus();
    // } else if (!validator.isLength(socioMovil.value, { max: 10, min: 10 })) {
    //   mensajeError.textContent = "Ingresa un télefono móvil válido.";
    //   socioMovil.focus();
  } else {
    const newSocio = {
      primerNombre: socioPrimerNombre.value,
      segundoNombre: segundoNombreSociodf,
      primerApellido: socioPrimerApellido.value,
      segundoApellido: segundoApellidoSociodf,
      cedulaPasaporte: socioCedula.value,
      fechaNacimiento: socioNacimiento.value,
      telefonoMovil: movilSociodf,
      telefonoFijo: fijoSociodf,
      correo: correoSociodf,
      provincia: socioProvincia.value,
      canton: socioCanton.value,
      parroquia: parroquiaSociodf,
      barrio: barrioSociodf,
      callePrincipal: principalSociodf,
      calleSecundaria: secundariaSociodf,
      numeroCasa: casaSociodf,
      referencia: socioReferencia.value,
    };
    if (!editingStatus) {
      const result = await ipcRenderer.invoke("createSocio", newSocio);
      console.log(result);
    } else {
      console.log("Editing socio with electron");
      Swal.fire({
        title: "¿Quieres guardar los cambios?",
        text: "No podrás deshacer esta acción.",
        icon: "question",
        iconColor: "#f8c471",
        showCancelButton: true,
        confirmButtonColor: "#2874A6",
        cancelButtonColor: "#EC7063 ",
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Aquí puedes realizar la acción que desees cuando el usuario confirme.
          const result = await ipcRenderer.invoke(
            "updateSocio",
            editSocioId,
            newSocio
          );

          console.log(result);
        }
      });
    }
  }
});
function renderSocios(socios) {
  sociosList.innerHTML = "";
  let indice = 0;
  socios.forEach((socio) => {
    indice++;
    var telefonoValido = socio.telefonoMovil;
    if (telefonoValido == null || telefonoValido == " ") {
      telefonoValido = socio.telefonoFijo;
    }
    sociosList.innerHTML += `
       <tr onclick="seleccionarFila('${socio.id}',this)" >
   <td>${indice}</td>
       <td >${socio.primerApellido + " " + socio.segundoApellido}</td>
      <td>${socio.primerNombre + " " + socio.segundoNombre}</td>
      <td>${socio.cedulaPasaporte}</td>
      <td>${telefonoValido}</td>
      <td>${socio.correo}</td>
      <td>${calcularEdad(socio.fechaNacimiento)}</td>
      <td>${
        socio.provincia +
        ", " +
        socio.canton +
        ", " +
        socio.parroquia +
        ", " +
        socio.barrio
      }</td>
      <td>
      <button onclick="deleteSocio('${socio.id}','${
      socio.primerNombre +
      " " +
      socio.primerApellido +
      " " +
      socio.segundoApellido
    }')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editSocio('${socio.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
const editSocio = async (id) => {
  const socio = await ipcRenderer.invoke("getSocioById", id);
  socioPrimerNombre.value = socio.primerNombre;
  socioSegundoNombre.value = socio.segundoNombre;
  socioPrimerApellido.value = socio.primerApellido;
  socioSegundoApellido.value = socio.segundoApellido;
  socioCedula.value = socio.cedulaPasaporte;
  socioNacimiento.value = formatearFecha(socio.fechaNacimiento);
  socioFijo.value = socio.telefonoFijo;
  socioMovil.value = socio.telefonoMovil;
  socioCorreo.value = socio.correo;
  socioProvincia.value = socio.provincia;
  socioCanton.value = socio.canton;
  socioParroquia.value = socio.parroquia;
  socioBarrio.value = socio.barrio;
  socioPrincipal.value = socio.callePrincipal;
  socioSecundaria.value = socio.calleSecundaria;
  socioCasa.value = socio.numeroCasa;
  socioReferencia.value = socio.referencia;
  editingStatus = true;
  editSocioId = socio.id;
  console.log(socio);
};
const deleteSocio = async (id, socioNombre) => {
  Swal.fire({
    title: "¿Quieres borrar el registro de " + socioNombre + " ?",
    text: "No podrás deshacer esta acción.",
    icon: "question",
    iconColor: "#f8c471",
    showCancelButton: true,
    confirmButtonColor: "#2874A6",
    cancelButtonColor: "#EC7063 ",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Aquí puedes realizar la acción que desees cuando el usuario confirme.
      console.log("id from usuarios.js");
      const result = await ipcRenderer.invoke("deleteSocio", id);
      console.log("Resultado socios.js", result);
    }
  });
};
const getSocios = async (criterio, criterioContent) => {
  socios = await ipcRenderer.invoke("getSocios", criterio, criterioContent);
  console.log(socios);
  renderSocios(socios);
};
criterio.onchange = async () => {
  let criterioSeleccionado = criterio.value;
  console.log("Seleccionado: ", criterioSeleccionado);
  if (criterioSeleccionado === "all") {
    // criterioContent.textContent = "";
    criterioContent.value = "";
    criterioContent.readOnly = true;
    let criterioBuscar = "all";
    let criterioContentBuscar = "all";
    await getSocios(criterioBuscar, criterioContentBuscar);
  } else {
    criterioContent.readOnly = false;
  }
};
buscarSocios.onclick = async () => {
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  await getSocios(criterioBuscar, criterioContentBuscar);
};

async function init() {
  let criterioBuscar = "all";
  let criterioContentBuscar = "all";
  await getSocios(criterioBuscar, criterioContentBuscar);
}
function calcularEdad(fechaNacimiento) {
  const fechaActual = new Date();
  const fechaNacimientoDate = new Date(fechaNacimiento);

  let edad = fechaActual.getFullYear() - fechaNacimientoDate.getFullYear();

  // Verificar si aún no ha pasado el cumpleaños de este año.
  const mesActual = fechaActual.getMonth();
  const diaActual = fechaActual.getDate();
  const mesNacimiento = fechaNacimientoDate.getMonth();
  const diaNacimiento = fechaNacimientoDate.getDate();

  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && diaActual < diaNacimiento)
  ) {
    edad--;
  }

  return edad;
}
function seleccionarFila(id, fila) {
  // Deseleccionar filas previamente seleccionadas
  editSocio(id);
  const filas = document.querySelectorAll("tr");
  filas.forEach((fila) => {
    fila.classList.remove("seleccionada");
  });
  // Marcar la fila actual como seleccionada
  fila.classList.add("seleccionada");
}
crearContrato.onclick = async () => {
  if (editingStatus && editSocioId !== "") {
    let cedulaEnviar = socioCedula.value;
    await ipcRenderer.send("contrato-desde-socios", editSocioId, cedulaEnviar);
  } else {
    console.log("Socio no seleccionado");
  }
};
ipcRenderer.on("Notificar", (event, response) => {
  if (response.title === "Borrado!") {
    resetFormAfterSave();
  } else if (response.title === "Actualizado!") {
    resetFormAfterUpdate();
  } else if (response.title === "Guardado!") {
    resetFormAfterSave();
  } else if (response.title === "Usuario eliminado!") {
    resetFormAfterSave();
  }
  console.log("Response: " + response);
  if (response.success) {
    Swal.fire({
      title: response.title,
      text: response.message,
      icon: "success",
      confirmButtonColor: "#f8c471",
    });
  } else {
    Swal.fire({
      title: response.title,
      text: response.message,
      icon: "error",
      confirmButtonColor: "#f8c471",
    });
  }
});
async function resetFormAfterUpdate() {
  console.log("Reseteando despues de update");
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  await getSocios(criterioBuscar, criterioContentBuscar);
  socioPrimerNombre.focus();
  mensajeError.textContent = "";
}
async function resetFormAfterSave() {
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  console;
  await getSocios(criterioBuscar, criterioContentBuscar);
  editingStatus = false;
  editSocioId = "";
  socioForm.reset();
  socioPrimerNombre.focus();
  mensajeError.textContent = "";
}
function resetForm() {
  editingStatus = false;
  editSocioId = "";
  socioForm.reset();
  socioPrimerNombre.focus();
  mensajeError.textContent = "";
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
function imprimir() {
  window.print();
}
// funciones del navbar
function cerrarSesion() {
  ipcRenderer.send("cerrarSesion");
}
ipcRenderer.on("sesionCerrada", async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Login";
  await ipcRenderer.send("abrirInterface", url, acceso);
});
const abrirInicio = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Inicio";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
const abrirSocios = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Socios";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
const abrirUsuarios = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Usuarios";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
const abrirPagos = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Pagos";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
const abrirPagosII = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "PagosII";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
const abrirPlanillas = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Planillas";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
const abrirContratos = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Contratos";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
const abrirServicios = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Servicios fijos";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
const abrirCuotas = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Servicios ocacionales";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
init();
