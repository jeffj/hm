$(function ($, _, Backbone) {

  "use strict";

  var Post, PostList, Posts, PostView, AppView, App;

  // Post Model
  // ----------

  Post = Backbone.Model.extend({

    // MongoDB uses _id as default primary key
    idAttribute: "_id",

    // Default attributes for the post item.
    defaults: function () {
      return {
        title: "Pending..."
        , url: ""
      };
    },

    // Ensure that each post created has `title`.
    initialize: function () {
      if (!this.get("url")) {
        this.set({"url": this.defaults.title});
      }
    },
    // timeago:function(){
    // },
    // Remove this post and delete its view.
    clear: function () {
      this.destroy();
    }
  });

  // Posts Collection
  // ---------------

  PostList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Post,
    // Note that url may also be defined as a function.
    url: function () {
      return "/api" + ((this.id) ? '/' + this.id : '');
    },
  });

  // Create our global collection of **Post**.
  Posts = new PostList();

  // Post Item View
  // --------------

  // The DOM element for a post item...
  PostView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
       "click .edit"  : "edit",
       "click a.destroy" : "clear",
        "click .submit-update"  : "update",
    },

    // The View listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Post** and a **PostView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function () {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    // Re-render the titles of the post item.
    render: function () {
      var JSON=this.model.toJSON()
      JSON.timeAgo= this.model.get("createdAt")? $.timeago(this.model.get("createdAt")):"";
      this.$el.html(this.template(JSON));
      this.input = this.$('.edit');
      this.bodyEdit = this.$(".body-edit")
      this.titleEdit = this.$(".title-edit")
      return this;
    },

    // If you hit `enter`, we're through editing the item.
    update: function (e) {
        var valuetitle = this.titleEdit.val().trim();
        if(valuetitle) {
          this.model.save({title: valuetitle});
        }
        this.$el.removeClass('editing');
      // if (e.keyCode === 13) {
      //   this.close();
      // }
    },
    // Remove the item, destroy the model.
    clear: function () {
      this.model.clear();
    },
    edit:function () {
      this.$el.addClass("editing")
      this.titleEdit.val(this.model.get("title"));
      this.bodyEdit.val(this.model.get("body"))
    },

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#app"),
    // Our template for the line of statistics at the bottom of the app.

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-mark-url":  "createOnEnter",
     // "click #clear-completed": "clearCompleted",
      //"click #toggle-all": "toggleAllComplete"
      "click .submit"  : "create"

    },

    // At initialization we bind to the relevant events on the `Post`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting post.
    initialize: function () {
      this.inputURL = this.$("#new-mark-url");
      Posts.bind('add', this.addOne, this);
      Posts.bind('reset', this.addAll, this);
      Posts.bind('all', this.render, this);
      //this.footer = this.$('footer');
      this.main = $('#main');

      Posts.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function () {
      if (Posts.length) {
        this.main.show();
        //this.footer.show();
      } else {
        this.main.hide();
      }
    },

    // Add a single post item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function (post) {
      var view = new PostView({model: post});
      $("#list").prepend(view.render().el);
    },

    // Add all items in the **Posts** collection at once.
    addAll: function () {
      Posts.each(this.addOne);
    },

    // If you hit return in the main input field, create new **Post** model
    createOnEnter: function (e) {
      if (e.keyCode !== 13) { return; }
      if (!this.inputURL.val()) { return; }
      create();
    },
    create:function(){
      Posts.create({
        url: this.inputURL.val(),
        myPost:true,
        user: {username:username}

      });
      this.inputURL.val('');
    }
    // toggleAllComplete: function () {
    //   var done = this.allCheckbox.checked;
    //   Posts.each(function (post) { post.save({'done': done}); });
    // }

  });

  // Finally, we kick things off by creating the **App**.
  App = new AppView();

}(jQuery, _, Backbone));