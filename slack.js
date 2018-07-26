var moment = require("moment");
var outdoorsy = require("./outdoorsy");

var slack = {

  // build up the response for a rental object
  buildRentalResponse: function(rental) {
    var attachment = {
      title: "Rental: " + rental.name,
      title_link: "https://portal.outdoorsy.co/rentals/" + rental.id,
      image_url: outdoorsy.imageFormat(rental.primary_image_url, "listing"),
      thumb_url: outdoorsy.imageFormat(rental.primary_image_url, "thumbnail"),
      footer: "Indoorsy Bot v2",
      color: '#3498DB',
      fields: [],
    };

    attachment.fields.push({
      title: 'Owner',
      value: "#" + rental.owner.id + ": " + rental.owner.profile.first_name + " " + rental.owner.profile.last_name,
      short: false,
    });

    attachment.fields.push({
      title: 'Type',
      value: rental.type,
      short: true,
    });

    attachment.fields.push({
      title: 'Insurance Status',
      value: rental.insurance_state || "Not started",
      short: true,
    });

    return attachment;
  },

  buildUserResponse: function(user) {
    var attachment = {
      title: user.profile.first_name + " " + user.profile.last_name,
      title_link: "https://portal.outdoorsy.co/users/" + user.id,
      color: '#2C3E50',
      fields: [],
      image_url: user.profile.avatar_url
    };

    if (user.profile.social) {
      links = user.profile.social.map(function(entry) {
        return `${entry.site} - ${entry.link}`;
      });

      attachment.fields.push({
        title: 'Social Links',
        value: links.join('\n'),
        short: false,
      });
    }

    attachment.fields.push({
      title: 'Bio',
      value: user.profile.bio.description,
      short: false,
    });

    return attachment;
  },

  buildGithubUserResponse: function(user) {
    console.log(user);

    var attachment = {
      title: `Github Profile for ${user.name}`,
      title_link: user.html_url,
      color: '#2C3E50',
      fields: [],
      image_url: user.avatar_url
    };

    attachment.fields.push({
      title: 'Company',
      value: user.company || user.name,
      short: true,
    });
    if (user.email) {
      attachment.fields.push({
        title: 'Email',
        value: user.email,
        short: true,
      });
    }
    if (user.bio) {
      attachment.fields.push({
        title: 'Bio',
        value: user.bio,
        short: true,
      });
    }
    if (user.blog) {
      attachment.fields.push({
        title: 'Blog',
        value: user.blog,
        short: true,
      });
    }

    attachment.fields.push({
      title: 'Location',
      value: user.location,
      short: true,
    });
    attachment.fields.push({
      title: 'Public Repos',
      value: user.public_repos,
      short: true,
    });
    attachment.fields.push({
      title: 'Public Gists',
      value: user.public_gists,
      short: true,
    });
    attachment.fields.push({
      title: 'Followers',
      value: user.followers,
      short: true,
    });
    attachment.fields.push({
      title: 'Following',
      value: user.following,
      short: true,
    });

    return attachment;
  },

  replyBugDialog(bot, message, options = {}) {
    bot.replyAcknowledge();

    var dialog = bot.createDialog(
      'Submit a bug report',
      'bug-report',
      'Submit'
    ).addText('Title','title', options.title)
      .addSelect('Severity','severity','low',[
        {label: 'Low - Important but not urgent', value:'low'},
        {label: 'Medium - Important, semi urgent', value:'medium'},
        {label: 'High - Important, Urgent - money involved', value: 'high'},
        {label: 'Critical - Notifies on-call engineers - site down', value: 'critical'}
      ])
      .addSelect('App','app','outdoorsy',[
        {label: 'Outdoorsy',value:'outdoorsy'},
        {label:' Wheelbase',value:'wheelbase'},
        {label: 'Admin Portal', value: 'admin'},
        {label: 'iOS App', value: 'ios'},
        {label: 'Other', value: 'other'}
      ])
      .addTextarea('Description','description',options.description,{placeholder: 'Explain the bug here'});

    bot.replyWithDialog(message, dialog.asObject());
  }

};

module.exports = slack;
