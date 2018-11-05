console.log('Starting notes.js');

module.exports.age = 40;

module.exports.addNote = () => {
  console.log('addNote');
  return 'New note';
};

module.exports.add = (a, b) => {
  return a + b;
};
