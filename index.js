#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var protagonist = require('protagonist');

var options = {
    generateSourceMap: true
}

var newfile = "";

program
    .arguments('<file>')
    .action(function(file) {

        console.log('file: %s', file);

        newfile = file.replace(/\.apib/,"")+'Controller.php';

        fs.readFile(file, 'utf8', function(err, data) {
            protagonist.parse(data, options, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                }

                fs.writeFile('parsed.json', JSON.stringify(result));

                fs.writeFileSync(newfile, "<?php\n\n");

                if (Array.isArray(result.content)) {
                    mytitle(result.content, 0);
                }
            });
        });

    })
    .parse(process.argv);


var mytitle = function(obj, level) {

    if (Array.isArray(obj)) {

        obj.forEach(function(nobj) {

            if (nobj.element == "category" && nobj.meta.classes[0] == "api") {

                if (Array.isArray(nobj.content)) {

                        mytitle(nobj.content, level + 1);

                }

            }

            else if (nobj.element == "category" && nobj.meta.classes[0] == "resourceGroup") {

                fs.appendFileSync(newfile, "class "+nobj.meta.title.content+"Controller"+" extends apiController {\n");

                if (Array.isArray(nobj.content)) {

                        mytitle(nobj.content, level + 1);

                }

                fs.appendFileSync(newfile, "}\n");

            }

            else if (nobj.element == "resource") {

                if(Array.isArray(nobj.content)){
                    nobj.content.forEach(function(element){

                        var desc = element.meta.title.content;

                        var fname = element.content[0].content[0].attributes.method.content.toLowerCase()
                                    + nobj.attributes.href.content.replace(/\{[a-zA-Z_\?,]*\}/ig, "").replace(/\//ig, "_");

                        fs.appendFileSync(newfile, "\t/**\n\t* @description "
                                        + desc
                                        + " \n\t* @url "
                                        + element.content[0].content[0].attributes.method.content
                                        + " "
                                        + nobj.attributes.href.content
                                            .replace(/\{\?[a-zA-Z_\,]*\}/ig, "")
                                            .replace(/\{([a-zA-Z_]*)\}/ig, "$$$1")
                                        + "\n\t*/\n");

                        fs.appendFileSync(newfile, "\tpublic function "+fname+"() {\n\t\n\t}\n\n");

                    });
                }

            }


        });

    }
};
