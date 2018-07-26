var fs = require('fs');

module.exports = {
  list: [],

  test: function() {
    if (this.list.length === 0) {
      fs.readFileSync('jokes.txt').toString().split('\n').forEach((line) => {
        this.list.push(line);
      });
    }

    return this.list[Math.floor(Math.random()*this.list.length)];
  }
}
