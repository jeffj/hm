(function (exports) {
  "use strict";
  var mongoose = require('mongoose')
    , crudUtils = require('../utils/crudUtils')
    , Mark = mongoose.model('Mark')
    , users = require('../app/controller/users')
    , User = mongoose.model('User');

  function index(req, res) {
    res.render('index', { 
        'title': 'Hypermarks'
        , 'username':(req.user) ?  req.user.username: undefined
        , 'lists':(req.user) ?  req.user.lists: undefined
        , 'userid':(req.user) ?  req.user._id: undefined
      });
  }

  var idParse = function (req, res, next, id){  //param function for wildcard :id of url
    Mark.load(id, function (err, post) {
      if (err) return next(err)
      if (!post) return res.render('404',{title:'404',error: 'No Post'});
      req.post = post
      next()
    })

  }

  exports.init = function (app, auth, passport) {
    app.get('/',index);
    app.get('/login', users.login);
    app.get('/signup', users.signup);
    app.get('/logout', users.logout)
    app.post('/users', users.create)
 
    app.get('/auth/github', passport.authenticate('github', { failureRedirect: '/login' }), users.signin)
    app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), users.authCallback)
    app.get('/auth/twitter', passport.authenticate('twitter', { failureRedirect: '/login' }), users.signin)
    app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), users.authCallback)

    app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid email or password.'}), users.session)

    app.param('id', idParse);

    app.get('/api', crudUtils.getListController(Mark));
    app.get('/api/:id', crudUtils.getReadController(Mark));
    app.post('/api', auth.requiresLogin, crudUtils.getCreateController(Mark));
    app.put('/api/:id', auth.requiresLogin, auth.post.hasAuthorization, crudUtils.getUpdateController(Mark));
    app.del('/api/:id', auth.requiresLogin, auth.post.hasAuthorization, crudUtils.getDeleteController(Mark));

  };



}(exports));