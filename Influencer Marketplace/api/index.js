"use strict";

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const { MongoClient } = require("mongodb");

let DATABASE_NAME = "influencer_marketplace";

/* Do not modify or remove this line. It allows us to change the database for grading */
if (process.env.DATABASE_NAME) DATABASE_NAME = process.env.DATABASE_NAME;

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



/* List influencers */
api.get("/influencers", async (req, res) => {
    console.log("here");
    let influencers = await Influencers.find().toArray();
    res.json({ influencers: influencers.map(influencer => influencer.name) });
});

/* List users */
api.get("/users", async (req, res) => {
    console.log("here");
    let users = await Users.find().toArray();
    res.json({ users: users.map(user => user.id) });
});


/* Middleware to lookup influencer */
api.use("/influencers/:id", async (req, res, next) => {
    let id = req.params.id;
    let influencer = await Influencers.findOne({ id });
    if(influencer) {
	res.locals.influencer = influencer;
    }
    next();
});

/* Middleware to lookup user */
api.use("/users/:id", async (req, res, next) => {
    let id = req.params.id;
    let user = await Users.findOne({ id });
    if(user) {
	res.locals.user = user;
    }
    next();
});

/* Get a influencers' info */
api.get("/influencers/:id", (req, res) => {
    if(res.locals.influencer){
	let influencer = res.locals.influencer;
	let { id, name, picture, numFollowers, bio, prizes } = influencer;
	res.json({ id, name, picture, numFollowers, bio, prizes });
    } else {
	 res.status(404).json({ error: `User ${req.params.id} does not exist` });
    }
});

/* Get a users' info */
api.get("/users/:id", (req, res) => {
    if(res.locals.user){
	let user = res.locals.user;
	let { id, name, following, myPrizes } = user;
	res.json({ id, name, following, myPrizes });
    } else {
	 res.status(404).json({ error: `User ${req.params.id} does not exist` });
    }
});



/* Post a new user*/

api.post("/users", async (req, res) => {
    if(req.body.id || req.body.id !== ""){
	let id = req.body.id;
	if (!(await Users.findOne({ id }))){
	    let user = { id: id, name: id, avatarURL: "", following: [] }
	    await Users.insertOne(user);
	    res.json({id: id, name: user.name, avatarURL: user.avatarURL, following: user.following });
	} else {
	     res.status(401).json({ error: `User ${id} already exists` });
	}
    } else {
	 res.status(400).json({ error: "Must provide id property" });
    }
});

/* Update a user */
api.patch("/users/:id", async (req, res) => {
    if(res.locals.user){
	let user = res.locals.user;
	let { id, name, avatarURL, following } = user;
	let newName = req.body.name;
	user.name = newName;
	await Users.replaceOne({ id: user.id }, user);
	res.json(user)
    } else {
	 res.status(404).json({ error: `User ${req.params.id} does not exist` });
    }
});

/* Get a user's feed */
api.get("/users/:id/feed", async (req, res) => {
    if(res.locals.user){
	let user = res.locals.user;
	
	let followingPosts = await Posts.find({userId: {$in: user.following } }).toArray();
	let personalPosts = await Posts.find({userId: {$eq: user.id } }).toArray();
	let posts = followingPosts.concat(personalPosts);

	let formatedPosts = [];
	for (let post of posts){
	    let user = await Users.findOne({id: {$eq: post.userId}});
	    user = {id: user.id, name: user.name, avatarURL: user.avatarURL};
	    post = {user: user, time: post.time, text: post.text}
	    formatedPosts.push(post);
	}
	
	let sortedPosts = formatedPosts.sort((a, b) => {
	    return b.time - a.time;
	});
	
	res.json({posts: sortedPosts});
    } else {
	 res.status(404).json({ error: `User ${req.params.id} does not exist` });
    }
   
});

/* Make a post */
api.post("/users/:id/posts", async (req, res) => {
    if(res.locals.user){
	if (req.body.text){
	    let user = res.locals.user;
	    let text = req.body.text;
	    console.log(text);
	    let post = { userId: user.id, time: new Date(), text: text };
	    await Posts.insertOne(post);
	    res.json({"success": true})
	} else {
	    res.status(404).json({ error: `Must provide text property` });
	}
    } else {
	 res.status(404).json({ error: `User ${req.params.id} does not exist` });
    }
    
});

/* Add a follow */
api.post("/users/:id/follow", async (req, res) => {
    if(!res.locals.user){
	res.status(404).json({ error: `User ${req.params.id} does not exist` });
	return;
    }
    if(!req.query.target || req.query.target === ""){
	res.status(401).json({ error: "Must provide target property" });
	return;
    }
	
    let userToFollow = req.query.target;
    let user = res.locals.user;
    let following = user.following;

    if(!(await Users.findOne({ id: userToFollow }))){
	res.status(400).json({ error: `Target user ${req.params.target} does not exist` });
	return;
    }
    if(user.id === userToFollow){
	res.status(401).json({ error: "Requesting user is same as target" });
	return;
    }
    if(following.includes(userToFollow)){
	res.status(401).json({ error: `Already following ${userToFollow}` });
	return;
    }
    
    following.push(userToFollow);
    await Users.updateOne({id: user.id}, {$set: {following: following }});
    res.json({"success": true})  
});

/* Delete a follow */
api.delete("/users/:id/follow", async (req, res) => {
    if(!res.locals.user){
	res.status(404).json({ error: `User ${req.params.id} does not exist` });
	return;
    }
    if(!req.query.target || req.query.target === ""){
	res.status(401).json({ error: "Must provide target property" });
	return;
    }
    
    let followingToDelete = req.query.target;
    let user = res.locals.user;
    let following = user.following;

    if(!following.includes(followingToDelete)){
	res.status(401).json({ error: `Not following ${followingToDelete}` });
	return;
    }
    
    let index = following.indexOf(followingToDelete);
    await Users.updateOne({id: user.id}, {$set: {following: following }});
    res.json({"success": true});
});



/* Catch-all route to return a JSON error if endpoint not defined */
api.all("/*", (req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});


