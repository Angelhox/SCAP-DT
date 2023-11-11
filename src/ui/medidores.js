const { ipcRenderer } = require("electron");
const { Notification, dialog } = require("electron");
const socioContratanteCedula = document.getElementById(
  "cedulaSocioContratante"
);
const socioContratanteNombre = document.getElementById(
  "nombreSocioContratante"
);
const socioContratanteApellido = document.getElementById(
  "apellidoSocioContratante"
);
const medidorCodigo = document.getElementById("codigo");
const medidorInstalacion = document.getElementById("fechaInstalacion");
const medidorMarca = document.getElementById("marca");
const medidorBarrio = document.getElementById("barrio");
const medidorPrincipal = document.getElementById("principal");
const medidorSecundaria = document.getElementById("secundaria");
const medidorNumeroCasa = document.getElementById("numerocasa");
const medidorReferencia = document.getElementById("referencia");
const medidorObservacion = document.getElementById("observacion");
const medidorDescripcion = document.getElementById("descripcion");
const medidoresDisponiblesSelect = document.getElementById(
  "medidoresDisponibles"
);
const contratoFecha = document.getElementById("fechaContrato");
const contratoPagoEscrituras = document.getElementById("servicioEscrituras");
const contratoPagoRecoleccion = document.getElementById("servicioRecoleccion");
const contratoPagoAguaPotable = document.getElementById("servicioAguaPotable");
const contratoPagoAlcanterillado = document.getElementById(
  "servicioAlcanterillado"
);
const contratosList = document.getElementById("contratos");
const medidoresDisponiblesList = document.getElementById(
  "medidoresDisponibles"
);
let medidores = [];
let medidoresDisponibles = [];
let cedulasSugerencias = [];
let editingStatus = false;
let editMedidorId = "";
let socioContratanteId = "";
let contratoId = "";
contratoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!socioContratanteId == "") {
    const newMedidor = {
      codigo: medidorCodigo.value,
      fechaInstalacion: medidorInstalacion.value,
      marca: medidorMarca.value,
      barrio: medidorBarrio.value,
      callePrincipal: medidorPrincipal.value,
      calleSecundaria: medidorSecundaria.value,
      numeroCasa: medidorNumeroCasa.value,
      referencia: medidorReferencia.value,
      observacion: medidorObservacion.value,
      contratosId: contratoId,
    };
    var pagoAguaPotable = "No";
    var pagoEscrituras = "No";
    var pagoDesechos = "No";
    var pagoAlcanterillado = "No";

    if (contratoPagoEscrituras.checked) {
      pagoEscrituras = "Si";
    }
    if (contratoPagoRecoleccion.checked) {
      pagoDesechos = "Si";
    }
    if (contratoPagoAlcanterillado.checked) {
      pagoAlcanterillado = "Si";
    }
    if (contratoPagoAguaPotable.checked) {
      pagoAguaPotable = "Si";
    }
    const newContrato = {
      fecha: contratoFecha.value,
      pagoEscrituras: pagoEscrituras,
      pagoRecoleccionDesechos: pagoDesechos,
      pagoAlcanterillado: pagoAlcanterillado,
      pagoAguaPotable: pagoAguaPotable,
      sociosId: socioContratanteId,
    };

    if (!editingStatus) {
      try {
      const resultContrato = await ipcRenderer.invoke(
        "createContrato",
        newContrato
      );
      console.log("Muestro resultado de insertar contrato: ", resultContrato);
     
        contratoId = resultContrato.id;
        console.log("Muestro id resultado de insertar contrato: ", contratoId);
        if (!contratoId == "") {
          if (contratoPagoAguaPotable.checked) {
            newMedidor.contratosId = contratoId;
            const result = await ipcRenderer.invoke(
              "createMedidor",
              newMedidor
            );
            console.log(result);
          }
        }
      } catch (e) {
        console.log(
          "Ha ocurrido un error posiblemente el contrato no registre un medidor",
          e
        );
      }
    } else {
      console.log("Editing contrato with electron");
      const result = await ipcRenderer.invoke(
        "updateMedidor",
        editMedidorId,
        newMedidor
      );
      editingStatus = false;
      editMedidorId = "";
      console.log(result);
    }
    getContratos();
    contratoForm.reset();
    socioContratanteCedula.focus();
  }
});
function renderContratos(datosContratos) {
  contratosList.innerHTML = "";
  datosContratos.forEach((contrato) => {
    contratosList.innerHTML += `
       <tr>
       <td>${formatearFecha(contrato.fecha)}</td>
      <td>${contrato.nombre + " " + contrato.apellido}</td>
      <td>${contrato.cedula}</td>
      <td>${contrato.pagoAlcanterillado}</td>
      <td>${contrato.pagoRecoleccionDesechos}</td>
      <td>${contrato.pagoEscrituras}</td>
      <td>${contrato.pagoAguaPotable}</td>
      <td>
      <button onclick="deleteMedidor('${contrato.id}')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editMedidor('${contrato.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
const editMedidor = async (id) => {
  contratoForm.reset();
  const medidor = await ipcRenderer.invoke("getDatosMedidorById", id);
  console.log("Recibido: " + medidor);
  console.log("Agua Potable? " + medidor.pagoAguaPotable);
  console.log("Agua Potable? " + medidor.medidorId);
  var conMedidor = medidor.pagoAguaPotable;
  console.log("Agua Potable? " + conMedidor);
  if (conMedidor == "Si") {
    console.log("conMedidor");
    contratoFecha.value = formatearFecha(medidor.fechaContrato);
    socioContratanteCedula.value = medidor.cedula;
    socioContratanteApellido.value = medidor.apellido;
    socioContratanteNombre.value = medidor.nombre;
    if (medidor.pagoRecoleccionDesechos == "Si") {
      contratoPagoRecoleccion.checked = true;
    } else {
      contratoPagoRecoleccion.checked = false;
    }
    if (medidor.pagoAlcanterillado == "Si") {
      contratoPagoAlcanterillado.checked = true;
    } else {
      contratoPagoAlcanterillado.checked = false;
    }
    if (medidor.pagoEscrituras == "Si") {
      contratoPagoEscrituras.checked = true;
    } else {
      contratoPagoEscrituras.checked = false;
    }
    if (medidor.pagoAguaPotable == "Si") {
      contratoPagoAguaPotable.checked = true;
    } else {
      contratoPagoAguaPotable.checked = false;
    }
    medidorCodigo.value = medidor.codigo;
    medidorInstalacion.value = formatearFecha(medidor.fechaInstalacion);
    medidoresDisponibles.selectedIndex = 0;
    medidorMarca.value = medidor.marca;
    medidorBarrio.value = medidor.barrio;
    medidorPrincipal.value = medidor.callePrincipal;
    medidorSecundaria.value = medidor.calleSecundaria;
    medidorNumeroCasa.value = medidor.numeroCasa;
    medidorReferencia.value = medidor.referencia;
    medidorObservacion.value = medidor.observacion;
    // Permitimos editar los datos del medidor
    medidorCodigo.disabled = false;
    medidorInstalacion.readOnly = true;
    medidorInstalacion.disabled = false;
    medidoresDisponibles.disabled = false;
    medidorMarca.disabled = false;
    medidorBarrio.disabled = false;
    medidorPrincipal.disabled = false;
    medidorSecundaria.disabled = false;
    medidorNumeroCasa.disabled = false;
    medidorReferencia.disabled = false;
    medidorObservacion.disabled = false;
    // Inhabilitamos los campos que no se deben editar
    contratoFecha.readOnly = true;
    socioContratanteCedula.readOnly = true;
    socioContratanteApellido.readOnly = true;
    socioContratanteNombre.readOnly = true;
    contratoPagoAlcanterillado.disabled = true;
    contratoPagoEscrituras.disabled = true;
    contratoPagoRecoleccion.disabled = true;
    // ~~~~~~~~~~~~~~~~
    editMedidorId = medidor.medidorId;
  } else {
    console.log("sinMedidor");
    contratoFecha.value = formatearFecha(medidor.fechaContrato);
    socioContratanteCedula.value = medidor.cedula;
    socioContratanteApellido.value = medidor.apellido;
    socioContratanteNombre.value = medidor.nombre;
    if (medidor.pagoRecoleccionDesechos == "Si") {
      contratoPagoRecoleccion.checked = true;
    } else {
      contratoPagoRecoleccion.checked = false;
    }
    if (medidor.pagoAlcanterillado == "Si") {
      contratoPagoAlcanterillado.checked = true;
    } else {
      contratoPagoAlcanterillado.checked = false;
    }
    if (medidor.pagoEscrituras == "Si") {
      contratoPagoEscrituras.checked = true;
    } else {
      contratoPagoEscrituras.checked = false;
    }
    if (medidor.pagoAguaPotable == "Si") {
      contratoPagoAguaPotable.checked = true;
    } else {
      contratoPagoAguaPotable.checked = false;
    }
    // medidorCodigo.value = medidor.codigo;
    // medidorInstalacion.value = formatearFecha(medidor.fechaInstalacion);
    // medidoresDisponibles.selectedIndex = 0;
    // medidorMarca.value = medidor.marca;
    // medidorBarrio.value = medidor.barrio;
    // medidorPrincipal.value = medidor.callePrincipal;
    // medidorSecundaria.value = medidor.calleSecundaria;
    // medidorNumeroCasa.value = medidor.numeroCasa;
    // medidorReferencia.value = medidor.referencia;
    // medidorObservacion.value = medidor.observacion;
    // Inhabilitamos los campos que no se deben editar
    contratoFecha.readOnly = true;
    socioContratanteCedula.readOnly = true;
    socioContratanteApellido.readOnly = true;
    socioContratanteNombre.readOnly = true;
    contratoPagoAlcanterillado.disabled = true;
    contratoPagoEscrituras.disabled = true;
    contratoPagoRecoleccion.disabled = true;
    // ~~~~~~~~~~~~~~~~
    // editMedidorId = medidor.medidorId;
  }
  editingStatus = true;
  console.log(medidor);
  console.log("btn1");
  seccion1.classList.remove("active");
  seccion2.classList.add("active");
};
const deleteMedidor = async (id) => {
  const response = confirm("Estas seguro de eliminar este medidor?");
  if (response) {
    console.log("id from medidores.js");
    const result = await ipcRenderer.invoke("deleteMedidor", id);
    console.log("Resultado medidores.js", result);
    getContratos();
  }
};
const getContratos = async () => {
  datosContratos = await ipcRenderer.invoke("getDatosContratos");
  console.log(datosContratos);
  renderContratos(datosContratos);
};
async function init() {
//  await getContratos();
// await getMedidoresDisponibles();
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
// Cargar los medidores disponibles
const getMedidoresDisponibles = async () => {
  medidoresDisponibles = await ipcRenderer.invoke("getMedidoresDisponibles");
  console.log(medidoresDisponibles);
  renderMedidoresDisponibles(medidoresDisponibles);
};
// function renderMedidoresDisponibles(medidoresDisponibles) {
//   medidoresDisponiblesList.innerHTML = "";
//   medidoresDisponibles.forEach((medidorDisponible) => {
//     medidoresDisponiblesList.innerHTML += `
//     <option onchange="cargarDatosMedidor('${medidorDisponible.id}')"  value="${medidorDisponible.id}">${medidorDisponible.nombre+' '+medidorDisponible.marca+' '+'('+medidorDisponible.stock+')'}</option>
//       `;
//   });
// }
function renderMedidoresDisponibles(medidoresDisponibles) {
  medidoresDisponiblesList.innerHTML = "";

  medidoresDisponibles.forEach((medidorDisponible) => {
    var option = document.createElement("option");
    option.value = medidorDisponible.id;
    option.textContent =
      medidorDisponible.nombre +
      " " +
      medidorDisponible.marca +
      " (" +
      medidorDisponible.stock +
      ")";
    medidoresDisponiblesList.appendChild(option);
  });

  medidoresDisponiblesList.onchange = function () {
    var selectedOption =
      medidoresDisponiblesList.options[medidoresDisponiblesList.selectedIndex];
    var selectedId = selectedOption.value;
    console.log("Id from onchange", selectedId);
    cargarDatosMedidor(selectedId);
  };
  medidoresDisponiblesList.onclick = function () {
    var selectedOption =
      medidoresDisponiblesList.options[medidoresDisponiblesList.selectedIndex];
    var selectedId = selectedOption.value;
    console.log("Id from onchange", selectedId);
    cargarDatosMedidor(selectedId);
  };
}
const cargarDatosMedidor = async (id) => {
  console.log("Se llamo a la carga de datos del medidor", id);
  const medidorDisponible = await ipcRenderer.invoke(
    "getMedidorDisponibleById",
    id
  );
  medidorDescripcion.value = medidorDisponible.descripcion;
  medidorMarca.value = medidorDisponible.marca;
  console.log(medidorDisponible);
};
// Cargar datos de los socios registrados

var inputSugerencias = document.getElementById("cedulaSocioContratante");
var listaSugerencias = document.getElementById("lista-sugerencias");
var sugerencias = [];

// Obtener las sugerencias desde la base de datos
async function obtenerSugerencias() {
  try {
    var cedulasSugerencias = await ipcRenderer.invoke("getSocios");
    sugerencias = cedulasSugerencias.map(function (objeto) {
      return objeto.cedula;
    });
  } catch (error) {
    console.error("Error al obtener las sugerencias:", error);
  }
}

inputSugerencias.addEventListener("input", function () {
  var textoIngresado = inputSugerencias.value;
  var sugerenciasFiltradas = sugerencias.filter(function (sugerencia) {
    return sugerencia.startsWith(textoIngresado);
  });

  mostrarSugerencias(sugerenciasFiltradas);
});

function mostrarSugerencias(sugerencias) {
  listaSugerencias.innerHTML = "";
  sugerencias.forEach(function (sugerencia) {
    var li = document.createElement("li");

    li.textContent = sugerencia;
    li.addEventListener("click", function () {
      inputSugerencias.value = sugerencia;
      obtenerDatosSocioContratante(sugerencia);
      listaSugerencias.innerHTML = "";
    });

    li.style.padding = "8px";
    li.style.cursor = "pointer";
    li.style.listStyle = "none";
    listaSugerencias.appendChild(li);
  });
}

// Obtener las sugerencias desde la base de datos al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  obtenerSugerencias()
    .then(function () {
      console.log("Sugerencias obtenidas:", sugerencias);
    })
    .catch(function (error) {
      console.error("Error al obtener las sugerencias:", error);
    });
});
const obtenerDatosSocioContratante = async (cedula) => {
  console.log("Se llamo a la carga de datos del contratante", cedula);
  const socioContratante = await ipcRenderer.invoke(
    "getContratanteByCedula",
    cedula
  );
  socioContratanteNombre.value = socioContratante.nombre;
  socioContratanteApellido.value = socioContratante.apellido;
  socioContratanteId = socioContratante.id;
  console.log(socioContratante);
  verificarContratosAnteriores(cedula);
};
// ----------------------------------------------------------------
// funcion que notifica si el usuario presenta contratos anteriores
// ----------------------------------------------------------------
const verificarContratosAnteriores = async (cedula) => {
  console.log("Se llamo a la verificacion de contratos", cedula);
  const contratos = await ipcRenderer.invoke(
    "getContratosAnterioresByCedula",
    cedula
  );
  console.log(contratos);
};
ipcRenderer.on("showAlertMedidoresExistentes", (event, message) => {
  alert(message);
});
// Habilitar o desabilitar el formulario del
//medidor en funcion de si el socio solicita el servicio de agua potable
function habilitarFormMedidor() {
  if (contratoPagoAguaPotable.checked) {
    fechaInstalacion.disabled = false;
    medidoresDisponiblesSelect.disabled = false;
    medidorCodigo.disabled = false;
    medidorMarca.disabled = false;
    medidorDescripcion.disabled = false;
    (medidorNumeroCasa.disabled = false), (medidorBarrio.disabled = false);
    medidorPrincipal.disabled = false;
    medidorSecundaria.disabled = false;
    medidorReferencia.disabled = false;
    medidorObservacion.disabled = false;
  } else {
    fechaInstalacion.disabled = true;
    medidoresDisponiblesSelect.disabled = true;
    medidorCodigo.disabled = true;
    medidorMarca.disabled = true;
    medidorDescripcion.disabled = true;
    (medidorNumeroCasa.disabled = true), (medidorBarrio.disabled = true);
    medidorPrincipal.disabled = true;
    medidorSecundaria.disabled = true;
    medidorReferencia.disabled = true;
    medidorObservacion.disabled = true;
  }
}
// Transicion entre las secciones de la vista
var btnSeccion1 = document.getElementById("btnSeccion1");
var btnSeccion2 = document.getElementById("btnSeccion2");
var seccion1 = document.getElementById("seccion1");
var seccion2 = document.getElementById("seccion2");

btnSeccion1.addEventListener("click", function () {
  console.log("btn1");
  seccion1.classList.remove("active");
  seccion2.classList.add("active");
});

btnSeccion2.addEventListener("click", function () {
  console.log("btn2");
  seccion2.classList.remove("active");
  seccion1.classList.add("active");
});

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

function mostrarLogin() {
  const dialog = document.getElementById("loginDialog");
  dialog.showModal();
}
const mostrarNotificacionPersonalizada = async () => {
  console.log('respuesta');
  await ipcRenderer.send("mostrarNotificacionPersonalizada");
};
mostrarNotificacionPersonalizada;
init();
