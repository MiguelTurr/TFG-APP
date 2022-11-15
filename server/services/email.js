const nodemailer = require('nodemailer');
const { email_user, email_password } = require('./config.js');

const opciones = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: false,
    auth: {
        user: email_user,
        pass: email_password
    },
};

let conexion = nodemailer.createTransport(opciones);

module.exports = conexion;