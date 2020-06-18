const formidable = require('formidable');
const fs = require('fs');
const csv = require('csv-parser');
var https = require('https');
const mailgun = require("mailgun-js");
const DOMAIN = "sandboxe2248d58fe1741369730f608a5b4b779.mailgun.org";
const mg = mailgun({apiKey: "59f2b026b24d7d3e56bf76c66cb03ee4-1b6eb03d-f5f9614c", domain: DOMAIN});
const nodemailer = require ('nodemailer');
require('dotenv').config();
 

const appRouter = (app, fs) => {
     
	
    // default route
    app.post('/', (req, res) => {
    	let results = [];
    	let resArray=[];
        const form = formidable({ multiples: true });
        form.uploadDir=__dirname;
		  form.parse(req, (err, fields, files) => {
		    if (err) {
		      next(err);
		      return;
		    } else{
		    	let fileName = ''
                    if (files.csv && files.csv.name) {
                        fileName = new Date().getTime() + files.csv.name.replace(" ", "-");
                        var oldpath = files.csv.path;
                        var newpath = __dirname + fileName;
                        fs.rename(oldpath, newpath, function(err) {
                            if (err) {
                                res.json({
                                    status: 0,
                                    message: 'Something went wrong.',
                                    statuscode: 400,
                                    response: ''
                                });
                                return;
                            } else {
                                
                            	fs.createReadStream(newpath)
								  .pipe(csv({ separator: ',',headers:false,skipComments:false,raw:false }))
								  .on('data', (data) => {
                                    console.log(data)
								  	results.push(data)

								  })
								  .on('end', async () => {
								    console.log(results);
								    let html =``;

								    let arr = getCurrenciesArray(results);
								    let rate;
								    await Promise.all( arr.map( async ele=>{
								    
								    await convertCurrency(parseFloat(ele)).then(data=>{

								    rate = data;
                                    console.log(rate);
								    resArray.push(rate);

								     html = html + `<tr style="border:1px solid #333">
										          <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> ${rate.date} </td>
										          <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> ${rate.indian} </td>
										          <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> ${rate.usa} </td>
										          <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> ${rate.rate} </td>
										     </tr>`
								    }).catch( err => {
                                                       res.json({
												                status: 1,
												                message: 'Sucess.',
												                statuscode:200,
												                response: resArray
												              });
												              return;   
								    })
								    }))
								    
								   
										const data = {
														from: "Mailgun Sandbox <postmaster@sandboxe2248d58fe1741369730f608a5b4b779.mailgun.org>",
														to: "swapnil2725@gmail.com",
														subject: "Hello",
														html: htmlParse(html)
													};
													mg.messages().send(data, function (error, body) {
														console.log(body);
													});


													var old_image =  newpath;
											                        fs.unlink(old_image, (err) => {
											                            if (err) {
											                                res.json({
											                                    status: 0,
											                                    message: 'Something went wrong.',
											                                    statuscode: 400,
											                                    response: ''
											                                });
											                                return;
											                            }
											                        })
											            res.json({
												                status: 1,
												                message: 'Sucess.',
												                statuscode:200,
												                response: resArray
												              });                  		
													
								  });
                            }

                        });
		    }
		  }
		})
    });

 const getCurrenciesArray = (arr) => {
    let data = [];
    arr.map(ele=>{
    	let value = Object.values(ele);
    	data.push(...value)
    })
    return data;
	} 
	
	var transport = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
		  user: "tokencloud7777@gmail.com",
		  pass: "oaxmiwphchqghbrf"
		}
	});
	
	 
	app.post('/sentmail', function(req, res) {
		var form = new formidable.IncomingForm();
    form.parse(req, async(err, fields, files) => {

        if (err) {
            res.json({
                status: 0,
                message: 'Something went wrong',
                statuscode: 400,
                response: ''
            });
             return;
		}
		
		let html =fields.html;
		let mail = fields.mail 
	   var mailOption = {
		  html: html,
		  createTextFromHtml: true,
		  from: "tokencloud7777@gmail.com",
		  to: mail,
		  subject: "The Currency Data"
		};
		transport.sendMail(mailOption,function(err,data){
		if(err){
			console.log('Error Occurs!!');
			res.json({
                status: 0,
                message: 'Something went wrong',
                statuscode: 400,
                response: ''
            });
             return;
	
		}else{
			console.log('Email Send!!!!!');
			res.json({
                status: 1,
                message: 'Mail Sent',
                statuscode: 200,
                response: ''
            });
             return;
		}
	});
	
	
	})
		
	});
};

const convertCurrency = ( amount, fromCurrency='INR', toCurrency="USD") => {
	var apiKey = '629d0494dc62635ce51a';
    toCurrency = encodeURIComponent(toCurrency);
    var query = fromCurrency + '_' + toCurrency;
    var url = 'https://free.currconv.com/api/v7/convert?q='
            + query + '&compact=ultra&apiKey=' + apiKey;
return new Promise ((resolve,reject)=>{
	https.get(url, function(res){
		     var body = '';
	         res.on('data', function(chunk){
	          body += chunk;
	      });

	      res.on('end', function(err){
	      if(err)  { reject(err);return ; }
          try {
            var jsonObj = JSON.parse(body);
            var val = jsonObj[query];        
           if (val) {
              var total = val * amount;
              let res = {};
              res['date'] = new Date().toISOString().slice(0,10);
              res['indian'] = amount;
              res['usa'] = Math.round(total * 100) / 100;
              res['rate'] = val;
              resolve(res);
            } else {
              var err = new Error("Value not found for " + query);
              console.log(err);
              reject(err)
            }
            } catch(e) {
            console.log("Parse error: ", e);
            reject(e)
          }
	   
	});
  })
})

}

const htmlParse = (table)=>{
let html = `<html>
<table width="600" style="border:1px solid #333">
        <tr style="border:1px solid #333">
          <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> Date </td>
          <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> Indian </td>
          <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> USA </td>
          <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> Exchange </td>
        </tr>
        ${table}
</table>
</html>`
return html;

}








module.exports = appRouter;