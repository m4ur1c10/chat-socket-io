var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = [];

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/nickname.html');
});

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/users', function(req, res){
  res.set("Content-type", "application/json");  
  res.send(JSON.stringify(users));
});

io.on('connection', function(socket){
  socket.on('user logged', function(user){
    users.push(user);
    io.emit('new user', user);
  });
  socket.on('user logout', function(user){
    users = users.filter(function(user_){
      if (user_ != user) {
        return user_;
      }
    });
    io.emit('user logout', user);
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
