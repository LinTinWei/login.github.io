const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

// /auth/login
router.get("/login", (req, res) => {
    return res.render("login", {user: req.user});
});

// /auth/logout
router.get("/logout", (req, res) => {
    req.logOut((err) => {
        if(err) return res.send(err);
        return res.redirect("/");
    });
});

// signup
router.get("/signup", (req, res) => {
    return res.render("signup", {user: req.user});
});

// /auth/google 若到此，則需要用 google strategy(建一 config folder and new passport.js)
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
    })
);

router.post("/signup", async (req, res) => {
    let {name, email, password} = req.body;
    if(password.length < 8){
        req.flash("error_msg", "密碼長度過短，至少需要8個數字或英文字。");
        return res.redirect("/auth/signup");
    }
    // 確認信箱是否被註冊過
    const foundEmail = await User.findOne({email}).exec();
    if(foundEmail){
        req.flash("error_msg", "信箱已經被註冊過，請使用另一個信箱或者利用此信箱登入系統。");
        return res.redirect("/auth/signup");
    };
    
    let hashPassword = await bcrypt.hash(password, 12);
    let newUser = new User({name, email, password: hashPassword});
    await newUser.save();
    req.flash("success_msg", "恭喜註冊成功，現在可以登入系統");
    return res.redirect("/auth/login");
});

router.post(
    "/login",
    passport.authenticate("local",{
        failureRedirect: "/auth/login",
        failureFlash: "登入失敗。帳號或密碼不正確。",
    }),
    (req, res) => {
        return res.redirect("/profile");
    }
);

// redirect auth/google/redirect
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
    console.log("進入redirect區域");
    return res.redirect("/profile");
});

module.exports = router;
