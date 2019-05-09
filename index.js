
process.env.NTBA_FIX_319 = 1;

var token = '869456871:AAEA1_bVo3hzHmIWB51E9WeV2j8WHI4pjDM';

var Bot = require('node-telegram-bot-api'),
    bot = new Bot(token, { polling: true });

var state = {};

bot.on('message', function(message)
{	
    var executor = state[message.chat.id] = state[message.chat.id] ? state[message.chat.id]: new Executor();    
    executor.process(message);
});

function Executor(){
    var stateMessage = {
        "1": "Please enter your Mobile No.", 
        "2": "Please enter you First Name + Last Name.",
        "3": "Help us verify your account. Please enter your Date of Birth(DD/MM/YYYY) OR Driving License Number",
        "4": "Please confirm that Apple iPhone 6S 32GB Black is the device for which you are submitting the request.",
        "5": "Please confirm the problem with your phone.",
        "6": "Please upload your invoice***",
        "7": "We have noted your request. According to our records you are entitled for full replacement. Do you want to continue with this?"
    };
    
    var validationMessage = {
        "1": "Please enter valid Mobile No.", 
        "2": "Please enter you First Name + Last Name.",
        "3": "Help us verify your account. Please enter your Date of Birth OR Driving License Number",
        "4": "Please confirm that Apple iPhone 6S 32GB Black is the device for which you are submitting the request.",
        "5": "Is your mobile or tablet in possession?"
    };
    
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
        ///if its first invocation - then do not execute step. Show the question
        ///if its greater than first invocation, then execute step, and then show the question
        if (self.stateExecutor[self.state]) {
            self.stateExecutor[self.state](self, message);
        }
    }
    
    self.showQuestion = function(message){        
        sendMsg(message, stateMessage[self.state]);
    }
    
    self.showValidationError = function(message){        
        sendMsg(message, validationMessage[self.state]);
    }
}

function sendMsg(message,question){  
    
    var chatid = message.chat.id;
    
    var opts = {
      reply_to_message_id: message.message_id,
      reply_markup: JSON.stringify({
        keyboard: [
          ['Yes'],['No']
        ],
        one_time_keyboard: true
      })
    };

    var peril = {
        reply_to_message_id: message.message_id,
        reply_markup: JSON.stringify({
          keyboard: [
            ['Malfunction'],['Lost'],['Stolen']
          ],
          one_time_keyboard: true
        })
      };
    
    if(state[chatid].state === "4" || state[chatid].state === "7")      
        bot.sendMessage(chatid,question,opts).then(function(sended){})
    else if(state[chatid].state === "5")
        bot.sendMessage(chatid,question,peril).then(function(sended){})
    else
        bot.sendMessage(chatid,question).then(function(sended){})	    
}

function step0(executor, message) {
    //Process Message - validate, store, execute
    //Jump to target state - by changing state value of executor
    //Show Target state Question
    executor.state = "1";
    executor.showQuestion(message);
}

function step1(executor, message) {  
    console.log(message.text.length < 10 && message.text.length > 13);    
    if (isNaN(message.text) && !(message.text.length < 10 && message.text.length > 13)) 
    {
        executor.showValidationError(message);    
    }
    else
    {
        executor.state = "2";
        executor.showQuestion(message);
    }
}

function step2(executor, message) {
    //Process Message - validate, store, execute
    //Jump to target state - by changing state value of executor
    //Show Target state Question
    executor.state = "3";
    executor.showQuestion(message);
}

function step3(executor, message) {
    //Process Message - validate, store, execute
    //Jump to target state - by changing state value of executor
    //Show Target state Question
    executor.state = "4";
    executor.showQuestion(message);
}

function step4(executor, message) {
    //Process Message - validate, store, execute
    //Jump to target state - by changing state value of executor
    //Show Target state Question
    executor.state = "5";
    executor.showQuestion(message);
}

function step5(executor, message) {
    //Process Message - validate, store, execute
    //Jump to target state - by changing state value of executor
    //Show Target state Question
    executor.state = "6";
    executor.showQuestion(message);
}
function step6(executor, message) {
    //Process Message - validate, store, execute
    //Jump to target state - by changing state value of executor
    //Show Target state Question
    executor.state = "7";
    executor.showQuestion(message);
}


