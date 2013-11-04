var mongoose = require('mongoose')
    Schema = mongoose.Schema;
   postsSchema = new mongoose.Schema({
        title: { 'type': String, 'default': 'empty title...' }
       , url: { 'type': String, 'default': '' }
       , createdAt : {type : Date, default : Date.now}
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

module.exports = mongoose.model('Address', postsSchema);