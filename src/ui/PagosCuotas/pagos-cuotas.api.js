const { getConnection, closeConnection } = require("../../database");
const { getSaldoNoCancelado } = require("../Pagos/pagos-individual.api");
async function cancelarCuota(event, servicioCancelar, comprobante) {
  const conn = await getConnection();
  console.log("Actualizando detalle: ", servicioCancelar);
  try {
    // serviciosCancelar.forEach(async (servicioCancelar) => {
    let abono = 0;
    let saldo = 0;
    if (servicioCancelar.abono !== null) {
      abono = parseFloat(servicioCancelar.abono).toFixed(2);
    }
    if (servicioCancelar.saldo !== null) {
      saldo = parseFloat(servicioCancelar.saldo).toFixed(2);
    }

    // });
    // await conn.query(
    //   "UPDATE planillas set estado='Cancelado' WHERE id = ? ;",
    //   planillaCancelarId
    // );
    // const result = await conn.query(
    //   "UPDATE encabezado set estado='Cancelado',fechaPago=Now() WHERE id = ? ;",
    //   encabezadoCancelarId
    // );
    // Creamos un nuevo encabezado para apartar este detalle de los que tengan la misma fecha
    const newEncabezado = {
      fechaPago: new Date(),
      fechaEmision: servicioCancelar.fechaEmision,
      tipo: "otro",
      estado: "Cancelado",
    };
    const resultEncabezado = await conn.query(
      "Insert into encabezado set ? ;",
      newEncabezado
    );
    await conn.query(
      "UPDATE detallesServicio set estado='Cancelado',abono=" +
        abono +
        ", saldo=" +
        saldo +
        ", encabezadosId=" +
        resultEncabezado.insertId +
        " WHERE id = ? ;",
      servicioCancelar.id
    );
    // Creamos el registro en la tabla de comprobante
    const resultComprobante = await conn.query(
      "INSERT INTO comprobantes set ? ;",
      comprobante
    );
    // Crear la relacion entre el comprobante creado y el encabezado !!
    const newEncabezadoComprobante = {
      encabezadosId: resultEncabezado.insertId,
      comprobantesId: resultComprobante.insertId,
    };
    const resultEncabezadoComprobante = await conn.query(
      "INSERT INTO encabezadoComprobantes SET ?",
      newEncabezadoComprobante
    );
    // // Si el abono es mayor al pago individual
    // if (servicioCancelar.abono > servicioCancelar.valorPagosIndividual) {
    //   const detallesFuturos = await getSaldoNoCancelado(
    //     servicioCancelar.contratadosId
    //   );
    //   if(servicioCancelar.saldo===0){
    //     //Eliminar los otros detalles
    //   }
    //   // Si el saldo aun no es 0

    // }
    event.sender.send("Notificar", {
      success: true,
      title: "Actualizado!",
      message: "Se ha cancelado la cuota.",
    });
    console.log(resultEncabezadoComprobante);
    return resultEncabezadoComprobante;
  } catch (error) {
    event.sender.send("Notificar", {
      success: false,
      title: "Error!",
      message: "Ha ocurrido un error al cancelar la cuota individual.",
    });
    console.log("Error al cancelar: ", error);
  }
}
module.exports = { cancelarCuota };
