// used to grab data from the user in the chrome browser
module.exports = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
