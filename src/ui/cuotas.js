// ----------------------------------------------------------------
// Librerias
// ----------------------------------------------------------------
const { ipcRenderer } = require("electron");
const validator = require("validator");
const Swal = require("sweetalert2");
// ----------------------------------------------------------------
const servicioCreacion = document.getElementById("fechacreacion");
const servicioNombre = document.getElementById("nombre");
const servicioDescripcion = document.getElementById("descripcion");
// const servicioTipo = document.getElementById("tipo");
const servicioValor = document.getElementById("valor");
const serviciosList = document.getElementById("servicios");
const usuariosList = document.getElementById("usuarios");
const buscarServicios = document.getElementById("buscarServicios");
const criterio = document.getElementById("criterio");
const criterioContent = document.getElementById("criterio-content");
const servicioAplazableSn = document.getElementById("aplazablesn");
const valoresDistintos = document.getElementById("distintosSn");
const aplazableOptions = document.getElementById("aplazable-options");
const numeroPagos = document.getElementById("numero-pagos");
const valorPagos = document.getElementById("valor-pagos");
const servicioIndividualSn = document.getElementById("individualSn");

const buscarBeneficiarios = document.getElementById("buscarBeneficiarios");
const criterioBn = document.getElementById("criterio-bn");
const criterioContentBn = document.getElementById("criterio-bn-content");
const sectoresBusqueda = document.getElementById("sectores");
const servicioTit = document.getElementById("servicio-tit");
const servicioDesc = document.getElementById("servicio-desc");
const servicioDet = document.getElementById("servicio-det");
const servicioVal = document.getElementById("servicio-val");
const servicioCreaciondet = document.getElementById("fechaCreacion-det");
const btnVolver = document.getElementById("btn-volver");
// const servicioCreacionBn = document.getElementById("fechaCreacion-bn");
// const servicioNombreBn = document.getElementById("nombre-bn");
// const servicioDescripcionBn = document.getElementById("descripcion-bn");
// const servicioValorBn = document.getElementById("valor-bn");
// ----------------------------------------------------------------
// Variables para mostrar el estado de recaudacion.
// ----------------------------------------------------------------
const valorRecaudado = document.getElementById("valorRecaudado");
const valorPendiente = document.getElementById("valorPendiente");
const valorTotal = document.getElementById("valorTotal");
const buscarRecaudaciones = document.getElementById("buscarRecaudaciones");
const criterioSt = document.getElementById("criterio-st");
const recaudacionesList = document.getElementById("recaudaciones");
const anioRecaudacion = document.getElementById("anioRecaudacion");
const mesRecaudacion = document.getElementById("mesRecaudacion");
const anioLimite = document.getElementById("anioLimite");
const mesLimite = document.getElementById("mesLimite");
const btnReporte = document.getElementById("btnReporte");
const btnContratarTodos = document.getElementById("contratar-todos");
const btnContratarPrincipales = document.getElementById(
  "contratar-principales"
);
// ----------------------------------------------------------------
// Variables del diálogo de opciones de las cuotas.
// ----------------------------------------------------------------
const errortextAbono = document.getElementById("errorTextAbono");
const errContainer = document.getElementById("err-container");
const dialogOpciones = document.getElementById("formOpciones");
const servicioDg = document.getElementById("title-dg");
const descripcionDg = document.getElementById("descripcion-dg");
const detallesDg = document.getElementById("detalles-dg");
const servicioValorDg = document.getElementById("servicio-val-dg");
const subtotalText = document.getElementById("subtotalText");
const subtotalDg = document.getElementById("subtotal-dg");
const descuentoValDg = document.getElementById("descuento-val-dg");
const descuentoDg = document.getElementById("descuento-dg");
const totalDg = document.getElementById("total-dg");
const numPagosDg = document.getElementById("numPagos-dg");
const valPagosDg = document.getElementById("valorPagos-dg");
const canceladosDg = document.getElementById("cancelados-dg");
const pendientesDg = document.getElementById("pendientes-dg");
const saldoDg = document.getElementById("saldo-dg");
const abonadoDg = document.getElementById("abonado-dg");
const abonarDg = document.getElementById("abonar-dg");
const guardarDg = document.getElementById("btnGuardar-dg");
const administrarDg = document.getElementById("btnAdministrar-dg");
const contratarDg = document.getElementById("btnContratar-dg");
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// Elementos del formulario.
// ----------------------------------------------------------------
const reporteBeneficiarios = document.getElementById("reporte_beneficiarios");
const containerOpciones = document.getElementById("container-opciones");
const sectionOpciones = document.getElementById("section-opciones");
const filtrarMes = document.getElementById("filtrar-mes");
const diasPagos = document.getElementById("dias-pagos");
const mesPagos = document.getElementById("mes-pagos");
const recaudadoFiltrado = document.getElementById("valor-recaudado-filtrado");
const filtroCancelados = document.getElementById("filtrar-cancelados");

const cancelarForm = document.getElementById("cancelar-form");
const mesBusqueda = document.getElementById("mesBusqueda");
const anioBusqueda = document.getElementById("anioBusqueda");
let recaudaciones = [];
let recaudacionesAgrupadas = [];
let recaudacionesFiltradas = [];
let valorFiltrado = 0;
let porContratar = [];
let servicios = [];
let usuarios = [];
let valorIndividual = 0.0;
let editingStatus = false;
let editServicioId = "";
let contratandoServicio = "";
let creacionEdit = "";
let ultimaFechaPago = "";
let valoresDistintosDf = "No";
let fechaCreacion = "2024-04-01 00:00:00";
servicioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (validator.isEmpty(servicioNombre.value)) {
    mensajeError.textContent = "El nombre del servicio es obligatorio.";
    servicioNombre.focus();
  } else if (validator.isEmpty(servicioDescripcion.value)) {
    mensajeError.textContent = "La descripcion del servicio es obligatoria.";
    servicioDescripcion.focus();
    // } else if (validator.isEmpty(servicioTipo.value)) {
    //   mensajeError.textContent = "El tipo de servicio es obligatorio.";
    //   servicioTipo.focus();
    // }
  } else if (validator.isEmpty(servicioValor.value)) {
    mensajeError.textContent = "El valor el servicio es obligatorio.";
    servicioValor.focus();
  } else {
    if (valoresDistintos.value !== null) {
      valoresDistintosDf = valoresDistintos.value;
    }
    const newCuota = {
      fechaCreacion: formatearFecha(new Date()),
      nombre: servicioNombre.value,
      descripcion: servicioDescripcion.value,
      tipo: "Cuota",
      valor: servicioValor.value,
      aplazableSn: servicioAplazableSn.value,
      numeroPagos: numeroPagos.value,
      valorPagos: valorPagos.value,
      individualSn: servicioIndividualSn.value,
      valoresDistintosSn: valoresDistintosDf,
    };
    if (!editingStatus) {
      const result = await ipcRenderer.invoke("createCuotas", newCuota);
      console.log(result);
    } else {
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
          console.log("Editing cuota with electron");
          const result = await ipcRenderer.invoke(
            "updateCuotas",
            editServicioId,
            newCuota
          );
        }
      });
    }
  }
});
function renderCuotas(cuotas) {
  serviciosList.innerHTML = "";
  cuotas.forEach((cuota) => {
    const divContainer = document.createElement("div");
    divContainer.className = "col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-1";
    divContainer.style.height = "fit-content";
    divContainer.style.maxHeight = "fit-content";
    const divCol6 = document.createElement("div");
    divCol6.className = "clase col-6 card card-servicios";
    divCol6.style.width = "100%";
    divCol6.style.maxWidth = "100%";
    divCol6.style.padding = "0.3em";
    divCol6.style.backgroundColor = "#d6eaf8";
    divCol6.style.height = "fit-content";
    divCol6.style.maxHeight = "fit-content";

    const divRowG0 = document.createElement("div");
    divRowG0.className = "row g-0 px-2";
    divRowG0.style.backgroundColor = "white";

    const divCol2 = document.createElement("div");
    divCol2.className =
      "col-2 d-flex justify-content-center align-items-center container-img";

    const imgServicios = document.createElement("img");
    imgServicios.src = "../assets/fonts/servicioIcon64x64.png";
    imgServicios.className = "img-fluid rounded-start img-servicios";
    imgServicios.alt = "not found";

    divCol2.appendChild(imgServicios);

    const divCol9 = document.createElement("div");
    divCol9.className =
      "col-9 d-flex justify-content-center align-items-center";

    const divCardBody = document.createElement("div");
    divCardBody.className = "card-body";

    const divContainerTitle = document.createElement("div");
    divContainerTitle.className = "row container-title";

    const h6CardTitle = document.createElement("h6");
    h6CardTitle.className = "card-title";
    h6CardTitle.textContent = cuota.nombre;

    divContainerTitle.appendChild(h6CardTitle);

    const divContainerSocios = document.createElement("div");
    divContainerSocios.className =
      "row container-socios d-flex align-items-center";

    const pDescription = document.createElement("p");
    pDescription.textContent = cuota.descripcion;

    divContainerSocios.appendChild(pDescription);

    const divContainerDetalles = document.createElement("div");
    divContainerDetalles.className = "row container-detalles";

    const detalles = [
      { label: "Valor:$", value: parseFloat(cuota.valor).toFixed(2) },
      { label: "Tipo:", value: cuota.tipo },
      { label: "Aplazable:", value: cuota.aplazableSn },
    ];

    detalles.forEach((detalle) => {
      const divDetalle = document.createElement("div");
      divDetalle.className = "d-flex align-items-baseline col-4 pm-0";
      const esp = document.createElement("p");
      esp.textContent = "-";
      esp.className = "trans";
      const h6Label = document.createElement("h6");
      h6Label.textContent = detalle.label;

      const pValue = document.createElement("p");
      pValue.textContent = detalle.value;

      divDetalle.appendChild(h6Label);
      divDetalle.appendChild(esp);
      divDetalle.appendChild(pValue);
      divContainerDetalles.appendChild(divDetalle);
    });

    divCardBody.appendChild(divContainerTitle);
    divCardBody.appendChild(divContainerSocios);
    divCardBody.appendChild(divContainerDetalles);
    divCol9.appendChild(divCardBody);

    const divCol1 = document.createElement("div");
    divCol1.className = "col-1 d-flex flex-column justify-content-center";

    // const buttons = ["fa-file-pen", "fa-trash", "fa-chart-simple"];
    const btnEditServicio = document.createElement("button");
    btnEditServicio.className =
      "btn-servicios-custom d-flex justify-content-center align-items-center";
    const iconEdit = document.createElement("i");
    iconEdit.className = "fa fa-file-pen";
    btnEditServicio.appendChild(iconEdit);

    const btnDeleteServicio = document.createElement("button");
    btnDeleteServicio.className =
      "btn-servicios-custom d-flex justify-content-center align-items-center";
    const iconDelete = document.createElement("i");
    iconDelete.className = "fa fa-trash";
    btnDeleteServicio.appendChild(iconDelete);
    btnDeleteServicio.onclick = () => {
      console.log("Eliminar ...");
    };
    const btnEstadistics = document.createElement("button");
    btnEstadistics.className =
      "btn-servicios-custom d-flex justify-content-center align-items-center";
    const iconStadistics = document.createElement("i");
    iconStadistics.className = "fa fa-chart-simple";
    btnEstadistics.appendChild(iconStadistics);
    btnEstadistics.onclick = () => {
      console.log("Estadisticas del servicio: " + cuota.id);
      mostrarEstadisticas(cuota.id);
      mostrarSeccion("seccion2");
    };
    divCol1.appendChild(btnEditServicio);
    btnEditServicio.onclick = () => {
      console.log("Detalles del servicio: " + cuota.id);
      editServicio(cuota.id);
    };
    btnDeleteServicio.onclick = () => {
      console.log("Eliminar servicio: " + cuota.id);
      deleteServicio(cuota.id, cuota.nombre);
    };
    divCol1.appendChild(btnDeleteServicio);
    divCol1.appendChild(btnEstadistics);

    divRowG0.appendChild(divCol2);
    divRowG0.appendChild(divCol9);
    divRowG0.appendChild(divCol1);

    divCol6.appendChild(divRowG0);
    divContainer.appendChild(divCol6);
    divContainer.onclick = () => {
      // Elimina la clase "selected" de todos los elementos
      const elementos = document.querySelectorAll(".clase"); // Reemplaza con la clase real de tus elementos
      elementos.forEach((elemento) => {
        elemento.classList.remove("bg-secondary");
      });

      // Agrega la clase "selected" al elemento que se hizo clic
      divCol6.classList.add("bg-secondary");
      console.log("Detalles del servicio: " + cuota.id);
      editServicio(cuota.id);
    };
    serviciosList.appendChild(divContainer);
  });
}
async function renderUsuarios(usuarios, servicioId) {
  let ct = [];
  console.log("Id servicio: " + servicioId);
  const contratadosId = await ipcRenderer.invoke(
    "getContratadosById",
    servicioId
  );
  const servicio = await ipcRenderer.invoke("getCuotasById", servicioId);
  console.log("Contratados: " + contratadosId);
  contratadosId.forEach((contratadoId) => {
    ct.push(contratadoId.contratosId);
  });
  // contratados = console.log("Contratados", contratados);
  // await getContratados(servicioId);
  usuariosList.innerHTML = "";
  usuarios.forEach(async (usuario) => {
    const divContainer = document.createElement("div");
    divContainer.className = "col-xl-6 col-lg-6 col-md-12 col-sm-12";
    const divCol4 = document.createElement("div");
    divCol4.className = "clase col-12 card  my-1";
    divCol4.style.padding = "0.3em";
    divCol4.style.backgroundColor = "#d6eaf8";
    divCol4.style.maxWidth = "100%";
    divCol4.style.width = "100%";
    divCol4.style.minWidth = "100%";
    divCol4.style.height = "fit-content";
    divCol4.style.maxHeight = "fit-content";

    const divRowG0 = document.createElement("div");
    divRowG0.className = "row g-0";
    divRowG0.style.backgroundColor = "white";

    const divCol2 = document.createElement("div");
    divCol2.className =
      "col-2 d-flex justify-content-center align-items-center";

    const img = document.createElement("img");
    img.src = "../assets/fonts/usuario-rounded48x48.png";
    img.className = "img-fluid rounded-start";
    img.alt = "not found";

    divCol2.appendChild(img);

    const divCol8 = document.createElement("div");
    divCol8.className =
      "col-7 d-flex justify-content-center align-items-center text-center";

    const divCardBody = document.createElement("div");
    divCardBody.className = "card-body text-center";

    const containerTitle = document.createElement("div");
    containerTitle.className =
      "d-flex align-items-baseline container-title mp-0";

    const h6Contrato = document.createElement("h6");
    h6Contrato.className = "card-title mp-0";
    h6Contrato.textContent = "Contrato:";

    const pContrato = document.createElement("p");
    pContrato.className = "text-white mp-0";
    pContrato.textContent = "-";

    const pContratoValue = document.createElement("p");
    pContratoValue.className = "mp-0";
    pContratoValue.textContent = usuario.codigo;

    containerTitle.appendChild(h6Contrato);
    containerTitle.appendChild(pContrato);
    containerTitle.appendChild(pContratoValue);

    const containerSocios = document.createElement("div");
    containerSocios.className = "container-socios d-flex align-items-baseline";

    const h6Socio = document.createElement("h6");
    h6Socio.textContent = "Socio:";

    const pSocio = document.createElement("p");
    pSocio.className = "trans";
    pSocio.textContent = "-";

    const pSocioValue = document.createElement("p");
    pSocioValue.textContent = usuario.socio;

    containerSocios.appendChild(h6Socio);
    containerSocios.appendChild(pSocio);
    containerSocios.appendChild(pSocioValue);

    divCardBody.appendChild(containerTitle);
    divCardBody.appendChild(containerSocios);

    divCol8.appendChild(divCardBody);

    const divCol2Estado = document.createElement("div");
    divCol2Estado.className = "col-3 flex-column d-flex align-items-center ";

    const divEstado = document.createElement("div");
    divEstado.className = "col-12 text-center";

    const pEstado = document.createElement("p");
    pEstado.className = "mt-3";

    const divCustomCheckbox = document.createElement("div");
    divCustomCheckbox.className =
      "custom-checkbox d-flex justify-content-center align-items-center";
    divCustomCheckbox.style.marginTop = "0";
    divCustomCheckbox.style.padding = "0 38%";
    divCustomCheckbox.style.width = "100%";

    const inputCheckbox = document.createElement("input");
    inputCheckbox.type = "checkbox";
    inputCheckbox.className = "circular-checkbox ";
    console.log("Cotratados comparar: " + ct);
    if (ct.includes(usuario.contratosId)) {
      inputCheckbox.checked = true;
      pEstado.innerHTML = "<small>Contratado</small>";
    } else {
      inputCheckbox.checked = false;
      pEstado.innerHTML = "<small>No contratado</small>";
    }

    inputCheckbox.style.width = "40%";
    inputCheckbox.style.height = "40%";
    inputCheckbox.disabled = true;
    // await let contratosIds = usuario.contratosId;
    // console.log("id: " + contratosIds);
    // inputCheckbox.onchange = function () {
    //   if (inputCheckbox.checked) {
    //     console.log("id del contrato: " + usuario.contratosId);
    //     porContratar.push(usuario.contratosId);
    //     console.log("Por contratar: " + porContratar);
    //   }
    // };

    const labelCheckbox = document.createElement("label");
    labelCheckbox.for = "miCheckbox";
    labelCheckbox.className =
      "text-white d-flex align-items-center justify-content-center";

    const iCheckbox = document.createElement("i");
    iCheckbox.className = "fa fa-check";

    labelCheckbox.appendChild(iCheckbox);
    divCustomCheckbox.appendChild(inputCheckbox);
    divCustomCheckbox.appendChild(labelCheckbox);

    divEstado.appendChild(pEstado);
    divEstado.appendChild(divCustomCheckbox);

    divCol2Estado.appendChild(divEstado);

    divRowG0.appendChild(divCol2);
    divRowG0.appendChild(divCol8);
    divRowG0.appendChild(divCol2Estado);

    divCol4.appendChild(divRowG0);
    divContainer.appendChild(divCol4);
    divContainer.onclick = () => {
      // Elimina la clase "selected" de todos los elementos
      const elementos = document.querySelectorAll(".clase"); // Reemplaza con la clase real de tus elementos
      elementos.forEach((elemento) => {
        elemento.classList.remove("bg-secondary");
      });
      // Agrega la clase "selected" al elemento que se hizo clic
      divCol4.classList.add("bg-secondary");
      // detallesContratos(datosContrato.contratosId);
      servicioOpcionesdg(usuario, servicio);
      console.log("div: " + usuario.socio);
    };
    usuariosList.appendChild(divContainer);
  });
}
// const contratar = async () => {
//   porContratar.forEach(async (contratando) => {
//     newServicioContratado = {
//       fechaEmision: formatearFecha(new Date()),
//       estado: "Sin aplicar",
//       serviciosId: editServicioId,
//       contratosId: contratando,
//       descuentosId: 1,
//       valorIndividual: valorIndividual,
//     };
//     const contratado = await ipcRenderer.invoke(
//       "createSercicioContratado",
//       newServicioContratado
//     );
//     return contratado;
//   });
// };
// function renderServicios(servicios) {
//   serviciosList.innerHTML = "";
//   servicios.forEach((servicio) => {
//     serviciosList.innerHTML += `
//        <tr>
//       <td>${servicio.nombre}</td>
//       <td>${servicio.descripcion}</td>

//       <td>${servicio.valor}</td>
//       <td>
//       <button onclick="deleteServicio('${servicio.id}')" class="btn ">
//       <i class="fa-solid fa-user-minus"></i>
//       </button>
//       </td>
//       <td>
//       <button onclick="editServicio('${servicio.id}')" class="btn ">
//       <i class="fa-solid fa-user-pen"></i>
//       </button>
//       </td>
//    </tr>
//       `;
//   });
// }
const editServicio = async (id) => {
  const servicio = await ipcRenderer.invoke("getCuotasById", id);
  servicioCreacion.value = formatearFecha(servicio.fechaCreacion);
  servicioNombre.value = servicio.nombre;
  servicioDescripcion.value = servicio.descripcion;
  if (servicio.aplazableSn == "Si") {
    servicioAplazableSn.value = "Si";
  } else {
    servicioAplazableSn.value = "No";
  }
  if (servicio.IndividualSn === "Si") {
    servicioIndividualSn.value = "Si";
  }
  if (servicio.IndividualSn === "No") {
    servicioIndividualSn.value = "No";
  }
  if (servicio.numeroPagos !== "null") {
    numeroPagos.value = servicio.numeroPagos;
  }
  servicioValor.value = servicio.valor;
  valorPagos.value = servicio.valorPagos;
  editingStatus = true;
  editServicioId = servicio.id;
  console.log(servicio);
};
const deleteServicio = async (id, servicioNombre) => {
  Swal.fire({
    title: "¿Quieres borrar el servicio  " + servicioNombre + " ?",
    text: "No se eliminarán los servicios en uso y no podrás deshacer esta acción.",
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
      console.log("id from parametros.js");
      // Eliminamos el registro de la tabla servicios de tipo ocacional.
      const result = await ipcRenderer.invoke("deleteCuotas", id);
      console.log("Resultado parametros.js", result);
    }
  });
};
// ----------------------------------------------------------------
// Funcion que muestra las estadisticas de un servicio
// ----------------------------------------------------------------
const mostrarEstadisticas = async (servicioId) => {
  // await getContratados(servicioId);
  const servicio = await ipcRenderer.invoke("getCuotasById", servicioId);
  contratandoServicio = servicio;
  console.log("Estadisticas: " + servicio);
  servicioTit.textContent = servicio.nombre;
  servicioDesc.textContent = "(" + servicio.descripcion + ")";
  servicioCreaciondet.textContent =
    "Creado: " + formatearFecha(servicio.fechaCreacion);
  creacionEdit = formatearFecha(servicio.fechaCreacion);
  servicioVal.textContent = "Valor: $" + servicio.valor;
  let aplazableSnText = "No aplazable";
  if (servicio.aplazableSn !== "No") {
    aplazableSnText = "Aplazable";
  }
  servicioDet.textContent = servicio.tipo + " | " + aplazableSnText;
  editingStatus = true;
  editServicioId = servicio.id;
  console.log(servicio);
  let criterioBuscar = "all";
  let criterioContentBuscar = "all";
  console.log("Mostrarestadisticas: " + servicio.id);
  await getBeneficiarios(servicio.id);
  await getRecaudaciones(servicioId);
};
const getRecaudaciones = async () => {
  console.log("Mostrando recaudaciones");
  let valoresRecaudados = 0.0;
  let valoresPendientes = 0.0;
  let valoresTotales = 0.0;
  let fechaDesde = "all";
  let fechaHasta = "all";
  let fechasPagoAgrupadas = [];
  let fechasPagos = [];
  let anioD = parseInt(anioRecaudacion.value);
  let mesD = parseInt(mesRecaudacion.value);
  console.log("Mes a buscar: " + mesD);
  let anioH = anioRecaudacion.value;
  let mesH = mesRecaudacion.value;
  if (criterioSt.value === "periodo") {
    let diaD = obtenerPrimerYUltimoDiaDeMes(anioD, mesD);
    let diaH = obtenerPrimerYUltimoDiaDeMes(anioH, mesH);
    // fechaDesde = "'" + anioD + "-" + mesD + "-" + diaD + "'";
    // fechaHasta = "'" + anioH + "-" + mesH + "-" + diaH + "'";
    fechaDesde = formatearFecha(diaD.primerDia);
    fechaHasta = formatearFecha(diaH.ultimoDia);
  } else if (criterioSt.value === "mes") {
    let diaD = obtenerPrimerYUltimoDiaDeMes(anioD, mesD);
    fechaDesde = formatearFecha(diaD.primerDia);
    fechaHasta = formatearFecha(diaD.ultimoDia);
    // console.log(
    //   "fecha error? :" + diaD.ultimoDia + " " + fechaDesde + " " + fechaHasta
    // );
  } else if (criterioSt.value === "actual") {
    console.log("Buscando Actual");
    anioD = parseInt(new Date().getFullYear());
    console.log("Actual: " + anioD);
    mesD = parseInt(new Date().getMonth());
    console.log("Mes actual: " + mesD);

    let diaD = obtenerPrimerYUltimoDiaDeMes(anioD, mesD);
    fechaDesde = formatearFecha(diaD.primerDia);
    fechaHasta = formatearFecha(diaD.ultimoDia);
  }

  recaudaciones = await ipcRenderer
    .invoke("getRecaudarByServicio", editServicioId)
    .then(async (recaudaciones) => {
      // Recibimos recaudaciones y las grupamos.
      recaudacionesAgrupadas = await agruparServicios(recaudaciones);
      console.log("Recaudaciones: ", recaudacionesAgrupadas);

      recaudacionesList.innerHTML = "";
      recaudacionesAgrupadas.forEach(async (recaudacion) => {
        recaudacion.objetos.forEach((objeto) => {
          if (objeto.fechaPago !== null && objeto.fechaPago !== undefined) {
            fechasPagos.push({ fechaPago: formatearFecha(objeto.fechaPago) });
          }
        });
        valoresRecaudados += recaudacion.abono;
        valoresTotales += recaudacion.total;

        let saldo = recaudacion.total - recaudacion.abono;
        valoresPendientes += saldo;
      });

      valorPendiente.textContent = valoresPendientes.toFixed(2);
      valorRecaudado.textContent = valoresRecaudados.toFixed(2);
      valorTotal.textContent = valoresTotales.toFixed(2);
      console.log("Dias de pago: ", fechasPagos);
      fechasPagoAgrupadas = await agruparFechasPago(fechasPagos);
      console.log("Dias de pago reducido: ", fechasPagoAgrupadas);

      await cargarFechasPago(fechasPagoAgrupadas);
      filtrarRecaudados();
      preRenderRecaudados(recaudacionesAgrupadas);
    });
  // recaudacionesList.innerHTML = "";
  // recaudaciones.forEach((recaudacion) => {
  //   // let abonoRp = 0;
  //   // if (
  //   //   parseFloat(recaudacion.abono) == 0 &&
  //   //   recaudacion.detalleEstado == "Cancelado"
  //   // ) {
  //   //   abonoRp = recaudacion.total;
  //   // } else if (recaudacion.detalleEstado == "Cancelado") {
  //   //   abonoRp = recaudacion.abono;
  //   // } else {
  //   //   abonoRp = 0;
  //   // }
  //   // valoresPendientes += recaudacion.total - abonoRp;
  //   // valoresRecaudados += abonoRp;
  //   // valoresTotales += recaudacion.total;
  //   recaudacionesList.innerHTML += `
  //          <tr>
  //          <td>${recaudacion.codigo}</td>
  //          <td>${recaudacion.nombres + " " + recaudacion.apellidos}</td>
  //          <td>${recaudacion.valorIndividual}</td>
  //      </tr>
  //         `;
  // });
  // <td>${recaudacion.detalleEstado}</td>
  // <td>${abonoRp}</td>
  // <td>${recaudacion.total}</td>
  // valorPendiente.textContent = valoresPendientes.toFixed(2);
  // valorRecaudado.textContent = valoresRecaudados.toFixed(2);
  // valorTotal.textContent = valoresTotales.toFixed(2);
};
async function renderRecaudados(recaudacionesFiltrados) {
  console.log("LLamo render recaudados", recaudacionesFiltrados);
  console.log("LLamo render recaudados", recaudacionesFiltrados.length);
  recaudacionesList.innerHTML = ``;
  recaudacionesFiltrados.forEach((recaudacion) => {
    console.log("xxx");
    let estado = "Por cobrar";
    let saldo = recaudacion.total - recaudacion.abono;
    if (recaudacion.total === recaudacion.abono) {
      estado = "Cancelado";
    }

    recaudacionesList.innerHTML += `
           <tr>
           <td>${recaudacion.objetos[0].codigo}</td>
           <td>${recaudacion.apellidos + " " + recaudacion.nombres}</td>
           <td>${recaudacion.total}</td>        
           <td>${
             recaudacion.abonoFiltrado
               ? recaudacion.abonoFiltrado
               : recaudacion.abono
           }</td>        
           <td>${estado}</td>        
           <td>${saldo}</td>        
       </tr>
          `;
  });
}
btnContratarTodos.addEventListener("click", () => {
  // Solicitar confirmacion al usuario !!
  Swal.fire({
    title: "¿Quieres aplicar este servicio a todos los contratos activos?",
    text: "El valor del servicio se aplicara en la planilla vigente.",
    icon: "question",
    iconColor: "#f8c471",
    showCancelButton: true,
    confirmButtonColor: "#2874A6",
    cancelButtonColor: "#EC7063 ",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
     await contratarTodos(usuarios, contratandoServicio);
    }
  });
});
btnContratarPrincipales.addEventListener("click", () => {
  // Solicitar confirmacion al usuario !!
  Swal.fire({
    title:
      "¿Quieres aplicar este servicio unicamente a los contratos principales activos?",
    text: "Los cambios se aplicaran en las planillas vigentes.",
    icon: "question",
    iconColor: "#f8c471",
    showCancelButton: true,
    confirmButtonColor: "#2874A6",
    cancelButtonColor: "#EC7063 ",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await contratarPrincipales(contratandoServicio.id, contratandoServicio.tipo);
    }
  });
});
async function contratarPrincipales(servicioId, tipo) {
  const result = await ipcRenderer.invoke(
    "contratarEnPrincipales",
    servicioId,
    tipo
  );
  console.log("Resultado de contratar en contratos principales: " + result);
}
async function contratarTodos(usuarios, servicio) {
  let descuentoTemporal = 0;
  let idDescuentoTemporal = 1;
  try {
    const newServicioContratado = {
      fechaEmision: formatearFecha(new Date()),
      estado: "Sin aplicar",
      valorIndividual: servicio.valor,
      numeroPagosIndividual: servicio.numeroPagos,
      valorPagosIndividual: servicio.valorPagos,
      descuentoValor: descuentoTemporal,
      descuentosId: idDescuentoTemporal,
      serviciosId: servicio.id,
    };
    for (const usuario of usuarios) {
      (newServicioContratado.contratosId = usuario.contratosId),
        await contratarServicioTodos(newServicioContratado, usuario, servicio);
    }

    // Llamamos a  create planilla asi nos aseguramos de que en caso de no existir la planilla
    // correspondiente a ese mes se la cree asi como tambien nos aseguramos de que el detalle
    // no se aplique dos veces. Los detalles se aplicaran en las planillas vigentes de acuerdo
    // al mes correspondiente.
    await ipcRenderer.invoke("createPlanilla", fechaCreacion).then(() => {
      Swal.fire({
        title: "Contratado para todos",
        icon: "success",
        iconColor: "green",

        confirmButtonColor: "#2874A6",
        confirmButtonText: "Aceptar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          mostrarEstadisticas(contratandoServicio.id);
        } else {
          mostrarEstadisticas(contratandoServicio.id);
        }
      });
    });
  } catch (error) {
    console.log("Error al contratar todos:", error);
    Swal.fire({
      title: "Error al contratar todos!",
      icon: "error",
      confirmButtonColor: "#f8c471",
    });
  }
}
const getBeneficiarios = async (servicio) => {
  console.log("Busqueda: " + servicio);
  let criterioBuscar = criterioBn.value;
  let criterioContentBuscar = criterioContentBn.value;
  let sectorBuscar = sectoresBusqueda.value;
  console.log("Criterio enviar: ", criterioBuscar, criterioContentBuscar);
  usuarios = await ipcRenderer.invoke(
    "getContratos",
    criterioBuscar,
    criterioContentBuscar,
    sectorBuscar
  );
  console.log("Beneficiarios: ", usuarios);
  // if (servicio.IndividualSn == "No") {
  //   const usuariosFiltrados = usuarios.filter(
  //     (usuario) => usuario.principalSn == "Si"
  //   );
  //   renderUsuarios(usuariosFiltrados, servicio);
  // } else {
  await renderUsuarios(usuarios, servicio);
  // }
};
const getServicios = async () => {
  criterioBuscar = criterio.value;
  criterioContentBuscar = criterioContent.value;
  let mesEnviar = mesBusqueda.value;
  let anioEnviar = anioBusqueda.value;
  cuotas = await ipcRenderer.invoke(
    "getCuotas",
    criterioBuscar,
    criterioContentBuscar,
    mesEnviar,
    anioEnviar
  );
  console.log(cuotas);
  renderCuotas(cuotas);
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
    await getServicios(criterioBuscar, criterioContentBuscar);
  } else {
    criterioContent.readOnly = false;
  }
};
buscarServicios.onclick = async () => {
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  await getServicios(criterioBuscar, criterioContentBuscar);
};
criterioBn.onchange = async () => {
  let criterioSeleccionado = criterioBn.value;
  console.log("Seleccionado: ", criterioSeleccionado);
  if (criterioSeleccionado === "all") {
    // criterioContent.textContent = "";
    criterioContentBn.value = "";
    criterioContentBn.readOnly = true;
    let criterioBuscar = "all";
    let criterioContentBuscar = "all";
    await getBeneficiarios(editServicioId);
  } else {
    criterioContentBn.readOnly = false;
  }
};
buscarBeneficiarios.onclick = async () => {
  let criterioBuscar = criterioBn.value;
  let criterioContentBuscar = criterioContentBn.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  await getBeneficiarios(editServicioId);
};
criterioSt.onchange = async () => {
  let criterioSeleccionado = criterioSt.value;
  console.log("Seleccionado: ", criterioSeleccionado);
  if (criterioSeleccionado == "all") {
    await getRecaudaciones();
  } else if (criterioSeleccionado == "actual") {
    mesActual();
    mesLimites();
    anioActual();
    anioLimites();
    getRecaudaciones();
    anioRecaudacion.disabled = true;
    mesRecaudacion.disabled = true;
  } else if (criterioSeleccionado === "mes") {
    anioRecaudacion.disabled = false;
    mesRecaudacion.disabled = false;
  }
};
buscarRecaudaciones.onclick = async () => {
  await getRecaudaciones();
};

async function init() {
  servicioCreacion.value = formatearFecha(new Date());
  mesActual();
  mesLimites();
  anioActual();
  anioLimites();
  cargarMesActual();
  cargarAnioBusquedas();
  cargarsSectores();
  let criterioBuscar = "all";
  let criterioContentBuscar = "all";
  await getServicios(criterioBuscar, criterioContentBuscar);
}
servicioValor.oninput = () => {
  numeroPagos.value = 1;
  valorPagos.value = servicioValor.value;
};
numeroPagos.onchange = () => {
  let valorPorPago = 0.0;
  if (
    !servicioValor.value == 0 ||
    !servicioValor.value == null ||
    !servicioValor.value == ""
  ) {
    vpp = servicioValor.value / numeroPagos.value;
    valorPorPago = Math.ceil(vpp * 100) / 100;
    valorPagos.value = valorPorPago.toFixed(2);
  } else {
    Swal.fire("Antes ingresa un valor válido");
    servicioValor.focus();
  }
};
servicioAplazableSn.onchange = () => {
  if (servicioAplazableSn.value === "Si") {
    numeroPagos.disabled = false;
    // aplazableOptions.style.display = "flex";
  } else {
    numeroPagos.disabled = true;
    numeroPagos.value = 1;
    valorPagos.value = servicioValor.value;
    // aplazableOptions.style.display = "none";
  }
};
ipcRenderer.on("datos-a-ocacionales", async () => {
  const datos = await ipcRenderer.invoke("pido-datos");
  console.log("Datos recibidos: " + datos.id);
  mostrarEstadisticas(datos.id);
  mostrarSeccion("seccion2");
  // console.log("Id recibido: " + servicioRv.id);
  // await mostrarEstadisticas(servicioRv.id);
  // mostrarSeccion("seccion2");
});
ipcRenderer.on("Notificar", (event, response) => {
  if (response.title === "Borrado!") {
    resetFormAfterSave();
  } else if (response.title === "Actualizado!") {
    resetFormAfterUpdate();
  } else if (response.title === "Guardado!") {
    resetFormAfterSave();
  }
  //  else if (response.title === "Contratado para todos!") {
  //   resetFormAfterSave();
  // }
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
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  console;
  await getServicios(criterioBuscar, criterioContentBuscar);
  mensajeError.textContent = "";
  servicioCreacion.value = formatearFecha(new Date());
}
async function resetFormAfterSave() {
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  console;
  await getServicios(criterioBuscar, criterioContentBuscar);
  editingStatus = false;
  editServicioId = "";
  servicioForm.reset();
  mensajeError.textContent = "";
  servicioCreacion.value = formatearFecha(new Date());
}
function resetForm() {
  editingStatus = false;
  editServicioId = "";
  servicioForm.reset();
  mensajeError.textContent = "";
  servicioCreacion.value = formatearFecha(new Date());
}
function mesActual() {
  mesRecaudacion.innerHTML = "";
  // Obtén el mes actual (0-indexed, enero es 0, diciembre es 11)
  const mesActual = new Date().getMonth();
  // Array de nombres de meses
  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  // Llena el select con las opciones de los meses
  for (let i = 0; i < nombresMeses.length; i++) {
    const option = document.createElement("option");
    option.value = i; // El valor es el índice del mes
    option.textContent = nombresMeses[i];
    mesRecaudacion.appendChild(option);
  }

  // Establece el mes actual como seleccionado
  mesRecaudacion.value = mesActual;
}
function mesLimites() {
  mesLimite.innerHTML = "";
  // Obtén el mes actual (0-indexed, enero es 0, diciembre es 11)
  const mesActual = new Date().getMonth();
  // Array de nombres de meses
  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  // Llena el select con las opciones de los meses
  for (let i = 0; i < nombresMeses.length; i++) {
    const option = document.createElement("option");
    option.value = i; // El valor es el índice del mes
    option.textContent = nombresMeses[i];
    mesLimite.appendChild(option);
  }

  // Establece el mes actual como seleccionado
  mesRecaudacion.value = mesActual;
}
function obtenerPrimerYUltimoDiaDeMes(anio, mes) {
  // Meses en JavaScript se numeran de 0 a 11 (enero es 0, diciembre es 11)
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  return {
    primerDia,
    ultimoDia,
  };
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
btnVolver.onclick = () => {
  mostrarSeccion("seccion1");
};
function anioActual() {
  anioRecaudacion.innerHTML = "";
  // Obtener el año actual
  var anioActual = new Date().getFullYear();
  // Crear opciones de años desde el año actual hacia atrás
  for (var i = anioActual; i >= 2020; i--) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    if (i === anioActual) {
      option.selected = true;
    }

    anioRecaudacion.appendChild(option);
  }
}
function anioLimites() {
  anioLimite.innerHTML = "";
  // Obtener el año actual
  var anioActual = new Date().getFullYear();
  // Crear opciones de años desde el año actual hacia atrás
  for (var i = anioActual; i >= 2020; i--) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    if (i === anioActual) {
      option.selected = true;
    }
    anioLimite.appendChild(option);
  }
}
btnReporte.onclick = async () => {
  const { value: tipo } = await Swal.fire({
    title: "Selecciona el tipo de reporte",
    icon: "question",
    iconColor: "#85C1E9",
    input: "select",
    customClass: {
      input: "form-control w-50 text-center mx-auto ",

      popup: " ",
      htmlContainer: "justify-content-center ",
    },
    inputOptions: {
      general: "General",
      cancelados: "Cancelados",
      sinCancelar: "Sin cancelar",
      filtrado: "Filtrado",
    },
    inputPlaceholder: "Seleccionar",

    showCancelButton: true,

    cancelButtonText: "Cancelar",
    cancelButtonColor: "#CD6155",
    confirmButtonColor: "#85C1E9",
    confirmButtonText: "Confirmar",

    inputValidator: (value) => {
      // return new Promise((resolve) => {
      if (!value) {
        return "Necesitas elejir el tipo de reporte!";
      }
      // });
    },
  });
  if (tipo) {
    Swal.fire(`Seleccionaste: ${tipo}`);
    vistaFactura(tipo);
  }
};
reporteBeneficiarios.addEventListener("click", () => {
  vistaFactura("beneficiarios");
});

async function vistaFactura(tipo) {
  let recaudacionesReporte = [];
  // Supongamos que tienes un arreglo de objetos
  // Define la condición de filtro (por ejemplo, objetos con id mayor que 2)

  const datos = {
    mensaje: "Hola desde pagina1",
    otroDato: 12345,
  };
  const encabezado = {
    servicio: servicioTit.textContent,
    creacion: creacionEdit,
    tipo: "Servicios Ocacionales",
    fechaD: creacionEdit,
    fechaH: ultimaFechaPago,
    tipoReporte: tipo,
  };

  const datosTotales = {
    pendiente: valorPendiente.textContent,
    recaudado: valorRecaudado.textContent,
    totalFinal: valorTotal.textContent,
    totalFiltrado: valorFiltrado,
  };
  if (tipo === "beneficiarios") {
    recaudacionesReporte = [];
    recaudacionesReporte = recaudacionesAgrupadas;
    console.log("rp beneficiarios: ", recaudacionesReporte);
  } else if (tipo == "cancelados") {
    recaudacionesReporte = [];
    recaudacionesReporte = recaudacionesAgrupadas.filter(
      (recaudacion) => recaudacion.abono > 0
    );
    console.log("rp: Cancelados ", recaudacionesReporte);
  } else if (tipo == "sinCancelar") {
    recaudacionesReporte = [];
    recaudacionesReporte = recaudacionesAgrupadas.filter(
      (recaudacion) => recaudacion.abono <= 0
    );
    console.log("rp Sin cancelar: ", recaudacionesReporte);
  } else if (tipo == "filtrado") {
    recaudacionesReporte = [];
    await filtrarCancelados();
    recaudacionesReporte = recaudacionesFiltradas;
    let fechaFiltro = diasPagos.value;
    let tipoEnviar = "Por dias";
    if (filtrarMes.checked) {
      fechaFiltro =
        obtenerNombreMes(mesPagos.value) +
        " (" +
        obtenerAnio(mesPagos.value) +
        ")";
      tipoEnviar = "Por mes";
    }
    encabezado.fechaFiltro = fechaFiltro;
    encabezado.tipoReporte = tipoEnviar;
    console.log("rp Filtros ", recaudacionesReporte);
  } else {
    recaudacionesReporte = [];
    recaudacionesReporte = recaudacionesAgrupadas;
    console.log("rp general: ", recaudacionesReporte);
  }
  await ipcRenderer.send(
    "datos-a-pagina3",
    datos,
    encabezado,
    recaudacionesReporte,
    datosTotales
  );
}
function mostrarSeccion(id) {
  const seccion1 = document.getElementById("seccion1");
  const seccion2 = document.getElementById("seccion2");

  if (id === "seccion1") {
    seccion1.classList.add("active");
    seccion2.classList.remove("active");
  } else {
    seccion1.classList.remove("active");
    seccion2.classList.add("active");
  }
}
async function cargarDescuentosList() {
  const descuentosDisponibles = await ipcRenderer.invoke("getDescuentos");
  descuentoDg.innerHTML = "";
  descuentosDisponibles.forEach((descuentoDisponible) => {
    const option = document.createElement("option");
    option.textContent =
      descuentoDisponible.descripcion + " (" + descuentoDisponible.valor + "%)";
    option.value = descuentoDisponible.id;
    option.setAttribute("value-descuento", [descuentoDisponible.valor]);
    descuentoDg.appendChild(option);
  });
}
async function cargarsSectores() {
  const sectores = await ipcRenderer.invoke("getSectores");
  console.log("Sectores:", sectores);
  sectoresBusqueda.innerHTML = "";
  if (sectores.length > 0) {
    sectoresBusqueda.innerHTML = '<option value="all" selected>Todos</option>';
    sectores.forEach((sector) => {
      const option = document.createElement("option");
      option.value = sector.codigo + "" + sector.abreviatura;
      option.textContent = sector.barrio;
      sectoresBusqueda.appendChild(option);
    });
  } else {
    sectoresBusqueda.innerHTML = '<option value="all" selected>Todos</option>';
  }
}
const servicioOpcionesdg = async (usuario, servicio) => {
  // Cargamos la lista de descuentos;
  await cargarDescuentosList();
  errortextAbono.textContent = "Error";
  errContainer.style.display = "none";
  abonarDg.readOnly = true;

  let subtotal = 0;
  let total = 0;
  let porcentaje = 0;
  let descuento = 0;
  let aplazable = "No aplazable";
  let cancelados = 0;
  let pendientes = 0;
  let valorCancelado = 0;
  let valorPago = 0;
  let valorSaldo = 0;
  let numeroPagosDf = 1;
  let descuentoDf = 1;
  let editableSn = false;
  // Datos del servicio independientes
  if (servicioDg.aplazableSn === "Si") {
    aplazable = "Aplazable";
  }
  servicioDg.textContent = servicio.nombre;
  descripcionDg.textContent = servicio.descripcion;
  detallesDg.textContent = servicio.tipo + " | " + aplazable;
  servicioValorDg.textContent = "Valor: $" + servicio.valor;
  if (servicio.valoresDistintosSn == "Si") {
    console.log("Valores distintos: " + servicio.valoresDistintosSn);
    subtotalText.textContent = "Subtotal(Individual)";
    editableSn = true;
  } else {
    subtotalText.textContent = "Subtotal(General)";
    editableSn = false;
  }
  // Verifico si el servicio ha sido contratado
  console.log("Contratado?: " + servicio.id, usuario.contratosId);
  const servicioContratado = await ipcRenderer.invoke(
    "getContratadoByServicioContrato",
    servicio.id,
    usuario.contratosId
  );
  if (servicioContratado[0] !== undefined) {
    console.log("El servicio ha sido contratado: " + servicioContratado[0]);
    // Si el servicio ya ha sido contratado
    if (servicioContratado[0].valorIndividual !== null) {
      subtotal = servicioContratado[0].valorIndividual;
    }
    subtotalDg.value = subtotal;
    if (servicioContratado[0].descuentosId !== null) {
      descuentoDf = servicioContratado[0].descuentosId;
    }
    descuentoDg.value = descuentoDf;
    if (servicioContratado[0].valorDescuento !== null) {
      descuento = servicioContratado[0].descuentoValor;
    }
    // el valor del descuento es el que ya esta guardado.
    descuentoValDg.value = descuento;
    if (servicioContratado[0].numeroPagosIndividual !== null) {
      numeroPagosDf = servicioContratado[0].numeroPagosIndividual;
    }
    numPagosDg.value = numeroPagosDf;
    if (servicioContratado[0].valorPagosIndividual !== null) {
      valorPago = servicioContratado[0].valorPagosIndividual;
    }
    // el valor de los pagos es el que ya esta guardado.
    valPagosDg.value = valorPago;
    total = subtotal - descuento;
    totalDg.value = total;
    // Si esta contratado pero, esta cancelado ?
    const servicioDetalles = await ipcRenderer.invoke(
      "getDetallesByContratadoId",
      servicioContratado[0].serviciosContratadosId
    );

    if (servicioDetalles.length > 0) {
      console.log("Existe el detalle de servicios: ", servicioDetalles);
      servicioDetalles.forEach((servicioDetalle) => {
        console.log("Detalles: " + servicioDetalle.estado);
        if (servicioDetalle.estado === "Cancelado") {
          cancelados++;
          valorCancelado += servicioDetalle.abono;
        }
        if (cancelados > 0) {
          console.log("Cancelasdos > 0");
          editableSn = false;
          descuentoDg.disabled = true;
        }
      });

      contratarDg.textContent = "Descontratar";
      contratarDg.onclick = async function () {
        await desContratarServicio(
          servicioContratado[0].serviciosContratadosId,
          usuario,
          servicio
        );
      };
    }
    contratarDg.textContent = "Descontratar";
    contratarDg.onclick = async function () {
      await desContratarServicio(
        servicioContratado[0].serviciosContratadosId,
        usuario,
        servicio
      );
    };

    canceladosDg.textContent = cancelados;
    pendientesDg.textContent = numeroPagosDf - cancelados;
    abonadoDg.textContent = valorCancelado;
    saldoDg.textContent = total - valorCancelado;
    guardarDg.style.display = "block";
    guardarDg.disabled = false;

    guardarDg.onclick = async function () {
      const newServicioContratado = {
        // fechaEmision: formatearFecha(new Date()), Mantenemos fechaEmision
        id: servicioContratado[0].serviciosContratadosId,
        estado: "Sin aplicar",
        valorIndividual: subtotal,
        numeroPagosIndividual: numPagosDg.value,
        valorPagosIndividual: valPagosDg.value,
        descuentoValor: descuento,
        descuentosId: descuentoDg.value,
        serviciosId: servicio.id,
        contratosId: usuario.contratosId,
      };
      await actualizarServicioContratado(
        newServicioContratado,
        usuario,
        servicio
      );
    };
  } else {
    // En caso de que el servicio no este contratado cargamos los valores
    // por defecto del servicio.
    guardarDg.style.display = "none";
    guardarDg.disabled = true;
    if (servicio.valor !== null) {
      subtotal = servicio.valor;
    }
    subtotalDg.value = subtotal;
    descuentoDg.value = descuentoDf;
    descuentoDg.disabled = false;
    descuentoValDg.value = descuento;
    //----------------------------------------------------------------
    // funcion del select descuentos
    descuentoDg.onchange = () => {
      const descuentoSeleccionado =
        descuentoDg.options[descuentoDg.selectedIndex];
      const valorSeleccionado =
        descuentoSeleccionado.getAttribute("value-descuento");
      console.log("Atributo seleccionado:", valorSeleccionado);
      porcentaje = parseInt(valorSeleccionado) / 100;
      console.log("Porcentaje: " + subtotal, porcentaje);
      descuento = subtotal * porcentaje;
      descuentoValDg.value = parseFloat(descuento).toFixed(2);
      // total = servicio.valor - descuento;
      total = subtotal - descuento;
      totalDg.value = parseFloat(total).toFixed(2);
      //Incluimos la programacion del select numPagos
      if (total !== 0) {
        numPagosDg.disabled = false;
        const valorPagoSeleccionado =
          numPagosDg.options[numPagosDg.selectedIndex].value;
        console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
        valorPago = total / valorPagoSeleccionado;
      } else {
        numPagosDg.value = 1;
        numPagosDg.disabled = true;
        const valorPagoSeleccionado =
          numPagosDg.options[numPagosDg.selectedIndex].value;
        console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
        valorPago = total / valorPagoSeleccionado;
      }
      valPagosDg.value = parseFloat(valorPago).toFixed(2);
    };
    const descuentoSeleccionado =
      descuentoDg.options[descuentoDg.selectedIndex];
    const valorSeleccionado =
      descuentoSeleccionado.getAttribute("value-descuento");
    console.log("Atributo seleccionado:", valorSeleccionado);
    porcentaje = parseInt(valorSeleccionado) / 100;
    console.log("Porcentaje: " + subtotal, porcentaje);
    descuento = subtotal * porcentaje;
    descuentoValDg.value = parseFloat(descuento).toFixed(2);
    total = servicio.valor - descuento;
    totalDg.value = parseFloat(total).toFixed(2);
    // totalDg.value = subtotal - descuento;

    //----------------------------------------------------------------

    if (servicio.numeroPagos !== null) {
      numeroPagosDf = servicio.numeroPagos;
    }
    //----------------------------------------------------------------
    // funcion del select numero de pagos
    numPagosDg.value = numeroPagosDf;
    const valorPagoSeleccionado =
      numPagosDg.options[numPagosDg.selectedIndex].value;
    console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
    valorPago = total / valorPagoSeleccionado;
    valPagosDg.value = aproximarDosDecimales(valorPago);

    // if (servicio.valorPagos !== null) {
    //   valorPago = servicio.valorPagos;
    // }
    // valPagosDg.value = valorPago;
    //----------------------------------------------------------------

    canceladosDg.textContent = "No contratado";
    pendientesDg.textContent = "No contratado";
    saldoDg.textContent = "No contratado";
    abonadoDg.textContent = "No contratado";
    contratarDg.textContent = "Contratar";
    contratarDg.onclick = async function () {
      const newServicioContratado = {
        fechaEmision: formatearFecha(new Date()),
        estado: "Sin aplicar",
        valorIndividual: subtotal,
        numeroPagosIndividual: numPagosDg.value,
        valorPagosIndividual: valorPago,
        descuentoValor: descuento,
        descuentosId: descuentoDg.value,
        serviciosId: servicio.id,
        contratosId: usuario.contratosId,
      };
      await contratarServicio(newServicioContratado, usuario, servicio);
    };
    if (servicio.valoresDistintosSn == "Si") {
      console.log("Valores distintos: " + servicio.valoresDistintosSn);
      subtotalText.textContent = "Subtotal(Individual)";
      editableSn = true;
    } else {
      subtotalText.textContent = "Subtotal(General)";
      editableSn = false;
    }
  }
  // Si el servicio tiene valores distintos.
  if (!editableSn) {
    subtotalDg.readOnly = true;
    // descuentoDg.disabled = true;
    numPagosDg.disabled = true;
  } else {
    console.log("Editable");
    subtotalDg.readOnly = false;
    // descuentoDg.disabled = false;
    numPagosDg.disabled = false;

    subtotalDg.oninput = () => {
      if (subtotalDg.value !== "") {
        subtotal = subtotalDg.value;
        const descuentoSeleccionado =
          descuentoDg.options[descuentoDg.selectedIndex];
        const valorSeleccionado =
          descuentoSeleccionado.getAttribute("value-descuento");
        console.log("Atributo seleccionado:", valorSeleccionado);
        porcentaje = parseInt(valorSeleccionado) / 100;
        console.log("Porcentaje: " + subtotal, porcentaje);
        descuento = subtotal * porcentaje;
        descuentoValDg.value = parseFloat(descuento).toFixed(2);
        // total = servicio.valor - descuento;
        total = subtotal - descuento;
        totalDg.value = parseFloat(total).toFixed(2);
        //Incluimos la programacion del select numPagos
        if (total !== 0) {
          const valorPagoSeleccionado =
            numPagosDg.options[numPagosDg.selectedIndex].value;
          console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
          valorPago = total / valorPagoSeleccionado;
        } else {
          numPagosDg.value = 1;
          const valorPagoSeleccionado =
            numPagosDg.options[numPagosDg.selectedIndex].value;
          console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
          valorPago = total / valorPagoSeleccionado;
        }
        valPagosDg.value = aproximarDosDecimales(valorPago);
      } else {
        subtotal = servicio.valor;
        const descuentoSeleccionado =
          descuentoDg.options[descuentoDg.selectedIndex];
        const valorSeleccionado =
          descuentoSeleccionado.getAttribute("value-descuento");
        console.log("Atributo seleccionado:", valorSeleccionado);
        porcentaje = parseInt(valorSeleccionado) / 100;
        console.log("Porcentaje: " + subtotal, porcentaje);
        descuento = subtotal * porcentaje;
        descuentoValDg.value = parseFloat(descuento).toFixed(2);
        // total = servicio.valor - descuento;
        total = subtotal - descuento;
        totalDg.value = parseFloat(total).toFixed(2);
        //Incluimos la programacion del select numPagos
        if (total !== 0) {
          numPagosDg.disabled = false;
          const valorPagoSeleccionado =
            numPagosDg.options[numPagosDg.selectedIndex].value;
          console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
          valorPago = total / valorPagoSeleccionado;
        } else {
          numPagosDg.value = 1;
          numPagosDg.disabled = true;

          const valorPagoSeleccionado =
            numPagosDg.options[numPagosDg.selectedIndex].value;
          console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
          valorPago = total / valorPagoSeleccionado;
        }
        valPagosDg.value = aproximarDosDecimales(valorPago);
      }
    };
    numPagosDg.onchange = () => {
      if (total !== 0) {
        const valorPagoSeleccionado =
          numPagosDg.options[numPagosDg.selectedIndex].value;
        console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
        valorPago = total / valorPagoSeleccionado;
      } else {
        numPagosDg.value = 1;
        const valorPagoSeleccionado =
          numPagosDg.options[numPagosDg.selectedIndex].value;
        console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
        valorPago = total / valorPagoSeleccionado;
      }
      valPagosDg.value = aproximarDosDecimales(valorPago);
    };
    //----------------------------------------------------------------
    // funcion del select descuentos
    descuentoDg.onchange = () => {
      const descuentoSeleccionado =
        descuentoDg.options[descuentoDg.selectedIndex];
      const valorSeleccionado =
        descuentoSeleccionado.getAttribute("value-descuento");
      console.log("Atributo seleccionado:", valorSeleccionado);
      porcentaje = parseInt(valorSeleccionado) / 100;
      console.log("Porcentaje: " + subtotal, porcentaje);
      descuento = subtotal * porcentaje;
      descuentoValDg.value = parseFloat(descuento).toFixed(2);
      // total = servicio.valor - descuento;
      total = subtotal - descuento;
      totalDg.value = parseFloat(total).toFixed(2);
      //Incluimos la programacion del select numPagos
      if (total !== 0) {
        numPagosDg.disabled = false;
        const valorPagoSeleccionado =
          numPagosDg.options[numPagosDg.selectedIndex].value;
        console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
        valorPago = total / valorPagoSeleccionado;
      } else {
        numPagosDg.value = 1;
        numPagosDg.disabled = true;
        const valorPagoSeleccionado =
          numPagosDg.options[numPagosDg.selectedIndex].value;
        console.log("Valor pagos seleccionado:", valorPagoSeleccionado);
        valorPago = total / valorPagoSeleccionado;
      }
      valPagosDg.value = aproximarDosDecimales(valorPago);
    };
  }
  if (servicio.aplazableSn == "Si") {
    numPagosDg.disabled = false;
  } else {
    numPagosDg.disabled = true;
  }
  // ----------------------------------------------------------------
  // Borramos Código :|
  // Borramos Codigo :|

  if (dialogOpciones.close) {
    dialogOpciones.showModal();
  }
};
const actualizarServicioContratado = async (
  detalleActualizar,
  usuario,
  servicio
) => {
  CerrarFormOpciones();
  Swal.fire({
    title: "No disponible",
    text: "Esta acción no esta disponible aún",
    icon: "info",
    iconColor: "green",
    showConfirmButton: true,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "green",
  });
  // Swal.fire({
  //   title: " ¿Quieres guardar los cambios?" + detalleActualizar.id,
  //   text: "El servicio y sus valores se actualizarán, si este aún no ha sido cancelado",
  //   icon: "question",
  //   iconColor: "#f8c471",
  //   showCancelButton: true,
  //   confirmButtonColor: "#2874A6",
  //   cancelButtonColor: "#EC7063 ",
  //   confirmButtonText: "Sí, continuar",
  //   cancelButtonText: "Cancelar",
  //   customClass: "question-contratar",
  // }).then(async (result) => {
  //   if (result.isConfirmed) {
  //     // Aquí puedes realizar la acción que desees cuando el usuario confirme.
  //     const contratado = await ipcRenderer.invoke(
  //       "updateContratadoDetalle",
  //       detalleActualizar
  //     );
  //     console.log("Resultado de contratar el servicio: " + contratado);

  //     if (contratado !== undefined) {
  //       console.log("Pasamos a crear Planilla o comprobante");
  //       // Llamamos a  create planilla asi nos aseguramos de que en caso de no existir la planilla
  //       // correspondiente a ese mes se la cree asi como tambien nos aseguramos de que el detalle
  //       // no se aplique dos veces. Los detalles se aplicaran en las planillas vigentes de acuerdo
  //       // al mes correspondiente.
  //       // const result = await ipcRenderer.invoke(
  //       //   "createPlanilla",
  //       //   fechaCreacion
  //       // );
  //       // const resultComprobante = await ipcRenderer.invoke("createComprobante");
  //       // console.log(result);

  //       // console.log(resultComprobante);
  //       mostrarEstadisticas(servicio.id);
  //       // servicioOpcionesdg(usuario, servicio);
  //     }
  //     // mostrarEstadisticas(servicio.id);
  //     // servicioOpcionesdg(usuario, servicio);
  //   } else {
  //     // servicioOpcionesdg(usuario, servicio);
  //   }
  // });
};
const desContratarServicio = async (detalleDescontratar, usuario, servicio) => {
  CerrarFormOpciones();
  Swal.fire({
    title: "¿Quieres eliminar este servicio para este contrato?",
    text: "El valor del servicio se restara, si este aún no ha sido cancelado",
    icon: "question",
    iconColor: "#f8c471",
    showCancelButton: true,
    confirmButtonColor: "#2874A6",
    cancelButtonColor: "#EC7063 ",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    customClass: "question-contratar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Aquí puedes realizar la acción que desees cuando el usuario confirme.
      const contratado = await ipcRenderer.invoke(
        "deleteContratadoDetalle",
        detalleDescontratar
      );
      console.log("Resultado de contratar el servicio: " + contratado);
      mostrarEstadisticas(servicio.id);
      // servicioOpcionesdg(usuario, servicio);
    } else {
      servicioOpcionesdg(usuario, servicio);
    }
  });
};
function obtenerNombreMes(fecha) {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const fechaDate = new Date(fecha);
  // Obtener el nombre del mes
  const numeroMes = fechaDate.getMonth();
  return meses[numeroMes];
}
function obtenerDia(fecha) {
  const fechaDate = new Date(fecha);

  // Obtener el nombre del mes
  const dia = fechaDate.getDate() + 1;

  return dia;
}
function obtenerAnio(fecha) {
  const fechaDate = new Date(fecha);
  // Obtener el nombre del mes
  const anio = fechaDate.getFullYear();
  return anio;
}
diasPagos.addEventListener("change", () => {
  filtrarRecaudados();
});
mesPagos.addEventListener("change", () => {
  filtrarRecaudados();
});
filtrarMes.addEventListener("change", () => {
  if (filtrarMes.checked) {
    mesPagos.style.display = "block";
    diasPagos.style.display = "none";
    filtrarRecaudados();
  } else {
    mesPagos.style.display = "none";
    diasPagos.style.display = "block";
    filtrarRecaudados();
  }
});
filtroCancelados.addEventListener("change", async () => {
  preRenderRecaudados();
});
async function preRenderRecaudados() {
  if (filtroCancelados.checked) {
    let recaudaciones = [];
    recaudaciones = await filtrarCancelados();
    renderRecaudados(recaudaciones);
  } else {
    renderRecaudados(recaudacionesAgrupadas);
  }
}
const filtrarCancelados = () => {
  recaudacionesFiltradas = [];
  if (recaudacionesAgrupadas.length > 0) {
    if (filtrarMes.checked) {
      fechaFiltro = mesPagos.value;
      if (fechaFiltro !== "Sin fecha") {
        recaudacionesAgrupadas.forEach(async (recaudacion) => {
          let recaudadoFiltrado = 0;
          let newRecaudacion = {
            contratadosId: recaudacion.contratadosId,
            codigo: recaudacion.codigo,
            nombres: recaudacion.nombres,
            apellidos: recaudacion.apellidos,
            total: recaudacion.total,
            abono: recaudacion.abono,
          };
          let objetos = [];
          objetos = await recaudacion.objetos.filter((objeto) => {
            if (objeto.fechaPago !== null && objeto.fechaPago !== undefined) {
              let fechaObjeto = formatearFecha(objeto.fechaPago);
              if (
                obtenerNombreMes(fechaObjeto) ===
                  obtenerNombreMes(fechaFiltro) &&
                obtenerAnio(fechaObjeto) === obtenerAnio(fechaFiltro)
              ) {
                recaudadoFiltrado += objeto.abono;
                return objeto;
              }
            }
          });
          if (objetos.length > 0) {
            newRecaudacion.objetos = objetos;
            newRecaudacion.abonoFiltrado = recaudadoFiltrado;
            recaudacionesFiltradas.push(newRecaudacion);
          }
        });
        return recaudacionesFiltradas;
      }
    } else {
      let fechaFiltro = diasPagos.value;
      if (fechaFiltro !== "Sin fecha") {
        recaudacionesAgrupadas.forEach(async (recaudacion) => {
          let recaudadoFiltrado = 0;
          let newRecaudacion = {
            contratadosId: recaudacion.contratadosId,
            codigo: recaudacion.codigo,

            nombres: recaudacion.nombres,
            apellidos: recaudacion.apellidos,
            total: recaudacion.total,
            abono: recaudacion.abono,
          };
          let objetos = [];
          objetos = await recaudacion.objetos.filter((objeto) => {
            if (formatearFecha(objeto.fechaPago) === fechaFiltro) {
              recaudadoFiltrado += objeto.abono;
              return objeto;
            }
          });
          newRecaudacion.objetos = objetos;
          if (objetos.length > 0) {
            newRecaudacion.abonoFiltrado = recaudadoFiltrado;
            recaudacionesFiltradas.push(newRecaudacion);
          }
        });
        return recaudacionesFiltradas;
      }
    }
  }
};
// Función de comparación para el método sort
function compararFechas(objetoA, objetoB) {
  // Obtén las fechas de los objetos y compáralas
  var fechaA = objetoA.fechaPago;
  var fechaB = objetoB.fechaPago;

  // Ordena las fechas en orden descendente (de mayor a menor)
  if (fechaA < fechaB) {
    return 1;
  } else if (fechaA > fechaB) {
    return -1;
  } else {
    return 0;
  }
}

async function cargarFechasPago(fechasPago) {
  if (fechasPago.length > 0) {
    await fechasPago.sort(compararFechas);
    let meses = [];
    diasPagos.innerHTML = "";
    mesPagos.innerHTML = "";

    fechasPago.forEach((fechaPago) => {
      const option = document.createElement("option");
      option.value = fechaPago.fechaPago;
      option.textContent =
        obtenerDia(fechaPago.fechaPago) +
        " de " +
        obtenerNombreMes(fechaPago.fechaPago) +
        " (" +
        obtenerAnio(fechaPago.fechaPago) +
        ")";
      diasPagos.appendChild(option);
    });
    diasPagos[0].selected = true;
    ultimaFechaPago = diasPagos.value;

    meses = await agruparMesesPago(fechasPago);
    meses.forEach((mes) => {
      const optionMeses = document.createElement("option");
      optionMeses.value = mes.fechaPago;
      optionMeses.textContent =
        obtenerNombreMes(mes.fechaPago) +
        " (" +
        obtenerAnio(mes.fechaPago) +
        ")";
      mesPagos.appendChild(optionMeses);
    });
    mesPagos[0].selected = true;
  }
}
function filtrarRecaudados() {
  if (recaudacionesAgrupadas.length > 0) {
    let fechaFiltro = "";
    let totalRecaudadoFiltrado = 0;
    if (filtrarMes.checked) {
      fechaFiltro = mesPagos.value;
      if (fechaFiltro !== "Sin fecha") {
        recaudacionesAgrupadas.forEach((recaudacion) => {
          recaudacion.objetos.forEach((objeto) => {
            if (objeto.fechaPago !== null && objeto.fechaPago !== undefined) {
              let fechaObjeto = formatearFecha(objeto.fechaPago);
              if (
                objeto.estadoDetalles === "Cancelado" &&
                obtenerNombreMes(fechaObjeto) ===
                  obtenerNombreMes(fechaFiltro) &&
                obtenerAnio(fechaObjeto) === obtenerAnio(fechaFiltro)
              ) {
                totalRecaudadoFiltrado += objeto.abono;
              }
            }
          });
        });
      }
    } else {
      fechaFiltro = diasPagos.value;
      if (fechaFiltro !== "Sin fecha") {
        recaudacionesAgrupadas.forEach((recaudacion) => {
          recaudacion.objetos.forEach((objeto) => {
            if (objeto.fechaPago !== null && objeto.fechaPago !== undefined) {
              let fechaObjeto = formatearFecha(objeto.fechaPago);
              if (
                objeto.estadoDetalles === "Cancelado" &&
                fechaObjeto === fechaFiltro
              ) {
                totalRecaudadoFiltrado += objeto.abono;
              }
            }
          });
        });
      }
    }
    valorFiltrado = totalRecaudadoFiltrado;
    recaudadoFiltrado.textContent = valorFiltrado.toFixed(2);
  }
  preRenderRecaudados();
}
function cargarMesActual() {
  mesBusqueda.innerHTML = '<option value="all" selected>Todo mes</option>';
  // Obtén el mes actual (0-indexed, enero es 0, diciembre es 11)
  const mesActual = new Date().getMonth();
  // Array de nombres de meses
  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  // Llena el select con las opciones de los meses
  for (let i = 0; i < nombresMeses.length; i++) {
    const option = document.createElement("option");
    option.value = i + 1; // El valor es el índice del mes
    option.textContent = nombresMeses[i];
    if (i === mesActual) {
      console.log("seleccionando: " + mesActual);
      // option.selected = true;
    }

    mesBusqueda.appendChild(option);
  }

  // Establece el mes actual como seleccionado
  // mesBusqueda.value = mesActual;
}
function cargarAnioBusquedas() {
  anioBusqueda.innerHTML = '<option value="all" selected>Todo año</option>';
  // Obtener el año actual
  var anioActual = new Date().getFullYear();
  // Crear opciones de años desde el año actual hacia atrás
  for (var i = anioActual; i >= 2020; i--) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    if (i === anioActual) {
      // option.selected = true;
    }
    anioBusqueda.appendChild(option);
  }
}
const contratarServicioTodos = async (servicioContratar, usuario, servicio) => {
  const contratado = await ipcRenderer.invoke(
    "createServicioContratadoMultiple",
    servicioContratar,
    usuario.sociosId,
    servicio.IndividualSn
  );
  console.log("Resultado de contratar el servicio: " + contratado);
};
const contratarServicio = async (servicioContratar, usuario, servicio) => {
  CerrarFormOpciones();
  Swal.fire({
    title: "¿Quieres aplicar este servicio a este contrato?",
    text: "El valor del servicio se aplicara en la planilla vigente.",
    icon: "question",
    iconColor: "#f8c471",
    showCancelButton: true,
    confirmButtonColor: "#2874A6",
    cancelButtonColor: "#EC7063 ",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      dialogOpciones.style.width = "fit-content";
      dialogOpciones.style.height = "fit-content";
      // Aquí puedes realizar la acción que desees cuando el usuario confirme.
      const contratado = await ipcRenderer.invoke(
        "createServicioContratado",
        servicioContratar,
        usuario.sociosId,
        servicio.IndividualSn
      );
      console.log("Resultado de contratar el servicio: " + contratado);

      if (contratado !== undefined) {
        console.log("Pasamos a crear Planilla o comprobante");
        // Llamamos a  create planilla asi nos aseguramos de que en caso de no existir la planilla
        // correspondiente a ese mes se la cree asi como tambien nos aseguramos de que el detalle
        // no se aplique dos veces. Los detalles se aplicaran en las planillas vigentes de acuerdo
        // al mes correspondiente.
        const result = await ipcRenderer.invoke(
          "createPlanilla",
          fechaCreacion
        );
        // const resultComprobante = await ipcRenderer.invoke("createComprobante");
        console.log(result);

        // console.log(resultComprobante);
        mostrarEstadisticas(servicio.id);
        // servicioOpcionesdg(usuario, servicio);
      }
      mostrarEstadisticas(servicio.id);
    } else {
      servicioOpcionesdg(usuario, servicio);
    }
  });
};
cancelarForm.onclick = () => {
  resetForm();
};
const agruparServicios = async (datosServiciosGeneral) => {
  console.log("Grupos sin suma:", datosServiciosGeneral);

  let datosServiciosAgrupados = await datosServiciosGeneral.reduce(
    (acumulador, objeto) => {
      // Verificar si ya hay un grupo con el mismo nombre
      let grupoExistente = acumulador.find(
        (contratadosId) => contratadosId.contratadosId === objeto.contratadosId
      );
      // Si el grupo existe, agregar el valor al grupo
      if (grupoExistente) {
        if (objeto.estadoDetalles === "Cancelado") {
          grupoExistente.abono += objeto.abono;
        }
        // El saldo lo obtenemos restando abonos - total
        // grupoExistente.saldo += objeto.saldo;
        grupoExistente.objetos.push(objeto);
      } else {
        let abono = 0;
        if (objeto.estadoDetalles === "Cancelado") {
          abono = objeto.abono;
        }
        // Si el grupo no existe, crear uno nuevo con el valor
        acumulador.push({
          contratadosId: objeto.contratadosId,
          codigo: objeto.codigo,
          nombres: objeto.nombres,
          apellidos: objeto.apellidos,
          abono: abono,
          // saldo: objeto.saldo,
          total: objeto.valorIndividual,
          objetos: [objeto],
        });
      }

      return acumulador;
    },
    []
  );
  return datosServiciosAgrupados;
};
const agruparMesesPago = async (fechasGeneral) => {
  console.log("Grupos sin suma:", fechasGeneral);

  let fechasAgrupadas = await fechasGeneral.reduce((acumulador, objeto) => {
    // Verificar si ya hay un grupo con el mismo nombre
    let grupoExistente = acumulador.find(
      (fechaPago) =>
        obtenerNombreMes(fechaPago.fechaPago) ===
        obtenerNombreMes(objeto.fechaPago)
    );
    // Si el grupo existe, agregar el valor al grupo
    if (grupoExistente) {
    } else {
      // Si el grupo no existe, crear uno nuevo con el valor
      acumulador.push({
        fechaPago: objeto.fechaPago,
      });
    }

    return acumulador;
  }, []);
  return fechasAgrupadas;
};
const agruparFechasPago = async (fechasGeneral) => {
  console.log("Grupos sin suma:", fechasGeneral);

  let fechasAgrupadas = await fechasGeneral.reduce((acumulador, objeto) => {
    // Verificar si ya hay un grupo con el mismo nombre
    let grupoExistente = acumulador.find(
      (fechaPago) => fechaPago.fechaPago === objeto.fechaPago
    );
    // Si el grupo existe, agregar el valor al grupo
    if (grupoExistente) {
    } else {
      // Si el grupo no existe, crear uno nuevo con el valor
      acumulador.push({
        fechaPago: objeto.fechaPago,
      });
    }

    return acumulador;
  }, []);
  return fechasAgrupadas;
};

function mostrarFormOpciones() {
  console.log("MostrarFormOpciones");
  if (dialogOpciones.close) {
    dialogOpciones.showModal();
  }
}
function CerrarFormOpciones() {
  dialogOpciones.close();
}
function aproximarDosDecimales(numero) {
  // Redondea el número hacia arriba
  const numeroRedondeado = Math.ceil(numero * 100) / 100;
  return numeroRedondeado.toFixed(2);
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
