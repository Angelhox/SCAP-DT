// ----------------------------------------------------------------
// Librerias
// ----------------------------------------------------------------
const { ipcRenderer } = require("electron");
const validator = require("validator");
const Swal = require("sweetalert2");
const Chart = require("chart.js/auto");
// ----------------------------------------------------------------
// Obtén el contexto del lienzo del gráfico
const ctx = document.getElementById("graficoDeBarras").getContext("2d");
// ----------------------------------------------------------------
// Elementos de las busquedas
// ----------------------------------------------------------------
const buscarServicios = document.getElementById("buscarServicios");
const serviciosList = document.getElementById("servicios");
const criterio = document.getElementById("criterio");
const criterioContent = document.getElementById("criterio-content");
const mesBusqueda = document.getElementById("mesBusqueda");
const anioBusqueda = document.getElementById("anioBusqueda");
// ----------------------------------------------------------------
// Elementos de los totales
// ----------------------------------------------------------------
const recaudadoGeneral = document.getElementById("total-recaudado");
const pendienteGeneral = document.getElementById("total-pendiente");
const recaudarGeneral = document.getElementById("total-recaudar");
// ----------------------------------------------------------------
// Variables
// ----------------------------------------------------------------
let cuotasAgrupadas = [];
const data = {
  labels: ["Categoría 1", "Categoría 2", "Categoría 3", "Categoría 4"],
  datasets: [
    {
      label: "Ejemplo de Gráfico de Barras",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
      data: [50, 30, 70, 45], // Datos de ejemplo
    },
  ],
};

// Configuración del gráfico
const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// Crea el gráfico de barras
const myBarChart = new Chart(ctx, {
  type: "bar",
  data: data,
  options: options,
});

function crearBarras(cuotasAgrupadas) {
  cuotasAgrupadas.forEach((cuota) => {
    let intervalo = 100;
    let progress = 0;
    let inicio = 0;
    let progreso = cuota.abono;
    let objetivo = cuota.total;
    let idBarra = cuota.serviciosId;
    const barraDeProgreso = document.getElementById(idBarra);
    const porcentaje = Math.min(
      ((progreso - inicio) / (objetivo - inicio)) * 100,
      100
    );

    const intervalId = setInterval(() => {
      if (progress < porcentaje) {
        progress += 1; // Ajusta el incremento según sea necesario

        barraDeProgreso.style.width = progress + "%";
      } else {
        clearInterval(intervalId);
      }
    }, intervalo);
    const progresoText = document.createElement("p");
    progresoText.className = "mp-0";
    progresoText.textContent = aproximarDosDecimales(porcentaje) + "%";
    // barraDeProgreso.innerHTML = "";
    barraDeProgreso.append(progresoText);
  });
}

// Inicia el intervalo
function actualizarBarraDeProgreso(inicio, objetivo, progreso, idBarra) {
  const barraDeProgreso = document.getElementById(idBarra);
  const porcentaje = Math.min(
    ((progreso - inicio) / (objetivo - inicio)) * 100,
    100
  );
  if (progress < porcentaje) {
    progress += 1;
    barraDeProgreso.style.width = progress + "%";
  } else {
    clearInterval(intervalId); // Detén el intervalo cuando se alcanza el objetivo
  }
  const progresoText = document.createElement("p");
  progresoText.className = "mp-0";
  progresoText.textContent = aproximarDosDecimales(porcentaje) + "%";
  // barraDeProgreso.innerHTML = "";
  barraDeProgreso.append(progresoText);
}

// Valores de ejemplo: inicio, objetivo y progreso actual
// Llamada inicial para configurar la barra de progreso con el progreso actual
// actualizarBarraDeProgreso(inicio, objetivo, progreso);
// Ejemplo: Actualizar la barra de progreso cada segundo
// setInterval(() => {
//   progresos += 10; // Aumentar el progreso en un 10% cada segundo (puedes ajustar esto)
//   actualizarBarraDeProgreso(inicio, objetivo, progreso);

//   // Ejemplo: Detener la barra de progreso al alcanzar o superar el objetivo
//   if (progresos >= progreso) {
//     clearInterval(); // Detener el intervalo
//   }
// }, 1000); // Cada segundo
const getServicios = async () => {
  criterioBuscar = criterio.value;
  criterioContentBuscar = criterioContent.value;
  let mesEnviar = mesBusqueda.value;
  let anioEnviar = anioBusqueda.value;
  cuotas = await ipcRenderer.invoke(
    "getRecaudacionesCuotas",
    criterioBuscar,
    criterioContentBuscar,
    mesEnviar,
    anioEnviar
  );
  console.log(cuotas);
  cuotasAgrupadas = await agruparServicios(cuotas).then(
    async (cuotasAgrupadas) => {
      await renderCuotas(cuotasAgrupadas);
      crearBarras(cuotasAgrupadas);
      cargarRecaudados(cuotasAgrupadas);
    }
  );
  // renderCuotas(cuotas);
};
async function cargarRecaudados(cuotas) {
  let recaudadoTotal = 0;
  let totalPendiente = 0;
  let recaudarTotal = 0;
  cuotas.forEach((cuota) => {
    recaudadoTotal += cuota.abono;
    recaudarTotal += cuota.total;
  });
  totalPendiente = recaudarTotal - recaudadoTotal;
  recaudarGeneral.textContent = parseFloat(recaudarTotal).toFixed(2);
  recaudadoGeneral.textContent = parseFloat(recaudadoTotal).toFixed(2);
  pendienteGeneral.textContent = parseFloat(totalPendiente).toFixed(2);
}
const agruparServiciosContrato = async (datosServiciosGeneral) => {
  console.log("Grupos sin suma:", datosServiciosGeneral);

  let datosServiciosAgrupados = await datosServiciosGeneral.reduce(
    (acumulador, objeto) => {
      // Verificar si ya hay un grupo con el mismo nombre
      let grupoExistente = acumulador.find(
        (contratosId) => contratosId.contratosId === objeto.contratosId
      );
      // Si el grupo existe, agregar el valor al grupo
      if (grupoExistente) {
        if (objeto.estadoDetalles === "Cancelado") {
          grupoExistente.abono += objeto.abono;
        }
        // grupoExistente.total += objeto.total;
        // El saldo lo obtenemos restando abonos - total
        // grupoExistente.saldo += objeto.saldo;
        grupoExistente.objetos.push(objeto);
      } else {
        let abono = 0;

        if (objeto.estadoDetalles === "Cancelado") {
          abono = objeto.abono;
        }
        // Si el grupo no existe, crear uno nuevo con el valor
        acumulador.push({
          nombre: objeto.nombre,
          descripcionServicio: objeto.descripcionServicio,
          serviciosId: objeto.serviciosId,
          tipo: objeto.tipo,
          fechaCreacion: objeto.fechaCreacion,
          abono: abono,
          // saldo: objeto.saldo,
          total: objeto.total,
          objetos: [objeto],
        });
      }

      return acumulador;
    },
    []
  );
  return datosServiciosAgrupados;
};
const agruparServicios = async (datosServiciosGeneral) => {
  console.log("Grupos sin suma:", datosServiciosGeneral);

  let datosServiciosAgrupados = await datosServiciosGeneral.reduce(
    (acumulador, objeto) => {
      // Verificar si ya hay un grupo con el mismo nombre
      let grupoExistente = acumulador.find(
        (serviciosId) => serviciosId.serviciosId === objeto.serviciosId
      );
      // Si el grupo existe, agregar el valor al grupo
      if (grupoExistente) {
        if (objeto.estadoDetalles === "Cancelado") {
          grupoExistente.abono += objeto.abono;
        }
        // grupoExistente.total += objeto.total;
        // El saldo lo obtenemos restando abonos - total
        // grupoExistente.saldo += objeto.saldo;
        grupoExistente.objetos.push(objeto);
        const totalSumado = grupoExistente.contratosIds.some(
          (contratoId) => contratoId === objeto.contratosId
        );
        if (!totalSumado) {
          grupoExistente.contratosIds.push(objeto.contratosId);
          grupoExistente.total += objeto.total;
        }
      } else {
        let abono = 0;

        if (objeto.estadoDetalles === "Cancelado") {
          abono = objeto.abono;
        }
        // Si el grupo no existe, crear uno nuevo con el valor
        acumulador.push({
          nombre: objeto.nombre,
          descripcionServicio: objeto.descripcionServicio,
          serviciosId: objeto.serviciosId,
          tipo: objeto.tipo,
          fechaCreacion: objeto.fechaCreacion,
          abono: abono,
          // saldo: objeto.saldo,
          total: objeto.total,
          objetos: [objeto],
          contratosIds: [objeto.contratosId],
        });
      }

      return acumulador;
    },
    []
  );
  console.log("Agrupados: ", datosServiciosAgrupados);
  return datosServiciosAgrupados;
};
function renderCuotas(cuotas) {
  serviciosList.innerHTML = "";
  cuotas.forEach((cuota) => {
    const divContainer = document.createElement("div");
    divContainer.className = "col-xl-12 col-lg-12 col-md-12 col-sm-12 mb-1";
    divContainer.style.height = "fit-content";
    divContainer.style.maxHeight = "fit-content";
    const divCol6 = document.createElement("div");
    divCol6.className = "clase col-6 card card-servicios";
    divCol6.style.width = "100%";
    divCol6.style.maxWidth = "100%";
    divCol6.style.padding = "0.3em";
    divCol6.style.backgroundColor = "#d6eaf8";
    divCol6.style.height = "fit-content";
    divCol6.style.maxHeight = "fit-content";

    const divRowG0 = document.createElement("div");
    divRowG0.className = "row g-0 px-2";
    divRowG0.style.backgroundColor = "white";

    const divCol2 = document.createElement("div");
    divCol2.className =
      "col-2 d-flex justify-content-center align-items-center container-img";

    const imgServicios = document.createElement("img");
    imgServicios.src = "../assets/fonts/servicioIcon64x64.png";
    imgServicios.className = "img-fluid rounded-start img-servicios";
    imgServicios.alt = "not found";

    divCol2.appendChild(imgServicios);

    const divCol9 = document.createElement("div");
    divCol9.className = "col-9 d-flex justify-content-center align-items-start";

    const divCardBody = document.createElement("div");
    divCardBody.className = "card-body";

    const divContainerTitle = document.createElement("div");
    divContainerTitle.className = "row container-title";

    const h6CardTitle = document.createElement("h6");
    h6CardTitle.className = "card-title mp-0";
    h6CardTitle.textContent = cuota.nombre;

    divContainerTitle.appendChild(h6CardTitle);

    const divContainerDescripcion = document.createElement("div");
    divContainerDescripcion.className =
      "row container-descripcion d-flex align-items-start mp-0";

    const pDescription = document.createElement("p");
    pDescription.textContent = cuota.descripcionServicio;

    divContainerDescripcion.appendChild(pDescription);
    const divContainerBarra = document.createElement("div");
    divContainerBarra.className =
      "row barraDeProgresoContainer mp-0 d-flex align-items-start rounded-5";
    // divContainerBarra.innerHTML = crearBarra(0, cuota.total, cuota.abono);
    const barraProgreso = document.createElement("div");
    barraProgreso.className = "mp-0 barraDeProgreso";
    barraProgreso.setAttribute("id", cuota.serviciosId);
    // barraProgreso.innerHTML = crearBarra();
    divContainerBarra.appendChild(barraProgreso);
    // actualizarBarraDeProgreso(inicio, objetivo, progreso);

    // crearBarra(0, cuota.total, cuota.abono, cuota.serviciosId);

    const divContainerDetalles = document.createElement("div");
    divContainerDetalles.className = "row container-detalles";

    const detalles = [
      { label: "Total:$", value: parseFloat(cuota.total).toFixed(2) },
      { label: "Recaudado:", value: parseFloat(cuota.abono).toFixed(2) },
      { label: "Pendiente:", value: valorPendiente(cuota.total, cuota.abono) },
    ];

    detalles.forEach((detalle) => {
      const divDetalle = document.createElement("div");
      divDetalle.className = "d-flex align-items-baseline col-4 mp-0";
      const esp = document.createElement("p");
      esp.textContent = "-";
      esp.className = "trans";
      const h6Label = document.createElement("h6");
      h6Label.textContent = detalle.label;

      const pValue = document.createElement("p");
      pValue.textContent = detalle.value;

      divDetalle.appendChild(h6Label);
      divDetalle.appendChild(esp);
      divDetalle.appendChild(pValue);
      divContainerDetalles.appendChild(divDetalle);
    });

    divCardBody.appendChild(divContainerTitle);
    divCardBody.appendChild(divContainerDescripcion);
    divCardBody.appendChild(divContainerBarra);
    divCardBody.appendChild(divContainerDetalles);
    divCol9.appendChild(divCardBody);

    const divCol1 = document.createElement("div");
    divCol1.className = "col-1 d-flex flex-column justify-content-center";

    // const buttons = ["fa-file-pen", "fa-trash", "fa-chart-simple"];
    const btnEditServicio = document.createElement("button");
    btnEditServicio.className =
      "btn-servicios-custom d-flex justify-content-center align-items-center px-5";
    const iconEdit = document.createElement("i");
    iconEdit.className = "fa fa-file-pen";
    btnEditServicio.appendChild(iconEdit);

    const btnDeleteServicio = document.createElement("button");
    btnDeleteServicio.className =
      "btn-servicios-custom d-flex justify-content-center align-items-center";
    const iconDelete = document.createElement("i");
    iconDelete.className = "fa fa-trash";
    btnDeleteServicio.appendChild(iconDelete);
    btnDeleteServicio.onclick = () => {
      console.log("Eliminar ...");
    };
    const btnEstadistics = document.createElement("button");
    btnEstadistics.className =
      "btn-servicios-custom d-flex justify-content-center align-items-center my-3 ";
    const iconStadistics = document.createElement("i");
    iconStadistics.className = "fa fa-chart-simple";
    btnEstadistics.appendChild(iconStadistics);
    btnEstadistics.onclick = () => {
      console.log("Estadisticas del servicio: " + cuota.id);
      mostrarEstadisticas(cuota.id);
      mostrarSeccion("seccion2");
    };
    // divCol1.appendChild(btnEditServicio);
    // btnEditServicio.onclick = () => {
    //   console.log("Detalles del servicio: " + cuota.id);
    //   editServicio(cuota.id);
    // };
    // btnDeleteServicio.onclick = () => {
    //   console.log("Eliminar servicio: " + cuota.id);
    //   deleteServicio(cuota.id, cuota.nombre);
    // };
    // divCol1.appendChild(btnDeleteServicio);
    divCol1.appendChild(btnEstadistics);

    divRowG0.appendChild(divCol2);
    divRowG0.appendChild(divCol9);
    divRowG0.appendChild(divCol1);

    divCol6.appendChild(divRowG0);
    divContainer.appendChild(divCol6);
    divContainer.onclick = () => {
      // Elimina la clase "selected" de todos los elementos
      const elementos = document.querySelectorAll(".clase"); // Reemplaza con la clase real de tus elementos
      elementos.forEach((elemento) => {
        elemento.classList.remove("bg-secondary");
      });

      // Agrega la clase "selected" al elemento que se hizo clic
      divCol6.classList.add("bg-secondary");
      console.log("Detalles del servicio: " + cuota.id);
      editServicio(cuota.id);
    };
    serviciosList.appendChild(divContainer);
  });
}
function valorPendiente(total = 0, abono = 0) {
  return parseFloat(total - abono).toFixed(2);
}
function init() {
  getServicios();
}
init();
// funciones del navbar
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
function aproximarDosDecimales(numero) {
  // Redondea el número hacia arriba
  const numeroRedondeado = Math.ceil(numero * 100) / 100;
  return numeroRedondeado.toFixed(2);
}
