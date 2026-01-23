const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./db');
const path = require("path");
const session = require("express-session");
const upload = require('./middlewares/upload');
var router = express.Router();

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const loginRouter = require('./routes/login');
const accueilRouter = require('./routes/accueil');
const userRouter = require('./routes/utilisateurs');
const notificationRouter = require('./routes/notifications');
const messageRouter = require('./routes/message');

app.use(
    session({
        secret: "monsecret",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(loginRouter);
app.use(accueilRouter);
app.use(userRouter);
app.use(notificationRouter);
app.use(messageRouter);


// Ajout publication
app.post('/publier', upload.single('image_pub'), async (req, res) => {
    try{
        if(!req.session.user)
        {
            return res.redirect('/');
        }
        const pseudo = req.session.user.pseudo;
        const photo = req.session.user.photo;
        const message = req.body.message;

        // Image optionnelle
        const imagePath = req.file
            ? 'uploads/' + req.file.filename
            : null;

        await pool.execute('INSERT INTO Publication(user, contenu_pub, image_pub, date_pub, photo_user) VALUES(?, ?, ?, ?, ?)',
            [pseudo, message, imagePath, new Date(), photo]
        );
        res.redirect("/accueil");
    } catch(err) {
        console.log(err);
    }
});

// compter les notifications non lues
app.get('/notifications/count', async (req, res) => {
    const userId = req.session.user.id;

    const [rows] = await pool.query(
        "SELECT COUNT(*) AS total FROM Notification WHERE receiver_id = ? AND est_lu = 0",
        [userId]
    );

    res.json({ count: rows[0].total });
});

io.on('connection', (socket) => {
    socket.on('chat message', async (data) => {
        const { sender, receiver, message_content } = data;

        await pool.execute('INSERT INTO messages(sender, receiver, message_content, sent_at) VALUES(?, ?, ?, ?)',
            [sender, receiver, message_content, new Date()]
        );
        
        io.emit('chat message', {
            sender,
            receiver,
            message_content,
            sent_at: new Date()
        });
    });
});

server.listen(3000, () => {
    console.log(`server is running on port http://localhost:${server.address().port}`);
});
