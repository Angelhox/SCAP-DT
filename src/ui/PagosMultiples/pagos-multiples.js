const { ipcRenderer, ipcMain } = require("electron");
const validator = require("validator");
const Swal = require("sweetalert2");
const {
  createEncabezadoComprobante,
  verificarEncabezadoComprobantes,
} = require("../Comprobantes/comprobantes.api");
const { formatearFecha } = require("../commons/fechas.functions");
const {
  agruparPlanillas,
  agruparEncabezados,
  agruparServicios,
} = require("./group-data");
const { aproximarDosDecimales } = require("../commons/calculate.functions");
// ----------------------------------------------------------------
// Varibles de las planillas
// ----------------------------------------------------------------
const lecturasList = document.getElementById("lecturasList");
const planillaEmision = document.getElementById("planillaEmision");
const planillaCodigo = document.getElementById("planillaCodigo");
const planillaEstado = document.getElementById("planillaEstado");
const lecturaAnterior = document.getElementById("lecturaAnterior");
const lecturaActual = document.getElementById("lecturaActual");
const valorConsumo = document.getElementById("valorConsumo");
const tarifaConsumo = document.getElementById("tarifaConsumo");
const planillasList = document.getElementById("planillas");
const comprobanteCancelado = document.getElementById("comprobante");
// ----------------------------------------------------------------
// Varibles de busqueda de las planillas
// ----------------------------------------------------------------
const mesBusqueda = document.getElementById("mesBusqueda");
const anioBusqueda = document.getElementById("anioBusqueda");
const estadoBuscar = document.getElementById("estado");
const criterioBuscar = document.getElementById("criterio");
const criterioContent = document.getElementById("criterioContent");
const btnBuscar = document.getElementById("btnBuscar");
// ----------------------------------------------------------------
// Variables del socio
// ----------------------------------------------------------------
const socioNombres = document.getElementById("socioNombres");
const socioCedula = document.getElementById("socioCedula");
// ----------------------------------------------------------------
// Variables del contrato/medidor
// ----------------------------------------------------------------
const contratoCodigo = document.getElementById("contratoCodigo");
// ----------------------------------------------------------------
// Variables de los servicios
// ----------------------------------------------------------------
const serviciosFijosList = document.getElementById("serviciosFijos");
const otrosServiciosList = document.getElementById("otrosServicios");
const otrosAplazablesList = document.getElementById("otrosAplazables");
const errortextAbono = document.getElementById("errorTextAbono");
const errContainer = document.getElementById("err-container");
// ----------------------------------------------------------------
// Variables del los totales de la planilla
// ----------------------------------------------------------------

let totalFinal = 0;
let totalConsumo = 0;
let descuentoFinal = 0;
let tarifaAplicada = "Familiar";
let valorTarifa = 2.0;
let lecturaActualEdit = 0;
let lecturaAnteriorEdit = 0;
let valorConsumoEdit = 0;
// ----------------------------------------------------------------
const valorSubtotal = document.getElementById("valorSubtotal");
const valorTotalDescuento = document.getElementById("valorTotalDescuento");
const valorTotalPagar = document.getElementById("valorTotalPagar");
// Variables del dialogo de los comprobantes
const dialogComprobantes = document.getElementById("formComprobantes");

// Variables del dialogo de los servicios
const dialogServicios = document.getElementById("formServicios");
const servicioDg = document.getElementById("title-dg");
const descripcionDg = document.getElementById("descripcion-dg");
const detallesDg = document.getElementById("detalles-dg");
const subtotalDg = document.getElementById("subtotal-dg");
const descuentoDg = document.getElementById("descuento-dg");
const totalDg = document.getElementById("total-dg");
const numPagosDg = document.getElementById("numPagos-dg");
const canceladosDg = document.getElementById("cancelados-dg");
const pendientesDg = document.getElementById("pendientes-dg");
const aplicadosDg = document.getElementById("aplicados-dg");
const saldoDg = document.getElementById("saldo-dg");
const saldoAplicarDg = document.getElementById("saldo-aplicar-dg");
const abonadoDg = document.getElementById("abonado-dg");
const abonarDg = document.getElementById("abonar-dg");
const guardarDg = document.getElementById("btnGuardar-dg");
const administrarDg = document.getElementById("btnAdministrar-dg");
//----------------------------------------------------------------
// Variables de los elementos de la pagina
const vistaFacturaBt = document.getElementById("vista-factura");
const mostrarLecturas = document.getElementById("mostrar-lecturas");
const contenedorLecturas = document.getElementById("contenedor-lecturas");
const collapse = document.getElementById("collapse");
const calcularConsumoBt = document.getElementById("calcular-consumo");
const cancelarForm = document.getElementById("cancelarForm");
const btEncabezadoComprobante = document.getElementById(
  "encabezado-comprobante"
);
const btnVerificar = document.getElementById("verificar");
// ----------------------------------------------------------------
// Variables contenedoras
let tarifasDisponibles = [];

let abonarStatus = false;
let valorAbonoEdit = 0;
let datosServicios = [];
let serviciosFijos = [];
let otrosServicios = [];
let editados = [];
let planillas = [];
let allPlanillas = [];
let planillasAgrupadas = [];
let editPlanillas = [];
let editablePlanillas = [];
let serviciosAgrupados = [];
let editingStatus = false;
let planillaMedidorSn = false;
let editPlanillaId = "";
let editDetalleId = "";
let fechaEmisionEdit = "";
let editContratoId = "";
let planillaEdit = {};
let encabezadoId = "";
let editPlanillaEstado = "";
// Cambio
let ultimoAbono = 0;
let idAgregarAbono = "";
planillaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPlanilla = {
    valor: valorConsumo.value,
    lecturaAnterior: lecturaAnterior.value,
    lecturaActual: lecturaActual.value,
    observacion: "NA",
    tarifa: tarifaAplicada,
    tarifaValor: valorTarifa,
  };
  const newDetalleServicio = {
    subtotal: valorConsumo.value,
    total: valorConsumo.value,
    saldo: valorConsumo.value,
    abono: 0.0,
  };
  if (!editingStatus) {
    console.log("Can not create planilla");
  } else {
    // console.log("Editing planilla with electron");
    // const result = await ipcRenderer.invoke(
    //   "updatePlanilla",
    //   editPlanillaId,
    //   newPlanilla
    // );
    // const resultDetalle = await ipcRenderer.invoke(
    //   "updateDetalle",
    //   editDetalleId,
    //   newDetalleServicio
    // );
    // editingStatus = false;
    // editPlanillaId = "";
    // console.log(result, resultDetalle);
  }
});

//xxx
let fechaDesde = "";
let fechaHasta = "";
let estadoPlanilla = "";
let contrato = "";
let socioNombre = "";
let contratoId = "";
var rpValorAguaPotable = null;
var rpTotalPagar = 0.0;
let datosServiciosGeneral = [];
let datosServiciosAgrupados = [];
let totalConsumoRp = 0;
let totalValorConsumo = 0;
let lectura = 0;
let serv = [];
let serviciosEdit = [];
let idsPlanillas = [];
btEncabezadoComprobante.addEventListener("click", async () => {
  const resultCreate = await createEncabezadoComprobante();
  console.log("Encabezado comprobante: ", resultCreate);
});
btnVerificar.addEventListener("click", async () => {
  const result = await verificarEncabezadoComprobantes();
  console.log("Verificado: ", result);
});

vistaFacturaBt.addEventListener("click", () => {
  if (editablePlanillas.objetos.length > 0) {
    vistaFactura();
  }
});

async function preRenderServicios(serviciosAgrupados) {
  // Datos del consumo de agua potable de la planilla
  serviciosFijosList.innerHTML = "";
  otrosServiciosList.innerHTML = "";
  otrosAplazablesList.innerHTML = "";
  if (serviciosAgrupados[0] !== undefined) {
    renderServiciosAgrupados(serviciosAgrupados);
  } else {
    otrosServiciosList.innerHTML = "";
  }
}
async function renderServiciosAgrupados(servicios) {
  let totalPagarEdit = 0;
  let totalDescuentoEdit = 0;
  let tipo = "otros";
  serviciosFijos = [];
  otrosServicios = [];
  // let encabezadoId = "";
  console.log("Servicios a renderizard: ", servicios);

  servicios.forEach((servicio) => {
    tipo = servicio.tipo;
    console.log("tipo: ", tipo);
    if (tipo == "Servicio fijo") {
      serviciosFijos.push(servicio);
      tipo = "fijos";
    } else {
      otrosServicios.push(servicio);
      tipo = "otros";
    }
    // Crear el div principal
    if (servicio.nombre !== "Agua Potable") {
      if (
        servicio.nombre !== "Socio comuna" &&
        servicio.estadoDetalles !== "Anulado"
      ) {
        // encabezadoId = servicio.encabezadosId;
        // console.log("Encabezado desde detalle : " + encabezadoId);
        const tr = document.createElement("tr");
        tr.id = servicio.id;
        const tdServicio = document.createElement("td");
        tdServicio.textContent = "("+servicio.index +") "+ servicio.nombre;
        const tdAplazable = document.createElement("td");
        tdAplazable.textContent = servicio.aplazableSn;
        const tdSubtotal = document.createElement("td");
        tdSubtotal.textContent = parseFloat(servicio.subtotal).toFixed(2);
        const tdDescuento = document.createElement("td");
        tdDescuento.textContent = parseFloat(servicio.descuento).toFixed(2);
        const tdTotal = document.createElement("td");
        tdTotal.textContent = parseFloat(servicio.total).toFixed(2);
        const tdSaldo = document.createElement("td");
        // tdSaldo.textContent = parseFloat(
        //   servicio.total - servicio.abono
        // ).toFixed(2);
        tdSaldo.textContent = parseFloat(servicio.saldo).toFixed(2);
        const tdAbono = document.createElement("td");
        tdAbono.className = "valorAbono";
        tdAbono.textContent = parseFloat(servicio.abono).toFixed(2);
        if (servicio.aplazableSn === "Si") {
          totalPagarEdit += servicio.abono;
        } else {
          totalPagarEdit += servicio.total;
        }
        totalDescuentoEdit +=
          servicio.descuento / servicio.numeroPagosIndividual;
        const tdBtnGestionar = document.createElement("td");
        const btnGestionar = document.createElement("button");
        btnGestionar.className = "btn";
        btnGestionar.type = "button";
        btnGestionar.onclick = () => {
          detallesServiciodg(servicio);
          valorAbonoEdit = servicio.id;
        };
        const iconGestionar = document.createElement("i");
        iconGestionar.className = "fa-solid fa-ellipsis-vertical";
        btnGestionar.appendChild(iconGestionar);
        tdBtnGestionar.appendChild(btnGestionar);
        if (tipo == "fijos") {
          tr.appendChild(tdServicio);
          tr.appendChild(tdSubtotal);
          tr.appendChild(tdDescuento);
          tr.appendChild(tdTotal);
          tr.appendChild(tdBtnGestionar);
          serviciosFijosList.appendChild(tr);
        } else {
          if (servicio.objetos[0].aplazableSn === "Si") {
            tr.appendChild(tdServicio);
            tr.appendChild(tdSubtotal);
            tr.appendChild(tdDescuento);
            tr.appendChild(tdTotal);
            tr.appendChild(tdSaldo);
            tr.appendChild(tdAbono);
            tr.appendChild(tdBtnGestionar);
            otrosAplazablesList.appendChild(tr);
          } else {
            tr.appendChild(tdServicio);
            tr.appendChild(tdSubtotal);
            tr.appendChild(tdDescuento);
            tr.appendChild(tdTotal);
            tr.appendChild(tdBtnGestionar);
            otrosServiciosList.appendChild(tr);
          }
        }
      }
    } else if (servicio.nombre === "Agua Potable") {
      encabezadoId = servicio.encabezadosId;
      console.log("Encabezado desde detalle agua: " + encabezadoId);
      editDetalleId = servicio.id;
      console.log("Id del detalle Agua: " + editDetalleId);
    }
  });
  totalFinal += totalPagarEdit;
  descuentoFinal += totalDescuentoEdit;
  console.log("Total de edit: ", totalFinal);
  recalcularConsumo();
  // if (editPlanillaEstado == "Cancelado") {
  //   await comprobante(encabezadoId);
  // }
}

async function comprobante(encabezadoId) {
  console.log("sin programar");
}

function verificarEstado() {}
guardarDg.onclick = function () {
  let totalRc = totalFinal;
  // Cambio
  let ultimoPago = ultimoAbono;
  let idUltimoAgregarAbono = idAgregarAbono;
  console.log("Total Rc: " + totalRc);
  console.log("Fila a editar: " + valorAbonoEdit);
  if (abonarStatus) {
    let nuevoAbono = abonarDg.value;
    const fila = document.getElementById(valorAbonoEdit);
    const valorAnterior = fila.querySelector(".valorAbono").textContent;
    console.log("Valor anterior: ", valorAnterior);
    // if (valorAnterior !== nuevoAbono) {
    if (ultimoPago !== nuevoAbono && nuevoAbono > ultimoPago) {
      console.log("Compara: ", ultimoPago, " | ", nuevoAbono);
      // Cambio
      let agregarAbono = nuevoAbono - ultimoPago;
      // fila.querySelector(".valorAbono").textContent = nuevoAbono;
      // Cambio
      fila.querySelector(".valorAbono").textContent =
        parseFloat(agregarAbono) + parseFloat(valorAnterior);
      //
      editados.push({
        id: valorAbonoEdit,
        valor: agregarAbono,
        idDetalle: idUltimoAgregarAbono,
      });
      editados.forEach((editado) => {
        console.log("Editado: " + editado.id, " | " + editado.valor);
      });
      // totalRc = totalFinal - valorAnterior;
      // Cambio
      totalRc = totalFinal + parseFloat(agregarAbono);
      console.log("Total rc: " + totalRc);
      // totalFinal = totalRc + parseFloat(nuevoAbono);
      // Cambio
      totalFinal = totalRc;
      console.log("Total final: " + totalFinal);
      valorTotalPagar.value = (totalFinal + parseFloat(totalConsumo)).toFixed(
        2
      );
      // valorTotalPagar.value = aproximarDosDecimales(
      //   totalFinal + parseFloat(totalConsumo)

      CerrarFormServicios();
    } else {
      CerrarFormServicios();
    }
  }
};

const getPlanillas = async (criterio, content) => {
  allPlanillas = await ipcRenderer.invoke("getAllPlanillas", criterio, content);
  console.log("Planillas", allPlanillas);

  // Agrupamos las planillas
  planillasAgrupadas = await agruparPlanillas(allPlanillas);
  console.log("Agrupadas: ", planillasAgrupadas);

  for (const planilla of planillasAgrupadas) {
    await getAllServicios(planilla);
    let encabezados = await agruparEncabezados(planilla.servicios);
    planilla.encabezados = encabezados;
    let srv = await agruparServicios(planilla.servicios);
    planilla.servicios = srv;
  }
  console.log("Con servicios agrupados: ", planillasAgrupadas);
  await renderPlanillas(planillasAgrupadas);
};
const getAllServicios = async (planilla) => {
  let contratoId = planilla.contratosId;
  // Utilizamos for...of para asegurar un manejo asíncrono adecuado
  for (const fecha of planilla.fechasEmision) {
    const servicios = await getServiciosx(fecha, contratoId);
    planilla.servicios.push(...servicios);
  }
};
const getServiciosx = async (fechaEmision, contratoId) => {
  const results = await ipcRenderer.invoke(
    "getAllServicios",
    fechaEmision,
    contratoId
  );

  return results;
};

async function renderPlanillas(allPlanillas) {
  planillasList.innerHTML = ``;
  for (const planilla of allPlanillas) {
    render(planilla);
  }
}
const editPlanillasAgrupadas = async (planilla) => {
  editablePlanillas = [];
  console.log("A editar planilla: ", planilla);
  // encabezadoId = "";
  editados = [];
  // editingStatus = true;
  // editPlanillaId = planillaId;
  editPlanillas = planilla;
  editablePlanillas = planilla;
  descuentoFinal = 0;
  totalFinal = 0;
  totalConsumo = 0;
  let fechaDesde = planilla.fechasEmision[0];
  let fechaHasta = planilla.fechasEmision[planilla.fechasEmision.length - 1];
  let contratoId = planilla.contratosId;
  // ----------------------------------------------------------------
  // Datos del encabezado de la planilla a editar
  contratoCodigo.textContent = planilla.codigo;
  let anioDesde = new Date(fechaDesde).getFullYear() % 100;
  let anioHasta = new Date(fechaHasta).getFullYear() % 100;
  let fechaEmisionValor = "Error";

  if (fechaHasta !== fechaDesde) {
    // fechaEmisionValor =
    //   obtenerNombreMes(fechaDesde).slice(0, 3) +
    //   "(" +
    //   anioDesde +
    //   ")" +
    //   " a " +
    //   obtenerNombreMes(fechaHasta).slice(0, 3) +
    //   "(" +
    //   anioHasta +
    //   ")";
    fechaEmisionValor = fechaDesde + " - " + fechaHasta;
  } else {
    fechaEmisionValor = fechaHasta;
    //  fechaEmisionValor=obtenerNombreMes(formatearFecha(fechaHasta)).slice(0, 3) +
    //     "(" +
    //     anioHasta +
    //     ")";
  }
  planillaEmision.textContent = fechaEmisionValor;
  socioNombres.textContent = planilla.nombre;
  socioCedula.textContent = planilla.cedula;
  socioUbicacion.textContent = planilla.ubicacion;
  planillaEstado.textContent = planilla.estado;
  editPlanillaEstado = planilla.estado;
  preRenderServicios(planilla.servicios);

  const tieneAgua = await planilla.servicios.some(
    (servicio) => servicio.nombre === "Agua Potable"
  );

  // //Asignamos accion al boton vistaFactura
  // // ----------------------------------------------------------------
  // if (tieneAgua !== undefined && !Object.keys(tieneAgua).length == 0) {
  //   // Revisar cambios en planillas.js
  await renderConsumos(editablePlanillas);
  if (tieneAgua) {
    console.log("Awita :)");
    planillaMedidorSn = true;
    console.log("total consumo con valor de ep: ", totalConsumo);
    console.log("total consumo reseteado: ", totalConsumo);
    // Asignamos a totalConsumo el valor de agua desde planilla
    // totalConsumo += planilla.valor;
    console.log("total consumo con valor de ep: ", totalConsumo);
    // calcularConsumo();
    calcularConsumoBt.disabled = false;
    mostrarLecturas.disabled = false;
    mostrarLecturas.innerHTML = "";
    mostrarLecturas.innerHTML =
      "Servicio de agua potable" +
      '<i id="collapse" class="fs-3 fa-solid fa-caret-up"></i>';
    contenedorLecturas.style.display = "flex";
    collapse.classList.remove("fa-caret-down");
    collapse.classList.add("fa-caret-up");
  } else {
    planillaMedidorSn = false;
    lecturaActual.value = "";
    lecturaActual.placeHolder = "NA";
    lecturaAnterior.value = "";
    lecturaAnterior.placeHolder = "NA";
    valorConsumo.value = "";
    valorConsumo.placeHolder = "NA";
    tarifaConsumo.value = "";
    // calcularConsumo();
    console.log("total consumo: ", totalConsumo);
    // totalConsumo += planilla[0].valor;
    console.log("total consumo: ", totalConsumo);
    console.log(planilla[0]);
    calcularConsumoBt.disabled = true;
    mostrarLecturas.disabled = true;
    mostrarLecturas.innerHTML = "";
    mostrarLecturas.innerHTML =
      "No aplica servicio de agua potable" +
      '<i id="collapse" class="fs-3 fa-solid fa-caret-down"></i>';
    contenedorLecturas.style.display = "none";
    collapse.classList.add("fa-caret-down");
    collapse.classList.remove("fa-caret-up");
  }
  recalcularConsumo();
  valorTotalPagar.value = totalFinal + totalConsumo;
  // valorTotalDescuento.value=0;
  valorTotalDescuento.value = descuentoFinal;
};
async function obtenerDatos(planilla) {
  fechaHasta = "";
  console.log("Tamaño de fechas: ", planilla.fechasEmision.length);
  fechaDesde = planilla.fechasEmision[0];
  estadoPlanilla = "";
  contrato = planilla.codigo;
  socioNombre = planilla.nombre;
  contratoId = planilla.contratosId;
  rpValorAguaPotable = null;
  rpTotalPagar = 0.0;
  datosServiciosGeneral = [];
  totalConsumoRp = 0;
  totalValorConsumo = planilla.valor;
  contratoId = planilla.contratosId;
  lectura = [];
  // Obtener la fecha hasta la cual se cargan los valores !!
  fechaHasta = planilla.fechasEmision[planilla.fechasEmision.length - 1];
  // Obtener la fecha desde la cual se cargan los valores !!¿

  for (const uPlanilla of planilla.objetos) {
    // Obtener el total de consumo !!

    let lecturaAnterior = uPlanilla.lecturaAnterior;
    let lecturaActual = uPlanilla.lecturaActual;
    let consumo = lecturaActual - lecturaAnterior;
    if (consumo < 0) {
      consumo = 0;
    }
    totalConsumoRp += consumo;
  }
}
async function render(planilla) {
  obtenerDatos(planilla);
  let idsPlanilla = planilla.ids;
  // let ids = [];
  datosServiciosAgrupados = planilla.servicios;
  const divContainer = document.createElement("div");
  divContainer.className = "col-xl-6 col-lg-12 col-md-12 col-sm-12 px-1";
  divContainer.style.height = "fit-content";
  divContainer.style.maxHeight = "fit-content";
  // divContainer.style.backgroundColor = "black";
  const cardDiv = document.createElement("div");
  cardDiv.className =
    "clase col-xl-12 col-lg-12 col-md-12 col-sm-12 my-1 mx-1 card card-planilla";
  cardDiv.style.backgroundColor = "red";

  cardDiv.style.width = "100%";
  // cardDiv.style.maxWidth = "100%";
  cardDiv.style.padding = "0.3em";
  cardDiv.style.backgroundColor = "#d6eaf8";
  cardDiv.style.height = "30em";
  cardDiv.style.minHeight = "30em";
  cardDiv.style.maxHeight = "30em";
  // Crear el elemento div para el encabezado de la tarjeta con la clase y el estilo
  const headerDiv = document.createElement("div");
  headerDiv.className = "card-header d-flex ";
  headerDiv.style.backgroundColor = "#85c1e9";

  // Crear el elemento div para la información del contrato
  const contratoDiv = document.createElement("div");
  contratoDiv.className = "d-flex col-6 titulo-detalles header-planilla";

  const contratoP = document.createElement("p");
  contratoP.textContent = "Contrato: ";
  const espace = document.createElement("p");
  espace.textContent = "-";
  espace.className = "trans";
  const contratoValor = document.createElement("p");
  contratoValor.textContent = planilla.codigo;
  contratoValor.className = "title-contrato ";
  contratoDiv.appendChild(contratoP);
  contratoDiv.appendChild(espace);
  contratoDiv.appendChild(contratoValor);

  // Crear el elemento div para la información de "Cancelado"
  const canceladoDiv = document.createElement("div");
  canceladoDiv.className =
    "d-flex col-6 titulo-detalles header-planilla positive justify-content-end";
  const canceladoP = document.createElement("p");
  canceladoP.textContent = "Cancelado: ";
  const canceladoValor = document.createTextNode(estadoPlanilla);
  // canceladoDiv.appendChild(canceladoP);
  canceladoDiv.appendChild(canceladoValor);

  // Agregar los elementos de contrato y cancelado al encabezado
  headerDiv.appendChild(contratoDiv);
  headerDiv.appendChild(canceladoDiv);

  // Crear el elemento div para el cuerpo de la tarjeta
  const bodyDiv = document.createElement("div");
  bodyDiv.className = "card-body cuerpo";
  bodyDiv.style.backgroundColor = "white";
  // Crear el elemento div para el título del socio
  const socioDiv = document.createElement("div");
  socioDiv.className = "card-title d-flex  mp-0";
  const socioH5 = document.createElement("p");
  socioH5.className = "mp-0 titulos";
  socioH5.textContent = "Socio: ";
  const espace1 = document.createElement("p");
  espace1.textContent = "-";
  espace1.className = "trans mp-0";
  const socioP = document.createTextNode(socioNombre);
  socioDiv.appendChild(socioH5);
  socioDiv.appendChild(espace1);
  socioDiv.appendChild(socioP);

  // Crear el elemento para la fecha de emisión
  const fechaEmisionDiv = document.createElement("div");
  fechaEmisionDiv.className = " ";
  const fechaEmisionP = document.createElement("p");
  fechaEmisionP.className = "titulos mp-0";
  fechaEmisionP.textContent = "Rango fechas ";
  const fechaEmisionSp = document.createElement("p");
  fechaEmisionSp.textContent = "-";
  fechaEmisionSp.className = "trans mp-0";
  let anioDesde = new Date(fechaDesde).getFullYear() % 100;
  let anioHasta = new Date(fechaHasta).getFullYear() % 100;
  console.log("Render");
  let fechaEmisionValor = document.createTextNode(fechaHasta + "");
  // let fechaEmisionValor = document.createTextNode(
  //   obtenerNombreMes(fechaHasta).slice(0, 3) + "(" + anioHasta + ")"
  // );

  if (fechaHasta !== fechaDesde) {
    console.log("Nombre mes: " + fechaDesde);
    const textDesde = fechaDesde;
    // const textDesde = obtenerNombreMes(fechaDesde);
    fechaEmisionValor = document.createTextNode(textDesde + " a " + fechaHasta);
    // fechaEmisionValor = document.createTextNode(
    //   textDesde.slice(0, 3) +
    //     "(" +
    //     anioDesde +
    //     ")" +
    //     " a " +
    //     obtenerNombreMes(fechaHasta).slice(0, 3) +
    //     "(" +
    //     anioHasta +
    //     ")"
    // );
  }

  fechaEmisionDiv.appendChild(fechaEmisionP);
  // fechaEmisionDiv.appendChild(fechaEmisionSp);
  fechaEmisionDiv.appendChild(fechaEmisionValor);

  // // Crear el elemento para la sección de servicios
  const serviciosDiv = document.createElement("div");
  serviciosDiv.className = "row justify-content-between";
  const serviciosP = document.createElement("p");
  serviciosP.className = "text-center titulo-servicios-positive";
  serviciosP.textContent = "Agua Potable";
  const serviciosTituloP = document.createElement("p");
  serviciosTituloP.className = "text-center titulo-servicios-positive";
  serviciosTituloP.textContent = "Servicios";
  // Agrega la fecha de Emision y el Socio
  serviciosDiv.appendChild(socioDiv);
  serviciosDiv.appendChild(fechaEmisionDiv);
  serviciosDiv.appendChild(serviciosP);

  // // Crear el elemento para la lista de servicios
  const listaServiciosDiv = document.createElement("div");
  listaServiciosDiv.className = "lista-servicios";
  // Crear la lista ul con la clase
  const listaUl = document.createElement("ul");
  listaUl.className = "list-group list-group-flush";
  // Contenedor y contenido de consumo
  const consumoDiv = document.createElement("div");
  consumoDiv.className = "col-4 d-flex titulo-detalles";
  const consumoP = document.createElement("p");
  consumoP.textContent = "Consumo:";
  const consumoSp = document.createElement("p");
  consumoSp.textContent = "-";
  consumoSp.className = "trans mp-0";
  // Contenedor y contenido de tarifa
  const tarifaDiv = document.createElement("div");
  tarifaDiv.className = "col-4 d-flex titulo-detalles";
  const tarifaP = document.createElement("p");
  tarifaP.textContent = "Tarifa:";
  const tarifaSp = document.createElement("p");
  tarifaSp.textContent = "-";
  tarifaSp.className = "trans mp-0";
  // Contenedor y contenido de valor consumo
  const valorDiv = document.createElement("div");
  valorDiv.className = "col-4 d-flex titulo-detalles";
  const valorP = document.createElement("p");
  valorP.textContent = "Valor:$ ";
  const valorSp = document.createElement("p");
  valorSp.textContent = "-";
  valorSp.className = "trans mp-0";
  // Renderizando los servicios agrupados correspondientes a las planillas
  if (datosServiciosAgrupados.length > 0) {
    for (const servicioAgrupado of datosServiciosAgrupados) {
      // ids.push(...servicioAgrupado.ids);
      if (servicioAgrupado.nombre === "Agua Potable") {
        rpValorAguaPotable = servicioAgrupado.total;
        // tarifaAguaPotable = servicioAgrupado.tarifa;
        // el total de servicio agua al total a pagar de rp
        rpTotalPagar += servicioAgrupado.total;
      } else {
        // Crear elementos de la lista de servicios (Alcantarillado, Recolección de desechos, Riego Agrícola, Bomberos)
        if (servicioAgrupado.objetos[0].aplazableSn === "Si") {
          const alcantarilladoLi = document.createElement("li");
          alcantarilladoLi.className = "titulo-detalles d-flex detalles";
          const alcantarilladoP = document.createElement("p");
          alcantarilladoP.textContent =
            "(" +
            servicioAgrupado.index +
            ") " +
            servicioAgrupado.nombre +
            ": ";
          const servicioSp = document.createElement("p");
          servicioSp.textContent = "-";
          servicioSp.className = "trans mp-0";
          const alcantarilladoValor = document.createTextNode(
            // en esta parte esta seliendo null
            parseFloat(servicioAgrupado.abono).toFixed(2) + "$"
          );
          // si el servicio es aplazable sumo el abono al total a pagar de rp
          rpTotalPagar += servicioAgrupado.abono;
          alcantarilladoLi.appendChild(alcantarilladoP);
          alcantarilladoLi.appendChild(servicioSp);
          alcantarilladoLi.appendChild(alcantarilladoValor);
          listaUl.appendChild(alcantarilladoLi);
        } else {
          const alcantarilladoLi = document.createElement("li");
          alcantarilladoLi.className = "titulo-detalles d-flex detalles";
          const alcantarilladoP = document.createElement("p");
          alcantarilladoP.textContent =
            "(" +
            servicioAgrupado.index +
            ") " +
            servicioAgrupado.nombre +
            ": ";
          const servicioSp = document.createElement("p");
          servicioSp.textContent = "-";
          servicioSp.className = "trans mp-0";
          const alcantarilladoValor = document.createTextNode(
            parseFloat(servicioAgrupado.total).toFixed(2) + "$"
          );
          // Si el servicio no es aplazable (fijo u ocacional) sumo el total al total
          // a pagar de rp
          rpTotalPagar += servicioAgrupado.total;
          alcantarilladoLi.appendChild(alcantarilladoP);
          alcantarilladoLi.appendChild(servicioSp);
          alcantarilladoLi.appendChild(alcantarilladoValor);
          listaUl.appendChild(alcantarilladoLi);
        }
      }

      // Agregar los elementos de servicios al contenedor de servicios

      serviciosDiv.appendChild(consumoDiv);
      // serviciosDiv.appendChild(tarifaDiv);
      serviciosDiv.appendChild(valorDiv);
      serviciosDiv.appendChild(serviciosTituloP);
      listaServiciosDiv.appendChild(listaUl);
    }
    console.log("valor agua: " + rpValorAguaPotable);
    if (
      rpValorAguaPotable === null ||
      rpValorAguaPotable === undefined ||
      rpValorAguaPotable === "null"
    ) {
      // Si despues de almacenar el valor de agua potable la variable sique siendo null
      // no existe el servicio de agua potable asignamos No aplica
      console.log("Valor de agua= " + rpValorAguaPotable);
      console.log("Asignando NA");
      const consumoValor = document.createTextNode("NA");
      consumoDiv.appendChild(consumoP);
      consumoDiv.appendChild(consumoSp);
      consumoDiv.appendChild(consumoValor);
      const tarifaValor = document.createTextNode("NA");
      tarifaDiv.appendChild(tarifaP);
      tarifaDiv.appendChild(tarifaSp);
      tarifaDiv.appendChild(tarifaValor);
      const valorValor = document.createTextNode("0.0");
      valorDiv.appendChild(valorP);
      valorDiv.appendChild(valorSp);
      valorDiv.appendChild(valorValor);
    } else {
      // lectura = await getDatosLecturas(
      //   datosPlanilla.contratosId,
      //   formatearFecha(datosPlanilla.fechaEmision)
      // );
      console.log("Datos consumo total: ", totalConsumoRp);
      const consumoValor = document.createTextNode(
        parseFloat(totalConsumoRp).toFixed(2)
      );
      consumoDiv.appendChild(consumoP);
      consumoDiv.appendChild(consumoSp);
      consumoDiv.appendChild(consumoValor);
      const tarifaValor = document.createTextNode("NA");
      // const tarifaValor = document.createTextNode(
      //   lectura[0].tarifa + "(" + lectura[0].tarifaValor + ")"
      // );
      tarifaDiv.appendChild(tarifaP);
      tarifaDiv.appendChild(tarifaSp);
      tarifaDiv.appendChild(tarifaValor);
      // tarifaDiv.className = "d-flex";
      const valorValor = document.createTextNode(
        parseFloat(totalValorConsumo).toFixed(2)
      );
      valorDiv.appendChild(valorP);
      valorDiv.appendChild(valorSp);
      valorDiv.appendChild(valorValor);
    }
    // --->
    bodyDiv.appendChild(serviciosDiv);
    bodyDiv.appendChild(listaServiciosDiv);
  } else {
    // En caso de que no existan servicios cargados a la planilla
    console.log("Asignando NA para planillas vacias");
    const consumoValor = document.createTextNode("NA");
    consumoDiv.appendChild(consumoP);
    consumoDiv.appendChild(consumoSp);
    consumoDiv.appendChild(consumoValor);
    const tarifaValor = document.createTextNode("NA");
    tarifaDiv.appendChild(tarifaP);
    tarifaDiv.appendChild(tarifaSp);
    tarifaDiv.appendChild(tarifaValor);
    const valorValor = document.createTextNode("NA");
    valorDiv.appendChild(valorP);
    valorDiv.appendChild(valorSp);
    valorDiv.appendChild(valorValor);

    const alcantarilladoLi = document.createElement("li");
    alcantarilladoLi.className = "titulo-detalles d-flex detalles";
    const alcantarilladoP = document.createElement("p");
    alcantarilladoP.textContent = "Sin servicios adeudados" + ": ";
    const servicioSp = document.createElement("p");
    servicioSp.textContent = "-";
    servicioSp.className = "trans mp-0";
    const alcantarilladoValor = document.createTextNode(
      parseFloat(0).toFixed(2) + "$"
    );
    // El total a pagar de planillas sera cero
    rpTotalPagar += 0.0;
    alcantarilladoLi.appendChild(alcantarilladoP);
    alcantarilladoLi.appendChild(servicioSp);
    alcantarilladoLi.appendChild(alcantarilladoValor);

    serviciosDiv.appendChild(consumoDiv);
    serviciosDiv.appendChild(tarifaDiv);
    serviciosDiv.appendChild(valorDiv);

    serviciosDiv.appendChild(serviciosTituloP);
    listaUl.appendChild(alcantarilladoLi);
    listaServiciosDiv.appendChild(listaUl);

    bodyDiv.appendChild(serviciosDiv);
    bodyDiv.appendChild(listaServiciosDiv);
  }

  // Crear el elemento para el pie de la tarjeta
  const footerDiv = document.createElement("div");
  footerDiv.className = "card-footer row d-flex";
  footerDiv.style.border = "none";
  // Crear elemento para el total
  const totalDiv = document.createElement("div");
  totalDiv.className = "col-6 titulo-detalles d-flex";
  const totalP = document.createElement("p");
  totalP.textContent = "Total:$";
  const totalSp = document.createElement("p");
  totalSp.textContent = "-";
  totalSp.className = "trans mp-0";
  // Mostramos en el pie de la planilla el total que se calculo durante rp
  const totalValor = document.createTextNode(
    parseFloat(rpTotalPagar).toFixed(2)
  );
  totalDiv.appendChild(totalP);
  totalDiv.appendChild(totalSp);
  totalDiv.appendChild(totalValor);

  // Crear el botón con la clase y el ícono
  const button = document.createElement("button");
  button.className = "btn-planilla-positive col-6";
  // Añadir un evento onclick
  button.onclick = function () {
    // Elimina la clase "selected" de todos los elementos
    const elementos = document.querySelectorAll(".clase"); // Reemplaza con la clase real de tus elementos
    elementos.forEach((elemento) => {
      elemento.classList.remove("bg-secondary");
    });

    // Agrega la clase "selected" al elemento que se hizo clic
    cardDiv.classList.add("bg-secondary");
    // detallesContratos(datosContrato.contratosId);
    // editPlanilla(
    //   datosPlanilla.planillasId,
    //   datosPlanilla.contratosId,
    //   formatearFecha(datosPlanilla.fechaEmision)
    // );
    console.log("¡Hiciste clic en el botón!", idsPlanilla);
    editPlanillasAgrupadas(planilla);
    // console.log(
    //   "¡Hiciste clic en el botón!",
    //   datosPlanilla.planillasId,
    //   contratoId,
    //   formatearFecha(datosPlanilla.fechaEmision)
    // );
  };

  const buttonIcon = document.createElement("i");
  buttonIcon.className = "fa-solid fa-file-pen";
  button.appendChild(buttonIcon);

  // Agregar elementos al pie de la tarjeta
  footerDiv.appendChild(totalDiv);
  footerDiv.appendChild(button);

  // Agregar todos los elementos a la tarjeta principal
  cardDiv.appendChild(headerDiv);
  cardDiv.appendChild(bodyDiv);
  // cardDiv.appendChild(serviciosDiv);
  // cardDiv.appendChild(listaServiciosDiv);
  cardDiv.appendChild(footerDiv);
  divContainer.appendChild(cardDiv);

  // // Agregar la tarjeta al documento (por ejemplo, al elemento con el id "planillasList")
  // // const planillasList = document.getElementById("planillasList");
  planillasList.appendChild(divContainer);
  totalValorConsumo = 0;
  totalConsumoRp = 0;
  rpTotalPagar = 0;
  idsPlanillas = [];

  // // });
}
async function init() {
  // let fechaActual = new Date();
  // let anioEnviar = fechaActual.getFullYear();
  // let mesEnviar = fechaActual.getMonth() + 1;
  // let criterioEnviar = criterioBuscar.value;
  // let criterioContentEnviar = criterioContent.value;
  // let estadoEnviar = estadoBuscar.value;
  // console.log("error", mesEnviar, anioEnviar);
  // await getPlanillas(
  //   criterioEnviar,
  //   criterioContentEnviar,
  //   estadoEnviar,
  //   anioEnviar,
  //   mesEnviar
  // );
  buscarPlanillas();
  getTarifasDisponibles();
  cargarAnioBusquedas();
  cargarMesActual();
}
ipcRenderer.on("Notificar", (event, response) => {
  if (response.title === "Borrado!") {
    // resetFormAfterSave();
  } else if (response.title === "Actualizado!") {
    resetFormAfterUpdate();
  } else if (response.title === "Guardado!") {
    // resetFormAfterSave();
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
lecturaActual.addEventListener("input", function () {
  recalcularConsumo();
});
async function getTarifasDisponibles() {
  tarifasDisponibles = await ipcRenderer.invoke("getTarifas");
  console.log("Tartifas disponibles :", tarifasDisponibles);
}
async function calcularConsumo() {
  console.log("Consultando tarifas ...");
  totalConsumo = 0;
  let consumo = Math.round(lecturaActual.value - lecturaAnterior.value);
  let base = 0.0;
  let limitebase = 15.0;
  console.log("Consumo redondeado cC: " + consumo);

  console.log("Tarifas: " + tarifasDisponibles);
  if (tarifasDisponibles[0] !== undefined) {
    tarifasDisponibles.forEach((tarifa) => {
      if (consumo >= tarifa.desde && consumo <= tarifa.hasta) {
        tarifaAplicada = tarifa.tarifa;
        valorTarifa = tarifa.valor;
        console.log(
          "VAlores que se asignaran: ",
          tarifaAplicada + "|" + valorTarifa
        );
      }
      if (tarifa.tarifa == "Familiar") {
        base = tarifa.valor;
        limitebase = tarifa.hasta;
        console.log("Bases: ", base + "|" + limitebase);
      }
    });
  }
  if (tarifaAplicada === "Familiar") {
    console.log("Aplicando tarifa familiar: " + valorTarifa.toFixed(2));
    valorConsumo.value = valorTarifa.toFixed(2);
  } else {
    totalConsumo = (consumo - limitebase) * valorTarifa;
    console.log(
      "Total consumo que excede la base: ",
      totalConsumo + "|" + base
    );

    valorConsumo.value = (totalConsumo + base).toFixed(2);
  }

  valorConsumo.value = (totalConsumo + base).toFixed(2);

  tarifaConsumo.value = tarifaAplicada + "($" + valorTarifa + ")";

  console.log("Tarifa: " + tarifaAplicada + "(" + valorTarifa + ")");
}
async function calcularConsumos(lecturaActual, lecturaAnterior, tarifaActual) {
  console.log("Consultando tarifas ...");
  // totalConsumo = 0;
  let valoresConsumo = 0;
  if (tarifaActual === "Sin consumo") {
    totalConsumo += parseFloat(0);
    const datosConsumo = {
      consumo: 0,
      tarifa: tarifaActual + "($" + 0 + ")",
      valor: (0).toFixed(2),
    };
    return datosConsumo;
  }
  let consumo = Math.round(lecturaActual - lecturaAnterior);
  if (consumo < 0) {
    consumo = 0;
  }
  let base = 0.0;
  let limitebase = 15.0;
  console.log("Consumo redondeado cC: ", consumo);

  console.log("Tarifas: " + tarifasDisponibles);
  if (tarifasDisponibles.length > 0) {
    tarifasDisponibles.forEach((tarifa) => {
      if (consumo >= tarifa.desde && consumo <= tarifa.hasta) {
        tarifaAplicada = tarifa.tarifa;
        valorTarifa = tarifa.valor;
        console.log(
          "VAlores que se asignaran: ",
          tarifaAplicada,
          "|",
          valorTarifa
        );
      }
      if (tarifa.tarifa == "Familiar") {
        base = tarifa.valor;
        limitebase = tarifa.hasta;
        console.log("Bases: ", base + "|" + limitebase);
      }
    });
  }

  if (tarifaAplicada === "Familiar") {
    console.log("Aplicando tarifa familiar: ", valorTarifa.toFixed(2));
    // valorConsumo.value = valorTarifa.toFixed(2);
    totalConsumo += parseFloat(valorTarifa);
  } else {
    valoresConsumo += (consumo - limitebase) * valorTarifa;

    totalConsumo += valoresConsumo + base;
    console.log(
      "Total consumo que excede la base: ",
      totalConsumo + "|" + base
    );

    // valorConsumo.value = (totalConsumo + base).toFixed(2);
  }

  // valorConsumo.value = (totalConsumo + base).toFixed(2);
  tarifaConsumo.value = tarifaAplicada + "($" + valorTarifa + ")";
  console.log("Tarifa: " + tarifaAplicada + "(" + valorTarifa + ")");
  const datosConsumo = {
    consumo: consumo,
    tarifa: tarifaAplicada + "($" + valorTarifa + ")",
    valor: (valoresConsumo + base).toFixed(2),
  };
  return datosConsumo;
}
async function renderConsumos(editablePlanillas) {
  totalConsumo = 0;
  let indices = editablePlanillas.objetos.length;
  let contador = 0;
  // await calcularConsumos();
  // const planilla = editPlanillas;
  lecturasList.innerHTML = "";
  for (const consumos of editablePlanillas.objetos) {
    contador++;
    const trConsumos = document.createElement("tr");
    const tdFecha = document.createElement("td");
    tdFecha.textContent = formatearFecha(new Date(consumos.fechaEmision));
    trConsumos.append(tdFecha);
    if (consumos.tarifa === "NA") {
      const tdSinServicio = document.createElement("td");
      tdSinServicio.textContent = "Sin servicio";
      tdSinServicio.className = "td-sin-servicio";
      tdSinServicio.colSpan = 5;
      trConsumos.append(tdSinServicio);
    } else {
      const tdAnterior = document.createElement("td");
      tdAnterior.textContent = consumos.lecturaAnterior;
      const tdActual = document.createElement("td");
      tdActual.textContent = consumos.lecturaActual;
      const tdConsumo = document.createElement("td");
      const datosConsumo = await calcularConsumos(
        consumos.lecturaActual,
        consumos.lecturaAnterior,
        consumos.tarifa
      );
      tdConsumo.textContent = datosConsumo.consumo;
      const tdTarifa = document.createElement("td");
      tdTarifa.textContent = datosConsumo.tarifa;
      const tdValor = document.createElement("td");
      tdValor.textContent = datosConsumo.valor;
      trConsumos.append(tdAnterior);
      trConsumos.append(tdActual);
      trConsumos.append(tdConsumo);
      trConsumos.append(tdTarifa);
      trConsumos.append(tdValor);
    }
    const tdQuit = document.createElement("td");
    const btnQuit = document.createElement("button");
    btnQuit.className = "btn-quit";
    btnQuit.innerHTML = `<i class="fs-4 fa-regular fa-ban"></i>`;
    btnQuit.addEventListener("click", () => {
      console.log(
        "Here: ",
        editablePlanillas.contratosId,
        " | ",
        consumos.fechaEmision
      );
      quitPlanillas(consumos.fechaEmision, consumos.planillasId);
    });
    console.log("Contador/Indice: ", contador, indices);
    if (indices > 1 && contador === indices) {
      tdQuit.appendChild(btnQuit);
    } else {
      btnQuit.disabled = true;
      btnQuit.className = "btn-quit-disabled";
      tdQuit.appendChild(btnQuit);
    }

    trConsumos.appendChild(tdQuit);
    lecturasList.appendChild(trConsumos);

    // lecturasList.innerHTML +=
    // lecturaActual.value = planilla[0].lecturaActual;
    // lecturaActualEdit = planilla[0].lecturaActual;
    // lecturaAnterior.value = planilla[0].lecturaAnterior;
    // lecturaAnteriorEdit = planilla[0].lecturaAnterior;
    // valorConsumo.value = planilla[0].valor;
    // valorConsumoEdit = planilla[0].valor;
  }
}
async function quitPlanillas(fecha, planillaId) {
  const fechaQuit = formatearFecha(new Date(fecha));
  const fechasFiltradas = await editablePlanillas.fechasEmision.filter(
    (fechaEmision) => fechaEmision !== fechaQuit
  );
  const planillasFiltradas = await editablePlanillas.objetos.filter(
    (planilla) => planilla.planillasId !== planillaId
  );
  const idsFiltrados = await editablePlanillas.ids.filter(
    (id) => id !== planillaId
  );
  // const serviciosFiltrados = editablePlanillas.servicios.filter(
  //   (servicio) => servicio.fechaEmision
  // );
  // Filtrar los objetos de objetos dentro de servicios
  // Recorremos los primeros onjetos
  //  for(const servicios of editablePlanillas.servicios){
  //   servicios.objetos.filter
  //  }
  // Oooo Volvemos a cargar los servicios
  console.log("Retirada: ", editablePlanillas);
  editablePlanillas.fechasEmision = fechasFiltradas;
  console.log("Planillas filtradas: ", planillasFiltradas);
  editablePlanillas.objetos = planillasFiltradas;
  console.log("Ids filtrados: ", idsFiltrados);
  editablePlanillas.ids = idsFiltrados;
  console.log("Fechas filtradas: ", fechasFiltradas);
  // Resetear servicios
  editablePlanillas.servicios = [];
  console.log("Sin servicios: ", editablePlanillas);
  await getAllServicios(editablePlanillas);
  console.log("Sin agrupar: ", editablePlanillas);
  let encabezados = await agruparEncabezados(editablePlanillas.servicios);
  editablePlanillas.encabezados = encabezados;
  let srv = await agruparServicios(editablePlanillas.servicios);
  editablePlanillas.servicios = srv;
  console.log("Agrupados: ", editablePlanillas);
  // Enviar a editar planilla la nueva planilla filtrada
  await editPlanillasAgrupadas(editablePlanillas);
}
async function vistaFactura() {
  let telefono = "0999999999";
  if (editablePlanillas.objetos.length > 0) {
    let socio = socioNombres.textContent;
    console.log("Encabezado a enviar: " + socio);
    const datos = {
      mensaje: "Datos desde pagos",
    };

    if (
      editablePlanillas.telefono &&
      editablePlanillas.telefono !== "9999999999" &&
      editablePlanillas.telefono !== "0999999999"
    ) {
      telefono = editablePlanillas.telefono;
    }
    const planillaCancelar = editablePlanillas;
    console.log("Planilla enviar: ", planillaCancelar);
    const encabezado = {
      // encabezadoId: editablePlanillas.servicios.encabezadosIds,
      socio: editablePlanillas.nombre,
      socioId: editablePlanillas.sociosId,
      fecha: editablePlanillas.fechasEmision,
      cedula: editablePlanillas.cedula,
      contrato: editablePlanillas.codigo,
      // planilla: planillaEdit.planillasCodigo,
      contratoId: editablePlanillas.contratoId,
      telefono: telefono,
      direccion: editablePlanillas.direccion,
      ubicacion: editablePlanillas.ubicacion,
    };
    const datosAgua = {
      planillasId: editablePlanillas.ids,
      planillas: editablePlanillas.objetos,
      // lecturaAnterior: lecturaAnterior.value,
      // lecturaActual: lecturaActual.value,
      // tarifaConsumo: tarifaConsumo.value,
      // valorConsumo: valorConsumo.value,
    };
    const datosTotales = {
      subtotal: valorSubtotal.value,
      descuento: valorTotalDescuento.value,
      totalPagar: valorTotalPagar.value,
    };
    console.log("Descuento enviar: " + valorTotalDescuento.value);
    // if (planillaEstado == "Cancelado") {
    //   Swal.fire({
    //     title: "Planilla cancelada",
    //     text:
    //       "Esta planilla ya ha sido cancelada " +
    //       "revisa el comprobante en la ruta del encabezado.",
    //     icon: "info",
    //     iconColor: "green",
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //     confirmButtonColor: "green",
    //   });
    // } else {
    await ipcRenderer.send(
      // "generateFacturaMultiple",
      "generateFacturaMultipleBaucher",
      // datos,
      // encabezado,
      serviciosFijos,
      otrosServicios,
      datosAgua,
      datosTotales,
      planillaCancelar,
      // Cambio
      editados
    );
    // }
  } else {
    console.log("Not planilla selected...");
  }
}
async function recalcularConsumo() {
  if (planillaMedidorSn) {
    // await calcularConsumo();
    await renderConsumos(editablePlanillas);
    console.log("tf-tc: " + totalFinal, totalConsumo);
    let totalRecalculado = totalFinal;
    console.log("totalRecalculado: ", totalRecalculado);
    console.log("Valor consumo: ", valorConsumo.value);
    totalRecalculado += parseFloat(totalConsumo);
    valorSubtotal.value = (totalRecalculado + descuentoFinal).toFixed(2);
    valorTotalPagar.value = totalRecalculado.toFixed(2);
  } else {
    console.log("tf-tc: " + totalFinal, totalConsumo);
    let totalRecalculado = totalFinal;
    console.log("totalRecalculado: " + totalRecalculado);
    console.log("Valor consumo: " + totalConsumo);
    totalRecalculado += parseFloat(totalConsumo);
    valorSubtotal.value = (totalFinal + descuentoFinal).toFixed(2);
    valorTotalPagar.value = totalRecalculado.toFixed(2);
  }
}
// function formatearFecha(fecha) {
//   const fechaOriginal = new Date(fecha);
//   const year = fechaOriginal.getFullYear();
//   const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
//   const day = String(fechaOriginal.getDate()).padStart(2, "0");
//   const fechaFormateada = `${year}-${month}-${day}`;
//   return fechaFormateada;
// }
// Generar Planillas
async function generarPlanilla() {
  console.log("js");
  const result = await ipcRenderer.invoke("createPlanilla");
  console.log(result);
  //getPlanillas();
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
criterioBuscar.addEventListener("change", function () {
  if (criterioBuscar.value == "all") {
    buscarPlanillas();
    criterioContent.value = "";
    criterioContent.readOnly = true;
  } else {
    criterioContent.readOnly = false;
  }
});
btnBuscar.addEventListener("click", function () {
  buscarPlanillas();
});
async function buscarPlanillas() {
  let criterio = criterioBuscar.value;
  let content = criterioContent.value;
  await getPlanillas(criterio, content);
}
const detallesServiciodg = async (servicio) => {
  abonarStatus = true;
  errortextAbono.textContent = "Error";
  errContainer.style.display = "none";
  abonarDg.readOnly = true;
  let aplazable = "No aplazable";
  let cancelados = 0;
  let pendientesCancelar = 0;
  let aplicados = 0;
  let valorCancelado = 0;
  let valorAplicado = 0;
  let valorAbonar = 0;
  let valorSaldo = 0;
  console.log("Servicio al Dg: " + servicio.contratadosId);
  servicioDg.textContent = servicio.nombre;
  descripcionDg.textContent = servicio.descripcion;
  if (servicioDg.aplazableSn === "Si") {
    aplazable = "Aplazable";
  }
  detallesDg.textContent = servicio.tipo + " | " + aplazable;
  subtotalDg.textContent = servicio.subtotal;
  descuentoDg.textContent = servicio.descuento;
  totalDg.textContent = servicio.total;
  numPagosDg.textContent = servicio.numeroPagosIndividual;
  // if (servicio.estadoDetalle !== "Cancelado") {
  //   pendientesCancelar + 1;
  // } else if (servicio.estadoDetalle == "Cancelado") {
  //   cancelados + 1;
  //   valorCancelado += servicio.abono;
  // }
  const pagosAnteriores = await ipcRenderer.invoke(
    "getDetallesByContratadoId",
    servicio.contratadosId
  );
  pagosAnteriores.forEach((pagoAnterior) => {
    if (pagoAnterior !== null || pagoAnterior !== undefined) {
      aplicados++;
      if (pagoAnterior.estado === "Cancelado") {
        valorCancelado += pagoAnterior.abono;
        cancelados++;
      } else {
        valorAplicado += pagoAnterior.abono;
        pendientesCancelar++;
      }
    }
    valorAbonar = pagoAnterior.abono;
    idAgregarAbono = pagoAnterior.id;
  });

  canceladosDg.textContent = cancelados;
  aplicadosDg.textContent = aplicados;
  pendientesDg.textContent = pendientesCancelar;
  valorSaldo = servicio.total - valorCancelado - valorAplicado;
  saldoDg.textContent = valorAplicado;
  saldoAplicarDg.textContent = valorSaldo;
  abonadoDg.textContent = valorCancelado;
  abonarDg.textContent = valorAbonar;
  // if (valorSaldo - valorCancelado < servicio.valorPagos) {
  //   valorAbonar = valorSaldo - valorCancelado;
  // } else {
  //   if (servicio.valorPagos !== null) {
  //     valorAbonar = servicio.valorPagos;
  //   } else {
  //     valorAbonar = valorSaldo - valorCancelado;
  //   }
  // }
  console.log("Abonar: " + valorAbonar);
  if (servicio.tipo !== "Servicio fijo" && servicio.aplazableSn === "Si") {
    abonarDg.readOnly = false;
  }
  abonarDg.value = valorAbonar;
  abonarDg.placeHolder = "" + valorAbonar;
  abonarDg.oninput = () => {
    // Cambio
    ultimoAbono = valorAbonar;
    let abonoMaximo = valorAbonar + valorSaldo;
    let abonoMinimo = valorAbonar;
    if (abonarDg.value < abonoMinimo) {
      abonarStatus = false;
      errContainer.style.display = "flex";
      errortextAbono.textContent =
        "El abono no puede ser menor a " + abonoMinimo;
    } else if (abonarDg.value > abonoMaximo) {
      abonarStatus = false;
      errContainer.style.display = "flex";
      errortextAbono.textContent =
        "El abono no puede ser mayor a " + abonoMaximo;
    } else {
      abonarStatus = true;
      errortextAbono.textContent = "Error";
      errContainer.style.display = "none";
    }
  };
  if (dialogServicios.close) {
    dialogServicios.showModal();
  }
};
function resetForm() {
  planillaForm.reset();
  planillaEdit = {};
  lecturaActualEdit = 0;
  lecturaAnteriorEdit = 0;
  valorConsumoEdit = 0;
  totalFinal = 0.0;
  descuentoFinal = 0;
  totalConsumo = 0.0;
  tarifaAplicada = "Familiar";
  valorTarifa = 2.0;
  calcularConsumoBt.disabled = true;
  editDetalleId = "";
  editPlanillaId = "";
  editContratoId = "";
  fechaEmisionEdit = "";

  editingStatus = false;
  planillaMedidorSn = false;
  // Cambio
  ultimoAbono = 0;
  idAgregarAbono = "";
  lecturasList.innerHTML = "";
  // ----------------------------------------------------------------
  serviciosFijosList.innerHTML = "";
  otrosServiciosList.innerHTML = "";
  otrosAplazablesList.innerHTML = "";
  mostrarLecturas.innerHTML = "";
  mostrarLecturas.innerHTML =
    "No aplica servicio de agua potable" +
    '<i id="collapse" class="fs-3 fa-solid fa-caret-down"></i>';
  contenedorLecturas.style.display = "none";
  collapse.classList.add("fa-caret-down");
  collapse.classList.remove("fa-caret-up");
}
function resetFormAfterUpdate() {
  console.log("resetFormAfterUpdate");
  editPlanilla(editPlanillaId, editContratoId, fechaEmisionEdit);
  recalcularConsumo();
}
cancelarForm.addEventListener("click", function () {
  console.log("Borrando form");
  resetForm();
});

mostrarLecturas.onclick = () => {
  if (contenedorLecturas.style.display == "none") {
    collapse.classList.remove("fa-caret-down");
    collapse.classList.add("fa-caret-up");
    contenedorLecturas.style.display = "flex";
  } else {
    contenedorLecturas.style.display = "none";
    collapse.classList.add("fa-caret-down");
    collapse.classList.remove("fa-caret-up");
  }
};
calcularConsumoBt.onclick = () => {
  lecturaActual.value = lecturaActualEdit;
  lecturaAnterior.value = lecturaAnteriorEdit;
  valorConsumo.value = valorConsumoEdit;
  calcularConsumo();
};
function mostrarFormServicios() {
  console.log("MostrarFormServicios");
  if (dialogServicios.close) {
    dialogServicios.showModal();
  }
}
function CerrarFormServicios() {
  dialogServicios.close();
}

// Transicion entre las secciones de la vista
var btnSeccion1 = document.getElementById("btnSeccion1");
var btnSeccion2 = document.getElementById("btnSeccion2");
var seccion1 = document.getElementById("seccion1");
var seccion2 = document.getElementById("seccion2");

ipcRenderer.on("sesionCerrada", async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Login";
  await ipcRenderer.send("abrirInterface", url, acceso);
});
btnSeccion2.addEventListener("click", function () {
  console.log("btn2");
  seccion2.classList.remove("active");
  seccion1.classList.add("active");
});
init();
// Rercarga comprobantes
ipcRenderer.on("recargaComprobantes", async (event) => {
  console.log("Refrescar");
  await buscarPlanillas();
  resetForm();
});
