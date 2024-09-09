import axios from 'axios';
import { useState, useEffect } from 'react';
import { getUser } from '../data/user';

const FetchSongs = ({ userId }) => {
  let user = getUser();
  const [songs, setSongs] = useState([]);
  const removeSong = (songId) => {
    axios.delete('http://localhost:5000/remove_song', { data: { songId, userId: user.email } })
      .then((res) => {
        console.log(res.data);
        if (res.data.message === "Song removed successfully") {
          alert("Song removed from history successfully");
          // Optionally update the state to remove the song from the list
          setSongs(songs.filter(song => song._id !== songId));
        }
      })
      .catch((err) => {
        console.log(err);
        alert("Failed to remove song from history");
      });
  };
  const handleDownload = ({nameSong,audiofile,path}) => {
            const formData = new FormData();
            formData.append("file", audiofile);
            formData.append("songName", path);//showing the audio
            formData.append("fileName", nameSong);

            axios
              .post("http://localhost:5000/uploadAudio", formData)
              .then((res) => {
                console.log(res);
              })
              .catch((err) =>{
                console.log(err) 
              });
              
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
                  
  };
  
  useEffect(() => {
    const fetchSongs = () => {
      axios.get(`http://localhost:5000/songs/${userId}`)
        .then((res) => {
          setSongs(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    fetchSongs();
  }, [userId]);

  return (
    <div>
      <div style={{border:"#0F52BD solid 2px",width:"800px",display:"flex",flexDirection:"column", gap:"5px",marginLeft:"20%"}}>
        {songs.map(song => (
          <div style={{border:"#0F52BD solid 2px",width:"600px",marginLeft:"13%"}} key={song.id}>
            <h4 style={{fontFamily:"Bahnschrift SemiBold"}}>🎵 {song.songName}  </h4> 
            <audio src={song.filePath} controls /> 
            <input  type="button" value="⬇️" style={{backgroundColor:"rgb(220, 230, 250)",border:"solid rgb(220, 230, 250) 2px",fontSize:"40px",cursor: "pointer"}} 
            onClick={() => handleDownload({ nameSong: song.songName, audiofile: song.fileName, path:song.filePath })}></input>
            <input  type="button" value="✖️" style={{backgroundColor:"rgb(220, 230, 250)",border:"solid rgb(220, 230, 250) 2px",fontSize:"40px",cursor: "pointer"}}
             onClick={() => removeSong(song.id)}></input>
            </div>
        ))}
      </div>
    </div>
  );
};

export default FetchSongs;