$SpiderCog = (SpiderCog = function() {this.init()}).prototype = new Cog;

$SpiderCog.setup_functions.push();

$SpiderCog.main = function() {
    console.log("Main!");
}

$SpiderCog.start = function() {
    $.get('/cable/', this.bind('cable_start'));
}

$SpiderCog.stop = function() {
    console.log("Stop!");
}

$SpiderCog.cable_start = function (a,b,c,d) {
    console.log(this,a,b,c,d);
}
