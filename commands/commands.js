module.exports = {
	name: 'commands',
	aliases: [ 'cmds', 'cmd' ],
	admin: true,
	description: 'Lists all commands Ginny recognizes.',
	usage: '',
	execute(msg, data) {
		var response = '';
		var seen = [];
		for(const cmd of data.commands.values()) {
			if(cmd.admin && !data.isAdmin)
				continue;
			if(seen.includes(cmd.name))
				continue;
			seen.push(cmd.name);

			response += '!' + cmd.name + ' -- ';
			if(data.isAdmin)
				response += '[Admin Only] '
			response += cmd.description;
			if(cmd.aliases.length > 0) {
				response += ' (Aliases: ';
				for(const alias of cmd.aliases)
					response += '!' + alias + ' ';
				response += ')';
			}
			response += '\n';
			if(cmd.usage != null && cmd.usage != '')
				response += '     Usage: ' + cmd.usage + '\n';
		}
		if(response.length > 0) {
			if(data.isAdmin) {
				response += '!reload -- [Admin Only] Reloads all commands and database settings.\n';
			}
    	    msg.author.send('Available Commands that Ginny will respond to, if she\'s feeling generous:\n' + response, { "code": true });
		}
		else
			msg.author.send('Sorry, all commands are presently Admin Only.');
	},
};
