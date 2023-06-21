const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 8081;
require('dotenv').config();

const config = {
  connectionString:
    "postgres://affiliatedb_mw06_user:qD1jGsmK0vInKh6CBvQNMxB6xYXTriHw@dpg-ci8vjgd9aq0dcs9ifq60-a.singapore-postgres.render.com/affiliatedb_mw06?ssl=true",
};

const { Client } = require('pg');
const { constants } = require("buffer");
const client = new Client(config);
client.connect()

app.use(cors())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false, parameterLimit:50000 }));

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

function GenerateJWT(_userId, _email, _username)
{
  return jwt.sign(
      { userId: _userId, email: _email, username: _username},
      process.env.TOKEN_KEY,
      { expiresIn: "24h" }
    );
}

app.get('/', async (req, res) => {
  res.status(200).send("OK");
})

app.post('/user/login', async (req, res) => {

  if( typeof(req.body.email) == 'undefined' || typeof(req.body.password) == 'undefined')
  {
    return res.status(500).send("Error: Please enter your email and password to login.");
  }

  client.query("SELECT * FROM users WHERE email = '"+req.body.email+"' AND password = crypt('"+req.body.password+"', password)")
        .then((result) => {
          if(result.rows.length > 0)
          {
            const token = GenerateJWT(result.rows[0].id, result.rows[0].email, result.rows[0].username);

            client.query("UPDATE users SET last_login = NOW() WHERE id = "+result.rows[0].id)

            res.status(200).json({
                success: true,
                data: {
                  userId: result.rows[0].id,
                  email: result.rows[0].email,
                  token: token,
                },
              });
          }
          else
          {
            res.status(500).send("Error: Wrong Username or Password");
          }
        })
        .catch((e) => {
          console.error(e.stack);
          res.status(500).send(e.stack);
        })
})

app.post('/user/create/:referral?', async (req, res) => {

  if( typeof(req.body.email) == 'undefined' || typeof(req.body.password) == 'undefined' || typeof(req.body.username) == 'undefined')
  {
    return res.status(500).send("Error: Please fill in your username, email, and password to complete the registration process.");
  }

  client.query("SELECT * FROM users WHERE email = '"+req.body.email+"'")
        .then((result) => {
            if(result.rows.length > 0)
            {
              if(req.body.email == result.rows[0].email)
                return res.status(500).send("Error: Email has been taken");
            }
            else
            {
              client.query("INSERT INTO users (username, email, password) VALUES ('"+req.body.username+"', '"+req.body.email+"', crypt('"+req.body.password+"', gen_salt('bf')))")
                    .then((result) => {
                      if (req.body.referral)
                      {
                        if(typeof(req.body.referral) != 'undefined')
                            client.query("INSERT INTO referral (user_id, username, referral) VALUES ('"+result.insertId+"', '"+req.body.username+"', '"+req.params.referral+"')");
                      }

                      res.status(201).send("Register Success");
                    })
                    .catch((e) => {
                      console.error(e.stack);
                      res.status(500).send(e.stack);
                    })
            }
        })
        .catch((e) => {
          console.error(e.stack);
          res.status(500).send(e.stack);
        })
})

app.get('/user/get/:id', async (req, res) => {
      client.query("SELECT * FROM users WHERE id = "+req.params.id)
            .then((result) => res.send(JSON.stringify(result.rows[0])))
            .catch((e) => {
                console.error(e.stack);
                res.status(500).send(e.stack);
            })
})