/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Slack-Bot-Example - A bot for interacting with
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var Botkit = require('botkit');
var redis = require('botkit-storage-redis');
var http = require('http');
var url = require('url');
var URI = require("urijs");
var moment = require("moment");
var outdoorsy = require("./outdoorsy");
var slackResponse = require("./slack");
var asana = require('./asana');
var chuck = require("./chuck");
var github = require("./github");
var requestBin = require("./request-bin");

var env = require('node-env-file');
var fs = require('fs');

var envFile = __dirname + '/.env'
if (fs.existsSync(envFile)) {
  console.log(`Loading variables from ${envFile}`);
  env(envFile);
}

var botOptions = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  scopes: ['bot'],
  debug: process.env.DEBUG || false
};

if (process.env.REDIS_URL) {
  var redisURL = url.parse(process.env.REDIS_URL);
  botOptions.storage = redis({
    namespace: 'botkit-indy-tech-talks',
    host: redisURL.hostname,
    port: redisURL.port,
    auth_pass: redisURL.auth ? redisURL.auth.split(":")[1] : null
  });
} else {
  botOptions.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

if (!process.env.BOT_TOKEN) {
  console.log('Error: Specify BOT_TOKEN in environment');
  process.exit(1);
}

var controller = Botkit.slackbot(botOptions);

var bot = controller.spawn({
  debug: process.env.DEBUG || false,
  token: process.env.BOT_TOKEN
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

// we ALSO need a built in webserver for the slash commands
controller.setupWebserver(process.env.PORT,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);
  controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

controller.on('bot_channel_join', function(bot, message) {
  bot.reply(message, {
    text: "IndyTechTalks is here!"
  });
});

controller.on('channel_join', function(bot, message) {
  bot.reply(message,'Welcome to the channel!');
});

controller.hears(['did you hear'],'direct_mention',function(bot, message) {
  bot.reply(message, 'I heard you!')
});

controller.hears(['^tell me a secret$'], ['direct_mention', 'ambient', 'mention'], function(bot, message) {
  bot.startConversation(message, function(err, convo) {
    convo.say('Better take this private...')
    convo.say({ ephemeral: true, text: 'These violent delights have violent ends' })
  });
});

// listen for passive outdoorsy links and reply with relevant info
controller.hears(["user", "rental"], ['direct_message', 'direct_mention', 'ambient'], function(bot,message) {
  // Pipe response back to Slack
  function botResponse(attachments) {
    // ensure we're working with an array
    if (!Array.isArray(attachments)) {
      attachments = [attachments];
    }
    bot.replyInThread(message, {
      text: "It's dangerous to go alone, take this!\ncxxxxx][===============>",
      attachments: attachments,
    }, function(err,resp) {
      console.log(err,resp);
    });
  }

  var items = outdoorsy.extractItems(message.text);

  // you can continue to respond to a single message for up to 3 minutes, so we're just going to
  // iterate over all the possible expansions and return them

  // iterate over rentals
  items.rentals.forEach(function(rentalId) {
    outdoorsy.pullRental(rentalId, function(rental) {
      if (rental.error) {
        bot.reply(message, {
          text: `Oops! That rental returned: ${rental.error}`
        })
      } else {
        botResponse(slackResponse.buildRentalResponse(rental));
      }
    });
  });

  // iterate over users
  items.users.forEach(function(userId) {
    outdoorsy.pullUser(userId, function(user) {
      if (user.error) {
        bot.reply(message, {
          text: `Oops! That user returned: ${user.error}`
        })
      } else {
        botResponse(slackResponse.buildUserResponse(user));
      }
    });
  });
});

// listen for slash commands and respond with relevant data
controller.on('slash_command', function (bot, message) {
  function cleanMessage(text) {
    return text.replace(/[^0-9]/gi, "");
  }

  console.log("received slack_command", message);

  function botResponse(attachments) {
    // ensure we're working with an array
    if (!Array.isArray(attachments)) {
      attachments = [attachments];
    }
    bot.replyPublicDelayed(message, {
      // text: "Here's what we know about that",
      attachments: attachments,
    }, function(err,resp) {
      console.log(err,resp);
    });
  }

  switch (message.command) {
    case '/chuck':
      bot.replyAcknowledge();
      bot.replyPublicDelayed(message, {
        text: chuck.test()
      });
      break;
    case '/user':
      bot.replyPrivate(message, "Working on it");
      var id = cleanMessage(message.text);
      outdoorsy.pullUser(id, function(user) {
        botResponse(slackResponse.buildUserResponse(user));
      });
      break;
    case '/github':
      bot.replyPrivate(message, "Working on it");
      let [type, name] = message.text.split(/\s+/);

      github.getUser(type, name).then(user => {
        if (user.message && user.message == 'Not Found') {
          bot.replyPrivateDelayed(message, {text: "These are not the droids you are looking for"});
        } else {
          botResponse(slackResponse.buildGithubUserResponse(user));
        }
      });
      break;
    case '/bug':
      slackResponse.replyBugDialog(bot, message, {title: message.text});
      break;
  }
});

controller.on('message_action', function handler(bot, message) {
  var submission = message.raw_message;
  var callbackId = submission.callback_id;
  var description = submission.message.text;
  switch(callbackId) {
    case 'bug-report':
      slackResponse.replyBugDialog(bot, message, {description});
      break;
  }
});

controller.on('dialog_submission', function handler(bot, message) {
  var submission = message.submission;
  // call dialogOk or else Slack will think this is an error
  bot.dialogOk();
  // asana.createTask(process.env.ASANA_WORKBOARD, {
  requestBin.post({
    name: `[${submission.app}] [${submission.severity}] ${submission.title}`,
    notes: `${submission.description}\n\nSubmitted by ${message.raw_message.user.name} via Indoorsy Bot`
  }).then(function(response) {
    bot.reply(message, {text: `${response.data.name}: https://app.asana.com/0/${process.env.ASANA_WORKBOARD}/${response.data.id}`});
  }).catch(function() {
    bot.replyPrivate(message, {text: 'Unable to create your card!'});
  });
})

// receive an interactive message, and reply with a message that will replace the original
controller.on('interactive_message_callback', function(bot, message) {
  // check message.actions and message.callback_id to see what action to take...
  if (message.callback_id && /^rental_\d+_flagged$/.test(message.callback_id) && message.actions.length === 1) {
    let id = parseInt(message.callback_id.split('_')[1], 10);
    let text = message.original_message.attachments[0].text;
    let action = message.actions[0];

    if (action.value === 'approve') {
      let msg = `:white_check_mark: <@${message.user}> has approved this rental.`;

      bot.replyInteractive(message, {
        'attachments': [{
          'text': `${text}\n\n${msg}`,
          'color': 'good'
        }]
      });

    } else if (action.value === 'delete') {

      let msg = `:skull_and_crossbones: <@${message.user}> has deleted this rental.`;

      bot.replyInteractive(message, {
        'attachments': [{
          'text': `${text}\n\n${msg}`,
          'color': 'danger'
        }]
      });
    }
  }
});
