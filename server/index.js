const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const appRouter = require("./routes/app");
const authRouter = require("./routes/auth");
const dataRouter = require("./routes/data");
const sheetsRouter = require("./routes/sheets");
const viewRouter = require("./routes/view");

const { OAuthObjectStore } = require("./classes/googleOAuthHandler");
const { main } = require("./misc/test");

dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);
app.use(cookieParser());

app.use("/app/", appRouter);
app.use("/auth/", authRouter);
app.use("/data/", dataRouter);
app.use("/sheets/", sheetsRouter);
app.use("/view/", viewRouter);

let logger = function (req, res, next) {
    console.log(req);
    next();
};

const db = require("./db");
db.on("error", console.error.bind(console, "MongoDB connection error:"));

//app.use(logger);

OAuthObjectStore.setMain().then((result) => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    main();
    //console.log(OAuthObjectStore.getMain());
});
