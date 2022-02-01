//https://discord.com/developers/applications LastShotBCN BOT
const Discord = require('discord.js');
const { initial } = require('underscore');
const client = new Discord.Client();




const init = async () => {

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
        client.user.setStatus("online");
    });

    client.on('interaction', async interaction => {
        if (!interaction.isCommand()) return;
        if (interaction.commandName === 'ping') {
            await interaction.reply('Pong!');
        }
    });




    client.once('ready', () => {
        console.log('Ready!');
        client.user.setStatus("online");
        console.log(client.user);
        sendMessageToUser();
    });

    //TEST  Send !ping to BOT
    client.on('message', message => {
        /*       let response = 'This is an automatic BOT for notifications of LastShotBCN Server, if you want to contact with admins send a message to Server Admin or Server Manager';
              let pong = 'Pong.';
              console.log(':' + message.content + ':');
              if (message.content && message.content != '' && message.content != response && message.content != pong) { */
        console.log(message);
        console.log('\x1b[32m', message.channel.type);
        console.log('\x1b[32m', message.author.id);

        if (message.channel.type === 'dm' && message.content.toUpperCase() === '#OK' )  message.channel.send('Activated');

        if (message.content === '!ping') {
            // send back "Pong." to the channel the message was sent in
            message.channel.send('Pong.');
            /*    } else {
                   message.channel.send(response);
               } */
        }
    });


    await client.login('ODU2ODg1MzY0ODIzOTQ5Mzgz.YNHirw.FAKE_LOGIN');


    client.users.fetch('327848104223047680').then( async (user) => {
        try{
        let text = await getConfirmationDiscordText("Jer");        
        user.send(text );
        
        user.send(await getActivatedDiscordText("Jer"));        
        user.send(await getRaidDiscordText("Jer", "231231232131"));
    } catch (error)  { console.log (error)}
        
    });


}

const sendMessageToUser = async () => {
    console.log("entra");
    const user = await getUser('32784813342553047680');
    //client.users.get("327848104223047680");
    console.log(user);
    //user.createDM.send('content for you');    
}




//To send a Direct Message you need the User Object. You can get the cached users from client.users, but the user might not be in cache. To "load" that user and send him a message you can do something like this:
//client.users.fetch('123456789').then((user) => {
//  user.send("My Message");
//});
const getUser = async (id) => {
    return new Promise((resolve, reject) => {
        client.users.cache.get(id, (error, result) => { //get result or error
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter               
                if (error) throw error;  //if redis give me an error. 
                else resolve(result); // everything is OK, return result                
            } catch (error) { reject(error); } // In Callback we need to reject
        });
    });
    //.then((result) => { return result; })  //return the result, it's unnecessary but maybe we will need put some lógic...
    //.catch((error) => { throw error; });  //throw Error exception to the main code, it's unnecessary but maybe we will need put some lógic...  A reject callback will pass through here.
}


const getConfirmationDiscordText = async (player) => {
    let codeMail = 'Hi ' + player + ', a confimation account is required to complete the Base Alert feature on LastShotBCN.**Please, type #OK for confirmation.**\n';
    codeMail = codeMail + '*If you are not the player who joined on LastShotBCN then please reply #NO, and we will consider bann player and delete this discord addressID from our servers to ensure your account security.*';        
    return codeMail;
}


const getActivatedDiscordText = async (player) => {
    let codeMail = 'Hi ' + player + ', **Base alerts on your discord account have been activated**. Good luck on LastShot.';
    return codeMail;
}

const getRaidDiscordText = async (player, steamid) => {
    let codeMail = 'Hi ' + player + ', **Your base is under attack! Protect your crates** . *This is an alert because some Miscreated player try to raid your base (next alert in 30min.); The base belongs to this steam user account: https://steamcommunity.com/profiles/';
    codeMail = codeMail + steamid + ' .*';
    return codeMail;
}



init();