const {createWindow} = require('./main')
const {app} = require('electron')
require('./database.js')
require('electron-reload')(__dirname)
app.allowRedererProcessReuse = false;
app.whenReady().then(createWindow);
