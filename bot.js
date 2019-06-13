#!/usr/bin/env node
const fs = require('fs');
const Discord = require('discord.js');

const mysql = require('mysql2/promise');
const config = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

async function loadCommands() {
	client.commands.clear();
	const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	for(const file of files) {
		const command = require(`./commands/${file}`);
		console.log('Loading: !' + command.name);
		client.commands.set(command.name, command);
		for(var i = 0; i < command.aliases.length; i++) {
			client.commands.set(command.aliases[i], command);
		}
	}
}

async function loadReactions() {
	mysql.createConnection({user: config.sqluser, password: config.sqlpass, database: 'ginny_bot'})
		.then(conn => conn.query('SELECT TriggerPhrase, Response FROM ChatReactions ORDER BY TriggerPhrase;'))
		.then(([results, fields]) => {
			config.reactions = [];
			for(var i = 0; i < results.length; i++) {
				var triggers = results[i].TriggerPhrase.split(',');
				var response = results[i].Response;
				for(var t = 0; t < triggers.length; t++) {
					var trigger = triggers[t].trim();
					var found = false;
					for(r = 0; r < config.reactions.length; r++) {
						if(config.reactions[r].Trigger === trigger) {
							config.reactions[r].Responses.push(response);
							found = true;
							break;
						}
					}
					if(!found) 
						config.reactions.push({Trigger: trigger, Responses: [response]});
				}
			}
		})
		.then(results => console.log('Loaded ' + config.reactions.length + ' reactions.'));
}

function isAdmin(id) {
	const member = client.guilds.first().members.get(id);
	var admin = member.roles.some(r => r.name === 'Server Admins');
	admin = admin || member.roles.some(r => r.name === 'Full Administrators');
	// Add other roles here if necessary: admin = admin || member.roles.some(r => r.name === 'Role Name');
	return admin;
}

process.on('uncaughtException', (error) => {
	console.log(error);
	client.channels.find(chan => chan.name === 'server-admins').send('Shit. I crashed. Reason: ' + error.message);
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
});

client.on('ready', () => {
	loadCommands();
	loadReactions();
	console.log(`Logged in as ${client.user.tag}!`);
	//client.channels.find(chan => chan.name === 'server-admins').send('Ginny has been successfully started.');
});

client.on('guildMemberAdd', member => {
	member.send('Greetings, inebrium-deficient sentient. This is a private server meant for members of the Barfleet organization. You will be vetted for valid membership shortly, then given the appropriate permissions to participate. If you are not a member in good standing, you will be removed from this server. Thank you for your cooperation.');
});

client.on('message', msg => {
	if(msg.author.bot) return; // Please don't encourage Ginny to talk to herself.
	var line = msg.content.toLowerCase();
	var command = msg.content.slice(1).split(/ +/).shift();
	if(command === 'reload' && isAdmin(msg.author.id)) {
        loadCommands().then(loadReactions()).then(msg.reply('I\'ve reloaded the commands and reactions database. ' + client.commands.size + ' commands and ' + config.reactions.length + ' trigger phrases loaded.'));
        return;
    }
	if(client.commands.has(command)) {
		try {
			var admin = isAdmin(msg.author.id);
			client.commands.get(command).execute(msg, { "line": line, "isAdmin": admin, "config": config, "commands": client.commands } );
		} catch (err) {
			console.error(err);
			msg.author.send('There was an error executing your command, sorry!');
		}
	}
	else {
		for(var i = 0; i < config.reactions.length; i++) {
			if(line.includes(config.reactions[i].Trigger.toLowerCase())) {
				console.log('Reacting to "' + config.reactions[i].Trigger + '" by ' + msg.author.username);
				var r = Math.floor(Math.random() * config.reactions[i].Responses.length);
				msg.channel.send(config.reactions[i].Responses[r]);
			}
		}
	}
});

client.login(config.token);
