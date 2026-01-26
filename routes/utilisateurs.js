var express = require('express');
var router = express.Router();
const pool = require('../db');

router.get('/utilisateurs', async (req, res) => {
    try {
        if(!req.session.user)
        {
            return res.redirect('/');
        }

        const [users] = await pool.query("SELECT * FROM Users WHERE pseudo != ?", [req.session.user.pseudo]);

        const [notifications] = await pool.query("SELECT * FROM V_notification WHERE receiver_id = ? ORDER BY date_envoi DESC", [req.session.user.id]);

        res.render('utilisateurs', {
            user: req.session.user,
            users: users,
            notifications: notifications
        });
    } catch(err) {
        console.log(err);
    }
});

module.exports = router;