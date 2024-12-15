const { getConnection, closeConnection } = require("../../../database");
async function getAboutBeneficiarios(servicioId) {
  if (servicioId) {
    const conn = await getConnection();
    const allSocios = await conn.query("select * from viewContratos");
    const sociosConServicio = await conn.query(
      "SELECT * FROM viewServiciosContratados where estado='Activo' and  serviciosId=? ;",
      servicioId
    );
    // Filtrar socios que no están en la lista de socios con servicio
    const sociosSinServicio = allSocios.filter(
      (socio) => !sociosConServicio.some((s) => s.id === socio.contratosId)
    );
    console.log("Socios sin servicio: ", sociosSinServicio);
    console.log("Socios con servicio: ", sociosConServicio);
    return (beneficiarios = {
      totalContratos: allSocios.length,
      conServicio: sociosConServicio,
      sinServicio: sociosSinServicio,
    });
  }
  return null;
}
module.exports = { getAboutBeneficiarios };
