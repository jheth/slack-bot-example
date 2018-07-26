var fetch = require('node-fetch');
var URI = require('urijs');

module.exports = {
  post: function(info) {
    info = info || {};

    return fetch(`https://request-bin-thunderstorm.herokuapp.com/${process.env.REQUEST_BIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({data: info})
    })
    .then(response => response.text())
    .then(text => {
      return new Promise((resolve, reject) => {
        let response = {
          data: {
            id: 21344,
            name: info.name
          }
        };
        resolve(response);
      });
    });
  }
}
