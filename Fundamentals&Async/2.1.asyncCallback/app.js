console.log('1.Starting app');


setTimeout(() => {
  console.log('2.First code callback async');
}, 200);

setTimeout(() => {
  console.log('3.1.Second code callback async');
}, 0);
setTimeout(() => {
  console.log('3.2.Second code callback async');
}, 0);
setTimeout(() => {
  console.log('3.3.Second code callback async');
}, 0);
setTimeout(() => {
  console.log('3.4.Second code callback async');
}, 0);

setTimeout( function () {
  console.log('4.Third code callback (in other way)');
}, 100);

console.log('5.Finishing app, (callStack finish program before EventLoop)');
