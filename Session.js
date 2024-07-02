//import express from 'express';
//import bodyParser from 'body-parser';
const express=require('express');
const session=require('express-session');
const bodyParser=require('body-parser');
const app=express();
app.use(session({
   secret: 'secret-key',
   resave: false,
   saveUninitialized: false,
}));
app.get('/', (req, res)=>{
   const sessionData=req.session;
   res.send('<form action=/login><label>user id</label><input type=text name=username><br><label>Password</label><input type=password name=password><br><input type=submit value=Submit></form>')
});

app.get('/login', (req,res)=>{
   //const{username,password}=req.body;
   username=req.query.username;
   password=req.query.password;
   console.log(username+":"+password);
   if(username=='solution' && password=='center')
   {
      req.session.isLoggedIn=true;
      req.session.username=username;
      res.redirect('/dashboard');
   }
   else
   {
      res.redirect('/');
   }
   res.end();
});
app.get('/dashboard', (req,res)=>
{
   const isLoggedIn=req.session.isLoggedIn;
   const username=req.session.username;
   console.log(isLoggedIn + ",,"+username);
   if(isLoggedIn)
   {
      //res.render('dashboard',{username});
      res.send("<h1>Welcome</h1>"+username);
   }
   else
   {
      res.redirect('/login');
   }
});
app.listen(5000);