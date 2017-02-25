var botKit = require("botkit");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var cheerio = require("cheerio");
var http = require("http");
var request = require("request");

var config = require("./config.secret.json");
//console.log(config.accesstoken);//REMOVE
var controller = botKit.slackbot();

var bot = controller.spawn({
	token: config.accesstoken
});

var wundergroundkey = config.wundergroundkey;
var lat = config.lat;
var lon = config.lon;
var locationString = config.locationString;

bot.startRTM(function(err, bot, payload){
	if (err){
		throw new Error("Could not connect to slack");
	}
});

// !acmebot : introduces available commands
controller.hears(["!acmebot"],["ambient", "direct_message"],function(bot,message){
	var helptext = 
		"ACMeBot commands: \n*!temp*: Displays the local temperature near " + locationString
		+"\n*!weatherinfo*: Gives general weather information near " + locationString
		+"\n*!rawweatherdata*: Displays all available weather data near "+ locationString +" as unformatted JSON (only direct message)"+
		"\n*!garagecount*: Displays count of available spaces in UCF parking garages A, B, C, D, H, I, and Libra"
	;
	bot.reply(message, helptext);
});

// !temp : gives local temperature
controller.hears(["!temp"],["ambient", "direct_message"],function(bot,message){
	
	var weatherData = getWeatherData();
	
	var actualF = weatherData.current_observation.temp_f;
	var actualC = weatherData.current_observation.temp_c;
	
	var feelF = weatherData.current_observation.feelslike_f;
	var feelC = weatherData.current_observation.feelslike_c;
	
	var actualTemp = actualF + "° F " + "(" + actualC + "° C)";
	var feelslike = feelF + "° F " + "(" + feelC + "° C)";
	
	bot.reply(message, "The current temperature near "+ locationString +" is " + actualTemp + "\n" + locationString +" temperature feels like " + feelslike);
	
});

// !feelslike : gives local temperature accounting for humidity
controller.hears(["!feelslike"],["ambient", "direct_message"],function(bot,message){
	
	var weatherData = getWeatherData();
	
	var actualF = weatherData.current_observation.temp_f;
	var actualC = weatherData.current_observation.temp_c;
	
	var feelF = weatherData.current_observation.feelslike_f;
	var feelC = weatherData.current_observation.feelslike_c;
	
	var actualTemp = actualF + "° F " + "(" + actualC + "° C)";
	var feelslike = feelF + "° F " + "(" + feelC + "° C)";
	
	bot.reply(message, "The current temperature near "+ locationString+" is " + actualTemp + "\n" + locationString +" temperature feels like " + feelslike);
	
});

// !weatherinfo : gives detailed weather information
controller.hears(["!weatherinfo"],["ambient", "direct_message"],function(bot,message){
	
	var weatherData = getWeatherData();
	
	var actualF = weatherData.current_observation.temp_f;
	var actualC = weatherData.current_observation.temp_c;
	
	var feelF = weatherData.current_observation.feelslike_f;
	var feelC = weatherData.current_observation.feelslike_c;
	
	var relHumid = weatherData.current_observation.relative_humidity;
	var weatherType = weatherData.current_observation.weather;
	var UVindex = weatherData.current_observation.UV;
	
	var windStrength = weatherData.current_observation.wind_string;
	var windSpeed = weatherData.current_observation.wind_mph;
	var windDir = weatherData.current_observation.wind_dir;
	
	var actualTemp = actualF + "° F " + "(" + actualC + "° C)";
	var feelslike = feelF + "° F " + "(" + feelC + "° C)";
	
	bot.reply(message, "The weather near " + locationString + " is " + weatherType
		+ "\nThe current temperature is " + actualTemp + "\nThe temperature feels like " + feelslike
		+ "\nThe relative humidity is " + relHumid + "\nThe UV index is " + UVindex 
		+ "\nThe wind is blowing " + windSpeed + " mph " + windDir);
	
});

// !rawweatherdata : gives full json data of weather information, dm only
controller.hears(["!rawweatherdata"],["direct_message"],function(bot,message){
	
	var weatherData = getRawWeatherData();
	
	bot.reply(message, weatherData);
	
});

// !garagecount : prints a list of the counts of available spaces in the parking garages
controller.hears(["!garagecount"],["ambient", "direct_message"],function(bot, message){

	getGarageCounts(function(err, results){
		
		var info;
		info = "The current number of available spaces for each UCF garage is:" 
		+ "\n*Garage A*:      " + results[0]
		+ "\n*Garage B*:      " + results[1]
		+ "\n*Garage C*:      " + results[2]
		+ "\n*Garage D*:      " + results[3]
		+ "\n*Garage H*:      " + results[4]
		+ "\n*Garage I*:        " + results[5]
		+ "\n*Garage Libra*: " + results[6];
		
		bot.reply(message, info);
	});
	
});

function getWeatherData(){
	//var connectionString = "http://api.wunderground.com/api/" + wundergroundkey + "/conditions/q/" + lat + "/" + lon + ".json";
	//bot.reply(message, weatherdata);
	//console.log(weatherdata);
	//console.log(parsedWeatherData);
	
	var connectionString = "http://api.wunderground.com/api/" + wundergroundkey + "/conditions/q/FL/Oviedo.json";
	var weatherData = httpGet(connectionString);
	
	var parsedWeatherData =  JSON.parse(weatherData);
	
	return parsedWeatherData;
}

function getRawWeatherData(){

	var connectionString = "http://api.wunderground.com/api/" + wundergroundkey + "/conditions/q/" + lat + "/" + lon + ".json";
	var weatherData = httpGet(connectionString);
	
	return weatherData;
}

function httpGet(theUrl)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
	xmlHttp.send( null );
	return xmlHttp.responseText;
}

//Gets counts of available spaces for the garages listed. Returns an array of counts
function getGarageCounts(callback){

	var connectionString = "http://secure.parking.ucf.edu/GarageCount/iframe.aspx/";
	
	request(connectionString, function(error, response, body){
		
		$ = cheerio.load(body);
		var garageCounts = [];
		
		garageCounts[0] = $(config.garageAid).find("strong").html();	//Get garage counts by unique IDs, stored in config
		garageCounts[1] = $(config.garageBid).find("strong").html();
		garageCounts[2] = $(config.garageCid).find("strong").html();
		garageCounts[3] = $(config.garageDid).find("strong").html();
		garageCounts[4] = $(config.garageHid).find("strong").html();
		garageCounts[5] = $(config.garageIid).find("strong").html();
		garageCounts[6] = $(config.garageLibraid).find("strong").html();
		
		console.log(garageCounts);

		callback(null, garageCounts)
	});
	
	//$('.dxgvDataRow_DevEx').each();	//Select divs with counts by class
	//Derived from https://github.com/KnightHacks/hubot/blob/master/scripts/garage.coffee
}
