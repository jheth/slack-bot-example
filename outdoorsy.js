var fetch = require('node-fetch');
var URI = require('urijs');

// private
var outdoorsyBase = "https://api.outdoorsy.co";
var outdoorsyVersion = "v0";

var fetchRental = function(id) {
  return fetch(`${outdoorsyBase}/${outdoorsyVersion}/rentals/${id}`)
    .then(function(res) {
      return res.json();
    });
};

var fetchUser = function(id) {
  return fetch(`${outdoorsyBase}/${outdoorsyVersion}/users/${id}`)
    .then(function(res) {
      return res.json();
    });
};

// public functions

var outdoorsy = {
  extractItems: function(text) {
    console.log('extracting', text);
    var re = /(rentals?|users?|bookings?)\/(\d+)/gi
    var matches = text.match(re)
    var data = {
      bookings: [],
      users: [],
      rentals: []
    };

    if (!matches) {
      return data;
    }

    matches.forEach(function(item) {
      var splitItem = item.split('/');
      var type = splitItem[0].toLowerCase();
      var id = splitItem[1];
      // make sure we have the plural version
      if (!type.match(/s$/gi)) {
        type = type + "s";
      }

      if (data[type]) {
        data[type].push(id);
      }
    });

    return data;
  },

  pullUser: function(id, cb) {
    fetchUser(id).then(function(json) {
  		cb(json);
  	});
  },

  pullRental: function(id, cb) {
    fetchRental(id).then(function(rental) {
      fetchUser(rental.owner_id).then(function(owner) {
        rental.owner = owner;
        cb(rental);
      });
  	});
  },

  imageFormat: function(url, size) {
    size = size || "normal";
    var base = ["a_exif", "q_auto", "f_auto", "w_auto"];

    switch (size) {
      case "tinyThumbnail":
        base.push("h_50", "w_50");
        break;
      case "thumbnail":
        base.push("h_300", "w_300");
        break;
      case "listing":
        base.push("h_300", "w_450");
        break;
      case "featured":
        base.push("h_600", "w_900");
        break;
      case "social":
        base.push("h_630", "w_1200");
        break;
    }
    url = url.replace("/outdoorsy/image/upload", "/outdoorsy/image/upload/" + (base.join(",")));
    return url;
  }

};
module.exports = outdoorsy;
