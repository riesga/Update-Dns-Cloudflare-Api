const https = require('https');
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser");
  require('dotenv').config();
 // methodOverride = require("method-override");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(methodOverride());

var router = express.Router();

router.get("/dns", function (req, res) {
  checkDNS(req.query.ip, req.query.tipoevento);
  res.end( JSON.stringify('Proceso realizado correctamente'));
});

app.use(router);

app.listen(3000, function () {
  console.log("Node server running on http://localhost:3000");
});


function checkDNS(ip, event) {

  if (event === 'changeDNS') {
  
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