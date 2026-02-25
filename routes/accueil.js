var express = require('express');
var router = express.Router();
const pool = require('../db');

router.get('/accueil', async (req, res) => {
    try{
        if(!req.session.user)
        {
            return res.redirect('/');
        }

        const [publications] = await pool.query("SELECT * FROM Publication");

        const [notifications] = await pool.query("SELECT * FROM V_notification WHERE receiver_id = ? ORDER BY date_envoi DESC", [req.session.user.id]);

        const [friends] = await pool.query(
            "SELECT friend_id FROM Amis WHERE user_id = ?",
            [req.session.user.id]
        );

        res.render('accueil', {
            user: req.session.user,
            publications: publications,
            notifications: notifications,
            friends: friends.map(f => f.friend_id)
        });
    } catch(err){
        console.log(err);
    }
});

module.exports = router;