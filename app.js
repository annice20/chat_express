const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./db');
const path = require("path");
const session = require("express-session");
const upload = require('./middlewares/upload');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
require('dayjs/locale/fr');

dayjs.extend(relativeTime);
dayjs.locale('fr');

const app = express();

app.locals.dayjs = dayjs;

const server = http.createServer(app);
const io = new Server(server);

// CONFIGURATION & MIDDLEWARES
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: "monsecret",
        resave: false,
        saveUninitialized: false,
    })
);

// LE PASSAGE DE IO AUX ROUTES
app.use((req, res, next) => {
    req.io = io;
    next();
});

// IMPORT DES ROUTES
const loginRouter = require('./routes/login');
const accueilRouter = require('./routes/accueil');
const userRouter = require('./routes/utilisateurs');
const notificationRouter = require('./routes/notifications');
const messageRouter = require('./routes/message');

app.use(loginRouter);
app.use(accueilRouter);
app.use(userRouter);
app.use(notificationRouter);
app.use(messageRouter);

// LOGIQUE SOCKET.IO CENTRALISÉE

io.on('connection', (socket) => {
    console.log('Nouvelle connexion socket:', socket.id);

    // Rejoindre une room privée basée sur l'ID utilisateur
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId.toString());
            console.log(`Utilisateur ${userId} a rejoint sa room privée`);
        }
    });

    // Gestion du chat (Privé)
    socket.on('chat message', async (data) => {
        const { sender, receiver, message_content } = data;
        try {
            await pool.execute(
                'INSERT INTO messages(sender, receiver, message_content, sent_at) VALUES(?, ?, ?, ?)',
                [sender, receiver, message_content, new Date()]
            );
            
            // On envoie le message uniquement aux deux personnes concernées
            io.to(receiver.toString()).to(sender.toString()).emit('chat message', {
                sender,
                receiver,
                message_content,
                sent_at: new Date()
            });
        } catch (err) {
            console.error("Erreur SQL Chat:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

app.post('/publier', upload.single('image_pub'), async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/');
        
        const { pseudo, photo } = req.session.user;
        const message = req.body.message;
        const imagePath = req.file ? 'uploads/' + req.file.filename : null;

        await pool.execute(
            'INSERT INTO Publication(user, contenu_pub, image_pub, date_pub, photo_user) VALUES(?, ?, ?, ?, ?)',
            [pseudo, message, imagePath, new Date(), photo]
        );
        res.redirect("/accueil");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la publication");
    }
});

// Route pour récupérer le nombre de notification
app.get('/notifications/count', async (req, res) => {
    if (!req.session.user) return res.json({ count: 0 });
    
    const userId = req.session.user.id;
    const [rows] = await pool.query(
        "SELECT COUNT(*) AS total FROM Notification WHERE receiver_id = ? AND est_lu = 0",
        [userId]
    );
    res.json({ count: rows[0].total });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});