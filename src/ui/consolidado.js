const puppeteer = require("puppeteer");
const Swal = require("sweetalert2");
// const pdf = require("html-pdf");
const printer = require("pdf-to-printer");
const fs = require("fs");

const path = require("path");

// const html2pdf = require("html2pdf.js");
const { ipcRenderer } = require("electron");
// const socioNombres = document.getElementById("socioNombres");
// const socioCedula = document.getElementById("socioCedula");
// const socioTelefono = document.getElementById("socioTelefono");
// const contrato = document.getElementById("contrato");
// const planilla = document.getElementById("planilla");
// const fechaEmision = document.getElementById("fechaEmision");
// const dataAgua = document.getElementById("data-agua");
// const dataServicios = document.getElementById("data-servicios");
// const lecturaAnterior = document.getElementById("lecturaAnterior");
// const lecturaActual = document.getElementById("lecturaActual");
// const consumo = document.getElementById("consumo");
// const tarifa = document.getElementById("tarifa");
// const total = document.getElementById("total");
// const subtotal = document.getElementById("subtotal");
// const descuento = document.getElementById("descuento");
// const totalPagar = document.getElementById("total-pagar");
// const detailsList = document.getElementById("servicios-details");
const fechaEmision = document.getElementById("fechaEmision");
const fechaImpresion = document.getElementById("fechaImpresion");
const nombreServicio = document.getElementById("nombreServicio");
const fechaDesde = document.getElementById("fechaDesde");
const fechaHasta = document.getElementById("fechaHasta");
const contrato = document.getElementById("contrato");
const socio = document.getElementById("socio");
const estado = document.getElementById("estado");
const total = document.getElementById("total");
const abonado = document.getElementById("abonado");
const saldo = document.getElementById("saldo");
const pendiente = document.getElementById("pendiente");
const recaudado = document.getElementById("recaudado");
const totalFinal = document.getElementById("totalFinal");
const filtrado = document.getElementById("totalFiltrado");
const filtradoTitle = document.getElementById("filtradoTitle");
const recaudacionesList = document.getElementById("recaudaciones");
let aguaSn = false;
let planillaCancelarId = "";
let encabezadoCancelarId = "";
let serviciosCancelar = [];
let carpetaRuta = "";
let cuotaRuta = "";
let codigoGenerado = "";
let nombreCuotaRuta = "";
document.addEventListener("DOMContentLoaded", () => {
  // async function imprimirYGuardarPDF() {
  const boton = document.getElementById("boton");
  boton.addEventListener("click", async () => {
    // await cancelarServicios(
    //   planillaCancelarId,
    //   serviciosCancelar,
    //   encabezadoCancelarId
    // );
    // Configura las opciones para la generación de PDF
    const content = document.querySelector(".invoice");
    const scale = 0.9;
    const scaleX = 0.9; // Escala en el eje X (80%)
    const scaleY = 0.9; // Escala en el eje Y (120%)

    const pdfOptions = {
      path: "X:/FacturasSCAP/recaudaciones.pdf", // Nombre del archivo PDF de salida
      format: "A4", // Formato de página
      width: "210mm",
      height: "297mm",
      scale: scale,
      margin: {
        top: "10mm",
        bottom: "5mm",
        left: "0mm",
        right: "10mm",
      },
    };
    await guardarEnDirectorioSeleccionado(pdfOptions);
    // const content = document.querySelector(".invoice");
    // const timestamp = new Date().getTime(); // Obtener el timestamp actual
    // const fileName = `documento_${timestamp}.pdf`;
    // const filePath = "X:/FacturasSCAP/" + fileName;
    // await pdf.create(content.outerHTML).toFile(filePath, (err, res) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    //   console.log("Archivo PDF creado: ", res.filename);
    //   // Enviamos el archivo a la cola de impresion
    //   printer
    //     .print(filePath)
    //     // window
    //     //   .print()
    //     .then(() => {
    //       printer.print(filePath);
    //       // Impresión exitosa
    //       abrirPagos();
    //       console.log("El PDF se ha enviado a la cola de impresión.");
    //     })
    //     .catch((error) => {
    //       // Error de impresión
    //       abrirPagos();
    //       console.error("Error al imprimir el PDF:", error);
    //     });
    // });
  });
});
async function guardarEnDirectorioSeleccionado(pdfOptions) {
  const content = document.querySelector(".invoice");
  try {
    const directorioSeleccionado = await ipcRenderer.invoke("selectDirectory");
    await generarCodigoComprobante();
    const nombreRuta = codigoGenerado;
    console.log("Codigo generado: " + nombreRuta);
    if (directorioSeleccionado) {
      if (nombreRuta !== null) {
        const rutaCompleta = path.join(
          directorioSeleccionado,
          "/Respaldos/Reportes/" +
            carpetaRuta +
            "/" +
            cuotaRuta +
            "/" +
            nombreRuta +
            ".pdf"
        );
        pdfOptions.path = rutaCompleta;
        // Extraer la ruta de la carpeta
        const folderPath = path.dirname(pdfOptions.path);
        // Verificar si la carpeta existe
        if (!fs.existsSync(folderPath)) {
          // La carpeta no existe, crearla
          fs.mkdirSync(folderPath, { recursive: true });
        }
        try {
          // Crea una instancia de navegador

          const chromePath =
            "C:/Program Files/Google/Chrome/Application/chrome.exe";

          const browser = await puppeteer.launch({
            executablePath: chromePath,
            // Otras opciones de configuración si es necesario
          });

          // const browser = await puppeteer.launch();
          const page = await browser.newPage();
          // Agrega un manejador para los mensajes de la consola
          page.on("console", (msg) => {
            console.log(`Mensaje de la consola: ${msg.text()}`);
          });

          // Contenido HTML que deseas convertir en PDF
          // Configura la página como página sin margen
          //await page.setViewport({ width: 100, height: 100, deviceScaleFactor: 1 }); // No hace caso :(
          // Carga el contenido HTML en la página
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

              printer.print(pdfOptions.path);
              // Impresión exitosa
              abrirPagos();
              console.log("El PDF se ha enviado a la cola de impresión.");
            })
            .catch((error) => {
              // Error de impresión
              // abrirPagos();
              console.error("Error al imprimir el PDF:", error);
            });
          // Cierra el navegador
          await browser.close();
          //await window.print();
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
const generarCodigoComprobante = async () => {
  const timestamp = Date.now();
  const codigoUnico = `${timestamp}`;
  codigoGenerado = nombreCuotaRuta + codigoUnico;
  console.log("Codigo generado: ", codigoGenerado);
  return codigoGenerado;
};
function caragarEncabezado(reporte, encabezado) {
  let tipoReporte = "Reporte general";
  switch (reporte) {
    case "cancelados":
      tipoReporte = "Reporte de valores abonados";
      fechaDesde.textContent = "De:" + " " + encabezado.fechaD;
      fechaHasta.textContent = "Hasta:" + " " + encabezado.fechaH;
      break;
    case "sinCancelar":
      tipoReporte = "Reporte de valores sin cancelar";
      fechaDesde.textContent = "De::" + " " + encabezado.fechaD;
      fechaHasta.textContent = "Hasta:" + " " + encabezado.fechaH;
      break;
    case "Por dias":
      tipoReporte = "Reporte por día de recaudación";
      fechaDesde.textContent =
        "Día de recaudación::" + " " + encabezado.fechaFiltro;
      break;
    case "Por mes":
      tipoReporte = "Reporte por mes de recaudación";
      fechaDesde.textContent =
        "Mes de recaudación:" + " " + encabezado.fechaFiltro;

      break;
    case "general":
      tipoReporte = "Reporte general";
      fechaDesde.textContent = "Desde:" + " " + encabezado.fechaD;
      fechaHasta.textContent = "Hasta:" + " " + encabezado.fechaH;
      break;
  }
  const fe = document.createTextNode(formatearFecha(new Date()));
  const fi = document.createTextNode(formatearFecha(new Date()));
  fechaEmision.appendChild(fe);
  fechaImpresion.appendChild(fi);
  nombreServicio.textContent = encabezado.servicio + " (" + tipoReporte + ")";
}
ipcRenderer.on(
  "datos-a-pagina3",
  async (event, datos, encabezado, recaudaciones, datosTotales) => {
    let reporte = encabezado.tipoReporte;
    console.log("Llego Petición: ", recaudaciones);
    await caragarEncabezado(reporte, encabezado);
    let carpetaRutaDf = "Servicios Fijos";
    // Al recibir los datos
    console.log(datos, encabezado);
    if (encabezado.tipo !== undefined) {
      carpetaRuta = encabezado.tipo;
    }

    cuotaRuta = encabezado.creacion + encabezado.servicio;
    nombreCuotaRuta = encabezado.servicio;
    await generarCodigoComprobante();

    recaudacionesList.innerHTML = "";
    recaudaciones.forEach((recaudacion) => {
      let abonoRp = recaudacion.abono;
      let estado = "Sin cancelar";
      if (abonoRp == recaudacion.total) {
        estado = "Cancelado";
      } else if (abonoRp < recaudacion.total && abonoRp > 0) {
        estado = "Abonado";
      } else if (abonoRp <= 0) {
        estado = "Sin cancelar";
      }
      if (reporte == "Por dias") {
        filtradoTitle.style.display = "block";
        filtrado.style.display = "block";
        abonoRp = recaudacion.abonoFiltrado;
        filtradoTitle.textContent = "Recaudado por día";
        filtrado.textContent = datosTotales.totalFiltrado;
      } else if (reporte == "Por mes") {
        filtradoTitle.style.display = "block";
        filtrado.style.display = "block";
        abonoRp = recaudacion.abonoFiltrado;
        filtradoTitle.textContent = "Recaudado por mes";
        filtrado.textContent = datosTotales.totalFiltrado;
      }
      recaudacionesList.innerHTML += `
      <tr>
      <td style="
      text-align: left;
      padding: 5px;
      
      font-size: 15px;
    ">${recaudacion.codigo}</td>
      <td style="
      text-align: left;
      padding: 5px;
      
      font-size: 15px;
    ">${recaudacion.nombres + " " + recaudacion.apellidos}</td>
      <td style="
      text-align: left;
      padding: 5px;
      font-size: 15px;
    ">${estado}</td>

    <td style="
    text-align: center;
    padding: 5px;
    
    font-size: 15px;
  ">${parseFloat(recaudacion.total).toFixed(2)}</td>


      <td style="
      text-align: center;
      padding: 5px;
      font-size: 15px;
    ">${parseFloat(abonoRp).toFixed(2)}</td>

      <td style="
      text-align: center;
      padding: 5px;
      font-size: 15px;
    ">${parseFloat(recaudacion.total - recaudacion.abono).toFixed(
      2
    )}</td>        
  </tr>
      `;
    });
    pendiente.textContent = datosTotales.pendiente;
    recaudado.textContent = datosTotales.recaudado;

    totalFinal.textContent = datosTotales.totalFinal;
  }
);
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
}
// const cancelarServicios = async (
//   planillaCancelarId,
//   servicios,
//   encabezadoCancelarId
// ) => {
//   console.log(
//     "Enviar a cancelar: " + encabezadoCancelarId + " " + planillaCancelarId
//   );
//   await ipcRenderer.invoke(
//     "cancelarServicios",
//     planillaCancelarId,
//     encabezadoCancelarId,
//     serviciosCancelar
//   );
// };
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
// ipcRenderer.on("Notificar", (event, response) => {
//   console.log("Response: " + response);

//   const swalOptions = {
//     title: response.title,
//     text: response.message,
//     icon: response.success ? "success" : "error",
//     confirmButtonColor: "#f8c471",
//     showCancelButton: true, // Mostrar botón de cancelar
//     confirmButtonText: "Confirmar",
//     cancelButtonText: "Cancelar",
//   };

//   // Registra un evento de clic en el botón "Confirm"
//   swalOptions.onBeforeOpen = () => {
//     const confirmButton = document.querySelector(".swal2-confirm");
//     if (confirmButton) {
//       confirmButton.addEventListener("click", () => {
//         // Aquí puedes colocar la acción que deseas realizar al hacer clic en "Confirm"
//         console.log("Se hizo clic en Confirm");
//         // Realiza tu acción aquí
//       });
//     }
//   };

//   Swal.fire(swalOptions);
// });

async function imprimirYGuardarPDFfinal() {
  const elemento = document.body;
  html2pdf()
    .set({
      margin: 1,
      filename: "doculmento.pdf",
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 3,
        letterRendering: true,
      },
      jsPDF: {
        unit: "in",
        format: "a3",
        orientation: "portrait",
      },
    })
    .from(elemento)
    .save()
    .catch((error) => {
      console.log("Error: " + error);
    });
}
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
  const url = "Servicios ocacionales";
  await ipcRenderer.send("abrirInterface", url, acceso);
};
