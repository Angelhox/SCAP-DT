const mysql = require("promise-mysql");
// const mysql = require("mysql2/promise");

// const connection = mysql.createPool({
//   host: "monorail.proxy.rlwy.net",
//   user: "root",
//   password: "gd5cEh224gG3d2badb3G5b3-4bHE6-2A",
//   database: "railway",
//   port: 50755,
//   authPlugins: {
//     mysql_clear_password: () => () =>
//       Buffer.from("gd5cEh224gG3d2badb3G5b3-4bHE6-2A"),
//   },
// });

// // connection. .connect((err) => {
// //   if (err) {
// //     console.error("Error al conectar a la base de datos:", err);
// //   } else {
// //     console.log("Conexión exitosa");
// //   }
// // });

const connection = mysql.createConnection({
  host: "localhost",
  // host: "viaduct.proxy.rlwy.net",
  user: "root",
  // user: "root",
  password: "",
  // password: "cGF5a253311EdBCHG64ChCcFE5CD1h-a",
  database: "bdscap_sd_v3",
  // database: "railway",
  // database: "bdscaprevis",
  // port: 44319,
  // port: 3308,
  port: 3308,
});
function getConnection() {
  console.log("Conexion: ", connection);
  return connection;
}

async function closeConnection() {
  const conn = await getConnection();
  conn
    .end()
    .then(() => {
      console.log("Closed :) ");
    })
    .catch((error) => {
      console.log("No closed :(");
    });
}

module.exports = { getConnection, closeConnection };
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
