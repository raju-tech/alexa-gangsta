/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');
// Load the SDK for JavaScript
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

const SKILL_NAME = 'My Telstra';
const GET_FACT_MESSAGE = "Here's your fact: ";
const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const NO_MESSAGE = 'Thank you for using My Telstra. ';
const OPTION_MESSAGES = [
        'Say one to. Recharge your mobile number. ',
        'Say two to. Change or Set Default Card. '
];
const WELCOME_MESSAGE = 'Hello!! Welcome to My Telstra. ';
var alexaThis = this;
var selectedPlan = '';

const handlers = {
    'LaunchRequest': function (handlerInput) {
      //  var messages = '';
      //    for(var i = 0 ; i < OPTION_MESSAGES.length ; i++){
      //      messages += OPTION_MESSAGES[i];
      //}
     // handlers.listSavedCard();
         
        this.emit(':ask', WELCOME_MESSAGE + HELP_REPROMPT);
        
    },
    'rechargePrepaidNumber': function () {
        this.emit(':ask', 'Please provide your prepaid mobile number.')  
    },
   'GetMobileNumber': function () {
         var mnumber = this.event.request.intent.slots.mobileNumber.value;
         // 0429735280
         console.log('Getting Mobile Number');
         if(mnumber.length < 10 || mnumber.length > 10){
             this.emit(':ask','Please read out the correct mobile number as I understand this mobile number is incorrect.')
         }
         console.log('Mobile Number is ' + mnumber);
         this.attributes.mobileNumber = mnumber;
         this.emit(':ask', 'Sure, I came across a some of plans for your number. <say-as interpret-as="digits">' + mnumber + ' </say-as>, would you be interested');
    },
    'plansForGivenMobileNumber': function () {
        alexaThis = this;
        var suburb = 'plan';
        if(suburb) suburb = suburb.toUpperCase();
        console.log('suburb ', suburb);
        // make sure we have a recommendation
        getBuyData(suburb);
    },
    'nextPlanPlease': function () {
        if(this.attributes.mobileNumber === undefined){
            this.emit(':ask','Please provide your mobile number to proceed.');
        }
        
        if( this.attributes.currentPlanIndex + 1 == this.attributes.plans.length) {
            this.emit(':ask', 'Sorry, no more plans available. Please go through previous plans'); 
        }
        this.attributes.currentPlanIndex++;
        var planNumber = this.attributes.currentPlanIndex + 1;
        console.log('Next Plan : Plan ' + planNumber);
        this.emit(':ask', 'Plan ' + planNumber + ' is ' + this.attributes.plans[this.attributes.currentPlanIndex].message);
      
    },
    'prevPlanPlease': function () {
        if(this.attributes.mobileNumber === undefined){
            this.emit(':tell','Please provide your mobile number to proceed.');
        }
        if( this.attributes.currentPlanIndex == 0) {            
            this.emit(':ask','Sorry, no more plans available. Please go through next plans'); 
        }
        this.attributes.currentPlanIndex--;
        var planNumber = this.attributes.currentPlanIndex + 1;
        console.log('Previous Plan : Plan ' + planNumber);
        this.emit(':ask', 'Plan ' + planNumber + ' is ' + this.attributes.plans[this.attributes.currentPlanIndex].message);
      
    },
    'gotoPlan': function () {
        if(this.attributes.mobileNumber === undefined){
            this.emit(':tell','Please provide your mobile number to proceed.');
        }
        var planNumber = this.event.request.intent.slots.planNumber.value;  
        
        if(planNumber < 1 || planNumber > alexaThis.attributes.totalPlans ){
            this.emit(':ask', 'Plan ' + planNumber + ' does not exists. Please provide valid plan number.');
        }
        
        this.attributes.currentPlanIndex = planNumber - 1;
        console.log('Goto Plan : Plan ' + planNumber);
        this.emit(':ask', 'Plan ' + planNumber + ' is ' + this.attributes.plans[this.attributes.currentPlanIndex].message);
    },
    'repeatPlan': function () {
        if(this.attributes.mobileNumber === undefined){
            this.emit(':tell','Please provide your mobile number to proceed.');
        }
        var planNumber = this.attributes.currentPlanIndex + 1;
        console.log('Repeat Plan : Plan ' + planNumber);
        this.emit(':ask', 'Plan ' + planNumber + ' is ' + this.attributes.plans[this.attributes.currentPlanIndex].message);  
    },
    'chooseCurrentPlan': function () {
        var planNumber = this.event.request.intent.slots.planNumber.value;
        if ( planNumber === undefined ) {
            planNumber = this.attributes.currentPlanIndex + 1;
        }
        if(planNumber < 1 || planNumber > alexaThis.attributes.totalPlans){
            this.emit(':ask', 'Plan ' + planNumber + ' does not exists. Please provide valid plan number.');
        }
        selectedPlan = 'Plan ' + planNumber + '. ' + this.attributes.plans[planNumber-1].message;
        console.log('Selected Plan : ' + selectedPlan);
        if(this.attributes.mobileNumber === '0429735280'){
            this.emit(':tell', 'Thanks I got your option. Sorry, you don\'t have the Saved card in the portal. Can you please link another mode of payment in the portal to proceed? Thanks will wait once its done to assist you again in recharge. ' + STOP_MESSAGE);
        }
        this.emit(':ask', 'Thanks I got your option, Please provide 4 digit pin to make payment using your saved credit card.');
    },
    'prePayment': function () {
      
      var option = this.event.request.intent.slots.optionValue.value.toUpperCase();
      
      if(option === 'YES'){
        this.emit(':ask','Please read out ur card pin');
      }else{
          this.emit(':tell','Can you please link another mode of payment in the portal to proceed? Thanks will wait once its done to assist you again in recharge. ' + STOP_MESSAGE);
      }
    },
    'makePayment': function () {
        if(this.attributes.mobileNumber === undefined){
            this.emit(':tell','Please provide your mobile number to proceed.');
        }
        var pin = this.event.request.intent.slots.pin.value;
        console.log('Making Payment');
        if(pin     == 0) {
            this.emit(':ask', 'Please read out the correct pin as I understand this pin is incorrect.');    
        } else {
            console.log('Pin Entered');
            this.emit(':tell', 'Congratulations your transaction is successful , your recharge is done for mobile number.  <say-as interpret-as="digits"> ' 
            + this.attributes.mobileNumber 
            + ' </say-as> and your plan is .  ' + selectedPlan + '. Recharge done using your saved credit card, Goodbye!'
            );                        
        }
    },
    'listSavedCard': function () {
       this.emit(':tell','Coming soon . . . ');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(NO_MESSAGE + STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function(){
        this.response.speak(NO_MESSAGE + ' and ' + STOP_MESSAGE);
        this.emit(':responseReady');
    }
};


function getBuyData(suburb) {
    var ddb = new AWS.DynamoDB.DocumentClient();     
    
    var params = {
        ExpressionAttributeValues: {
            ':suburb' : suburb
        },
        ExpressionAttributeNames: {
            '#u': 'text'
         },
        FilterExpression : 'category1 = :suburb',
        ProjectionExpression: '#u',
        TableName: 'realestate-posts'
    };
    console.log('params', params);
    ddb.scan(params, function(err, data) {
        if (err) {
            console.log('error is ', err);
            const undefinedPrompt = "Sorry, I dont have recommendation for that. Try again by saying the name of another suburb.";
            const undefinedRePrompt = "Can you say a suburb name?";
            alexaThis.emit(':ask', undefinedPrompt, undefinedRePrompt);
            return;
        }else{
            var recommendation = [];
            var index = 0;
            console.log('data', data);
            data.Items.forEach(function(entry) {
                console.log(entry);
                recommendation[index]=JSON.parse(entry.text);
            
            });
            alexaThis.attributes.plans = recommendation[index];
            alexaThis.attributes.currentPlanIndex=0; 
            console.log('plans ', recommendation[index]);
            alexaThis.attributes.totalPlans = recommendation[index].length;
            var result = 'Plan 1 is '  + recommendation[index][0].message;
            alexaThis.emit(':ask', result, 'say NEXT or PREVIOUS');          
        }
    });    
}

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
