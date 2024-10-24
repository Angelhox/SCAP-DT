const puppeteer = require("puppeteer");
const Swal = require("sweetalert2");
// const pdf = require("html-pdf");
const printer = require("pdf-to-printer");
const fs = require("fs");
const path = require("path");
// const html2pdf = require("html2pdf.js");
const { ipcRenderer } = require("electron");
const fechaEmision = document.getElementById("fechaEmision");
const fechaImpresion = document.getElementById("fechaImpresion");
const nombreReporte = document.getElementById("nombreReporte");
const fechaDesde = document.getElementById("fechaDesde");
const fechaHasta = document.getElementById("fechaHasta");
const indexColumn = document.getElementById("index");
const contrato = document.getElementById("contrato");
const socio = document.getElementById("socio");
const identificacion = document.getElementById("identificacion");
const fechaRegistro = document.getElementById("fecha-registro");
const barrio = document.getElementById("barrio");
const estado = document.getElementById("estado");
const dataList = document.getElementById("data");
let renderEstadoColumn = false;
// ----------------------------------------------------------------
const valoresTotales = document.getElementById("valores-totales");
const estadoServicio = document.getElementById("estado");
const total = document.getElementById("total");
const abonado = document.getElementById("abonado");
const saldo = document.getElementById("saldo");
const pendiente = document.getElementById("pendiente");
const recaudado = document.getElementById("recaudado");
const totalFinal = document.getElementById("totalFinal");
const filtrado = document.getElementById("totalFiltrado");
const filtradoTitle = document.getElementById("filtradoTitle");
const cancelarReporte = document.getElementById("cancelar-reporte");
let aguaSn = false;
let planillaCancelarId = "";
let encabezadoCancelarId = "";
let tipoServicio = "fijos";
let serviciosCancelar = [];
let carpetaRuta = "";
let cuotaRuta = "";
let codigoGenerado = "";
let nombreCuotaRuta = "";
document.addEventListener("DOMContentLoaded", () => {
  // async function imprimirYGuardarPDF() {
  const boton = document.getElementById("btn-print");
  boton.addEventListener("click", async () => {
    const content = document.querySelector(".invoice");
    const scale = 0.9;
    const scaleX = 0.9;
    const scaleY = 0.9;
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
          "/Respaldos/Reportes/Contratos/" + nombreRuta + ".pdf"
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
  codigoGenerado = `${nombreCuotaRuta}  ${formatearFecha(
    timestamp
  )}-${codigoUnico}`;
  console.log("Codigo generado: ", codigoGenerado);
  return codigoGenerado;
};

ipcRenderer.on(
  "generate-report-contratos",
  async (
    event,
    datosContratos,
    datosContratosSinMedidor,
    anioFiltro,
    mesFiltro,
    sectorFiltro
  ) => {
    nombreCuotaRuta = "Reporte de Socios";
    const impresionText = document.createTextNode(formatearFecha(new Date()));
    fechaImpresion.append(impresionText);
    if (datosContratos.length > 0) {
      if (anioFiltro === "all") {
        estado.style.display = "none";
        dataList.innerHTML += ` <tr>
        <td colspan=${
          renderEstadoColumn ? 7 : 6
        } style="text-align: center;">Contratos con medidor</td>
        </tr>`;
        renderDetalles(datosContratos);
      } else {
        renderEstadoColumn = true;
        const fechaFiltro = `${anioFiltro}-${mesFiltro.padStart(2, "0")}-01`;
        fechaDesde.textContent = "Desde:" + " " + fechaFiltro;
        fechaHasta.textContent = "Hasta:" + " " + formatearFecha(new Date());
        dataList.innerHTML += ` <tr>
        <td colspan=${
          renderEstadoColumn ? 7 : 6
        } style="text-align: center;">Contratos con medidor</td>
        </tr>`;
        renderDetalles(filterDataDate(datosContratos, fechaFiltro));
      }
    }
    if (datosContratosSinMedidor.length > 0) {
      if (anioFiltro === "all") {
        estado.style.display = "none";
        dataList.innerHTML += ` <tr>
        <td colspan=${
          renderEstadoColumn ? 7 : 6
        } style="text-align: center;">Contratos sin medidor</td>
      </tr>`;
        renderDetalles(datosContratosSinMedidor, datosContratos.length);
      } else {
        renderEstadoColumn = true;
        const fechaFiltro = `${anioFiltro}-${mesFiltro.padStart(2, "0")}-01`;
        dataList.innerHTML += ` <tr>
        <td colspan=${
          renderEstadoColumn ? 7 : 6
        } style="text-align: center;">Contratos sin medidor</td>
      </tr>`;
        renderDetalles(filterDataDate(datosContratosSinMedidor, fechaFiltro));
      }
    }
  }
);
const filterDataDate = (data, filter) => {
  console.log("Fecha filtro: ", filter);
  let filteredData = [];
  let outFilter = [];
  for (const contrato of data) {
    if (formatearFecha(contrato.fecha) >= filter) {
      filteredData.push(contrato);
    } else {
      outFilter.push(contrato);
    }
  }
  for (const filtrado of filteredData) {
    filtrado.duplyContract = outFilter.some(
      (noFiltrado) => noFiltrado.sociosId === filtrado.sociosId
    );
  }
  return filteredData;
  //   const filteredData = data.filter(
  //     (contrato) => formatearFecha(contrato.fecha) >= filter
  //   );
  //   console.log("Data filtrada: ", filteredData);
  //   return filteredData;
};

cancelarReporte.addEventListener("click", () => {
  if (tipoServicio === "fijos") {
    abrirServicios();
  } else {
    abrirCuotas();
  }
});
function renderDetalles(data, index = 0) {
  //   serviciosCancelar.push(servicio);
  console.log("Datos filtrados: ", data);

  for (const contrato of data) {
    index++;
    dataList.innerHTML += `  <tr>
      <td  style="
        text-align: center;
        padding: 5px;
        
        font-size: 12px;
      ">${index}</td>
        <td>${contrato.codigo}</td>
        <td     style="
        text-align: center;
        padding: 5px;
        
        font-size: 15px;
      ">${contrato.apellidos} ${contrato.nombres}</td>
        <td     style="
        text-align: center;
        padding: 5px;
        
        font-size: 15px;
      ">${contrato.cedulaPasaporte}</td>
       <td     style="
        text-align: center;
        padding: 5px;
 
        font-size: 15px;
      ">${formatearFecha(contrato.fecha)}</td>
       ${
         renderEstadoColumn
           ? ` <td
             style="
        text-align: center;
        padding: 5px;
        font-size: 15px;
      "
           >
             ${contrato.duplyContract ? "Contrato adicional" : ""}
           </td>`
           : ""
       }
        <td     style="
        text-align: center;
        padding: 5px;
        
        font-size: 15px;
      ">${contrato.barrio}</td>
     </tr>`;
  }
}
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
