# Indy Tech Talks
## Make your own Slack Bot
### August 2018
#### Joe Heth / Outdoorsy / @jheth

---

## Prerequisites

* Slack Account with Admin Access
* https://github.com/howdyai/botkit
  * https://botkit.ai/docs/readme-slack.html
* node and npm
* ngrok (if you want to develop locally)
* Heroku Account (for deployment)

---

## Create Slack Bot

* Login to your Slack Account
* Create a Slack Application
  * https://api.slack.com/apps
* Create a bot user
  * https://api.slack.com/bot-users
* You'll need the Client ID/Secret and Bot Token

---

## Getting Started

* `git clone git@github.com:jheth/slack-bot-example`
* `cd slack-bot-start; npm install`
* Update .env file
* ngrok http 8000
* `node index.js`

---

## OAuth Login

* Visit: http://host.domain/login
* State saved in configured storage

---

## Incoming Message Events

* `direct_message`
  * bot received a direct message from a user
* `direct_mention`
  * bot was addressed directly in a channel
* `mention`
  * bot was mentioned by someone in a message
* `ambient`
  * message received had no mention of the bot

---

## BotKit `hears` and `say`

```
controller.hears(['^tell me a secret$'],
  'direct_mention, ambient, mention',
  function(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.say('Better take this private...')
      convo.whisper('These violent delights have violent ends')
    });
});
```

---

## Slash Commands

Commands enable users to interact with your app from within Slack.

* Slack App: Enable Slash Commands
  * https://api.slack.com/slash-commands
  * https://botkit.ai/docs/readme-slack.html#controllercreatewebhookendpoints
* Botkit fires the `slash_command` event.

```
  /chuck
  /github user jheth
  /github org outdoorsy
```

---

## Interactive Messages

Any interactions with actions, dialogs, message buttons, or message menus will be sent to a URL you specify.

* Slack App: Enable Interactions
  * https://api.slack.com/interactive-messages
  * https://botkit.ai/docs/readme-slack.html#interactive-messages
* Botkit events: `interactive_message_callback`, `dialog_submission`, `message_action`

---

## Incoming Webhooks

A simple way to post messages from external sources into Slack.

* Slack Activate Incoming Webhooks
  * https://api.slack.com/incoming-webhooks
  * https://botkit.ai/docs/readme-slack.html#incoming-webhooks
* Click: Add New Webhook, Select: Channel

https://hooks.slack.com/services/T04KF/BCGD/NNoXy3NoA5a

---

## Heroku Deploy

* `heroku create`
* `heroku addons:create heroku-redis:hobby-dev`
* `git push heroku master`
* Update callback URLs in your Slack App

---

### Resources

* https://api.slack.com/internal-integrations
* https://api.slack.com/apps
* https://github.com/howdyai/botkit
* https://botkit.ai/docs/readme-slack.html
