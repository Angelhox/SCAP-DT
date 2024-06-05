function aproximarDosDecimales(numero) {
    // Redondea el número hacia arriba
    const numeroRedondeado = Math.ceil(numero * 100) / 100;
    return numeroRedondeado.toFixed(2);
  }
  module.exports={
    aproximarDosDecimales
  }