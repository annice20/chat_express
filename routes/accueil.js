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

        res.render('accueil', {
            user: req.session.user,
            publications: publications
        });
    } catch(err){
        console.log(err);
    }
});

module.exports = router;