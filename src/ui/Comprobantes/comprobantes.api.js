const { getConnection, closeConnection } = require("../../database");
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
module.exports = {
  createEncabezadoComprobante,
  verificarEncabezadoComprobantes,
};
