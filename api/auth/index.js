import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import serverless from "serverless-http";

const app = express();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI
}, (accessToken, refreshToken, profile, done) => {
    return done(null, { profile, accessToken, refreshToken });
}));

app.use(passport.initialize());

app.get("/", (req, res) => {
    res.send(`<a href="/auth/google">Login with Google</a>`);
});

app.get("/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/api/auth/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/profile");
    }
);

app.get("/api/profile", (req, res) => {
    if (!req.user) return res.redirect("/");
    res.send(`
        <h1>Hello ${req.user.displayName}!</h1>
        <p>Email: ${req.user.emails?.[0]?.value}</p>
        <a href="/logout">Logout</a>
    `);
});

app.use((req, res) => res.status(404).send("Not Found"));

export const handler = serverless(app);