// ----------------------------------------------------------------
// Librerias
// ----------------------------------------------------------------
const { ipcRenderer } = require("electron");
const validator = require("validator");
const Swal = require("sweetalert2");
// ----------------------------------------------------------------
const servicioCreacion = document.getElementById("fechaCreacion");
const servicioNombre = document.getElementById("nombre");
const servicioDescripcion = document.getElementById("descripcion");
// const servicioTipo = document.getElementById("tipo");
const servicioValor = document.getElementById("valor");
const serviciosList = document.getElementById("servicios");
const usuariosList = document.getElementById("usuarios");
const buscarServicios = document.getElementById("buscarServicios");
const criterio = document.getElementById("criterio");
const criterioContent = document.getElementById("criterio-content");
// ----------------------------------------------------------------
const buscarBeneficiarios = document.getElementById("buscarBeneficiarios");
const criterioBn = document.getElementById("criterio-bn");
const criterioContentBn = document.getElementById("criterio-bn-content");
const sectoresBusqueda = document.getElementById("sectores");
const servicioTit = document.getElementById("servicio-tit");
const servicioDesc = document.getElementById("servicio-desc");
const servicioDet = document.getElementById("servicio-det");
const servicioVal = document.getElementById("servicio-val");
const servicioCreaciondet = document.getElementById("fechaCreacion-det");
const individualSn = document.getElementById("individualSn");
const btnVolver = document.getElementById("btn-volver");
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
// Elementos del formulario.
// ----------------------------------------------------------------
const reporteBeneficiarios = document.getElementById("reporte_beneficiarios");
const filtrarMes = document.getElementById("filtrar-mes");
const diasPagos = document.getElementById("dias-pagos");
const mesPagos = document.getElementById("mes-pagos");
const mesEmision = document.getElementById("mes-emision");
const recaudadoFiltrado = document.getElementById("valor-recaudado-filtrado");
const recaudadoFiltradoCargo = document.getElementById("valor-recaudado-cargo");
const pendienteFiltrado = document.getElementById("valor-pendiente-cargo");
const totalesFiltrado = document.getElementById("valor-total-cargo");
const filtroCancelados = document.getElementById("filtrar-cancelados");
const mesBusqueda = document.getElementById("mesBusqueda");
const anioBusqueda = document.getElementById("anioBusqueda");
let recaudaciones = [];
let recaudacionesAgrupadas = [];
let recaudacionesFiltradas = [];
let valorFiltrado = 0;
let servicios = [];
let usuarios = [];
let contratados = [];
let editingStatus = false;
let creacionEdit = "";
let editServicioId = "";
let contratandoId = "";
let ultimaFechaPago = "";
let fechaCreacion = "2024-09-01 00:00:00";
servicioForm.addEventListener("submit", async (e) => {
  let individualSnDf = "Si";
  e.preventDefault();
  // var estadoParametro = "Innactivo";
  // if (parametroEstado.checked) {
  //   estadoParametro = "Activo";
  // }
  if (validator.isEmpty(servicioCreacion.value)) {
    mensajeError.textContent = "Ingresa una fecha de creación válida.";
    servicioCreacion.focus();
  } else if (validator.isEmpty(servicioNombre.value)) {
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
    if (individualSn.value !== null) {
      individualSnDf = individualSn.value;
    }
    const newServicio = {
      fechaCreacion: servicioCreacion.value,
      nombre: servicioNombre.value,
      descripcion: servicioDescripcion.value,
      tipo: "Servicio fijo",
      valor: servicioValor.value,
      aplazableSn: "No",
      numeroPagos: 1,
      valorPagos: servicioValor.value,
      individualSn: individualSnDf,
      valoresDistintosSn: "No",
    };
    if (!editingStatus) {
      const result = await ipcRenderer.invoke(
        "createServiciosFijos",
        newServicio
      );
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
          const result = await ipcRenderer.invoke(
            "updateServiciosFijos",
            editServicioId,
            newServicio
          );
        }
      });
    }
  }
});
function renderServiciosFijos(serviciosFijos) {
  serviciosList.innerHTML = "";
  serviciosFijos.forEach((servicioFijo) => {
    const divContainer = document.createElement("div");
    divContainer.className = "col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-1";
    divContainer.style.height = "fit-content";
    divContainer.style.maxHeight = "fit-content";
    const divCol6 = document.createElement("div");
    divCol6.className = "clase col-6 card  card-servicios";
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
    h6CardTitle.textContent = servicioFijo.nombre;

    divContainerTitle.appendChild(h6CardTitle);

    const divContainerSocios = document.createElement("div");
    divContainerSocios.className =
      "row container-socios d-flex align-items-center";

    const pDescription = document.createElement("p");
    pDescription.textContent = servicioFijo.descripcion;

    divContainerSocios.appendChild(pDescription);

    const divContainerDetalles = document.createElement("div");
    divContainerDetalles.className = "row container-detalles";

    const detalles = [
      { label: "Valor:$", value: parseFloat(servicioFijo.valor).toFixed(2) },
      { label: "Tipo:", value: servicioFijo.tipo },
      { label: "Aplazable:", value: servicioFijo.aplazableSn },
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
      console.log("Estadisticas del servicio: " + servicioFijo.id);
      mostrarEstadisticas(servicioFijo.id);

      mostrarSeccion("seccion2");
    };
    divCol1.appendChild(btnEditServicio);
    btnEditServicio.onclick = () => {
      console.log("Editar ...");
      console.log("Detalles del servicio: " + servicioFijo.id);
      editServicio(servicioFijo.id);
    };
    divCol1.appendChild(btnDeleteServicio);
    divCol1.appendChild(btnEstadistics);
    // Se puede crear botones con un ciclo forEach pero, no son muy manejables
    // buttons.forEach((iconClass) => {
    //   const button = document.createElement("button");
    //   button.className =
    //     "btn-servicios-custom d-flex justify-content-center align-items-center";

    //   const icon = document.createElement("i");
    //   icon.className = `fa ${iconClass}`;

    //   button.appendChild(icon);
    //   divCol1.appendChild(button);
    // });

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

      console.log("Editar ...");
      console.log("Detalles del servicio: " + servicioFijo.id);
      editServicio(servicioFijo.id);
    };
    serviciosList.appendChild(divContainer);
  });
}
async function renderUsuarios(usuarios, servicioId) {
  let ct = [];
  const contratadosId = await ipcRenderer.invoke(
    "getContratadosById",
    servicioId
  );
  console.log("Contratados: " + contratadosId);
  contratadosId.forEach((contratadoId) => {
    ct.push(contratadoId.contratosId);
  });
  contratados = console.log("Contratados", contratados);
  // await getContratados(servicioId);
  usuariosList.innerHTML = "";
  usuarios.forEach(async (usuario) => {
    const divContainer = document.createElement("div");
    divContainer.className = "col-xl-6 col-lg-6 col-md-12 col-sm-12";
    const divCol4 = document.createElement("div");
    divCol4.className = "clase col-12 card my-1";
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
    pContrato.className = "text-white";
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
      console.log("div: " + usuario.socio);
    };
    usuariosList.appendChild(divContainer);
  });
}

const editServicio = async (id) => {
  const servicio = await ipcRenderer.invoke("getServiciosFijosById", id);
  servicioCreacion.value = formatearFecha(servicio.fechaCreacion);
  servicioNombre.value = servicio.nombre;
  servicioDescripcion.value = servicio.descripcion;
  console.log("Indivisual: ", servicio.IndividualSn);
  if (servicio.IndividualSn !== undefined) {
    individualSn.value = servicio.IndividualSn;
  }
  // if (parametro.estado == "Activo") {
  //   parametroEstado.checked=true;
  // } else {
  //   parametroEstado.checked = false;
  // }
  //servicioTipo.value = servicio.tipo;
  servicioValor.value = servicio.valor;
  editingStatus = true;
  editServicioId = servicio.id;
  console.log(servicio);
};
const deleteServicio = async (id) => {
  Swal.fire({
    title: "¿Quieres borrar el servicio " + socioNombre + " ?",
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
      console.log("id from parametros.js");
      const result = await ipcRenderer.invoke("deleteServiciosFijos", id);
      console.log("Resultado servicios.js", result);
    }
  });
};
// ----------------------------------------------------------------
// Funcion que muestra las estadisticas de un servicio
// ----------------------------------------------------------------
const mostrarEstadisticas = async (servicioId) => {
  // await getContratados(servicioId);
  contratandoId = servicioId;
  const servicio = await ipcRenderer.invoke(
    "getServiciosFijosById",
    servicioId
  );
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
  await getBeneficiarios(servicioId);
  await getRecaudaciones(servicioId);
};
// ----------------------------------------------------------------
// Funcion que muestra los estados de recaudacion de un servic.
// ----------------------------------------------------------------
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
      await contratarTodos();
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
      await contratarPrincipales(contratandoId, "Servicio fijo");
    }
  });
});
async function contratarPrincipales(servicioId, tipo) {
  const result = await ipcRenderer.invoke(
    "contratarEnPrincipalesFijos",
    servicioId,
    tipo
  );
  console.log("Resultado de contratar en contratos principales: " + result);
}
async function contratarTodos() {
  try {
    for (const usuario of usuarios) {
      await contratarServicioTodos(contratandoId, usuario.contratosId);
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
          mostrarEstadisticas(contratandoId);
        } else {
          mostrarEstadisticas(contratandoId);
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
    console.log("Error al contratar todos:", error);
  }
}
const contratarServicioTodos = async (servicioId, contratoId) => {
  let adquiridoSnTemporal = "Activo";
  let idDescuentoTemporal = 1;

  const resultServiciosContratados = await ipcRenderer.invoke(
    "createServicioFijoContratadoMultiple",
    servicioId,
    contratoId,

    idDescuentoTemporal,
    adquiridoSnTemporal
  );

  console.log(
    "Resultado de contratar el servicio: " + resultServiciosContratados
  );
};

const getRecaudaciones = async () => {
  let valoresRecaudados = 0.0;
  let valoresPendientes = 0.0;
  let valoresTotales = 0.0;
  let fechaDesde = "all";
  let fechaHasta = "all";
  let fechasPagoAgrupadas = [];
  let fechasEmisionAgrupadas = [];
  let fechasEmision = [];
  let fechasPagos = [];
  let anioD = parseInt(anioRecaudacion.value);
  let mesD = parseInt(mesRecaudacion.value);
  console.log("Mes a buscar: " + mesD);
  let anioH = parseInt(anioLimite.value);
  let mesH = mesRecaudacion.value;
  if (criterioSt.value === "periodo") {
    let diaD = obtenerPrimerYUltimoDiaDeMes(anioD, mesD);
    let diaH = obtenerPrimerYUltimoDiaDeMes(anioH, mesH);
    // fechaDesde = "'" + anioD + "-" + mesD + "-" + diaD + "'";
    // fechaHasta = "'" + anioH + "-" + mesH + "-" + diaH + "'";
    fechaDesde = formatearFecha(diaD.primerDia);
    fechaHasta = formatearFecha(diaH.ultimoDia);
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
      recaudacionesAgrupadas = await agruparServicios(recaudaciones);
      console.log("Recaudaciones: ", recaudacionesAgrupadas);

      recaudacionesList.innerHTML = "";
      recaudacionesAgrupadas.forEach(async (recaudacion) => {
        recaudacion.objetos.forEach((objeto) => {
          if (objeto.fechaPago !== null && objeto.fechaPago !== undefined) {
            fechasPagos.push({ fecha: formatearFecha(objeto.fechaPago) });
          }
          if (
            objeto.fechaEmision !== null &&
            objeto.fechaEmision !== undefined
          ) {
            fechasEmision.push({
              fecha: formatearFecha(objeto.fechaEmision),
            });
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
      console.log("Dias de emision: ", fechasEmision);
      fechasPagoAgrupadas = await agruparFechasPago(fechasPagos);
      fechasEmisionAgrupadas = await agruparFechasPago(fechasEmision);
      console.log("Dias de pago reducido: ", fechasPagoAgrupadas);
      console.log("Dias de emision reducido: ", fechasEmisionAgrupadas);

      await cargarFechasPago(fechasPagoAgrupadas);
      await cargarFechasEmision(fechasEmisionAgrupadas);
      filtrarRecaudados();
      filtrarRecaudadosCargos();
      preRenderRecaudados(recaudacionesAgrupadas);
    });
};
async function cargarFechasPago(fechasPago) {
  if (fechasPago.length > 0) {
    await fechasPago.sort(compararFechas);
    let meses = [];
    diasPagos.innerHTML = "";
    mesPagos.innerHTML = "";

    fechasPago.forEach((fechaPago) => {
      const option = document.createElement("option");
      option.value = fechaPago.fecha;
      option.textContent =
        obtenerDia(fechaPago.fecha) +
        " de " +
        obtenerNombreMes(fechaPago.fecha) +
        " (" +
        obtenerAnio(fechaPago.fecha) +
        ")";
      diasPagos.appendChild(option);
    });
    diasPagos[0].selected = true;
    ultimaFechaPago = diasPagos.value;

    meses = await agruparMesesPago(fechasPago);
    meses.forEach((mes) => {
      const optionMeses = document.createElement("option");
      optionMeses.value = mes.fecha;
      optionMeses.textContent =
        obtenerNombreMes(mes.fecha) + " (" + obtenerAnio(mes.fecha) + ")";
      mesPagos.appendChild(optionMeses);
    });
    mesPagos[0].selected = true;
  }
}
async function cargarFechasEmision(fechasEmision) {
  if (fechasEmision.length > 0) {
    await fechasEmision.sort(compararFechas);
    let meses = [];
    mesEmision.innerHTML = "";
    meses = await agruparMesesPago(fechasEmision);
    meses.forEach((mes) => {
      const optionMeses = document.createElement("option");
      optionMeses.value = mes.fecha + 2;
      optionMeses.textContent =
        obtenerNombreMes(mes.fecha + 1) + " (" + obtenerAnio(mes.fecha) + ")";
      mesEmision.appendChild(optionMeses);
    });
    mesEmision[0].selected = true;
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
                obtenerNombreMes(fechaObjeto) ===
                  obtenerNombreMes(fechaFiltro) &&
                obtenerAnio(fechaObjeto) === obtenerAnio(fechaFiltro)
              ) {
                if (objeto.estadoDetalles === "Cancelado") {
                  totalRecaudadoFiltrado += objeto.abono;
                }
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
              if (fechaObjeto === fechaFiltro) {
                if (objeto.estadoDetalles === "Cancelado") {
                  totalRecaudadoFiltrado += objeto.abono;
                }
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
function filtrarRecaudadosCargos() {
  if (recaudacionesAgrupadas.length > 0) {
    let fechaFiltro = "";
    let totalRecaudadoCargo = 0;
    let totalFiltrado = 0;
    let totalPendienteFiltrado = 0;
    fechaFiltro = mesEmision.value;
    if (fechaFiltro !== "Sin fecha") {
      recaudacionesAgrupadas.forEach((recaudacion) => {
        recaudacion.objetos.forEach((objeto) => {
          console.log(
            "Comparar: ",
            new Date(objeto.fechaEmision).getMonth() + 1,
            " | ",
            new Date(fechaFiltro).getMonth()
          );
          if (
            objeto.fechaEmision.getMonth() + 1 ===
              new Date(fechaFiltro).getMonth() &&
            objeto.fechaEmision.getFullYear() ===
              new Date(fechaFiltro).getFullYear()
          ) {
            totalFiltrado += objeto.total;
            if (objeto.estadoDetalles === "Cancelado") {
              totalRecaudadoCargo += objeto.abono;
            }
          }
        });
      });
    }
    totalPendienteFiltrado = totalFiltrado - totalRecaudadoCargo;
    recaudadoFiltradoCargo.textContent = totalRecaudadoCargo.toFixed(2);
    pendienteFiltrado.textContent = totalPendienteFiltrado.toFixed();
    totalesFiltrado.textContent = totalFiltrado.toFixed(2);
  }
  preRenderRecaudados();
}
async function preRenderRecaudados() {
  if (filtroCancelados.checked) {
    let recaudaciones = [];
    recaudaciones = await filtrarCancelados();
    renderRecaudados(recaudaciones);
  } else {
    renderRecaudados(recaudacionesAgrupadas);
  }
}
mesEmision.addEventListener("change", () => {
  filtrarRecaudadosCargos();
});
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
function compararFechas(objetoA, objetoB) {
  // Obtén las fechas de los objetos y compáralas
  var fechaA = objetoA.fecha;
  var fechaB = objetoB.fecha;

  // Ordena las fechas en orden descendente (de mayor a menor)
  if (fechaA < fechaB) {
    return 1;
  } else if (fechaA > fechaB) {
    return -1;
  } else {
    return 0;
  }
}
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
        grupoExistente.total += objeto.total;
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
          total: objeto.total,
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
        obtenerNombreMes(fechaPago.fecha) === obtenerNombreMes(objeto.fecha)
    );
    // Si el grupo existe, agregar el valor al grupo
    if (grupoExistente) {
    } else {
      // Si el grupo no existe, crear uno nuevo con el valor
      acumulador.push({
        fecha: objeto.fecha,
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
      (fecha) => fecha.fecha === objeto.fecha
    );
    // Si el grupo existe, agregar el valor al grupo
    if (grupoExistente) {
    } else {
      // Si el grupo no existe, crear uno nuevo con el valor
      acumulador.push({
        fecha: objeto.fecha,
      });
    }

    return acumulador;
  }, []);
  return fechasAgrupadas;
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
const getBeneficiarios = async (servicioId) => {
  let criterioBuscar = criterioBn.value;
  let criterioContentBuscar = criterioContentBn.value;
  let sectorBuscar = sectoresBusqueda.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  usuarios = await ipcRenderer.invoke(
    "getContratos",
    criterioBuscar,
    criterioContentBuscar,
    sectorBuscar
  );
  console.log("Beneficiarios: ", usuarios);
  renderUsuarios(usuarios, servicioId);
};
const getServicios = async (criterio, criterioContent) => {
  let mesEnviar = mesBusqueda.value;
  let anioEnviar = anioBusqueda.value;
  servicios = await ipcRenderer.invoke(
    "getServiciosFijos",
    criterio,
    criterioContent,
    mesEnviar,
    anioEnviar
  );
  console.log(servicios);
  renderServiciosFijos(servicios);
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
  await getBeneficiarios(editServicioId);
};
criterioSt.onchange = async () => {
  let criterioSeleccionado = criterioSt.value;
  console.log("Seleccionado: ", criterioSeleccionado);
  if (criterioSeleccionado === "all") {
    await getRecaudaciones();
  } else if (criterioSeleccionado === "actual") {
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
// const getContratados = async (servicioId) => {
//   // Buscamos los contratos que hayan contratado el servicio segun el id del servicio
//   // que se recibe!
//   const contratadosId = await ipcRenderer.invoke(
//     "getContratadosById",
//     servicioId
//   );
//   contratadosId.forEach((contratadoId) => {
//     contratados.push(contratadoId.id);
//   });
//   contratados = console.log("Contratados", contratados);
// };
async function init() {
  fechaCreacion.value = formatearFecha(new Date());
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
ipcRenderer.on("datos-a-servicios", async () => {
  const datos = await ipcRenderer.invoke("pido-datos");
  console.log("Estos: " + datos.id);
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
  } else if (response.title === "Usuario eliminado!") {
    resetFormAfterSave();
  }
  // else if (response.title === "Contratado para Todos!") {
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
  fechaCreacion.value = formatearFecha(new Date());
}
function resetForm() {
  editingStatus = false;
  editServicioId = "";
  servicioForm.reset();
  mensajeError.textContent = "";
  servicioCreacion.value = formatearFecha(new Date());
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

// Ejemplo: Obtener el primer y último día de septiembre de 2023
const resultado = obtenerPrimerYUltimoDiaDeMes("2023", 1); // 8 representa septiembre (0-indexed)
console.log("Primer día:", formatearFecha(resultado.primerDia));
console.log("Último día:", formatearFecha(resultado.ultimoDia));
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
// async function vistaFactura(tipo) {
//   let recaudacionesReporte = [];
//   const datos = {
//     mensaje: "Hola desde pagina1",
//     otroDato: 12345,
//   };
//   const encabezado = {
//     servicio: servicioTit.textContent,
//     creacion: creacionEdit,
//     tipo: "Servicios Fijos",
//     fechaD: "2023-10-01",
//     fechaH: "2023-10-31",
//   };

//   const datosTotales = {
//     recaudado: valorRecaudado.textContent,
//     pendiente: valorPendiente.textContent,
//     totalFinal: valorTotal.textContent,
//   };
//   if (tipo == "cancelados") {
//     recaudacionesReporte = [];
//     recaudacionesReporte = recaudaciones.filter(function (recaudacion) {
//       return recaudacion.detalleEstado == "Cancelado";
//     });
//     console.log("rp: Cancelados ", recaudacionesReporte);
//   } else if (tipo == "sinCancelar") {
//     recaudacionesReporte = [];

//     recaudacionesReporte = recaudaciones.filter(function (recaudacion) {
//       return recaudacion.detalleEstado == "Por cancelar";
//     });
//     console.log("rp Sin cancelar: ", recaudacionesReporte);
//   } else {
//     recaudacionesReporte = [];

//     recaudacionesReporte = recaudaciones;
//     console.log("rp general: ", recaudacionesReporte);
//   }
//   await ipcRenderer.send(
//     "datos-a-pagina3",
//     datos,
//     encabezado,
//     recaudacionesReporte,
//     datosTotales
//   );
// }
async function vistaFactura(tipo) {
  let recaudacionesReporte = [];
  const datos = {
    mensaje: "Hola desde pagina1",
    otroDato: 12345,
  };
  const encabezado = {
    servicio: servicioTit.textContent,
    creacion: creacionEdit,
    tipo: "Servicios Fijos",
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
