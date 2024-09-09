let count=0
export function NewSong(path,name,date,score){
this.songId=count++
this.path=path
this.name=name
this.date=date
this.score=score
}