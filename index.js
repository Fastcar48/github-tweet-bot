//Made By Fasty48

//Modules
const express = require('express')
const bodyParser = require("body-parser")
const twit = require('twit')

//Config
const port = process.env.PORT || 5000
const apiKey = process.env.key

var T = new twit({
	consumer_key: process.env.twitterConsumerKey,
	consumer_secret: process.env.twitterConsumerSecret,
	access_token: process.env.twitterAccessToken,
	access_token_secret: process.env.twitterAccessTokenSecret
})

//Main code
var app = express()
app.use(bodyParser.json())

app.post('/',function(req,res){
	if (req.query.key === apiKey){
		const commitJson = req.body
		if (typeof commitJson.zen === 'undefined'){
			const repositoryName = commitJson.repository.name
			const filesAdded = commitJson.commits[0].added.length
			const filesModified = commitJson.commits[0].modified.length
			const filesRemoved = commitJson.commits[0].removed.length
			const commitURL = commitJson.commits[0].url
			T.post('statuses/update',{status:"Changes have been made to "+repositoryName+":\n\n"+filesAdded+" files added\n"+filesModified+" files modified\n"+filesRemoved+" files removed\n\n"+commitURL}, function(err, data, response){
				if (err){
					console.log('There was a problem tweeting this message.', err)
					res.sendStatus(400)
				} else {
					res.sendStatus(200)
				}
			})

		} else {
			res.sendStatus(200)
		}
	} else {
		res.sendStatus(403)
	}
})

app.listen(port,function(){
	console.log('Listening on port', port)
})