import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
export default function SignUp() {
  const[username,setUsername]  = useState("");
  const[email,setEmail]  = useState("");
  const[password,setPassword]  = useState("");
  const[message, setMessage]=useState("");
  const nav = useNavigate();
  const registNewUser = async (event) =>{
    event.preventDefault();

    const objectToServer = {
      userName: username,
      email: email,
      password: password
    };
    
    try {
      const response = await axios.post(//get the user into response if found
      "http://localhost:5000/add_user",
        objectToServer
      );
      console.log(response);
      setMessage(response.data);
    } catch (error) {
      setMessage(error.response.data);
    }
    if (message == "User not valid")
      alert("username or password are too long ); ")
    else
      nav("../logIn")

  }
  return (
    <div  style={{display:'block',background:'#DBDCE0',width:'400px',height:'400px',marginLeft:'40%',marginTop:'10%',justifyContent:'flex-start',boxShadow:'2px 2px 2px  gray'}}
    >
      <h2 style={{fontSize:'30px',color:'black'}}>Sign-up</h2>
      <form onSubmit={registNewUser}>
        <input
          type="text"
          placeholder="UserName"
          onChange={(e) => {
            setUsername(e.target.value);
          }}required
          style={{fontSize:'20px',margin:'5%'}}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
         style={{fontSize:'20px',margin:'5%'}}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => {
          setEmail(e.target.value);
          }}
          style={{fontSize:'20px',margin:'5%'}}
        />
       <input type="submit" value="SignUp"  style={{color:'white',backgroundColor:'#0F52BD', border:'2px solid #0F52BD ',display:"flex",marginLeft:'60%',fontSize:'15px'}} />
       <Link to='/logIn' style={{color:'#0F52BD',display:"block",textDecoration:'none',margin:'5%'}} >Back To LogIn</Link>
      </form>
    </div>
  );
}
