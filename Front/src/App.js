import logo from "./logo.svg";
import "./App.css";
import { UserList } from "./data/db";
import { useState } from "react";
import LogIn from "./components/logIn";
import { Link, BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import About from "./components/About";
import LogOut from "./components/LogOut";
import SignUp from "./components/signUp";
import History from "./components/History";
import AboutGuest from "./components/AboutGuest";

function App() {
  const [myUser, signIn] = useState(undefined); //if there is a user
 
  return (
    <div className="App" >
     
      <BrowserRouter>
        <Nav view={myUser} />

        <Routes>
          <Route
            path="logIn"
            element={<LogIn usersList={UserList} enterUser={signIn} />}
          ></Route>
          <Route index element={<Navigate to={"LogOut"} />}  />
          {/* <Route index element={<LogIn usersList={UserList} enterUser={signIn} />} /> */}
          <Route path="Homepage" element={<HomePage />} />
          <Route path="About" element={<About  />} />
          <Route path="AboutGuest" element={<AboutGuest  />} />
          <Route path="History" element={<History />} />
          <Route path="LogOut" element={<LogOut  />} />
          <Route path="signUp" element={<SignUp />} />
        </Routes>
      
      </BrowserRouter>
    </div>
  );
}

export default App;

export function Nav(view) {
  return (
    <div
      style={{
        display: view === undefined ? "flex" : "none",
        justifyContent: "space-evenly",
        backgroundColor: "#0F52BD",fontSize:'20px',fontFamily:'monospace'
      }}
    >
      <Link
        style={{
          padding: "5%",paddingTop:'2%',
          backgroundColor: "white",
          color: "black",
          textDecoration: "none",
        }}
        to="/logIn"
      >
        Login
      </Link>
      <Link
        style={{
          padding: "5%",paddingTop:'2%',
          backgroundColor: "white",
          color: "black",
          textDecoration: "none",
        }}
        to="/About"
      >
        About us
      </Link>
      <Link
        style={{
          padding: "5%",paddingTop:'2%',
          backgroundColor: "white",
          color: "black",
          textDecoration: "none",
        }}
        to="/AboutGuest"
      >
        About us
      </Link>
    </div>
  );
}
