

process.env.NTBA_FIX_319 = 1;
var sqlite3 = require('sqlite3').verbose();
var token = 'XXXXXXXXXXXXXXXXXXXXXX';
var mailer = require('nodemailer');
var PDFDoc = require('pdfkit');
var fs = require('fs');

process.env["NTBA_FIX_350"] = 1;

var db = new sqlite3.Database(':memory:');
db.serialize(function() {
  db.run("CREATE TABLE client (USERID TEXT, firstName TEXT, lastName TEXT, mobileNumber TEXT, dateOfBirth DATE, emailID)");
  db.run("INSERT INTO client VALUES ('001', 'Sunit', 'Singh', '1234567890', '1991-01-22','sunitsingh2291@gmail.com')");
  db.run("INSERT INTO client VALUES ('002', 'Mayur', 'Patil', '1234567891', '1990-04-05', 'patilmayur5572@gmail.com')");
  db.run("INSERT INTO client VALUES ('003', 'Karishma', 'Singh', '1234567892', '1991-01-01','Karishmaas26@gmail.com')");
 ;

  db.run("CREATE TABLE user_mobile (USERID TEXT, mobilePhone)");
  db.run("INSERT INTO user_mobile VALUES ('001', 'Samsung Note 8')");
  db.run("INSERT INTO user_mobile VALUES ('001', 'Apple iPhone 7')");
  db.run("INSERT INTO user_mobile VALUES ('002', 'Samsung Note 8')");
  db.run("INSERT INTO user_mobile VALUES ('002', 'Apple iPhone X')");

  db.run("CREATE TABLE issue_list(ISSUEID TEXT, issue TEXT)");
  db.run("INSERT INTO issue_list VALUES('001', 'CONNECTION')");
  db.run("INSERT INTO issue_list VALUES('002', 'SCREEN')");

  db.run("CREATE TABLE issue_sublist (issue TEXT, options)");
  db.run("INSERT INTO issue_sublist VALUES('001', 'wireless problem')");
  db.run("INSERT INTO issue_sublist VALUES('001', 'bluetooth problem')");
  db.run("INSERT INTO issue_sublist VALUES('002', 'broken')");
  db.run("INSERT INTO issue_sublist VALUES('002', 'display error')");


});

var Bot = require('node-telegram-bot-api'),
    bot = new Bot(token, { polling: true });

var state = {};
var USERID = "";
var mobileNumber = "";
var firstName = "";
var lastName = "";
var device = "";
var emailID = "";
var peril =  "";


bot.on('message', function(message)
{	
    var executor = state[message.chat.id] = state[message.chat.id] ? state[message.chat.id]: new Executor();    
    executor.process(message);
});

bot.on("polling_error", (err) => console.log(err));

var stateMessage = {
    "RES1": "Welcome to online insurance claim. Please enter your Mobile No.", 
    "RES2": "Please enter you First Name + Last Name.",
    "RES3": "Help us verify your account. Please enter your Date of Birth(YYYY-MM-DD).",
    "RES4": "Please select phone you want assistance with.",
    "RES5": "Please confirm the problem with your phone.",
    "RES6": "Please type in your problem.",
    "RES7": "Sorry your information did not match any keywords, we have forwarded your query to our customer service rep with CASE ID XXXXX, They would contact you within 48 hours.",
    "RES8": "If you wish for immediate resolution, please call XXX-XXXXXX-XXX with Case ID XXXXX.",
    "RES9": "Please select the type of your problem",
    "RES10": "Please write your problem in as much detail.",
    "RES11": "We have recieved your request, you would get an email with details of the claim."
};

var validationMessage = {
    "ERR1": "Please enter valid Mobile No.", 
    "ERR2": "Name does not match mobile number, please enter correct name.",
    "ERR3": "Date of birth does not match account, please enter correct date of birth",
};

function Executor(){
     
    var self = this;
    
    self.state = 0;
    self.answers = {};
    self.stateExecutor = {};
    self.stateExecutor["0"] = step0;
    self.stateExecutor["1"] = step1;
    self.stateExecutor["2"] = step2;
    self.stateExecutor["3"] = step3;
    self.stateExecutor["4"] = step4;
    self.stateExecutor["5"] = step5;
    self.stateExecutor["6"] = step6;
    self.stateExecutor["7"] = step7;
    self.stateExecutor["8"] = step8;
    self.stateExecutor["9"] = step9;
    self.stateExecutor["10"] = step10;
    self.stateExecutor["11"] = step11;
    self.stateExecutor["12"] = step12;
    
    self.process = function(message){
        // if its first invocation - then do not execute step. Show the question
        // if its greater than first invocation, then execute step, and then show the question
        if (self.stateExecutor[self.state]) {
            self.stateExecutor[self.state](self, message);
        }
    }
    
    self.showQuestion = function(requestMessage, responseMessage){        
        sendMsg(requestMessage , responseMessage);
    }
    
    self.showValidationError = function(requestMessage, responseMessage){        
        sendMsg(requestMessage, responseMessage);
    }
}

function sendMsg(requestMessage, responseMessage){  
    
    var chatid = requestMessage.chat.id;
    bot.sendMessage(chatid, responseMessage).then(function(sended){})	    
}

function sendOptions(requestMessage, responseMessage, options) {
    var chatid = requestMessage.chat.id;
    console.log("Here");
    bot.sendMessage(chatid, responseMessage, options).then(function(sended){});
}

function step0(executor, requestMessage) {
    
    console.log(requestMessage);
    console.log(stateMessage.RES1);
    executor.showQuestion(requestMessage, stateMessage.RES1);
    executor.state = "1";
}


function step1(executor, requestMessage) {    
    if (isNaN(requestMessage.text) || requestMessage.text.length < 10 || requestMessage.text.length > 13) 
    {   
        console.log(validationMessage.ERR1);
        executor.showValidationError(requestMessage, validationMessage.ERR1);   
    }
    else
    {
        
        mobileNumber = requestMessage.text;
        executor.showQuestion(requestMessage, stateMessage.RES2);
        executor.state = "2";
    }
}

function step2(executor, requestMessage) {
    
    console.log(requestMessage);
    var name = requestMessage.text.split(" ");

    var query = "SELECT USERID, firstName, lastName, emailID FROM client where mobileNumber = ?";
    db.get(query, [mobileNumber] , function(err, row) {

        if(err) {
            console.log('ERROR', err);
        } else if (!row) {
            console.log('ERROR', err);
        } else {
            
            if(name[0].toUpperCase() === row.firstName.toUpperCase() && name[1].toUpperCase() == row.lastName.toUpperCase()) {
                console.log("User name verified");
                USERID = row.USERID;
                firstName = name[0];	
                lastName = name[1];
                emailID = row.emailID;
                executor.showQuestion(requestMessage, "Hi " + firstName + ", "+stateMessage.RES3);
                executor.state = "3";
            }
            else {
                executor.showValidationError(requestMessage, validationMessage.ERR2); 
            }
        }
    });
}

function step3(executor, requestMessage) {

    var query = "SELECT dateOfBirth FROM client where mobileNumber = ?";
    db.get(query, [mobileNumber] , function(err, row) {

        if(err) {
            console.log('ERROR', err);
        } else if (!row) {
            console.log('ERROR', err);
        } else {
            
            if(requestMessage.text == row.dateOfBirth) {
                console.log("User date of birth verified");
                executor.state = "4";
                step4(executor, requestMessage);

            }
            else {
                console.log("FAIL!");
                executor.showValidationError(requestMessage, validationMessage.ERR3); 
            }
        }
    });

}

function step4(executor, requestMessage) {

    var query = "SELECT mobilePhone FROM user_mobile where USERID = ?";
    db.all(query, [USERID], function(err, rows) {

        if(err) {
            console.log('ERROR', err);
        } else if (!rows) {
            console.log('ERROR', err);
        } else {
            console.log(rows);
            var mobileArray = []; 
            rows.forEach((row) => {
                mobileArray.push(row.mobilePhone);
                console.log(row.mobilePhone);
            });
            var options = {
                reply_to_message_id: requestMessage.message_id,
                reply_markup: JSON.stringify({
                    keyboard:  mobileArray.map((x, xi) => ([{
                               text: x,
                               callback_data: String(xi + 1),
                    }])),
                    one_time_keyboard: true
                })
            };
        }

        sendOptions(requestMessage, stateMessage.RES4, options);
        executor.state = "5";
    });
}

function step5(executor, requestMessage) {

    device = requestMessage.text;
    var options = {
        reply_to_message_id: requestMessage.message_id,
        reply_markup: JSON.stringify({
          keyboard: [
            ['Damaged'],['Stolen'],['Other']
          ],
          one_time_keyboard: true
        })
    };
    sendOptions(requestMessage, stateMessage.RES5, options);
    executor.state = "6";
}

function step6(executor, requestMessage) {
    console.log(requestMessage);
    executor.state = "8";
    if(requestMessage.text == 'Other') {
        executor.showQuestion(requestMessage, stateMessage.RES6);
        executor.state = "7";
    }
    else {
        console.log(requestMessage.text);
        peril = requestMessage.text;
        sendEmailConfirmation();
        executor.state = 12; 
        step12(executor, requestMessage);
    }
}

function step7(executor, requestMessage) {
    var userText = requestMessage.text.split(" ");
    console.log(userText);
    var flag = 0; 
   userText.forEach(text => {
        
        var query = "SELECT ISSUEID, issue FROM issue_list where issue = ?";
        db.get(query, [text.toUpperCase()] , function(err, row) {
    
            if(err) {
                console.log('ERROR', err);
            } else if (!row) {
                console.log('No match found for the key');
            } else {
                flag = 1; 
                console.log('found a match')
                executor.state = "9";
                console.log(row.ISSUEID);
                step9(executor, requestMessage, row.ISSUEID);

            }
        });
    
    });

    setTimeout(function() {
        if(flag ==0) {
            console.log(flag);
                executor.showQuestion(requestMessage, stateMessage.RES7);
                executor.showQuestion(requestMessage, stateMessage.RES8);
                executor.state = "8";
                step8(executor, requestMessage);
        }
    }, 2000);
}


function step8(executor, requestMessage) {
    console.log(requestMessage.text);
    peril = requestMessage.text;
    sendEmailConfirmation();
    executor.state = "12";
    step12(executor, requestMessage);
}

function step9(executor, requestMessage, ISSUEID) {
    console.log("the issueid is" + ISSUEID);
    var query = "SELECT options FROM issue_sublist where issue = ?";
    db.all(query, [ISSUEID], function(err, rows) {

        if(err) {
            console.log('ERROR', err);
        } else if (!rows) {
            console.log('ERROR', err);
        } else {
            console.log("fetched rows " + rows);
            var issueArray = []; 
            rows.forEach((row) => {
                issueArray.push(row.options);
            });
            issueArray.push("Other");
            var options = {
                reply_to_message_id: requestMessage.message_id,
                reply_markup: JSON.stringify({
                    keyboard:  issueArray.map((x, xi) => ([{
                               text: x,
                               callback_data: String(xi + 1),
                    }])),
                    one_time_keyboard: true
                })
            };
        }

        sendOptions(requestMessage, stateMessage.RES9, options);
        executor.state = "10";
    });
}


function step10(executor, requestMessage) {
    console.log("step 10 here");
    if(requestMessage.text == 'Other') {
        executor.showQuestion(requestMessage, stateMessage.RES10);
        executor.state = "11";
    }
    else {
        console.log(requestMessage.text);
        peril = requestMessage.text;
        sendEmailConfirmation();
        executor.state = 12; 
        step12(executor, requestMessage);

    }
}

function step11(executor, requestMessage) {
    console.log("step 11 here");
    peril = requestMessage.text;
    sendEmailConfirmation();
    executor.state = 12; 
    step12(executor,requestMessage);
}

function step12(executor, requestMessage) {
    executor.showQuestion(requestMessage, stateMessage.RES11);
}


function sendEmailConfirmation() {         
    createReceipt();
    let transporter = mailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports  
        auth: {
            type: 'OAuth2',
            user: 'sydneyhappening@gmail.com',
            clientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
            clientSecret: 'XXXXXXXXXXXXXXXXXXXXXXX',
            refreshToken: '1/MTLy7UzCSE2Ovn2XT6Wp7oabA8g_69wlG1KliV3xne0',
            accessToken: 'ya29.GlsZB7iw8dijnZuz6aYD9oc9CtWqgKZhw5YhivREEyHbbuKcUcAWAeoJxzqIs4qV60KHLoxjCjNlN_TxRY7nXeibykbu_glBEMpzFj0odw-0tjosI67NpwuN99CA',
            expires: 3600 
        }       

    });


    var mailOptions = {
        from: '"UTS BOT" <noreply@gmail.com>',
        to: emailID,
        subject: 'Autogenerated Claim Receipt for: ' + '' + device,
        text: 'Please find the attached receipt along with this mail.',
        attachments: [{'filename': 'ClaimDocument.pdf',path:'Document/ClaimDocument.pdf' , 'content': 'application/pdf'}]
    }    
    transporter.sendMail(mailOptions, (error, info) => {
        if(info){
            Console.log("Claim receipt has been emailed to your registered email address");
        }
    });

}

function createReceipt(){
    const doc = new PDFDoc;

    doc.pipe(fs.createWriteStream('Document/ClaimDocument.pdf', 'base64'));

    doc.addContent().fontSize(25).text("Claim Receipt",100,140,{align: 'center'});

    doc.addContent().fontSize(20).text("Name: " + firstName +" " + lastName,100,180);

    doc.addContent().fontSize(20).text("ClaimID: 123456" ,100,220);

    doc.addContent().fontSize(20).text("Device: " + device,100,260);

    doc.addContent().fontSize(20).text("Problem with phone: " + peril,100,300);

    doc.addContent().fontSize(8).text("Note: Please keep this receipt handy to further track your claim " ,100,380);

    doc.end();
}



console.log("Chatbot server started");


