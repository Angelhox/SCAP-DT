const { ipcRenderer } = require("electron");
const { access } = require("original-fs");
// const abrirInterface = async()=> {
//    const result=  ipcRenderer.send('abrirInterface',"src/ui/index.html");
//   }
const usuarioUsuario = document.getElementById("usuario");
const usuarioClave = document.getElementById("clave");
// Funcion de inicio de session
// ----------------------------------------------------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = usuarioUsuario.value;
  const clave = usuarioClave.value;
  await ipcRenderer.invoke("validarUsuarios", {
    usuario,
    clave,
  });
  loginForm.reset();
  usuarioUsuario.focus();
});
// ----------------------------------------------------------------
// Funcion de recepcion de respuesta al intentar logearse
// ----------------------------------------------------------------
ipcRenderer.on("loginResponse", (event, response) => {
  if (response.success) {
    console.log("Incio de session correcto");
  } else {
    if (response.message === "No existe este usuario") {
      console.log("Usuario incorrecto");
      usuarioUsuario.focus();
    } else if (response.message === "Credenciales incorrectas") {
      console.log("Contraseña incorrecta");
      usuarioClave.value = "";
    } else {
      console.log("mensaje", response.message);
      console.log("No se ha podido iniciar session");
    }
  }
});
// ----------------------------------------------------------------
// Funciones de cierre de sesion
// ----------------------------------------------------------------
function cerrarSesion() {
  ipcRenderer.send("cerrarSesion");
}

ipcRenderer.on("sesionCerrada", async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Login";
  await ipcRenderer.send("abrirInterface", url, acceso);
});
// ----------------------------------------------------------------
// Esta funcion abre el formulario para el inicio de sesion
// ----------------------------------------------------------------
function mostrarLogin() {
  const dialog = document.getElementById("loginDialog");
  dialog.showModal();
}
// loginForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const url = "src/ui/usuarios.html";
//   const result = ipcRenderer.send("abrirInterface", url);
// });
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
const abrirPagosII = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "PagosII";
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
const abrirRecaudaciones = async () => {
  const acceso = sessionStorage.getItem("acceso");
  const url = "Recaudaciones";
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
