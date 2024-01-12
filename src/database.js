const mysql = require("promise-mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bdscap_sd_v3",
  // database: "bdscaprevis",
  port: 3308,
  // port: 3306,
});
function getConnection() {
  return connection;
}
function closeConnection() {

}
function cerrarConnection() {
  closeConnection().catch((err) => {
    console.error('Error al cerrar la conexión (fuera de la función):', err);
  });
  // The connection is terminated now
}

module.exports = { getConnection, cerrarConnection };
//const mysql = require('mysql');

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'xxxx',
//   port:3308
// });

// connection.connect((err) => {
//   if (err) {
//     console.error('Error al conectar a la base de datos:', err);
//     return;
//   }
//   console.log('Conexión exitosa a la base de datos.');

//   // Aquí puedes realizar consultas y operaciones en la base de datos
// });
//  function getConnection(){
//  return connection;
//  }
//  module.exports={getConnection}
