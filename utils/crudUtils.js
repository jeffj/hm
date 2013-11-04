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
      mapReduceLists,
      mongoose = require('mongoose'),
      Parse = require('./parseUtils'),
      Address = mongoose.model('Address'),
      User = mongoose.model('User'),
      Mark = mongoose.model('Mark'),
      _ = require('underscore');

  //------------------------------
  // List
  //
  exports.getListController = function(model) {
    return function (req, res) {
      //console.log('list', req.body);
      model
        .find({})
        .populate("user", "username")
        .populate("addressObj")
        .sort("createdAt")
        .lean()
        .exec(function (err, result) {
        if (!err) {
          var json;
          json=parseResults(result, req.user); //adds a myPost key for the post the user ownes

          json=markFlattener(json);

          res.send(json);
        } else {
          res.send(errMsg(err));
        }
      });
    };
  }

  var markFlattener = function(json){
    return _.map(json, function(obj){ 
            obj.url=obj['addressObj'].url; 
            obj.url_title=obj['addressObj'].title 
            delete obj['addressObj']; 
            return obj;
    });
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


 var mapReduceLists=function(userId){
    var o = {};
    o.map = function () { emit(this.list, 1) }
    o.reduce = function (k, vals) { return vals.length }
    o.query={user:'5275c150ffe0a5572c000002'};

    Mark.mapReduce(o, function (err, results) {
      console.log(results)
      User.findOne({_id:userId})
      .exec(function(err, resultUser){

        resultUser.lists=results;
        resultUser.save();

      });
    
    });
 };

  //------------------------------
  // Create
  //
  exports.getCreateController=function(model) {
    return function (req, res) {
      var m = new model(req.body), address;
      m.user=req.user._id;
      m.original_url=req.body.url;

      var getCreateControllerActions = [
        function () {
            /* code for step 1 */
            getCreateControllerCallback();
        }, function () {
            /* code for step 2 */
            getCreateControllerCallback();
        }, function () {
            var canconical_url=Parse.canconicalURL(req.body.url);
            Address.findOne({url: canconical_url})
            .exec(function(err, addressResObj){

              if (addressResObj)
                m.addressObj=addressResObj._id, address=addressResObj;

              getCreateControllerCallback();
            });
        }, function(){
          if (!m.addressObj){
            Parse.parser(req.body.url, function(err, urlResObj){

              address = new Address({url:urlResObj.canonical_url, title: urlResObj.title });
              address.save(function(){
                m.addressObj = address;
                getCreateControllerCallback();
              });


            });
          }else{
            getCreateControllerCallback();            
          }
            /* code for step 5 */
        }, function () {
            getCreateControllerCallback();
        }, function () {

            m.save(function (err) {
              if (!err) {
                var sender=m.toJSON();
                sender.addressObj= address.toJSON();
                sender.user={username:req.user.username};
                sender=markFlattener([sender])[0];
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
            mapReduceLists(req.user._id)
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
  // exports.postid = function (req, res, next, id){  //param function for wildcard :id of url
  //   Post.load(id, function (err, post) {
  //     if (err) return next(err)
  //     if (!post) return next(new Error('Failed to load article ' + id))
  //     req.post = post
  //     next()
  //   })
  // }




}(exports));
