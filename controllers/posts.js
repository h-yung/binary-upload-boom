const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { postLogin } = require("./auth");
const e = require("express");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getOtherUserProfile: async (req, res) => {
    if (req.params.userid === req.user.id){
      //go to main profile if own user
      try {
        const posts = await Post.find({ user: req.user.id });
        res.render("profile.ejs", { posts: posts, user: req.user });
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const person = await User.findById(req.params.userid)
        const posts = await Post.find({ user: req.params.userid });
        res.render("profileOther.ejs", { posts: posts, user: person }); //user is not passing for some reason
      } catch (err) {
        console.log(err);
      }
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }) 
      //.lean() strips down some extras but also meant the conditional for usersWhoLiked below did not work. So removed here. 
      
      //tacking on a like boolean outside the db
      for (const post of posts){
        if (post.usersWhoLiked.includes(req.user.id)){
          post.likedByViewer = true;
        }
        //below not working - why this one continues to fail is unknown
        // let chosenPost = await Post.findOne({_id: req.params.id, usersWhoLiked: req.user.id })
        // console.log(`chosen post: ${chosenPost}`)
      }
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const author = await User.findById(post.user);
      const comments = await Comment.find({post: req.params.id}).sort({ createdAt: "desc" })
      // .lean();
      //got rid of lean again bc I need the likedByViewer logic to work

      //prob not the most efficient approach
      //essentially tacking on the username outside the db
      //including likes
      for (const comment of comments){
        const writer = await User.findById(comment.user);
        comment.writer = writer.userName;
        if (comment.usersWhoLiked.includes(req.user.id)){
          comment.likedByViewer = true;
        }
      }

      //if req.user has liked this post, return a mark
      const likedByViewer = post.usersWhoLiked.includes(req.user.id)
      //returns a boolean

      res.render("post.ejs", { 
        post: post, 
        author: author,
        user: req.user, 
        likedByViewer,
        comments: comments 
      });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
        usersWhoLiked: [] //needs a default, else disaster
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePostFromFeed: async (req, res) => {
  //essentially the same as likePost but redirects back to feed
    try {
      //check if userid is in the array for that post, = already liked it
      let chosenPost = await Post.findOne(
        {_id: req.params.id, usersWhoLiked: req.user.id });
      if (chosenPost){
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pullAll: { 'usersWhoLiked': [req.user.id] } 
          }
        );
        console.log("Likes-1 and user from array");
        
      } else {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $addToSet: { 'usersWhoLiked': req.user.id } 
          }
        );
        console.log("Likes +1");
      }
      res.redirect(`/feed`);

    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      //check if userid is in the array for that post, = already liked it
      let chosenPost = await Post.findOne(
        {_id: req.params.id, usersWhoLiked: req.user.id });
      if (chosenPost){
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pullAll: { 'usersWhoLiked': [req.user.id] } 
          }
        );
        console.log("Likes-1 and user from array");
        
      } else {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $addToSet: { 'usersWhoLiked': req.user.id } 
          }
        );
        console.log("Likes +1");
      }
      res.redirect(`/post/${req.params.id}`);

    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id - the following checks that it exists
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
