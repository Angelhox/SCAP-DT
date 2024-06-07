async function anularFijo(servicio) {
  Swal.fire({
    title: "¿Quieres anular este servicio?",
    text: "El valor no se vera reflejado en la planilla, no podrás deshacer esta acción.",
    icon: "question",
    iconColor: "#f8c471",
    showCancelButton: true,
    confirmButtonColor: "#2874A6",
    cancelButtonColor: "#EC7063 ",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const newDetalle = {
        estado: "Anulado",
      };
      const reultAnularFijo = await ipcRenderer.invoke(
        "updateDetalle",
        fechaEmisionEdit,
        editContratoId,
        servicio.id,
        newDetalle
      );
    }
    //   else {detallesServiciodg(servicio); }
  });
}
module.exports = { anularFijo };
