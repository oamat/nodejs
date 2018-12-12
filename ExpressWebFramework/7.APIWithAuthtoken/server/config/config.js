
console.log(process.env.MONGO_URL);
if (process.env.MONGO_URL != null) {  //For Docker
  process.env.MONGODB_URI = process.env.MONGO_URL;
  process.env.PORT = 3000;
} else if (env === 'test') {   //For Dev test
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
  process.env.PORT = 3000;
}

