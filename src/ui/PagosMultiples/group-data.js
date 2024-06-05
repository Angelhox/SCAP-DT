const agruparPlanillas = async (allPlanillas) => {
  console.log("Grupos sin suma:", allPlanillas);

  let planillasAgrupadas = await allPlanillas.reduce((acumulador, objeto) => {
    // Verificar si ya hay un grupo con el mismo nombre
    let grupoExistente = acumulador.find(
      (contratosId) => contratosId.contratosId === objeto.contratosId
    );
    // Si el grupo existe, agregar el valor al grupo

    if (grupoExistente) {
      grupoExistente.valor += objeto.valor;
      grupoExistente.objetos.push(objeto);
      grupoExistente.ids.push(objeto.planillasId);
      grupoExistente.fechasEmision.push(
        formatearFecha(new Date(objeto.fechaEmision))
      );
    } else {
      // Si el grupo no existe, crear uno nuevo con el valor
      acumulador.push({
        contratosId: objeto.contratosId,
        fechasEmision: [formatearFecha(new Date(objeto.fechaEmision))],
        codigo: objeto.codigo,
        contratoId: objeto.contratosId,
        sociosId: objeto.sociosId,
        nombre: objeto.nombre,
        cedula: objeto.cedulaPasaporte,
        telefono: objeto.telefonoMovil,
        direccion: objeto.direccion,
        ubicacion: objeto.ubicacion,
        estado: objeto.estado,
        valor: objeto.valor,
        objetos: [objeto],
        servicios: [],
        encabezados: [],
        ids: [objeto.planillasId],
      });
    }

    return acumulador;
  }, []);
  return planillasAgrupadas;
};
async function agruparEncabezados(allServicios) {
  let encabezadosUnicos = await allServicios.reduce((lista, objeto) => {
    // Verificamos si el encabezadoId del objeto ya está en la lista
    if (!lista.includes(objeto.encabezadosId)) {
      // Si no está en la lista, lo añadimos
      lista.push(objeto.encabezadosId);
    }
    return lista;
  }, []);
  return encabezadosUnicos;
}
async function agruparServicios(allServicios) {
  let serviciosAgrupados = await allServicios.reduce((acumulador, objeto) => {
    // Verificar si ya hay un grupo con el mismo nombre
    let grupoExistente = acumulador.find(
      (contratadosId) => contratadosId.contratadosId === objeto.contratadosId
    );
    // Si el grupo existe, agregar el valor al grupo
    if (grupoExistente) {
      grupoExistente.index += 1;
      grupoExistente.abono += objeto.abono;
      if (objeto.aplazableSn === "No") {
        grupoExistente.total += objeto.total;
        grupoExistente.subtotal += objeto.subtotal;
      }
      grupoExistente.descuentoValor += objeto.descuento;
      // Recorriendo hasta quedarse con el ultimo saldo
      grupoExistente.saldo = objeto.saldo;
      grupoExistente.objetos.push(objeto);
      grupoExistente.detallesIds.push(objeto.detallesId);
      grupoExistente.encabezadosIds.push(objeto.encabezadosId);
    } else {
      // Si el grupo no existe, crear uno nuevo con el valor
      acumulador.push({
        id: objeto.serviciosId,
        index: 1,
        contratadosId: objeto.contratadosId,
        tipo: objeto.tipo,
        aplazableSn: objeto.aplazableSn,
        nombre: objeto.nombre,
        subtotal: objeto.subtotal,
        descuento: objeto.descuentoValor,
        total: objeto.total,
        abono: objeto.abono,
        saldo: objeto.saldo,
        descripcion: objeto.servicioDescripcion,
        objetos: [objeto],
        detallesIds: [objeto.detallesId],
        encabezadosIds: [objeto.encabezadosId],
      });
    }

    return acumulador;
  }, []);
  return serviciosAgrupados;
}
module.exports = { agruparPlanillas, agruparEncabezados, agruparServicios };
