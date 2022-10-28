const https = require('https');
var cron = require('node-cron');
require('dotenv').config();

function getIdDNS() {
  const options = {
      hostname: process.env.API_URL,
      port: process.env.PORT,
      path: `/client/v4/zones/${process.env.ZONE_IDENTIFIER}/dns_records`,
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
              console.log('Body: ', JSON.parse(data))

          });
      } else {
          console.log('Ocurrió un error al consultar la función getIdDNS.');
      }
  })
      .on('error', err => {
          console.log('Error: ', err.message);
      });

  req.end();
}

getIdDNS();