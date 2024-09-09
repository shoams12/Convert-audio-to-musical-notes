import { Link } from "react-router-dom"
import logo from '../images/logo.png';

export default function About(){

    return(
        <div> 
        <AboutNav  />
        <h2 style={{fontSize:'50px',fontFamily:"Bahnschrift SemiBold"}}>About NoteMe</h2> 
 <div style={{marginLeft:'20%', fontFamily:"Bahnschrift SemiBold"}}>
 <p style={{width:'900px',fontSize:'20px'}}>
    Welcome to our website, where we strive to bridge the gap between the timeless elegance of piano music and the modern world of technology🌐
</p>

<p style={{width:'900px',fontSize:'20px'}}> 
    Our mission is to empower musicians and enthusiasts alike by providing innovative tools to transform piano audio into tangible music sheets🎼
</p>

<p style={{width:'900px',fontSize:'20px'}}>We aim to simplify the process of transcribing piano compositions, making it accessible to everyone regardless of musical expertise.</p>

<p style={{width:'900px',fontSize:'20px'}}>Whether you're a seasoned pianist seeking to preserve your compositions or an aspiring musician looking to learn from your favorite tunes, our platform offers the tools and resources to bring your musical visions to life🎹</p>

 <p style={{width:'900px',fontSize:'20px'}}> Join us on this harmonious journey as we unlock the transformative power of piano music and inspire creativity in every note!</p>      
 </div>
 </div> 
    )
}
export function AboutNav(){
    return <div
    style={{ display: "flex",
    justifyContent: "space-evenly",
    backgroundColor: "#0F52BD",
    height: "100px"}}>
  <img src={logo} style={{marginLeft:"20px", width:"100px",height:"97px",marginTop:"1px", borderRadius:"50%"}}/>
  <Link style={{padding: "5%",
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontFamily: "monospace",
          paddingTop: "2%",}} to='/history'>History</Link>
  <Link style={{padding: "5%",
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontFamily: "monospace",
          paddingTop: "2%",}} to='/Homepage'>Home</Link>
  <Link style={{padding: "5%",
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontFamily: "monospace",
          paddingTop: "2%",}} to='/logOut'>Log-Out</Link>
    </div>}