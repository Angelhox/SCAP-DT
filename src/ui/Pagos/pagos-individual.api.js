const { getConnection, closeConnection } = require("../../database");
async function cancelarServicios(
  event,
  planillaCancelarId,
  encabezadoCancelarId,
  serviciosCancelar,
  comprobante
) {
  const conn = await getConnection();
  console.log(
    "Actualizando detalle: ",
    planillaCancelarId,
    encabezadoCancelarId,
    serviciosCancelar
  );
  try {
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
    // Crear la relacion entre el comprobante creado y el encabezado !!
    const newEncabezadoComprobante = {
      encabezadosId: encabezadoCancelarId,
      comprobantesId: resultComprobante.insertId,
    };
    const resultEncabezadoComprobante = await conn.query(
      "INSERT INTO encabezadoComprobantes SET ?",
      newEncabezadoComprobante
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
module.exports = { cancelarServicios };
