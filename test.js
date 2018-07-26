var outdoorsy = require("./outdoorsy");
var chuck = require("./chuck");

outdoorsy.pullUser(3, function(user) {
  // console.log("email", user.profile.email);
  console.log("name", user.profile.first_name, user.profile.last_name, user.profile.avatar_url);
});

console.log(chuck.test());
console.log(chuck.test());
