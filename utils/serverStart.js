const https=require('https');
const http = require('http');
const fs = require('fs');

const { USE_SSL, SSL_PF, SSL_DIR, SSL_KEY, SSL_CERT, SSL_CA_CERTS } = process.env;

const useSsl = USE_SSL && USE_SSL=="true";

function validateSsl() {
    if (!SSL_DIR) throw "SSL_DIR is required";
    if (!SSL_KEY) throw "SSL_KEY is required";
    if (!SSL_CERT) throw "SSL_CERT is required";
    if (!SSL_CA_CERTS) throw "SSL_CA_CERTS is required";
}

const startServer = (app) => {
    if (!useSsl) {
        return http.createServer(app);
    }
    console.log("Applying SSL ...");
    try {
        validateSsl();
        const options = {
            cert: fs.readFileSync(`${SSL_DIR}/${SSL_CERT}`),
            key: fs.readFileSync(`${SSL_DIR}/${SSL_KEY}`)
        };
        if (SSL_PF) options.passphrase = SSL_PF;
        const cas = SSL_CA_CERTS.split(",");
        if (cas.length == 1) options.ca = fs.readFileSync(`${SSL_DIR}/${SSL_CA_CERTS}`);
        else options.ca = cas.map(fn => fs.readFileSync(`${SSL_DIR}/${fn}`))
        return https.createServer(options, app);
    } catch (err) {
        console.error("Error starting server with SSL", err);
        process.exit(1);
    }
};

module.exports = startServer;
