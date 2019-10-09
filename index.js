const socket = require('socket.io');
const express = require('express');
const chalk = require('chalk')
const app = express();
const cors = require('cors');
const port = process.env.SERVER_PORT || 9647;
const server = app.listen(port, () => {
console.log(chalk.green(`[+] Listening on port: ${port}`))
const router = require('./routes/');
app.use(express.json());
app.use(cors());
app.use('/', router)
})

const io = module.exports = socket(server);
