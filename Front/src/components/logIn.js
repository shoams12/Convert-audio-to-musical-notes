import { Link, useNavigate } from "react-router-dom";
import { saveUser } from "../data/user";
import { useState } from "react";
import axios from "axios";
//npm insall axios
export default function LogIn() {
  const[email,setEmail]  = useState("");
  const[password,setPassword]  = useState("");
  const [message, setMessage] = useState("");
  const nav = useNavigate()
  
  
  // const navigate = useNavigate();
  // const handleLogin = () => {
  //   let myUser = usersList.find(
  //     (user) => user.email === email && user.password === password
  //   );

  //   if (myUser === undefined) {
  //     alert("User not found");
  //   } else {
  //     enterUser(myUser);
  //     saveUser(myUser)
  //     navigate("/homePage");
  //   }
  // };
  // function LoginInServer(e){
  //   e.preventDefault()

  //   const userToServer= {
  //     "username": username,
     
  //     // this.password = password;
  //     // this.email = email;
      
  //   }

  //   try{
  //     const response =  axios.post('http://localhost:5000/login',userToServer );
  //     setMessage(response.data.message);
  //   }catch(error){
  //     setMessage(error.response.data.message)}
  // }
  // handleLogin=() => {
  //   if (
  //     userList.find(
  //       (u) => u.email === email && u.password === password
  //     ) != undefined
  //   ) {
  //     nav("../Homepage");
  //   } else {
  //     alert("username or password does not exist");
  //   }
  // }

  async function handleSubmit(event) {
    event.preventDefault();

    const objectToServer = {
      email: email,
      password: password
    };

    try {
      const response = await axios.post(//get the user into response if found
        "http://localhost:5000/login",
        objectToServer
      );
      console.log(response);
      saveUser(response.data)//saving the user into localstorage
      setMessage(response.data);
      nav("../Homepage")
    } catch (error) {
      setMessage(error.response.data);
    }
    if (message == "not found")
      alert("the user was not recognized")
      
  }

  return (
    <div
      style={{
        display: "block",
        backgroundColor: "#DBDCE0 ",
        width: "400px",
        height: "400px",
        marginLeft: "40%",
        marginTop: "10%",
        justifyContent: "flex-start",
        boxShadow: "2px 2px 2px  gray",
      }}
    >
      <h2 style={{ fontSize: "30px", color: "black" }}>Login🎧</h2>
      <form onSubmit={handleSubmit} >
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          style={{ fontSize: "20px" }}
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          style={{ fontSize: "20px", margin: "5%" }}
        />
        <input
          type="submit"
          value="login"
          style={{
            color: "white",
            background: "#0F52BD",
            display: "flex",
            marginLeft: "35%",
            fontSize: "20px",
            width:'120px',
            textAlign: 'center',
            border:'2px solid #0F52BD '
          
           
          }}
        />
        <Link
          to="/signUp"
          style={{
            color: "#0F52BD",
            display: "block",
            textDecoration: "none",
            margin: "5%",
          }}
        >
          Create new user
        </Link>
      </form>
    </div>
  );
}
