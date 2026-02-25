const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/amis/:id', async (req, res) => {
    try {
        const userId = req.session.user.id; // celui qui accepte
        const notifId = req.params.id;

        // Vérifier notification
        const [rows] = await pool.query(
            "SELECT * FROM Notification WHERE id_notif = ? AND receiver_id = ? AND statut = 0",
            [notifId, userId]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Invitation invalide" });
        }

        const notification = rows[0];
        const friendId = notification.sender_id;

        // Mettre à jour statut
        await pool.query(
            "UPDATE Notification SET statut = 1, est_lu = 1 WHERE id_notif = ?",
            [notifId]
        );

        // Ajouter relation bidirectionnelle
        await pool.query(
            "INSERT INTO Amis(user_id, friend_id) VALUES (?, ?), (?, ?)",
            [
                userId, friendId,
                friendId, userId
            ]
        );

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;