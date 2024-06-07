const { ipcRenderer, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
// Función para guardar el archivo PDF en la carpeta seleccionada
async function guardarEnDirectorioSeleccionado(codigoComprobante) {
  const scale = 0.9;
  const scaleX = 0.9; // Escala en el eje X (80%)
  const scaleY = 0.9; // Escala en el eje Y (120%)

  const pdfOptions = {
    path: "X:/FacturasSCAP/respaldo.pdf", // Nombre del archivo PDF de salida
    format: "A4", // Formato de página
    width: "210mm",
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
  const pdfBaucherOptions = {
    path: "X:/FacturasSCAP/respaldo.pdf",
    format: "A6",
    width: "80mm",
    height: "297mm",
    scale: scale,
    lanscape: true,
    margin: {
      top: "1mm",
      bottom: "1mm",
      left: "0.5mm",
      right: "0.5mm",
    },
  };
  const content = document.querySelector(".invoice");
  try {
    const directorioSeleccionado = await ipcRenderer.invoke("selectDirectory");
    const nombreRuta = codigoComprobante;
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
        pdfOptions.path = rutaCompleta;
        // Extraer la ruta de la carpeta
        const folderPath = path.dirname(pdfOptions.path);
        // Verificar si la carpeta existe
        if (!fs.existsSync(folderPath)) {
          // La carpeta no existe, crearla
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const chromePath =
          "C:/Program Files/Google/Chrome/Application/chrome.exe";

        const browser = await puppeteer.launch({
          executablePath: chromePath,
          // Agrega mas opciones de configuración si es necesario !!
        });
        // Crea una instancia de navegador
        const page = await browser.newPage();
        const baucher = await browser.newPage();
        // Contenido HTML que deseas convertir en PDF
        await page.setContent(content.outerHTML);
        await baucher.setContent(content.outerHTML);
        // Genera el PDF
        await page.emulateMediaType("screen");
        await baucher.pdf({
          // path: "C:/Users/Usuario/Documents/jaaps-temporal-print.pdf",
          path: "C:/Users/Use/Documents/jaaps-temporal-print.pdf",
          //   format: pdfOptions.format,
          width: pdfBaucherOptions.width,
          scale: pdfBaucherOptions.scale,
          height: pdfBaucherOptions.height,
          margin: pdfBaucherOptions.margin,
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
            await ipcRenderer.send(
              "PrintBaucher",
              // "C:/Users/Usuario/Documents/jaaps-temporal-print.pdf",
              "C:/Users/USE/Documents/jaaps-temporal-print.pdf"
            );
            // Impresión exitosa
            console.log("El PDF se ha enviado a la cola de impresión.");
          })
          .catch((error) => {
            // Error de impresión
            console.error("Error al imprimir el PDF:", error);
          });
        // Cierra el navegador
        await browser.close();
        console.log("PDF generado y guardado correctamente.");
        return rutaCompleta;
      } else {
        console.log("Ruta no definida");
        return;
      }
    } else {
      console.log("El usuario canceló la selección de directorio.");
      return;
    }
  } catch (error) {
    console.error("Error al generar el comprobante:", error);
    return;
  }
}

module.exports = {
  guardarEnDirectorioSeleccionado,
};
