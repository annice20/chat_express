var express = require('express');
var router = express.Router();
const pool = require('../db');

router.get('/', function(req, res) {
    res.render("login")
});

// login
router.post("/login", async (req, res) => {
    const { pseudo, password } = req.body;

    try{
        const [results] = await pool.query(
            "SELECT * FROM Users WHERE pseudo = ? AND password = ?", 
            [pseudo, password]
        );

        if(results.length === 0) {
            return res.send("Pseudo/Mot de passe incorrect")
        }

        const user = results[0];
        
        req.session.user = {
            id: user.user_id,
            pseudo: user.pseudo,
            photo: user.photo
        }
        
        res.redirect("/accueil");
    } catch(err) {
        console.log(err);
    }
});

module.exports = router;
