const { getConnection, closeConnection } = require("../../database");
const { formatearFecha } = require("../commons/fechas.functions");
async function createEncabezadoComprobante() {
  try {
    const conn = await getConnection();
    // Obtenemos los datos de los comprobantes existentes
    const comprobantes = await conn.query("SELECT * from comprobantes");
    // Recorro los comprobantes obtenidos
    for (const comprobante of comprobantes) {
      const newEncabezadoComprobante = {
        encabezadosId: comprobante.encabezadosId,
        comprobantesId: comprobante.id,
      };
      const result = await conn.query(
        "INSERT INTO encabezadoComprobantes set ? ;",
        newEncabezadoComprobante
      );
      console.log("Encabezado comprobante: ", result);
    }
  } catch (e) {
    console.log("Error at createEncabezadoComprobante: ", e);
    throw e;
  }
}
async function verificarEncabezadoComprobantes() {
  try {
    const conn = await getConnection();
    const encabezadoComprobantes = await conn.query(
      "select encabezado.estado,encabezado.id " +
        "as encabezadoId,encabezadoComprobantes.encabezadosId," +
        "encabezadoComprobantes.comprobantesId,comprobantes.encabezadosId as relation," +
        "comprobantes.id as comprobanteId from encabezado join encabezadoComprobantes " +
        "on encabezado.id=encabezadoComprobantes.encabezadosId join " +
        "comprobantes on comprobantes.id=encabezadocomprobantes.comprobantesId;"
    );
    for (const encom of encabezadoComprobantes) {
      if (encom.relation !== encom.encabezadosId) {
        return "El encabezado no coincide";
      }
    }
    return "Las relaciones son correctas";
  } catch (e) {
    console.log("Error at verfificarEncabezadoComprobante", e);
    throw e;
  }
}
async function anularComprobantes(planillaId, encabezadoId, comprobante) {
  console.log("Para anular: ", comprobante);
  try {
    const conn = await getConnection();
    const resultPlanilla = await conn
      .query("UPDATE planillas set estado='Por cobrar' WHERE id= ?", planillaId)
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
        return resultComprobante;
      });
  } catch (error) {
    console.log("Error al anular el pago: ", error);
  }
}
async function anularComprobantesMultiples(
  contratoId,
  planillaId,
  encabezadoId,
  comprobante
) {
  console.log("Para anular: ", comprobante);
  try {
    const conn = await getConnection();
    // Consultar los encabezados que tienen relacion con el comprobante a anular !!
    const encabezadosAnular = await conn
      .query(
        "select encabezadoComprobantes.encabezadosId from encabezadoComprobantes where comprobantesId= ?",
        comprobante.id
      )
      .then(async (encabezadosAnular) => {
        console.log("Encabezados a anular: ", encabezadosAnular);
        for (const encabezado of encabezadosAnular) {
          const fechaEmision = await conn
            .query(
              "select fechaEmision from encabezado where id=?;",
              encabezado.encabezadosId
            )
            .then(async (fechaEmision) => {
              let fechaEmisionBuscar = formatearFecha(
                fechaEmision[0].fechaEmision
              );
              console.log("Fecha planilla anular: ", fechaEmisionBuscar);
              const planillaAnular = await conn
                .query(
                  "select planillasId from viewplanillas where month(fechaEmision)" +
                    " =month('" +
                    fechaEmisionBuscar +
                    "') and year(fechaEmision) =('" +
                    fechaEmisionBuscar +
                    "')" +
                    " and contratosId=?;",
                  contratoId
                )
                .then(async (planillaAnular) => {
                  console.log("Planilla anular: ", planillaAnular);
                  resultPlanilla = await conn.query(
                    "UPDATE planillas set estado='Por cobrar' WHERE id= ?",
                    planillaAnular[0].planillasId
                  );
                })
                .then(async (resultPlanilla) => {
                  const resultEncabezado = await conn
                    .query(
                      "UPDATE encabezado set estado=null,fechaPago=null WHERE id=?",
                      encabezado.encabezadosId
                    )
                    .then(async (resultEncabezado) => {
                      const resultDetalles = await conn.query(
                        "UPDATE detallesServicio set estado='Por cancelar' WHERE encabezadosId=?",
                        encabezado.encabezadosId
                      );
                    });
                });
            });
        }
      });

    const resultComprobante = await conn.query(
      "UPDATE comprobantes set ? WHERE id=?",
      [comprobante, comprobante.id]
    );
    return resultComprobante;
  } catch (error) {
    console.log("Error al anular el pago: ", error);
  }
}
module.exports = {
  createEncabezadoComprobante,
  verificarEncabezadoComprobantes,
  anularComprobantes,
  anularComprobantesMultiples,
};
