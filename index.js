//Made By Fasty48

//Dependencies
const express = require('express')
const bodyParser = require("body-parser")
const helmet = require('helmet')
const twit = require('twit')

var T = new twit({
	consumer_key: process.env.twitterConsumerKey,
	consumer_secret: process.env.twitterConsumerSecret,
	access_token: process.env.twitterAccessToken,
	access_token_secret: process.env.twitterAccessTokenSecret
})

//Main code
var app = express()
app.use(bodyParser.json())
app.use(helmet())

function tweet(msg, response) {
	T.post('statuses/update', { status: msg }, function (err, data) {
		if (err) {
			return response.status(400).send("Tweet couldn't be sent due to a error: ", err)
		} else {
			return response.status(200).send(`Tweet was sent out | Tweet ID: ${data.id_str}`)
		}
	})
}

app.post('/', function (req, res) {
	if (req.query.key === process.env.key) {
		//Correct key was used, so lets get the json that the site sent.
		const commitJson = req.body
		//Github sends a "zen" to test a webhook after a user has set up a webhook.
		if (!commitJson.zen) {
			//There is no "zen", this is a real change so lets gather the details.
			const repositoryName = commitJson.repository.name
			const filesAdded = commitJson.commits[0].added.length
			const filesModified = commitJson.commits[0].modified.length
			const filesRemoved = commitJson.commits[0].removed.length
			const commitURL = commitJson.commits[0].url
			if (commitJson.repository.private) {
				//The repository is private, so no need for the name or the url.
				//But, does the user have "tweetOnPrivateRepo" set to true
				if (process.env.tweetOnPrivateRepo) {
					//They have "tweetOnPrivateRepo" set to true
					tweet(`Changes have been made to a private repo:\n\n${filesAdded} files added\n${filesModified} files modified\n${filesRemoved} files removed`, res)
				} else {
					res.status(200).send('Tweet was not sent out due to the "tweetOnPrivateRepo" being set to false.')
				}
			} else {
				//Public repo
				tweet(`Changes have been made to ${repositoryName}:\n\n${filesAdded} files added\n${filesModified} files modified\n${filesRemoved} files removed\n\n${commitURL}`, res)
			}
		} else {
			//"Zen" was found, so it was a test from Github to see if works.
			//Report a 200 status code to prevent any worries.
			res.status(200).send('Github sent a webhook test payload.')
		}
	} else {
		//Key used was not the same as the one needed, throw an error to the user informing them
		res.status(403).send("Incorrect key is being used.\nCheck to see if key matches with the one on Heroku then click Redeliver and see if it works.")
	}
})

app.listen(process.env.PORT || 5000, function () {
	console.log('Listening')
})