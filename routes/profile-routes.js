const router = require("express").Router();
const passport = require("passport");
const Post = require("../models/post-model");

const authCheck = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }else{
        return res.redirect("auth/login");
    }
};

router.get("/", authCheck, async (req, res) => {
    // console.log("進入/profile");
    let postFound = await Post.find({auther: req.user._id});
    return res.render("profile", {user: req.user, posts: postFound}); // deSerializeUser()
});


// 製作 post 的 route
router.get("/post", authCheck, (req, res) => {
    return res.render("post", { user: req.user});
})

// post route 提交內容
router.post("/post", authCheck, async (req, res) => {
    let {title, content} = req.body;
    let newPost = new Post({title, content, auther: req.user._id});
    try{
        await newPost.save();
        return res.redirect("/profile");
    }catch(e){
        req.flash("error_msg", "標題與內容都需要填寫。");
        return res.redirect("/profile/post");
    }
});

module.exports = router;