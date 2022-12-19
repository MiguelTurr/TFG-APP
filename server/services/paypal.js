const paypal = require('@paypal/checkout-server-sdk');
const { paypal_client, paypal_secret, dev_state } = require('./config.js');

//

const Environment = dev_state === true ? paypal.core.SandboxEnvironment : paypal.core.LiveEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(new Environment(paypal_client, paypal_secret));

//

module.exports = {
    paypal,
    paypalClient,
};