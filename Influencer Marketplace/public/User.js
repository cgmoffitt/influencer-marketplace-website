import apiRequest from "./api.js";

export default class User {
  /* Returns an array of user IDs */
  static async listUsers() {
    let [status, data] = await apiRequest("GET", "/users");
    if (status !== 200) throw new Error("Couldn't get list of users");
    return data.users;
  }
  
  /* Returns a User object */
  static async load(id) {
      let [status, data] = await apiRequest("GET", `/users/${id}`);
      if (status !==200) {
	  alert(`There is no user with id: ${id}`);
	  return null;
	//  [status, data] = await apiRequest("POST", "/users", {id: id});
      } else{
	  return new User(data);
      }
      
  }

  constructor(data) {
      Object.assign(this, data);
      this._path = `${window.API_URL}/${this.id}`;
  }

  /* Adds an influencer to a user's following hashmap {influencerId: total points} */
  async addFollow(id) {
      console.log(id);
      let [status, data] = await apiRequest("POST", `users/${this.id}/follow?influencer=${id}`);
      console.log(status);
      return data;
  }

  /* Deletes an influencer from a user's following hashmap*/
  async deleteFollow(id) {
      let [status,data] = await apiRequest("DELETE", `users/${this.id}/follow?influencer=${id}`)
      return data;
  }
  
}
