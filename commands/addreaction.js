module.exports = {
    name: 'addreact',
	aliases: [],
	admin: true,
    description: 'Adds a new reaction to the database. Use a comma for multiple trigger words.',
	usage: '!addreact "trigger" "response"',
    execute(msg, data) {
		if(data.isAdmin) {
			var parts = msg.content.match(/"([^"]+)"\s"([^"]+)"/);
	   	    if(parts == null || parts.length != 3)
	            parts = msg.content.match(/'([^']+)'\s'([^']+)'/);
	        if(parts == null || parts.length != 3)
	            msg.reply('Invalid format of the Add Reaction command. I\'m expecting: !addreact "trigger" "response" (Single quotes will work too.)');
	        else
	            addReaction(msg, data, parts[1], parts[2]);
		}
	},
};

const mysql = require('mysql2/promise');

async function addReaction(msg, data, trigger, response) {
    try {
        mysql.createConnection({user: data.config.sqluser, password: data.config.sqlpass, database: 'ginny_bot'})
            .then(conn => conn.query('INSERT INTO ChatReactions SET ?', { TriggerPhrase: trigger, Response: response }))
            .then(([results, fields]) => {
                var triggers = trigger.split(',');
                for(var t = 0; t < triggers.length; t++) {
                    var trig = triggers[t].trim();
                    var found = false;
                    for(r = 0; r < data.config.reactions.length; r++) {
                        if(data.config.reactions[r].Trigger === trig) {
                            data.config.reactions[r].Responses.push(response);
                            found = true;
                            break;
                        }
                    }
                    if(!found)
                        data.config.reactions.push({Trigger: trig, Responses: [response]});
                }
                msg.reply('Reaction added to the database: ' + trigger + ' => ' + response);
            });
    }
    catch(err) {
        console.log('Error writing new Reaction: ' + err.message);
        msg.reply('Sorry, I couldn\'t save the Reaction: ' + err.message);
    }
}

