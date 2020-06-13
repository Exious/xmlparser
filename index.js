const request = require("request");
const parser = require("fast-xml-parser");

const { options } = require("./options");

const quantity = 10; //кол-во страниц при детальном парсинге

const baseUrl = "https://rb.ru/sitemap.xml";

XMLparser(baseUrl, undefined, () => {
  readFromFile("baseXML_common.txt");
});
// добавить await

function XMLparser(url, index, cb) {
  request(url, function (error, response, xmlData) {
    console.error("error:", error);
    console.log("statusCode:", response && response.statusCode);

    if (url === baseUrl) saveInfoFile(xmlData, "baseXML_common", "txt");
    else saveInfoFile(xmlData, `baseXML${index}`, "txt");

    if (url === baseUrl) var jsonObj = XML2JSON(xmlData); //

    if (url === baseUrl) saveInfoFile(jsonObj, "XML_common", "json"); //не обязательно

    if (url === baseUrl) var trueJsonObj = trueJSON(jsonObj); //

    if (url === baseUrl) saveInfoFile(trueJsonObj, "trueXML_common", "json");
    //else
    cb && cb();
  });
}

function XML2JSON(xmlData) {
  let jsonObj;
  if (parser.validate(xmlData) === true) {
    jsonObj = parser.parse(xmlData, options);
  } else {
    let tObj = parser.getTraversalObj(xmlData, options);
    jsonObj = parser.convertToJson(tObj, options);
  }
  return jsonObj;
}

function trueJSON(jsonObj) {
  let trueForm = {};
  if (jsonObj.sitemapindex != null) {
    console.log(jsonObj.sitemapindex.sitemap[0]); //test
    trueForm = Object.assign({}, jsonObj.sitemapindex);
    console.log(trueForm.sitemap[0]); //final test
  }
  if (jsonObj.urlset != null) {
    console.log(jsonObj.urlset.url[0]); //test
    trueForm = Object.assign({}, jsonObj.urlset);
    trueForm.url.forEach((eachUrl) => delete eachUrl.priority);
    console.log(trueForm.url[0]); //final test
  }

  return trueForm;
}

function saveInfoFile(data, fileName, fileExtension) {
  let path = require("path").join(
    __dirname,
    ".",
    "data",
    fileName + "." + fileExtension
  );
  require("fs").writeFileSync(path, JSON.stringify(data, null, 4));
}

function readFromFile(fileName) {
  let path = require("path").join(__dirname, ".", "data", fileName);
  require("fs").readFile(path, "utf8", function (error, data) {
    console.error("error:", error);
    let newjsonObj = XML2JSON(data);
    let newtrueJsonObj = trueJSON(newjsonObj);
    delete newtrueJsonObj[`#text`];

    ////data.sitemap.forEach((eachUrl) => XMLparser(eachUrl.loc));
    for (index = 1; index <= quantity; index++) {
      XMLparser(newtrueJsonObj.sitemap[index - 1].loc, index);
      console.log("------------", newtrueJsonObj.sitemap[index - 1].loc);
    }
  });
}
