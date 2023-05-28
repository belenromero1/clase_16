const express = require ("express");
const session = require("express-session");
const hbs = require("hbs");
const mysql = require("mysql2");
const movieRoutes = require('./routes/movieRoutes');

const port = 3005;

const app = express();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials/")


// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    //para firmar las cookies y mas seguridad
    secret: '123456',
    //almacenar la info
    resave: false,
    saveUninitialized: false
}));


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "users"
});

// Verificación de la conexión a la base de datos
connection.connect((err) => {
    if (err) throw err;

    console.log("Conectado a base de datos");
})

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/login", (req, res) => {
    if(!req.body || !req.body.username || !req.body.password){
        res.send (" Usuario invalido");
        return
    }

    const { username, password } = req.body;
    const sql = ` SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    connection.query(sql, (err, results) => {
        if(err) throw err;
        //si se encuentra una coincidencia mayor a cero va a redirigir a home de caso contrario el usuario/contraseña es incorrecto
        if (results.length > 0){
            req.session.loggein = true;
            req.session.username = username;
            res.redirect("/home");
        } else{
            res.send ("Usuario o contraseña incorrecto")
        }
    });

});

app.get("/home", (req, res) => {
    if (req.session.loggein){
        res.render("home", { username: req.session.username});
    } else{
        res.redirect("/");
    }
});

app.get("/logout", (req, res) => {
    //destruir seccion para salir
    req.session.destroy();
        res.redirect("/");
});


// Ruta para api peliculas

app.use ('/movies', movieRoutes );


app.listen(port, () => {
    console.log(`Usando el puerto http://localhost:${port}`);
});