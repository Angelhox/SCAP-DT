const { BrowserWindow, Notification, dialog, session } = require("electron");
const { app, ipcMain } = require("electron");
const { getConnection, closeConnection } = require("./database");
const fs = require("fs").promises;
const { PDFDocument, degrees, rgb } = require("pdf-lib");
const pdfToPrinter = require("pdf-to-printer");

// const Store = require("electron-store");
const path = require("path");
const url = require("url");
const { error } = require("console");
const { page } = require("pdfkit");
const {
  cancelarServiciosMultiples,
} = require("./ui/PagosMultiples/pagos-multiples.api");
const { contratarPrincipales } = require("./ui/Cuotas/cuotas.api");
const { cancelarServicios } = require("./ui/Pagos/pagos-individual.api");
let window;
let windowFactura;
let windowFacturaMultiple;
let servicioEnviar = [];

ipcMain.on("hello", () => {
  console.log("Hello from renderer process");
});

// ----------------------------------------------------------------
ipcMain.handle("getDocumentsPath", async (event, documentsPath) => {
  //const documentsPath = app.getPath('documentos');
  console.log("ruta:", documentsPath);
  await event.sender.send("documentsPath", documentsPath);
});

// ----------------------------------------------------------------
ipcMain.on("printPDFNot valid", async (event, filePath) => {
  const printWindow = new BrowserWindow({ show: false });
  console.log("PAth: ", filePath);
  // try {
  const file = fs.readFileSync(filePath);
  printWindow.loadURL(filePath);
  // printWindow.webContents.on("did-finish-load", () => {
  console.log("Cargo impresion");
  printWindow.webContents.print({ silent: true, pagesPerSheet: 2 });
  //printWindow.close();

  // Enviar confirmación al proceso de renderizado
  event.sender.send("printPDFComplete", "El PDF se ha impreso correctamente.");
  // });
  // } catch (error) {
  //     console.log('error en la impresion: ' + error);
  // }
});
// ----------------------------------------------------------------

// ipcMain.on('printPDF', async (event, pdfPath) => {
//   console.log(pdfPath);
//   try {
//     const existingPdfBytes = await fs.readFile(pdfPath);
//     const pdfDoc = await PDFDocument.load(existingPdfBytes);

//     // Asegurarse de que el documento tenga al menos una página
//     if (pdfDoc.getPageCount() === 0) {
//       console.error('El documento PDF no contiene ninguna página.');
//       return;
//     }

//     // Obtener la primera página del documento
//     const firstPage = pdfDoc.getPage(0);

//     // Crear un nuevo documento y agregar una página
//     const newPdfDoc = await PDFDocument.create();
//     const newPage = newPdfDoc.addPage([firstPage.getWidth(), firstPage.getHeight()]);

//     // Dibujar la primera página dos veces en la nueva página
//     newPage.drawPage(firstPage);
//     newPage.drawPage(firstPage, { x: firstPage.getWidth() / 2 });

//     // Imprimir el documento modificado
//     const modifiedPdfBytes = await newPdfDoc.save();
//     const pdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
//     const pdfDataUri = URL.createObjectURL(pdfBlob);

//     const printWindow = new BrowserWindow({ show: false });
//     printWindow.loadURL(pdfDataUri);

//     printWindow.webContents.on('did-finish-load', () => {
//       printWindow.webContents.print({}, () => {
//         printWindow.close();
//       });
//     });
//   } catch (error) {
//     console.error('Error:', error);
//   }
// });

// --------------------------------
ipcMain.on("PrintBaucher", async (event, outputPath) => {
  try {
    const options = {
      scale: "fit",
    };
    await pdfToPrinter.print(outputPath, options);
    await fs.unlink(outputPath);
    console.log("PDF impreso con éxito.");
  } catch (error) {
    console.error("Error al imprimir PDF:", error);
  }
});
ipcMain.on(
  "Dos",
  async (event, pdfPaths, outputPath, scaleWidth, scaleHeight) => {
    try {
      // Cargar ambos archivos PDF
      const pdfBytes1 = await fs.readFile(pdfPaths[0]);
      const pdfBytes2 = await fs.readFile(pdfPaths[1]);

      // Crear documentos PDF a partir de los bytes

      const pdfDoc1 = await PDFDocument.load(pdfBytes1);

      const pdfDoc2 = await PDFDocument.load(pdfBytes2);
      // Crear un nuevo documento y agregar páginas de los dos documentos existentes
      const mergedPdfDoc = await PDFDocument.create();

      const [page1] = await mergedPdfDoc.copyPages(pdfDoc1, [0]);
      const [page2] = await mergedPdfDoc.copyPages(pdfDoc2, [0]);

      // Añadir las páginas al nuevo documento

      // const { width, height } = page1.getSize();
      // const newScaleWidth = parseFloat(scaleWidth.toString());
      // const newScaleHeight = parseFloat(scaleHeight.toString());
      // console.log('Size anterior: ' + width + '|' + height)
      // const newWidth = width * newScaleWidth;
      // const newHeight = height * newScaleHeight;
      // console.log('Size: ' + newWidth + '|' + newHeight)
      // page1.setSize(newWidth, newHeight);
      // page2.setSize(newWidth, newHeight);
      // page1.setRotation(degrees(180));
      // page2.setRotation(degrees(90));
      mergedPdfDoc.addPage(page1);
      mergedPdfDoc.addPage(page2);

      const mergedPdfBytes = await mergedPdfDoc.save();
      await fs.writeFile(outputPath, mergedPdfBytes);
      const options = {
        // orientation: "landscape",
        // scale: "fit",
      };
      await pdfToPrinter.print(outputPath, options);
      // await fs.unlink(outputPath);
      console.log("PDFs unidos e impresos con éxito.");
    } catch (error) {
      console.error("Error al unir e imprimir PDFs:", error);
    }
  }
);

// try {

// ----------------------------------------------------------------
// Funciones para el cierre de sesion
// ----------------------------------------------------------------
ipcMain.on("cerrarSesion", async (event) => {
  const outPage = "src/ui/login.html";
  // const conn = await getConnection();
  // conn
  //   .end()
  //   .then(() => {
  //     console.log("Closed :)");
  //   })
  //   .catch((error) => {
  //     console.error("No closed :(", error);
  //   });
  await closeConnection();
  // event.sender.send("sesionCerrada");
  await window.loadFile(outPage);
  await window.webContents.send("Log out");
});
// ----------------------------------------------------------------
// Funcion para el cierre de la aplicacion
// ----------------------------------------------------------------
ipcMain.on("salir", async (event) => {
  app.quit();
});

function createWindow() {
  app.commandLine.appendSwitch("allow-file-access-from-files");

  window = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.loadFile("src/ui/login.html");
}

app.on("ready", () => {
  //Funciones de inicio de sesion
  ipcMain.on("validarUsuarios", async (event, { usuario, clave }) => {
    // const ses = session.defaultSession;
    try {
      const conn = await getConnection();
      const user = await conn.query(
        "SELECT usuario,rol FROM viewUsuarios WHERE usuario = ?",
        // "SELECT * from usuarios;",
        usuario,
        async (error, results) => {
          if (error) {
            event.reply("loginResponse", {
              success: false,
              message: "Error en la consulta a la base de datos",
            });
            console.log("Error: ", error);
            return;
          } else if (results.length > 0) {
            console.log("usuario en peticion ");
            const user = await conn.query(
              "SELECT * from viewUsuarios where usuario=? and clave=?",
              [usuario, clave],
              async (error, results) => {
                if (error) {
                  event.sender.send("loginResponse", {
                    success: false,
                    message: "Error en la consulta a la base de datos",
                  });
                  const notification = new Notification({
                    title: "No se ha podido iniciar session!",
                    body: "Ocurrio un error al consultar en la base de datos, si el problema persiste solicite soporte tecnico",
                    icon: "/path/to/icon.png",
                  });

                  notification.show();
                  return;
                } else if (results.length > 0) {
                  console.log("Credenciales correctas! ");
                  event.sender.send("loginResponse", {
                    success: true,
                    message: "Credenciales correctas",
                    data: results[0].rol,
                  });
                  const notification = new Notification({
                    title: "Credenciales correctas!",
                    body: "Bienvenido usuario: " + usuario,
                    icon: "/path/to/icon.png",
                  });

                  notification.show();
                } else {
                  status: false;
                  event.sender.send("loginResponse", {
                    success: false,
                    message: "Credenciales incorrectas",
                  });

                  const notification = new Notification({
                    title: "Error de credenciales!",
                    body: "La contraseña es incorrecta",
                    icon: "/path/to/icon.png",
                  });
                  notification.show();
                  return;
                }
              }
            );
          } else {
            event.sender.send("loginResponse", {
              success: false,
              message: "No existe este usuario",
            });
            const notification = new Notification({
              title: "Error de credenciales!",
              body: "No hay un usuario registrado para " + usuario,
              icon: "/path/to/icon.png",
            });
            notification.show();
            return;
          }
        }
      );
      console.log("Usuarios: ", user);
      return user;
    } catch (error) {
      console.log("Error al iniciar session: ", error);
    }
  });
});
// ----------------------------------------------------------------
// Funciones de comunicacion entre paginas
// ----------------------------------------------------------------
ipcMain.on("datos-a-servicios", async (event, servicio) => {
  console.log("Datos a enviar: " + servicio.id);
  servicioEnviar = servicio;
  // pagina2Window = new BrowserWindow({ show: false });
  await window.loadFile("src/ui/servicios.html");
  // window.send("datos-a-pagina2", datos);
  await window.show();
  await window.webContents.send("datos-a-servicios");
});

ipcMain.on("datos-a-ocacionales", async (event, servicio) => {
  console.log("Datos a enviar: " + servicio.id);
  servicioEnviar = servicio;
  // pagina2Window = new BrowserWindow({ show: false });
  await window.loadFile("src/ui/cuotas.html");
  // window.send("datos-a-pagina2", datos);
  await window.show();
  await window.webContents.send("datos-a-ocacionales");
});
// ----------------------------------------------------------------
// Manejo de rutas
// ----------------------------------------------------------------
ipcMain.on("abrirInterface", (event, interfaceName, acceso) => {
  console.log("Name: " + interfaceName);
  let url = "";
  if (interfaceName == "Inicio") {
    url = "src/ui/principal.html";
  }
  if (interfaceName == "Login") {
    url = "src/ui/login.html";
  }
  if (interfaceName == "Servicios fijos") {
    console.log(acceso);
    switch (acceso) {
      case "Auditor":
        console.log("Auditor");
        url = "src/ui/servicios.html";
        break;
      case "Cajero":
        break;
      case "Digitador":
        break;
      default:
    }
  } else if (interfaceName == "Servicios ocacionales") {
    switch (acceso) {
      case "Auditor":
        console.log("Auditor");
        url = "src/ui/cuotas.html";
        break;
      case "Cajero":
        break;
      case "Digitador":
        break;
      default:
    }
  } else if (interfaceName == "Usuarios") {
    switch (acceso) {
      case "Auditor":
        console.log("Auditor");
        url = "src/ui/usuarios.html";
        break;
      case "Cajero":
        break;
      case "Digitador":
        break;
      default:
    }
  } else if (interfaceName == "Socios") {
    switch (acceso) {
      case "Auditor":
        console.log("Auditor");
        url = "src/ui/socios.html";
        break;
      case "Cajero":
        url = "src/ui/socios.html";
        break;
      case "Digitador":
        url = "src/ui/socios.html";
        break;
      default:
    }
  } else if (interfaceName == "Contratos") {
    switch (acceso) {
      case "Auditor":
        console.log("Auditor");
        url = "src/ui/contratos.html";
        break;
      case "Cajero":
        break;
      case "Digitador":
        url = "src/ui/contratos.html";
        break;
      default:
    }
  } else if (interfaceName == "Recaudaciones") {
    switch (acceso) {
      case "Auditor":
        console.log("Auditor");
        url = "src/ui/recaudaciones.html";
        break;
      case "Cajero":
        break;
      case "Digitador":
        url = "src/ui/recaudaciones.html";
        break;
      default:
    }
  } else if (interfaceName == "Planillas") {
    switch (acceso) {
      case "Auditor":
        console.log("Auditor");
        url = "src/ui/planillas.html";
        break;
      case "Cajero":
        break;
      case "Digitador":
        url = "src/ui/planillas.html";
        break;
      default:
    }
  } else if (interfaceName == "Pagos") {
    switch (acceso) {
      case "Auditor":
        console.log("Auditor");
        url = "src/ui/Pagos/pagos.html";
        break;
      case "Cajero":
        url = "src/ui/Pagos/pagos.html";
        break;
      case "Digitador":
        url = "src/ui/Pagos/pagos.html";
        break;
      default:
    }
  } else if (interfaceName == "PagosII") {
    switch (acceso) {
      case "Auditor":
        console.log("Auditor");
        url = "src/ui/PagosMultiples/pagos-multiples.html";
        break;
      case "Cajero":
        url = "src/ui/PagosMultiples/pagos-multiples.html";
        break;
      case "Digitador":
        url = "src/ui/PagosMultiples/pagos-multiples.html";
        break;
      default:
    }
  }
  try {
    console.log("interface name desde main", interfaceName);
    console.log("url", url);
    if (url !== "") {
      window.loadFile(url);
    }
  } catch (err) {
    console.log("Error de window" + err);
  }
});
// ----------------------------------------------------------------
// Funciones de las facturas
// ----------------------------------------------------------------
ipcMain.on(
  "generateFacturaMultipleBaucher",
  async (
    event,
    serviciosFijos,
    otrosServicios,
    datosAgua,
    datosTotales,
    planilla,
    // Cambio
    editados
  ) => {
    console.log("planillaCancelar desde main: ", planilla);
    if (!windowFacturaMultiple) {
      windowFacturaMultiple = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });
      await windowFacturaMultiple.loadFile(
        "src/ui/FacturaMultipleBaucher/facturaMultipleBaucher.html"
      );
      // // window.send("datos-a-pagina2", datos);
      await windowFacturaMultiple.show();

      await windowFacturaMultiple.webContents.send(
        "generateFacturaMultiple",
        serviciosFijos,
        otrosServicios,
        datosAgua,
        datosTotales,
        planilla,
        editados
      );
      windowFacturaMultiple.on("closed", () => {
        windowFacturaMultiple = null;
        window.setEnabled(true);
        window.focus();
      });
      window.setEnabled(false);
      // Manejar clics en la ventana principal inhabilitada
      // window.on("blur", () => {
      // if (windowFacturaMultiple && !windowFacturaMultiple.isFocused()) {
      if (!windowFacturaMultiple.isFocused()) {
        // Reproducir sonido de notificación
        window.webContents.send("play-notification-sound");
        // Enfocar la ventana secundaria
        windowFacturaMultiple.focus();
      }
      // });
      window.on("closed", () => {
        windowFactura = null;
        windowFacturaMultiple = null;
      });
    }
  }
);
ipcMain.on(
  "generateFacturaMultiple",
  async (
    event,
    datos,
    encabezado,
    serviciosFijos,
    otrosServicios,
    datosAgua,
    datosTotales,
    planilla,
    // Cambio
    editados
  ) => {
    console.log("Datos a enviar: " + datos.mensaje);
    console.log("planillaCancelar desde main: ", planilla);
    if (!windowFacturaMultiple) {
      windowFacturaMultiple = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });
      await windowFacturaMultiple.loadFile(
        "src/ui/FacturaMultiple/facturaMultiple.html"
      );
      // // window.send("datos-a-pagina2", datos);
      await windowFacturaMultiple.show();

      await windowFacturaMultiple.webContents.send(
        "generateFacturaMultiple",
        datos,
        encabezado,
        serviciosFijos,
        otrosServicios,
        datosAgua,
        datosTotales,
        planilla,
        // Cambio
        editados
      );
      windowFacturaMultiple.on("closed", () => {
        windowFacturaMultiple = null;
        window.setEnabled(true);
        window.focus();
      });
      window.setEnabled(false);
      // Manejar clics en la ventana principal inhabilitada
      // window.on("blur", () => {
      // if (windowFacturaMultiple && !windowFacturaMultiple.isFocused()) {
      if (!windowFacturaMultiple.isFocused()) {
        // Reproducir sonido de notificación
        window.webContents.send("play-notification-sound");
        // Enfocar la ventana secundaria
        windowFacturaMultiple.focus();
      }
      // });
      window.on("closed", () => {
        windowFactura = null;
        windowFacturaMultiple = null;
      });
    }
  }
);

// Define una función para enviar datos a pagina2
ipcMain.on(
  "datos-a-pagina2",
  async (
    event,
    datos,
    encabezado,
    serviciosFijos,
    otrosServicios,
    datosAgua,
    datosTotales,
    editados,
    planillaAgrupada
  ) => {
    console.log("Datos a enviar: " + datos.mensaje);
    // await window.loadFile("src/ui/factura.html");
    // // // window.send("datos-a-pagina2", datos);
    // await window.show();

    //  windowFactura = new BrowserWindow({ show: true });
    windowFactura = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    await windowFactura.loadFile("src/ui/factura.html");
    // // window.send("datos-a-pagina2", datos);
    await windowFactura.show();

    await windowFactura.webContents.send(
      "datos-a-pagina2",
      datos,
      encabezado,
      serviciosFijos,
      otrosServicios,
      datosAgua,
      datosTotales,
      editados,
      planillaAgrupada
    );
  }
);
ipcMain.on(
  "generate-factura-individual-baucher",
  async (
    event,
    datos,
    encabezado,
    serviciosFijos,
    otrosServicios,
    datosAgua,
    datosTotales,
    editados,
    planillaAgrupada
  ) => {
    console.log("Datos a enviar: " + datos.mensaje);
    // await window.loadFile("src/ui/factura.html");
    // // // window.send("datos-a-pagina2", datos);
    // await window.show();

    //  windowFactura = new BrowserWindow({ show: true });
    windowFactura = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    await windowFactura.loadFile("src/ui/FacturaIndividualBaucher/facturaIndividualBaucher.html");
    // // window.send("datos-a-pagina2", datos);
    await windowFactura.show();

    await windowFactura.webContents.send(
      "generate-factura-individual-baucher",
      datos,
      encabezado,
      serviciosFijos,
      otrosServicios,
      datosAgua,
      datosTotales,
      editados,
      planillaAgrupada
    );
  }
);
ipcMain.on("cerrarFactura", async (event) => {
  console.log("Closing...");
  await windowFactura.close();
  windowFactura = null;
});
ipcMain.on("cerrarFacturaMultiple", async (event) => {
  console.log("Closing...");
  await windowFacturaMultiple.close();
  windowFacturaMultiple = null;
});
ipcMain.on("recargaComprobantes", async (event) => {
  console.log("Refrescando...");
  await window.webContents.send("recargaComprobantes");
});
ipcMain.on(
  "datos-a-pagina3",
  async (event, datos, encabezado, recaudaciones, datosTotales) => {
    console.log("Datos a enviar: " + datos.mensaje);
    // pagina2Window = new BrowserWindow({ show: false });
    await window.loadFile("src/ui/consolidado.html");
    // window.send("datos-a-pagina2", datos);
    await window.show();
    await window.webContents.send(
      "datos-a-pagina3",
      datos,
      encabezado,
      recaudaciones,
      datosTotales
    );
  }
);
ipcMain.on("contrato-desde-socios", async (event, socioId, socioCedula) => {
  console.log("Datos a enviar: " + socioId, socioCedula);

  // pagina2Window = new BrowserWindow({ show: false });
  await window.loadFile("src/ui/contratos.html");
  // window.send("datos-a-pagina2", datos);
  await window.show();
  await window.webContents.send("contrato-desde-socios", socioId, socioCedula);
});
// ****************************************************************
// ----------------------------------------------------------------
// Funciones de los cargos
// ----------------------------------------------------------------
ipcMain.handle("pido-datos", async () => {
  return servicioEnviar;
});
ipcMain.handle("getCargos", async () => {
  const conn = await getConnection();
  const results = conn.query("SELECT * FROM cargosempleados");
  console.log(results);
  return results;
});
// ****************************************************************
// ----------------------------------------------------------------
// Función para mostrar el diálogo de selección de directorios
// ----------------------------------------------------------------
ipcMain.handle("selectDirectory", async () => {
  // async function selectDirectory() {
  // }
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null; // El usuario canceló la selección
});

// ****************************************************************
// ----------------------------------------------------------------
// Funciones de los accesos
// ----------------------------------------------------------------
ipcMain.handle("getAccesos", async () => {
  const conn = await getConnection();
  const results = conn.query("SELECT * FROM roles");
  console.log(results);
  return results;
});
// ----------------------------------------------------------------
// Funciones de los usuarios
// ----------------------------------------------------------------
ipcMain.handle("getUsuarios", async (event, criterio, criterioContent) => {
  const conn = await getConnection();
  try {
    if (criterio === "all") {
      const results = conn.query("SELECT * FROM viewUsuarios");
      console.log(results);
      return results;
    } else {
      const results = conn.query(
        "SELECT * FROM viewUsuarios WHERE " +
          criterio +
          " like '%" +
          criterioContent +
          "%';"
      );
      console.log(results);
      return results;
    }
  } catch (error) {
    console.log(error);
  }
});
// ----------------------------------------------------------------
// Obtenemos los datos de los empleados que no son usuarios del sistema
// ----------------------------------------------------------------
ipcMain.handle("getEmpleados", async (event, criterio, criterioContent) => {
  const conn = await getConnection();
  try {
    if (criterio === "all") {
      const results = conn.query("SELECT * FROM viewEmpleados;");
      console.log(results);
      return results;
    } else {
      const results = conn.query(
        "SELECT * FROM viewEmpleados WHERE " +
          criterio +
          " like '%" +
          criterioContent +
          "%';"
      );
      console.log(results);
      return results;
    }
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("createUsuario", async (event, empleado, usuario) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", usuario);
    //   product.price = parseFloat(product.price);
    // const resultCargo = await conn.query(
    //   "Insert into cargosempleados set ? ;",
    //   cargo
    // );
    //empleado.cargosId = resultCargo.insertId;
    const resultEmpleado = await conn.query(
      "Insert into empleados set ? ;",
      empleado
    );
    usuario.empleadosId = resultEmpleado.insertId;
    const resultUsuario = await conn.query(
      "Insert into usuarios set ?",
      usuario
    );
    console.log(resultUsuario);
    event.sender.send("Notificar", {
      success: true,
      title: "Guardado!",
      message: "Se ha guardado el nuevo registro.",
    });
    usuario.id = resultUsuario.insertId;
    return usuario;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al guardar el registro.",
    });
    console.log(error);
  }
});
ipcMain.handle("createEmpleado", async (event, empleado) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", empleado);
    // const resultCargo = await conn.query(
    //   "Insert into cargosempleados set ? ;",
    //   cargo
    // );
    // console.log("Se inserto el cargo" + resultCargo.insertId);
    //empleado.cargosId = resultCargo.insertId;
    const resultEmpleado = await conn.query(
      "Insert into empleados set ? ;",
      empleado
    );
    console.log(resultEmpleado);
    event.sender.send("Notificar", {
      success: true,
      title: "Guardado!",
      message: "Se ha guardado el nuevo registro.",
    });
    empleado.id = resultEmpleado.insertId;
    return empleado;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al guardar el registro.",
    });
    console.error("Ha ocurrido un error: ", error);
  }
});
// ----------------------------------------------------------------
// Obtenemos los datos del empleado usuario del sistema
// ----------------------------------------------------------------

ipcMain.handle("getUsuarioById", async (event, id) => {
  const conn = await getConnection();
  const result = conn.query(
    "select empleados.id,empleados.cedula," +
      "empleados.primerNombre,empleados.segundoNombre,empleados.primerApellido," +
      "empleados.segundoApellido,empleados.telefono,empleados.correo," +
      "cargosempleados.id as cargosId,cargosempleados.cargo," +
      "cargosempleados.cargoDescripcion," +
      " usuarios.id as usuariosId,roles.id as rolesId,roles.rol,roles.rolDescripcion," +
      " usuarios.usuario,usuarios.clave,usuarios.fechaModificacion " +
      "from empleados join usuarios on empleados.id=usuarios.empleadosId join " +
      "cargosempleados on cargosempleados.id=empleados.cargosId " +
      "join roles on roles.id=usuarios.rolesId where empleados.id=?;",
    id
  );
  console.log(result);
  return result;
});
// ----------------------------------------------------------------
// Obtenemos los datos del empleado no usuario del sistema
// ----------------------------------------------------------------
ipcMain.handle("getEmpleadoById", async (event, id) => {
  const conn = await getConnection();
  const result = conn.query(
    "select empleados.id,empleados.cedula," +
      "empleados.primerNombre,empleados.segundoNombre,empleados.primerApellido," +
      "empleados.segundoApellido,empleados.telefono,empleados.correo," +
      "cargosempleados.id as cargosId,cargosempleados.cargo," +
      "cargosempleados.cargoDescripcion " +
      "from empleados join " +
      "cargosempleados on cargosempleados.id=empleados.cargosId where empleados.id=? ;",
    id
  );
  console.log(result);
  return result;
});
ipcMain.handle("updateUsuario", async (event, id, empleado, usuario) => {
  const conn = await getConnection();
  try {
    const resultEmpleado = await conn.query(
      "UPDATE empleados set ? where id = ?",
      [empleado, id]
    );
    console.log(resultEmpleado);
    if (
      usuario.usuario !== null &&
      usuario.usuario !== " " &&
      usuario.clave !== null &&
      usuario.clave !== " " &&
      usuario.rol !== null &&
      usuario.rol !== " " &&
      usuario.rolDescripcion !== null &&
      usuario.rolDescripcion !== " "
    ) {
      const usuarioExist = await conn.query(
        "SELECT * FROM usuarios WHERE usuarios.empleadosId=? order by usuarios.id desc limit 1;",
        id
      );
      if (usuarioExist.length > 0 && usuarioExist[0].id !== null) {
        console.log("existe el usuario: " + usuarioExist[0].id);
        const resultUsuario = await conn.query(
          "UPDATE usuarios set ? where empleadosId = ?;",
          [usuario, id]
        );
        console.log("Se actualizó el usuario", resultUsuario);
      } else {
        usuario.empleadosId = id;
        const resultUsuario = await conn.query(
          "INSERT INTO usuarios SET ?",
          usuario
        );
        console.log("Se creó el usuario", resultUsuario);
      }
    }
    event.sender.send("Notificar", {
      success: true,
      title: "Actualizado!",
      message: "Se ha actualizado el registro.",
    });
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al actualizar el registro.",
    });
  }
});
// ----------------------------------------------------------------
// ----------------------------------------------------------------
ipcMain.handle("updateEmpleado", async (event, id, empleado) => {
  const conn = await getConnection();
  let resultEmpleado = null;
  try {
    const usuarioExist = await conn.query(
      "SELECT * FROM usuarios WHERE usuarios.empleadosId=? order by usuarios.id desc limit 1;",
      id
    );
    if (usuarioExist.length > 0 && usuarioExist[0].id !== null) {
      console.log("existe el usuario: " + usuarioExist[0].id);
      empleado.usuariosn = "Si";
      resultEmpleado = await conn.query("UPDATE empleados set ? where id = ?", [
        empleado,
        id,
      ]);
      console.log(resultEmpleado);
    } else {
      empleado.usuariosn = "No";
      resultEmpleado = await conn.query("UPDATE empleados set ? where id = ?", [
        empleado,
        id,
      ]);
      console.log(resultEmpleado);
    }
    event.sender.send("Notificar", {
      success: true,
      title: "Actualizado!",
      message: "Se ha actualizado el registro.",
    });
    return resultEmpleado;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al actualizar el registro.",
    });
    console.log(error);
  }
});
// ----------------------------------------------------------------
// Eliminar un usuario del sistema
// ----------------------------------------------------------------
ipcMain.handle("deleteUsuario", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  try {
    const resultUsuario = await conn.query(
      "DELETE FROM usuarios WHERE  empleadosId=?",
      id
    );
    const resultEmpleado = await conn.query(
      "UPDATE empleados SET usuariosn='No' WHERE id =?;",
      id
    );
    console.log(resultEmpleado);
    event.sender.send("Notificar", {
      success: true,
      title: "Usuario eliminado!",
      message: "Se ha actualizado el registro.",
    });
    return resultEmpleado;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al actualizar el registro.",
    });
    console.log(error);
  }
});
// ----------------------------------------------------------------
// Eliminar un empleado
// ----------------------------------------------------------------
ipcMain.handle("deleteEmpleado", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  try {
    const resultEmpleado = await conn.query(
      "DELETE FROM empleados WHERE id =?;",
      id
    );
    event.sender.send("Notificar", {
      success: true,
      title: "Borrado!",
      message: "Se ha eliminado el usuario.",
    });
    console.log(resultEmpleado);
    return resultEmpleado;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al elimiar el registro.",
    });
  }
});

// Funciones de los socios
ipcMain.handle("getSocios", async (event, criterio, criterioContent) => {
  const conn = await getConnection();
  try {
    if (criterio === "all" || criterio === undefined) {
      const results = conn.query(
        "SELECT * FROM viewSocios order by primerApellido;"
      );
      console.log(results);
      return results;
    } else {
      const results = conn.query(
        "SELECT * FROM viewSocios where " +
          criterio +
          " like '%" +
          criterioContent +
          "%';"
      );
      console.log(results);
      return results;
    }
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("createSocio", async (event, socio) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", socio);
    const result = await conn.query("INSERT INTO socios SET ?", socio);
    console.log(result);
    // new Notification({
    //   title: "Regístro guardado",
    //   body: "Se registró al nuevo socio con exito!",
    // }).show();serviserviciosId
    event.sender.send("Notificar", {
      success: true,
      title: "Guardado!",
      message: "Se ha guardado el registro.",
    });
    socio.id = result.insertId;
    return socio;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al guardar el registro.",
    });
    console.log(error);
  }
});
ipcMain.handle("getSocioById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("SELECT * FROM socios WHERE id = ?", id);
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("getContratanteByCedula", async (event, cedula) => {
  const conn = await getConnection();
  const result = await conn.query(
    "Select * from socios where socios.cedulaPasaporte = ?",
    cedula
  );
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("updateSocio", async (event, id, socio) => {
  const conn = await getConnection();
  try {
    const result = await conn.query("UPDATE socios SET ? WHERE id = ?", [
      socio,
      id,
    ]);
    event.sender.send("Notificar", {
      success: true,
      title: "Actualizado!",
      message: "Se ha actualizado el registro.",
    });
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al actualizar el registro.",
    });
  }
});
ipcMain.handle("deleteSocio", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  try {
    const result = await conn.query("DELETE FROM socios WHERE id = ?", id);
    event.sender.send("Notificar", {
      success: true,
      title: "Borrado!",
      message: "Se ha eliminado el usuario.",
    });
    console.log(result);
    return result;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al elimiar el registro.",
    });
    console.log(error);
  }
});
// ----------------------------------------------------------------
// Funciones de los implementos
// Esta tabla esta relacionada de uno a muchos con inventario
// ----------------------------------------------------------------
ipcMain.handle("getImplementos", async () => {
  const conn = await getConnection();
  const results = conn.query(
    "SELECT * FROM viewimplementosinvenatrio order by implementosId desc;"
  );
  console.log(results);
  return results;
});
ipcMain.handle("createImplemento", async (event, implemento, inventario) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", implemento, inventario);
    //   product.price = parseFloat(product.price);
    const resultImplemento = await conn.query(
      "INSERT INTO implementos set ?;",
      implemento
    );
    inventario.implementosId = resultImplemento.insertId;
    const resulInventario = await conn.query(
      "INSERT INTO inventario set ?;",
      inventario
    );
    console.log(resultImplemento, resulInventario);
    new Notification({
      title: "SCAP Santo Domingo No.1",
      body: implemento.nombre + " se há registrado :)",
    }).show();
    implemento.id = result.insertId;
    return resulInventario;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getImplementoById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT * FROM viewimplementosinvenatrio where implementosId = ?",
    id
  );
  console.log("Resultado", result[0]);
  return result[0];
});
ipcMain.handle(
  "updateImplemento",
  async (event, id, implemento, inventario) => {
    try {
      const conn = await getConnection();
      const resultImplemento = await conn.query(
        "UPDATE implementos SET ? where id = ?",
        [implemento, id]
      );
      const resultInventario = await conn.query(
        "UPDATE inventario SET ? where implementosId = ?",
        [inventario, id]
      );
      new Notification({
        title: "SCAP Santo Domingo No.1",
        body: implemento.nombre + " se ha actualizado :)",
      }).show();
      console.log(resultInventario, resultImplemento);
      return resultImplemento;
    } catch (error) {
      new Notification({
        title: "SCAP Santo Domingo No.1",
        body: "Ha ocurrido un error en la actualización :(",
      }).show();
      console.log(error);
    }
  }
);
ipcMain.handle("deleteImplemento", async (event, id) => {
  console.log("id from main.js: ", id);
  try {
    const conn = await getConnection();
    const resultInventario = await conn.query(
      "DELETE FROM inventario WHERE implementosId = ?",
      id
    );
    const resultImplemento = await conn.query(
      "DELETE from implementos where id = ?",
      id
    );
    new Notification({
      title: "SCAP Santo Domingo No.1",
      body: "Se há eliminado el registro :)",
    }).show();
    console.log(resultInventario, resultImplemento);
    return resultInventario;
  } catch (error) {
    new Notification({
      title: "SCAP Santo Domingo No.1",
      body: "Ha ocurrido un error al eliminar el registro :(",
    }).show();
    console.log(error);
  }
});

// ----------------------------------------------------------------
// Funciones de los servicios fijos
// ----------------------------------------------------------------
ipcMain.handle(
  "getServiciosFijos",
  async (event, criterio, criterioContent, mes, anio) => {
    console.log("Criterios: " + mes, anio);
    const conn = await getConnection();
    if (mes == undefined) {
      mes = "all";
    }
    if (anio == undefined) {
      anio = "all";
    }
    try {
      if (criterio == "all" || criterio == undefined) {
        if (mes == "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where tipo='Servicio fijo'order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              "tipo='Servicio fijo' AND month(fechaCreacion)='" +
              mes +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes == "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              "tipo='Servicio fijo' AND year(fechaCreacion) = '" +
              anio +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              "tipo='Servicio fijo' AND month(fechaCreacion)='" +
              mes +
              "' AND year(fechaCreacion) = '" +
              anio +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        }
      } else {
        if (mes == "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Servicio fijo'order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Servicio fijo' AND month(fechaCreacion)= '" +
              mes +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes == "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Servicio fijo' AND year(fechaCreacion) = '" +
              anio +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Servicio fijo' AND month(fechaCreacion)= '" +
              mes +
              "' AND year(fechaCreacion) = '" +
              anio +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
);
ipcMain.handle("createServiciosFijos", async (event, servicio) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", servicio);
    const resultServicio = await conn.query(
      "INSERT INTO servicios set ?;",
      servicio
    );
    servicio.id = resultServicio.insertId;
    console.log(resultServicio);
    event.sender.send("Notificar", {
      success: true,
      title: "Guardado!",
      message: "Se ha guardado un nuevo servicio fijo.",
    });
    return resultServicio;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al guardar el servicio.",
    });
    console.log(error);
  }
});
ipcMain.handle("getServiciosFijosById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT * FROM viewServicios where id = ?",
    id
  );

  console.log("Resultado", result[0]);
  return result[0];
});
// ipcMain.handle("getServiciosContratados", async (event) => {
//   const conn = await getConnection();
//   const result = await conn.query("SELECT * FROM viewServiciosFijos");

//   console.log("Resultado", result);
//   return result;
// });
ipcMain.handle("getServiciosDisponibles", async (event) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT * FROM viewServicios where tipo='Servicio fijo';"
  );
  console.log("Resultado", result);
  return result;
});
ipcMain.handle("updateServiciosFijos", async (event, id, servicio) => {
  try {
    const conn = await getConnection();
    const resultServicio = await conn.query(
      "UPDATE servicios SET ? where id = ?",
      [servicio, id]
    );

    if (resultServicio) {
      const resultServicioContratado = await conn.query(
        "Update serviciosContratados set valorIndividual=?, valorPagosIndividual=? where serviciosId=? ;",
        [servicio.valor, servicio.valor, id]
      );
    }

    new Notification({
      title: "SCAP Santo Domingo No.1",
      body: servicio.nombre + " se ha actualizado :)",
    }).show();
    console.log(resultServicio);
    return resultServicio;
  } catch (error) {
    new Notification({
      title: "SCAP Santo Domingo No.1",
      body: "Ha ocurrido un error en la actualización :(",
    }).show();
    console.log(error);
  }
});
ipcMain.handle("deleteServiciosFijos", async (event, id) => {
  console.log("id from main.js: ", id);
  try {
    const conn = await getConnection();
    const resultServicio = await conn.query(
      "DELETE FROM servicios WHERE id = ?",
      id
    );

    new Notification({
      title: "SCAP Santo Domingo No.1",
      body: "Se há eliminado el registro :)",
    }).show();
    console.log(resultServicio);
    return resultServicio;
  } catch (error) {
    new Notification({
      title: "SCAP Santo Domingo No.1",
      body: "Ha ocurrido un error al eliminar el registro :(",
    }).show();
    console.log(error);
  }
});

ipcMain.handle("getServiciosContratadosById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT * FROM viewServiciosContratados where id =" +
      id +
      " and tipo='Servicio fijo' and estado='Activo';"
  );

  console.log("Resultado", result);
  return result;
});

ipcMain.handle(
  "getContratos",
  async (event, criterio, criterioContent, sectores) => {
    console.log("Criterios: ", criterio, criterioContent, sectores);
    try {
      const conn = await getConnection();
      if (sectores == "all" || sectores == undefined) {
        sectores = "";
      }
      if (criterio === "all" || criterio === undefined) {
        const result = await conn.query(
          "SELECT * FROM viewContratos WHERE codigo " +
            "like '%" +
            sectores +
            "%' ;"
        );
        console.log("Resultado: ", result);
        return result;
      } else {
        const result = await conn.query(
          "SELECT * FROM viewContratos  WHERE " +
            criterio +
            " like '%" +
            criterioContent +
            "%' AND codigo " +
            "like '%" +
            sectores +
            "%' ;"
        );
        console.log("Resultado: ", result);
        return result;
      }
    } catch (error) {
      console.log(error);
    }
  }
);
ipcMain.handle("getContratadosById", async (event, servicioId) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT contratosId FROM serviciosContratados WHERE NOT estado='Innactivo' and " +
      "serviciosId=? ;",
    servicioId
  );

  console.log("Resultado: ", result);
  return result;
});
ipcMain.handle("getRecaudaciones", async (event, servicioId, desde, hasta) => {
  const conn = await getConnection();
  console.log("Buscando: " + desde + " " + hasta);
  try {
    if (desde === "all" || desde === undefined) {
      const result = await conn.query(
        "CALL selectRecaudaciones(" + servicioId + ",'2023-01-01',now()); "
      );
      console.log("Resultado: ", result[0]);
      return result[0];
    } else {
      const result = await conn.query(
        "CALL selectRecaudaciones(" +
          servicioId +
          ",'" +
          desde +
          "','" +
          hasta +
          "'); "
      );
      console.log("Resultado: ", result[0]);
      return result[0];
    }
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getRecaudarByServicio", async (event, servicioId) => {
  console.log("Buscando: ", servicioId);
  try {
    const conn = await getConnection();
    const result = await conn.query(
      "SELECT * from viewEstadoPagos WHERE serviciosId= ? order by primerApellido;",
      servicioId
    );
    console.log("Resultados: ", result);
    return result;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getServicioAgua", async (event, contratoId, fechaEmision) => {
  try {
    const conn = await getConnection();
    const result = await conn.query(
      "SELECT * FROM viewDetallesServicio WHERE contratosId = " +
        contratoId +
        " AND month(fechaEmision) = month('" +
        fechaEmision +
        "') AND year(fechaEmision) = year('" +
        fechaEmision +
        "') AND nombre='Agua Potable';"
    );

    console.log("Resultado agua:", result[0]);
    return result[0];
  } catch (error) {
    console.log("Error al buscar servicioAgua: " + error);
  }
});
// Insertar servicioGuia
ipcMain.handle("createServicioGuia", async (event, servicioGuia) => {
  try {
    const conn = await getConnection();
    const guia = await conn.query(
      "SELECT * FROM servicios WHERE nombre='Socio comuna';"
    );
    if (guia.length > 0) {
      servicioGuia.serviciosId = guia[0].id;
      const result = await conn.query(
        "INSERT INTO serviciosContratados set ? ;",
        servicioGuia
      );
      return result;
    }
  } catch (error) {
    console.log(error);
  }
});
// Insertar servicio de recargo
ipcMain.handle("createRecargo", async (event, servicioRecargo) => {
  try {
    const conn = await getConnection();
    const recargo = await conn.query(
      "SELECT * FROM servicios WHERE nombre='Recargo';"
    );
    if (recargo.length > 0) {
      servicioRecargo.serviciosId = recargo[0].id;
      const result = await conn.query(
        "INSERT INTO serviciosContratados set ? ;",
        servicioRecargo
      );
      return result;
    }
  } catch (error) {
    console.log(error);
  }
});
// ----------------------------------------------------------------
// Funciones de las cuotas
// ----------------------------------------------------------------
ipcMain.handle(
  "getRecaudacionesCuotas",
  async (event, criterio, criterioContent, mes, anio) => {
    console.log("Criterios: " + mes, anio);
    const conn = await getConnection();
    if (mes == undefined) {
      mes = "all";
    }
    if (anio == undefined) {
      anio = "all";
    }
    try {
      if (criterio == "all" || criterio == undefined) {
        if (mes == "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewEstadoPagos where tipo='Cuota' and not estadoDetalles ='Anulado' ;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewEstadoPagos where " +
              "tipo='Cuota' AND month(fechaCreacion)='" +
              mes +
              "' where not estadoDetalles ='Anulado' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes == "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewEstadoPagos where " +
              "tipo='Cuota' AND year(fechaCreacion) = '" +
              anio +
              "' where not estadoDetalles ='Anulado' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewEstadoPagos where " +
              "tipo='Cuota' AND month(fechaCreacion)='" +
              mes +
              "' AND year(fechaCreacion) = '" +
              anio +
              "' where not estadoDetalles ='Anulado' order by id asc;"
          );
          console.log(results);
          return results;
        }
      } else {
        if (mes == "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewEstadoPagos where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Cuota' where not estadoDetalles ='Anulado' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewEstadoPagos where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Cuota' AND month(fechaCreacion)= '" +
              mes +
              "' where not estadoDetalles ='Anulado' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes == "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewEstadoPagos where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Cuota' AND year(fechaCreacion) = '" +
              anio +
              "' where not estadoDetalles ='Anulado' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewEstadoPagos where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Cuota' AND month(fechaCreacion)= '" +
              mes +
              "' AND year(fechaCreacion) = '" +
              anio +
              "' where not estadoDetalles ='Anulado' order by id asc;"
          );
          console.log(results);
          return results;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
);
ipcMain.handle(
  "getCuotas",
  async (event, criterio, criterioContent, mes, anio) => {
    console.log("Criterios: " + mes, anio);
    const conn = await getConnection();
    if (mes == undefined) {
      mes = "all";
    }
    if (anio == undefined) {
      anio = "all";
    }
    try {
      if (criterio == "all" || criterio == undefined) {
        if (mes == "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where tipo='Cuota'order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              "tipo='Cuota' AND month(fechaCreacion)='" +
              mes +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes == "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              "tipo='Cuota' AND year(fechaCreacion) = '" +
              anio +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              "tipo='Cuota' AND month(fechaCreacion)='" +
              mes +
              "' AND year(fechaCreacion) = '" +
              anio +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        }
      } else {
        if (mes == "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Cuota'order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio == "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Cuota' AND month(fechaCreacion)= '" +
              mes +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes == "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Cuota' AND year(fechaCreacion) = '" +
              anio +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        } else if (mes !== "all" && anio !== "all") {
          const results = conn.query(
            "SELECT * FROM viewServicios where " +
              criterio +
              " like '%" +
              criterioContent +
              "%'" +
              " and tipo='Cuota' AND month(fechaCreacion)= '" +
              mes +
              "' AND year(fechaCreacion) = '" +
              anio +
              "' order by id asc;"
          );
          console.log(results);
          return results;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
);
ipcMain.handle("getCuotasById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT * FROM viewServicios where id = ?",
    id
  );

  console.log("Resultado", result[0]);
  return result[0];
});
ipcMain.handle("createCuotas", async (event, cuota) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", cuota);
    const resultServicio = await conn.query(
      "INSERT INTO servicios set ?;",
      cuota
    );
    cuota.id = resultServicio.insertId;
    console.log(resultServicio);
    event.sender.send("Notificar", {
      success: true,
      title: "Guardado!",
      message: "Se ha guardado un nuevo servicio ocacional.",
    });
    return resultServicio;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al guardar el servicio ocacional.",
    });
    console.log(error);
  }
});
ipcMain.handle(
  "createServicioContratadoMultiple",
  async (event, contratar, socioId, individualSn) => {
    try {
      const conn = await getConnection();
      console.log("Recibido: ", contratar, " ", individualSn);

      if (individualSn == "No") {
        console.log("No es individual ");
        // consultamos si ya existe un contrato con el id del socio que presente este valor
        const socioContratanteExiste = await conn.query(
          "SELECT * FROM viewServiciosContratados WHERE serviciosId=" +
            contratar.serviciosId +
            " AND sociosId=" +
            socioId +
            " ;"
        );
        if (!socioContratanteExiste.length > 0) {
          console.log("No lo encontro");
          const contratadoExiste = await conn.query(
            "SELECT count(id) as existe FROM serviciosContratados WHERE " +
              "serviciosId= " +
              contratar.serviciosId +
              " AND " +
              "contratosId= " +
              contratar.contratosId +
              ";"
          );
          if (!contratadoExiste[0].existe > 0) {
            const resultServicio = await conn.query(
              "INSERT INTO serviciosContratados set ?;",
              contratar
            );
            console.log(resultServicio);
            event.sender.send("Notificar", {
              success: true,
              title: "Contratado para todos!",
              message: "Contratado.",
            });
            contratar.id = resultServicio.insertId;
            return resultServicio;
          } else {
            event.sender.send("Notificacion", {
              success: false,
              title: "Error al contratar todos!",
              message: "El servicio ya ha sido registrado en este contrato.",
            });
          }
        }
      } else {
        console.log("Es individual");

        const contratadoExiste = await conn.query(
          "SELECT count(id) as existe FROM serviciosContratados WHERE " +
            "serviciosId= " +
            contratar.serviciosId +
            " AND " +
            "contratosId= " +
            contratar.contratosId +
            ";"
        );
        if (!contratadoExiste[0].existe > 0) {
          const resultServicio = await conn.query(
            "INSERT INTO serviciosContratados set ?;",
            contratar
          );
          console.log(resultServicio);
          event.sender.send("Notificacion", {
            success: true,
            title: "Guardado!",
            message: "Contratado.",
          });
          contratar.id = resultServicio.insertId;
          return resultServicio;
        } else {
          event.sender.send("Notificacion", {
            success: false,
            title: "Error!",
            message: "El servicio ya ha sido registrado en este contrato.",
          });
        }
      }
    } catch (error) {
      event.sender.send("Notificar", {
        success: false,
        title: "Error!",
        message: "Ha ocurrido un error al contratar.",
      });
      console.log(error);
    }
  }
);
ipcMain.handle(
  "createServicioContratado",
  async (event, contratar, socioId, individualSn) => {
    try {
      const conn = await getConnection();
      console.log("Recibido: ", contratar, " ", individualSn);

      if (individualSn == "No") {
        console.log("No es individual ");
        // consultamos si ya existe un contrato con el id del socio que presente este valor
        const socioContratanteExiste = await conn.query(
          "SELECT * FROM viewServiciosContratados WHERE serviciosId=" +
            contratar.serviciosId +
            " AND sociosId=" +
            socioId +
            " ;"
        );
        if (!socioContratanteExiste.length > 0) {
          console.log("No lo encontro");
          const contratadoExiste = await conn.query(
            "SELECT count(id) as existe FROM serviciosContratados WHERE " +
              "serviciosId= " +
              contratar.serviciosId +
              " AND " +
              "contratosId= " +
              contratar.contratosId +
              ";"
          );
          if (!contratadoExiste[0].existe > 0) {
            const resultServicio = await conn.query(
              "INSERT INTO serviciosContratados set ?;",
              contratar
            );
            console.log(resultServicio);
            event.sender.send("Notificar", {
              success: true,
              title: "Guardado!",
              message: "Contratado.",
            });
            contratar.id = resultServicio.insertId;
            return resultServicio;
          } else {
            event.sender.send("Notificar", {
              success: false,
              title: "Error!",
              message: "El servicio ya ha sido registrado en este contrato.",
            });
          }
        }
      } else {
        console.log("Es individual");

        const contratadoExiste = await conn.query(
          "SELECT count(id) as existe FROM serviciosContratados WHERE " +
            "serviciosId= " +
            contratar.serviciosId +
            " AND " +
            "contratosId= " +
            contratar.contratosId +
            ";"
        );
        if (!contratadoExiste[0].existe > 0) {
          const resultServicio = await conn.query(
            "INSERT INTO serviciosContratados set ?;",
            contratar
          );
          console.log(resultServicio);
          event.sender.send("Notificar", {
            success: true,
            title: "Guardado!",
            message: "Contratado.",
          });
          contratar.id = resultServicio.insertId;
          return resultServicio;
        } else {
          event.sender.send("Notificar", {
            success: false,
            title: "Error!",
            message: "El servicio ya ha sido registrado en este contrato.",
          });
        }
      }
    } catch (error) {
      event.sender.send("Notificar", {
        success: false,
        title: "Error!",
        message: "Ha ocurrido un error al contratar.",
      });
      console.log(error);
    }
  }
);

ipcMain.handle("deleteContratadoDetalle", async (event, descontratar) => {
  let canceladoSn = false;
  let cancelados = 0;

  try {
    const conn = await getConnection();
    console.log("Recibido: ", descontratar);
    const detallesServicio = await conn.query(
      "SELECT * FROM detallesServicio WHERE serviciosContratadosId =" +
        descontratar +
        ";"
    );

    if (detallesServicio.length > 0) {
      console.log("Array con datos.");
      const canceladoExiste = detallesServicio.find(
        (cancelado) => cancelado.estado === "Cancelado"
      );

      if (canceladoExiste) {
        console.log("Se encontró un detalle cancelado:", canceladoExiste);

        event.sender.send("Notificar", {
          success: false,
          title: "Error!",
          message:
            "Este servicio ya ha sido cancelado por lo que no puedes eliminarlo.",
        });
      } else {
        console.log("Ningún detalle cancelado fue encontrado.");
        detallesServicio.forEach(async (detalleServicio) => {
          const resultDetalle = await conn.query(
            "DELETE FROM detallesServicio WHERE id=" + detalleServicio.id + ";"
          );

          console.log(resultDetalle);
        });
        const resultContratado = await conn.query(
          "DELETE FROM serviciosContratados WHERE id=" + descontratar + ";"
        );
        event.sender.send("Notificar", {
          success: true,
          title: "Borrado!",
          message: "Se ha eliminado este servicio para este contrato.",
        });
        return resultContratado;
      }
    } else {
      console.log("Array sin datos");
      const resultContratado = await conn.query(
        "DELETE FROM serviciosContratados WHERE id= " + descontratar + ";"
      );
      console.log(resultContratado);
      event.sender.send("Notificar", {
        success: true,
        title: "Borrado!",
        message: "Se ha eliminado este servicio para este contrato.",
      });
      return resultContratado;
    }

    //   }
    // }
    // // const detalleExiste = await conn.query(
    // //   "SELECT count(id) as existe,estado FROM detallesServicio WHERE " +
    // //     "id= " +
    // //     descontratar.id +
    // //     ";"
    // // );
    // // if (!contratadoExiste[0].existe > 0) {
    // //   if (
    // //     contratadoExiste[0].estado !== null &&
    // //     contratadoExiste[0].estado == "Por cancelar"
    // //   ) {
    // //     canceladoSn = true;
    // //     const resultDetalle = await conn.query(
    // //       "DELETE FROM detallesServicio WHERE id= ",
    // //       descontratar.id
    // //     );
    // //     const resultContratado = await conn.query(
    // //       "DELETE FROM serviciosContratados WHERE id= ",
    // //       descontratar.serviciosContratadosId
    // //     );
    //     console.log(resultServicio);
    // event.sender.send("Notificar", {
    //   success: true,
    //   title: "Borrado!",
    //   message: "Se ha eliminado este servicio para este contrato.",
    // });
    //     return resultContratado;
    // } else {
    //   event.sender.send("Notificar", {
    //     success: false,
    //     title: "Error!",
    //     message:
    //       "Este servicio ya ha sido cancelado por lo que no puedes eliminarlo.",
    //   });
    // }
    // } else {
    //   event.sender.send("Notificar", {
    //     success: false,
    //     title: "Error!",
    //     message:
    //       "El servicio ya ha sido eliminado o no esta registrado en este contrato.",
    //   });
    // }
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al descontratar el servicio.",
    });
    console.log(error);
  }
});
ipcMain.handle("updateContratadoDetalle", async (event, detallesActualizar) => {
  let contratoId = detallesActualizar.contratosId;
  const newContratado = {
    estado: detallesActualizar.estado,
    valorIndividual: detallesActualizar.valorIndividual,
    numeroPagosIndividual: detallesActualizar.numeroPagosIndividual,
    valorPagosIndividual: detallesActualizar.valorPagosIndividual,
    descuentoValor: detallesActualizar.descuentoValor,
    descuentosId: detallesActualizar.descuentosId,
  };
  try {
    const conn = await getConnection();
    console.log("Recibido: ", detallesActualizar);
    const detallesServicio = await conn.query(
      "SELECT * FROM detallesServicio WHERE serviciosContratadosId =" +
        detallesActualizar.id +
        ";"
    );

    if (detallesServicio.length > 0) {
      console.log("Detalles existentes");
      const canceladoExiste = detallesServicio.find(
        (cancelado) => cancelado.estado === "Cancelado"
      );

      if (canceladoExiste) {
        console.log("Se encontró un detalle cancelado:", canceladoExiste);

        event.sender.send("Notificar", {
          success: false,
          title: "Error!",
          message:
            "Este servicio ya ha sido cancelado por lo que no puedes actualizarlo.",
        });
      } else {
        let editFechaEmision = "";
        console.log("Ningún detalle cancelado fue encontrado.");
        // detallesServicio.forEach(async (detalleServicio) => {
        // Guardamos la primera fecha de emision
        editFechaEmision = detallesServicio[0].fechaEmision;
        // Borramos los detallesServicio
        const resultDetalle = await conn.query(
          "DELETE FROM detallesServicio WHERE serviciosContratadosId=" +
            detallesActualizar.id +
            ";"
        );
        console.log(resultDetalle);
        // // Actualiamos los valores del servicio contratado
        const resultContratado = await conn.query(
          "UPDATE serviciosContratados set ? WHERE id=" +
            detallesActualizar.id +
            " ;",
          newContratado
        );
        // if (detallesActualizar.numeroPagosIndividual > 1) {
        //   console.log('Entro...')
        //   // Consulto las fechas de emison que existen despues de la que se ha guardado
        //   const fechasExistentes = await conn.query(
        //     "SELECT fechaEmision FROM viewPlanillas WHERE fechaEmision >= ? AND contratosId=? GROUP BY fechaEmision;",
        //     [formatearFecha(editFechaEmision), contratoId]
        //   );

        //   // });

        //   // Creamos de nuevo los detalles del servicio por cada fecha que exista
        //     fechasExistentes.forEach(async (fechaExistente) => {
        //       await createCuentaServicios(
        //         contratoId,
        //         formatearFecha(fechaExistente)
        //       );
        //     });
        //   } else {
        //     await createCuentaServicios(
        //       contratoId,
        //       formatearFecha(editFechaEmision)
        //     );
        // }
        if (detallesActualizar.numeroPagosIndividual > 1) {
          console.log("Entro...");

          // Consulto las fechas de emision que existen despues de la que se ha guardado
          const fechasExistentes = await conn.query(
            "SELECT fechaEmision FROM viewPlanillas WHERE fechaEmision >= ? AND contratosId=? GROUP BY fechaEmision;",
            [formatearFecha(editFechaEmision), contratoId]
          );

          // Creamos de nuevo los detalles del servicio por cada fecha que exista
          const promesasCreacion = fechasExistentes.map(
            async (fechaExistente) => {
              await createCuentaServicios(
                contratoId,
                formatearFecha(fechaExistente)
              );
            }
          );

          // Esperar a que todas las promesas se resuelvan
          await Promise.all(promesasCreacion);
        } else {
          await createCuentaServicios(
            contratoId,
            formatearFecha(editFechaEmision)
          );
        }
        event.sender.send("Notificar", {
          success: true,
          title: "Actualizado!",
          message: "Se ha actualizado este servicio para este contrato.",
        });
        return resultContratado;
      }
    } else {
      console.log("Array sin datos");
      const resultContratado = await conn.query(
        "UPDATE serviciosContratados set ?   WHERE id=" +
          detallesActualizar.id +
          " ;",
        newContratado
      );
      console.log(resultContratado);
      event.sender.send("Notificar", {
        success: true,
        title: "Actualizado!",
        message: "Se ha actualizado este servicio para este contrato.",
      });
      return resultContratado;
    }
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al descontratar el servicio.",
    });
    console.log(error);
  }
});
ipcMain.handle("updateCuotas", async (event, id, cuota) => {
  try {
    const conn = await getConnection();
    const resultServicio = await conn.query(
      "UPDATE servicios SET ? where id = ?",
      [cuota, id]
    );
    event.sender.send("Notificar", {
      success: true,
      title: "Actualizado!",
      message: "Se ha actualizado el servicio ocacional.",
    });
    console.log(resultServicio);
    return resultServicio;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al actualizar el servicio ocacional.",
    });
    console.log(error);
  }
});
ipcMain.handle("deleteCuotas", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  try {
    const result = await conn.query("DELETE FROM servicios WHERE id = ?", id);
    event.sender.send("Notificar", {
      success: true,
      title: "Borrado!",
      message: "Se ha eliminado el servicio ocacional.",
    });
    console.log(result);
    return result;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al elimiar el registro.",
    });
    console.log(error);
  }
});
ipcMain.handle(
  "getContratadoByServicioContrato",
  async (event, servicioId, contratoId) => {
    try {
      const conn = await getConnection();
      const result = await conn.query(
        "SELECT * FROM viewServiciosContratados WHERE " +
          "serviciosId=" +
          servicioId +
          " AND id=" +
          contratoId +
          " ;"
      );
      console.log("Resultado de contratado: " + result[0]);
      return result;
    } catch (error) {
      console.log("Error :" + error);
    }
  }
);
// ----------------------------------------------------------------
//   funciones de los Descuentos
// ----------------------------------------------------------------
ipcMain.handle("getDescuentos", async () => {
  const conn = await getConnection();
  const results = conn.query("SELECT * FROM tiposDescuento;");
  console.log(results);
  return results;
});
// ----------------------------------------------------------------
//   funciones de los Medidores
// ----------------------------------------------------------------
ipcMain.handle("getMedidores", async () => {
  const conn = await getConnection();
  const results = conn.query("Select * from medidores order by id desc;");
  console.log(results);
  return results;
});
ipcMain.handle("getMedidoresDisponibles", async () => {
  const conn = await getConnection();
  const results = conn.query(
    "Select * from implementos where implementos.nombre='Medidor' and implementos.stock>0 order by id desc;"
  );
  console.log(results);
  return results;
});
ipcMain.handle("getMedidorDisponibleById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from implementos where id = ?", id);
  console.log(result[0]);
  return result[0];
});
// No estamos usando esta función.
// ipcMain.handle("createMedidor", async (event, medidor) => {
//   try {
//     const conn = await getConnection();
//     console.log("Recibido: ", medidor);
//     //   product.price = parseFloat(product.price);
//     const result = await conn.query("Insert into medidores set ?", medidor);
//     console.log(result);
//     new Notification({
//       title: "Electrom Mysql",
//       body: "New medidor saved succesfully",
//     }).show();
//     medidor.id = result.insertId;
//     return medidor;
//   } catch (error) {
//     console.log(error);
//   }
// });
ipcMain.handle("getMedidorById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from medidores where id = ?", id);
  console.log(result[0]);
  return result[0];
});
// Borrar en caso de no usar
// ipcMain.handle("getDatosMedidorById", async (event, id) => {
//   const conn = await getConnection();
//   var result = "";
//   result = await conn.query(
//     "select medidores.id as medidorId,medidores.codigo,medidores.fechaInstalacion," +
//       "medidores.marca,medidores.barrio,medidores.callePrincipal,medidores.calleSecundaria," +
//       "medidores.numeroCasa,medidores.referencia,medidores.observacion,contratos.id as " +
//       "contratosId,contratos.fecha as fechaContrato,contratos.pagoEscrituras,contratos.pagoRecoleccionDesechos," +
//       "contratos.pagoAlcanterillado,contratos.pagoAguaPotable,socios.id as sociosId," +
//       "socios.nombre,socios.apellido,socios.cedula from medidores join contratos on " +
//       "contratos.id=medidores.contratosId join socios on socios.id=contratos.sociosId " +
//       "where contratos.id=?;",
//     id
//   );

//   console.log("Datos medidor: ", result[0]);
//   if (result[0] == undefined) {
//     result = await conn.query(
//       "select contratos.id as " +
//         "contratosId,contratos.fecha as fechaContrato,contratos.pagoEscrituras," +
//         "contratos.pagoRecoleccionDesechos," +
//         "contratos.pagoAlcanterillado,contratos.pagoAguaPotable,socios.id as sociosId," +
//         "socios.nombre,socios.apellido,socios.cedula from contratos join socios on " +
//         "socios.id=contratos.sociosId " +
//         "where contratos.id=?;",
//       id
//     );
//   }
//   return result[0];
// });

ipcMain.handle("deleteMedidor", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  const result = await conn.query("DELETE from medidores where id = ?", id);
  console.log(result);
  return result;
});
// ----------------------------------------------------------------
// Funciones de los sectores
// ----------------------------------------------------------------
// Obtener los sectores y sus atributos
ipcMain.handle("getSectores", async () => {
  const conn = await getConnection();
  const results = conn.query("SELECT * FROM sectores;");
  console.log(results);
  return results;
});
// ----------------------------------------------------------------
// Funciones de los contratos
// ----------------------------------------------------------------
// Verificar contratos anteriores de los socios
ipcMain.handle("getContratosAnterioresByCedula", async (event, cedula) => {
  var sinMedidor;
  var conMedidor = 0;
  var contratos = 0;
  let contratosTotal = [];
  const conn = await getConnection();
  try {
    const sinMedidores = await conn.query(
      // "select count(contratos.id)as sinMedidor,contratos.fecha,socios.cedulaPasaporte from contratos " +
      //   "join socios on socios.id=contratos.sociosId where " +
      //   "contratos.medidorSn='No' and socios.cedulaPasaporte='" +
      //   cedula +
      //   "' ; "
      "select * from viewContratos " +
        "where medidorSn='No' and cedulaPasaporte='" +
        cedula +
        "' ; "
    );
    const conMedidores = await conn.query(
      "select * from viewContratos " +
        "where medidorSn='Si' and cedulaPasaporte='" +
        cedula +
        "' ; "
    );
    sinMedidor = sinMedidores.length;
    conMedidor = conMedidores.length;

    // sinMedidor: sinMedidor,
    // conMedidor: conMedidor,

    if (sinMedidor == 0 && conMedidor > 0) {
      let listasectores = "";
      conMedidores.forEach((contrato) => {
        listasectores = listasectores + contrato.barrio + ", ";
      });
      event.sender.send(
        "showAlertMedidoresExistentes",
        "Este usuario ya registra " +
          conMedidor +
          " contrato(s) con Medidor\n" +
          "Sector: " +
          listasectores +
          "\nVerifica el registro de contratos antes de crear uno nuevo!"
      );
      contratosTotal = conMedidores;
    } else if (sinMedidor > 0 && conMedidor == 0) {
      let listasectores = "";
      sinMedidores.forEach((contrato) => {
        listasectores = listasectores + contrato.barrio + ", ";
      });
      event.sender.send(
        "showAlertMedidoresExistentes",
        "Este usuario ya registra " +
          sinMedidor +
          " contrato(s) sin Medidor\n" +
          "Sector: " +
          listasectores +
          "\nVerifica el registro de contratos antes de crear uno nuevo!"
      );
      contratosTotal = sinMedidores;
    } else if (sinMedidor > 0 && conMedidor > 0) {
      let listasectores = "";
      sinMedidores.forEach((contrato) => {
        listasectores = listasectores + contrato.barrio + ", ";
      });
      let listasectores2 = "";
      conMedidores.forEach((contrato) => {
        listasectores2 = listasectores2 + contrato.barrio + ", ";
      });
      event.sender.send(
        "showAlertMedidoresExistentes",
        "Este usuario ya registra " +
          sinMedidor +
          " contrato(s) sin Medidor\n" +
          "Sector: " +
          listasectores +
          "\n" +
          " y " +
          conMedidor +
          " contrato(s) con Medidor\n" +
          "  " +
          "Sector: " +
          listasectores2 +
          "\nVerifica el registro de contratos antes de crear uno nuevo!"
      );
      contratosTotal += conMedidores;
      contratosTotal += sinMedidores;
    }
    console.log(contratos);
    return contratosTotal;
  } catch (err) {
    console.log(err);
  }
});
ipcMain.handle("getContratosSimilares", async (event, socioId) => {
  try {
    const conn = await getConnection();
    const contratosSimilares = await conn.query(
      "SELECT * FROM contratos WHERE sociosId=?",
      socioId
    );
    return contratosSimilares;
  } catch (error) {
    console.log("Error al cargar contratos similares: ", error);
  }
});
ipcMain.handle(
  "getCompartidosContratados",
  async (event, servicioId, socioId) => {
    try {
      const conn = await getConnection();
      const compartidosAnteriores = await conn.query(
        "SELECT * FROM viewServiciosContratados where sociosId=" +
          socioId +
          " AND serviciosId=" +
          servicioId +
          " AND estado='Activo';"
      );
      console.log("Compartidos anteriores: ", compartidosAnteriores);
      return compartidosAnteriores;
    } catch (error) {
      console.log(error);
    }
  }
);
ipcMain.handle(
  "getContratosConMedidor",
  async (event, criterio, criterioContent) => {
    var contratosConMedidor;

    try {
      const conn = await getConnection();
      if (criterio == "all" || criterio == undefined) {
        contratosConMedidor = await conn.query(
          "SELECT * from viewContratos where medidorSn='Si' order by contratosId desc;"
        );
      } else {
        contratosConMedidor = await conn.query(
          "SELECT * from viewContratos where medidorSn='Si' AND " +
            criterio +
            " like '%" +
            criterioContent +
            "%'" +
            " order by contratosId desc;"
        );
      }
      console.log(contratosConMedidor);
      return contratosConMedidor;
    } catch (e) {
      Console.log(e);
    }
  }
);
ipcMain.handle(
  "getContratosSinMedidor",
  async (event, criterio, criterioContent) => {
    var contratosSinMedidor;
    try {
      const conn = await getConnection();
      if (criterio == "all" || criterio == undefined) {
        contratosSinMedidor = await conn.query(
          "SELECT * from viewContratos where medidorSn='No' order by contratosId desc;"
        );
      } else {
        contratosSinMedidor = await conn.query(
          "SELECT * from viewContratos where medidorSn='No' AND " +
            criterio +
            " like '%" +
            criterioContent +
            "%'" +
            " order by contratosId desc;"
        );
      }
      console.log(contratosSinMedidor);
      return contratosSinMedidor;
    } catch (e) {
      console.log(e);
    }
  }
);
ipcMain.handle("createContrato", async (event, contrato, numero, sectorId) => {
  try {
    console.log("Recibido:", event, contrato, numero, sectorId);
    const conn = await getConnection();
    const contratosAnteriores = await conn.query(
      "SELECT * FROM contratos WHERE  sociosId= ?",
      contrato.sociosId
    );
    if (contratosAnteriores.length > 0) {
      contrato.principalSn = "No";
    } else {
      contrato.principalSn = "Si";
    }
    console.log("Recibido: ", contrato);
    const result = await conn.query("Insert into contratos set ?", contrato);
    sumarSociosSectores(numero, sectorId);
    console.log(result);
    event.sender.send("Notificar", {
      success: true,
      title: "Guardado!",
      message: "Se ha registrado el nuevo contrato.",
    });

    contrato.id = result.insertId;
    return contrato;
  } catch (error) {
    console.log(error);
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al registrar el contrato.",
    });
  }
});
ipcMain.handle("getDatosContratosById", async (event, id) => {
  const conn = await getConnection();
  var mensaje = "NM: ";
  var result = "";
  result = await conn.query(
    "SELECT * FROM viewcontratosconmedidor where id=" + id + ";"
  );

  if (!result.length == 0) {
    mensaje = "Datos contrato con medidor: ";
  } else {
    result = await conn.query(
      "SELECT * FROM viewcontratossinmedidor where id=" + id + ";"
    );
    if (!result.length == 0) {
      mensaje = "Datos contrato sin medidor: ";
    } else {
      mensaje = "No se encontraron datos: ";
    }
  }
  console.log(mensaje, result[0]);
  return result[0];
});
ipcMain.handle("updatePrincipal", async (event, contratoId, socioId) => {
  try {
    const conn = await getConnection();
    const resultSecundarios = await conn.query(
      "UPDATE contratos SET principalSn='No' WHERE NOT contratos.id=" +
        contratoId +
        " AND contratos.sociosId=" +
        socioId +
        " ;"
    );
    const resultPrincipales = await conn.query(
      "UPDATE contratos SET principalSn='Si' WHERE contratos.id=" +
        contratoId +
        " AND contratos.sociosId=" +
        socioId +
        " ;"
    );
    event.sender.send("Notificar", {
      success: true,
      title: "Actualizado!",
      message: "Se han actualizado el registro del contrato.",
    });
    return contratoId;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al actualizar el contrato.",
    });
    console.log(error);
  }
});
async function sumarSociosSectores(numero, sectorId) {
  console.log("Recibido sectores: " + numero + " " + sectorId);
  try {
    const conn = await getConnection();
    const result = await conn.query(
      "Update sectores set numeroSocios=? WHERE id= ?",
      [numero, sectorId]
    );
    console.log(result);
    new Notification({
      title: "Registró guardado",
      body: "Se registró un nuevo usuario para sectores",
    }).show();
    return result;
  } catch (error) {
    console.log(error);
  }
}

ipcMain.handle("updateContrato", async (event, id, contrato) => {
  const conn = await getConnection();
  var result;
  try {
    result = await conn.query("UPDATE contratos  set ? where id = ?", [
      contrato,
      id,
    ]);
    event.sender.send("Notificar", {
      success: true,
      title: "Actualizado!",
      message: "Se han actualizado el registro del contrato.",
      contratoId: id,
    });
    return result;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al actualizar el contrato.",
    });
    console.log(error);
  }
});

ipcMain.handle("updateMedidor", async (event, id, medidor) => {
  try {
    const conn = await getConnection();
    var medidorExistente = await conn.query(
      "SELECT id FROM medidores  WHERE contratosId=" + id + ";"
    );
    if (medidorExistente[0] !== undefined) {
      console.log("resultado de buscar el medidor: " + medidorExistente[0]);
      console.log("ejecutando if");
      var result = await conn.query("UPDATE medidores set ? where id = ?", [
        medidor,
        medidorExistente[0].id,
      ]);

      event.sender.send("Notificar", {
        success: true,
        title: "Actualizado!",
        message: "Se han actualizado el registro del contrato.",
        contratoId: id,
      });
      console.log(result);
      return medidorExistente[0];
    } else {
      console.log("ejecutando else: ", medidor);
      result = await conn.query("INSERT INTO medidores set ?", medidor);
      event.sender.send("Notificar", {
        success: true,
        title: "Guardado!",
        message: "Se han actualizado el registro del contrato.",
        contratoId: id,
      });
      medidor.id = result.insertId;
      console.log(result);
      return medidor;
    }
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al actualizar el medidor.",
    });
    console.log("Error al actualizar el medidor: ", error);
  }
});

ipcMain.handle(
  "createServiciosContratados",
  async (event, servicioId, contratoId, descuentosId, adquiridoSn) => {
    try {
      const conn = await getConnection();
      console.log("Recibido: ", servicioId);
      const resultContratarServicio = await conn.query(
        "CALL insertServiciosContratados (" +
          servicioId +
          "," +
          contratoId +
          "," +
          descuentosId +
          ",'" +
          adquiridoSn +
          "');"
      );
      console.log(resultContratarServicio);
      // new Notification({
      //   title: "Regístro guardado",
      //   body: "Se registro el servicio",
      // }).show();
      event.sender.send("notifyContratarServicios");
      resultContratarServicio.id = resultContratarServicio.insertId;
      return resultContratarServicio;
    } catch (error) {
      console.log(error);
    }
  }
);
ipcMain.handle(
  "createServicioFijoContratadoMultiple",
  async (event, servicioId, contratoId, descuentosId, adquiridoSn) => {
    let servicioValorPagos = 0;
    let servicioValor = 0;
    let servicioNumPagos = 1;
    let valorDescuento = 0;
    try {
      const conn = await getConnection();
      console.log("Recibido: ", servicioId);
      // Verificamos si existe el servicio en servicios contratados del contrato.
      const datosServicio = await conn.query(
        "SELECT * from servicios WHERE id=" + servicioId + ";"
      );
      const datosDescuento = await conn.query(
        "SELECT * FROM tiposDescuento WHERE id=" + descuentosId + ";"
      );
      if (datosServicio[0] !== undefined) {
        console.log("Si hay datos: " + datosServicio[0].id);
        servicioValorPagos = datosServicio[0].valorPagos;
        servicioValor = datosServicio[0].valor;
        servicioNumPagos = datosServicio[0].numeroPagos;
      }
      if (datosDescuento[0] !== undefined) {
        console.log("Si hay descuento: " + datosDescuento[0].valor);
        valorDescuento = datosDescuento[0].valor;
      }
      const contratadoExiste = await conn.query(
        "SELECT * from serviciosContratados WHERE serviciosId=" +
          servicioId +
          " AND contratosId=" +
          contratoId +
          ";"
      );
      const newContratado = {
        estado: adquiridoSn,
        descuentosId: descuentosId,
        valorPagosindividual: servicioValorPagos,
        valorIndividual: servicioValor,
        numeroPagosindividual: servicioNumPagos,
        descuentoValor: valorDescuento,
      };
      if (contratadoExiste[0] !== undefined) {
        // Si existe el servicio contratado
        // if (contratadoExiste[0].estado !== adquiridoSn) {
        // Realizar la actualizacion solo si los valores son distintos
        // averiguar el uso de librerias para comparar objetos.
        const resultServicioContratado = await conn.query(
          "UPDATE serviciosContratados SET ?" +
            " WHERE " +
            "serviciosId=? AND contratosId=? ;",
          [newContratado, servicioId, contratoId]
        );
        event.sender.send("Notificacion", {
          success: true,
          title: "Contratado para todos!",
          message: "Se han actualizado los servicios contratados.",
          contratoId: contratoId,
        });
        console.log("Contratado actualizado: " + resultServicioContratado);
        return resultServicioContratado;

        // }
      } else {
        newContratado.fechaEmision = formatearFecha(new Date());
        newContratado.serviciosId = servicioId;
        newContratado.contratosId = contratoId;
        const resultServicioContratado = await conn.query(
          "INSERT INTO serviciosContratados SET ?" + ";",
          newContratado
        );
        event.sender.send("Notificacion", {
          success: true,
          title: "Contratado para todos",
          message: "Se han actualizado los servicios contratados.",
          contratoId: contratoId,
        });
        console.log("Contratado creado: " + resultServicioContratado);
        return resultServicioContratado;
      }
    } catch (error) {
      event.sender.send("Notificacion", {
        success: false,
        title: "Error al contratar todos!",
        message: "Ha ocurrido un error al registrar los servicios contratados.",
      });
      console.log(error);
    }
  }
);
ipcMain.handle(
  "createServicioFijoContratado",
  async (event, servicioId, contratoId, descuentosId, adquiridoSn) => {
    let servicioValorPagos = 0;
    let servicioValor = 0;
    let servicioNumPagos = 1;
    let valorDescuento = 0;
    try {
      const conn = await getConnection();
      console.log("Recibido: ", servicioId);
      // Verificamos si existe el servicio en servicios contratados del contrato.
      const datosServicio = await conn.query(
        "SELECT * from servicios WHERE id=" + servicioId + ";"
      );
      const datosDescuento = await conn.query(
        "SELECT * FROM tiposDescuento WHERE id=" + descuentosId + ";"
      );
      if (datosServicio[0] !== undefined) {
        console.log("Si hay datos: " + datosServicio[0].id);
        servicioValorPagos = datosServicio[0].valorPagos;
        servicioValor = datosServicio[0].valor;
        servicioNumPagos = datosServicio[0].numeroPagos;
      }
      if (datosDescuento[0] !== undefined) {
        console.log("Si hay descuento: " + datosDescuento[0].valor);
        valorDescuento = datosDescuento[0].valor;
      }
      const contratadoExiste = await conn.query(
        "SELECT * from serviciosContratados WHERE serviciosId=" +
          servicioId +
          " AND contratosId=" +
          contratoId +
          ";"
      );
      const newContratado = {
        estado: adquiridoSn,
        descuentosId: descuentosId,
        valorPagosindividual: servicioValorPagos,
        valorIndividual: servicioValor,
        numeroPagosindividual: servicioNumPagos,
        descuentoValor: valorDescuento,
      };
      if (contratadoExiste[0] !== undefined) {
        // Si existe el servicio contratado
        // if (contratadoExiste[0].estado !== adquiridoSn) {
        // Realizar la actualizacion solo si los valores son distintos
        // averiguar el uso de librerias para comparar objetos.
        const resultServicioContratado = await conn.query(
          "UPDATE serviciosContratados SET ?" +
            " WHERE " +
            "serviciosId=? AND contratosId=? ;",
          [newContratado, servicioId, contratoId]
        );
        event.sender.send("Notificar", {
          success: true,
          title: "Actualizado!",
          message: "Se han actualizado los servicios contratados.",
          contratoId: contratoId,
        });
        console.log("Contratado actualizado: " + resultServicioContratado);
        return resultServicioContratado;

        // }
      } else {
        newContratado.fechaEmision = formatearFecha(new Date());
        newContratado.serviciosId = servicioId;
        newContratado.contratosId = contratoId;
        const resultServicioContratado = await conn.query(
          "INSERT INTO serviciosContratados SET ?" + ";",
          newContratado
        );
        event.sender.send("Notificar", {
          success: true,
          title: "Actualizado!",
          message: "Se han actualizado los servicios contratados.",
          contratoId: contratoId,
        });
        console.log("Contratado creado: " + resultServicioContratado);
        return resultServicioContratado;
      }
    } catch (error) {
      event.sender.send("Notificar", {
        success: false,
        title: "Error!",
        message: "Ha ocurrido un error al registrar los servicios contratados.",
      });
      console.log(error);
    }
  }
);

// ----------------------------------------------------------------
// Funciones de las planillas
// ----------------------------------------------------------------
// ipcMain.handle("createComprobante", async (event) => {
//   const conn = await getConnection();
//   try {
//     // Consultamos cuales son los medidores que se encuentran activos para crear el registro de lecturas
//     contratosActivos = await conn.query(
//       "Select * from contratos where medidorSn='No' and estado='Activo';"
//     );
//     if (contratosActivos[0] !== undefined) {
//       contratosActivos.forEach(async (contratoActivo) => {
//         console.log("Contrato a buscar: " + contratoActivo.id);
//         createCuentaServicios(contratoActivo.id);
//       });
//     }
//   } catch (error) {
//     console.log("Error al crear comprobantes: " + error);
//   }
// });
// ----------------------------------------------------------------
// Funciones de las planillas
// ----------------------------------------------------------------
ipcMain.handle("createPlanilla", async (event, fechaCreacion) => {
  const conn = await getConnection();
  let numero = 0;
  try {
    // Consultamos cuales son los medidores que se encuentran activos para crear el registro de lecturas
    medidoresActivos = await conn.query(
      "select medidores.id,medidores.codigo,medidores.fechaInstalacion,contratos.id as contratosId,contratos.medidorSn " +
        "from medidores join contratos on contratos.id=medidores.contratosId " +
        "where contratos.estado='Activo'; "
      // "where contratos.medidorSn='Si' AND contratos.estado='Activo'; "
    );

    // if (medidoresActivos[0] !== undefined) {
    if (medidoresActivos.length > 0) {
      medidoresActivos.forEach(async (contratoActivo) => {
        const datosContrato = {
          id: contratoActivo.contratosId,
          medidorId: contratoActivo.id,
          medidorSn: contratoActivo.medidorSn,
        };
        console.log("Contrato a buscar: " + contratoActivo.id);
        if (contratoActivo.medidorSn == "Si") {
          planillaExiste = await conn.query(
            // "SELECT count(planillas.id) as existe from planillas where month" +
            //   "(planillas.fechaEmision)=month(now()) and year(planillas.fechaEmision)=year(now()) " +
            //   "and  planillas.medidoresId=" +
            //   contratoActivo.id +
            //   ";"
            "SELECT count(planillas.id) as existe from planillas where month" +
              "(planillas.fechaEmision)=month('" +
              fechaCreacion +
              "') and year(planillas.fechaEmision)=year('" +
              fechaCreacion +
              "') " +
              "and  planillas.medidoresId=" +
              contratoActivo.id +
              ";"
          );
          console.log("existe: " + planillaExiste[0].existe);
          // Si no existe la planilla correspondiente a la fecha se crea a planilla
          if (planillaExiste[0].existe === 0) {
            // Obtenemos el valor de la lectura anterior en caso de existir
            var lecturaAnterior = 0.0;
            const lecturaConsulta = await conn.query(
              " SELECT planillas.lecturaActual from planillas where " +
                "medidoresId=" +
                contratoActivo.id +
                " order by planillas.fechaEmision desc limit 1;"
            );
            if (lecturaConsulta[0] !== undefined) {
              console.log(
                "lectura Anterior: ",
                lecturaConsulta[0].lecturaActual
              );
              lecturaAnterior = lecturaConsulta[0].lecturaActual;
            }
            const tarifaBase = await conn.query(
              "SELECT * FROM tarifas where tarifa='Familiar';"
            );
            const numeroPlanillas = await conn.query(
              "SELECT count(id) as numeroPlanillas FROM planillas;"
            );
            numero =
              numeroPlanillas[0].numeroPlanillas +
              "" +
              contratoActivo.contratosId;
            const codigoGenerado = numero.toString().padStart(20, "0");

            // console.log(numeroConCeros);
            const newPlanilla = {
              //Fecha emision va comentado
              fechaEmision: fechaCreacion,
              valor: tarifaBase[0].valor,
              estado: "Por cobrar",
              lecturaActual: 0.0,
              lecturaAnterior: lecturaAnterior,
              Observacion: "NA",
              medidoresId: contratoActivo.id,
              tarifa: "Familiar",
              tarifaValor: tarifaBase[0].valor,
              codigo: codigoGenerado,
            };
            const resultadoPlanillas = await conn.query(
              "INSERT INTO planillas set ?",
              newPlanilla
            );
            console.log("Resultado de crear planillas: " + resultadoPlanillas);
            // return resultadoPlanillas;
          }
        } else {
          planillaExiste = await conn.query(
            // "SELECT count(planillas.id) as existe from planillas where month" +
            //   "(planillas.fechaEmision)=month(now()) and year(planillas.fechaEmision)=year(now()) " +
            //   "and  planillas.medidoresId=" +
            //   contratoActivo.id +
            //   ";"
            "SELECT count(planillas.id) as existe from planillas where month" +
              "(planillas.fechaEmision)=month('" +
              fechaCreacion +
              "') and year(planillas.fechaEmision)=year('" +
              fechaCreacion +
              "') " +
              "and  planillas.medidoresId=" +
              contratoActivo.id +
              ";"
          );
          console.log("existe: " + planillaExiste[0].existe);
          // Si no existe la planilla correspondiente a la fecha se crea a planilla
          if (planillaExiste[0].existe == 0) {
            // Obtenemos el valor de la lectura anterior en caso de existir
            var lecturaAnterior = 0.0;
            // const lecturaConsulta = await conn.query(
            //   " SELECT planillas.lecturaActual from planillas where " +
            //     "medidoresId=" +
            //     contratoActivo.id +
            //     " order by planillas.fechaEmision desc limit 1;"
            // );
            // if (lecturaConsulta[0] !== undefined) {
            //   console.log(
            //     "lectura Anterior: " + lecturaConsulta[0].lecturaActual
            //   );
            //   lecturaAnterior = lecturaConsulta[0].lecturaActual;
            // }
            // const tarifaBase = await conn.query(
            //   "SELECT * FROM tarifas where tarifa='Familiar';"
            // );
            const numeroPlanillas = await conn.query(
              "SELECT count(id) as numeroPlanillas FROM planillas;"
            );
            numero =
              numeroPlanillas[0].numeroPlanillas +
              "" +
              contratoActivo.contratosId;
            const codigoGenerado = numero.toString().padStart(20, "0");
            const newPlanilla = {
              //Fecha emision va comentado
              fechaEmision: fechaCreacion,
              valor: 0.0,
              estado: "Por cobrar",
              lecturaActual: 0.0,
              lecturaAnterior: lecturaAnterior,
              Observacion: "NA",
              medidoresId: contratoActivo.id,
              tarifa: "NA",
              tarifaValor: 0.0,
              codigo: codigoGenerado,
            };
            const resultadoPlanillas = await conn.query(
              "INSERT INTO planillas set ?",
              newPlanilla
            );
            console.log("Resultado de crear planillas: " + resultadoPlanillas);
            // return resultadoPlanillas;
          }
        }
        createCuentaServicios(datosContrato, fechaCreacion);
      });
    }
  } catch (error) {
    console.log("Error al crear planillas: " + error);
  }
});
async function createCuentaServicios(datosContrato, fechaCreacion) {
  const contratoId = datosContrato.id;
  console.log("Consultando encabezado para: " + datosContrato.id);
  const conn = await getConnection();

  let encabezadoId;
  try {
    // Consultamos si existe un encabezado con los detalles de los servicios contratados segun el contrato
    const encabezadoExiste = await conn.query(
      // Debe ir con now()
      // "select count(id) as existe, id from viewEncabezados WHERE tipo='planilla' and   " +
      // "month(fechaEmisionEncabezado)=month('" +
      // fechaCreacion +
      // "')" +
      // " and year(fechaEmisionEncabezado)=year('" +
      // fechaCreacion +
      // "') and contratosId=" +
      // contratoId +
      // ";"
      "select count(id) as existe, id from viewEncabezados WHERE tipo='planilla' and   " +
        "month(fechaEmisionEncabezado)=month('" +
        fechaCreacion +
        "')" +
        " and year(fechaEmisionEncabezado)=year('" +
        fechaCreacion +
        "') and contratosId=" +
        contratoId +
        ";"
    );
    if (encabezadoExiste[0].existe === 0) {
      console.log("Existe encabezado: ", encabezadoExiste[0].existe);
      // Si no existe un encabezado para la fecha actual se procede a crear uno
      newEncabezado = {
        // fechaEmision no va
        fechaEmision: fechaCreacion,
        fechaPago: null,
        tipo: "planilla",
      };
      const resultEncabezado = await conn.query(
        "INSERT INTO encabezado set ?;",
        newEncabezado
      );
      encabezadoId = resultEncabezado.insertId;
    } else {
      // Si existe el encabezado obtenemos el id del encabezado existente
      encabezadoId = encabezadoExiste[0].id;
    }
    // Consultamos los servicios fijos contratados segun el id del contrato
    const serviciosContratados = await conn.query(
      "SELECT * FROM viewServiciosCancelar WHERE contratosId=" +
        contratoId +
        " AND estado='Activo' AND tipo='Servicio fijo' AND aplazableSn='No';"
    );
    await createDetallesServicios(
      serviciosContratados,
      encabezadoId,
      fechaCreacion,
      datosContrato
    );
    // Consultamos los servicios ocacionales, las cuotas y las multas que no son aplazables para
    // incluirlas en el detalle de servicios y relacionarlos con un encabezado correspondiente a la
    // cuenta de servicios de cada mes.
    // const otrosValoresNoAplazables = await conn.query(
    //   "SELECT serviciosContratados.id,serviciosContratados.estado," +
    //     "serviciosContratados.fechaEmision,servicios.id as serviciosId," +
    //     "servicios.nombre,servicios.descripcion,servicios.tipo,servicios.valor," +
    //     "tiposdescuento.descripcion as descripcionDescuento,tiposdescuento.valor as valorDescuento " +
    //     "from serviciosContratados join servicios on servicios.id=serviciosContratados.serviciosId join " +
    //     "tiposdescuento on tiposdescuento.id=serviciosContratados.descuentosId " +
    //     "where serviciosContratados.contratosId=" +
    //     contratoId +
    //     " and serviciosContratados.estado='Activo'  and not servicios.tipo='Servicio fijo' and " +
    //     "servicios.aplazableSn='No' and month(servicioscontratados.fechaEmision)=" +
    //     " month(now()) and year(servicioscontratados.fechaEmision)= year(now());"
    // );
    const otrosValores = await conn.query(
      // "SELECT serviciosContratados.id,serviciosContratados.estado," +
      //   "serviciosContratados.fechaEmision,serviciosContratados.valorIndividual,servicios.id as serviciosId," +
      //   "servicios.aplazableSn,servicios.nombre,servicios.descripcion,servicios.tipo,servicios.valor,servicios.valorPagos," +
      //   "tiposdescuento.descripcion as descripcionDescuento,tiposdescuento.valor as valorDescuento " +
      //   "from serviciosContratados join servicios on servicios.id=serviciosContratados.serviciosId join " +
      //   "tiposdescuento on tiposdescuento.id=serviciosContratados.descuentosId " +
      //   "where serviciosContratados.contratosId=" +
      //   contratoId +
      //   " and serviciosContratados.estado='Sin aplicar' and not servicios.tipo='Servicio fijo'"
      "SELECT * FROM viewServiciosCancelar WHERE contratosId=" +
        contratoId +
        // " AND estado='Sin aplicar' AND NOT tipo='Servicio fijo';"
        " AND NOT tipo='Servicio fijo';"
    );

    await createDetallesServicios(
      otrosValores,
      encabezadoId,
      fechaCreacion,
      datosContrato
    );
  } catch (error) {
    console.log("Error al crear cuentaservicios: " + error);
  }
}
async function createDetallesServicios(
  serviciosContratados,
  encabezadoId,
  fechaCreacion,
  datosContrato
) {
  const contratoId = datosContrato.id;
  let contratoConmedidor = false;
  if (datosContrato.medidorSn === "Si") {
    contratoConmedidor = true;
  }
  const conn = await getConnection();

  serviciosContratados.forEach(async (servicioContratado) => {
    console.log("Servicio contratado a buscar: " + servicioContratado.id);
    // Mediante la fecha consultamos si ya se ha creado un detalle para el servicio en determinado mes.
    // para evitar que el servicio se aplique dos veces.
    detalleServicioExiste = await conn.query(
      // Debe ir con now()
      // "SELECT count(detallesServicio.id) as existe from detallesServicio where month" +
      // "(detallesServicio.fechaEmision)=month('" +
      // fechaCreacion +
      // "') and year(detallesServicio.fechaEmision)=year('" +
      // fechaCreacion +
      // "') " +
      // "and  detallesServicio.serviciosContratadosId=" +
      // servicioContratado.id +
      // ";"
      // "SELECT count(detallesServicio.id) as existe from detallesServicio where month" +
      //   "(detallesServicio.fechaEmision)=month('" +
      //   fechaCreacion +
      //   "') and year(detallesServicio.fechaEmision)=year('" +
      //   fechaCreacion +
      //   "') " +
      //   "and  detallesServicio.serviciosContratadosId=" +
      //   servicioContratado.id +
      //   ";"
      "SELECT * from detallesServicio where month" +
        "(detallesServicio.fechaEmision)=month('" +
        fechaCreacion +
        "') and year(detallesServicio.fechaEmision)=year('" +
        fechaCreacion +
        "') " +
        "and  detallesServicio.serviciosContratadosId=" +
        servicioContratado.id +
        ";"
    );
    console.log("Detalle servicio existe: ", detalleServicioExiste.length);
    // Si no existen los detalles de servicios correspondiente a la fecha se crean y se añaden al encabezado
    // if (detalleServicioExiste[0].existe == 0) {
    if (detalleServicioExiste.length === 0) {
      console.log(
        "Servicio a registrar: " + servicioContratado.valorIndividual,
        servicioContratado.valorPagosIndividual
      );
      let valorPagos = 0.0;
      let total = 0.0;
      let abonado = 0;
      let abono = 0;
      let abonosAplicados = 0;
      let totalPagar =
        servicioContratado.valorIndividual - servicioContratado.descuentoValor;
      let newDetalleServicios = {};
      let saldo = 0;

      // if (servicioContratado.valoresDistintos === "Si") {
      if (servicioContratado.aplazableSn === "Si") {
        // Consultamos el valor total aplicado anteriormente
        const aplicadosAnteriores = await conn.query(
          "SELECT * FROM detallesServicio WHERE serviciosContratadosId=" +
            servicioContratado.id +
            " ;"
        );
        if (aplicadosAnteriores[0] !== undefined) {
          console.log("Entro a los aplazables con anteriores");

          // Si exisen detalles de este servicio aplicados anteriormente
          aplicadosAnteriores.forEach((aplicadoAnterior) => {
            //Sumo los valores aplicados
            abonado += aplicadoAnterior.abono;
            abonosAplicados++;
            // saldo=aplicadoAnterior.saldo;
          });
          // total = servicioContratado.valorIndividual;

          if (abonado < totalPagar) {
            console.log("Entro a los aplazables que no superan el abonado");

            var faltante = totalPagar - abonado;
            if (faltante > servicioContratado.valorPagosIndividual) {
              console.log(
                "Entro a los aplazables con faltante mayor a la cuota"
              );

              var pagosRestantes =
                servicioContratado.numeroPagosindividual - abonosAplicados;
              abono = servicioContratado.valorPagosIndividual;
            } else {
              console.log(
                "Entro a los aplazables con faltante menor a la cuota"
              );

              abono = faltante;
            }
            saldo = totalPagar - abonado;
            // valorPagos = servicioContratado.valorPagosindividual;
            newDetalleServicios = {
              serviciosContratadosId: servicioContratado.id,
              descuento: servicioContratado.descuentoValor,
              subtotal: servicioContratado.valorIndividual,
              total: totalPagar,
              // El saldo debe ser calculado
              // saldo: total - servicioContratado.valorDescuento,
              saldo: saldo - abono,
              // El abono debe ser calculado
              abono: abono,
              encabezadosId: encabezadoId,
              estado: "Por cancelar",
              // fechaEmision va comentado
              fechaEmision: fechaCreacion,
            };
          } else {
            console.log("Entro a los aplazables que superan el abonado");

            return null;
            // Si lo abonado iguala o supera (No deberia) no aplicamos.
          }
        } else {
          console.log("Entro a los aplazables sin anteriores");
          newDetalleServicios = {
            serviciosContratadosId: servicioContratado.id,
            descuento: servicioContratado.descuentoValor,
            subtotal: servicioContratado.valorIndividual,
            total: totalPagar,
            // El saldo debe ser calculado
            saldo: totalPagar - servicioContratado.valorPagosIndividual,

            // El abono debe ser calculado
            abono: parseFloat(servicioContratado.valorPagosIndividual),
            encabezadosId: encabezadoId,
            estado: "Por cancelar",
            // fechaEmision va comentado
            fechaEmision: fechaCreacion,
          };
        }
        //total = servicioContratado.valorIndividual;
        // valorPagos = servicioContratado.valorIndividual;
      } else {
        console.log("Entro a los no aplazables");
        // Errro No esta verificando correctamente si el servicio no ha sido aplicado dos veces.
        // newDetalleServicios = {
        //   serviciosContratadosId: servicioContratado.id,
        //   descuento: servicioContratado.descuentoValor,
        //   subtotal: servicioContratado.valorIndividual,
        //   total: totalPagar,
        //   // El saldo debe ser calculado
        //   saldo: totalPagar - abono,
        //   // El abono debe ser calculado
        //   abono: abono,
        //   encabezadosId: encabezadoId,
        //   estado: "Por cancelar",
        //   // fechaEmision va comentado
        //   fechaEmision: fechaCreacion,
        // };
        // Verificamos si este servicio ya ha sido detallado, al ser un no aplazable
        // No se debe aplicar dos veces.
        if (servicioContratado.tipo !== "Servicio fijo") {
          console.log(
            "Error: " + servicioContratado.tipo + " | " + servicioContratado.id
          );
          const noAplazableAplicado = await conn.query(
            "SELECT * from detallesServicio where serviciosContratadosId=" +
              servicioContratado.id +
              " ;"
          );
          console.log("Here: ", noAplazableAplicado.length);

          if (noAplazableAplicado.length == 0) {
            // if (noAplazableAplicado.lecturaCoundefined) {
            console.log("No se encontrarron aplicados");
            abono = servicioContratado.valorPagosIndividual;
            //total = servicioContratado.valorIndividual;
            // valorPagos = servicioContratado.valorPagosindividual;
            newDetalleServicios = {
              serviciosContratadosId: servicioContratado.id,
              descuento: servicioContratado.descuentoValor,
              subtotal: servicioContratado.valorIndividual,
              total: totalPagar,
              // El saldo debe ser calculado
              saldo: totalPagar - abono,
              // El abono debe ser calculado
              abono: abono,
              encabezadosId: encabezadoId,
              estado: "Por cancelar",
              // fechaEmision va comentado
              fechaEmision: fechaCreacion,
            };
          }
        } else {
          console.log("Es no aplazable fijo");
          //Evaluamos si el servicio corresponde al recargo
          if (servicioContratado.nombre === "Reconexión") {
            if (contratoConmedidor) {
              // Consultamos si el recargo ha sido aplicado antes y si ha sido cancelado
              const recargoAplicado = await conn.query(
                "SELECT * FROM viewEstadoPagos WHERE nombre='Reconexión' and estadoDetalles='Por cancelar' and total>0 and contratosId=? ;",
                contratoId
              );
              if (!recargoAplicado.length > 0) {
                console.log("Conteo de planillas ");
                // Conteo de planillas Adeudadas
                const planillasAdeudadas = await conn.query(
                  "SELECT * from viewPlanillas where fechaEmision < ? and contratosId=? and estado='Por cobrar' order by fechaEmision asc ;",
                  [fechaCreacion, contratoId]
                );

                if (planillasAdeudadas.length >= 2) {
                  console.log(
                    "Planillas acumuladas: ",
                    planillasAdeudadas.length
                  );
                  let fechaPagoReconexion = formatearFecha(
                    planillasAdeudadas[0].fechaEmision
                  );
                  console.log("Fecha reconexión: " + fechaPagoReconexion);
                  // Consulto el encabezado de la primera Planilla con el servicio guia.
                  const primerEncabezado = await conn.query(
                    "select encabezadosId from " +
                      "viewEstadoPagos where nombre='Socio comuna' and  month(fechaEmision)=month('" +
                      fechaPagoReconexion +
                      "') " +
                      "and year(fechaEmision)=year('" +
                      fechaPagoReconexion +
                      "') and contratosId=? limit 1;",
                    contratoId
                  );
                  console.log("Contrato: " + contratoId);
                  console.log(
                    "Primer encabezado: " + primerEncabezado[0].encabezadosId
                  );
                  // abono = servicioContratado.valorPagosIndividual;
                  // //total = servicioContratado.valorIndividual;
                  // // valorPagos = servicioContratado.valorPagosindividual;
                  // newDetalleServicios = {
                  //   serviciosContratadosId: servicioContratado.id,
                  //   descuento: servicioContratado.descuentoValor,
                  //   subtotal: servicioContratado.valorIndividual,
                  //   total: totalPagar,
                  //   // El saldo debe ser calculado
                  //   saldo: totalPagar - abono,
                  //   // El abono debe ser calculado
                  //   abono: abono,
                  //   encabezadosId: encabezadoId,
                  //   estado: "Por cancelar",
                  //   // fechaEmision va comentado
                  //   fechaEmision: fechaCreacion,
                  // };
                  abono = servicioContratado.valorPagosIndividual;
                  //total = servicioContratado.valorIndividual;
                  // valorPagos = servicioContratado.valorPagosindividual;
                  newDetalleServicios = {
                    serviciosContratadosId: servicioContratado.id,
                    descuento: servicioContratado.descuentoValor,
                    subtotal: 3,
                    total: 3,
                    // El saldo debe ser calculado
                    saldo: 0,
                    // El abono debe ser calculado
                    abono: 3,
                    encabezadosId: primerEncabezado[0].encabezadosId,
                    estado: "Por cancelar",
                    // fechaEmision va comentado
                    fechaEmision: fechaPagoReconexion,
                  };
                }
                // En caso de que la reconexion ya ha sido aplicada no se aplica nuevamente
                // else {
                //   abono = servicioContratado.valorPagosIndividual;
                //   //total = servicioContratado.valorIndividual;
                //   // valorPagos = servicioContratado.valorPagosindividual;
                //   newDetalleServicios = {
                //     serviciosContratadosId: servicioContratado.id,
                //     descuento: servicioContratado.descuentoValor,
                //     subtotal: 3,
                //     total: 3,
                //     // El saldo debe ser calculado
                //     saldo: 0,
                //     // El abono debe ser calculado
                //     abono: 3,
                //     encabezadosId: encabezadoId,
                //     estado: "Por cancelar",
                //     // fechaEmision va comentado
                //     fechaEmision: fechaCreacion,
                //   };
                // }
              }
              //  En caso de no adeudar mas de dos planillas no se carga la reconexión
              // else {
              //   abono = servicioContratado.valorPagosIndividual;
              //   //total = servicioContratado.valorIndividual;
              //   // valorPagos = servicioContratado.valorPagosindividual;
              //   newDetalleServicios = {
              //     serviciosContratadosId: servicioContratado.id,
              //     descuento: servicioContratado.descuentoValor,
              //     subtotal: servicioContratado.valorIndividual,
              //     total: totalPagar,
              //     // El saldo debe ser calculado
              //     saldo: totalPagar - abono,
              //     // El abono debe ser calculado
              //     abono: abono,
              //     encabezadosId: encabezadoId,
              //     estado: "Por cancelar",
              //     // fechaEmision va comentado
              //     fechaEmision: fechaCreacion,
              //   };
              // }
            }
          } else {
            abono = servicioContratado.valorPagosIndividual;
            //total = servicioContratado.valorIndividual;
            // valorPagos = servicioContratado.valorPagosindividual;
            newDetalleServicios = {
              serviciosContratadosId: servicioContratado.id,
              descuento: servicioContratado.descuentoValor,
              subtotal: servicioContratado.valorIndividual,
              total: totalPagar,
              // El saldo debe ser calculado
              saldo: totalPagar - abono,
              // El abono debe ser calculado
              abono: abono,
              encabezadosId: encabezadoId,
              estado: "Por cancelar",
              // fechaEmision va comentado
              fechaEmision: fechaCreacion,
            };
          }
        }
      }
      // Borrado 0001
      if (!Object.keys(newDetalleServicios).length == 0) {
        const resultadoDetalleServicio = await conn.query(
          "INSERT INTO detallesServicio set ?",
          newDetalleServicios
        );
        console.log("servicioContratado.tipo: ", servicioContratado.tipo);
        if (servicioContratado.tipo !== "Servicio fijo") {
          console.log("entrando a cambiar estado");
          const modificaEstado = await conn.query(
            "UPDATE serviciosContratados SET estado='Aplicado' WHERE serviciosContratados.id=" +
              servicioContratado.id +
              ";"
          );

          console.log(
            "Resultado de crear planillas: " + resultadoDetalleServicio
          );
          return resultadoDetalleServicio;
        } else {
          console.log(
            "Resultado de crear planillas: " + resultadoDetalleServicio
          );
          return resultadoDetalleServicio;
        }
      }
    } else {
      console.log("Sin detalles por aplicar");
      return;
    }
  });
}
// Cargamos las planillas disponibles
ipcMain.handle(
  "getDatosPlanillas",
  async (event, criterio, criterioContent, estado, anio, mes) => {
    console.log(
      "Recibo parametros planillas: " + criterio,
      criterioContent,
      estado,
      anio,
      mes
    );
    try {
      const conn = await getConnection();
      if (estado == undefined || estado == "all") {
        estado = "";
      }
      if (criterio == undefined) {
        criterio = "all";
      }
      if (anio == undefined) {
        anio = "all";
      }
      if (mes == undefined) {
        mes = "all";
      }
      if (criterio == "all") {
        if (anio == "all" && mes == "all") {
          console.log("anio all mes all");
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              "estado like'%" +
              estado +
              "%' order by primerApellido "
          );
          console.log(results);
          return results;
        } else if (anio == "all" && mes !== "all") {
          console.log("anio all mes df", mes);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              "estado like'%" +
              estado +
              "%' and month(fechaEmision) = '" +
              mes +
              "' order by primerApellido ;"
          );
          console.log(results);
          return results;
        } else if (anio !== "all" && mes == "all") {
          console.log("mes all anio df", anio);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              "estado like '%" +
              estado +
              "%' and " +
              " year(fechaEmision) = '" +
              anio +
              "' order by primerApellido ;"
          );
          console.log(results);
          return results;
        } else if (anio !== "all" && mes !== "all") {
          console.log("mes df anio df ", mes, anio);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              "estado like'%" +
              estado +
              "%' and " +
              " year(fechaEmision) = '" +
              anio +
              "' and month(fechaEmision) = '" +
              mes +
              "' order by primerApellido ;"
          );
          console.log(results);
          return results;
        }
      } else {
        if (anio == "all" && mes == "all") {
          console.log("C mes all anio all");
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              criterio +
              " like '%" +
              criterioContent +
              "%' and estado like'%" +
              estado +
              "%' order by primerApellido ;"
          );
          console.log(results);
          return results;
        } else if (anio == "all" && mes !== "all") {
          console.log("C anio all mes df ", mes);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              criterio +
              " like '%" +
              criterioContent +
              "%' and estado like'%" +
              estado +
              "%' and month(fechaEmision) = '" +
              mes +
              "' order by primerApellido ;"
          );
          console.log(results);
          return results;
        } else if (anio !== "all" && mes == "all") {
          console.log("C anio df mes all ", anio);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              criterio +
              " like '%" +
              criterioContent +
              "%' and estado like'%" +
              estado +
              "%' and " +
              " year(fechaEmision) = '" +
              anio +
              "' order by primerApellido;"
          );
          console.log(results);
          return results;
        } else if (anio !== "all" && mes !== "all") {
          console.log("anio df mes df", anio, mes);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              criterio +
              " like '%" +
              criterioContent +
              "%' and estado like'%" +
              estado +
              "%' and " +
              " year(fechaEmision) = '" +
              anio +
              "' and month(fechaEmision) = '" +
              mes +
              "' order by primerApellido ;"
          );
          console.log(results);
          return results;
        } else {
          Console.log("?");
        }

        // const results = await conn.query(
        //   "SELECT * FROM viewPlanillas WHERE " +
        //     criterio +
        //     " = " +
        //     criterioContent +
        //     " and estado='" +
        //     estado +
        //     "' and " +
        //     " year(fechaEmision) = '" +
        //     anio +
        //     "' and month(fechaEmision) = '" +
        //     mes +
        //     "' order by fechaEmision desc"
        // );
        // results = await conn.query("SELECT * FROM viewPlanillas");
        console.log("Con parametros", results);
        return results;
      }
    } catch (error) {
      console.log("Error en la busqueda de planillas: " + error);
    }
  }
);
// Obtener las planillas acumuladas
ipcMain.handle(
  "getDatosPlanillasAcumuladas",
  async (event, criterio, criterioContent, estado, anio, mes) => {
    console.log(
      "Recibo parametros planillas: " + criterio,
      criterioContent,
      estado,
      anio,
      mes
    );
    try {
      const conn = await getConnection();
      if (estado == undefined || estado == "all") {
        estado = "";
      }
      if (criterio == undefined) {
        criterio = "all";
      }
      if (anio == undefined) {
        anio = "all";
      }
      if (mes == undefined) {
        mes = "all";
      }
      if (criterio == "all") {
        if (anio == "all" && mes == "all") {
          console.log("anio all mes all");
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              "estado like'%" +
              estado +
              "%' order by fechaEmision desc"
          );
          console.log(results);
          return results;
        } else if (anio == "all" && mes !== "all") {
          console.log("anio all mes df", mes);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              "estado like'%" +
              estado +
              "%' and month(fechaEmision) = '" +
              mes +
              "' order by fechaEmision desc ;"
          );
          console.log(results);
          return results;
        } else if (anio !== "all" && mes == "all") {
          console.log("mes all anio df", anio);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              "estado like '%" +
              estado +
              "%' and " +
              " year(fechaEmision) = '" +
              anio +
              "' order by fechaEmision desc ;"
          );
          console.log(results);
          return results;
        } else if (anio !== "all" && mes !== "all") {
          console.log("mes df anio df ", mes, anio);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              "estado like'%" +
              estado +
              "%' and " +
              " year(fechaEmision) = '" +
              anio +
              "' and month(fechaEmision) = '" +
              mes +
              "' order by fechaEmision desc ;"
          );
          console.log(results);
          return results;
        }
      } else {
        if (anio == "all" && mes == "all") {
          console.log("C mes all anio all");
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              criterio +
              " like '%" +
              criterioContent +
              "%' and estado like'%" +
              estado +
              "%' order by fechaEmision desc ;"
          );
          console.log(results);
          return results;
        } else if (anio == "all" && mes !== "all") {
          console.log("C anio all mes df ", mes);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              criterio +
              " like '%" +
              criterioContent +
              "%' and estado like'%" +
              estado +
              "%' and month(fechaEmision) = '" +
              mes +
              "' order by fechaEmision desc ;"
          );
          console.log(results);
          return results;
        } else if (anio !== "all" && mes == "all") {
          console.log("C anio df mes all ", anio);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              criterio +
              " like '%" +
              criterioContent +
              "%' and estado like'%" +
              estado +
              "%' and " +
              " year(fechaEmision) = '" +
              anio +
              "' order by fechaEmision desc ;"
          );
          console.log(results);
          return results;
        } else if (anio !== "all" && mes !== "all") {
          console.log("anio df mes df", anio, mes);
          const results = await conn.query(
            "SELECT * FROM viewPlanillas WHERE " +
              criterio +
              " like '%" +
              criterioContent +
              "%' and estado like'%" +
              estado +
              "%' and " +
              " year(fechaEmision) = '" +
              anio +
              "' and month(fechaEmision) = '" +
              mes +
              "' order by fechaEmision desc ;"
          );
          console.log(results);
          return results;
        } else {
          Console.log("?");
        }

        // const results = await conn.query(
        //   "SELECT * FROM viewPlanillas WHERE " +
        //     criterio +
        //     " = " +
        //     criterioContent +
        //     " and estado='" +
        //     estado +
        //     "' and " +
        //     " year(fechaEmision) = '" +
        //     anio +
        //     "' and month(fechaEmision) = '" +
        //     mes +
        //     "' order by fechaEmision desc"
        // );
        // results = await conn.query("SELECT * FROM viewPlanillas");
        console.log("Con parametros", results);
        return results;
      }
    } catch (error) {
      console.log("Error en la busqueda de planillas: " + error);
    }
  }
);

ipcMain.handle("getAllPlanillasFuncionando", async (event, estado) => {
  try {
    const conn = await getConnection();
    if (estado) {
      const results = await conn.query(
        "SELECT * from viewPlanillas WHERE estado=? ;",
        estado
      );
      return results;
    } else {
      const results = await conn.query(
        "SELECT * from viewPlanillas WHERE estado='Por cobrar';"
      );
      return results;
    }
  } catch (error) {
    console.log("Error en la busqueda de planillas: " + error);
  }
});
ipcMain.handle("getAllPlanillas", async (event, criterio, criterioContent) => {
  try {
    const conn = await getConnection();
    if (criterio && criterio !== "" && criterio !== "all") {
      console.log("Criterio: ", criterio, " | ", criterioContent);
      const results = await conn.query(
        "SELECT * from viewPlanillas WHERE estado='Por cobrar' and " +
          criterio +
          " like '%" +
          criterioContent +
          "%' ;"
      );
      return results;
    } else {
      const results = await conn.query(
        "SELECT * from viewPlanillas WHERE estado='Por cobrar';"
      );
      return results;
    }
  } catch (error) {
    console.log("Error en la busqueda de planillas: " + error);
  }
});
ipcMain.handle("getAllServicios", async (event, fechaEmision, contratoId) => {
  try {
    //Usar month() y year()
    const conn = await getConnection();
    const results = await conn.query(
      "SELECT * FROM viewEstadoPagos WHERE fechaEmision=? and contratosId=? ;",
      [fechaEmision, contratoId]
    );
    return results;
  } catch (error) {
    console.log("Error en la busqueda de servicios: " + error);
  }
});
// Funcion que carga los datos de la planilla para editarlos
ipcMain.handle("getPlanillaById", async (event, planillaId) => {
  const conn = await getConnection();
  const results = conn.query(
    "SELECT * FROM viewPlanillas where planillasId=" + planillaId + ";"
  );
  console.log(results);
  return results;
});
// Funcion que relaiza un filtro entre las planillas de acuerdo al codigo del medidor
// ipcMain.handle(
//   "getDatosPlanillasByCodigo",
//   async (
//     event,
//     codigoMedidor,
//     fechaPlanilla,
//     estadoPlanilla,
//     estadoEdicion
//   ) => {
//     try {
//       const conn = await getConnection();
//       conn.query("SET lc_time_names = 'es_ES';");
//       const results = conn.query(
//         "select planillas.id,planillas.fecha,planillas.valor,planillas.estado,planillas.estadoEdicion," +
//           "planillas.lecturaActual,planillas.lecturaAnterior,planillas.observacion," +
//           "planillas.codigo as codigoPlanillas," +
//           "medidores.codigo as codigoMedidores,socios.cedula, socios.nombre, socios.apellido," +
//           "concat(medidores.barrio,', ',medidores.callePrincipal,' y ',medidores.calleSecundaria,', casa: '," +
//           "medidores.numeroCasa,' ',medidores.referencia,'-') as ubicacion " +
//           "from planillas " +
//           "join contratos on contratos.id=planillas.contratosId join medidores on " +
//           "contratos.id=medidores.contratosId join socios on socios.id=contratos.sociosId " +
//           "where medidores.codigo ='" +
//           codigoMedidor +
//           "' and monthname(planillas.fecha)like '%" +
//           fechaPlanilla +
//           "%' " +
//           "and planillas.estado like'%" +
//           estadoPlanilla +
//           "%' and planillas.estadoEdicion like'%" +
//           estadoEdicion +
//           "%';"
//       );
//       const parametrosDesechos = await conn.query(
//         "select * from parametros where nombreParametro='Tarifa recolección de desechos';"
//       );
//       console.log(
//         "Consulta de los parametrso de desechos: ",
//         parametrosDesechos
//       );
//       const notification = new Notification({
//         title: "Exito",
//         body: "Se muestran los datos del medidor",
//         // icon: "/path/to/icon.png",
//         // onClick: () => {
//         //   // Acción a realizar al hacer clic en la notificación
//         // },
//       });
//       notification.show();

//       console.log(results);
//       return results;
//     } catch (error) {
//       const notification = new Notification({
//         title: "Error",
//         body: "Es posible que el medidor proporcionado no exista",
//         // icon: "/path/to/icon.png",
//         // onClick: () => {
//         //   // Acción a realizar al hacer clic en la notificación
//         // },
//       });
//       notification.show();
//     }
//   }
// );

// ----------------------------------------------------------------
// Funciones de las lecturas(Planillas)
// ----------------------------------------------------------------
ipcMain.handle(
  "getAnterioresCancelar",
  async (event, contratoId, fechaPlanilla) => {
    try {
      const conn = await getConnection();
      const anterioresCancelar = await conn.query(
        "SELECT * FROM viewplanillas where fechaEmision < '" +
          fechaPlanilla +
          "' and estado='Por cobrar' and contratosId=" +
          contratoId +
          ";"
      );
      return anterioresCancelar;
    } catch (error) {
      console.log(error);
    }
  }
);
ipcMain.handle(
  "getServiciosAgrupados",
  async (event, fechaDesde, fechaHasta, contratosId) => {
    const conn = await getConnection();
    try {
      const results = await conn.query(
        "SELECT * FROM viewDetallesServicio WHERE month(fechaEmision) between month('" +
          fechaDesde +
          "') and month('" +
          fechaHasta +
          "') and year(fechaEmision) between year('" +
          fechaDesde +
          "') and year('" +
          fechaHasta +
          "')" +
          " and contratosId=" +
          contratosId +
          ";"
      );

      console.log(results);
      return results;
    } catch (error) {
      console.log(error);
    }
  }
);

ipcMain.handle(
  "getLecturasByFecha",
  async (event, contratosId, fechaEmision) => {
    const conn = await getConnection();
    try {
      const results = await conn.query(
        "SELECT * FROM viewplanillas WHERE contratosId=" +
          contratosId +
          " and month(fechaEmision)=month('" +
          fechaEmision +
          "') and " +
          " year(fechaEmision)=year('" +
          fechaEmision +
          "');"
      );
      console.log(results[0]);
      return results;
    } catch (error) {
      console.log(error);
    }
  }
);
// ----------------------------------------------------------------
// Funcion que relaiza un filtro entre las cuotas de acuerdo al codigo del medidor
ipcMain.handle("getDatosCuotasByCodigo", async (event, codigoMedidor) => {
  try {
    const conn = await getConnection();
    conn.query("SET lc_time_names = 'es_ES';");
    const results = conn.query(
      "select servicios.id,servicios.fecha,servicios.servicio,servicios.descripcion,servicios.valor," +
        "servicios.estado from servicios join extrasplanilla on servicios.Id=extrasplanilla.serviciosId " +
        "join planillas on planillas.id=extrasplanilla.planillasId join " +
        "contratos on contratos.id=planillas.contratosId join medidores " +
        "on contratos.id=medidores.contratosId where servicios.tipo='cuota'and medidores.codigo='" +
        codigoMedidor +
        "'; "
    );
    const notification = new Notification({
      title: "Exito",
      body: "Se muestran los datos del medidor",
    });
    notification.show();

    console.log(results);
    return results;
  } catch (error) {
    const notification = new Notification({
      title: "Error",
      body: "Es posible que el medidor proporcionado no exista",
    });
    notification.show();
  }
});
// ----------------------------------------------------------------
// Funciones de los detalles
// ----------------------------------------------------------------
// Funcion de relacion servicio-contratos;
// Buscamos todos los contratos.
ipcMain.handle("ejectSocioComuna", async () => {
  try {
    const conn = await getConnection();
    // Obtengo los datos del servicio a contratar.
    const servicioGuia = await conn.query(
      "SELECT * FROM servicios WHERE servicios.nombre ='Socio comuna';"
    );
    // Obtengo los contratos existentes.
    const existentes = await conn.query("SELECT * FROM contratos;");
    if (existentes.length > 0) {
      existentes.forEach((existente) => {
        // Consulto los detalles anteriores;

        const newContratado = {
          fechaEmision: "2023-12-01",
          estado: "Activo",
          valorIndividual: 0,
          numeroPagosIndividual: 1,
          valorPagosIndividual: 0,
          descuentoValor: 0,
          serviciosId: servicioRecargo[0].id,
          contratosId: existente.id,
          descuentosId: 1,
        };
        const result = conn.query(
          "Insert into serviciosContratados set ?;",
          newContratado
        );
      });
    }
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("ejectContratado", async () => {
  try {
    const conn = await getConnection();
    // Obtengo los datos del servicio a contratar.
    const servicioRecargo = await conn.query(
      "SELECT * FROM servicios WHERE servicios.nombre ='Reconexión';"
    );
    // Obtengo los contratos existentes.
    const existentes = await conn.query("SELECT * FROM contratos;");
    if (existentes.length > 0) {
      existentes.forEach((existente) => {
        const newContratado = {
          fechaEmision: "2023-12-01",
          estado: "Activo",
          valorIndividual: 0,
          numeroPagosIndividual: 1,
          valorPagosIndividual: 0,
          descuentoValor: 0,
          serviciosId: servicioRecargo[0].id,
          contratosId: existente.id,
          descuentosId: 1,
        };
        const result = conn.query(
          "Insert into serviciosContratados set ?;",
          newContratado
        );
      });
    }
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("ejectContratadoDetalles", async () => {
  // let encabezado = "";
  // let estado = "";
  let fecha = "";
  try {
    const conn = await getConnection();
    // Obtengo los datos del servicio a contratar.
    const servicioRecargo = await conn.query(
      "SELECT * FROM servicios WHERE servicios.nombre ='Reconexión';"
    );
    const contratadosExistentes = await conn.query(
      "SELECT * FROM viewservicioscontratados WHERE serviciosId=?;",
      servicioRecargo[0].id
    );
    if (contratadosExistentes.length > 0) {
      contratadosExistentes.forEach(async (contratadoExistente) => {
        console.log("MedidorSn: ", contratadoExistente.medidorSn);
        if (contratadoExistente.medidorSn === "Si") {
          console.log("Aplicando recargo");
          // Consultamos si el recargo ha sido aplicado antes y si ha sido cancelado
          const recargoAplicado = await conn.query(
            "SELECT * FROM viewEstadoPagos WHERE nombre='Reconexión' and estadoDetalles='Por cancelar' and total>0 and contratosId=? ;",
            contratadoExistente.id
          );
          if (!recargoAplicado.length > 0) {
            const detallesAnteriores = await conn.query(
              "SELECT * FROM viewDetallesServicio WHERE contratosId=? order by id desc limit 1;",
              contratadoExistente.id
            );
            fecha = formatearFecha(detallesAnteriores[0].fechaEmision);
            // Conteo de planillas Adeudadas

            const planillasAnteriores = await conn.query(
              "SELECT * from viewPlanillas where fechaEmision < ? and contratosId=? and estado='Por cobrar' order by fechaEmision ASC ;",
              [fecha, contratadoExistente.id]
            );

            if (planillasAnteriores.length >= 2) {
              let fechaPagoReconexion = formatearFecha(
                planillasAnteriores[0].fechaEmision
              );
              //               const detallesAnteriores = await conn.query(
              //   "SELECT * FROM viewDetallesServicio WHERE contratosId=? order by id asc limit 1;",
              //   contratadoExistente.id
              // );
              // Consulto el encabezado de la primera Planilla con el servicio guia.
              const primerEncabezado = await conn.query(
                "select * from " +
                  "viewEstadoPagos where nombre='Socio comuna' and  month(fechaEmision)=month(?) " +
                  "and year(fechaEmision)=year(?) and contratosId=? limit 1;",
                [
                  fechaPagoReconexion,
                  fechaPagoReconexion,
                  contratadoExistente.id,
                ]
              );
              const newDetalleServicio = {
                serviciosContratadosId:
                  contratadoExistente.serviciosContratadosId,
                descuento: 0,
                subtotal: 3,
                total: 3,
                saldo: 0,
                abono: 3,
                fechaEmision: fechaPagoReconexion,
                encabezadosId: primerEncabezado[0].encabezadosId,
                estado: primerEncabezado[0].estadoDetalles,
              };
              const result = await conn.query(
                "Insert into detallesServicio set ?;",
                newDetalleServicio
              );
            }
          }

          // Si el contrato no tiene medidor no aplicamos Recargo
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// Funcion que carga los servicios de acuerdo al id de la planilla
ipcMain.handle(
  "getDatosServiciosByContratoId",
  async (event, contratoId, fechaEmision, criterio) => {
    console.log("Fecha emision: " + fechaEmision);
    const conn = await getConnection();
    if (criterio === "otros") {
      const result = await conn.query(
        "SELECT * FROM viewDetallesServicio WHERE contratosId = " +
          contratoId +
          " and month(fechaEmision) = month('" +
          fechaEmision +
          "') and year(fechaEmision)= year('" +
          fechaEmision +
          "') and not tipo='Servicio fijo';"
      );
      console.log("resultado de buscar servicios: ", result);
      return result;
    } else if (criterio === "fijos") {
      const result = await conn.query(
        "SELECT * FROM viewDetallesServicio WHERE contratosId = " +
          contratoId +
          " and month(fechaEmision) = month('" +
          fechaEmision +
          "') and year(fechaEmision)= year('" +
          fechaEmision +
          "') and  tipo='Servicio fijo';"
      );
      console.log("resultado de buscar servicios: ", result);
      return result;
    } else {
      const result = await conn.query(
        "SELECT * FROM viewDetallesServicio WHERE contratosId = " +
          contratoId +
          " and month(fechaEmision) = month('" +
          fechaEmision +
          "') and year(fechaEmision)= year('" +
          fechaEmision +
          "');"
      );
      console.log("resultado de buscar servicios: ", result);
      return result;
    }
    console.log("fechaEmision recibida: ", fechaEmision, contratoId);

    // const result = await conn.query(
    //   "SELECT * FROM viewservicioscontratados WHERE id = " +
    //     contratoId +
    //     " and month(fechaEmision) = month('" +
    //     fechaEmision +
    //     "') and estado ='Activo';"
    // );
  }
);

ipcMain.handle(
  "updateDetalle",
  async (event, fechaEmision, contratoId, id, detalle) => {
    try {
      const conn = await getConnection();
      console.log("Actualizando detalle: " + id + detalle);
      // Verificamos si el detalles que se busca actualizar
      // no este "Cancelado" de estarlo no deberia modificase.
      // const canceladoSn = await conn.query(
      //   "SELECT * FROM detallesServicio WHERE id=?",
      //   id
      // );
      // if (canceladoSn[0].estado !== "Cancelado") {
      //Verificar si servicio guia ha sido cancelado
      const canceladoGuiaSn = await conn.query(
        "SELECT * FROM viewDetallesServicio WHERE contratosId=" +
          contratoId +
          " AND month(fechaEmision)=month('" +
          fechaEmision +
          "') AND " +
          "year(fechaEmision)=year('" +
          fechaEmision +
          "') AND " +
          "nombre='Socio comuna';"
      );
      // if (canceladoGuiaSn[0].estadoDetalles !== "Cancelado") {
      console.log("Editar: " + canceladoGuiaSn[0].estadoDetalles);
      const result = await conn.query(
        "UPDATE detallesServicio set ? where id = ?",
        [detalle, id]
      );
      event.sender.send("Notificar", {
        success: true,
        title: "Actualizado!",
        message: "Se ha actualizado la planilla.",
      });
      console.log(result);
      return result;
      // }
      // // } else {
      // //   event.sender.send("Notificar", {
      // //     success: false,
      // //     title: "Error!",
      // //     message:
      // //       "No se ha podido actualizar la planilla, los servicios aplicados se encuentran Cancelados.",
      // //   });

      // //   return;
      // }
    } catch (error) {
      event.sender.send("Notificar", {
        success: false,
        title: "Error!",
        message: "Ha ocurrido un error al actualizar la planilla.",
      });
      console.log(error);
    }
  }
);
ipcMain.handle("getDetallesByContratadoId", async (event, contratadoId) => {
  const conn = await getConnection();
  const result = await conn.query(
    "SELECT * FROM detallesServicio WHERE detallesServicio.serviciosContratadosId=" +
      contratadoId +
      ";"
  );
  console.log(result);
  return result;
});
ipcMain.handle(
  "getAnuladosByContratoId",
  async (event, fechaEmision, contratoId) => {
    try {
      const conn = await getConnection();
      const result = await conn.query(
        "SELECT * FROM viewDetallesServicio WHERE contratosId=" +
          contratoId +
          " AND month(fechaEmision)=month('" +
          fechaEmision +
          "') AND " +
          "year(fechaEmision)=year('" +
          fechaEmision +
          "') AND " +
          "estadoDetalles='Anulado';"
      );
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
);

// ----------------------------------------------------------------
// Funcion de cancelado
// ----------------------------------------------------------------
ipcMain.handle(
  "cancelarServicios",
  async (
    event,
    planillaCancelarId,
    encabezadoCancelarId,
    serviciosCancelar,
    comprobante
  ) => {
    try {
      const conn = await getConnection();
      console.log(
        "Actualizando detalle: ",
        planillaCancelarId,
        encabezadoCancelarId,
        serviciosCancelar
      );
      serviciosCancelar.forEach(async (servicioCancelar) => {
        let abono = 0;
        let saldo = 0;
        if (servicioCancelar.abono !== null) {
          abono = parseFloat(servicioCancelar.abono).toFixed(2);
        }
        if (servicioCancelar.saldo !== null) {
          saldo = parseFloat(servicioCancelar.saldo).toFixed(2);
        }
        await conn.query(
          "UPDATE detallesServicio set estado='Cancelado',abono=" +
            abono +
            ", saldo=" +
            saldo +
            " WHERE id = ? ;",
          servicioCancelar.id
        );
      });
      await conn.query(
        "UPDATE planillas set estado='Cancelado' WHERE id = ? ;",
        planillaCancelarId
      );
      const result = await conn.query(
        "UPDATE encabezado set estado='Cancelado',fechaPago=Now() WHERE id = ? ;",
        encabezadoCancelarId
      );
      // Creamos el registro en la tabla de comprobante
      const resultComprobante = await conn.query(
        "INSERT INTO comprobantes set ? ;",
        comprobante
      );
      event.sender.send("Notificar", {
        success: true,
        title: "Actualizado!",
        message: "Se ha cancelado la planilla.",
      });
      console.log(result);
      return result;
    } catch (error) {
      event.sender.send("Notificar", {
        success: false,
        title: "Error!",
        message: "Ha ocurrido un error al cancelar la planilla.",
      });
      console.log("Error al cancelar: ", error);
    }
  }
);
ipcMain.handle(
  "cancelarServiciosIndividual",
  async (
    event,
    planillaCancelarId,
    encabezadoCancelarId,
    serviciosCancelar,
    comprobante
  ) => {
    try {
      cancelarServicios(
        event,
        planillaCancelarId,
        encabezadoCancelarId,
        serviciosCancelar,
        comprobante
      );
      event.sender.send("Notificar", {
        success: true,
        title: "Actualizado!",
        message: "Se ha cancelado la planilla.",
      });
    } catch (error) {
      event.sender.send("Notificar", {
        success: false,
        title: "Error!",
        message: "Ha ocurrido un error al cancelar la planilla.",
      });
      console.log("Error al cancelar: ", error);
    }
  }
);
// ipcMain.handle(
//   "cancelarServiciosMultiples",
//   async (event, planillaCancelar, comprobante) => {
//     console.log("Here: ", planillaCancelar);
//     try {
//       const conn = await getConnection();
//       console.log("Actualizando detalle: ", planillaCancelar);
//       planillaCancelar.servicios.forEach(async (servicio) => {
//         const resultComprobante = await conn.query(
//           "INSERT INTO comprobantes set ? ;",
//           comprobante
//         );
//         servicio.objetos.forEach(async (servicioCancelar) => {
//           comprobante.encabezadosId = servicio.encabezadosIds;
//           await conn.query(
//             "UPDATE encabezado set estado='Cancelado',fechaPago=Now() WHERE id = ? ;",
//             servicioCancelar.encabezadosId
//           );
//           let abono = 0;
//           let saldo = 0;
//           if (servicioCancelar.abono !== null) {
//             abono = parseFloat(servicioCancelar.abono).toFixed(2);
//           }
//           if (servicioCancelar.saldo !== null) {
//             saldo = parseFloat(servicioCancelar.saldo).toFixed(2);
//           }
//           await conn.query(
//             "UPDATE detallesServicio set estado='Cancelado',abono=" +
//               abono +
//               ", saldo=" +
//               saldo +
//               " WHERE id = ? ;",
//             servicioCancelar.id
//           );
//         });
//       });
//       planillaCancelar.objetos.forEach(async (planillaCancelarId) => {
//         await conn.query(
//           "UPDATE planillas set estado='Cancelado' WHERE id = ? ;",
//           planillaCancelarId.planillasId
//         );
//       });
//       event.sender.send("Notificar", {
//         success: true,
//         title: "Actualizado!",
//         message: "Se ha cancelado la planilla.",
//       });
//     } catch (error) {
//       event.sender.send("Notificar", {
//         success: false,
//         title: "Error!",
//         message: "Ha ocurrido un error al cancelar la planilla.",
//       });
//       console.log("Error al cancelar: ", error);
//     }
//   }
// );
ipcMain.handle(
  "cancelarServiciosMultiples",
  async (event, planillaCancelar, comprobante, editadosCancelar) => {
    console.log("Here: ", planillaCancelar);
    try {
      cancelarServiciosMultiples(
        planillaCancelar,
        comprobante,
        editadosCancelar
      );
      event.sender.send("Notificar", {
        success: true,
        title: "Actualizado!",
        message: "Se ha cancelado la planilla.",
      });
    } catch (error) {
      event.sender.send("Notificar", {
        success: false,
        title: "Error!",
        message: "Ha ocurrido un error al cancelar la planilla.",
      });
      console.log("Error al cancelar: ", error);
    }
  }
);
ipcMain.handle("contratarEnPrincipales", async (event, servicioId, tipo) => {
  console.log("Recibido contratarPrincipales: ", servicioId, " ", tipo);
  try {
    contratarPrincipales(servicioId, tipo);
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle(
  "contratarEnPrincipalesFijos",
  async (event, servicioId, tipo) => {
    console.log("Recibido contratarPrincipales: ", servicioId, " ", tipo);
    try {
      contratarPrincipales(servicioId, tipo);
    } catch (error) {
      console.log(error);
    }
  }
);
ipcMain.handle("getComprobantes", async (event, encabezadoId) => {
  try {
    const conn = await getConnection();
    const comprobantes = await conn.query(
      "select comprobantes.codigo,comprobantes.fechaEmision,comprobantes.rutaLocal," +
        "comprobantes.estado,comprobantes.fechaAnulacion,comprobantes.motivoAnulacion," +
        "encabezadoComprobantes.encabezadosId,encabezadocomprobantes.comprobantesId " +
        "from comprobantes join encabezadocomprobantes on comprobantes.id=encabezadocomprobantes.comprobantesId " +
        "where encabezadosId=?",
      encabezadoId
    );
    console.log("Comprobantes: ", comprobantes);
    return comprobantes;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getEstados", async (event, encabezadoId) => {
  try {
    const conn = await getConnection();
    const estados = await conn.query(
      "SELECT estado FROM comprobantes WHERE encabezadosId=?;",
      encabezadoId
    );
    console.log("Estados: ", estados);
    return estados;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle(
  "anularPago",
  async (event, planillaId, encabezadoId, comprobante) => {
    try {
      const conn = await getConnection();
      const resultPlanilla = await conn
        .query(
          "UPDATE planillas set estado='Por cobrar' WHERE id= ?",
          planillaId
        )
        .then(async (resultPlanilla) => {
          const resultEncabezado = await conn.query(
            "UPDATE encabezado set estado=null,fechaPago=null WHERE id=?",
            encabezadoId
          );
        })
        .then(async (resultEncabezado) => {
          const resultDetalles = await conn.query(
            "UPDATE detallesServicio set estado='Por cancelar' WHERE encabezadosId=?",
            encabezadoId
          );
        })
        .then(async (resultDetalles) => {
          const resultComprobante = await conn.query(
            "UPDATE comprobantes set ? WHERE id=?",
            [comprobante, comprobante.id]
          );
          event.sender.send("Notificar", {
            success: true,
            title: "Actualizado!",
            message: "Se ha anulado el pago y el comprobante.",
          });
          return resultComprobante;
        });
    } catch (error) {
      event.sender.send("Notificar", {
        success: false,
        title: "Error!",
        message: "Ha ocurrido un error al anular el pago.",
      });
      console.log("Error al anular el pago: ", error);
    }
  }
);
// ----------------------------------------------------------------
// Funciones de los saldos
// ----------------------------------------------------------------
ipcMain.handle("getSaldosAFavor", async (event, socioId) => {
  let total = 0;
  let entradas = 0;
  let salidas = 0;
  let estadoCuenta = {};
  try {
    const conn = await getConnection();
    const saldosExistente = await conn.query(
      "SELECT * FROM estadosCuenta WHERE sociosId=?",
      socioId
    );
    if (saldosExistente.length > 0) {
      saldosExistente.forEach((saldoExistente) => {
        if (saldoExistente.tipo == "Ingreso") {
          if (saldoExistente.valor !== undefined) {
            entradas += saldoExistente.valor;
          }
        } else if (saldoExistente.tipo == "Egreso") {
          if (saldoExistente.valor !== undefined) {
            salidas += saldoExistente.valor;
          }
        }
      });
    }
    total = entradas - salidas;
    estadoCuenta.total = total;
    estadoCuenta.entradas = entradas;
    estadoCuenta.salidas = salidas;

    console.log("Retornando cuenta: ", estadoCuenta);
    return estadoCuenta;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle(
  "updateEstadoCuenta",
  async (event, saldoFavor, efectivo, socioId) => {
    let salidaCuenta = {};
    let entradaCuenta = {};
    if (saldoFavor > 0) {
      salidaCuenta.fechaMovimiento = formatearFecha(new Date());
      salidaCuenta.tipo = "Egreso";
      salidaCuenta.valor = saldoFavor;
      salidaCuenta.motivo = "Pago de planillas";
      salidaCuenta.responsable = 1;
      salidaCuenta.sociosId = socioId;
    }
    if (efectivo > 0) {
      entradaCuenta.fechaMovimiento = formatearFecha(new Date());
      entradaCuenta.tipo = "Ingreso";
      entradaCuenta.valor = efectivo;
      entradaCuenta.motivo = "Pago de planillas";
      entradaCuenta.responsable = 1;
      entradaCuenta.sociosId = socioId;
    }
    try {
      const conn = await getConnection();
      if (!Object.keys(salidaCuenta).length == 0) {
        const result = await conn.query(
          "INSERT into estadosCuenta set  ?",
          salidaCuenta
        );
        console.log(result);
      }
      if (!Object.keys(entradaCuenta).length == 0) {
        const result = await conn.query(
          "INSERT into estadosCuenta set  ?",
          entradaCuenta
        );
        console.log(result);
      }
      event.sender.send("ResultadoPago", {
        success: true,
        title: "Pago con éxito!",
        message: "Planilla cancelada con éxito.",
      });
    } catch (error) {
      event.sender.send("ResultadoPago", {
        success: false,
        title: "Error!",
        message: "Ha ocurrido un error al cancelar la planilla.",
      });
      console.log(error);
    }
  }
);
// ----------------------------------------------------------------
// Funcion que consulta las tarifas por el servicio de agua potable
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// Funcion que carga los servicios de acuerdo al id de la planilla
// ----------------------------------------------------------------
ipcMain.handle("getTarifas", async () => {
  const conn = await getConnection();
  const result = await conn.query("SELECT * FROM tarifas;");
  console.log(result);
  return result;
});
// ----------------------------------------------------------------
// Funcion que carga las cuotas de acuerdo al id de la planilla
ipcMain.handle("getCuotasByPlanillaId", async (event, planillaId) => {
  const conn = await getConnection();
  const result = await conn.query(
    "select planillas.codigo,servicios.id," +
      "servicios.servicio,servicios.descripcion,servicios.fecha,servicios.valor,servicios.estado " +
      "from servicios join extrasplanilla on servicios.id=extrasplanilla.serviciosId " +
      "join planillas on planillas.id=extrasplanilla.planillasId " +
      "where servicios.tipo='cuota' and planillas.id=?;",
    planillaId
  );
  console.log(result);
  return result;
});
// ----------------------------------------------------------------

ipcMain.handle("createCuota", async (event, cuota, planillaId) => {
  try {
    const conn = await getConnection();
    console.log("Cuota recibida: ", cuota);

    const result = await conn.query("Insert into servicios set ?", cuota);
    var idNuevoServicio = result.insertId;
    console.log(result.insertId);
    const newExtrasPlanilla = {
      serviciosId: idNuevoServicio,
      planillasId: planillaId,
      descuentosId: 3,
    };
    const result1 = await conn.query(
      "Insert into extrasplanilla set ?",
      newExtrasPlanilla
    );
    console.log(result1);
    new Notification({
      title: "Electrom Mysql",
      body: "New servicio saved succesfully",
    }).show();
    servicio.id = result.insertId;
    return servicio;
  } catch (error) {
    console.log(error);
  }
});
// Funcion que carga multas y descuentos de acuerdo al id de la planilla
ipcMain.handle("getMultasDescByPlanillaId", async (event, planillaId) => {
  const conn = await getConnection();
  const result = await conn.query(
    "select planillas.codigo,multasdescuentos.id,multasdescuentos.tipo," +
      "multasdescuentos.motivo,multasdescuentos.fecha,multasdescuentos.valor from " +
      "multasdescuentos join planillas on planillas.id=multasdescuentos.planillaId " +
      "where planillas.id=?;",
    planillaId
  );
  console.log(result);
  return result;
});
// Funcion que edita los valores permitidos de la planilla
ipcMain.handle("updatePlanilla", async (event, id, planilla, contratoId) => {
  try {
    const conn = await getConnection();
    console.log("Actualizando planilla: " + planilla);
    const planillaCancelada = await conn.query(
      "SELECT planillas.estado FROM planillas WHERE planillas.id= " + id + " ;"
    );
    if (planillaCancelada[0] !== undefined) {
      // if (planillaCancelada[0].estado == "Cancelado") {
      // event.sender.send("Notificar", {
      //   success: false,
      //   title: "Error!",
      //   message:
      //     "Esta planilla ya ha sido cancelada, no puedes editar sus valores.",
      // });
      // } else {
      if (contratoId !== undefined) {
        console.log("Entro al if");
        if (planilla.tarifa == "Sin consumo") {
          const aplicadaSn = await conn.query(
            "SELECT * FROM viewPlanillas WHERE contratosId=? AND tarifa='Sin consumo';",
            contratoId
          );
          if (aplicadaSn.length == 1) {
            event.sender.send("Notificar", {
              success: false,
              title: "Error!",
              message:
                'La tarifa "Sin consumo" ya ha sido aplicada en este medidor.',
            });
            return;
          }
        }
      }
      console.log("No entro al if");
      const result = await conn.query("UPDATE planillas set ? where id = ?", [
        planilla,
        id,
      ]);
      console.log(result);
      event.sender.send("Notificar", {
        success: true,
        title: "Actualizado!",
        message: "Se ha hactualizado la planilla.",
      });
      return result;
      // }
    } else {
      event.sender.send("Notificar", {
        success: false,
        title: "Error!",
        message:
          "No existe una planilla, actualiza la lista de planillas e intentalo de nuevo.",
      });
    }
  } catch (error) {
    console.log("Error al actualizar planilla:", error);
  }
});
// ----------------------------------------------------------------
// Funciones de los parametros
ipcMain.handle("createParametro", async (event, parametro) => {
  try {
    const conn = await getConnection();
    console.log("Recibido: ", parametro);
    parametro.valor = parseFloat(parametro.valor);
    const result = await conn.query("Insert into parametros set ?", parametro);
    console.log(result);
    new Notification({
      title: "Electrom Mysql",
      body: "New parametro saved succesfully",
    }).show();
    parametro.id = result.insertId;
    return parametro;
  } catch (error) {
    console.log(error);
  }
});
ipcMain.handle("getParametros", async () => {
  const conn = await getConnection();
  const results = conn.query("Select * from parametros order by id desc;");
  console.log(results);
  return results;
});
ipcMain.handle("getParametroById", async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("Select * from parametros where id = ?", id);
  console.log(result[0]);
  return result[0];
});
ipcMain.handle("updateParametro", async (event, id, parametro) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE parametros set ? where id = ?", [
    parametro,
    id,
  ]);
  console.log(result);
  return result;
});
ipcMain.handle("deleteParametro", async (event, id) => {
  console.log("id from main.js: ", id);
  const conn = await getConnection();
  const result = await conn.query("Delete from parametros where id = ?", id);
  console.log(result);
  return result;
});
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
module.exports = {
  createWindow,
};
