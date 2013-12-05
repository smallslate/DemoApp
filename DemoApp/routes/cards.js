var db = require("../models/factory/Database"),
	aws = require("../models/factory/AWS"),
	Sequelize = require('sequelize'),
	fs = require('fs'),
	hashids = require("../models/factory/Hashids");
module.exports = Cards;

function Cards() {}

Cards.cardsHome = function(req,res) {
	res.render('cards/cardsHome');	
};

Cards.createCard = function(req,res) {
	res.render('user/cards/create/createCard');	
};

Cards.myFlashCards = function(req,res) {
	res.render('user/cards/myFlashCards');	
};

Cards.crudFlashDeckDetails = function(req,res) {
	if(req.isAuthenticated()) {
		var requestObj = req.body;
		if(requestObj.action =='create') {
			var flashDeckObj = requestObj.flashDeckObj;
			flashDeckObj.createdBy = flashDeckObj.updatedBy = req.user.loggedInUserId;
			db.model("FlashDeck").create(flashDeckObj,[ 'flashDeckName','flashDeckDescr','flashDeckImg','categoryCode','subCategoryCode','createdBy','updatedBy']).success(function(newflashDeckObj) {
				newflashDeckObj.dataValues.flashDeckCode = newflashDeckObj.flashDeckCode = hashids.encrypt(newflashDeckObj.flashDeckId);
				newflashDeckObj.save(['flashDeckCode']);
				newflashDeckObj.dataValues.success ='Flash Deck details saved successfully';
				res.send(newflashDeckObj.dataValues);
			}).error(function(err) {
				console.log('newflashDeckObj.crudExam action = create = '+err);
				newflashDeckObj.error = "Cannot save Flash Deck details.Please try again";
				res.send(newflashDeckObj);
			});
		} else if(requestObj.action =='update' || requestObj.action =='addCards') {
			var flashDeckObj = requestObj.flashDeckObj;
			db.model("FlashDeck").find({ where: {flashDeckCode: flashDeckObj.flashDeckCode,isActive:true} }).success(function(dbflashDeckObj) {
				if(res.locals.isAdmin || dbExamObj.createdBy == req.user.loggedInUserId) {
					dbflashDeckObj.flashDeckName = flashDeckObj.flashDeckName;
					dbflashDeckObj.flashDeckDescr = flashDeckObj.flashDeckDescr;
					dbflashDeckObj.categoryCode = flashDeckObj.categoryCode;
					dbflashDeckObj.subCategoryCode = flashDeckObj.subCategoryCode;
					dbflashDeckObj.updatedBy = flashDeckObj.updatedBy = req.user.loggedInUserId;
					dbflashDeckObj.save(['flashDeckName','flashDeckDescr','categoryCode','subCategoryCode','updatedBy']);
					flashDeckObj.success ='Flash Deck details updated successfully';
					res.send(flashDeckObj);
				} else {
					flashDeckObj.error = "You do not have access to update this Flash Deck.";
					res.send(flashDeckObj);
				}
			}).error(function(err) {
				console.log('Flash Deck.crudFlashDeckDetails action = update = '+err);
				flashDeckObj.error = "Cannot update Flash Deck details.Please try again";
				res.send(flashDeckObj);
			});
		} else if(requestObj.action == 'getFlashDeckDetails') {
			db.model("FlashDeck").find({where: {flashDeckCode:req.body.flashDeckCode,isActive:true},include:[{model: db.model("FlashCard"),as:'flashCards'}]}).success(function(dbflashDeckObj) {
				if(res.locals.isAdmin || dbflashDeckObj.createdBy == req.user.loggedInUserId) {
					res.send(dbflashDeckObj);
				} else {
					res.send(null);
				}
			}).error(function(err) {
				res.send(null);
			});
		} else {
			res.send(null);
		}
	} else {
		res.send(null);
	}
};

Cards.crudFlashCardDetails = function(req,res) {
	if(req.isAuthenticated()) {
		var flashDeckCode =  req.body.flashDeckCode;
		var newCardObj = req.body.newCardObj;
		
		db.model("FlashDeck").find({ where: {flashDeckCode:flashDeckCode,isActive:true} }).success(function(dbFlashDeck) {
			if(res.locals.isAdmin || dbFlashDeck.createdBy == req.user.loggedInUserId) {
				if(req.body.action=='create') {
					newCardObj.createdBy = newCardObj.updatedBy = req.user.loggedInUserId;
					db.model("FlashCard").create(newCardObj,['cardFront','cardFrontIsRich','cardBack','cardBackIsRich','createdBy','updatedBy']).success(function(insertedCardObj) {
						dbFlashDeck.addFlashCard(insertedCardObj).success(function() {
							dbFlashDeck.getFlashCards().success(function(opts) {
								dbFlashDeck.dataValues.flashCards = opts;
								insertedCardObj.dataValues.success ='Card saved successfully';
								dbFlashDeck.dataValues.newCard = insertedCardObj.dataValues;
								dbFlashDeck.noOfFlashCards = dbFlashDeck.noOfFlashCards+1;
								dbFlashDeck.save(['noOfFlashCards']);
								res.send(dbFlashDeck.dataValues);
							});
						});
					});
				} else if(req.body.action=='update') {
					db.model("FlashCard").find({ where: {flashCardId:newCardObj.flashCardId,flashDeckId:dbFlashDeck.flashDeckId}}).success(function(dbFlashCard) {
						dbFlashCard.cardFront = newCardObj.cardFront;
						dbFlashCard.cardFrontIsRich = newCardObj.cardFrontIsRich;
						dbFlashCard.cardBack = newCardObj.cardBack;
						dbFlashCard.cardBackIsRich = newCardObj.cardBackIsRich;
						dbFlashCard.updatedBy = req.user.loggedInUserId;
						dbFlashCard.save(['cardFront','cardFrontIsRich','cardBack','cardBackIsRich','updatedBy']).success(function(updatedDbFlashCard) {
							dbFlashDeck.getFlashCards().success(function(opts) {
								dbFlashDeck.dataValues.flashCards = opts;
								updatedDbFlashCard.dataValues.success ='Card saved successfully';
								dbFlashDeck.dataValues.newCard = updatedDbFlashCard.dataValues;
								res.send(dbFlashDeck.dataValues);
							});
						});
					});
				} else if(req.body.action=='delete') {
					db.model("FlashCard").find({ where: {flashCardId:req.body.flashCardId,flashDeckId:dbFlashDeck.flashDeckId}}).success(function(toDeleteObj) {
						toDeleteObj.destroy().success(function() {
							dbFlashDeck.noOfFlashCards = dbFlashDeck.noOfFlashCards-1;
							dbFlashDeck.save(['noOfFlashCards']);
							dbFlashDeck.getFlashCards().success(function(opts) {
								var chainer = new Sequelize.Utils.QueryChainer;
								for(var kk=0;kk<opts.length;kk++) {
									opts[kk].flashCardNumber = kk+1;
									chainer.add(opts[kk].save());
								}
								chainer.runSerially().success(function(results) {
									dbFlashDeck.dataValues.flashCards = opts;
									dbFlashDeck.dataValues.newCard = new Object();
									dbFlashDeck.dataValues.newCard.success = 'Card Deleted successfully';
									res.send(dbFlashDeck.dataValues);
								}).error(function(errors) {
									res.send(null);
								});
							});
							
						});
					});
				}
			} else {
				res.send(null);
			}
		}).error(function(err) {
			console.log('crudFlashCardDetails.crudFlashCardDetails = '+err);
			res.send(null);
		});
	} else {
		res.send(null);
	}
};

Cards.getAllMyFlashDecks = function(req,res) {
	db.model("FlashDeck").findAll({ where: {createdBy: req.user.loggedInUserId,isActive:true},include:[{model: db.model("FlashCard"),as:'flashCards'}]}).success(function(dbflashDeckList) {
		res.send(dbflashDeckList);
	}).error(function(err) {
		res.send(null);
	});	
};

Cards.uploadFlashDeckLogo = function(req,res) {
	var mimeType = req.files.image.type;
	var size = req.files.image.size;
	var path = req.files.image.path;
	
	if(!req.isAuthenticated()) {
		fs.unlink(path);
		res.send({error:"You do not have access to upload image"});
	} else if(size>500200) {
		fs.unlink(path);
		res.send({error:"File size should be less then 500KB"});
	} else if(mimeType!="image/jpeg" && mimeType!="image/png" && mimeType!="image/gif"){
		fs.unlink(path);
		res.send({error:"Invalid file format. You can upload only gif , jpeg and png file formats"});
	} else {
		db.model("FlashDeck").find({ where: {flashDeckCode: req.body.flashDeckCode,isActive:true} }).success(function(dbflashDeckObj) {
			if(res.locals.isAdmin || dbflashDeckObj.createdBy == req.user.loggedInUserId) {
				if(dbflashDeckObj.flashDeckImg !="logo.png") {
					aws.getAWSExamBucket().deleteObject({Key:dbflashDeckObj.flashDeckImg}, function(err, data) {
					      if (err && err.code!="MissingRequiredParameter") {
					    	  fs.unlink(path);
					    	  res.send(null);
					      } else {
					    	  insertFlashDeckLogo(req,res,dbflashDeckObj);
					      }
					});
				} else {
					insertFlashDeckLogo(req,res,dbflashDeckObj);
				}
			} else {
				fs.unlink(path);
				res.send({error:"You do not have access to upload image for this Flash Deck"});
			}
		}).error(function(err) {
			fs.unlink(path);
			res.send({error:"Flash Deck data cannot be found.Please update Flash Deck details and then upload image"});
		});
	}
};


function insertFlashDeckLogo(req,res,dbflashDeckObj) {
	var path = req.files.image.path;
	var mimeType = req.files.image.type;
	var fileName = "flashDeck"+dbflashDeckObj.flashDeckCode+".png";
	if(mimeType =="image/jpeg") {
		fileName = "flashDeck"+dbflashDeckObj.flashDeckCode+".jpeg";
	} else if(mimeType=="image/gif") {
		fileName = "flashDeck"+dbflashDeckObj.flashDeckCode+".gif";
	}
	
	fs.readFile(path, function(err, file_buffer) {
		if(err) {
			res.send({error:"Cannot upload image. Please try again."});
		} else {
			var params = {
		      Key: fileName,
		      Body: file_buffer,
		      ACL: 'public-read',
		      ContentType: mimeType
		    };
			
			aws.getAWSExamBucket().putObject(params, function(err, data) {
				fs.unlink(path);
			      if (err) {
			    	  res.send({error:"Cannot upload image. Please try again."});
			      } else {
			    	  dbflashDeckObj.flashDeckImg = fileName; 
			    	  dbflashDeckObj.save(['flashDeckImg']);
			    	  res.send({success:"Image uploaded successfully.",flashDeckImg:fileName});
			      }
			});
		}
	});
}














