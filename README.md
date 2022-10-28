# About this app
Node Js app to update Cloudflare DNS records via API

# Cloudflare-DNS-Update
Script to automatically update DNS in Cloudflare for Failover Connections on Server on premise (Self-hosted)

# Configure Environment Variables:

Copy or rename .env.example to .env and fill in the variables.

ZONE_IDENTIFIER -> The Zone ID is obtained by entering the Cloudflare dahsboard.

DNS_IDENTIFIER -> To get the Id of the DNS record, run the getIdentifier.js file and get the Id of the DNS record you want to manage.
# Run the app

To run the app just inside the project folder run the command: npm start