var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var redis = require('redis');

var app = express();

// Create Client
var client = redis.createClient({host: '192.168.99.100', port: '6379'});

//initialize tasks
client.rpush('tasks', "tasks1");
client.rpush('tasks', "tasks2");
client.rpush('tasks', "tasks3");
//initialize Hash
client.hset('call', 'title', 'Task Redis web');
client.hmset('call', ['name', 'Oriol', 'company', 'OAF', 'phone', '+34699000000', 'time', 'Monday at 9:00']);

client.on('connect', function(){
	console.log('Redis Server Connected...');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	var title = 'Task List';

	client.lrange('tasks', 0, -1, function(err, reply){
		client.hgetall('call', function(err, call){
			res.render('index', {
			title: title,
			tasks: reply,
			call: call
		});
		});
	});
});

app.post('/task/add', function(req, res){
	var task = req.body.task;

	client.rpush('tasks', task, function(err, reply){
		if(err){
			console.log(err);
		}
		console.log('Task Added...');
		res.redirect('/');
	});
});

app.post('/task/delete', function(req, res){
	var tasksToDel = req.body.tasks;

	client.lrange('tasks', 0, -1, function(err, tasks){
		for(var i = 0;i < tasks.length;i++){
			if(tasksToDel.indexOf(tasks[i]) > -1){
				client.lrem('tasks',0, tasks[i], function(){
					if(err){
						console.log(err);
					}
				});
			}
		}
		res.redirect('/');
	});
});

app.post('/call/add', function(req, res){
	var newCall = {};

	newCall.name = req.body.name;
	newCall.company = req.body.company;
	newCall.phone = req.body.phone;
	newCall.time = req.body.time;

	client.hmset('call', ['name', newCall.name, 'company', newCall.company, 'phone', newCall.phone, 'time', newCall.time], function(err, reply){
		if(err){
			console.log(err);
		}
		console.log(reply);
		res.redirect('/');
	});
});

app.listen(3000);
console.log('Server Started On Port 3000...');

module.exports = app;