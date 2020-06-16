import apiRequest from "./api.js";

/* A small class to represent a Post */
export class Post {
  constructor(data) {
    this.user = data.user;
    this.time = new Date(data.time);
    this.text = data.text;
  }
}

export default class User {
  /* Returns an array of user IDs */
  static async listUsers() {
    let [status, data] = await apiRequest("GET", "/users");
    if (status !== 200) throw new Error("Couldn't get list of users");
    return data.users;
  }
  
  /* Returns a User object, creating the user if necessary */
  static async loadOrCreate(id) {
      let [status, data] = await apiRequest("GET", `/users/${id}`);
      /*if (status !==200) {
	  [status, data] = await apiRequest("POST", "/users", {id: id});
      }*/
      return new User(data);
  }

  constructor(data) {
      //TODO
      Object.assign(this, data);
      this._path = `${window.API_URL}/${this.id}`;
  }

  async save() {
      //TODO
      
      let [status, data] = await apiRequest("PATCH", `/users/${this.id}`, {id: this.id, name: this.name, avatarURL: this.avatarURL})
      return new User(data);
      
  }

  /* Returns an array of Post objects */
  async getFeed() {
      //TODO

      let [status, data] = await apiRequest("GET", `users/${this.id}/feed`);
      return data.posts;
  }

  async makePost(postText) {
      //TODO
      console.log(postText);

      try {
	  let [status, data] = await apiRequest("POST", `users/${this.id}/posts`, {text: postText});
	  return data;
      }catch(e){
	  alert(e)
      }  
  }

  async addFollow(id) {
      //TODO
      console.log(id);
      let [status, data] = await apiRequest("POST", `users/${this.id}/follow?target=${id}`);
      console.log(status);
      return data;
  }

  async deleteFollow(id) {
      //TODO
      let [status,data] = await apiRequest("DELETE", `users/${this.id}/follow?target=${id}`)
      return data;
  }
}
