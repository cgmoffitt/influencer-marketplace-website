import User from "./User.js";
import Influencer from "./Influencer.js";
import EditableText from "./EditableText.js";
import DynamicList from "./DynamicList.js";

class App {
    constructor() {

	//instance variables
	this._user = null;
	this._loginForm = null;
	this._followPanel = null;
	this._searchForm = null;
	this._displayedInfluencer = null;
	this._influencerPage = null;
	this._unfollowButton = null;

	//event handlers
	this._onLogin = this._onLogin.bind(this);
	this._onSearch = this._onSearch.bind(this);
	this._onSelect =  this._onSelect.bind(this);
	this._onFollow = this._onFollow.bind(this);
	this._showUnfollow = this._showUnfollow.bind(this);
	this._onUnfollow = this._onUnfollow.bind(this);
	
	//methods
	this._loadProfile = this._loadProfile.bind(this);
	this._loadFollowPanel = this._loadFollowPanel.bind(this);
	this._loadInfluencerPage = this._loadInfluencerPage.bind(this);
	this._loadInfluencerProfile = this._loadInfluencerProfile.bind(this);
	this._loadInfluencerPrizes = this._loadInfluencerPrizes.bind(this);
	this._isFollowing = this._isFollowing.bind(this);
	this._getUserPointsForInfluencer = this._getUserPointsForInfluencer.bind(this);
	this._clearDisplayedPrizes = this._clearDisplayedPrizes.bind(this);
	this._loadFollowButton = this._loadFollowButton.bind(this);
    }

    setup() {
	//Display login form
	this._loginForm = document.querySelector("#loginForm");
	this._loginForm.login.addEventListener("click", this._onLogin);
    }

    async _loadProfile() {
	document.querySelector("#welcome").classList.add("hidden");
	document.querySelector("#mainPage").classList.remove("hidden");
	this._searchForm = document.querySelector("#searchForm");
	this._searchForm.search.addEventListener("click", this._onSearch);
	
	//Update followPanel
	this._loadFollowPanel();
    }

    _loadFollowPanel(){
	this._followPanel = document.querySelector("#followPanel");
	let follows = this._followPanel.querySelector("#follows");

	while (follows.firstChild){
	    follows.removeChild(follows.firstChild);
	}

	for (let influencer in this._user.following){
	    let influencerTab = document.createElement('div');
	    influencerTab.textContent = influencer;
	    influencerTab.classList.add("hover");
	    this._followPanel.querySelector("#follows").appendChild(influencerTab);
	    influencerTab.addEventListener("click", this._onSelect)
	}
    }

    _loadInfluencerPage(){
	this._influencerPage = document.querySelector("#influencerPage");
	console.log(this._influencerPage);

	//Load Influencer profile
	this._loadInfluencerProfile();
	
	//Load Influencer Prizes
	this._loadInfluencerPrizes();
    }

    _loadInfluencerProfile(){
	let profile = this._influencerPage.querySelector("#profile");
	profile.querySelector("#profilePic").src = `images/${this._displayedInfluencer.picture}`;
	profile.querySelector("#name").textContent = this._displayedInfluencer.name;
	profile.querySelector("#bio").textContent = this._displayedInfluencer.bio;
	profile.querySelector("#followerCount").textContent = `Followers: ${this._displayedInfluencer.numFollowers}`;
	profile.querySelector("#prizeCount").textContent = `Prizes: ${this._displayedInfluencer.prizes.length}`;

	//Remove unfollow button if it exists
	if(this._unfollowButton){
	    this._unfollowButton.remove();
	    this._unfollowButton = null;
	}

	//Load "follow" / "following" button
	let followButton = profile.querySelector("#followingStatus");
	this._loadFollowButton(followButton);

	profile.classList.remove("hidden");
    }

    _loadFollowButton(followButton){
	if (this._isFollowing()){
	    followButton.classList.remove("notFollowing");
	    followButton.classList.add("following");
	    followButton.textContent = "following ↓";
	    followButton.removeEventListener("click", this._onFollow);
	    followButton.addEventListener("click", this._showUnfollow);
	} else {
	    followButton.classList.remove("following");
	    followButton.classList.add("notFollowing");
	    followButton.textContent = "follow";
	    followButton.removeEventListener("click", this._showUnfollow);
	    followButton.addEventListener("click", this._onFollow);
	}
    }
    

    _isFollowing(){
	if (this._user.following.hasOwnProperty(this._displayedInfluencer.id)){
	    return true;
	} else {
	    return false;
	}
    }

    _loadInfluencerPrizes(){
	//Display Prizes header with the total number of points this._user has for this._displayedInfluencer
	let prizes = this._influencerPage.querySelector("#prizes");
	let points = this._getUserPointsForInfluencer();
	prizes.querySelector("#totalPoints").textContent = `Total Points: ${points}`;
	prizes.classList.remove("hidden");

	
	let prizeDisplays = prizes.querySelector("#prizeDisplays");

	//Clear any prizes from a previous influencer display
	this._clearDisplayedPrizes(prizeDisplays);

	//Load Prizes
	for (let prize of this._displayedInfluencer.prizes){
	    console.log(prize.name)
	    let prizeDisplay = prizes.querySelector("#templatePrize").cloneNode(true);
	    prizeDisplay.id = "";
	    prizeDisplay.querySelector(".prizeName").textContent = prize.name;
	    prizeDisplay.querySelector(".prizePicture").src = `images/${prize.picture}`;
	    prizeDisplay.querySelector(".prizePicture").alt = prize.name;
	    prizeDisplay.querySelector(".prizeCost").textContent = `Cost: ${prize.cost}`;
	    prizeDisplay.querySelector(".prizeQuantity").textContent = `Quantity: ${prize.quantity}`;
	    prizeDisplay.querySelector(".descriptionTitle").textContent = "Descrition:";
	    prizeDisplay.querySelector(".descriptionContent").textContent = prize.description;
	    prizeDisplay.querySelector("button").textContent = "Redeem Points to Win!";
	    prizeDisplays.appendChild(prizeDisplay);
	}
    }

    _getUserPointsForInfluencer(){
	let points;
	if (this._isFollowing()){
	    points = this._user.following[`${this._displayedInfluencer.id}`];
	} else {
	    points = 0;
	}
	return points;
    }

    _clearDisplayedPrizes(prizeDisplays){
	while (prizeDisplays.firstChild) {
	    prizeDisplays.removeChild(prizeDisplays.firstChild);
	}
    }


    /******Event handlers***********/

    _showUnfollow(event){
	console.log("show unfollow");
	if (!this._unfollowButton){
	    console.log("here");
	    this._unfollowButton = document.createElement("button");
	    this._unfollowButton.textContent = "unfollow";
	    this._unfollowButton.addEventListener("click", this._onUnfollow);
	    document.querySelector("#dropdown").appendChild(this._unfollowButton);
	} else {
	    this._unfollowButton.remove();
	    this._unfollowButton = null;
	}
    }
    
    async _onLogin(event) {
	event.preventDefault();
	let id = this._loginForm.userid.value;
	this._user = await User.load(id);
	if(this._user === null){ return }
	this._loadProfile();
    }

    async _onSearch(event){
	event.preventDefault();
	let id = this._searchForm.influencerid.value;
	this._displayedInfluencer = await Influencer.load(id);
	this._loadInfluencerPage();
    }

    async _onFollow(event){
	event.preventDefault();
	await this._user.addFollow(this._displayedInfluencer.id);
	this._user = await User.load(this._user.id);
	this._loadInfluencerPage();
	this._loadFollowPanel();
    }

    async _onUnfollow(event){
	event.preventDefault();
	await this._user.deleteFollow(this._displayedInfluencer.id);
	this._user = await User.load(this._user.id);
	this._loadInfluencerPage();
	this._loadFollowPanel();
    }

    async _onSelect(event){
	event.preventDefault();
	let id = event.target.textContent;
	this._displayedInfluencer = await Influencer.load(id);
	console.log(this._displayedInfluencer);
	this._loadInfluencerPage();
	this._loadFollowPanel();
	
    }
}

let app = new App();
app.setup();
