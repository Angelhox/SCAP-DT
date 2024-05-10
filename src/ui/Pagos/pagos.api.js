const { getConnection, closeConnection } = require("../../database");
async function cancelarServiciosMultiples(planillaCancelar, comprobante) {
  console.log("Here: ", planillaCancelar);
  try {
    const conn = await getConnection();
    console.log("Actualizando detalle: ", planillaCancelar);
    // Crear el comprobante !!
    const resultComprobante = await conn.query(
      "INSERT INTO comprobantes set ? ;",
      comprobante
    );
    // Cambiar el estado a cancelado de los encabezados
    planillaCancelar.encabezados.forEach(async (encabezadoId) => {
      await conn.query(
        "UPDATE encabezado set estado='Cancelado',fechaPago=Now() WHERE id = ? ;",
        encabezadoId
      );
      let newEncabezadoComprobante = {
        encabezadosId: encabezadoId,
        comprobantesId: resultComprobante.insertId,
      };
      // Relacionar el comprobante con los encabezados !!
      await conn.query(
        "Insert into encabezadoComprobantes set ? ;",
        newEncabezadoComprobante
      );
    });
    //Cambiamos el estado de los detallesServicio !!
    planillaCancelar.servicios.forEach(async (servicio) => {
      servicio.objetos.forEach(async (servicioCancelar) => {
        // comprobante.encabezadosId = servicio.encabezadosIds;
        // await conn.query(
        //   "UPDATE encabezado set estado='Cancelado',fechaPago=Now() WHERE id = ? ;",
        //   servicioCancelar.encabezadosId
        // );
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
            " WHERE id =" +
            servicioCancelar.detallesId +
            " ;"
        );
      });
    });
    // Cambiamos el estado de las planillas !!
    planillaCancelar.ids.forEach(async (planillaCancelarId) => {
      await conn.query(
        "UPDATE planillas set estado='Cancelado' WHERE id = ? ;",
        planillaCancelarId
      );
    });
    // event.sender.send("Notificar", {
    //   success: true,
    //   title: "Actualizado!",
    //   message: "Se ha cancelado la planilla.",
    // });
  } catch (error) {
    // event.sender.send("Notificar", {
    //   success: false,
    //   title: "Error!",
    //   message: "Ha ocurrido un error al cancelar la planilla.",
    // });
    console.log("Error at pagos/cancelarServiciosMultiples: ", error);
  }
}
// ipcMain.handle(
//     "cancelarServiciosMultiples",
//     async (event, planillaCancelar, comprobante) => {

//     }
//   );
module.exports = { cancelarServiciosMultiples };
