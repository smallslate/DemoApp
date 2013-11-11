var Hashids = function Hashids() {
	var Hashids = require("hashids");
	var hashids = new Hashids("AKIAIJAD5JCCLRDN3ENQ",8);

	this.encrypt = function (number) {
        return hashids.encrypt(number);
    };
};

Hashids.instance = null;

Hashids.getInstance = function(){
    if(this.instance === null){
    	 this.instance = new Hashids();
    }
    return this.instance;
};

module.exports = Hashids.getInstance();