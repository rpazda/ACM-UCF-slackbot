var botKit = require("botkit");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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

controller.hears(["!whetherbot"],["ambient", "direct_message"],function(bot,message){
	var helptext = 
		"WhetherBot commands: \n!temp: Displays the local temperature near " + locationString
		+"\n!weatherinfo: Gives general weather information near " + locationString
		+"\n!rawweatherdata: Displays all available weather data near "+ locationString +" as unformatted JSON (only direct message)"
	;
	bot.reply(message, helptext);
});

controller.hears(["!temp"],["ambient", "direct_message"],function(bot,message){
	
	var weatherData = getWeatherData();
	
	var actualF = weatherData.current_observation.temp_f;
	var actualC = weatherData.current_observation.temp_c;
	
	var feelF = weatherData.current_observation.feelslike_f;
	var feelC = weatherData.current_observation.feelslike_c;
	
	var actualTemp = actualF + "° F " + "(" + actualC + "° C)";
	var feelslike = feelF + "° F " + "(" + feelC + "° C)";
	
	bot.reply(message, "The current temperature at "+ locationString +" is " + actualTemp + "\n" + locationString +" temperature feels like " + feelslike);
	
});

controller.hears(["!feelslike"],["ambient", "direct_message"],function(bot,message){
	
	var weatherData = getWeatherData();
	
	var actualF = weatherData.current_observation.temp_f;
	var actualC = weatherData.current_observation.temp_c;
	
	var feelF = weatherData.current_observation.feelslike_f;
	var feelC = weatherData.current_observation.feelslike_c;
	
	var actualTemp = actualF + "° F " + "(" + actualC + "° C)";
	var feelslike = feelF + "° F " + "(" + feelC + "° C)";
	
	bot.reply(message, "The current temperature at "+ locationString+" is " + actualTemp + "\n" + locationString +" temperature feels like " + feelslike);
	
});

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

controller.hears(["!rawweatherdata"],["direct_message"],function(bot,message){
	
	var weatherData = getRawWeatherData();
	
	bot.reply(message, weatherData);
	
});

function getWeatherData(){
	//var connectionString = "http://api.wunderground.com/api/" + wundergroundkey + "/conditions/q/" + lat + "/" + lon + ".json";
	//bot.reply(message, weatherdata);
	//console.log(weatherdata);
	//console.log(parsedWeatherData);
	
	var connectionString = "http://api.wunderground.com/api/" + wundergroundkey + "/conditions/q/" + lat + "/" + lon + ".json";
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
