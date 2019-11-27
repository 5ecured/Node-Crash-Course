const fs = require('fs'); //file system
const http = require('http'); //Node is to create web servers. This line is for that - creating servers
const url = require('url');

const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8'); //have to pass the utf-8 otherwise will return 'buffer'. __dirname is like the "home" folder
const laptopData = JSON.parse(json); //To turn it into an actual JS object

//Inside createServer is a cb function which will be run each time someone accesses our server. The cb has access to REQuest and RESponse objects
const server = http.createServer((req, res) => {
    const pathName = url.parse(req.url, true).pathname;

    //in the 'req' object, query is an object that contains the value of the id parameter. Like laptop id 1, 2, etc. So query.id will simply give the id.
    //So this is how we read the id from the url
    const id = url.parse(req.url, true).query.id; 

    //PRODUCTS OVERVIEW
    if(pathName === '/products' || pathName === '/') {
        //Headers are a small message that gets sent along with a request to let the browser know what kinda data is coming in
        res.writeHead(200, {'Content-type': 'text/html'});
        
        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => { //the 2nd argument 'data' refers to the data that is from template-laptop.html
            let overviewOutput = data;

            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => { //the 2nd argument 'data' refers to the data that is from template-laptop.html
                const cardsOutput = laptopData.map(el => replaceTemplate(data, el)).join('');
                overviewOutput = overviewOutput.replace('{%CARDS%}', cardsOutput);

                res.end(overviewOutput);
            });
        });
    } 
    //LAPTOP DETAIL
    else if(pathName === '/laptop' && id < laptopData.length) {
        res.writeHead(200, {'Content-type': 'text/html'});

        //readFile is asynchronous as opposed to the one up there which is synchronous
        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => { //the 2nd argument 'data' refers to the data that is from template-laptop.html
            const laptop = laptopData[id]
            const output = replaceTemplate(data, laptop);
            res.end(output);
        });
    }

    //IMAGES
    else if((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) { //if there is a file whose extension is any of these jpg jpeg etc, we will read it rom the FS and send it as a response
        fs.readFile(`${__dirname}/data/img/${pathName}`, (err, data) => {
            res.writeHead(200, {'Content-type': 'image/jpg'});
            res.end(data);
        });
    }

    //URL NOT FOUND
    else {
        res.writeHead(404, {'Content-type': 'text/html'});
        res.end('URL was not found on the server!');
    }

    
}); 

//'Listen' tells Node to keep listening on a certain port(1st arg) on a certain IP address(2nd arg). 1337 is quite standard
server.listen(1337, '127.0.0.1', () => { 
    console.log('listening for requests')
}) 

/* On a browser, go to 127.0.0.1:1337 as above, and 'This is the products page!' will be printed */

/* Routing can get very complicated quickly. This is why many use Express framework of Node. To help handle routing and many more*/

function replaceTemplate(originalHTML, laptop) {
    let output = originalHTML.replace(/{%PRODUCTNAME%}/g, laptop.productName);
    output = output.replace(/{%IMAGE%}/g, laptop.image);
    output = output.replace(/{%PRICE%}/g, laptop.price);
    output = output.replace(/{%SCREEN%}/g, laptop.screen);
    output = output.replace(/{%CPU%}/g, laptop.cpu);
    output = output.replace(/{%STORAGE%}/g, laptop.storage);
    output = output.replace(/{%RAM%}/g, laptop.ram);
    output = output.replace(/{%DESCRIPTION%}/g, laptop.description);
    output = output.replace(/{%ID%}/g, laptop.id);
    return output;
}