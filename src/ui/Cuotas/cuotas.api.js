const { getConnection, closeConnection } = require("../../database");
async function contratarPrincipales(servicioId, tipo) {
  if (servicioId === 40 || servicioId === 42) {
    try {
      const conn = await getConnection();
      const contratadosNoPrincipales = await conn.query(
        "select contratos.id as contratosId,contratos.codigo," +
          "contratos.principalSn,contratos.estado,servicioscontratados.id as contratadosId,servicios.id as serviciosId," +
          "servicios.nombre,servicios.tipo from contratos join servicioscontratados on contratos.id=servicioscontratados.contratosId " +
          "join servicios on servicios.id=servicioscontratados.serviciosId where contratos.estado='Activo' and contratos.principalSn='No' " +
          "and serviciosContratados.serviciosId=? ;",
        servicioId
      );
      if (contratadosNoPrincipales.length > 0) {
        if (tipo === "Servicio fijo") {
          await deleteContratadosDetallesFijos(contratadosNoPrincipales);
        } else if (tipo === "Cuota") {
          await deleteContratadosDetallesCuotas(contratadosNoPrincipales);
        }
      }
    } catch (e) {
      console.log("Error en contratarPrincipales: ", e);
    }
  } else {
    return;
  }
}
// Cuotas !!
async function deleteContratadosDetallesCuotas(contratadosNoPrincipales) {
  const conn = await getConnection();
  // Eliminar detalles que no hayan sido cancelados !!
  for (const forProcess of contratadosNoPrincipales) {
    // Comprobar si los detalles existen !!
    const resultAEliminarDetalles = await conn.query(
      "SELECT * from detallesservicio where serviciosContratadosId=? ",
      forProcess.contratadosId
    );
    // Si existen !!
    if (resultAEliminarDetalles.length > 0) {
      // Comprobar si almenos uno ha sido cancelado
      let unCancelado = false;
      for (const forDelete of resultAEliminarDetalles) {
        if (forDelete.estado === "Cancelado") {
          unCancelado = true;
        }
      }
      if (!unCancelado) {
        await deleteDetallesCuotas(forProcess.contratadosId);
        await deleteContratadosCuotas(forProcess.contratadosId);
      }
    }
  }
}
async function deleteDetallesCuotas(contratadoId) {
  const conn = await getConnection();
  const resultDetalleEliminado = await conn.query(
    "Delete from detallesservicio where serviciosContratadosId=?",
    contratadoId
  );
}
async function deleteContratadosCuotas(contratadoId) {
  const conn = await getConnection();
  // Eliminar el serviciosContratado !!
  const resultEliminarContratados = await conn.query(
    "DELETE from serviciosContratados where id=?",
    contratadoId
  );
}
// Servicios fijos !!
async function deleteContratadosDetallesFijos(contratadosNoPrincipales) {
  const conn = await getConnection();
  // Eliminar detalles que no hayan sido cancelados !!
  for (const forProcess of contratadosNoPrincipales) {
    // Comprobar si los detalles existen !!
    const resultAEliminarDetalles = await conn.query(
      "SELECT * from detallesservicio where serviciosContratadosId=? ",
      forProcess.contratadosId
    );
    // Si existen !!
    if (resultAEliminarDetalles.length > 0) {
      // Comprobar sin han sido cancelados o no !!
      for (const forDelete of resultAEliminarDetalles) {
        if (forDelete.estado === "Por cancelar") {
          await deleteDetallesFijos(forDelete.id);
        }
      }
      await innactiveContratadosFijos(forProcess.contratadosId);
    }
  }
}
async function deleteDetallesFijos(detallesId) {
  const conn = await getConnection();
  const resultDetalleEliminado = await conn.query(
    "Delete from detallesservicio where id=?",
    detallesId
  );
}
async function innactiveContratadosFijos(contratadoId) {
  const conn = await getConnection();
  // Eliminar el serviciosContratado !!
  const resultInnactivarContratados = await conn.query(
    "UPDATE serviciosContratados set estado='Innactivo' where id=?",
    contratadoId
  );
}
module.exports = { contratarPrincipales };
