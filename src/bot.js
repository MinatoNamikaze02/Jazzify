require('dotenv').config()
const { Client, MessageEmbed } = require('discord.js')
const fs = require("fs")
const {getAuth, spotifyRecommendations} = require('./spot-analytics/songs_sug.js')
const client = new Client()
const config = require('../config.json')
const { channel } = require('diagnostics_channel')
let PREFIX = ""

try{
    const jsonString = fs.readFileSync('./config.json', 'utf-8')
    const temp = JSON.parse(jsonString)
    PREFIX = temp.user.prefix
    console.log(PREFIX)
}catch (err){
    console.log(err)
}

const helpEmbed = new MessageEmbed()
.setTitle("Jazzify Bot")
.addField('Usage: ', 'The commands go:\n`<PREFIX><song> <..songs..><genre> <..genres..>`\nNOTE:\n *If the songs/genres have multiple words, combine it with a `-` \n*There can be maximum 2 song inputs and 1 genre input at max!!', true)
.setDescription('A Music Recommendation Bot!')
.setThumbnail('https://icons.iconarchive.com/icons/treetog/i/256/Audio-File-icon.png')
.setColor('#1DB954')
.setFooter("Check out the official website for more info!")





client.on('ready', () => {
    console.log(`${client.user.tag} has logged in`)
})

client.on('message', (message) => {
    if(message.author.bot){
        return;
    }

    if(message.content.startsWith(PREFIX)){
        const [cmd_name, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/)       

        if(!(args[0])) return;
        if(args[0] === "Hello" || args[0] === "hello"){
            message.channel.send("Hola!")
        }
        if(args[0] === "Thanks" || args[0] === "thanks"){
            message.channel.send("I don't know why but, You're Welcome!")
        }
        if(args[0] === "help" || args[0] === "Help"){
            message.channel.send(helpEmbed)
        }
        if(args[0]=="sug"){
            switch(args[1]){
                case "song":
                    if(!args[2]){
                        message.channel.send(helpEmbed)
                    }else{
                        let songs = []
                        let genres = []
                        let limit = 5 //default
                        var j = 0
                        for(i = 2; i < 5; i++){
                            if(args[i] == "genre"){
                                if(j == 0){
                                    message.channel.send("No songs given!!")
                                    return 
                                }else{
                                    j = 0
                                    break
                                }
                            }
                            songs[j] = args[i]
                            j++
                        }
                        if(j == 0){
                            if(args[i+1] == undefined){
                                message.channel.send("No genres given!!")
                                return
                            }
                            genres[0] = args[i+1]
                            console.log(genres)
                        }else{
                            message.channel.send("No genres given!!")
                            return
                        }
                        var result_now = getAuth(songs)
                            .then((result) => {
                                var auth_token = result.token
                                var res = result.res
                                var artists = []
                                for(var i = 0; i < res.length; i++){
                                    songs[i] = res[i].tracks.items[0].id
                                    artists[i] = res[i].tracks.items[0].album.artists[0].id
                                }
                                var result = spotifyRecommendations(artists, genres, songs, limit, auth_token)
                                    .then((res)=>{
                                        tracks = res.tracks
                                        links = []
                                        artists = []
                                        names = []
                                        duration = []
                                        for(var i = 0; i < tracks.length; i++){
                                            links[i] = tracks[i].external_urls.spotify
                                            artists[i] = tracks[i].artists[0].name
                                            names[i] = tracks[i].name
                                            duration[i] = Number(tracks[i].duration_ms)/1000
                                        }
                                        const recEmbed = new MessageEmbed()
                                            .setColor("#1DB954")
                                            .setTitle("Suggestions")
                                            .setThumbnail("https://icons.iconarchive.com/icons/treetog/i/256/Audio-File-icon.png")
                                            .addFields(
                                                {name: `1: ${names[0]}`, value: links[0], inline: true},
                                                {name: 'Artist:', value: artists[0], inline: true},
                                                {name: 'Duration:', value: `${duration[0]}s`, inline: true},
                                                {name: `2: ${names[1]}`, value: links[1], inline: true},
                                                {name: 'Artist:', value: artists[1], inline: true},
                                                {name: 'Duration:', value: `${duration[1]}s`, inline: true},
                                                {name: `3: ${names[2]}`, value: links[2], inline: true},
                                                {name: 'Artist:', value: artists[2], inline: true},
                                                {name: 'Duration:', value: `${duration[2]}s`, inline: true},
                                                {name: `4: ${names[3]}`, value: links[3], inline: true},
                                                {name: 'Artist:', value: artists[3], inline: true},
                                                {name: 'Duration:', value: `${duration[3]}s`, inline: true},
                                                {name: `5: ${names[4]}`, value: links[4], inline: true},
                                                {name: 'Artist:', value: artists[4], inline: true},
                                                {name: 'Duration:', value: `${duration[4]}s`, inline: true},

                                            )
                                            .setTimestamp()
                                            .setFooter("Check out the official website for more info!")                                        
                                        message.channel.send(recEmbed)
                                    })
                            })
                        /*
                        
                        */
                    }
            }
        }
    }
})

client.login(process.env.DISCORD_BOT_TOKEN)
