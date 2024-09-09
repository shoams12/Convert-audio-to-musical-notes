import { Link } from "react-router-dom";
import { getUser} from "../data/user";
import { useState } from "react";
import { NewSong } from "../data/newSong";
import axios from "axios";
import Timer from "./timer";
import logo from '../images/logo.png';
// import mylogo from "./images/mylogo.png"
export default function HomePage() {
  let user = getUser();
  const [viewAudio, setViewAudio] = useState(false); //style
  const [path, setPath] = useState("");
  const [audioFile, setAudioFile] = useState(undefined);
  const [nameSong, setNameSong] = useState("");
  const [isConverting, setIsConverting] = useState(false)
  
  const handleDownload = () => {
    axios.get("http://localhost:5000/downloadPdf", { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        if(nameSong!= "")
          link.setAttribute('download', nameSong+".pdf");
        else
          link.setAttribute('download', 'yourSong.pdf');
        document.body.appendChild(link);
        console.log("res data: "+res.data)
        link.click();
      })
      .catch((err) => console.log('Error:', err));
      setViewAudio(false);
  };

  return (
    <div>
      <HomePageNav />
      <h2 style={{ fontFamily: "arial" }}>Hello {user.userName}!</h2>
      <h2 style={{ fontSize: "40px", fontFamily: "arial" }}>
        Welcome to your sheet music maker
      </h2>
      {/* <input
       type="text"
       placeholder="paste your link/path here"
       style={{fontSize:'30px'}}
       /> */}

      <div
        style={{
          backgroundColor: "LightGray",
          border: "2px solid #0047AB",
          borderRadius: "5%",
          width: "800px",
          height: "auto",
          marginLeft: "23%",
        }}
      >
        <br />
        <br />
        <input
          type="file"
          placeholder="choose file"
          accept="audio/*"
          style={{ fontSize: "20px", boxShadow: "2px 2px black" }}
          onChange={(e) => {
            console.log(e.target.files[0]);
            setAudioFile(e.target.files[0]);

            var reader = new FileReader();
            reader.onload = function (event) {
              setPath(event.target.result);
            };

            reader.readAsDataURL(e.target.files[0]);
            console.log(e.target.value); //fakepath
            // console.log(reader.readAsDataURL(e.target.files[0]));
            console.log(path);
          }}

          
        />

        <input
          type="button"
          value="Convert"
          onClick={() => {
            if (path != ""){
            setIsConverting(true)
            let file = audioFile;
            let fileName = "myFileName";
            const formData = new FormData();
            formData.append("file", file);
            formData.append("songName", path);//showing the audio
            formData.append("fileName", fileName);

            axios
              .post("http://localhost:5000/uploadAudio", formData)
              .then((res) => {
                console.log(res);
              
              if (res.data.message === "PDF generated successfully") {
                setViewAudio(true);
                setIsConverting(false);
              }
             
              })
              .catch((err) =>{
                console.log(err)
                setIsConverting(false); 
              });
            }
          }}

          style={{
            color: "LightGray",
            backgroundColor: "#0F52BD",
            fontSize: "20px",
            borderRadius: "10%",
            boxShadow: " 2px 2px blue",
            cursor: "pointer"
          }}
        />
        <br />
        <br />
        {isConverting && <Timer />}
        <div
          className="showAudio"
          style={{ display: viewAudio ? "block" : "none" }}
        >
          <audio src={path} controls />
          <br />
          <br />

          <input
            type="text"
            placeholder="name your song"
            style={{
              marginRight: "5%",
              fontSize: "18px",
              boxShadow: " 2px 1px black",
            }}
            onChange={(e) => {
              setNameSong(e.target.value);
            }}
            required
          />
          <input
            type="button"
            value="add to your history"
            style={{
              color: "LightGray",
              backgroundColor: "#0F52BD",
              fontSize: "20px",
              borderRadius: "10%",
              boxShadow: " 2px 2px blue",
              cursor: "pointer"
            }}
            onClick={() => {
              const newSong = {
                songName: nameSong,//"fileName"
                fileName: audioFile,//file
                filePath: path,    //"songName"
                userId: user.email
              };
          
              axios.post('http://localhost:5000/add_song', newSong)
                .then((res) => {
                  console.log(res.data);
                  if (res.data.message === "Song added successfully") {
                    alert("Song added to history successfully");
                  }
                })
                .catch((err) => {
                  console.log(err);
                  alert("Failed to add song to history");
                });
            }}
          />
          <br/>
           <button
              onClick={handleDownload}
              style={{
                color: "LightGray",
                backgroundColor: "#0F52BD",
                fontSize: "20px",
                borderRadius: "10%",
                boxShadow: " 2px 2px blue",
                cursor: "pointer",
                marginTop:"20px"
              }}
            >
              Download PDF
            </button>
        </div>
      </div>
    </div>
  );
}

export function HomePageNav() {
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
        to="/history"
      >
        History
      </Link>
      <Link
        style={{
          padding: "5%",
          paddingTop: "2%",
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontFamily: "monospace",
        }}
        to="/About"
      >
        About us
      </Link>
      <Link
        style={{
          padding: "3%",
          paddingTop: "1%",
          marginTop:"20px",
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontFamily: "monospace",
          height:"10px"
        }}
        to="/logOut"
      >
        Log-Out
      </Link>
      
    </div>
   
  
  );
}
