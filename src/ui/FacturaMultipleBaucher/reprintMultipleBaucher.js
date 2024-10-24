// const fs = require("fs");
// const puppeteer = require("puppeteer");
// const pdf = require("html-pdf");
// const printer = require("pdf-to-printer");
// const html2pdf = require("html2pdf.js");
const Swal = require("sweetalert2");
const path = require("path");
const { ipcRenderer, ipcMain } = require("electron");
const {
  formatearFecha,
  agregarCeroAlPrincipio,
} = require("../../ui/commons/fechas.functions");
const {
  guardarEnDirectorioSeleccionado,
  reprintBaucher,
} = require("../commons/print.funtions");
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
const consumosList = document.getElementById("consumos");
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
const boton = document.getElementById("btn-print");
const btnCancel = document.getElementById("btn-cancel");
let enviar = false;
let aguaSn = false;
let planillaCancelarId = "";
let planillasIds = [];
let encabezadoCancelarId = "";
let serviciosCancelar = [];
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
let tarifaAplicada = "Familiar";
let valorTarifa = 2.0;
let tarifasDisponibles = [];
let planillaCancelar = [];
let editadosCancelar = [];

async function cerrarFactura() {
  await ipcRenderer.send("cerrarFacturaMultiple");
  await ipcRenderer.send("recargaComprobantes");
}
document.addEventListener("DOMContentLoaded", () => {
  boton.addEventListener("click", async () => {
    Pagar();
  });
});
ipcRenderer.on(
  "reprintFacturaMultiple",
  async (
    event,
    // serviciosFijos,
    // otrosServicios,
    // datosAgua,
    // datosTotales,
    planilla,
    codigoComprobanteExistente,
    fechaComprobanteExistente
  ) => {
    // Preparar datos para el voucher
    const serviciosFijos = [];
    const otrosServicios = [];
    const datosAgua = [];
    const datosTotales = {
      subtotal: 0,
      descuento: 0,
      totalPagar: 0,
    };
    if (planilla.objetos.length > 0) {
      datosAgua.push(planilla.objetos);
    }
    for (const servicio of planilla.servicios) {
      if (servicio.tipo === "Servicio fijo") {
        serviciosFijos.push(servicio);
        datosTotales.subtotal += servicio.subtotal;
        datosTotales.totalPagar += servicio.total;
        datosTotales.descuento += servicio.descuento;
      } else if (servicio.tipo === "Cuota") {
        otrosServicios.push(servicio);
        datosTotales.subtotal += servicio.subtotal;
        datosTotales.totalPagar += servicio.abono;
        datosTotales.descuento += servicio.descuento;
      }
    }
    console.log("Llego Petición");
    // Datos recibidos
    // console.log(datosAgua);
    // planillasIds = datosAgua.planillasId;
    planillaCancelar = planilla;
    // editadosCancelar = editados;
    // contratoId = planilla.contratoId;
    // editSocioId = planilla.sociosId;
    // console.log("Socio cancelando: " + editSocioId);
    socioRuta = planilla.nombre;
    await generarCodigoComprobante();
    const fechaImpresionNode = document.createTextNode(
      formatearFecha(new Date())
    );
    // Esta fecha debe venir del comprobante existente
    const comprobanteEmisionNode = document.createTextNode(
      formatearFecha(fechaComprobanteExistente)
    );
    fechaEmision.appendChild(comprobanteEmisionNode);
    // Codigo del comprobante existente
    const codigoComprobanteNode = document.createTextNode(
      codigoComprobanteExistente
    );
    codigoComprobante.appendChild(codigoComprobanteNode);
    fechaImpresion.appendChild(fechaImpresionNode);
    let nombres = planilla.nombre.replace(/ NA | SN /gi, " ");
    const socioNode = document.createTextNode(nombres);
    socioNombres.appendChild(socioNode);
    const cedulaNode = document.createTextNode(planilla.cedula);
    socioCedula.appendChild(cedulaNode);
    let numero = agregarCeroAlPrincipio(planilla.telefono);
    const telefonoNode = document.createTextNode(numero);
    socioTelefono.appendChild(telefonoNode);
    let direccion = planilla.direccion.replace(
      / NA | SN |, Principal, |Secundaria/gi,
      " "
    );
    const direccionNode = document.createTextNode(direccion);
    socioDireccion.appendChild(direccionNode);
    // Datos de la planilla

    const contratoNode = document.createTextNode(planilla.codigo);
    contrato.appendChild(contratoNode);
    let ubic = planilla.ubicacion.replace(
      / SN,| SN|, SN|, Principal, |Secundaria|, 999/gi,
      " "
    );
    const ubicacionNode = document.createTextNode(ubic);
    contratoUbicacion.appendChild(ubicacionNode);
    if (planilla.fechasEmision.length > 1) {
      const fechaNode = document.createTextNode(
        planilla.fechasEmision[0] +
          " a " +
          planilla.fechasEmision[planilla.fechasEmision.length - 1]
      );
      fechaEmisionPlanilla.appendChild(fechaNode);
    } else {
      const fechaNode = document.createTextNode(planilla.fechasEmision[0]);
      fechaEmisionPlanilla.appendChild(fechaNode);
    }

    if (
      Object.keys(serviciosFijos).length > 0 &&
      serviciosFijos !== undefined
    ) {
      serviciosFijos.forEach(async (servicioFijo) => {
        console.log("En for: ", servicioFijo.nombre);
        if (servicioFijo.nombre === "Agua Potable") {
          aguaSn = true;
          console.log("Tiene agua");
          //   serviciosCancelar.push(servicioFijo);
          let consumosStyle =
            "padding:1.5px;border-bottom: 1px solid #ccc;font-size: 15px;text-align: center;";

          for (const consumos of datosAgua) {
            const trConsumos = document.createElement("tr");
            const tdFecha = document.createElement("td");
            tdFecha.textContent = formatearFecha(
              new Date(consumos.fechaEmision)
            );
            tdFecha.style = consumosStyle;
            trConsumos.append(tdFecha);
            const tdAnterior = document.createElement("td");
            tdAnterior.textContent = consumos.lecturaAnterior;
            tdAnterior.style = consumosStyle;
            const tdActual = document.createElement("td");
            tdActual.textContent = consumos.lecturaActual;
            tdActual.style = consumosStyle;
            const tdConsumo = document.createElement("td");
            tdConsumo.style = consumosStyle;
            const datosConsumo = await calcularConsumos(
              consumos.lecturaActual,
              consumos.lecturaAnterior,
              consumos.tarifa
            );
            tdConsumo.textContent = datosConsumo.consumo;
            const tdTarifa = document.createElement("td");
            tdTarifa.textContent =
              datosConsumo.tarifa.substring(0, 3) +
              "($" +
              datosConsumo.tarifaValor +
              ")";
            tdTarifa.style = consumosStyle;
            const tdValor = document.createElement("td");
            tdValor.textContent = datosConsumo.valor;
            tdValor.style = consumosStyle;
            trConsumos.append(tdAnterior);
            trConsumos.append(tdActual);
            trConsumos.append(tdConsumo);
            trConsumos.append(tdTarifa);
            trConsumos.append(tdValor);
            consumosList.appendChild(trConsumos);
          }
          //   lecturaAnterior.textContent = datosAgua.lecturaAnterior;
          //   lecturaActual.textContent = datosAgua.lecturaActual;
          //   consumo.textContent =
          //     datosAgua.lecturaActual - datosAgua.lecturaAnterior;
          //   tarifa.textContent = datosAgua.tarifaConsumo;
          //   total.textContent = datosAgua.valorConsumo;
        } else {
          renderDetalles(servicioFijo);
        }
      });
      if (!aguaSn) {
        dataAgua.style.display = "none";
      }
    }
    if (otrosServicios !== null && otrosServicios !== undefined) {
      otrosServicios.forEach(async (otroServicio) => {
        // ** Cambio
        // console.log("Editados: ", editados);
        // const servicioEditado = await editados.find(
        //   (editado) => editado.id === otroServicio.id
        // );
        // if (servicioEditado) {
        //   console.log(`Se encontró un objeto con el ID ${otroServicio.id}`);
        //   console.log("Abono Agregado: " + servicioEditado.valor);
        //   console.log("Total: " + otroServicio.total);
        //   console.log("Saldo: " + otroServicio.saldo);
        //   otroServicio.abono = otroServicio.abono + servicioEditado.valor;
        //   otroServicio.saldo = otroServicio.total - otroServicio.abono;
        // } else {
        //   console.log(`No se encontró un objeto con el ID ${otroServicio.id}`);
        // }
        renderDetalles(otroServicio);
      });
    }
    subtotal.textContent = "$" + datosTotales.subtotal;
    if (datosTotales.subtotal !== undefined) {
      subtotalPago = datosTotales.totalPagar;
    }
    descuento.textContent = "$" + datosTotales.descuento;
    console.log("Descuento recibido: " + datosTotales.descuento);
    if (datosTotales.descuento !== undefined) {
      descuentoPago = datosTotales.descuento;
    }
    totalPagar.textContent =
      "$" + parseFloat(datosTotales.totalPagar).toFixed(2);
    if (datosTotales.totalPagar !== undefined) {
      totalPago = datosTotales.totalPagar;
    }
  }
);
async function getTarifasDisponibles() {
  tarifasDisponibles = await ipcRenderer.invoke("getTarifas");
  console.log("Tartifas disponibles :", tarifasDisponibles);
}
async function calcularConsumos(lecturaActual, lecturaAnterior, tarifaActual) {
  await getTarifasDisponibles();
  console.log("Consultando tarifas ...");
  // totalConsumo = 0;
  let valoresConsumo = 0;
  if (tarifaActual === "Sin consumo") {
    // totalConsumo += parseFloat(0);
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
    // totalConsumo += parseFloat(valorTarifa);
  } else {
    valoresConsumo += (consumo - limitebase) * valorTarifa;
    // totalConsumo += valoresConsumo + base;
    // valorConsumo.value = (totalConsumo + base).toFixed(2);
  }
  // valorConsumo.value = (totalConsumo + base).toFixed(2);
  //   tarifaConsumo.value = tarifaAplicada + "($" + valorTarifa + ")";
  console.log("Tarifa: " + tarifaAplicada + "(" + valorTarifa + ")");
  const datosConsumo = {
    consumo: consumo,
    tarifa: tarifaAplicada.trim() + "($" + valorTarifa + ")",
    valor: (valoresConsumo + base).toFixed(2),
    tarifaValor: valorTarifa,
  };
  return datosConsumo;
}

function renderDetalles(servicio) {
  serviciosCancelar.push(servicio);
  console.log("Servicios a cancelar: " + serviciosCancelar);
  // contratosList.innerHTML = "";
  // datosContratos.forEach((contrato) => {
  if (
    servicio.nombre !== "Socio comuna" &&
    servicio.estadoDetalles !== "Anulado"
  ) {
    detailsList.innerHTML += `
  <tr>
  <td>${" (" + servicio.index + ")" + servicio.nombre}</td>
    <td style="display:none;">${servicio.descripcion}</td>
    <td     style="
    text-align: center;
    padding: 5px;  
    font-size: 15px;
  ">${parseFloat(servicio.total).toFixed(2)}</td>
    <td     style="
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
  // });
}

const generarCodigoComprobante = async () => {
  if (contratoId !== "") {
    const timestamp = Date.now();
    const codigoUnico = `${timestamp}`;
    codigoGenerado = (contratoId + "" + codigoUnico).padStart(33, "0");
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
  await reprintBaucher().then(async () => {
    // if (result) {
    //   console.log(result);
    //   await cancelarServiciosMultiples(
    //     planillaCancelar,
    //     newComprobante,
    //     editadosCancelar
    //   );
    await cerrarFactura();
    // }
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
    await guardarEnDirectorioSeleccionado(pdfOptions);
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
// Cerrar la facturaMultiple
btnCancel.addEventListener("click", () => {});
async function cancelarFactura() {
  await ipcRenderer.send("cerrarFacturaMultiple");
  await ipcRenderer.send("recargaComprobantes");
}
