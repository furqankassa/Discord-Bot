  const Discord = require('discord.js');
  const client = new Discord.Client();

  // include modules for using sqlite (database)
  const sqlite = require("sqlite");
  const sqlite3 = require("sqlite3");

  // API_key (unqiue)
  // URL to for the API call
  const API_KEY = "7554693ef99302d439d15328377e5878";
  const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?q=";

  // Discord bot token
  client.login("MTA2NjU4Njk4NzQyOTExMzg5Ng.Gj0jCT.8o6tEQ_Fm6wOGvARk7G5bwZ691wIng1TJ0gXHw");

  // when Discord bot is online, lets me know
  // sends user how to get weather info on US city
  client.on("ready", async () => {
    console.log(`${client.user.username} has logged in.`);
    // await client.channels.cache.get("1066587644861104172").send("Hello! Hopefully everything's going well for everyone!");
    // await client.channels.cache.get("1066587644861104172").send("New feature drop! To find the weather in the US, follow this format! i.e. Seattle WA")
  });

  // interacts with a user on discord depending on the message
  client.on("message", async (message) => {
    if(message.author.bot) { return; }
    if(message.content === "Weather") {
        message.reply("Try this format i.e 'Seattle WA' to find the weather!");
    }
    getWeatherData(message.content, message);
  });

  // makes an GET request to weather API
  // make sure to take account of cities with 2 names in it
  // 
  async function getWeatherData(name, message) {
    let stateName = name.split(" ");
    let loc = "";
    let cityName = "";
    if(stateName.length > 2) {
      for(let i = 0; i < stateName.length - 1; i++) {
        if(i == stateName.length - 2) {
          cityName += stateName[i];
          loc += stateName[i];
        } else {
          cityName += stateName[i] + " ";
          loc += stateName[i] + "%20";
        }
      }
    } else {
      loc = stateName[0];
      cityName = stateName[0];
    }
    fetch(BASE_URL + loc + "," + stateName[stateName.length - 1] + ",US&units=metric&appid=" + API_KEY)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(resp => {
        showWeatherData(cityName, stateName[stateName.length - 1], resp, message)
      })
      .catch(handleError);
  }

  // connects to the database of all US cities to check if it exists
  // if it does, bot sends a message to user in discord
  async function showWeatherData(city, code, resp, message) {
    let db = await getDBConnection();
    console.log(city + code);
    let query = "SELECT COUNT(*) AS CityCount FROM cities WHERE city = ? AND state_code = ?";
    let count = await db.all(query, [city, code]);
    if(count[0].CityCount == 1) {
      message.reply("Here's the temperature for " + city + ", " + code + ": " + resp.main.temp + " celsius!");
    } else {
      if(code.length == 2) {
        message.reply("Are you sure that's the correct format? Please make sure the state code or city is spelt correctly!");
      }
    }
  }

  // Connects with the US_Cities database
  // to ensure the city selected exists
  async function getDBConnection() {
    const db = await sqlite.open({
        filename: "US_Cities.db",
        driver: sqlite3.Database
    });
    return db;
  }
    
  // lmk if there's an error lol
  function handleError() {
    console.log("ERROR");
  }

  // checks the status of the API
  async function statusCheck(response) {
    if(!response.ok) {
      throw new Error(await response.txt());
    }
    return response;
  }