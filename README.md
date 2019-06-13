# ChatbotResearchProject

Chatbot project was developed using NodeJS and telegram API for UTS Research Project. It has been developed as a prototype for filing online insurance claims for mobile. Some of the features inlclude: <br>
 * Communicating with users to understand their peril<br>
 * Validation of user details<br>
 * Sending emails with PDF file generated with insurance claim number.<br>

## Table of contents
<!--ts-->
   * [Getting Started](#getting-started)
   * [Database](#database)
   * [Sending Email functionality](#sending-email-functionality)
   * [Screenshot](#screenshot)
<!--te-->

## Getting Started
Please clone ChatbotResearchProject into your local system to work with it. <br>

### Checking out the source-code from Github:
You need Git for cloning the project into your system. Please follow [this guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) for Git installation. For cloning the the project, open `Git Bash` and give the following command: <br/>
`git clone https://github.com/Sunit22/SydneyHappening.git` <br>

### NPM and Node.js installation:
Please follow these instruction to download and install 
[Node Package Manager(npm) and Node.js](https://www.npmjs.com/get-npm). After Node Package Manager (npm) has been installed, Please set up an account for Telegram bot API. [Telegram Bot API ](https://core.telegram.org/bots) <br>

### Starting the SydneyHappening project
After completing the installations, navigate to `/ChatbotResearchProject/` directory and give command <br>
`npm intall`<br>
This would install all the package dependencies for the server from `package.json file` in the `node_modules` directory. <br>  

Once the installation has finished, and verify the server port address in `index.js`. By default the port number would be 3000, however it can be changed as per requirement. Start the server using command: <br>
`node index.js`<br>
If the port has not been changed, by default, the server should start at `http://localhost:3000` <br>
Once the server has been started you can communicate with UTS bot on `Telegram messenger`, for this project we have set up the ID of the bot as `@EthosInsureBot`. 


## Database
For this project we have used [SQLITE3](https://www.sqlite.org/index.html), for using database services.  

## Sending Email functionality
We have removed the keys to our email for security purposes, please follow [Nodemailer guide](https://nodemailer.com/about/) to register an with an smtp server to send emails.

## Screenshot
![Screen1](https://i.imgur.com/MX4L7hT.jpg)
![Screen2](https://i.imgur.com/g9kkaNW.jpg)
![Screen3](https://i.imgur.com/PuA2c9w.jpg)
![Screen4](https://i.imgur.com/em43Dlz.jpg)
