require('dotenv').config()
const axios = require('axios')
const qs = require('qs')
const client = process.env.client
const secret = process.env.secret
const auth_token = Buffer.from(`${client}:${secret}`, 'utf-8').toString('base64');



const getAuth = async (songs) => {
    try{
      //make post request to SPOTIFY API for access token, sending relavent info
      const token_url = 'https://accounts.spotify.com/api/token';
      const data = qs.stringify({'grant_type':'client_credentials'});
      const response = await axios.post(token_url, data, {
        headers: { 
            'Authorization': `Basic ${auth_token}`,
            'Content-Type': 'application/x-www-form-urlencoded' 
        }
      })
      //return access token
      var resu
      //console.log(`TOKEN: ${response.data.access_token}`)
      var res = await spotifyAnalytics(response.data.access_token, songs)
            .then((result) => {
                resu = result
            })
      return {
        'res' : resu,
        'token' : response.data.access_token
      }
    }catch(error){
      //on fail, log the error in console
      //console.log(error);
      return
    }
}

const spotifyAnalytics = async (res, songs) => {
    let BASE_URL = "https://api.spotify.com/v1/search?q="
    var links = []
    var res_array = []
    for(var i = 0; i < songs.length; i++){
        var temp_url = BASE_URL
        var cur_song = songs[i]
        cur_song = cur_song.replace("-", "%20")
        temp_url += cur_song
        temp_url += "&type=track"
        temp_url += "&limit=1"
        links[i] = temp_url
        try{        
            const response = await axios.get(temp_url, {
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${res}`
                }
            })
            res_array[i] = response.data
            
        }catch(err){
            console.log(err.message)
            console.log("err")
            break
        }
    }
    return res_array

}

const spotifyRecommendations = async (artists, genres, songs, limit, token) => {
    console.log(artists)
    console.log(genres)
    //console.log(token)
    console.log(songs)
    console.log(limit)
    console.log(`TOKEN: ${token}`)
    let rec_url = "https://api.spotify.com/v1/recommendations?"
    let artists_url = "&seed_artists="
    let tracks_url = "&seed_tracks="
    let genres_url = "&seed_genres="
    for(var i = 0; i < artists.length; i++){
        if(artists.length == 1 || i+1 == artists.length){
            artists_url += artists[i]
            tracks_url += songs[i]
        }else{
            artists_url += artists[i] + "%2C"
            tracks_url += songs[i] + "%2C"
        }
    }
    for(var i = 0; i<genres.length; i++){
        if(genres.length == 1 || i+1 == genres.length){
            genres_url += genres[i]
        }else{
            genres_url += genres[i] + "%2C"
        }
    }
    let limit_url = `limit=${limit}`
    rec_url += limit_url + artists_url + genres_url + tracks_url
    console.log(rec_url)
    try{
        const response = await axios.get(rec_url, {
            headers : {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        return response.data
        
    }catch(err){
        console.log(err)
    }

}





module.exports = {getAuth, spotifyRecommendations}