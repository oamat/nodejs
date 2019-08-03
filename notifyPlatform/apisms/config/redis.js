var redis = require('redis');
// Create Client
var client = redis.createClient({host: '192.168.99.100', port: '6379'});