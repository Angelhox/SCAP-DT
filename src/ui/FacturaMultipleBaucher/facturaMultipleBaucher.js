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
let allTarifasDisponibles = [];
let tarifasEspecialesDisponibles = [];
let tarifasDisponibles = [];
let planillaCancelar = [];
let editadosCancelar = [];
// Función para guardar el archivo PDF en la carpeta seleccionada
// async function guardarEnDirectorioSeleccionado(pdfOptions, pdfBaucherOptions) {
//   const content = document.querySelector(".invoice");
//   try {
//     const directorioSeleccionado = await ipcRenderer.invoke("selectDirectory");
//     const nombreRuta = codigoGenerado;
//     console.log("Codigo generado: " + nombreRuta);
//     if (directorioSeleccionado) {
//       if (nombreRuta !== null) {
//         const rutaCompleta = path.join(
//           directorioSeleccionado,
//           "/Respaldos/" +
//             socioRuta +
//             "/" +
//             contratoRuta +
//             "/" +
//             nombreRuta +
//             ".pdf"
//         );
//         pdfOptions.path = rutaCompleta;
//         // Extraer la ruta de la carpeta
//         const folderPath = path.dirname(pdfOptions.path);
//         // Verificar si la carpeta existe
//         if (!fs.existsSync(folderPath)) {
//           // La carpeta no existe, crearla
//           fs.mkdirSync(folderPath, { recursive: true });
//         }
//         try {
//           const chromePath =
//             "C:/Program Files/Google/Chrome/Application/chrome.exe";

//           const browser = await puppeteer.launch({
//             executablePath: chromePath,
//             // Otras opciones de configuración si es necesario
//           });

//           // Crea una instancia de navegador
//           // const browser = await puppeteer.launch();
//           const page = await browser.newPage();
//           const baucher = await browser.newPage();
//           // Agrega un manejador para los mensajes de la consola
//           page.on("console", (msg) => {
//             console.log(`Mensaje de la consola: ${msg.text()}`);
//           });

//           // Contenido HTML que deseas convertir en PDF
//           await page.setContent(content.outerHTML);
//           await baucher.setContent(content.outerHTML);
//           // Genera el PDF
//           await page.emulateMediaType("screen");
//           await baucher.pdf({
//             path: "C:/Users/Use/Documents/jaaps-temporal-print.pdf",
//             //   format: pdfOptions.format,
//             width: pdfBaucherOptions.width,
//             scale: pdfBaucherOptions.scale,
//             height: pdfBaucherOptions.height,
//             margin: pdfBaucherOptions.margin,
//           });
//           await page
//             .pdf({
//               path: pdfOptions.path,
//               format: pdfOptions.format,
//               width: pdfOptions.width,
//               scale: pdfOptions.scale,
//               height: pdfOptions.height,
//               margin: pdfOptions.margin,
//             })
//             .then(async () => {
//               console.log(`El PDF se guardó en: ${rutaCompleta}`);
//               //   for (const planillas of planillaCancelar.objetos) {
//               //    let fechaFiltro=planillas.formatearFecha(planillas.fechaEmision);

//               const newComprobante = {
//                 codigo: codigoGenerado,
//                 fechaEmision: formatearFecha(new Date()),
//                 rutaLocal: rutaCompleta,
//                 estado: "Vigente",
//                 // Asegurarse de que funciona realmente !!
//                 // planillas: JSON.stringify(planillaCancelar),

//                 // fechaAnulacion:
//                 // motivoAnulacio:
//               };
//               console.log("Planilla a imprimir: ", planillaCancelar);
//               await cancelarServiciosMultiples(
//                 planillaCancelar,
//                 newComprobante,
//                 editadosCancelar
//               );
//               //   }
//               await ipcRenderer.send(
//                 "PrintBaucher",
//                 // "C:/Users/Usuario/Documents/dos.pdf",
//                 "C:/Users/USE/Documents/jaaps-temporal-print.pdf"
//               );
//               // Impresión exitosa
//               console.log("El PDF se ha enviado a la cola de impresión.");
//             })
//             .catch((error) => {
//               // Error de impresión
//               console.error("Error al imprimir el PDF:", error);
//             });
//           // Cierra el navegador
//           await browser.close();
//           console.log("PDF generado y guardado correctamente.");
//           await cerrarFactura();
//         } catch (error) {
//           console.error("Error al generar el PDF:", error);
//         }
//       } else {
//         console.log("Ruta no definida");
//       }
//     } else {
//       console.log("El usuario canceló la selección de directorio.");
//     }
//   } catch (error) {
//     console.error("Error al generar el comprobante:", error);
//   }
// }
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
  "generateFacturaMultiple",
  async (
    event,
    serviciosFijos,
    otrosServicios,
    datosAgua,
    datosTotales,
    planilla,
    editados
  ) => {
    console.log("Llego Petición");
    // Datos recibidos
    console.log(datosAgua);
    planillasIds = datosAgua.planillasId;
    planillaCancelar = planilla;
    editadosCancelar = editados;
    // encabezadoCancelarId = encabezado.encabezadoId;
    contratoId = planilla.contratoId;
    editSocioId = planilla.sociosId;
    console.log("Socio cancelando: " + editSocioId);
    socioRuta = planilla.nombre;
    // contratoRuta = encabezado.contrato;
    await generarCodigoComprobante();
    const fechaImpresionNode = document.createTextNode(
      formatearFecha(new Date())
    );
    const comprobanteEmisionNode = document.createTextNode(
      formatearFecha(new Date())
    );
    fechaEmision.appendChild(comprobanteEmisionNode);
    const codigoComprobanteNode = document.createTextNode(codigoGenerado);
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
    // const planillaNode = document.createTextNode(encabezado.planilla);
    // planilla.appendChild(planillaNode);
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

          for (const consumos of datosAgua.planillas) {
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
              consumos.tarifa,
              formatearFecha(consumos.fechaEmision),
              consumos.tipo
            );
            tdConsumo.textContent = datosConsumo.consumo;
            const tdTarifa = document.createElement("td");
            if (datosConsumo.tarifa.includes("especial")) {
              let tarifaSinEspecial = datosConsumo.tarifa.replace(
                "especial",
                ""
              );
              tdTarifa.textContent =
                tarifaSinEspecial.substring(0, 11) +
                "($" +
                datosConsumo.tarifaValor +
                ")";
            } else {
              tdTarifa.textContent =
                datosConsumo.tarifa.substring(0, 14) +
                "($" +
                datosConsumo.tarifaValor +
                ")";
            }
            // tdTarifa.textContent =
            //   datosConsumo.tarifa.substring(0, 14) +
            //   "($" +
            //   datosConsumo.tarifaValor +
            //   ")";

            // --------------------
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
        console.log("Editados: ", editados);
        const servicioEditado = await editados.find(
          (editado) => editado.id === otroServicio.id
        );
        if (servicioEditado) {
          console.log(`Se encontró un objeto con el ID ${otroServicio.id}`);
          console.log("Abono Agregado: " + servicioEditado.valor);
          console.log("Total: " + otroServicio.total);
          console.log("Saldo: " + otroServicio.saldo);
          otroServicio.abono = otroServicio.abono + servicioEditado.valor;
          otroServicio.saldo = otroServicio.total - otroServicio.abono;
        } else {
          console.log(`No se encontró un objeto con el ID ${otroServicio.id}`);
        }
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
  // tarifasDisponibles = await ipcRenderer.invoke("getTarifas");
  allTarifasDisponibles = await ipcRenderer.invoke("getTarifas");
  tarifasDisponibles = allTarifasDisponibles.filter(
    (tarifa) => tarifa.tipo === "comun"
  );
  tarifasEspecialesDisponibles = allTarifasDisponibles.filter(
    (tarifa) => tarifa.tipo === "especial"
  );
  tarifasDisponibles.forEach((tarifa) => {
    tarifa.inicioVigencia = formatearFecha(tarifa.inicioVigencia);
    tarifa.finVigencia = formatearFecha(tarifa.finVigencia);
  });
  tarifasEspecialesDisponibles.forEach((tarifa) => {
    tarifa.inicioVigencia = formatearFecha(tarifa.inicioVigencia);
    tarifa.finVigencia = formatearFecha(tarifa.finVigencia);
  });
  console.log("Tartifas disponibles :", tarifasDisponibles);
  console.log(
    "Tartifas especiales disponibles :",
    tarifasEspecialesDisponibles
  );
}
async function calcularConsumos(
  lecturaActual,
  lecturaAnterior,
  tarifaActual,
  fecha = "2025-01-01",
  tipo
) {
  console.log("Tipo recibido: ", tipo);
  await getTarifasDisponibles();
  let tarifasCalculoConsumo = [];
  if (tipo === "especial") {
    tarifasCalculoConsumo = tarifasEspecialesDisponibles.filter(
      (tarifa) => fecha >= tarifa.inicioVigencia && fecha <= tarifa.finVigencia
    );
  } else {
    tarifasCalculoConsumo = tarifasDisponibles.filter(
      (tarifa) => fecha >= tarifa.inicioVigencia && fecha <= tarifa.finVigencia
    );
  }
  console.log("Tarifas: ", tarifasDisponibles);
  console.log("Tarifas especiales: ", tarifasEspecialesDisponibles);
  console.log("Tarifas rango: ", tarifasCalculoConsumo);
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
  if (tarifasCalculoConsumo.length > 0) {
    tarifasCalculoConsumo.forEach((tarifa) => {
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
      if (tarifa.tarifa == "Familiar" || tarifa.tarifa == "Familiar especial") {
        base = tarifa.valor;
        limitebase = tarifa.hasta;
        console.log("Bases: ", base + "|" + limitebase);
      }
    });
  }

  if (tarifaAplicada === "Familiar" || tarifaAplicada === "Familiar especial") {
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
async function cobrosAlDg() {
  efectivoDg.focus();
  fechaPagoDg.innerHTML = ``;
  totalDg.innerHTML = ``;
  errContainer.style.display = "none";
  let saldoAFavor = 0;
  console.log("MostrarFormCancelacion");
  let fechaPago = formatearFecha(new Date());
  const fechaTitle = document.createElement("p");
  fechaTitle.textContent = "Fecha de pago:";
  const fechaEspace = document.createElement("p");
  fechaEspace.textContent = "-";
  fechaEspace.classList = "trans mp-0";
  const fechaPagovalue = document.createElement("p");
  fechaPagovalue.textContent = fechaPago;
  fechaPagovalue.classList = "mp-0";
  fechaPagoDg.appendChild(fechaTitle);
  fechaPagoDg.appendChild(fechaEspace);
  fechaPagoDg.appendChild(fechaPagovalue);
  // subtotalDg.textContent = parseFloat(subtotalPago).toFixed(2);
  // descuentoDg.textContent = parseFloat(descuentoPago).toFixed(2);
  const totalTitle = document.createElement("p");
  totalTitle.textContent = "Total:";
  const totalEspace = document.createElement("p");
  totalEspace.textContent = "-";
  totalEspace.classList = "trans mp-0";
  const totalValue = document.createElement("p");
  totalValue.textContent = parseFloat(totalPago).toFixed(2);
  totalDg.appendChild(totalTitle);
  totalDg.appendChild(totalEspace);
  totalDg.appendChild(totalValue);
  await getSaldoAFavor(editSocioId);
  console.log("Saldo obteido: ", saldosFavor);
  if (saldosFavor.total !== undefined) {
    saldoAFavor = saldosFavor.total;
  }
  SaldoFavorDg.textContent = parseFloat(saldoAFavor).toFixed(2);
  if (SaldoFavorDg.textContent !== "") {
    evaluarRecibidos();
  }
  if (dialogoCancelacion.close) {
    dialogoCancelacion.showModal();
  }
}
efectivoDg.addEventListener("input", function () {
  evaluarRecibidos();
});
function evaluarRecibidos() {
  let totalRecibido = 0;
  let totalEfectivo = 0;
  let totalSaldofavor = 0;
  let cambio = 0;
  if (saldosFavor.total) {
    totalSaldofavor = parseFloat(saldosFavor.total);
  }
  if (efectivoDg.value !== "") {
    totalEfectivo = parseFloat(efectivoDg.value);
  }
  totalRecibido = (totalEfectivo + totalSaldofavor).toFixed(2);
  recibidoDg.textContent = totalRecibido;
  console.log("Total pagar: " + totalPago);
  cambioDg.textContent = (totalRecibido - totalPago).toFixed(2);
  if (totalRecibido - totalPago < 0) {
    cambioDg.textContent = parseFloat(0).toFixed(2);
    enviar = false;
    errContainer.style.display = "block";
    errortextAbono.textContent =
      "El total recibido no debe ser menor al total a pagar";
    deshabilitarCambio();
  } else {
    enviar = true;
    errContainer.style.display = "none";
    habilitarCambio();
  }
}
entregarDg.addEventListener("click", function () {
  let saldoFavorOcupado = 0;
  let efectivoOcupado = 0;
  if (enviar) {
    Swal.fire({
      title: "Confirmar acción!",
      text: "El cambio se entrega al usuario y el valor de la planilla sera cancelada.",
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
        if (saldosFavor.total > 0) {
          console.log("Saldo favor es > 0");
          saldoFavorOcupado = saldosFavor.total;
          // saldoFavorOcupado =
          //   saldosFavor.total - (saldosFavor.total - totalPago);
          if (saldoFavorOcupado < totalPago) {
            console.log("Saldo favor no alcanza");
            saldoFavorOcupado = saldosFavor.total;
            // efectivoOcupado = efectivoRecibido + saldoFavorOcupado - totalPago;
          }
        }
        console.log("Paying wait...", saldoFavorOcupado, efectivoOcupado);
        const result = await ipcRenderer.invoke(
          "updateEstadoCuenta",
          saldoFavorOcupado,
          efectivoOcupado,
          editSocioId
        );
        console.log(result);
      }
    });
  } else {
    console.log("Enviar: " + enviar);
  }
});
abonarDg.addEventListener("click", function () {
  let saldoFavorOcupado = 0;
  let efectivoRecibido = 0;
  let efectivoOcupado = 0;
  if (efectivoDg.value !== "") {
    efectivoRecibido = efectivoDg.value;
  }
  if (enviar) {
    Swal.fire({
      title: "Confirmar acción!",
      text: "El cambio se abona en la cuenta del usuario y el valor de la planilla sera cancelado.",
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
        if (saldosFavor.total > 0) {
          console.log("Saldo favor es > 0");
          saldoFavorOcupado = saldosFavor.total;
          // parseFloat(saldosFavor.total) -
          // (parseFloat(saldosFavor.total) - parseFloat(totalPago));
          if (saldoFavorOcupado < totalPago) {
            console.log("Saldo favor no alcanza");
            saldoFavorOcupado = saldosFavor.total;
            efectivoOcupado += parseFloat(efectivoRecibido);
            efectivoOcupado += parseFloat(saldoFavorOcupado);
            efectivoOcupado -= parseFloat(totalPago);
          } else {
            let saldoCobrado =
              parseFloat(saldoFavorOcupado) - parseFloat(totalPago);
            saldoFavorOcupado -= saldoCobrado;
          }
        } else {
          console.log("Saldo favor es = 0");
          console.log("recibido: " + efectivoRecibido);
          console.log("Saldo ocupado: " + saldoFavorOcupado);
          console.log("Total pago: " + totalPago);
          // efectivoOcupado =( efectivoRecibido + saldoFavorOcupado) - totalPago;
          efectivoOcupado += parseFloat(efectivoRecibido);
          efectivoOcupado += parseFloat(saldoFavorOcupado);
          efectivoOcupado -= parseFloat(totalPago);
        }
        console.log("Paying wait...", saldoFavorOcupado, efectivoOcupado);
        const result = await ipcRenderer.invoke(
          "updateEstadoCuenta",
          saldoFavorOcupado,
          efectivoOcupado,
          editSocioId
        );
        console.log(result);
      }
    });
  }
});
cerrarDg.addEventListener("click", function () {
  dialogoCancelacion.close();
});
function deshabilitarCambio() {
  entregarDg.disabled = true;
  abonarDg.disabled = true;
}
function habilitarCambio() {
  entregarDg.disabled = false;
  abonarDg.disabled = false;
}
async function getSaldoAFavor(socioId) {
  console.log("Socio saldos: " + socioId);
  const saldos = await ipcRenderer.invoke("getSaldosAFavor", socioId);
  saldosFavor.total = saldos.total;
  saldosFavor.entradas = saldos.entradas;
  saldosFavor.salidas = saldos.salidas;
  // console.log("Saldo: " + saldos.total);
  return saldosFavor;
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
const cancelarServiciosMultiples = async (
  planillaCancelar,
  comprobante,
  editadosCancelar
) => {
  console.log("Enviar a cancelar: ", planillaCancelar);
  await ipcRenderer.invoke(
    "cancelarServiciosMultiples",
    planillaCancelar,
    comprobante,
    editadosCancelar
  );
};
const cancelarServicios = async (
  planillaCancelarId,
  servicios,
  encabezadoCancelarId,
  comprobante
) => {
  console.log(
    "Enviar a cancelar: " + encabezadoCancelarId + " " + planillaCancelarId
  );
  await ipcRenderer.invoke(
    "cancelarServicios",
    planillaCancelarId,
    encabezadoCancelarId,
    serviciosCancelar,
    comprobante
  );
};
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
  await guardarEnDirectorioSeleccionado(codigoGenerado).then(async (result) => {
    if (result) {
      console.log(result);
      const newComprobante = {
        codigo: codigoGenerado,
        fechaEmision: formatearFecha(new Date()),
        rutaLocal: result,
        estado: "Vigente",
        // Asegurarse de que funciona realmente !!
        planillas: JSON.stringify(planillaCancelar),
        // fechaAnulacion:
        // motivoAnulacio:
      };
      console.log("Planilla a imprimir: ", planillaCancelar);
      await cancelarServiciosMultiples(
        planillaCancelar,
        newComprobante,
        editadosCancelar
      );
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
