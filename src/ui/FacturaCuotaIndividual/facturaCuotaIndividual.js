const fs = require("fs");
const puppeteer = require("puppeteer");
const Swal = require("sweetalert2");
// const pdf = require("html-pdf");
const printer = require("pdf-to-printer");
// const html2pdf = require("html2pdf.js");

const path = require("path");
const { ipcRenderer, ipcMain } = require("electron");
const {
  printSaveBaucherIndividual,
  guardarEnDirectorioSeleccionado,
} = require("../commons/print.funtions");
const {
  agregarCeroAlPrincipio,
  formatearFecha,
} = require("../commons/fechas.functions");
const { getSaldoNoCancelado } = require("../Pagos/pagos-individual.api");
const socioNombres = document.getElementById("socioNombres");
const socioCedula = document.getElementById("socioCedula");
const socioTelefono = document.getElementById("socioTelefono");
const socioDireccion = document.getElementById("socioDireccion");
const contrato = document.getElementById("contrato");
const planilla = document.getElementById("planilla");
const codigoComprobante = document.getElementById("codigoComprobante");
const fechaEmision = document.getElementById("fechaEmision");
const fechaImpresion = document.getElementById("fechaImpresion");
const contratoUbicacion = document.getElementById("ubicacion");
const fechaEmisionPlanilla = document.getElementById("fechaEmisionPlanilla");
const dataAgua = document.getElementById("data-agua");
const dataServicios = document.getElementById("data-servicios");
const lecturaAnterior = document.getElementById("lecturaAnterior");
const lecturaActual = document.getElementById("lecturaActual");
const consumo = document.getElementById("consumo");
const tarifa = document.getElementById("tarifa");
const total = document.getElementById("total");
const subtotal = document.getElementById("subtotal");
const descuento = document.getElementById("descuento");
const totalPagar = document.getElementById("total-pagar");
const detailsList = document.getElementById("servicios-details");
// Variables del formulario de cancelacion
const dialogoCancelacion = document.getElementById("dialog-cancelacion");
const fechaPagoDg = document.getElementById("fechaPago-dg");
const errortextAbono = document.getElementById("errorTextAbono");
const errContainer = document.getElementById("err-container");
// const subtotalDg = document.getElementById("subtotal-dg");
// const descuentoDg = document.getElementById("descuento-dg");
const totalDg = document.getElementById("total-dg");
const SaldoFavorDg = document.getElementById("saldo-favor-dg");
const efectivoDg = document.getElementById("efectivo-dg");
const recibidoDg = document.getElementById("recibido-dg");
const cambioDg = document.getElementById("cambio-dg");
const guardarDg = document.getElementById("btnGuardar-dg");
const entregarDg = document.getElementById("btnEntregar-dg");
const abonarDg = document.getElementById("btnAbonar-dg");
const cerrarDg = document.getElementById("btnCerrar-dg");
// Variables de los elementos de la página
const botonPagar = document.getElementById("botonPagar");
let planillaCancelarId = "";
let encabezadoCancelarId = "";
let serviciosCancelar = [];
let planillaAgrupadaCancelar = [];
let servicioCancelar;
let codigoPlanilla = "";
let contratoId = "";
let codigoGenerado = "";
let socioRuta = "";
let contratoRuta = "";
let subtotalPago = 0;
let descuentoPago = 0;
let totalPago = 0;
let editSocioId = "";
let saldosFavor = {};

async function cerrarFactura() {
  await ipcRenderer.send("cerrarFacturaCuotaIndividual");
  await ipcRenderer.send("recargaComprobantes");
}
document.addEventListener("DOMContentLoaded", () => {
  botonPagar.addEventListener("click", async () => {
    Pagar();
  });
});
ipcRenderer.on("generate-pago-individal", async (event, datos) => {
  console.log("Exitus: ", datos);
  const { encabezado, servicio, abonosExtra } = datos;
  servicioCancelar = servicio;
  contratoId = encabezado.contratoId;
  socioRuta = encabezado.socio;
  contratoRuta = encabezado.contrato;
  //   planillaCancelarId = datosAgua.planillaId;
  //   planillaAgrupadaCancelar = planillaAgrupada;
  //   encabezadoCancelarId = encabezado.encabezadoId;
  //   codigoPlanilla = encabezado.planilla;
  //   editSocioId = encabezado.socioId;
  //   console.log("Socio cancelando: " + editSocioId);
  generarCodigoComprobante();
  const fechaImpresionNode = document.createTextNode(
    formatearFecha(new Date())
  );
  //   const comprobanteEmisionNode = document.createTextNode(
  //     formatearFecha(new Date())
  //   );
  //   fechaEmision.appendChild(comprobanteEmisionNode);
  const codigoComprobanteNode = document.createTextNode(codigoGenerado);
  codigoComprobante.appendChild(codigoComprobanteNode);
  fechaImpresion.appendChild(fechaImpresionNode);
  let nombres = encabezado.socio.replace(/ NA | SN /gi, " ");
  const socioNode = document.createTextNode(nombres);
  socioNombres.appendChild(socioNode);
  const cedulaNode = document.createTextNode(encabezado.cedula);
  socioCedula.appendChild(cedulaNode);
  let numero = agregarCeroAlPrincipio(encabezado.telefono);
  const telefonoNode = document.createTextNode(numero);
  socioTelefono.appendChild(telefonoNode);
  let direccion = encabezado.direccion.replace(
    / NA | SN |, Principal, |Secundaria/gi,
    " "
  );
  const direccionNode = document.createTextNode(direccion);
  socioDireccion.appendChild(direccionNode);
  //   // Datos de la planilla (Cuota)
  const planillaNode = document.createTextNode(
    `${servicio.nombre} (${servicio.descripcion})`
  );
  planilla.appendChild(planillaNode);
  const contratoNode = document.createTextNode(encabezado.contrato);
  contrato.appendChild(contratoNode);
  let ubic = encabezado.ubicacion.replace(
    / SN,| SN|, SN|, Principal, |Secundaria|, 999/gi,
    " "
  );
  const ubicacionNode = document.createTextNode(ubic);
  contratoUbicacion.appendChild(ubicacionNode);
  const fechaNode = document.createTextNode(
    formatearFecha(servicio.fechaEmision)
  );
  fechaEmisionPlanilla.appendChild(fechaNode);

  dataAgua.style.display = "none";
  if (
    abonosExtra.id !== null &&
    abonosExtra.valor > servicio.abono &&
    abonosExtra.id === servicio.id
  ) {
    // Consultar los abonos no cancelados
    // const saldoNoCancelado = await getSaldoNoCancelado(servicio.contratadosId);
    // if (saldoNoCancelado) {
    //   let saldo = 0;
    //   for (const noCancelado of saldoNoCancelado) {
    //     saldo += noCancelado.abono;
    //   }
    //   console.log("Saldo no cancelado", saldo);
    //   let diferencia = abonosExtra.valor - servicio.abono;
    //   servicio.saldo = saldo - abonosExtra.valor;
    //   servicio.abono = abonosExtra.valor;
    //   totalPagar.textContent = "$" + parseFloat(abonosExtra.valor).toFixed(2);
    // } else {
      let diferencia = abonosExtra.valor - servicio.abono;
      servicio.saldo = servicio.saldo - diferencia;
      servicio.abono = abonosExtra.valor;
      totalPagar.textContent = "$" + parseFloat(abonosExtra.valor).toFixed(2);
    // }
  } else {
    totalPagar.textContent = "$" + parseFloat(servicio.abono).toFixed(2);
  }
  renderDetalles(servicio);
});

function renderDetalles(servicio) {
  serviciosCancelar.push(servicio);
  console.log("Servicios a cancelar: " + serviciosCancelar);

  if (
    servicio.nombre !== "Socio comuna" &&
    servicio.estadoDetalles !== "Anulado"
  ) {
    detailsList.innerHTML += `
  <tr>
  <td>${servicio.nombre}</td>
    <td style="display:none;">${servicio.descripcion}</td>
    <td     style="
    text-align: center;
    padding: 5px;
    
    font-size: 15px;
  ">${parseFloat(servicio.total).toFixed(2)}</td>
    <td     
    style="
    display:none;
    text-align: center;
    padding: 5px;
    font-size: 15px;
  ">${parseFloat(servicio.descuento).toFixed(2)}</td>
    <td     style="
    text-align: center;
    padding: 5px;
    
    font-size: 15px;
  ">${parseFloat(servicio.abono).toFixed(2)}</td>
      <td     style="
    text-align: center;
    padding: 5px;

    font-size: 15px;
  ">${parseFloat(servicio.saldo).toFixed(2)}</td>
 </tr>
    `;
  }
}
const cancelarServicios = async (servicioCancelar, comprobante) => {
  console.log("Enviar a cancelar: " + servicioCancelar + " " + comprobante);
  await ipcRenderer.invoke(
    "cancelarCuotaIndividual",
    servicioCancelar,
    comprobante
  );
};
const generarCodigoComprobante = () => {
  if (contratoId !== "") {
    const timestamp = Date.now();
    const codigoUnico = `${timestamp}`;
    // codigoGenerado = codigoPlanilla + "" + codigoUnico;
    codigoGenerado = (contratoId + "" + codigoUnico).padStart(30, "0");
    console.log("Codigo generado: ", codigoGenerado);
    return codigoGenerado;
  } else {
    return null;
  }
};
ipcRenderer.on("Notificar", (event, response) => {
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
async function Pagar() {
  await guardarEnDirectorioSeleccionado(codigoGenerado).then(async (result) => {
    if (result) {
      console.log(result);
      const newComprobante = {
        codigo: codigoGenerado,
        fechaEmision: formatearFecha(new Date()),
        rutaLocal: result,
        estado: "Vigente",
        // Asegurarse de que funciona realmente !!
        planillas: JSON.stringify(servicioCancelar),
        // fechaAnulacion:
        // motivoAnulacio:
      };
      console.log("Servicio a imprimir: ", servicioCancelar);
      await cancelarServicios(servicioCancelar, newComprobante);
      await cerrarFactura();
    }
  });
}
ipcRenderer.on("ResultadoPago", async (event, response) => {
  console.log("Response: " + response);
  if (response.success) {
    // Configura las opciones para la generación de PDF
    const scale = 0.9;
    const scaleX = 0.9; // Escala en el eje X (80%)
    const scaleY = 0.9; // Escala en el eje Y (120%)

    const pdfOptions = {
      path: "X:/FacturasSCAP/respaldo.pdf", // Nombre del archivo PDF de salida
      format: "A6", // Formato de página
      width: "80mm",
      height: "297mm",
      scale: scale,
      lanscape: true,
      margin: {
        top: "2mm",
        bottom: "2mm",
        left: "1mm",
        right: "2mm",
      },
    };
    //cobrosAlDg();
    await guardarEnDirectorioSeleccionado(codigoComprobante);
    // Swal.fire({
    //   title: response.title,
    //   text: response.message,
    //   icon: "success",
    //   confirmButtonColor: "#f8c471",
    // });
  }
  //else {
  // Swal.fire({
  //   title: response.title,
  //   text: response.message,
  //   icon: "error",
  //   confirmButtonColor: "#f8c471",
  // });
  //}
});
async function cancelarFactura() {
  await ipcRenderer.send("cerrarFactura");
}
const abrirPagos = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Pagos";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
