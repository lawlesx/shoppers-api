const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'shoppers'
});

let user = {};

function isEmpty(value) {
  if(Object.keys(value).length === 0
  && value.constructor === Object)
  {
    return true;
  }
  else
  {
    return false;
  }
  
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  // console.log("Body",req.body);
})
app.post('/', (req, res) => {
  if(!isEmpty(req.body.register))
  {
    user = req.body.register;
    console.log(user);
    db.query(
      `INSERT INTO customer (cname,email,phoneNo,password,address) VALUES 
        (?,?,?,?,?)`,
        [user.name,user.email,user.phoneNo,user.password,user.address],
        function(err,results) {
          if(!err)
          {
            console.log('Results',typeof results);
            res.status(200).json('User Inserted');
          }
          else
          {
            console.log('Error',err);
          }
        }
      )
  }
  else if(!isEmpty(req.body.login))
  {
    user = req.body.login;
    console.log(user);
    db.query(
      `SELECT email, password FROM customer where email = ? and password = ?`,
        [user.email,user.password],
        function(err,results) {
          if(err)
          {
            console.log('Error',err);
            
          }
          else
          {
            console.log('Results Users:',results);
            if(results.length>0){
              res.status(200).json('User Found');
            }
            else{
              console.log('Error',res);
              res.status(404).json('User Not found');
            }
            
          }
        }
      )
  }
  
})

app.get('/home',(req, res) => {
  db.query(
    'SELECT * FROM product',
    function(err, results, fields) {
      console.log('Home get isEmpty:',isEmpty(results)); // results contains rows returned by server
      res.status(200).json(results);
      // console.log(err);
    }
  );
})

app.post('/home',(req, res) => {
  console.log(user);
  console.log('Home post items',req.body);
  if(!isEmpty(user) && !isEmpty(req.body))
  {
    db.query(
      `REPLACE INTO cart (cid,pname,qty,price,pid) 
        values 
      ((select cid from customer where email=?),
        ?,?,?,(select pid from product where pname=?))`,
        [user.email,req.body.name,req.body.qty,req.body.price,req.body.name],
      function(err,results){
        console.log('Error Inserting',err);
        if(!err)
        {
          res.status(200).json('Cart Item Insert');
        }
      }
    )
  }
  else{
    res.status(204).json('Waiting for Items')
  }
  
})

app.get('/cart',(req, res) => {
  db.query(
    'SELECT * FROM cart WHERE cid = (SELECT cid FROM customer where email=?)',
    [user.email],
    function(err, results, fields) {
      // console.log(results); // results contains rows returned by server
      res.status(200).json(results);
      // console.log(err);
    }
  );
})

app.post('/cart',(req, res) => {
  console.log('Cart post items',req.body);
  if(!isEmpty(user))
  {
    db.query(
      'DELETE FROM cart WHERE cid = (SELECT cid FROM customer WHERE email = ?)',
      [user.email],
      function(err,results)
      {
        if(!err){
          res.status(200).json('Items Dispatched');
        }
        else{
          res.status(404).json('Could not place order');
        }
      }
    )
  }
});

app.get('/account', (req, res) => {
  console.log('Empty',isEmpty(user));
  console.log('user:',user)
  if(!isEmpty(user))
  {
    db.query(
      'SELECT * FROM customer where email=?',
      [user.email],
      function(err, results){
        if(!err)
        {
          console.log('User Database Account',results);
          res.status(200).json(results);
        }
        else
        {
          res.send(404).json('User Not Found');
        }
      }
    )
  }
  else
  {
    res.status(400).json('User Empty');
  }
})

// app.get('/thank',(req,res)=>{
//   db.query(
//     'SELECT SUM(price*qty) as total from cart where cid = (select cid from customer where email = ?)',
//     [user.email],
//     function(err,results)
//     {
//       res.send(200).json(results);
//     }
//   )
// })

app.listen(8000, () => {
	console.log(`app is running on port 8000`);
})

