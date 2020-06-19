import apiRequest from "./api.js";

export default class Influencer {
    constructor(data) {
	this.id = data.id;
	this.name = data.name;
	this.picture = data.picture;
	this.numFollowers = data.numFollowers;
	this.bio = data.bio;
	this.prizes = data.prizes;
    }

    /* Returns an influencer object  */
    static async load(id){
	let [status, data] = await apiRequest("GET", `/influencers/${id}`);
	return new Influencer(data);
    }
}
