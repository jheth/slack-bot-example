var fetch = require('node-fetch');
var env = require('node-env-file');

env(__dirname + '/.env');

let slackMessage = {
  "attachments": [{
    "title": "Rental Approval Request",
    "text": "Rental <https://www.outdoorsy.com|#1234> has been flagged by Jane Doe\nReason: Fraudulent. Would you like to approve or delete?",
    "fallback": "Rental #1234 has been flagged by Jane Doe; Reason: Fraudulent",
    "callback_id": "rental_1234_flagged",
    "color": "warning",
    "attachment_type": "default",
    "actions": [{
      "name": "choice",
      "text": "Approve",
      "type": "button",
      "value": "approve",
      "style": "primary"
    }, {
      "name": "choice",
      "text": "Delete",
      "type": "button",
      "value": "delete",
      "style": "danger",
      "confirm": {
        "text": "This will remove the listing from Outdoorsy",
        "title": "Are you sure?",
        "ok_text": "Yes",
        "dismiss_text": "No"
      }
    }]
  }]
};

return fetch(process.env.INCOMING_WEBHOOK, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(slackMessage)
}).then(res => res.text()).then(data => console.log(data));
