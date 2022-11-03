const { application } = require('express');
const express = require('express');
require("dotenv").config();
const app = express();

const jwt = require('jsonwebtoken');

app.use(express.json());

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" })
}

const posts = [
    {
        username: "Mg Mg",
        title: "NodeJs"
    },
    {
        username: "David",
        title: "AngularJs"
    },
    {
        username: "Sue",
        title: "ReactJs"
    },
    {
        username: "Kyaw Kyaw",
        title: "MongoDB"
    }
];

let refreshTokens = [];

app.post("/token", (req, res) => {
    const refreshToken  = req.body.token;

    if(refreshToken == null) return res.sendStatus(401);

    if(refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        const accessToken = generateAccessToken({ name: user.name });

        res.json({ accessToken: accessToken });
    })
})

app.get("/posts", (req,res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

app.post("/login", (req, res) => {
    const username = req.body.username;
    const user = { name : username };

    const accessToken  = generateAccessToken(user);

    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

    refreshTokens.push(refreshToken);

    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
})

app.listen(4000);