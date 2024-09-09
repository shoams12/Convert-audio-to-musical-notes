let count = 0;
export function User(userName, password, email) {
  this.userId = count++;
  this.userName = userName;
  this.password = password;
  this.email = email;
  this.songArr = [];
}

export function saveUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getUser() {
  let user = localStorage.getItem("currentUser");
  return JSON.parse(user);
}
export function removeUser(){
localStorage.removeItem("currentUser")
}