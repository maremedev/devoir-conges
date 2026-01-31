const express = require('express');
const mysql = require('mysql2');

// Créer l'application Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Créer la connexion MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'passer',
    database: 'conge_crud',
});

// Connecter à la base de données
db.connect((err) => {
    if (err) throw err;
    console.log('Connexion à la base de données réussie');
});



// GET /conges (liste des demandes)
app.get('/conges', (req, res) => {
    const sql = "SELECT * FROM conges";
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.render('demandes', { conges: results });
    });
});

// GET /conges/new 
app.get('/conges/new', (req, res) => {
    res.render('form', { demande: null });
});

// POST /conges 
app.post('/conges', (req, res) => {
    const { employee_code, start_date, end_date, motif } = req.body;

    // Verifier des dates
    if (new Date(start_date) > new Date(end_date)) {
        return res.send('Date de début doit être avant date de fin');
    }

    const sql = 'INSERT INTO conges (employee_code, start_date, end_date, motif, statut) VALUES (?,?,?,?,?)';
    db.query(sql, [employee_code, start_date, end_date, motif, 'EN_ATTENTE'], (err, result) => {
        if (err) throw err;
        res.redirect('/conges');
    });
});

// GET /conges/:id/edit 
app.get('/conges/:id/edit', (req, res) => {
    const { id } = req.params;

    const sql = 'SELECT * FROM conges WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.send('Demande de congé non trouvée');
        }

        res.render('form', { demande: results[0], errors: [] });
    });
});

// POST /conges/:id 
app.post('/conges/:id', (req, res) => {
    const { id } = req.params;
    const { employee_code, start_date, end_date, motif } = req.body;

    const sql = `
        UPDATE conges SET employee_code = ?, start_date = ?, end_date = ?, motif = ?
         WHERE id = ? AND statut = 'EN_ATTENTE'
    `;
    db.query(sql, [employee_code, start_date, end_date, motif, id], (err, results) => {
        if (err) throw err;
        res.redirect('/conges');
    });
});



//conges/:id/delete 
app.get('/conges/:id/delete', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM conges WHERE id = ? AND statut = "EN_ATTENTE"';
    db.query(sql, [id], (err, results) => {
        if (err) throw err;
        res.redirect('/conges');
    });
});
app.post('/conges/:id/delete', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM conges WHERE id = ? AND statut = "EN_ATTENTE"';
    db.query(sql, [id], (err, results) => {
        if (err) throw err;
        res.redirect('/conges');
    });
});



// Démarrer serveur

app.listen(3000, () => {
    console.log('Le serveur démarre sur le port 3000');
});
