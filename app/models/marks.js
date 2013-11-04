var mongoose = require('mongoose')
    Schema = mongoose.Schema;
   postsSchema = new mongoose.Schema({
        title: { 'type': String,}
       , createdAt : {type : Date, default : Date.now}
       , user  : { type : Schema.ObjectId, ref : 'User' }
       , addressObj : { type : Schema.ObjectId, ref : 'Address' }
       , original_url: { 'type': String }
       , list: { 'type': String, default : "" }
  });

   postsSchema.statics = {
  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api public
   */
  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'username')
      .exec(cb)
  }
}

module.exports = mongoose.model('Mark', postsSchema);