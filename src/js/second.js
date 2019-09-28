setTimeout(() => console.log('hi'), 3000);

let n  = document.createElement('div');
n.innerHTML = require('./templates/new.twig')();
document.body.appendChild(n);