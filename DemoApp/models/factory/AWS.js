var AWS = function AWS() {
    var AWSSDK = require('aws-sdk');
	AWSSDK.config.loadFromPath('./config.json');
	
    AWSSDK.config.apiVersions = {
			  s3: '2013-11-11'
	};   
    
    this.getAWSQuizBucket = function (){
        return new AWSSDK.S3({params: {Bucket: 'uqi'}});
    };
};

AWS.instance = null;

AWS.getInstance = function(){
    if(this.instance === null){
        this.instance = new AWS();
    }
    return this.instance;
};

module.exports = AWS.getInstance();