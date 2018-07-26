var fetch = require('node-fetch');
var URI = require('urijs');

module.exports = {
  createTask: function(workspace, taskInfo) {
    taskInfo = taskInfo || {};
    taskInfo.projects = workspace;
    if (!taskInfo.name) {
      return;
    }

    return fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.ASANA_TOKEN
      },
      body: JSON.stringify({data: taskInfo})
    }).then(res => resp.json());
  }
}
