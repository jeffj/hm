(function (exports) {
  "use strict";
  var mongoose = require('mongoose')
    , crudUtils = require('../utils/crudUtils')
    , post = mongoose.model('Post')
    , users = require('../app/controller/users')

  function index(req, res) {
    res.render('index', { 
        'title': 'Bulletin Board Demo'
        , 'username':(req.user) ?  req.user.username: undefined
        , 'userid':(req.user) ?  req.user._id: undefined
      });
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
    
   // console.log(app);
   // crudUtils.initRoutesForModel({ 'app': app, 'model': post, auth: auth });

    app.param('id', crudUtils.idParse);

    app.get('/api', crudUtils.getListController(post));
    app.get('/api/:id', crudUtils.getReadController(post));
    app.post('/api', auth.requiresLogin, crudUtils.getCreateController(post));
    app.put('/api/:id', auth.requiresLogin, auth.post.hasAuthorization, crudUtils.getUpdateController(post));
    app.del('/api/:id', auth.requiresLogin, auth.post.hasAuthorization, crudUtils.getDeleteController(post));
    // app.param('id', postid)

  };

  // exports.initRoutesForModel = function (options) {
  //   var app = options.app,
  //     model = options.model,
  //     auth= options.auth,
  //     path,
  //     pathWithId;

  //   if (!app || !model) {
  //     return;
  //   }

  //   path = options.path || '/' + model.modelName.toLowerCase();
  //   pathWithId = path + '/:id';
  //   app.get(path, getListController(model));
  //   app.get(pathWithId, getReadController(model));
  //   app.post(path, auth.requiresLogin, getCreateController(model));
  //   app.put(pathWithId, auth.requiresLogin, auth.post.hasAuthorization, getUpdateController(model));
  //   app.del(pathWithId, auth.requiresLogin, auth.post.hasAuthorization, getDeleteController(model));
  //   app.param('id', postid)
  // };

}(exports));