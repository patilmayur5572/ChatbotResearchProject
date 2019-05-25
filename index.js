
process.env.NTBA_FIX_319 = 1;
var sqlite3 = require('sqlite3').verbose();
var token = 'XXXXXXXXX';

var db = new sqlite3.Database(':memory:');
db.serialize(function() {
  db.run("CREATE TABLE client (firstName TEXT, lastName TEXT, mobileNumber TEXT, dateOfBirth DATE)");
  db.run("INSERT INTO client VALUES ('Sunit', 'Singh', '1234567890', '1991-01-22')");
  db.run("INSERT INTO client VALUES ('Mayur', 'Patil', '1234567891', '1991-01-01')");
  db.run("INSERT INTO client VALUES ('Karishma', 'Singh', '1234567892', '1991-01-01')");
  db.run("INSERT INTO client VALUES ('Test', 'Client', '0000000000', '1991-01-01')");

});

var Bot = require('node-telegram-bot-api'),
    bot = new Bot(token, { polling: true });

var state = {};
var mobileNumber = "";
var firstName = "";
var lastName = "";

bot.on('message', function(message)
{	
    var executor = state[message.chat.id] = state[message.chat.id] ? state[message.chat.id]: new Executor();    
    executor.process(message);
});

var stateMessage = {
    "RES1": "Welcome to online insurance claim. Please enter your Mobile No.", 
    "RES2": "Please enter you First Name + Last Name.",
    "RES3": "Help us verify your account. Please enter your Date of Birth(YYYY-MM-DD).",
    "RES4": "Please confirm that Apple iPhone 6S 32GB Black is the device for which you are submitting the request.",
    "RES5": "Please confirm the problem with your phone.",
    "RES6": "Please upload your invoice***",
    "RES7": "We have noted your request. According to our records you are entitled for full replacement. Do you want to continue with this?"
};

var validationMessage = {
    "ERR1": "Please enter valid Mobile No.", 
    "ERR2": "Name does not match mobile number, please enter correct name.",
    "ERR3": "Date of birth does not match account, please enter correct date of birth",
    "ERR4": "Please confirm that Apple iPhone 6S 32GB Black is the device for which you are submitting the request.",
    "ERR5": "Is your mobile or tablet in possession?"
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
    
    // var opts = {
    //   reply_to_message_id: requestMessage.message_id,
    //   reply_markup: JSON.stringify({
    //     keyboard: [
    //       ['Yes'],['No']
    //     ],
    //     one_time_keyboard: true
    //   })
    // };

    // var peril = {
    //     reply_to_message_id: requestMessage.message_id,
    //     reply_markup: JSON.stringify({
    //       keyboard: [
    //         ['Malfunction'],['Lost'],['Stolen']
    //       ],
    //       one_time_keyboard: true
    //     })
    //   };
    
    // if(state[chatid].state === "4" || state[chatid].state === "7")      
    //     bot.sendMessage(chatid, responseMessage, opts).then(function(sended){})
    // else if(state[chatid].state === "5")
    //     bot.sendMessage(chatid, responseMessage, peril).then(function(sended){})
    // else
        bot.sendMessage(chatid, responseMessage).then(function(sended){})	    
}

function step0(executor, requestMessage) {
    // Process Message - validate, store, execute
    // Jump to target state - by changing state value of executor
    // Show Target state Question
    
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
    // Process Message - validate, store, execute
    // Jump to target state - by changing state value of executor
    // Show Target state Question
    
    console.log(requestMessage);
    var name = requestMessage.text.split(" ");

    var query = "SELECT firstName, lastName FROM client where mobileNumber = ?";
    db.get(query, [mobileNumber] , function(err, row) {

        if(err) {
            console.log('ERROR', err);
        } else if (!row) {
            console.log('ERROR', err);
        } else {
            
            if(name[0] == row.firstName && name[1] == row.lastName) {
                console.log("User name verified");
                firstName = name[0];
                lastName = name[1];
                executor.showQuestion(requestMessage, stateMessage.RES3);
                executor.state = "3";
            }
            else {
                executor.showValidationError(requestMessage, validationMessage.ERR2); 
            }
        }
    });
}

function step3(executor, requestMessage) {
    // Process Message - validate, store, execute
    // Jump to target state - by changing state value of executor
    // Show Target state Question
    //var name = requestMessage.text.split(" ");

    var query = "SELECT dateOfBirth FROM client where mobileNumber = ?";
    db.get(query, [mobileNumber] , function(err, row) {

        if(err) {
            console.log('ERROR', err);
        } else if (!row) {
            console.log('ERROR', err);
        } else {
            
            if(requestMessage.text == row.dateOfBirth) {
                console.log("User date of birth verified");
                executor.showQuestion(requestMessage, stateMessage.RES4);
                executor.state = "4";
            }
            else {
                console.log("FAIL!");
                executor.showValidationError(requestMessage, validationMessage.ERR2); 
            }
        }
    });

}

function step4(executor, message) {
    // Process Message - validate, store, execute
    // Jump to target state - by changing state value of executor
    // Show Target state Question
    executor.state = "5";
    executor.showQuestion(message);
}

function step5(executor, message) {
    // Process Message - validate, store, execute
    // Jump to target state - by changing state value of executor
    // Show Target state Question
    executor.state = "6";
    executor.showQuestion(message);
}
function step6(executor, message) {
    // Process Message - validate, store, execute
    // Jump to target state - by changing state value of executor
    // Show Target state Question
    executor.state = "7";
    executor.showQuestion(message);
}

console.log("Chatbot server started");

