function formatearFecha(fechaOriginal) {
  // const fechaOriginal = new Date(fecha);
  const year = fechaOriginal.getFullYear();
  const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
  const day = String(fechaOriginal.getDate()).padStart(2, "0");
  const fechaFormateada = `${year}-${month}-${day}`;
  return fechaFormateada;
}
// Función para agregar cero al principio si no está presente !!
function agregarCeroAlPrincipio(numero) {
  // Verificar si el número comienza con cero
  if (!/^0/.test(numero)) {
    // Si no comienza con cero, agregarlo
    numero = "0" + numero;
  }
  return numero;
}
module.exports = { formatearFecha, agregarCeroAlPrincipio };
