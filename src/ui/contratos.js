const { ipcRenderer, electron, remote } = require("electron");
const Swal = require("sweetalert2");
const validator = require("validator");

// const { Notification } = remote;
// ----------------------------------------------------------------
// Librerias
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// Variables funciones
// ----------------------------------------------------------------
const mensajeError = document.getElementById("mensajeError");
let editingStatus = false;
// ----------------------------------------------------------------
// Variables del contrato
// ----------------------------------------------------------------
const contratoCodigo = document.getElementById("codigocontrato");
const contratoFecha = document.getElementById("fechaContrato");
const contratoEstado = document.getElementById("estadoContrato");
const labelEstadoContrato = document.getElementById("labelEstadoContrato");
const contratoPrincipalSn = document.getElementById("principalSn");
const serviciosCompartidos = document.getElementById("serviciosCompartidos");
//Indica si se ha seleccionado el servicio de agua con medidor
var contratoConMedidor = false;
// Tabla de contratos con medidor
const contratosList = document.getElementById("contratosconmedidor");
// Tabla de contratos sin medidor
const contratosSinMedidorList = document.getElementById("contratossinmedidor");
// ----------------------------------------------------------------
// Variables de los servicios
// ----------------------------------------------------------------
// Tabla de servicios disponibles para el contrato
const servicosDisponiblesList = document.getElementById(
  "servicios-disponibles"
);
// Tabla de servicios contratados se muestran segun el contrato seleccionado
const serviciosContratadosList = document.getElementById(
  "servicios-contratados"
);
// Arreglo para almacenar los servicios disponibles|
let serviciosDisponibles = [];
// Variable que indica los servicios contratados para editar
var serviciosEditar = null;
// Variable que almacena id de los servicios que se van a contratar
let serviciosDisponiblesAContratar = [];
// VAriable  para validar si se ha seleccionado al menos un servicio a contratar.
let serviciosMarcados = [];
let sectorId = "";
let numero = "1";
// ----------------------------------------------------------------
// Variables del socio contratante
// ----------------------------------------------------------------
const socioContratanteCedula = document.getElementById(
  "cedulaSocioContratante"
);
const socioContratanteNombre = document.getElementById(
  "nombreSocioContratante"
);
const socioContratanteApellido = document.getElementById(
  "apellidoSocioContratante"
);
// Indica si se va a editar el contrato
let socioContratanteId = "";
// Obtiene el id del contrato que se esta manipulando
let contratoId = "";
// ----------------------------------------------------------------
// Variables del medidor
// ----------------------------------------------------------------
const medidorInstalacion = document.getElementById("fechaInstalacion");
const medidorMarca = document.getElementById("marca");
const medidorBarrio = document.getElementById("barrio");
const medidorPrincipal = document.getElementById("principal");
const medidorSecundaria = document.getElementById("secundaria");
const medidorNumeroCasa = document.getElementById("numerocasa");
const medidorReferencia = document.getElementById("referencia");
const medidorObservacion = document.getElementById("observacion");
const errorContainer = document.getElementById("container-error");
const medidorSinMedidor = document.getElementById("medidorSinMedidor");
const conMedidor = document.getElementById("conMedidor");
const sinMedidor = document.getElementById("sinMedidor");
const titleContratos = document.getElementById("title-contratos");
//Variable que indica el medidor a editar Borrar
let editContratoId = "";
let editSocioId = "";
// ----------------------------------------------------------------
// Variables componentes del formulario.
// ----------------------------------------------------------------
const cancelarContrato = document.getElementById("cancelar-contrato");
const generarCodigoBt = document.getElementById("generar-codigo");
var listaSugerencias = document.getElementById("lista-sugerencias");
var sugerencias = [];
// ----------------------------------------------------------------
// Variables componentes del los detalles.
// ----------------------------------------------------------------
const codigoDt = document.getElementById("codigoDt");
const estadoDt = document.getElementById("estadoDt");
const medidorSnDt = document.getElementById("medidorSnDt");
const fechaDt = document.getElementById("fechaDt");
const socioDt = document.getElementById("socioDt");
const ubicacionDt = document.getElementById("ubicacionDt");
// Variables de busqueda
const criterio = document.getElementById("criterio");
const criterioContent = document.getElementById("criterio-content");
const buscarContratosBtn = document.getElementById("buscarContratos");
// ----------------------------------------------------------------
// Esta funcion obtiene los id de los servicios disponibles
// los manipula como elementos del DOM asignandoles el evento de marcado y desmarcado
// para validar si se ha seleccionado al menos un servicio a contratar.
// ----------------------------------------------------------------
async function eventoServiciosId(serviciosFijos) {
  console.log("Servicios here: " + serviciosFijos);
  serviciosFijos.forEach((servicioFijo) => {
    document
      .getElementById(servicioFijo.id)
      .addEventListener("change", (event) => {
        if (servicioFijo.nombre == "Agua Potable") {
          if (event.target.checked) {
            habilitarFormMedidor();
            contratoConMedidor = true;
            serviciosMarcados.push(servicioFijo);
            console.log("Servicios Marcados: ", serviciosMarcados);
            console.log("Marcado Agua: " + servicioFijo.nombre);
          } else {
            // inHabilitarFormMedidor();
            contratoConMedidor = false;
            const idABuscar = servicioFijo.id; //--> El ID que deseas buscar y eliminar
            const elementoAEliminar = serviciosMarcados.find(
              (elemento) => elemento.id === idABuscar
            );
            if (elementoAEliminar) {
              //--> Si se encontró el elemento, elimínalo
              const indiceAEliminar =
                serviciosMarcados.indexOf(elementoAEliminar);
              serviciosMarcados.splice(indiceAEliminar, 1);
              console.log(`Elemento con ID ${idABuscar} ha sido eliminado.`);
            } else {
              console.log(
                `Elemento con ID ${idABuscar} no se encontró en el arreglo.`
              );
            }

            console.log("Servicios Marcados: ", serviciosMarcados);
            //--> El arreglo actualizado sin el elemento eliminado
            console.log("Desmarcado Agua: " + servicioFijo.nombre);
          }
        } else {
          if (event.target.checked) {
            serviciosMarcados.push(servicioFijo);
            console.log("Servicios Marcados: ", serviciosMarcados);

            console.log("Marcado: " + servicioFijo.nombre);
          } else {
            console.log("Desmarcado: " + servicioFijo.nombre);
            const idABuscar = servicioFijo.id; //--> El ID que deseas buscar y eliminar
            const elementoAEliminar = serviciosMarcados.find(
              (elemento) => elemento.id === idABuscar
            );
            if (elementoAEliminar) {
              //--> Si se encontró el elemento, elimínalo
              const indiceAEliminar =
                serviciosMarcados.indexOf(elementoAEliminar);
              serviciosMarcados.splice(indiceAEliminar, 1);
              console.log(`Elemento con ID ${idABuscar} ha sido eliminado.`);
            } else {
              console.log(
                `Elemento con ID ${idABuscar} no se encontró en el arreglo.`
              );
            }
            console.log("Servicios Marcados: ", serviciosMarcados);
            //--> El arreglo actualizado sin el elemento eliminado
          }
        }
      });
  });
}
// ----------------------------------------------------------------
// Funcion donde se validan e ingresan datos del contratato de los servicios a contratar
// ademas del medidor de ser necesario.
// ----------------------------------------------------------------
contratoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  var newMedidor = {};
  if (
    validator.isEmpty(socioContratanteCedula.value) ||
    validator.isEmpty(socioContratanteNombre.value) ||
    validator.isEmpty(socioContratanteApellido.value)
  ) {
    errorContainer.style.color = "red";
    mensajeError.textContent =
      "Ingresa un número de cédula correspondiente a un socio registrado.";
    socioContratanteCedula.focus();
  } else if (validator.isEmpty(contratoFecha.value)) {
    errorContainer.style.color = "red";
    mensajeError.textContent = "Ingresa una fecha de contrato válida.";
    contratoFecha.focus();
  } else if (validator.isEmpty(contratoCodigo.value)) {
    errorContainer.style.color = "red";
    mensajeError.textContent = "Genera un código de contrato válido.";
    contratoCodigo.focus();
    // } else if (validator.isEmpty(medidorNumeroCasa.value)) {
    //   mensajeError.textContent = "Ingresa un numero de casa válido.";
    //   medidorNumeroCasa.focus();
  } else if (validator.isEmpty(medidorBarrio.value)) {
    errorContainer.style.color = "red";
    mensajeError.textContent =
      "Genera un código de contrato para indicar un barrio válido.";
    medidorBarrio.focus();
    // } else if (validator.isEmpty(medidorPrincipal.value)) {
    //   mensajeError.textContent = "Ingresa una calle principal válida.";
    //   medidorPrincipal.focus();
    // } else if ( validator.isEmpty(medidorSecundaria.value)) {
    //   mensajeError.textContent = "Ingresa una calle secundaria válida.";
    //   medidorSecundaria.focus();
  } else if (validator.isEmpty(medidorReferencia.value)) {
    errorContainer.style.color = "red";
    mensajeError.textContent = "Ingresa una referencia válida.";
    medidorReferencia.focus();
  } else if (
    contratoConMedidor &&
    validator.isEmpty(medidorInstalacion.value)
  ) {
    errorContainer.style.color = "red";
    mensajeError.textContent = "Ingresa una fecha de instalación válida.";
    medidorInstalacion.focus();
  } else if (contratoConMedidor && validator.isEmpty(medidorMarca.value)) {
    errorContainer.style.color = "red";
    mensajeError.textContent = "Ingresa una marca del medidor.";
    medidorMarca.focus();
    // } else if (
    //   contratoConMedidor &&
    //   validator.isEmpty(medidorObservacion.value)
    // ) {
    //   mensajeError.textContent = "Ingresa una observación válida.";
    //   medidorObservacion.focus();
    // } else if (serviciosDisponiblesAContratar.length === 0) {
    //   errorContainer.style.color = "red";
    //   mensajeError.textContent = "Selecciona al menos un servicio a contratar.";
    // } else if (serviciosMarcados.length === 0) {
    //   errorContainer.style.color = "red";
    //   mensajeError.textContent = "Selecciona al menos un servicio a contratar.";
  } else {
    console.log("Servicios a contratar: " + serviciosDisponiblesAContratar);
    if (!socioContratanteId == "") {
      var contratoEstadoDf = "Activo";
      var medidorDf = "No";
      var callePrincipalDf = "SN";
      var calleSecundariaDf = "SN";
      var numeroCasaDf = "SN";
      var observacionDf = "NA";
      var principalDf = "Si";
      let serviciosCompartidosDf = 0;
      if (contratoConMedidor) {
        medidorDf = "Si";
      }
      if ((contratoEstado.checked = true)) {
        contratoEstadoDf = "Activo";
      }
      if (!validator.isEmpty(medidorNumeroCasa.value)) {
        numeroCasaDf = medidorNumeroCasa.value;
      }
      if (!validator.isEmpty(medidorPrincipal.value)) {
        callePrincipalDf = medidorPrincipal.value;
      }
      if (!validator.isEmpty(medidorSecundaria.value)) {
        calleSecundariaDf = medidorSecundaria.value;
      }
      if (!validator.isEmpty(medidorObservacion.value)) {
        observacionDf = medidorObservacion.value;
      }
      if (!validator.isEmpty(contratoPrincipalSn.value)) {
        if (contratoPrincipalSn.value == "Principal") {
          principalDf = "Si";
        } else {
          principalDf = "No";
        }
      }
      if (serviciosCompartidos.value !== "0") {
        serviciosCompartidosDf = parseInt(serviciosCompartidos.value);
      }

      newMedidor = {
        codigo: contratoCodigo.value,
        fechaInstalacion: medidorInstalacion.value,
        marca: medidorMarca.value,
        observacion: observacionDf,
        // barrio: medidorBarrio.value,
        // callePrincipal: medidorPrincipal.value,
        // calleSecundaria: medidorSecundaria.value,
        // numeroCasa: medidorNumeroCasa.value,
        // referencia: medidorReferencia.value,
        contratosId: contratoId,
      };
      const newContrato = {
        fecha: contratoFecha.value,
        estado: contratoEstadoDf,
        codigo: contratoCodigo.value,
        sociosId: socioContratanteId,
        medidorSn: medidorDf,
        barrio: medidorBarrio.value,
        callePrincipal: callePrincipalDf,
        calleSecundaria: calleSecundariaDf,
        numeroCasa: numeroCasaDf,
        referencia: medidorReferencia.value,
        principalSn: principalDf,
        serviciosCompartidos: serviciosCompartidosDf,
        // contratosId: contratoId,
      };
      const fakeMedidor = {
        codigo: contratoCodigo.value,
        fechaInstalacion: null,
        marca: "NA",
        observacion: "NA",
      };
      if (!editingStatus) {
        try {
          const resultContrato = await ipcRenderer.invoke(
            "createContrato",
            newContrato,
            numero,
            sectorId
          );
          console.log(
            "Muestro resultado de insertar contrato: ",
            resultContrato
          );
          contratoId = resultContrato.id;
          console.log(
            "Muestro id resultado de insertar contrato: ",
            contratoId
          );
          const servicioGuia = {
            fechaEmision: contratoFecha.value,
            estado: "Activo",
            valorIndividual: 0,
            numeroPagosIndividual: 1,
            valorPagosIndividual: 0,
            descuentoValor: 0,
            serviciosId: 34,
            contratosId: contratoId,
            descuentosId: 1,
          };
          const resultGuia = await ipcRenderer.invoke(
            "createServicioGuia",
            servicioGuia
          );
          console.log("resultado de crearGuia: ", resultGuia);

          fakeMedidor.contratosId = contratoId;
          const result = await ipcRenderer.invoke(
            "updateMedidor",
            contratoId,
            fakeMedidor
          );
          console.log("resultado de crearMedidor: ", result);
          editContrato(contratoId);
          // if (!contratoId == "" || !contratoId == undefined) {
          //   await contratarServicios(
          //     serviciosDisponiblesAContratar,
          //     contratoId
          //   );
          //   // if (contratoConMedidor) {
          //   //   console.log("vamos a crear un medidor");
          //   //   newMedidor.contratosId = contratoId;
          //   //   const result = await ipcRenderer.invoke(
          //   //     "createMedidor",
          //   //     newMedidor
          //   //   );

          //   //   console.log(result);
          //   // }
          // }
        } catch (e) {
          console.log("Error al registrar el contrato: ", e);
        }
      } else {
        console.log("Editing contrato with electron");
        newMedidor.contratosId = editContratoId;
        try {
          const resultContrato = await ipcRenderer.invoke(
            "updateContrato",
            editContratoId,
            newContrato
          );
          if (contratoConMedidor) {
            const resultMedidor = await ipcRenderer.invoke(
              "updateMedidor",
              editContratoId,
              newMedidor
            );
          }
          // contratarServicios(serviciosDisponiblesAContratar, editContratoId);
          console.log(resultContrato);
        } catch (error) {
          console.log("Error al editar el contrato: ", error);
        }
        // editingStatus = false;
        // editContratoId = "";
      }

      // ;
      // contratoId = "";
      // editContratoId = "";
      // contratoConMedidor = false;
      // contratoForm.reset();
      // socioContratanteCedula.focus();
    } else {
      console.log("Socio not found");
    }
  }
});

// ----------------------------------------------------------------
// Funcion que recibe el id del servicio a contratar y los relaciona con el id del contrato
// Registra un servicio contratado a la vez.
// ----------------------------------------------------------------
async function contratarServicio(servicioAContratar, contratoId) {
  console.log(
    "Contratando Servicios para: " + contratoId + "|" + servicioAContratar
  );
  try {
    var adquiridoSn = "Innactivo";
    if (document.getElementById(servicioAContratar).checked) {
      adquiridoSn = "Activo";
    }
    var resultServiciosContratados = await ipcRenderer.invoke(
      "createServicioFijoContratado",
      servicioAContratar,
      contratoId,
      1,
      adquiridoSn
    );

    console.log(
      "Resultado de contratar servicios: ",
      resultServiciosContratados
    );
  } catch (e) {
    console.log(e);
  }
}
// ----------------------------------------------------------------
// Funcion que recibe los id de servicios a contratar y los relaciona con el id del contrato
// Registra varios servicios contratados a la vez
// ----------------------------------------------------------------
function contratarServicios(serviciosAContratar, contratoId) {
  console.log("Contratando Servicios para: " + contratoId);
  var conteoRegistros = serviciosAContratar.length;
  try {
    serviciosAContratar.forEach(async (servicioAContratar) => {
      var adquiridoSn = "";
      if (document.getElementById(servicioAContratar).checked) {
        adquiridoSn = "Activo";
      } else {
        adquiridoSn = "Innactivo";
      }
      var resultServiciosContratados = await ipcRenderer.invoke(
        "createServiciosContratados",
        servicioAContratar,
        contratoId,
        1,
        adquiridoSn
      );

      console.log(
        "Resultado de contratar servicios: ",
        resultServiciosContratados
      );
      conteoRegistros = conteoRegistros - 1;
      console.log("conteo: " + conteoRegistros);
    });
    ipcRenderer.on("notifyContratarServicios", (event) => {
      if (conteoRegistros == 1) {
        const NOTIFICATION_TITLE = "Servicios Contratados ";
        new window.Notification(NOTIFICATION_TITLE, {
          body: "Comprueba los detalles en la lista de servicios !",
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
}
// ----------------------------------------------------------------
// Funcion que crea las filas en la tabla de contratos registrados con servicio
// de agua potable por ende con medidor
// ----------------------------------------------------------------
function renderContratosConMedidor(datosContratos) {
  contratosList.innerHTML = "";
  if (datosContratos !== undefined) {
    datosContratos.forEach((datosContrato) => {
      // Crea un nuevo div con la clase "col-xl-6 col-lg-6 col-md-6 col-sm-12"
      const divCol = document.createElement("div");
      // divCol.style.backgroundColor = "black";
      divCol.className = " col-xl-6 col-lg-6 col-md-6 col-sm-12 px-1";
      // Crea el div con la clase "card" y estilos
      const divCard = document.createElement("div");
      divCard.className = "clase col-lg-12 col-md-12 col-sm-12 my-1 mx-1 card";
      divCard.style.padding = "0.3em";
      divCard.style.width = "100%";
      divCard.style.backgroundColor = "#d6eaf8";

      // Crea el div del encabezado con la clase "card-header" y estilos
      const divCardHeader = document.createElement("div");
      divCardHeader.className =
        "card-header d-flex justify-content-between align-items-center mp-0";
      divCardHeader.style.backgroundColor = "#85c1e9";

      // Crea el primer conjunto de elementos de texto
      const divText1 = document.createElement("div");
      divText1.className = "d-flex mp-0";
      const pText1 = document.createElement("p");
      pText1.className = "mp-0 fs-5";
      pText1.textContent = "Contrato:";
      const pTrans1 = document.createElement("p");
      pTrans1.className = "trans mp-0";
      pTrans1.textContent = "-";
      const pText2 = document.createElement("p");
      pText2.className = "mp-0 text-white fs-5";
      pText2.textContent = datosContrato.codigo;
      divText1.appendChild(pText1);
      divText1.appendChild(pTrans1);
      divText1.appendChild(pText2);

      // Crea el segundo conjunto de elementos de texto
      const divText2 = document.createElement("div");
      divText2.className = "d-flex mp-0";
      const pText3 = document.createElement("p");
      pText3.className = "mp-0 fs-5";
      pText3.textContent = "Socio:";
      const pTrans2 = document.createElement("p");
      pTrans2.textContent = "-";
      pTrans2.className = "trans mp-0";
      const pText4 = document.createElement("p");
      pText4.className = "mp-0 mt-1";
      pText4.style.fontSize = "1em";
      pText4.textContent = datosContrato.socio;
      divText2.appendChild(pText3);
      divText2.appendChild(pTrans2);
      divText2.appendChild(pText4);

      // Agrega los conjuntos de elementos de texto al div del encabezado
      divCardHeader.appendChild(divText1);
      divCardHeader.appendChild(divText2);

      // Crea el div del cuerpo con la clase "card-body" y estilos
      const divCardBody = document.createElement("div");
      divCardBody.className = "card-body";
      divCardBody.style.backgroundColor = "white";
      const divDateSt = document.createElement("div");
      divDateSt.className = "d-flex justify-content-between";
      // Crea un div para la fecha de contrato y agrega contenido
      const divFechaContrato = document.createElement("div");
      divFechaContrato.className = "col-9 d-flex";
      const h6FechaContrato = document.createElement("h6");
      h6FechaContrato.innerHTML =
        '<i style="color: #85c1e9" class="fa-regular fa-calendar-days mx-2"></i>Fecha de contrato:';
      const pFechaContrato = document.createElement("p");
      const spaceFechaContrato = document.createElement("p");
      spaceFechaContrato.className = "trans";
      spaceFechaContrato.textContent = "-";
      pFechaContrato.textContent = formatearFecha(datosContrato.fecha);
      divFechaContrato.appendChild(h6FechaContrato);
      divFechaContrato.appendChild(spaceFechaContrato);
      divFechaContrato.appendChild(pFechaContrato);

      // Crea un div para el estado "Activo" y agrega contenido
      const divEstadoActivo = document.createElement("div");
      divEstadoActivo.className =
        "col-3 d-flex justify-content-end align-items-baseline";
      const pEstadoActivo = document.createElement("p");
      // pEstadoActivo.classList.add("trans");
      // pEstadoActivo.textContent = "-";
      pEstadoActivo.textContent = datosContrato.estado;
      const iconActivo = document.createElement("i");
      iconActivo.classList.add("mx-2", "fa-solid", "fa-toggle-on");
      iconActivo.style.color = "#85c1e9";
      divEstadoActivo.appendChild(pEstadoActivo);
      divEstadoActivo.appendChild(iconActivo);
      divDateSt.appendChild(divFechaContrato);
      divDateSt.appendChild(divEstadoActivo);
      // Crea un div para la ubicación y agrega contenido
      const divUbicacion = document.createElement("div");
      divUbicacion.className = "col-12 text-center";
      const h6Ubicacion = document.createElement("h6");
      h6Ubicacion.textContent = "Ubicacion";
      const pUbicacion = document.createElement("p");
      const icoLocation = document.createElement("i");
      icoLocation.style.color = "#85c1e9";
      icoLocation.className = "mx-2 fa-solid fa-location-dot";
      pUbicacion.appendChild(icoLocation);
      const locationText = document.createTextNode(
        "Barrio " +
          datosContrato.barrio +
          ", " +
          datosContrato.callePrincipal +
          " y " +
          datosContrato.calleSecundaria +
          ", " +
          datosContrato.numeroCasa +
          "."
      );
      pUbicacion.appendChild(locationText);
      // pUbicacion.innerHTML =
      //   '<i style="color: #85c1e9" class="mx-2 fa-solid fa-location-dot"></i>
      //   Barrio Los Laureles, Buenavista y La troncal, N-201';
      divUbicacion.appendChild(h6Ubicacion);
      divUbicacion.appendChild(pUbicacion);

      // Crea un div para el botón
      const divBoton = document.createElement("div");
      divBoton.classList.add("col-12", "d-flex", "justify-content-end");
      const boton = document.createElement("button");
      boton.classList.add("btn-custom");
      boton.innerHTML = 'Actualizar <i class="mx-1 fa-solid fa-file-pen"></i>';
      boton.onclick = () => {
        editContrato(datosContrato.contratosId);
      };
      divBoton.appendChild(boton);

      // Agrega los elementos al cuerpo
      divCardBody.appendChild(divDateSt);

      divCardBody.appendChild(divUbicacion);
      divCardBody.appendChild(divBoton);

      // Agrega el encabezado y el cuerpo al div de la tarjeta
      divCard.appendChild(divCardHeader);
      divCard.appendChild(divCardBody);

      // Agrega el div de la tarjeta al div de columna
      divCol.appendChild(divCard);
      divCol.onclick = () => {
        // Elimina la clase "selected" de todos los elementos
        const elementos = document.querySelectorAll(".clase"); // Reemplaza con la clase real de tus elementos
        elementos.forEach((elemento) => {
          elemento.classList.remove("bg-secondary");
        });

        // Agrega la clase "selected" al elemento que se hizo clic
        divCard.classList.add("bg-secondary");
        detallesContratos(datosContrato);
      };
      // Agrega el div de columna al documento
      contratosList.appendChild(divCol);
    });
  }
}

function renderContratosSinMedidor(datosContratosSinMedidor) {
  contratosSinMedidorList.innerHTML = "";
  if (datosContratosSinMedidor !== undefined) {
    datosContratosSinMedidor.forEach((datosContrato) => {
      // Crea un nuevo div con la clase "col-xl-6 col-lg-6 col-md-6 col-sm-12"
      const divCol = document.createElement("div");
      // divCol.style.backgroundColor = "black";
      divCol.className = " col-xl-6 col-lg-6 col-md-6 col-sm-12 px-1";
      // Crea el div con la clase "card" y estilos
      const divCard = document.createElement("div");
      divCard.className = "clase col-lg-12 col-md-12 col-sm-12 my-1 mx-1 card";
      divCard.style.padding = "0.3em";
      divCard.style.width = "100%";
      divCard.style.backgroundColor = "#d6eaf8";

      // Crea el div del encabezado con la clase "card-header" y estilos
      const divCardHeader = document.createElement("div");
      divCardHeader.className =
        "card-header d-flex justify-content-between align-items-center mp-0";
      divCardHeader.style.backgroundColor = "#85c1e9";

      // Crea el primer conjunto de elementos de texto
      const divText1 = document.createElement("div");
      divText1.className = "d-flex mp-0";
      const pText1 = document.createElement("p");
      pText1.className = "mp-0 fs-5";
      pText1.textContent = "Contrato:";
      const pTrans1 = document.createElement("p");
      pTrans1.className = "trans mp-0";
      pTrans1.textContent = "-";
      const pText2 = document.createElement("p");
      pText2.className = "mp-0 text-white fs-5";
      pText2.textContent = datosContrato.codigo;
      divText1.appendChild(pText1);
      divText1.appendChild(pTrans1);
      divText1.appendChild(pText2);

      // Crea el segundo conjunto de elementos de texto
      const divText2 = document.createElement("div");
      divText2.className = "d-flex mp-0";
      const pText3 = document.createElement("p");
      pText3.className = "mp-0 fs-5";
      pText3.textContent = "Socio:";
      const pTrans2 = document.createElement("p");
      pTrans2.classList.Name = "trans mp-0";
      pTrans2.textContent = "-";
      const pText4 = document.createElement("p");
      pText4.className = "mp-0 mt-1";
      pText4.style.fontSize = "1em";
      pText4.textContent = datosContrato.socio;
      divText2.appendChild(pText3);
      divText2.appendChild(pTrans2);
      divText2.appendChild(pText4);

      // Agrega los conjuntos de elementos de texto al div del encabezado
      divCardHeader.appendChild(divText1);
      divCardHeader.appendChild(divText2);

      // Crea el div del cuerpo con la clase "card-body" y estilos
      const divCardBody = document.createElement("div");
      divCardBody.className = "card-body";
      divCardBody.style.backgroundColor = "white";
      const divDateSt = document.createElement("div");
      divDateSt.className = "d-flex justify-content-between";
      // Crea un div para la fecha de contrato y agrega contenido
      const divFechaContrato = document.createElement("div");
      divFechaContrato.className = "col-9 d-flex";
      const h6FechaContrato = document.createElement("h6");
      h6FechaContrato.innerHTML =
        '<i style="color: #85c1e9" class="fa-regular fa-calendar-days mx-2"></i>Fecha de contrato:';
      const pFechaContrato = document.createElement("p");
      const spaceFechaContrato = document.createElement("p");
      spaceFechaContrato.className = "trans";
      spaceFechaContrato.textContent = "-";
      pFechaContrato.textContent = formatearFecha(datosContrato.fecha);
      divFechaContrato.appendChild(h6FechaContrato);
      divFechaContrato.appendChild(spaceFechaContrato);
      divFechaContrato.appendChild(pFechaContrato);

      // Crea un div para el estado "Activo" y agrega contenido
      const divEstadoActivo = document.createElement("div");
      divEstadoActivo.className =
        "col-3 d-flex justify-content-end align-items-baseline";
      const pEstadoActivo = document.createElement("p");
      // pEstadoActivo.classList.add("trans");
      // pEstadoActivo.textContent = "-";
      pEstadoActivo.textContent = datosContrato.estado;
      const iconActivo = document.createElement("i");
      iconActivo.classList.add("mx-2", "fa-solid", "fa-toggle-on");
      iconActivo.style.color = "#85c1e9";
      divEstadoActivo.appendChild(pEstadoActivo);
      divEstadoActivo.appendChild(iconActivo);
      divDateSt.appendChild(divFechaContrato);
      divDateSt.appendChild(divEstadoActivo);
      // Crea un div para la ubicación y agrega contenido
      const divUbicacion = document.createElement("div");
      divUbicacion.className = "col-12 text-center";
      const h6Ubicacion = document.createElement("h6");
      h6Ubicacion.textContent = "Ubicacion";
      const pUbicacion = document.createElement("p");
      const icoLocation = document.createElement("i");
      icoLocation.style.color = "#85c1e9";
      icoLocation.className = "mx-2 fa-solid fa-location-dot";
      pUbicacion.appendChild(icoLocation);
      const locationText = document.createTextNode(
        "Barrio " +
          datosContrato.barrio +
          ", " +
          datosContrato.callePrincipal +
          " y " +
          datosContrato.calleSecundaria +
          ", " +
          datosContrato.numeroCasa +
          "."
      );
      pUbicacion.appendChild(locationText);
      // pUbicacion.innerHTML =
      //   '<i style="color: #85c1e9" class="mx-2 fa-solid fa-location-dot"></i>
      //   Barrio Los Laureles, Buenavista y La troncal, N-201';
      divUbicacion.appendChild(h6Ubicacion);
      divUbicacion.appendChild(pUbicacion);

      // Crea un div para el botón
      const divBoton = document.createElement("div");
      divBoton.classList.add("col-12", "d-flex", "justify-content-end");
      const boton = document.createElement("button");
      boton.classList.add("btn-custom");
      boton.innerHTML = 'Actualizar <i class="mx-1 fa-solid fa-file-pen"></i>';
      boton.onclick = () => {
        editContrato(datosContrato.contratosId);
      };
      divBoton.appendChild(boton);

      // Agrega los elementos al cuerpo
      divCardBody.appendChild(divDateSt);

      divCardBody.appendChild(divUbicacion);
      divCardBody.appendChild(divBoton);

      // Agrega el encabezado y el cuerpo al div de la tarjeta
      divCard.appendChild(divCardHeader);
      divCard.appendChild(divCardBody);

      // Agrega el div de la tarjeta al div de columna
      divCol.appendChild(divCard);
      divCol.onclick = () => {
        // Elimina la clase "selected" de todos los elementos
        const elementos = document.querySelectorAll(".clase"); // Reemplaza con la clase real de tus elementos
        elementos.forEach((elemento) => {
          elemento.classList.remove("bg-secondary");
        });

        // Agrega la clase "selected" al elemento que se hizo clic
        divCard.classList.add("bg-secondary");
        detallesContratos(datosContrato);
      };
      // Agrega el div de columna al documento
      contratosSinMedidorList.appendChild(divCol);
    });
  }
}

// ----------------------------------------------------------------
// Funcion que crea las cards de los servicios registrados segun el id
// del contrato seleccionado
// ----------------------------------------------------------------
function renderServiciosContratados(serviciosContratados) {
  serviciosContratadosList.innerHTML = "";
  serviciosContratados.forEach((servicioContratado) => {
    serviciosContratadosList.innerHTML += `
     
    <div class="col-12 text-center  my-1">
    <div class="card card-fondo card-espacios mx-2" style="height: 12rem; width:100%">
      <div class="card-zona-img"></div>
      <div class="card-body col-12 card-contenido">
        <div class="col-12">
          <h5 class="card-title">${servicioContratado.nombre}</h5>
        </div>
        <div class="col-12 card-zona-desc-ct">
          <p class="card-text">
            ${servicioContratado.descripcion}
          </p>
        </div>
        <div
          class="col-12 d-flex justify-content-center align-items-center"
        ></div>
      </div>
    </div>
  </div>
      `;
  });
  console.log(serviciosDisponiblesAContratar[0]);
}
// ----------------------------------------------------------------
// Funcion que crea las cards de los servicios disponibles para los nuevos contratos
// ----------------------------------------------------------------
async function renderServiciosDisponibles(serviciosDisponibles) {
  serviciosDisponiblesAContratar = [];
  servicosDisponiblesList.innerHTML = "";
  for (let i = 0; i < serviciosDisponibles.length; i++) {
    console.log("Servicios: ", serviciosDisponibles[i]);
    //serviciosContratados.forEach((servicioContratado) => {

    serviciosDisponiblesAContratar.push(serviciosDisponibles[i].id);

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("col-6", "text-center");

    const card = document.createElement("div");
    card.classList.add("card", "card-fondo", "my-2");
    card.style.height = "18rem";

    const cardImage = document.createElement("div");
    cardImage.classList.add("card-zona-img");
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "col-12", "card-contenido");

    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.textContent = serviciosDisponibles[i].nombre;

    const description = document.createElement("p");
    description.classList.add("card-text");
    description.textContent = serviciosDisponibles[i].descripcion;
    const divValue = document.createElement("div");
    const divRowBtn = document.createElement("div");
    divRowBtn.className = "row";

    divValue.className = "col-2 mp-0 text-center";
    const pValue = document.createElement("p");
    pValue.className = "mp-0 value-disponibles";
    pValue.textContent =
      "$" + parseFloat(serviciosDisponibles[i].valor).toFixed(2);

    divValue.appendChild(pValue);
    const checkboxDiv = document.createElement("div");
    checkboxDiv.classList.add(
      "col-8",
      "d-flex",
      "justify-content-center",
      "align-items-center"
    );

    const checkbox = document.createElement("input");
    //checkbox.checked = "false";
    checkbox.type = "checkbox";
    checkbox.classList.add("btn-check");
    //checkbox.name = "options-outlined";
    checkbox.id = serviciosDisponibles[i].id;
    checkbox.autocomplete = "off";
    checkbox.checked = false;
    const label = document.createElement("label");
    label.style.width = "100%";
    label.classList.add("btn", "btn-outline-warning");
    label.setAttribute("for", serviciosDisponibles[i].id);
    label.textContent = "Contratar";
    let compartidoSn = false;
    let compartidoAnteriorSn = false;
    if (serviciosDisponibles[i].IndividualSn == "Compartido") {
      compartidoSn = true;

      label.innerHTML = 'Contratar<i class="mx-2 fa-solid fa-share-nodes"></i>';
      const compartidoContratado = await ipcRenderer.invoke(
        "getCompartidosContratados",
        serviciosDisponibles[i].id,
        editSocioId
      );

      console.log("CompartidoSn: " + compartidoContratado.length);
      if (compartidoContratado.length > 0) {
        compartidoAnteriorSn = true;
      }
    }
    checkbox.onclick = () => {
      if (serviciosDisponibles[i].nombre === "Agua Potable") {
        habilitarFormMedidor();
        if (validator.isEmpty(medidorInstalacion.value)) {
          errorContainer.style.color = "red";
          mensajeError.textContent =
            "Debes ingresar una fecha de instalacion válida.";
          medidorInstalacion.focus();
          checkbox.checked = false;
        } else if (validator.isEmpty(medidorMarca.value)) {
          errorContainer.style.color = "red";
          mensajeError.textContent =
            "Debes ingresar una marca valida para el medidor.";
          medidorMarca.focus();
          checkbox.checked = false;
        } else {
          Swal.fire({
            title: "¿Quieres contratar este servicio para este contrato?",
            text: "El valor se cargara en la planilla a partir del mes próximo.",
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
              // checkbox.checked = true;
              var observacionDf = "SN";
              if (!validator.isEmpty(medidorObservacion.value)) {
                observacionDf = medidorObservacion.value;
              }

              newContrato = {
                medidorSn: "Si",
              };
              newMedidor = {
                codigo: contratoCodigo.value,
                fechaInstalacion: medidorInstalacion.value,
                marca: medidorMarca.value,
                observacion: observacionDf,
                // barrio: medidorBarrio.value,
                // callePrincipal: medidorPrincipal.value,
                // calleSecundaria: medidorSecundaria.value,
                // numeroCasa: medidorNumeroCasa.value,
                // referencia: medidorReferencia.value,
                contratosId: editContratoId,
              };
              const resultContrato = await ipcRenderer.invoke(
                "updateContrato",
                editContratoId,
                newContrato
              );
              console.log("vamos a crear un medidor");
              const result = await ipcRenderer.invoke(
                "updateMedidor",
                editContratoId,
                newMedidor
              );
              console.log("Resultado del medidor: " + result);
              if (result.id !== undefined) {
                console.log("Muestro result del medior: " + result.id);
                contratarServicio(serviciosDisponibles[i].id, editContratoId);
              }
              await editContrato(editContratoId);
              await editContrato(editContratoId);
            } else {
              checkbox.checked = false;
              inHabilitarFormMedidor();
            }
          });
        }
      } else {
        if (compartidoAnteriorSn && compartidoSn) {
          Swal.fire({
            title: "¿Quieres contratar este servicio para este contrato?",
            text:
              "Este servicio es compartido y ha sido adquirido en un contrato anterior \n" +
              "¿Deseas contratarlo de  todas formas? \n El valor se cargará en la planilla a partir del mes próximo.",
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
              // checkbox.checked = true;
              contratarServicio(serviciosDisponibles[i].id, editContratoId);
              await editContrato(editContratoId);
              await editContrato(editContratoId);
            } else {
              checkbox.checked = false;
            }
          });
        } else {
          Swal.fire({
            title: "¿Quieres contratar este servicio para este contrato?",
            text: "El valor se cargara en la planilla a partir del mes próximo.",
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
              // checkbox.checked = true;
              contratarServicio(serviciosDisponibles[i].id, editContratoId);
              await editContrato(editContratoId);
              await editContrato(editContratoId);
            } else {
              checkbox.checked = false;
            }
          });
        }
      }
    };

    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(label);
    divRowBtn.appendChild(divValue);

    divRowBtn.appendChild(checkboxDiv);
    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(divRowBtn);
    // cardBody.appendChild(divValue);
    // cardBody.appendChild(checkboxDiv);

    card.appendChild(cardImage);
    card.appendChild(cardBody);
    cardContainer.appendChild(card);
    servicosDisponiblesList.appendChild(cardContainer);
  }
  marcarServiciosContratados();

  console.log(serviciosDisponiblesAContratar[0]);
}
async function marcarServiciosContratados() {
  if (serviciosEditar !== null) {
    console.log("Marcando servicios: " + serviciosEditar);
    for (let i = 0; i < serviciosEditar.length; i++) {
      const checkContratados = document.getElementById(
        serviciosEditar[i].serviciosId
      );
      checkContratados.checked = true;

      const labelElement = document.querySelector(
        'label[for="' + serviciosEditar[i].serviciosId + '"]'
      );
      labelElement.textContent = "Contratado";
      console.log("Compartido: ", serviciosEditar[i]);
      let compartidoSn = false;
      if (serviciosEditar[i].IndividualSn == "Compartido") {
        compartidoSn = true;
        labelElement.innerHTML =
          'Contratado<i class="mx-2 fa-solid fa-share-nodes"></i>';
        // const compartidoContratado = await ipcRenderer.invoke(
        //   "getCompartidosContratados",
        //   serviciosEditar[i].id,
        //   editSocioId
        // );
        // if (compartidoContratado.length > 0) {
        //   compartidoAnteriorSn = true;
        // }
      }
      checkContratados.onclick = () => {
        // checkContratados.checked = false;

        if (compartidoSn) {
          Swal.fire({
            title: "¿Quieres quitar este servicio de este contrato?",
            text:
              "Este servicio es compartido al descontratarlo el resto de contratos \n" +
              "relacionados con el socio no se beneficiaran de el.\n" +
              "El valor no se cargara en la planilla a partir del mes próximo.",
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
              if (serviciosEditar[i].nombre === "Agua Potable") {
                const newContrato = {
                  medidorSn: "No",
                };
                const resultContrato = await ipcRenderer.invoke(
                  "updateContrato",
                  editContratoId,
                  newContrato
                );
                contratarServicio(
                  serviciosEditar[i].serviciosId,
                  editContratoId
                );
              } else {
                contratarServicio(
                  serviciosEditar[i].serviciosId,
                  editContratoId
                );
              }
              await editContrato(editContratoId);
              await editContrato(editContratoId);
            } else {
              checkContratados.checked = true;
            }
          });
        } else {
          Swal.fire({
            title: "¿Quieres quitar este servicio de este contrato?",
            text: "El valor no se cargara en la planilla a partir del mes próximo.",
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
              if (serviciosEditar[i].nombre === "Agua Potable") {
                const newContrato = {
                  medidorSn: "No",
                };
                const resultContrato = await ipcRenderer.invoke(
                  "updateContrato",
                  editContratoId,
                  newContrato
                );
                contratarServicio(
                  serviciosEditar[i].serviciosId,
                  editContratoId
                );
              } else {
                contratarServicio(
                  serviciosEditar[i].serviciosId,
                  editContratoId
                );
              }
              await editContrato(editContratoId);
              await editContrato(editContratoId);
            } else {
              checkContratados.checked = true;
            }
          });
        }
      };
    }
  }
}
// ----------------------------------------------------------------
// Funcion que muestra los detalles de los contratos registrados
// segun se los seleccione
// ----------------------------------------------------------------
const detallesContratos = async (contrato) => {
  console.log("Detallles de : " + contrato.contratosId);
  codigoDt.textContent = contrato.codigo;
  estadoDt.textContent = contrato.estado;
  medidorSnDt.textContent = contrato.medidorSn;
  fechaDt.textContent = formatearFecha(contrato.fecha);
  socioDt.textContent = contrato.socio;
  const locationText = document.createTextNode(
    "Barrio " + contrato.barrio + "."
    // ", " +
    // contrato.callePrincipal +
    // " y " +
    // contrato.calleSecundaria +
    // ", " +
    // contrato.numeroCasa +
    // "."
  );
  ubicacionDt.appendChild(locationText);
  contratoForm.reset();
  // resetForm();
  const serviciosContratos = await ipcRenderer.invoke(
    "getServiciosContratadosById",
    contrato.contratosId
  );
  renderServiciosContratados(serviciosContratos);
  console.log(serviciosContratos);
  return serviciosContratos;
};
// ----------------------------------------------------------------
// Funcion que carga los datos de los contratos registrados y los muestra en
// el formulario para editarlos
// ----------------------------------------------------------------
const editContrato = async (id) => {
  let principalSn = "undefined";
  contratoForm.reset();
  const contrato = await ipcRenderer.invoke("getDatosContratosById", id);
  console.log("Recibido: " + contrato.sociosId);
  editSocioId = contrato.sociosId;
  console.log("Editosocio" + editSocioId);
  getServiciosDisponibles();
  await getContratosSimilares(editSocioId, contrato.id);
  if (contrato.serviciosCompartidos !== 0) {
    serviciosCompartidos.value = contrato.serviciosCompartidos;
  } else {
    serviciosCompartidos.value = "0";
  }
  var conMedidor = contrato.medidorSn;
  if (conMedidor == "Si") {
    contratoConMedidor = true;
    console.log("conMedidor");
    habilitarFormMedidor();
    contratoFecha.value = formatearFecha(contrato.fecha);
    socioContratanteCedula.value = contrato.cedulaPasaporte;
    socioContratanteApellido.value =
      contrato.primerApellido + " " + contrato.segundoApellido;
    socioContratanteNombre.value =
      contrato.primerNombre + " " + contrato.segundoNombre;
    contratoCodigo.value = contrato.codigo;

    if (contrato.principalSn == "No") {
      principalSn = "Secundario";
      contratoPrincipalSn.value = principalSn;

      contratoPrincipalSn.onclick = () => {
        Swal.fire({
          title: "¿Quieres realizar cambios?",
          text:
            "Este contrato es " +
            principalSn +
            " por lo que no presentara valores por socio " +
            "puedes hacer de este un contrato principal actualizando el resto de contratos " +
            "de este socio a secundarios.",
          icon: "question",
          iconColor: "#f8c471",
          showCancelButton: true,
          confirmButtonColor: "#2874A6",
          cancelButtonColor: "#EC7063 ",
          confirmButtonText: "Cambiar a principal",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Quieres confirmar esta accion?",
              text: "Actualizaremos este contrato como principal.",
              showCancelButton: true,
              confirmButtonText: "Aceptar",
              cancelButtonText: `Cancelar`,
            }).then((result) => {
              if (result.isConfirmed) {
                // Aquí puedes realizar la acción que desees cuando el usuario confirme.
                cambiarContratoPrincipal(contrato.id, contrato.sociosId);
              }
            });
          }
        });
      };
    } else {
      principalSn = "Principal";
      contratoPrincipalSn.value = principalSn;
      // ----------------------------------------------------------------
      // Cambiar el contrato principal.
      // ----------------------------------------------------------------
      contratoPrincipalSn.onclick = () => {
        Swal.fire({
          title: "Contrato principal",
          text:
            "Los valores por socio se" +
            "cargaran en las planillas de este contrato.",
          icon: "info",
          iconColor: "green",
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "green",
        });
      };
    }

    contratoConMedidor = true;
    //medidorCodigo.value = contrato.codigoMedidor;
    medidorInstalacion.value = formatearFecha(contrato.fechaInstalacion);
    medidorMarca.value = contrato.marca;
    medidorObservacion.value = contrato.observacion;
    medidorBarrio.value = contrato.barrio;
    medidorPrincipal.value = contrato.callePrincipal;
    medidorSecundaria.value = contrato.calleSecundaria;
    medidorNumeroCasa.value = contrato.numeroCasa;
    medidorReferencia.value = contrato.referencia;
    // Permitimos editar los datos del medidor
    // medidorCodigo.disabled = false;
    medidorInstalacion.readOnly = true;
    medidorInstalacion.disabled = false;
    medidorMarca.disabled = false;
    medidorObservacion.disabled = false;
    serviciosCompartidos.disabled = false;
    // Inhabilitamos los campos que no se deben editar
    contratoFecha.readOnly = true;
    socioContratanteCedula.readOnly = true;
    socioContratanteApellido.readOnly = true;
    socioContratanteNombre.readOnly = true;
    generarCodigoBt.disabled = true;

    // ~~~~~~~~~~~~~~~~
    editContratoId = contrato.id;
  } else {
    console.log("sinMedidor");
    contratoConMedidor = false;
    inHabilitarFormMedidor();
    contratoCodigo.value = contrato.codigo;
    if (contrato.fecha !== null) {
      contratoFecha.value = formatearFecha(contrato.fecha);
    }

    if (contrato.principalSn == "No") {
      principalSn = "Secundario";
      contratoPrincipalSn.value = principalSn;
      contratoPrincipalSn.onclick = () => {
        Swal.fire({
          title: "¿Quieres realizar cambios?",
          text:
            "Este contrato es " +
            principalSn +
            " por lo que no presentara valores por socio " +
            "puedes hacer de este un contrato principal actualizando el resto de contratos " +
            "de este socio a secundarios.",
          icon: "question",
          iconColor: "#f8c471",
          showCancelButton: true,
          confirmButtonColor: "#2874A6",
          cancelButtonColor: "#EC7063 ",
          confirmButtonText: "Cambiar a principal",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Quieres confirmar esta accion?",
              text: "Actualizaremos este contrato como principal.",
              showCancelButton: true,
              confirmButtonText: "Aceptar",
              cancelButtonText: `Cancelar`,
            }).then((result) => {
              if (result.isConfirmed) {
                cambiarContratoPrincipal(contrato.id, contrato.sociosId);
                // Aquí puedes realizar la acción que desees cuando el usuario confirme.
              }
            });
          }
        });
      };
    } else {
      principalSn = "Principal";
      contratoPrincipalSn.value = principalSn;
      // ----------------------------------------------------------------
      // Cambiar el contrato principal.
      // ----------------------------------------------------------------
      contratoPrincipalSn.onclick = () => {
        Swal.fire({
          title: "Contrato principal",
          text:
            "Los valores por socio se" +
            "cargaran en las planillas de este contrato.",
          icon: "info",
          iconColor: "green",
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "green",
        });
      };
    }
    socioContratanteCedula.value = contrato.cedulaPasaporte;
    socioContratanteApellido.value =
      contrato.primerApellido + " " + contrato.segundoApellido;
    socioContratanteNombre.value =
      contrato.primerNombre + " " + contrato.segundoNombre;

    // medidorCodigo.value = medidor.codigo;
    // medidorInstalacion.value = formatearFecha(medidor.fechaInstalacion);
    // medidoresDisponibles.selectedIndex = 0;
    // medidorMarca.value = medidor.marca;
    // medidorBarrio.value = medidor.barrio;
    // medidorObservacion.value = medidor.observacion;
    medidorBarrio.value = contrato.barrio;
    medidorPrincipal.value = contrato.callePrincipal;
    medidorSecundaria.value = contrato.calleSecundaria;
    medidorNumeroCasa.value = contrato.numeroCasa;
    medidorReferencia.value = contrato.referencia;
    // Permitimos editar los datos del medidor
    // medidorCodigo.disabled = false;
    // Inhabilitamos los campos que no se deben editar
    if (contrato.codigoMedidor != undefined) {
      if (contrato.fechaInstalacion != undefined) {
        medidorInstalacion.value = formatearFecha(contrato.fechaInstalacion);
      }
      medidorMarca.value = contrato.marca;
      medidorObservacion.value = contrato.observacion;
    }
    serviciosCompartidos.disabled = false;
    contratoFecha.readOnly = true;
    socioContratanteCedula.readOnly = true;
    socioContratanteApellido.readOnly = true;
    socioContratanteNombre.readOnly = true;
    generarCodigoBt.disabled = true;
    // ~~~~~~~~~~~~~~~~
    editContratoId = contrato.id;
  }
  socioContratanteId = contrato.sociosId;
  editingStatus = true;
  console.log(contrato);
  console.log("btn1");
  editarServiciosContratados(id);
  getServiciosDisponibles();
  seccion2.classList.remove("active");
  seccion1.classList.add("active");
};
async function cambiarContratoPrincipal(contratoId, socioId) {
  try {
    const cambioPrincipal = await ipcRenderer.invoke(
      "updatePrincipal",
      contratoId,
      socioId
    );
    editContrato(contratoId);
  } catch (error) {
    console.log(error);
  }
}
// ----------------------------------------------------------------
// Funcion que carga los servicios contratados segun el id del contrato
// y los muestra en el formulario para editarlos
// ----------------------------------------------------------------
async function editarServiciosContratados(id) {
  try {
    serviciosEditar = await ipcRenderer.invoke(
      "getServiciosContratadosById",
      id
    );

    //serviciosContratadosList.push(serviciosContratados.serviciosFijosId);
    console.log("Servicios a editar: ", serviciosEditar);
  } catch (error) {
    console.log(
      "Error al cargar los servicios contratados para " + id + " : " + error
    );
  }
}
// ----------------------------------------------------------------
// Funcion que elimina un contrato segun el id
// ----------------------------------------------------------------
const deleteMedidor = async (id) => {
  const response = confirm("Estas seguro de eliminar este medidor?");
  if (response) {
    console.log("id from medidores.js");
    const result = await ipcRenderer.invoke("deleteMedidor", id);
    console.log("Resultado medidores.js", result);
    getContratos();
  }
};
// ----------------------------------------------------------------
// Funcion que carga los contratos relacionados con el socio.
// ----------------------------------------------------------------
const getContratosSimilares = async (socioId, contratoId) => {
  const contratosSimilares = await ipcRenderer.invoke(
    "getContratosSimilares",
    socioId
  );
  console.log(contratosSimilares);
  renderContratosSimilares(contratosSimilares, contratoId);
};
async function renderContratosSimilares(contratosSimilares, contratoId) {
  // serviciosCompartidos.innerHTML = "";
  serviciosCompartidos.innerHTML =
    '<option value="0" selected>Sin servicios compartidos</option>';
  contratosSimilares.forEach((contratosSimilar) => {
    const option = document.createElement("option");
    option.value = contratosSimilar.id;
    option.text =
      contratosSimilar.codigo +
      " ( " +
      contratosSimilar.barrio +
      ", " +
      contratosSimilar.callePrincipal +
      ", " +
      contratosSimilar.calleSecundaria +
      ", " +
      contratosSimilar.numeroCasa +
      " ).";
    if (contratoId !== undefined) {
      console.log("Comparar: " + contratoId, " | ", contratosSimilar.id);
      if (contratoId !== contratosSimilar.id) {
        serviciosCompartidos.appendChild(option);
      }
    } else {
      serviciosCompartidos.appendChild(option);
    }
  });
}
// ----------------------------------------------------------------
// Funcion que consulta los contratos con medidor
// ----------------------------------------------------------------
buscarContratosBtn.addEventListener("click", async function () {
  await getContratos();
  await getContratosSinMedidor();
});
const getContratos = async () => {
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  datosContratos = await ipcRenderer.invoke(
    "getContratosConMedidor",
    criterioBuscar,
    criterioContentBuscar
  );
  console.log(datosContratos);

  renderContratosConMedidor(datosContratos);
};
// ----------------------------------------------------------------
// Funcion que consulta los contratos sin medidor
// ----------------------------------------------------------------
const getContratosSinMedidor = async () => {
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  datosContratosSinMedidor = await ipcRenderer.invoke(
    "getContratosSinMedidor",
    criterioBuscar,
    criterioContentBuscar
  );
  // console.log("Here: ", datosContratosSinMedidor);

  renderContratosSinMedidor(datosContratosSinMedidor);
};
// ----------------------------------------------------------------
// Funcion que consulta los servicios disponibles para el contrato
// ----------------------------------------------------------------
const getServiciosDisponibles = async () => {
  serviciosDisponibles = await ipcRenderer.invoke("getServiciosDisponibles");
  // console.log("srv dsp", serviciosDisponibles);
  await renderServiciosDisponibles(serviciosDisponibles);
  await eventoServiciosId(serviciosDisponibles);
};
// ----------------------------------------------------------------
// Funcion que carga los eventos iniciales de la interfaz
// ----------------------------------------------------------------
async function init() {
  await getContratos();
  await getContratosSinMedidor();
  // await getServiciosDisponibles();
  // await getMedidoresDisponibles();
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
// ----------------------------------------------------------------
// Cargar datos de los socios registrados
// ----------------------------------------------------------------
// var inputSugerencias = document.getElementById("cedulaSocioContratante");
// var listaSugerencias = document.getElementById("lista-sugerencias");
// var sugerencias = [];
// ----------------------------------------------------------------
// Obtener las sugerencias desde la base de datos
// ----------------------------------------------------------------
async function obtenerSugerencias() {
  try {
    var cedulasSugerencias = await ipcRenderer.invoke("getSocios");
    sugerencias = cedulasSugerencias.map(function (objeto) {
      return objeto;
      // objeto.cedulaPasaporte +
      // " " +
      // objeto.primerNombre +
      // " " +
      // objeto.segundoNombre +
      // " " +
      // objeto.primerApellido +
      // " " +
      // objeto.segundoApellido
    });
  } catch (error) {
    console.error("Error al obtener las sugerencias:", error);
  }
}

socioContratanteCedula.addEventListener("input", function () {
  socioContratanteNombre.value = "";
  socioContratanteApellido.value = "";
  var textoIngresado = socioContratanteCedula.value;
  var sugerenciasFiltradas = sugerencias.filter(function (sugerencia) {
    return sugerencia.cedulaPasaporte.startsWith(textoIngresado);
  });
  if (socioContratanteCedula.value !== "") {
    mostrarSugerencias(sugerenciasFiltradas);
  } else {
    listaSugerencias.style.display = "none";
  }
});
socioContratanteApellido.addEventListener("input", function () {
  socioContratanteNombre.value = "";
  socioContratanteCedula.value = "";
  var textoIngresado = socioContratanteApellido.value;
  var sugerenciasFiltradas = sugerencias.filter(function (sugerencia) {
    return (
      sugerencia.primerApellido.startsWith(textoIngresado),
      sugerencia.segundoApellido.startsWith(textoIngresado)
    );
  });
  if (socioContratanteApellido.value !== "") {
    mostrarSugerencias(sugerenciasFiltradas);
  } else {
    listaSugerencias.style.display = "none";
  }
});
socioContratanteNombre.addEventListener("input", function () {
  socioContratanteApellido.value = "";
  socioContratanteCedula.value = "";
  var textoIngresado = socioContratanteNombre.value;
  var sugerenciasFiltradas = sugerencias.filter(function (sugerencia) {
    return (
      sugerencia.primerNombre.startsWith(textoIngresado),
      sugerencia.segundoNombre.startsWith(textoIngresado)
    );
  });
  if (socioContratanteNombre.value !== "") {
    mostrarSugerencias(sugerenciasFiltradas);
  } else {
    listaSugerencias.style.display = "none";
  }
});

function mostrarSugerencias(sugerencias) {
  listaSugerencias.innerHTML = "";
  listaSugerencias.style.display = "block";
  sugerencias.forEach(function (sugerencia) {
    var li = document.createElement("li");

    li.textContent =
      sugerencia.cedulaPasaporte +
      " (" +
      sugerencia.primerNombre +
      " " +
      sugerencia.segundoNombre +
      " " +
      sugerencia.primerApellido +
      " " +
      sugerencia.segundoApellido +
      ")";
    li.addEventListener("click", function () {
      socioContratanteCedula.value = sugerencia.cedulaPasaporte;
      obtenerDatosSocioContratante(sugerencia.cedulaPasaporte);
      listaSugerencias.innerHTML = "";
    });

    li.style.padding = "1px";
    li.style.cursor = "pointer";
    li.style.listStyle = "none";
    listaSugerencias.appendChild(li);
  });
}
// ----------------------------------------------------------------
// Obtener las sugerencias desde la base de datos al cargar la página
// ----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  obtenerSugerencias()
    .then(function () {
      console.log("Sugerencias obtenidas:", sugerencias);
    })
    .catch(function (error) {
      console.error("Error al obtener las sugerencias:", error);
    });
});
const obtenerDatosSocioContratante = async (cedula) => {
  console.log("Se llamo a la carga de datos del contratante", cedula);
  const socioContratante = await ipcRenderer.invoke(
    "getContratanteByCedula",
    cedula
  );
  socioContratanteCedula.value = cedula;
  socioContratanteNombre.value =
    socioContratante.primerNombre + " " + socioContratante.segundoNombre;
  socioContratanteApellido.value =
    socioContratante.primerApellido + " " + socioContratante.segundoApellido;
  socioContratanteId = socioContratante.id;
  console.log(socioContratante);
  verificarContratosAnteriores(cedula);
};
// ----------------------------------------------------------------
// funcion que notifica si el usuario presenta contratos anteriores
// ----------------------------------------------------------------
const verificarContratosAnteriores = async (cedula) => {
  console.log("Se llamo a la verificacion de contratos", cedula);
  const contratos = await ipcRenderer.invoke(
    "getContratosAnterioresByCedula",
    cedula
  );
  console.log(contratos);
  renderContratosSimilares(contratos);
};
ipcRenderer.on("showAlertMedidoresExistentes", (event, message) => {
  Swal.fire({
    title: "Contratos anteriores",
    text: message,
    icon: "info", // Puedes usar 'success', 'error', 'warning', 'info', etc.
  });
  //alert(message);
  // window.showErrorBox("Título", "Contenido del mensaje");
});
// ----------------------------------------------------------------
// Habilitar o desabilitar el formulario del
//medidor en funcion de si el socio solicita el servicio de agua potable
// ----------------------------------------------------------------
function habilitarFormMedidor() {
  console.log("Habilitando form medidor");
  fechaInstalacion.disabled = false;
  fechaInstalacion.readOnly = false;
  medidorMarca.disabled = false;

  // (medidorNumeroCasa.disabled = false), (medidorBarrio.disabled = false);
  // medidorPrincipal.disabled = false;
  // medidorSecundaria.disabled = false;
  // medidorReferencia.disabled = false;
  medidorObservacion.disabled = false;
}
function inHabilitarFormMedidor() {
  fechaInstalacion.disabled = true;
  medidorMarca.disabled = true;

  // (medidorNumeroCasa.disabled = true), (medidorBarrio.disabled = true);
  // medidorPrincipal.disabled = true;
  // medidorSecundaria.disabled = true;
  // medidorReferencia.disabled = true;
  medidorObservacion.disabled = true;
}
// async function generarCodigo() {

//   const sectores =await ipcRenderer.invoke("getSectores");
//   Swal.fire({
//     title: "Código de contrato.",
//     html: `
//         <label for="opciones">Barrio:</label>
//         <select id="sectorNombre" class="form-select">
//         </select>
//         <br>
//         <label for="texto">Numero de contrato:</label>
//         <input type="text" id="numeroContrato" class="form-control" ">
//     `,

//     confirmButtonText: "Aceptar",
//     confirmButtonColor: " #f8c471",
//     showCancelButton: true,
//     cancelButtonText: "Cancelar",
//     preConfirm: () => {
//       const sectorNombre = document.getElementById("sectorNombre").value;
//       const numeroContrato = document.getElementById("numeroContrato").value;

//       return { sector: sectorNombre, numero: numeroContrato };
//     },
//   }).then((result) => {
//     if (result.isConfirmed) {
//       // Aquí puedes usar result.value.opcion y result.value.texto
//       const sector = result.value.sector;
//       const numero = result.value.numero;

//       // Realiza acciones con los valores obtenidos
//       console.log("Código del contrato:", sector + numero);
//       contratoCodigo.value = sector + numero;
//       // console.log("Texto ingresado:", texto);
//     }
//   });
// }
async function generarCodigo() {
  let codigoGenerado = "error";
  let barrio = "No seleccionado";
  const sectores = await ipcRenderer.invoke("getSectores");
  const selectElement = document.createElement("select");
  selectElement.id = "sectorNombre";
  selectElement.classList.add("form-select");
  // Itera sobre la lista de sectores y agrega opciones al select
  const numeroContrato = document.createElement("input");
  numeroContrato.type = "text";
  numeroContrato.id = "numeroContrato";
  numeroContrato.classList.add("form-control");
  numeroContrato.readOnly = true;
  sectores.forEach((sector) => {
    const optionElement = document.createElement("option");
    optionElement.value = sector.id; // Valor de la opción
    optionElement.setAttribute("data-values", [
      sector.abreviatura + sector.codigo + sector.numeroSocios,
    ]);
    optionElement.setAttribute("numeroSocios", sector.numeroSocios);
    optionElement.setAttribute("barrio", sector.barrio);
    optionElement.textContent =
      sector.barrio + " (" + sector.abreviatura + sector.codigo + ")"; // Texto visible de la opción

    selectElement.appendChild(optionElement);
  });

  Swal.fire({
    title: "Código de contrato.",
    width: 600,

    html: `
      <label for="opciones">Barrio:</label>
      ${selectElement.outerHTML} <!-- Inserta el select aquí -->
      <br>
      <label for="texto">Numero de contrato:</label>
      <p id="mensaje-codigo-error" class="fs-6 my-1 mx-1
       d-flex justify-content-center align-items-baseline" 
       style="color:#21618C; "><i class=" mx-2 fa-solid fa-circle-info" style="color:#21618C; ">
       </i>Selecciona un sector para generar un código.</p>

      ${numeroContrato.outerHTML}
  
        
     
   
    `,
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#85C1E9",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    cancelButtonColor: " #D98880",
    preConfirm: () => {
      // const sectorNombre = document.getElementById("sectorNombre").value;
      num = document.getElementById("numeroContrato").value;
      return { codigo: num, barrio: barrio };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const codigo = result.value.codigo;
      console.log("Código del contrato:", codigo);
      contratoCodigo.value = codigo;
      medidorBarrio.value = result.value.barrio;
    }
  });
  // Obtén el select por su id
  const select = document.getElementById("sectorNombre");
  const codigoInput = document.getElementById("numeroContrato");
  select.onchange = () => {
    numero = 1;
    const selectedOption = select.options[select.selectedIndex];
    const atributoValor = selectedOption.getAttribute("data-values");
    const numeroSocios = selectedOption.getAttribute("numeroSocios");

    if (numeroSocios != "0") {
      numero = parseInt(numeroSocios) + 1;
    }
    // if (atributoValor[2] != "0") {
    //   numero = parseInt(atributoValor[2]) + 1;
    // }
    const numeroConRelleno = numero.toString().padStart(4, "0");
    codigoGenerado = atributoValor[1] + atributoValor[0] + numeroConRelleno;
    sectorId = select.value;
    barrio = selectedOption.getAttribute("barrio");
    console.log(
      "Valor del atributo seleccionado:",
      atributoValor[0],
      atributoValor[1],
      numeroSocios,
      barrio,
      sectorId
    );
    codigoInput.value = codigoGenerado;
  };
}

// ----------------------------------------------------------------
// La fecha de contrato siempre este en la fecha actual.
// ----------------------------------------------------------------

contratoFecha.value = formatearFecha(new Date());

// ----------------------------------------------------------------
// Cambiar de texto si el checkbox es 'Check' y viceversa.
// ----------------------------------------------------------------
contratoEstado.onchange = () => {
  if (contratoEstado.checked) {
    labelEstadoContrato.textContent = "Activo";
  } else {
    labelEstadoContrato.textContent = "Innactivo";
  }
};
medidorSinMedidor.onchange = () => {
  if (medidorSinMedidor.value == "medidor") {
    conMedidor.classList.remove("innactive-list");
    conMedidor.classList.add("active-list");
    sinMedidor.classList.remove("active-list");
    sinMedidor.classList.add("innactive-list");
    titleContratos.innerHTML =
      "Contratos con medidor" +
      '<i class="fs-1 fa-solid fa-file-signature mx-2 my-2"></i>';
  } else {
    sinMedidor.classList.remove("innactive-list");
    sinMedidor.classList.add("active-list");
    conMedidor.classList.remove("active-list");
    conMedidor.classList.add("innactive-list");
    titleContratos.innerHTML =
      "Contratos sin medidor" +
      '<i class="fs-1 fa-solid fa-file-signature mx-2 my-2"></i>';
  }
};
ipcRenderer.on("contrato-desde-socios", async (event, socioId, socioCedula) => {
  console.log("Socio id recibido: " + socioId, socioCedula);
  obtenerDatosSocioContratante(socioCedula);
});
ipcRenderer.on("Notificar", (event, response) => {
  if (response.title === "Borrado!") {
    resetForm();
  } else if (response.title === "Actualizado!") {
    resetFormAfterUpdate();
  } else if (response.title === "Guardado!") {
    resetFormAfterSave();
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
async function resetFormAfterUpdate() {
  // let criterioBuscar = criterio.value;
  // let criterioContentBuscar = criterioContent.value;
  // console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  // console;
  await getContratos();
  await getContratosSinMedidor();
  mensajeError.textContent = "";
  errorContainer.style.color = "white";
}
async function resetFormAfterSave() {
  // let criterioBuscar = criterio.value;
  // let criterioContentBuscar = criterioContent.value;
  // console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  // console;
  await getContratos();
  await getContratosSinMedidor();
  // editingStatus = false;
  // editContratoId = "";
  // contratoForm.reset();
  mensajeError.textContent = "";
  errorContainer.style.color = "white";
  // fechaCreacion.value = formatearFecha(new Date());
}
function resetForm() {
  serviciosCompartidos.disabled = true;
  editingStatus = false;
  editContratoId = "";
  editSocioId = "";
  contratoForm.reset();
  mensajeError.textContent = "";
  inHabilitarFormMedidor();
  ocultarServiciosDisponibles();
  habilitarNuevoContrato();
  errorContainer.style.color = "white";
  contratoFecha.value = formatearFecha(new Date());
}
function habilitarNuevoContrato() {
  serviciosCompartidos.disabled = true;
  socioContratanteCedula.readOnly = false;
  socioContratanteApellido.readOnly = false;
  socioContratanteNombre.readOnly = false;
  generarCodigoBt.disabled = false;
  contratoFecha.readOnly = false;
  listaSugerencias.style.display = "none";
}
function ocultarServiciosDisponibles() {
  servicosDisponiblesList.innerHTML = "";
  const divNoServiciosContainer = document.createElement("div");
  divNoServiciosContainer.className =
    "col-12 text-center d-flex justify-content-center align-items-center";
  const divNoServiciosText = document.createElement("div");
  const noServiciosTitle = document.createElement("h3");
  noServiciosTitle.className = "text-secondary";
  noServiciosTitle.textContent =
    "Registra el contrato para " + "poder acceder a los servicios disponibles";
  const noServiciosText = document.createElement("p");
  noServiciosText.innerHTML =
    '<i class="text-secondary fs-1 fa-solid fa-gears"></i>';
  divNoServiciosText.appendChild(noServiciosTitle);
  divNoServiciosText.appendChild(noServiciosText);
  divNoServiciosContainer.appendChild(divNoServiciosText);
  servicosDisponiblesList.appendChild(divNoServiciosContainer);
}
generarCodigoBt.onclick = () => {
  generarCodigo();
};
cancelarContrato.onclick = () => {
  resetForm();
};
// ----------------------------------------------------------------
// Transicion entre las secciones de la vista
// ----------------------------------------------------------------
var btnSeccion1 = document.getElementById("btnSeccion1");
var btnSeccion2 = document.getElementById("btnSeccion2");
var seccion1 = document.getElementById("seccion1");
var seccion2 = document.getElementById("seccion2");

btnSeccion1.addEventListener("click", function () {
  console.log("btn1");
  seccion2.classList.remove("active");
  seccion1.classList.add("active");
  resetForm();
});

btnSeccion2.addEventListener("click", function () {
  console.log("btn2");
  seccion1.classList.remove("active");
  seccion2.classList.add("active");
});
// ----------------------------------------------------------------
// funciones de trancision entre interfaces
// ----------------------------------------------------------------
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
