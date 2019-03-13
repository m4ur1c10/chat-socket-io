$(function () {
        
    var socket = io();
    var storage = window.localStorage;
    var username = storage.getItem("nickname");
    
    if (!username) {
      window.location.href = '/';
    } else {
      init();
    }

    function init() {

      socket.emit('user logged', username);
      
      $("#userLoggedText").text(username);          
      $("#msgBody").show();
      montaTelaUsers();

      $('#msgForm').submit(function(){
        socket.emit('chat message', {user: username, to: $("#usersOnline").val(), msg: $('#m').val()});
        $('#m').val('');
        return false;
      });

      $("#logout").on('click', function(e){
        e.preventDefault();
        socket.emit('user logout', username);
        storage.clear();
        window.location.reload();
      });
      
      socket.on('chat message', function(msg){          
        //var dataTexto = moment().fromNow();
        var dataTexto = '';
        var msgTo = msg.to == 'all' ? 'Todos' : msg.to;
        if (msg.user == $('#messages li.msgm:last-child p .user-send').text() 
              && msgTo == $('#messages li.msgm:last-child p .user-to').text() 
              && $('#messages li').length) {
          $('#messages li.msgm:last-child').append('<p>'+msg.msg+' <small>'+dataTexto+'</small></p>');
        } else {
          ultimo_enviado = false;
          $('#messages').append($('<li class="msgm">').html('<p><strong class="user-send">'+msg.user+'</strong> diz para <strong class="user-to">'+msgTo+'</strong>:</p><p>'+msg.msg+' <small>'+dataTexto+'</small></p>'));
        }
        window.scrollTo(0, document.body.scrollHeight);
      });

      socket.on('new user', function(user){
        $('#messages').append($('<li>').html('<p><strong>'+user+'</strong> entrou na sala</p>'));
        montaTelaUsers();
      });

      socket.on('user logout', function(user){
        $('#messages').append($('<li>').html('<p><strong>'+user+'</strong> saiu da sala</p>'));
        montaTelaUsers();
      });
    }

    function montaTelaUsers() {
      var usersHtml = '';
      var usersOption = '<option value="all">Todos</option>';
      $.get('/users', function(users){
        
        if (users.length) {
          $.each(users, function(index,user){
            if (user != username) {
              usersHtml += '<li>'+user+'</li>';
              usersOption += '<option value="'+user+'">'+user+'</option>';
            }
          });
        } else {
          usersHtml = '<li>Não ninguem no chat no momento.</li>';
        }
        $("#usersOnline").html(usersOption);
        $("#usersLogged ul").html(usersHtml);
      }, 'json');
    }

  });