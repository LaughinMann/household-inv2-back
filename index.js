require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const updateProfileRoutes = require("./routes/updateprofile");
const addPropertyRoutes = require("./routes/property");
const admin = require("./routes/admin");


// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/updateprofile", updateProfileRoutes);
app.use("/api/property", addPropertyRoutes);
app.use("/admin", admin);


app.get('/', (req, res) => {
    res.send('Welcome to CORS server 😁')
})
app.get('/cors', (req, res) => {
    res.send('This has CORS enabled 🎈')
})

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));