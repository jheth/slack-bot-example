var fetch = require('node-fetch');
var URI = require('urijs');

module.exports = {
  getUser: function(type, username) {
    return fetch(`https://api.github.com/${type == 'org' ? 'orgs' : 'users'}/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    }).then(res => res.json());
  },
  getRepo: function(isUser, path) {
    let [username, repo] = path.split('/');

    return fetch(`https://api.github.com/${isUser ? 'users' : 'orgs'}/${username}/repos/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    }).then(res => res.json());
  }
}
