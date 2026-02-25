const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/notification/:id', async (req, res) => {
    try {
        const senderId = req.session.user.id;
        const receiverId = req.params.id;

        await pool.query("INSERT INTO Notification(sender_id, receiver_id, contenu_notif, date_envoi) VALUES(?, ?, ?, ?)",
            [senderId ,receiverId, `${req.session.user.pseudo} vous a envoyé une invitation`, new Date()]
        );

        // notifier en temps réel
        req.io.to(receiverId.toString()).emit('new-notification');
        res.json({ success: true });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;