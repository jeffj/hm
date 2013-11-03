
module.exports = {
    production: {
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'Backbone Bulletin Board'
      },
      db: 'mongodb://localhost/hm',
      facebook: {
          clientID: "APP_ID"
        , clientSecret: "APP_SECRET"
        , callbackURL: "http://localhost:3000/auth/facebook/callback"
      },
      twitter: {
          clientID: "CONSUMER_KEY"
        , clientSecret: "CONSUMER_SECRET"
        , callbackURL: "http://localhost:3000/auth/twitter/callback"
      },
      github: {
          clientID: 'APP_ID'
        , clientSecret: 'APP_SECRET'
        , callbackURL: 'http://localhost:3000/auth/github/callback'
      },
      google: {
          clientID: "735546362819.apps.googleusercontent.com"
        , clientSecret: "VYWEm7uKRT6Tndl6CZBiIdir"
        , callbackURL: "http://localhost:3000/auth/google/callback"
      }
    }
  , test: {

    }
  , dev: {

    }
}
