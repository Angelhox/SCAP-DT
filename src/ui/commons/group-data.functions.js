function createPlanillaAgrupada(planilla) {
  const newPlanillaAgrupada = {
    contratosId: planilla.contratosId,
    fechasEmision: [formatearFecha(new Date(planilla.fechaEmision))],
    codigo: planilla.codigo,
    contratoId: planilla.contratosId,
    sociosId: planilla.sociosId,
    nombre: planilla.nombre,
    cedula: planilla.cedulaPasaporte,
    telefono: planilla.telefonoMovil,
    direccion: planilla.direccion,
    ubicacion: planilla.ubicacion,
    estado: planilla.estado,
    valor: planilla.valor,
    objetos: [planilla],
    servicios: [],
    encabezados: [],
    ids: [planilla.planillasId],
  };
  return newPlanillaAgrupada;
}
function createServicioAgrupado(servicio) {
  const newServicioAgrupado = {
    id: servicio.serviciosId,
    index: 1,
    contratadosId: servicio.contratadosId,
    tipo: servicio.tipo,
    aplazableSn: servicio.aplazableSn,
    nombre: servicio.nombre,
    subtotal: servicio.subtotal,
    descuento: servicio.descuentoValor,
    total: servicio.total,
    abono: servicio.abono,
    saldo: servicio.saldo,
    // descripcion: servicio.servicioDescripcion,
    descripcion: servicio.descripcion,
    objetos: [servicio],
    // detallesIds: [servicio.detallesId],
    detallesIds: [servicio.id],
    encabezadosIds: [servicio.encabezadosId],
  };
  return newServicioAgrupado;
}
module.exports = { createPlanillaAgrupada, createServicioAgrupado };
