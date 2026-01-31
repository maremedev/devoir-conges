const express = require('express');
const mysql=require('mysql2');
//creer l'application express
const app=express();
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
//creer la connexion MYSQL
const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'passer',
    database:'conge_crud',

});
//connecter a la base de donnee
db.connect((err)=>{
    if(err)throw err;
    console.log('connexion a la base de données reussi');
});

// GET /conges
app.get('/demandes', (req, res) => {
    const sql = "SELECT * FROM conges";

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return;
        }
        //Afficher le formulaire
        
        res.render('demandes', { conges: results });
    });
});

// GET/conges/new
app.get('/conges/new',(req,res)=>{
    //Afficher le formulaire
    res.render('form',{demande:null});
    });

    //POST/conges
    app.post('/conges',(req,res)=>{
        //récupére données, valider dates,inserer(EN_ATTENTE)
        const{employee_code,start_date,end_date,motif}=req.body;
        if(new Date(start_date)>new Date(end_date)){
            return res.send('Date de début doit être avant date de fin');
        }
        const sql='INSERT INTO conges (employee_code, start_date, end_date, motif, statut) VALUES (?,?,?,?,?)';
        db.query(sql,[employee_code,start_date,end_date,motif,'EN_ATTENTE'],(err,result)=>{
            if(err)throw err;
            res.redirect('/conges');
        });

    });
    //GET/conges/:id/edit
    app.get('/conges/:id/edit',(req,res)=>{
        //verifier existence, verifier statut EN_ATTENTE
        const{id}=req.params;
        const sql='SELECT * FROM conges WHERE id=?';
        db.query(sql,[id],(err,results)=>{
            if(err)throw err;
            if(results.length===0){
                return res.send('Demande de congé non trouvée');
            }
            res.render('form',{demande:results[0],errors:[]});
        });
    });
    //POST/conges/:id
    app.post('/conges/:id',(req,res)=>{
       // mise à jour si EN_ATTENTE
       const{id}=req.params;
       const{employee_code,start_date,end_date,motif}=req.body;
       const sql='UPDATE conges SET employee_code=?, start_date=?, end_date=?, motif=? WHERE id=? AND statut="EN_ATTENTE"';
       db.query(sql,[employee_code,start_date,end_date,motif,id],(err,results)=>{
           if(err)throw err;
           res.redirect('/conges');
       });
    });
       //POST/conges/:id/delete
       app.post('/conges/:id/delete',(req,res)=>{
              //suppression si EN_ATTENTE
              const{id}=req.params;
              const sql='DELETE FROM conges WHERE id=? AND statut="EN_ATTENTE"';
              db.query(sql,[id],(err,results)=>{
                  if(err)throw err;
                  res.redirect('/conges');
              });
       });

//demarrer le serveur 
app.listen(3000,()=>{
    console.log('le serveur demarre sur le port 3000');
});
    