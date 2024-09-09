import { Link } from "react-router-dom"
import { getUser } from "../data/user";
import FetchSongs from "./FetchSongs";
import logo from '../images/logo.png';

export default function History(){
    let user = getUser();
   
      
    return(
        <div>
        <HistoryNav/>
        <h2 style={{fontFamily:"Bahnschrift SemiBold"}}> Your Songs</h2>
        <FetchSongs userId={user.email} />
        </div>
    )
}
export function HistoryNav(){
    return <div
    style={{ display: "flex",
    justifyContent: "space-evenly",
    backgroundColor: "#0F52BD",
    height: "100px",}}>
   <img src={logo} style={{marginLeft:"20px", width:"100px",height:"97px",marginTop:"1px", borderRadius:"50%"}}/>
  <Link style={{padding: "5%",
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontFamily: "monospace",
          paddingTop: "2%",}} to='/About'>About us</Link>
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
          paddingTop: "2%",}} to='/logOut' >Log-Out</Link>
    </div>}