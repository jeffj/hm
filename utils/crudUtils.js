/**
 * Very basic CRUD route creation utility for models.
 * For validation, simply override the model's save method.
 */

(function (exports) {
  "use strict";
  function errMsg(msg) {
    return {'error': {'message': msg.toString()}};
  }
  var parseResults,
      mongoose = require('mongoose'),
      Post = mongoose.model('Post'),
      Parse = require('./parseUtils');

  //------------------------------
  // List
  //
  exports.getListController = function(model) {
    return function (req, res) {
      //console.log('list', req.body);
      model
        .find({})
        .populate("user", "username")
        .sort("createdAt")
        .lean()
        .exec(function (err, result) {
        if (!err) {
          var json;
          json=parseResults(result, req.user); //adds a myPost key for the post the user ownes
          res.send(json);
        } else {
          res.send(errMsg(err));
        }
      });
    };
  }

  parseResults = function(result, user){ //Check if the logged in user is the author.
  var id;
  if (user) id=user._id; //setting the id if it exists;
   for (var i = result.length - 1; i >= 0; i--) { //check if the id matches the user.
      if(String(id)==result[i].user || String(id)==result[i].user._id)
        result[i].myPost=true;
      else
        result[i].myPost=false;
    };
    return result
  }
  //------------------------------
  // Create
  //
  exports.getCreateController=function(model) {
    return function (req, res) {
      var m = new model(req.body);
      m.user=req.user._id;

      var getCreateControllerActions = [
        function () {
            /* code for step 1 */
            getCreateControllerCallback();
        }, function () {
            /* code for step 2 */
            getCreateControllerCallback();
        }, function () {
            /* code for step 3 */
            getCreateControllerCallback();
        }, function () {
            /* code for step 4 */
            getCreateControllerCallback();
        }, function(){

            Parse.parser(m.title, function(err, urlResObj){

            m.title=urlResObj.title;

            getCreateControllerCallback();

            });
            /* code for step 5 */
        }, function () {

            m.save(function (err) {
              if (!err) {
                var sender=m.toJSON()
                sender.user={username:req.user.username};
                res.send(sender);
              } else {
                res.send(errMsg(err));
              }
            });
        }
      ];
        /* Define Loop and Kick it off */
        var getCreateControllerCallback = function() {
            if (getCreateControllerActions.length) {
                getCreateControllerActions.shift()();
            } else {
                //console.log("Done");
            }
        };
        getCreateControllerCallback();

  }  


   
  };










 


  //------------------------------
  // Read
  //
   exports.getReadController=function(model) {
    return function (req, res) {

      //console.log(req.post);

      
      // model.findById(req.params.id, function (err, result) {
        if (req.post) {
          res.send(req.post);
        } else {
          res.render('404',{title:'404',error: 'No Post'});
        }
      // });
    };
  }

  //------------------------------
  // Update
  //
  exports.getUpdateController=function(model) {
    return function (req, res) {
        var result=req.post, key;
        for (key in req.body) { //Update the keys
          if ("user"!=key)  //ignore the user key
          result[key] = req.body[key];
        }
        result.save(function (err) {
          if (!err) {
            var sender=result.toObject()
            if (req.user.username) sender.user={username:req.user.username};
            res.send(sender);
          } else {
            res.send(errMsg(err));
          }
        });
    };
  }
  //------------------------------
  // Delete
  //
  exports.getDeleteController = function (model) {
    return function (req, res) {
          var result=req.post;
          result.remove();
          result.save(function (err) {
            if (!err) {
              res.send({});
            } else {
              res.send(errMsg(err));
            }
          });
    };
  }
  exports.postid = function (req, res, next, id){  //param function for wildcard :id of url
    Post.load(id, function (err, post) {
      if (err) return next(err)
      if (!post) return next(new Error('Failed to load article ' + id))
      req.post = post
      next()
    })
  }

  exports.idParse = function (req, res, next, id){  //param function for wildcard :id of url
    Post.load(id, function (err, post) {
      if (err) return next(err)
      if (!post) return res.render('404',{title:'404',error: 'No Post'});
      req.post = post
      next()
    })

  }


}(exports));
