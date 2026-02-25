const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/amis/:id', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const notifId = req.params.id;

        await pool.query("INSERT INTO Amis(user_id, id_notif) VALUES(?, ?)",
            [userId, notifId]
        );

        await pool.query("INSERT INTO Notification(sender_id, receiver_id, contenu_notif, statut, date_envoi) VALUES(?, ?, ?, ?, ?)",
            [notifId ,userId, 'Votre invitation a été accepté', 1, new Date()]
        );
        
        req.io.to(userId.toString()).emit('new-notification');
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

module.exports = router;