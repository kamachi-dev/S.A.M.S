import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import serverless from "serverless-http";
import jwt from "jsonwebtoken";
import cookie from "cookie";

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
    res.send(`<a href="/auth">Login with Google</a>`);
});

function signJwt(user) {
    return jwt.sign(
        {
            displayName: user.profile.displayName,
            emails: user.profile.emails,
            id: user.profile.id
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

function authenticateJwt(req, res, next) {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token;
    if (!token) return res.redirect("/");
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.redirect("/");
    }
}

app.get("/api/auth",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

app.get("/api/auth/callback",
    passport.authenticate("google", { failureRedirect: "/", session: false }),
    (req, res) => {
        // Issue JWT cookie
        const token = signJwt(req.user);
        res.setHeader("Set-Cookie", cookie.serialize("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 // 1 hour
        }));
        res.redirect("/api/profile");
    }
);

// Profile route now protected by JWT
app.get("/api/profile", authenticateJwt, (req, res) => {
    res.send(`
        <h1>Hello ${req.user.displayName}!</h1>
        <p>Email: ${req.user.emails?.[0]?.value}</p>
        <a href="/api/logout">Logout</a>
    `);
});

// Logout: clear JWT cookie
app.get("/api/logout", (req, res) => {
    res.setHeader("Set-Cookie", cookie.serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(0)
    }));
    res.redirect("/");
});

app.use((req, res) => res.status(404).send("Not Found"));

export const handler = serverless(app);