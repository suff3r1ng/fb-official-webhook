const request = require('request');

const sendMessage = (uri, accessToken, messageData) => {
    const options = {
        uri,
        qs: { access_token: accessToken },
        method: 'POST',
        json: messageData
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
};

module.exports = sendMessage;
