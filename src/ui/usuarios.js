const { ipcRenderer } = require("electron");
const validator = require("validator");
const Swal = require("sweetalert2");
const mensajeError = document.getElementById("mensajeError");
const usuarioPrimerNombre = document.getElementById("primernombre");
const usuarioSegundoNombre = document.getElementById("segundonombre");
const usuarioPrimerApellido = document.getElementById("primerapellido");
const usuarioSegundoApellido = document.getElementById("segundoapellido");
const usuarioCedula = document.getElementById("cedula");
const usuarioCargo = document.getElementById("cargo");
const usuarioDescripcionCargo = document.getElementById("descripcioncargo");
const usuarioTelefono = document.getElementById("telefono");
const usuarioCorreo = document.getElementById("correo");
const usuarioUsuario = document.getElementById("usuario");
const usuarioClave = document.getElementById("clave");
const usuarioModificacion = document.getElementById("fechamodificacion");
const usuarioAcceso = document.getElementById("accesos");
const usuarioDescripcionAcceso = document.getElementById("descripcionacceso");
const usuariosList = document.getElementById("usuarios");
const empleadosList = document.getElementById("empleados");
const usuarioaccesosn = document.getElementById("accesosn");
const usuarioDarBaja = document.getElementById("bajausuario");
const buscarUsuarios = document.getElementById("buscarUsuarios");
const criterio = document.getElementById("criterio");
const criterioContent = document.getElementById("criterio-content");
let usuarios = [];
let empleados = [];
let editingStatus = false;
let editUsuarioId = "";
let usuarioProceso = "";
usuarioForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  var segundoNombreUsuariodf = "NA";
  var segundoApellidoUsuariodf = "NA";
  if (
    usuarioSegundoNombre.value !== null &&
    usuarioSegundoNombre.value !== ""
  ) {
    segundoNombreUsuariodf = usuarioSegundoNombre.value;
  }
  if (
    usuarioSegundoApellido.value !== null &&
    usuarioSegundoApellido.value !== ""
  ) {
    segundoApellidoUsuariodf = usuarioSegundoApellido.value;
  }

  if (validator.isEmpty(usuarioPrimerNombre.value)) {
    mensajeError.textContent = "El primer nombre es obligatorio.";
    usuarioPrimerNombre.focus();
  } else if (validator.isEmpty(usuarioPrimerApellido.value)) {
    mensajeError.textContent = "El primer apellido es obligatorio.";
    usuarioPrimerApellido.focus();
  } else if (
    validator.isEmpty(usuarioCedula.value) ||
    !validator.isLength(usuarioCedula.value, { max: 10, min: 10 })
  ) {
    mensajeError.textContent = "Ingresa un número de cédula válido.";

    usuarioCedula.focus();
  } else if (usuarioCargo.value === "0") {
    mensajeError.textContent = "Selecciona un cargo válido.";
    usuarioCargo.focus();
  } else if (
    validator.isEmpty(usuarioDescripcionCargo.value) ||
    usuarioDescripcionCargo.value === "Seleccione un cargo" ||
    !validator.isLength(usuarioDescripcionCargo.value, { max: 45 })
  ) {
    mensajeError.textContent = "Ingresa una descripción válida.";
    usuarioDescripcionCargo.focus();
  } else if (
    validator.isEmpty(usuarioTelefono.value) ||
    !validator.isLength(usuarioTelefono.value, { min: 10, max: 10 })
  ) {
    mensajeError.textContent = "Ingresa un número de télefono válido.";
    usuarioTelefono.focus();
  } else if (
    validator.isEmpty(usuarioCorreo.value) ||
    !validator.isEmail(usuarioCorreo.value)
  ) {
    mensajeError.textContent = "Ingresa un correo electrónico válido.";
    usuarioCorreo.focus();
  } else {
    if (
      usuarioaccesosn.checked &&
      usuarioUsuario !== null &&
      usuarioUsuario !== " " &&
      usuarioClave !== null &&
      usuarioClave !== " " &&
      usuarioAcceso !== null &&
      usuarioAcceso !== " " &&
      usuarioDescripcionAcceso !== null &&
      usuarioDescripcionAcceso !== " "
    ) {
      if (
        validator.isEmpty(usuarioUsuario.value) ||
        !validator.isLength(usuarioUsuario.value, { min: 10, max: 20 })
      ) {
        mensajeError.textContent =
          "Ingresa un nombre de usuario de 10 a 20 caracteres.";
        usuarioUsuario.focus();
      } else if (validator.isEmpty(usuarioClave.value)) {
        mensajeError.textContent = "La Contraseña es es obligatoria.";
        usuarioClave.focus();
      } else if (!validator.isLength(usuarioClave.value, { min: 10 })) {
        mensajeError.textContent =
          "La contraseña debe tener un mínimo de 10 caracteres";
        usuarioClave.focus();
      } else if (!validator.isLength(usuarioClave.value, { max: 20 })) {
        mensajeError.textContent =
          "La contraseña debe tener un máximo de 20 caracteres";
        usuarioClave.focus();
      } else if (usuarioAcceso.value === "0") {
        mensajeError.textContent = "Selecciona un nivel de acceso válido.";
        usuarioAcceso.focus();
      } else if (
        validator.isEmpty(usuarioDescripcionAcceso.value) ||
        usuarioDescripcionAcceso.value === "Seleccione un cargo" ||
        !validator.isLength(usuarioDescripcionAcceso.value, { max: 45 })
      ) {
        mensajeError.textContent = "Ingresa una descripción de acceso válida.";
        usuarioDescripcionAcceso.focus();
      } else {
        const newEmpleado = {
          primerNombre: usuarioPrimerNombre.value,
          segundoNombre: segundoNombreUsuariodf,
          primerApellido: usuarioPrimerApellido.value,
          segundoApellido: segundoApellidoUsuariodf,
          cedula: usuarioCedula.value,
          telefono: usuarioTelefono.value,
          correo: usuarioCorreo.value,
          usuariosn: "Si",
          cargosId: usuarioCargo.value,
        };
        // const newCargo = {
        //   cargo: usuarioCargo.value,
        //   cargoDescripcion: usuarioDescripcionCargo.value,
        // };
        const newUsuario = {
          usuario: usuarioUsuario.value,
          clave: usuarioClave.value,
          rolesId: usuarioAcceso.value,
          fechaModificacion: usuarioModificacion.value,
        };
        if (!editingStatus) {
          const result = await ipcRenderer.invoke(
            "createUsuario",
            newEmpleado,
            // newCargo,
            newUsuario
          );
          console.log(result);
        } else {
          Swal.fire({
            title: "¿Quieres guardar los cambios?",
            text: "No podrás deshacer esta acción.",
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
              console.log("Editing usuario with electron");
              const result = await ipcRenderer.invoke(
                "updateUsuario",
                editUsuarioId,
                newEmpleado,
                newUsuario
                // newCargo
              );
              editingStatus = false;
              editUsuarioId = "";
              console.log(result);
            }
          });
        }
      }
    } else {
      console.log("Creando un empleado");
      //En caso de no haber seleccionado crear usuario no agregamos datos en la tabla usuario
      const newEmpleado = {
        primerNombre: usuarioPrimerNombre.value,
        segundoNombre: segundoNombreUsuariodf,
        primerApellido: usuarioPrimerApellido.value,
        segundoApellido: segundoApellidoUsuariodf,
        cedula: usuarioCedula.value,
        telefono: usuarioTelefono.value,
        correo: usuarioCorreo.value,
        usuariosn: "No",
        cargosId: usuarioCargo.value,
      };
      // Remplazamos esta parte del codigo para tener los
      // cargos de los empleados creados previamente en una
      // tabla aparte
      // const newCargo = {
      //   cargo: usuarioCargo.value,
      //   cargoDescripcion: usuarioDescripcionCargo.value,
      // };

      if (!editingStatus) {
        const result = await ipcRenderer.invoke(
          "createEmpleado",
          newEmpleado
          // newCargo
        );
        console.log(result);
      } else {
        console.log("Editing empleado with electron");
        Swal.fire({
          title: "¿Quieres guardar los cambios?",
          text: "No podrás deshacer esta acción.",
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
            const result = await ipcRenderer.invoke(
              "updateEmpleado",
              editUsuarioId,
              newEmpleado
              // newCargo
            );
            editingStatus = false;
            editUsuarioId = "";
            console.log(result);
          }
        });
      }
    }
  }
});
// ----------------------------------------------------------------
// Renderizamos los usuarios del sistema
// ----------------------------------------------------------------
function renderUsuarios(usuarios) {
  usuariosList.innerHTML = "";
  usuarios.forEach((usuario) => {
    usuariosList.innerHTML += `
       <tr>
       
      <td>${usuario.primerNombre + " " + usuario.segundoNombre}</td>
      <td>${usuario.primerApellido + " " + usuario.segundoApellido}</td>
      <td>${usuario.cedula}</td>
      <td>${usuario.telefono}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.cargo}</td>
      <td>${usuario.rol}</td>
      <td>${usuario.usuario}</td>
   
 
     
      <td>
      <button onclick="editUsuario('${usuario.id}')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
// ----------------------------------------------------------------
// Renderizamos los empleados no usuarios del sistema
// ----------------------------------------------------------------
function renderEmpleados(empleados) {
  empleadosList.innerHTML = "";
  empleados.forEach((empleado) => {
    empleadosList.innerHTML += `
       <tr>    
      <td>${empleado.primerNombre + " " + empleado.segundoNombre}</td>
      <td>${empleado.primerApellido + " " + empleado.segundoApellido}</td>
      <td>${empleado.cedula}</td>
      <td>${empleado.telefono}</td>
      <td>${empleado.correo}</td>
      <td>${empleado.cargo}</td>
      <td>${empleado.cargoDescripcion}</td>
      <td>
      <button onclick="deleteEmpleado('${empleado.id}','${
      empleado.primerNombre + " " + empleado.primerApellido
    }')" class="btn "> 
      <i class="fa-solid fa-user-minus"></i>
      </button>
      </td>
      <td>
      <button onclick="editEmpleado('${empleado.id}','${
      empleado.primerNombre + " " + empleado.primerApellido
    }')" class="btn ">
      <i class="fa-solid fa-user-pen"></i>
      </button>
      </td>
   </tr>
      `;
  });
}
// ----------------------------------------------------------------
// Cargamos los datos del usuario a editar en los inputs
// ----------------------------------------------------------------
const editUsuario = async (id) => {
  resetForm();
  const usuario = await ipcRenderer.invoke("getUsuarioById", id);
  usuarioDarBaja.disabled = false;
  usuarioaccesosn.checked = true;
  usuarioUsuario.disabled = false;
  usuarioClave.disabled = false;
  usuarioDescripcionAcceso.disabled = false;
  usuarioAcceso.disabled = false;
  usuarioDescripcionAcceso.value = usuario[0].rolDescripcion;
  usuarioPrimerNombre.value = usuario[0].primerNombre;
  usuarioSegundoNombre.value = usuario[0].segundoNombre;
  usuarioPrimerApellido.value = usuario[0].primerApellido;
  usuarioSegundoApellido.value = usuario[0].segundoApellido;
  usuarioCedula.value = usuario[0].cedula;
  usuarioTelefono.value = usuario[0].telefono;
  usuarioCorreo.value = usuario[0].correo;
  usuarioUsuario.value = usuario[0].usuario;
  usuarioClave.value = usuario[0].clave;
  usuarioCargo.selectedIndex = usuario[0].cargosId;
  usuarioDescripcionCargo.value = usuario[0].cargoDescripcion;
  usuarioAcceso.selectedIndex = usuario[0].rolesId;
  usuarioDescripcionAcceso.value = usuario[0].rolDescripcion;
  usuarioModificacion.value = formatearFecha(usuario[0].fechaModificacion);
  usuarioProceso = usuario[0].primerNombre + " " + usuario[0].primerApellido;
  editingStatus = true;
  editUsuarioId = usuario[0].id;
  console.log(usuario[0]);
};
// ----------------------------------------------------------------
// Cargamos los datos del empleado a editar en los inputs
// ----------------------------------------------------------------
const editEmpleado = async (id) => {
  resetForm();
  const usuario = await ipcRenderer.invoke("getEmpleadoById", id);
  console.log("Id del cargo: ", usuario[0].cargosId);
  usuarioPrimerNombre.value = usuario[0].primerNombre;
  usuarioSegundoNombre.value = usuario[0].segundoNombre;
  usuarioPrimerApellido.value = usuario[0].primerApellido;
  usuarioSegundoApellido.value = usuario[0].segundoApellido;
  usuarioCedula.value = usuario[0].cedula;
  usuarioTelefono.value = usuario[0].telefono;
  usuarioCorreo.value = usuario[0].correo;
  usuarioCargo.selectedIndex = usuario[0].cargosId;
  usuarioDescripcionCargo.value = usuario[0].cargoDescripcion;
  editingStatus = true;
  editUsuarioId = usuario[0].id;
  console.log(usuario[0]);
};
// ----------------------------------------------------------------
// Eliminar un usuario del sistema
// ----------------------------------------------------------------
const deleteUsuario = async (id, usuarioNombre) => {
  console.log("Recibido: " + id, usuarioNombre);
  Swal.fire({
    title: "¿Quieres borrar el registro de " + usuarioNombre + " ?",
    text: "No podrás deshacer esta acción.",
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
      console.log("id from usuarios.js");
      const result = await ipcRenderer.invoke("deleteUsuario", id);
      console.log("Resultado usuarios.js", result);
    }
  });
};
// ----------------------------------------------------------------
// Dar baja un usuario del sistema
// ----------------------------------------------------------------
const bajaUsuario = async () => {
  if (editingStatus) {
    if (editUsuarioId !== null) {
      Swal.fire({
        title: "¿Quieres dar de baja el usuario de " + usuarioProceso + " ?",
        text: "No podrás deshacer esta acción.",
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
          console.log("id from usuarios.js");
          const result = await ipcRenderer.invoke(
            "deleteUsuario",
            editUsuarioId
          );
          console.log("Resultado usuarios.js", result);
        }
      });
    }
  }
};
// ----------------------------------------------------------------
// Eliminar un empleado del sistema
// ----------------------------------------------------------------
const deleteEmpleado = async (id, usuarioNombre) => {
  console.log("Recibido: " + id, usuarioNombre);
  Swal.fire({
    title: "¿Quieres borrar el registro de " + usuarioNombre + " ?",
    text: "No podrás deshacer esta acción.",
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
      console.log("id from usuarios.js");
      const result = await ipcRenderer.invoke("deleteEmpleado", id);
      console.log("Resultado usuarios.js", result);
    }
  });
};
// ----------------------------------------------------------------
// Obtenemos los usuarios del sistema
// ----------------------------------------------------------------
const getUsuarios = async (criterio, criterioContent) => {
  usuarios = await ipcRenderer.invoke("getUsuarios", criterio, criterioContent);
  console.log(usuarios);
  renderUsuarios(usuarios);
};
// ----------------------------------------------------------------
// Obtenemos los empleados no usuarios del sistema
// ----------------------------------------------------------------
const getEmpleados = async (criterio, criterioContent) => {
  empleados = await ipcRenderer.invoke(
    "getEmpleados",
    criterio,
    criterioContent
  );
  console.log(empleados);
  renderEmpleados(empleados);
};
// ----------------------------------------------------------------
// Obtenemos los cargos disponibles desde la base de datos
// ----------------------------------------------------------------
const getCargos = async () => {
  cargos = await ipcRenderer.invoke("getCargos");
  console.log(cargos);
  cargos.forEach((cargo) => {
    const option = document.createElement("option");
    option.id = cargo.id;
    option.value = cargo.id;
    option.textContent = cargo.cargo;
    option.setAttribute("data-values", cargo.cargoDescripcion);
    usuarioCargo.appendChild(option);
  });
};
// ----------------------------------------------------------------
// Obtenemos los cargos disponibles desde la base de datos
// ----------------------------------------------------------------
const getAccesos = async () => {
  roles = await ipcRenderer.invoke("getAccesos");
  console.log(roles);
  roles.forEach((rol) => {
    const option = document.createElement("option");
    option.id = rol.id;
    option.value = rol.id;
    option.textContent = rol.rol;
    option.setAttribute("data-values", rol.rolDescripcion);
    usuarioAcceso.appendChild(option);
  });
};
usuarioCargo.addEventListener("change", (event) => {
  let seleccionado = usuarioCargo.options[usuarioCargo.selectedIndex];
  let dataValues = seleccionado.getAttribute("data-values");
  let selected = usuarioCargo.value;
  usuarioDescripcionCargo.value = dataValues;
  console.log("Seleccionado: ", selected, dataValues);
});
usuarioAcceso.addEventListener("change", (event) => {
  let seleccionado = usuarioAcceso.options[usuarioAcceso.selectedIndex];
  let dataValues = seleccionado.getAttribute("data-values");
  let selected = usuarioAcceso.value;
  usuarioDescripcionAcceso.value = dataValues;
  console.log("Seleccionado: ", selected, dataValues);
});
criterio.onchange = async () => {
  let criterioSeleccionado = criterio.value;
  console.log("Seleccionado: ", criterioSeleccionado);
  if (criterioSeleccionado === "all") {
    // criterioContent.textContent = "";
    criterioContent.value = "";
    criterioContent.readOnly = true;
    let criterioBuscar = "all";
    let criterioContentBuscar = "all";
    await getEmpleados(criterioBuscar, criterioContentBuscar);
    await getUsuarios(criterioBuscar, criterioContentBuscar);
  } else {
    criterioContent.readOnly = false;
  }
};
buscarUsuarios.onclick = async () => {
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);

  await getEmpleados(criterioBuscar, criterioContentBuscar);
  await getUsuarios(criterioBuscar, criterioContentBuscar);
};

async function init() {
  usuarioModificacion.value = formatearFecha(new Date());
  let criterioBuscar = "all";
  let criterioContentBuscar = "all";
  getUsuarios(criterioBuscar, criterioContentBuscar);
  getEmpleados(criterioBuscar, criterioContentBuscar);
  await getCargos();
  await getAccesos();
}
function formatearFecha(fecha) {
  const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
ipcRenderer.on("Notificar", (event, response) => {
  if (response.title === "Borrado!") {
    resetFormAfterSave();
  } else if (response.title === "Actualizado!") {
    resetFormAfterUpdate();
  } else if (response.title === "Guardado!") {
    resetFormAfterSave();
  } else if (response.title === "Usuario eliminado!") {
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
function habilitarUsuario() {
  console.log("Habilitar Usuario");
  if (usuarioaccesosn.checked) {
    usuarioUsuario.disabled = false;
    usuarioClave.disabled = false;
    usuarioAcceso.disabled = false;
    usuarioDescripcionAcceso.disabled = false;
    //usuarioModificacion.disabled = false;
  } else {
    usuarioUsuario.disabled = true;
    usuarioClave.disabled = true;
    usuarioAcceso.disabled = true;
    usuarioDescripcionAcceso.disabled = true;
    //usuarioModificacion.disabled = true;
  }
}
// ----------------------------------------------------------------
// Resetear el formulario despues de actualizar
async function resetFormAfterUpdate() {
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  await getUsuarios(criterioBuscar, criterioContentBuscar);
  await getEmpleados(criterioBuscar, criterioContentBuscar);
  mensajeError.textContent = "";
}
// ----------------------------------------------------------------
// Resetear el formulario despues de guardar o eliminar
async function resetFormAfterSave() {
  let criterioBuscar = criterio.value;
  let criterioContentBuscar = criterioContent.value;
  console.log("Buscando: " + criterioBuscar + "|" + criterioContentBuscar);
  await getEmpleados(criterioBuscar, criterioContentBuscar);
  await getUsuarios(criterioBuscar, criterioContentBuscar);
  editingStatus = false;
  editUsuarioId = "";
  usuarioDarBaja.disabled = true;
  usuarioForm.reset();
  usuarioUsuario.disabled = true;
  usuarioClave.disabled = true;
  usuarioDescripcionAcceso.disabled = true;
  usuarioAcceso.disabled = true;
  usuarioAcceso.selectedIndex = 0;
  mensajeError.textContent = "";
  usuarioModificacion.value = formatearFecha(new Date());
}
// ----------------------------------------------------------------
// Resetear el formulario
function resetForm() {
  editingStatus = false;
  editUsuarioId = "";
  usuarioDarBaja.disabled = true;
  usuarioForm.reset();
  usuarioUsuario.disabled = true;
  usuarioClave.disabled = true;
  usuarioDescripcionAcceso.disabled = true;
  usuarioAcceso.disabled = true;
  usuarioAcceso.selectedIndex = 0;
  mensajeError.textContent = "";
  usuarioModificacion.value = formatearFecha(new Date());
}
// ----------------------------------------------------------------
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

init();
