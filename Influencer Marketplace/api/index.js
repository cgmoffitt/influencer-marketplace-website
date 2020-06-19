"use strict";

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const { MongoClient } = require("mongodb");

let DATABASE_NAME = "influencer_marketplace";

let api = express.Router();
let conn;
let db;
let Influencers, Users;

module.exports = async (app) => {
    app.set("json spaces", 2);

    conn = await MongoClient.connect("mongodb://localhost", { useUnifiedTopology: true });
    db = conn.db(DATABASE_NAME);
    Influencers = db.collection("influencers");
    Users = db.collection("users");
    
    app.use("/api", api);
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
    res.json({ message: "API running" });
});



/*
GET /influencers
Returns res as an object with a single key "influencers", whose value is an  arrray of all influencer names in the mongo db */
api.get("/influencers", async (req, res) => {
    console.log("here");
    let influencers = await Influencers.find().toArray();
    res.json({ influencers: influencers.map(influencer => influencer.name) });
});

/*
GET /users
Returns res as an object with a single key "users", whose value is an array of all users in the mongo db
*/
api.get("/users", async (req, res) => {
    let users = await Users.find().toArray();
    res.json({ users: users.map(user => user.id) });
});


/* 
Middleware to lookup influencer 
Inserts the influencer object from the database with the specified id into res.locals
*/
api.use("/influencers/:id", async (req, res, next) => {
    let id = req.params.id;
    let influencer = await Influencers.findOne({ id });
    if(influencer) {
	res.locals.influencer = influencer;
    }
    next();
});

/* 
Middleware to lookup user 
Inserts the user object from the database with the specified id into res.locals
*/
api.use("/users/:id", async (req, res, next) => {
    let id = req.params.id;
    let user = await Users.findOne({ id });
    if(user) {
	res.locals.user = user;
    }
    next();
});

/* 
GET /influencers/:id
Returns res as the influencer object of the specified id
*/
api.get("/influencers/:id", (req, res) => {
    if(res.locals.influencer){
	let influencer = res.locals.influencer;
	let { id, name, picture, numFollowers, bio, prizes } = influencer;
	res.json({ id, name, picture, numFollowers, bio, prizes });
    } else {
	 res.status(404).json({ error: `User ${req.params.id} does not exist` });
    }
});

/*
GET /users/:id 
Returns res as the user object of the specified id
*/
api.get("/users/:id", (req, res) => {
    if(res.locals.user){
	let user = res.locals.user;
	let { id, name, following, myPrizes } = user;
	res.json({ id, name, following, myPrizes });
    } else {
	 res.status(404).json({ error: `User ${req.params.id} does not exist` });
    }
});

/* 
POST /users/:id/follow
Adds an influencer to the hashmap of influencers that the user follows. The key being the influencer's id, the value being 0 points
*/
api.post("/users/:id/follow", async (req, res) => {
    if(!res.locals.user){
	res.status(404).json({ error: `User ${req.params.id} does not exist` });
	return;
    }
    if(!req.query.influencer || req.query.influencer === ""){
	res.status(401).json({ error: "Must provide target property" });
	return;
    }
	
    let influencerToFollow = req.query.influencer;
    let user = res.locals.user;
    let following = user.following;

    if(!(await Influencers.findOne({ id: influencerToFollow }))){
	res.status(400).json({ error: `Target influencer ${req.query.influencer} does not exist` });
	return;
    }
   
    if(following.hasOwnProperty(influencerToFollow)){
	res.status(401).json({ error: `Already following ${influencerToFollow}` });
	return;
    }
    
    following[influencerToFollow] = 0;
    await Users.updateOne({id: user.id}, {$set: {following: following }});
    res.json({"success": true})  
});


/* 
DELETE /users/:id/follow
Deletes an influencer from the hashmap of influencers that the user follows.
*/
api.delete("/users/:id/follow", async (req, res) => {
    if(!res.locals.user){
	res.status(404).json({ error: `User ${req.params.id} does not exist` });
	return;
    }
    if(!req.query.influencer || req.query.influencer === ""){
	res.status(401).json({ error: "Must provide influencer property" });
	return;
    }
    
    let followingToDelete = req.query.influencer;
    let user = res.locals.user;
    let following = user.following;

    if(!following.hasOwnProperty(followingToDelete)){
	res.status(401).json({ error: `Not following ${followingToDelete}` });
	return;
    }
    
    delete following[followingToDelete];
    await Users.updateOne({id: user.id}, {$set: {following: following }});
    res.json({"success": true});
});


/* Catch-all route to return a JSON error if endpoint not defined */
api.all("/*", (req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});


