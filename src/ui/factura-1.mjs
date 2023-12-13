const fs = require("fs");
const puppeteer = require("puppeteer");
const Swal = require("sweetalert2");
// const pdf = require("html-pdf");
const printer = require("pdf-to-printer");
// const html2pdf = require("html2pdf.js");
// const PDFDocument = require("pdfjs-dist");
// import PDFDocument from 'pdfjs-dist/build/pdf';

const path = require("path");
const { ipcRenderer } = require("electron");
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
const boton = document.getElementById("boton");
let enviar = false;
let aguaSn = false;
let planillaCancelarId = "";
let encabezadoCancelarId = "";
let serviciosCancelar = [];
let codigoPlanilla = "";
let codigoGenerado = "";
let socioRuta = "";
let contratoRuta = "";
let subtotalPago = 0;
let descuentoPago = 0;
let totalPago = 0;
let editSocioId = "";
let saldosFavor = {};
// Función para guardar el archivo PDF en la carpeta seleccionada
async function guardarEnDirectorioSeleccionado(pdfOptions) {
  const content = document.querySelector(".invoice");
  try {
    const directorioSeleccionado = await ipcRenderer.invoke("selectDirectory");
    const nombreRuta = codigoGenerado;
    console.log("Codigo generado: " + nombreRuta);
    if (directorioSeleccionado) {
      if (nombreRuta !== null) {
        const rutaCompleta = path.join(
          directorioSeleccionado,
          "/Respaldos/" +
            socioRuta +
            "/" +
            contratoRuta +
            "/" +
            nombreRuta +
            ".pdf"
        );
        // const halfPageHeight = "148.5mm"; // Mitad de la altura de una página A4 (297mm / 2)
        // pdfOptions.margin.top = halfPageHeight; // Ajusta el margen superior
        // pdfOptions.pageRanges = "2"; // Imprime solo la segunda página (la mitad inferior)
        pdfOptions.path = rutaCompleta;
        // Extraer la ruta de la carpeta
        const folderPath = path.dirname(pdfOptions.path);
        // Verificar si la carpeta existe
        if (!fs.existsSync(folderPath)) {
          // La carpeta no existe, crearla
          fs.mkdirSync(folderPath, { recursive: true });
        }
        try {
          const chromePath =
            "C:/Program Files/Google/Chrome/Application/chrome.exe";

          const browser = await puppeteer.launch({
            executablePath: chromePath,
          });
          // Crea una instancia de navegador
          const page = await browser.newPage();

          page.on("console", (msg) => {
            console.log(`Mensaje de la consola: ${msg.text()}`);
          });

          await page.setContent(content.outerHTML);
          await page.addStyleTag({
            content: `
          body {
           margin:0;
           padding:0;
           background-color:black;
          }
        `,
          });
          // Genera el PDF
          await page
            .pdf({
              path: pdfOptions.path,
              format: pdfOptions.format,
              width: pdfOptions.width,
              scale: pdfOptions.scale,
              height: pdfOptions.height,
              margin: pdfOptions.margin,
            })
            .then(async () => {
              console.log(`El PDF se guardó en: ${rutaCompleta}`);
              const newComprobante = {
                codigo: codigoGenerado,
                fechaEmision: formatearFecha(new Date()),
                rutaLocal: rutaCompleta,
                estado: "Vigente",
                // fechaAnulacion:
                // motivoAnulacio:
                encabezadosId: encabezadoCancelarId,
              };
              await cancelarServicios(
                planillaCancelarId,
                serviciosCancelar,
                encabezadoCancelarId,
                newComprobante
              );
              // const options = {
              //   // printer: "Zebra",
              //   // pages: "1-3,5",
              //   paperSize:"letter",
              //   // side: "duplex",
              //   copies: 2,
              //   // scale: "shrink",
              // };
              // ----------------------------------------------------------------
              // const options = {
              //   pagesPerSheet: 2,
              // };

              // // print("assets/pdf-sample.pdf", options).then(console.log);
              // printer.print(pdfOptions.path, options);
              // // Impresión exitosa

              const pdfDocument = new PDFDocument(pdfOptions.path);

              const options = {
                pageLayout: PDFDocument.TwoPagesPerSheet,
                // printerName: "Impresora1",
              };

              pdfDocument.print(options);
              abrirPagos();
              console.log("El PDF se ha enviado a la cola de impresión.");
            })
            .catch((error) => {
              // Error de impresión
              console.error("Error al imprimir el PDF:", error);
            });
          // Cierra el navegador
          await browser.close();
          console.log("PDF generado y guardado correctamente.");
        } catch (error) {
          console.error("Error al generar el PDF:", error);
        }
      } else {
        console.log("Ruta no definida");
      }
    } else {
      console.log("El usuario canceló la selección de directorio.");
    }
  } catch (error) {
    console.error("Error al generar el comprobante:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  boton.addEventListener("click", async () => {
    // Configura las opciones para la generación de PDF
    const scale = 0.7;
    const scaleX = 0.9; // Escala en el eje X (80%)
    const scaleY = 0.9; // Escala en el eje Y (120%)
    const halfPageHeight = "148.5 mm";
    const pdfOptions = {
      path: "X:/FacturasSCAP/respaldo.pdf", // Nombre del archivo PDF de salida
      format: "A4", // Formato de página
      width: "210mm",
      height: "297mm",
      scale: scale,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "0mm",
        right: "10mm",
      },
      pageRanges: "1",
    };
    cobrosAlDg();
    //await guardarEnDirectorioSeleccionado(pdfOptions);
    // Borrado 002
  });
});
ipcRenderer.on(
  "datos-a-pagina2",
  async (
    event,
    datos,
    encabezado,
    serviciosFijos,
    otrosServicios,
    datosAgua,
    datosTotales,
    editados
  ) => {
    // console.log("Llego Petición");
    // Datos recibidos
    console.log(datos, encabezado);
    planillaCancelarId = datosAgua.planillaId;
    encabezadoCancelarId = encabezado.encabezadoId;
    codigoPlanilla = encabezado.planilla;
    editSocioId = encabezado.socioId;
    console.log("Socio cancelando: " + editSocioId);
    socioRuta = encabezado.socio;
    contratoRuta = encabezado.contrato;
    await generarCodigoComprobante();

    console.log(
      "Recibido par cancelar" +
        encabezadoCancelarId +
        " " +
        planillaCancelarId +
        " " +
        encabezado.planilla
    );
    // Datos del socio
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
    const socioNode = document.createTextNode(encabezado.socio);
    socioNombres.appendChild(socioNode);
    const cedulaNode = document.createTextNode(encabezado.cedula);
    socioCedula.appendChild(cedulaNode);
    const telefonoNode = document.createTextNode(encabezado.telefono);
    socioTelefono.appendChild(telefonoNode);
    const direccionNode = document.createTextNode(encabezado.direccion);
    socioDireccion.appendChild(direccionNode);
    // Datos de la planilla
    const planillaNode = document.createTextNode(encabezado.planilla);
    planilla.appendChild(planillaNode);
    const contratoNode = document.createTextNode(encabezado.contrato);
    contrato.appendChild(contratoNode);
    const ubicacionNode = document.createTextNode(encabezado.ubicacion);
    contratoUbicacion.appendChild(ubicacionNode);
    const fechaNode = document.createTextNode(formatearFecha(encabezado.fecha));
    fechaEmisionPlanilla.appendChild(fechaNode);
    // const codigoNode = document.createTextNode(encabezado.
    if (
      Object.keys(serviciosFijos).length > 0 &&
      serviciosFijos !== undefined
    ) {
      serviciosFijos.forEach((servicioFijo) => {
        console.log("En for: " + servicioFijo.nombre);
        if (servicioFijo.nombre == "Agua Potable") {
          serviciosCancelar.push(servicioFijo);
          aguaSn = true;
          console.log("Tiene agua");
          lecturaAnterior.textContent = datosAgua.lecturaAnterior;
          lecturaActual.textContent = datosAgua.lecturaActual;
          consumo.textContent =
            datosAgua.lecturaActual - datosAgua.lecturaAnterior;
          tarifa.textContent = datosAgua.tarifaConsumo;
          total.textContent = datosAgua.valorConsumo;
        } else {
          renderDetalles(servicioFijo);
        }
      });
    }
    if (otrosServicios !== null && otrosServicios !== undefined) {
      otrosServicios.forEach(async (otroServicio) => {
        console.log("Edita2: " + editados);
        const servicioEditado = await editados.find(
          (editado) => editado.id === otroServicio.id
        );
        if (servicioEditado) {
          console.log(`Se encontró un objeto con el ID ${otroServicio.id}`);
          console.log("Nuevo abono: " + servicioEditado.valor);
          console.log("Total: " + otroServicio.total);
          console.log("Saldo: " + otroServicio.saldo);
          otroServicio.abono = servicioEditado.valor;
          otroServicio.saldo = otroServicio.total - servicioEditado.valor;
        } else {
          console.log(`No se encontró un objeto con el ID ${otroServicio.id}`);
        }
        // if (otroServicio.nombre === "Agua Potable") {
        //   aguaSn = true;
        //   console.log("Tiene agua");
        //   lecturaAnterior.textContent = datosAgua.lecturaAnterior;
        //   lecturaActual.textContent = datosAgua.lecturaActual;
        //   consumo.textContent =
        //     datosAgua.lecturaActual - datosAgua.lecturaAnterior;
        //   tarifa.textContent = datosAgua.tarifaConsumo;
        //   total.textContent = datosAgua.valorConsumo;
        // } else {
        renderDetalles(otroServicio);
        // }
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
      text: "El cambio se entrega al usuario y el valor de la planilla sera cancelado.",
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
  detailsList.innerHTML += `
      <tr>
      <td>${servicio.nombre}</td>
        <td>${servicio.descripcion}</td>
        <td     style="
        text-align: center;
        padding: 5px;
        
        font-size: 15px;
      ">${parseFloat(servicio.total).toFixed(2)}</td>
        <td     style="
        text-align: center;
        padding: 5px;
        
        font-size: 15px;
      ">${parseFloat(servicio.descuento).toFixed(2)}</td>
        <td     style="
        text-align: center;
        padding: 5px;
 
        font-size: 15px;
      ">${parseFloat(servicio.saldo).toFixed(2)}</td>
        <td     style="
        text-align: center;
        padding: 5px;
        
        font-size: 15px;
      ">${parseFloat(servicio.abono).toFixed(2)}</td>
     </tr>
        `;
  // });
  if (!aguaSn) {
    dataAgua.style.display = "none";
  }
}
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
  if (codigoPlanilla !== "") {
    const timestamp = Date.now();
    const codigoUnico = `${timestamp}`;
    codigoGenerado = codigoPlanilla + "" + codigoUnico;
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
ipcRenderer.on("ResultadoPago", async (event, response) => {
  console.log("Response: " + response);
  if (response.success) {
    // Configura las opciones para la generación de PDF
    const scale = 0.7;
    const scaleX = 0.9; // Escala en el eje X (80%)
    const scaleY = 0.9; // Escala en el eje Y (120%)

    const pdfOptions = {
      path: "X:/FacturasSCAP/respaldo.pdf", // Nombre del archivo PDF de salida
      format: "A4", // Formato de página
      width: "210mm",
      height: "297mm",
      scale: scale,
      margin: {
        top: "5mm",
        bottom: "0mm",
        left: "5mm",
        right: "5mm",
      },
      // pageRanges: "1", // Imprime solo la primera página (la mitad superior)
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

function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}

const abrirPagos = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Pagos";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
