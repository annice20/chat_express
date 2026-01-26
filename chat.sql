CREATE TABLE Users(
    user_id int(11) NOT NULL AUTO_INCREMENT,
    firstname varchar(80) NOT NULL,
    lastname varchar(80) NOT NULL,
    pseudo varchar(100) NOT NULL,
    email varchar(30) NOT NULL,
    password varchar(30) NOT NULL,
    phone_number varchar(10),
    photo varchar(255) DEFAULT NULL,
    PRIMARY KEY(user_id)
);

INSERT INTO Users VALUES(1, "Bob", "RAKOTONIRINA", "bob12", "bob@gmail.com", "salut", "349646745", NULL);
INSERT INTO Users VALUES(2, 'Anja', 'MIRANA', 'anja', 'anja@gmail.com', 'anja', '380649004', NULL);
INSERT INTO Users VALUES(3, 'Marinah', 'ONITIANA', 'Hello World', 'marinah@gmail.com', 'world', '381609974', NULL);

CREATE TABLE Publication(
    id_publication int(11) NOT NULL AUTO_INCREMENT,
    user varchar(100) NOT NULL,
    contenu_pub text,
    image_pub varchar(255) DEFAULT NULL,
    date_pub datetime NOT NULL,
    photo_user varchar(255) DEFAULT NULL,
    PRIMARY KEY(id_publication)
);

CREATE TABLE Notification(
    id_notif int(11) NOT NULL AUTO_INCREMENT,
    sender_id int(11) NOT NULL,
    receiver_id int(11) NOT NULL,
    contenu_notif text,
    statut int(11) DEFAULT 0,
    est_lu int(11) DEFAULT 0,
    date_envoi datetime NOT NULL,
    PRIMARY KEY(id_notif),
    FOREIGN KEY(sender_id) REFERENCES Users(user_id),
    FOREIGN KEY(receiver_id) REFERENCES Users(user_id)
);

CREATE OR REPLACE VIEW V_notification AS
SELECT
    n.id_notif,
    n.sender_id,
    n.receiver_id,
    u.photo,
    u.pseudo,
    n.contenu_notif,
    n.statut,
    n.est_lu,
    n.date_envoi
FROM Notification n
JOIN Users u ON u.user_id = n.sender_id;

CREATE TABLE Messages(
    message_id int(11) NOT NULL AUTO_INCREMENT,
    sender text NOT NULL,
    receiver int(11) NOT NULL,
    PRIMARY KEY(message_id),
    FOREIGN KEY(receiver) REFERENCES Users(user_id)
);
