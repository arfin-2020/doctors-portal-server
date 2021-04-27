const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs-extra');

const app = express()
const port = 5050
require('dotenv').config()

app.use(express.static('doctors'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r5j5a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello Mongodb is working')
  })

  client.connect(err => {
    const appointmentCollection = client.db("doctorsportal").collection("appointments");
    const doctorCollection = client.db("doctorsportal").collection("docotrs");
    
    app.post('/addAppointment',(req,res)=>{
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
        .then(result =>{
            res.send(result.insertedCount > 0)
        })
    })

    app.post('/appointmentsByDate',(req,res)=>{
        const date= req.body;
        const email = req.body.email;
        doctorCollection.find({email:email})
        .toArray((error,doctors) =>{
            const filter = {date:date.date}
            if(doctors.length === 0){
                filter.email = email;
            }
            appointmentCollection.find(filter)
            .toArray((error,documents) =>{
                console.log(email,date.date, doctors, documents);
                res.send(documents)
            })
        })
    })

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addADoctor', (req, res)=>{
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
              const newImg  = file.data
              const encImg = newImg.toString('base64')
      
              var image = {
                contentType: file.mimetype,
                size: file.size,
                img: Buffer.from(encImg, 'base64')
              };  
                doctorCollection.insertOne({name,email,image})
                .then(result =>{
                //   fs.remove(filePath,error =>{
                //       if(error){
                //         console.log(error)
                //         res.status(500).send({msg:'failed to upload Image'})
                //       }
                      res.send(result.insertedCount > 0)
                //   })
              })
        // })
    })

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
        app.post('/isDoctor', (req, res)=>{
            const email = req.body.email;
            doctorCollection.find({email:email})
            .toArray((error,doctors)=>{
                res.send(doctors.length > 0)
            })
        })   
  });

  app.listen(process.env.PORT||port)
