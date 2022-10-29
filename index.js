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

    const domains = JSON.parse(process.env.LIST_DOMAIN);

    domains.map(item => {
        const options = {
            hostname: process.env.API_URL,
            port: process.env.PORT,
            path: `/client/v4/zones/${process.env.ZONE_IDENTIFIER}/dns_records/${item.dns_identifier}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.API_TOKEN,
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode == 200) {
                let data = '';
                console.log('Status Code:', res.statusCode, 'Domain:', item.name);
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    checkData = JSON.parse(data);
                    if (checkData.result.content != ip) {     
                        console.log("Actualizando dominio", item.name, "a la ip", ip);                   
                        updateDNS(ip, item.name, item.dns_identifier, item.ttl, item.proxied );                        
                    }
                });
            } else {
                console.log('Ocurrió un error al consultar la función checkDNS.');
            }
        })
            .on('error', err => {
                console.log('Error: ', err.message);
            });

        req.end();
    });
}

function updateDNS(ip, domain, id, ttl, proxied) {
    const data = JSON.stringify({
        "type": "A",
        "name": domain,
        "content": ip,
        "ttl": ttl,
        "proxied": Boolean(proxied)
    });

    const options = {
        hostname: process.env.API_URL,
        port: process.env.PORT,
        path: `/client/v4/zones/${process.env.ZONE_IDENTIFIER}/dns_records/${id}`,
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
                console.log("Dominio", domain, "actualizado correctamente.");     
                console.log('Body: ', JSON.parse(data));
            });
        } else {
            console.log('Ocurrió un error al ejecutar la función updateDNS.');
            console.log('Status Code:', res.statusCode);
        }
    })
        .on('error', err => {
            console.log('Error: ', err.message);
        });

    req.write(data);
    req.end();
}

cron.schedule('* * * * *', function () {
    console.log('Ejecutado chequeo...');
    init();
});
