import { Link } from "react-router-dom";
import logo from '../images/logo.png';

export default function LogOut() {

  return (
    <div >
      <LogOutNav />
      <h1 style={{fontSize:'50px',fontFamily:"Bahnschrift SemiBold"}}>Convert Music Into Notes With NoteMe </h1>
      <br/>
      <br/>
      <div style={{backgroundColor: "LightGray",border:'2px solid #0047AB',borderRadius:'5%',width:'800px',height:'300px',marginLeft:'23%',fontFamily:"Bahnschrift SemiBold", fontSize:"20px"}}>
      
      <h2 style={{color:"#0047AB", textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>How does it work?</h2>
     <p>1. Upload an audio file. </p>
       <p> 2. Click on <input type="button" value="Convert"  style={{
            color: "LightGray",
            backgroundColor: "#0F52BD",
            fontSize: "20px",
            borderRadius: "10%",
            boxShadow: " 2px 2px blue",
            cursor: "pointer"
          }} /> to transcribe your music.</p>
     <p>3. Download your transcription as Sheet Music. </p>
     
      </div>
     
  </div>
  );
}
export function LogOutNav() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-evenly",
        backgroundColor: "#0F52BD",
        height: "100px",
      }}
    >
      <img src={logo} style={{marginLeft:"20px", width:"100px",height:"97px",marginTop:"1px", borderRadius:"50%"}}/>
      <Link
        style={{
          padding: "5%",
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontFamily: "monospace",
          paddingTop: "2%",
        }}
        to="/AboutGuest"
      >
        About us
      </Link>
      <Link
        style={{
          padding: "5%",
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontFamily: "monospace",
          paddingTop: "2%",
        }}
        to="/logIn"
      >
        Login
      </Link>
    </div>
  );
}
