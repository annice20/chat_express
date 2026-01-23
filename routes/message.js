var express = require('express');
var router = express.Router();
const pool = require('../db');

router.get('/message', function(req, res) {
    if(!req.session.user)
    {
        return res.redirect("/");
    }
    res.render("message", {
        user: req.session.user
    });
});

module.exports = router;
