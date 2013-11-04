(function (exports) {
  "use strict";

var httpParse = require('http')
   ,httpsParse = require('https')
   ,jsdom = require('jsdom')
   ,request = require('request'),//require('/Users/sirpunchallot/Downloads/request-2.20.1/'),
   canconicalURL,
   parseURI;


exports.parser=function(url, cb){

  var parsed=parseURI(url), parsedURL, canonical_url= canconicalURL(url);


  urlRequest(url, function(err, response, header){

    textScape(response, function(err, window){

      var title, favicon,titleJq;
      titleJq=window.$("title").text(), title= ( titleJq )? titleJq: parsed.authority+parsed.path;
      favicon=window.$("[rel='shortcut icon']").attr("href");
      if (typeof favicon!= "string") { 
        favicon=url.split("/")[0]+"//"+url.split("/")[2]+"/favicon.ico"  
      }
      if( favicon.slice(0, 1)=="/")
      favicon=parsed.protocol+"://"+parsed.domain+favicon;


      urlRequest(favicon, function(err, responseFavi, headerFavi){

        if ( headerFavi && headerFavi["content-length"]  && Number(headerFavi["content-length"])>0 ){
          //do nothing the favicon is good
        }else
          favicon=null;

        cb(null, {favicon:favicon, title:title, parsed_uri: parsed, canonical_url: canonical_url});


      });

    })
    
  })


}


var urlRequest=function(url, callback){

  request(url, function (error, response, body) {

    if (!error && (response.statusCode == 200 || response.statusCode == 304) ) {

    callback(null, body, response.headers)


    }else{
      callback(null, null, response.headers)

    }
  });


}



var textScape=function(html, callback){
    jsdom.env(
      (typeof html=="string")? html:"<body>",
      ["http://code.jquery.com/jquery.js"],
      function(errors, window) {
        window.$("script").remove();
        callback(null, window)
      }
    );
};



canconicalURL=exports.canconicalURL=function(url){ var parsed=parseURI(url); return parsed.domain+parsed.path.replace(/\/$/g, '');}

parseURI=function(sourceUri){
    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"],
      uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri),
      uri = {};
    
    for(var i = 0; i < 10; i++){
      uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }
    
    /* Always end directoryPath with a trailing backslash if a path was present in the source URI
    Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key */
    if(uri.directoryPath.length > 0){
      uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }
    
    return uri;
  };


}(exports));



