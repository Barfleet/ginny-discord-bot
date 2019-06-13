module.exports = {
	name: 'reactions',
	aliases: [],
	admin: true,
	description: 'Lists all of the available reactions in the database.',
	usage: '',
	execute(msg, data) {
		if(data.isAdmin) {
			var response = 'This is the current list of Reactions. Type !reload to reload from the database.\n\n';
	        for(var i = 0; i < data.config.reactions.length; i++) {
	            for(var j = 0; j < data.config.reactions[i].Responses.length; j++) {
	                response += data.config.reactions[i].Trigger + ' => ' + data.config.reactions[i].Responses[j] + '\n';
	                if(response.length > 1850) {
	                    msg.author.send(response, { "code": true });
	                    response = '';
	                }
	            }
	        }
			if(response.length > 0)
		        msg.author.send(response, { "code": true });
		}
	},
};
