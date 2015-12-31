var templates = require('./questions.template');
var uuid = require('node-uuid');
var openapi = require('./../common/openapi');
var fs = require('fs');

var questionsBasePath = "${ref-path}/prepub_content_edu/esp/questions/";
var localPath = __dirname + "/../app/userdatas/prepub_content_edu/esp/questions/";

var checkDir = function(path, callback){
    fs.stat(path, function(err,stats){
        if(err){
            mkdir(path, callback);
        } else{
            callback();
            return;
        }
    });
}
var mkdir = function(path, callback){
    var parentDir = path.substring(0, path.lastIndexOf("/"));
    checkDir(parentDir, function(){
        fs.mkdir(path, 777, callback);
    })
}

var createParam = {
  "question_type": {type: String, required: true}
};

function getParamValue(value) {
	if(value!=undefined && value!=null)
		return value;
	return "";
}
exports.create = function(req, res, next) {

	var param = openapi.getOpenApiParam(req, createParam);
	var questionInfo = req.body;
	var metadataData = templates.metadatas[param.question_type];

	//console.log(questionInfo);

	metadataData.description = getParamValue(questionInfo.description);
	metadataData.tags = getParamValue(questionInfo.tags);
	metadataData.life_cycle.creator = getParamValue(questionInfo.creator);
	metadataData.life_cycle.status = "CREATED";
	metadataData.life_cycle.provider= getParamValue(questionInfo.provider);
	metadataData.life_cycle.provider_source= getParamValue(questionInfo.provider_source);
	metadataData.life_cycle.create_time= new Date();
	metadataData.life_cycle.last_update= new Date();
	metadataData.education_info.difficulty = getParamValue(questionInfo.difficulty);

	for(var i=0; i<metadataData.coverages.length;i++)//覆盖范围
	{
		metadataData.coverages[i].target = getParamValue(questionInfo.creator);
	}
	for(var i=0; i<metadataData.relations.length;i++)//覆盖关系
	{
		metadataData.relations[i].source = getParamValue(questionInfo.chapter_id);
		metadataData.relations[i].source_title = getParamValue(questionInfo.chapter_id);
	}
	metadataData.categories.source=[];
	metadataData.categories.source.push({"taxoncode": "RF01008"});//题目来源-其它表示本地


	//console.log(metadataData);

	var id = uuid.v4();
	var packagePath = localPath + id + ".pkg";
	var item_path = packagePath + "/item.json";
	var metadata_path = packagePath + "/metadata.json";

	metadataData.identifier = id;
	metadataData.tech_info.href.location = metadataData.tech_info.href.entry = questionsBasePath + id + ".pkg/item.json";

	var itemData = templates.items[param.question_type];
	itemData.identifier = id;

    //JSON.stringify(obj)
	// JSON.parse(str)
	// create
	mkdir(packagePath,function(){
		fs.writeFile(metadata_path, JSON.stringify(metadataData),function(err){
	 		if (err) throw err;
	  		console.log(metadata_path + ' saved!');
		});

		fs.writeFile(item_path, JSON.stringify(itemData),function(err){
	 		if (err) throw err;
	  		console.log(item_path + ' saved!');
		});
	});
	
	return res.send(metadataData);
};



var getParam = {
  "id": {type: String, required: true}
};
exports.get = function(req, res, next) {
	var param = openapi.getOpenApiParam(req, getParam);
	var metadata_path = localPath + param.id + ".pkg/metadata.json";
	fs.readFile(metadata_path, function(err, data){
		if(err) throw err;
		return res.send(JSON.parse(data));
	});
};

exports.save = function(req, res, next) {
	var param = req.body;
	var metadata_path = localPath + param.identifier + ".pkg/metadata.json";

	fs.writeFile(metadata_path, JSON.stringify(param),function(err){
 		if (err) throw err;
  		console.log(metadata_path + ' saved!');
	});
	return res.send(param);
};

exports.getItem = function(req, res, next) {
	var param = openapi.getOpenApiParam(req, getParam);
	var itemdata_path = localPath + param.id + ".pkg/item.json";
	fs.readFile(itemdata_path, function(err, data){
		if(err) throw err;
		return res.send(JSON.parse(data));
	});
};

exports.saveItem = function(req, res, next) {
	var param = req.body;
	var itemdata_path = localPath + param.identifier + ".pkg/item.json";

	fs.writeFile(itemdata_path, JSON.stringify(param),function(err){
 		if (err) throw err;
  		console.log(itemdata_path + ' saved!');
	});
	return res.send(param);
};