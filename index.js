const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

const port = 5000

const app = express()

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./hotel-of-ctgu-firebase-adminsdk-913tc-125193a9a8.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hotel-of-ctgu.firebaseio.com"
});

const pass = 'hotelctgu79';


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://chinese-hotel:hotelctgu79@cluster0.svjmy.mongodb.net/hotelOfCtgu?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("hotelOfCtgu").collection("bookings");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking);
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer')) {
            const idToken = bearer.split(' ')[1];

            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail == queryEmail) {
                        bookings.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.send(documents);
                            })
                    }
                    else{
                        res.status(401).send('unauthorized success')
                    }
                }).catch(function (error) {
                    res.status(401).send('unauthorized success')
                });

        }
        else{
            res.status(401).send('unauthorized success')
        }



    })

});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)