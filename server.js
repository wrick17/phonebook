var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/phonebook.json', function(req, res) {
  fs.readFile('phonebook.json', function(err, data) {
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(data));
  });
});

app.post('/phonebook.json', function(req, res) {
  fs.readFile('phonebook.json', function(err, data) {
    var contacts = JSON.parse(data);
    contacts.push(req.body);
    fs.writeFile('phonebook.json', JSON.stringify(contacts, null, 4), function(err) {
      res.setHeader('Cache-Control', 'no-cache');
      res.json(contacts);
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
