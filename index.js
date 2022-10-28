const https = require('https');
var cron = require('node-cron');
require('dotenv').config();


function init() {
    https.get(process.env.GET_CURRENT_IP_SERVER, (resp) => {
        if (resp.statusCode == 200) {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                result = JSON.parse(data);
                if (result.ip === process.env.IP_PROVIDER) {
                    console.log("Enlace activo con la ip " + result.ip);
                    checkDNS(process.env.PRIMARY_IP_SERVER);
                } else {
                    console.log("Enlace alterno activo con la ip " + result.ip);
                    checkDNS(process.env.SECONDARY_IP_SERVER);
                }
            });
        } else {
            console.log('La respuesta del servidor no fue correcta.');
        }
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function checkDNS(ip) {
    const options = {
        hostname: process.env.API_URL,
        port: process.env.PORT,
        path: `/client/v4/zones/${process.env.ZONE_IDENTIFIER}/dns_records/${process.env.DNS_IDENTIFIER}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.API_TOKEN,
        }
    };

    const req = https.request(options, (res) => {
        if (res.statusCode == 200) {
            let data = '';
            console.log('Status Code:', res.statusCode);
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                checkData = JSON.parse(data);
                if (checkData.result.content != ip) {
                    console.log("Actualizando DNS a la Ip " + ip);
                    updateDNS(ip);
                } else {
                    console.log("Enlace correcto, no es necesario actualizar DNS.");
                };

            });
        } else {
            console.log('Ocurrió un error al consultar la función checkDNS.');
        }
    })
        .on('error', err => {
            console.log('Error: ', err.message);
        });

    req.end();
}

function updateDNS(ip) {
    const data = JSON.stringify({
        "type": "A",
        "name": process.env.DOMAIN,
        "content": ip,
        "ttl": process.env.TTL,
        "proxied": process.env.PROXIED
    });

    const options = {
        hostname: process.env.API_URL,
        port: process.env.PORT,
        path: `/client/v4/zones/${process.env.ZONE_IDENTIFIER}/dns_records/${process.env.DNS_IDENTIFIER}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.API_TOKEN,
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        if (res.statusCode == 200) {
            let data = '';
            console.log('Status Code:', res.statusCode);
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('Body: ', JSON.parse(data));
            });
        } else {
            console.log('Ocurrió un error al ejecutar la función updateDNS.');
        }
    })
        .on('error', err => {
            console.log('Error: ', err.message);
        });

    req.write(data);
    req.end();
}

cron.schedule('* * * * *', function () {
    console.log('Ejecutado chequeo cada minuto.');
    init();
});

//Para obtener los Identifier de cada registro DNS
//getIdDNS();