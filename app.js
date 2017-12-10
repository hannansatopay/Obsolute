var regression = require("regression");
var Base64 = require('Base64');
var requestify = require('requestify'); 
var restify = require('restify');
var builder = require('botbuilder');
imgurwrap = require('imgurwrap');
imgurwrap.setUserAgent('imgurwrap default useragent v1.1'); // Replace with your UserAgent 
imgurwrap.setClientID('12a089fd26494e4'); // Replace with your CleintID 

var resultresponse;
var softwareName;
var softwareVersion;


require('dotenv').config({silent: true});
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
console.log('%s listening to %s', server.name, server.url); 
});
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
appId: process.env.MICROSOFT_APP_ID,
appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Listen for messages from users 
server.post('/api/messages', connector.listen());
// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("I am Obsolute: The solution to the IT System obsolescence!");
        builder.Prompts.text(session, "What is the software name?");
    },
    function (session, results) {
         session.dialogData.softwareName = results.response;
		 softwareName=session.dialogData.softwareName.toLowerCase();
         
        builder.Prompts.number(session, "What is the version number?");
		
    },
    function (session, results) {
        session.dialogData.softwareVersion = results.response;
		softwareVersion=session.dialogData.softwareVersion;
		

        // Process request and display reservation details
        //session.send("You entered: <br/>Software Name: "+session.dialogData.softwareName+"<br/>Version Number: "+ session.dialogData.softwareVersion);
		
// This will help in finding the software, get its details and then compare the versions to get the proper output
	requestify.request('https://a632e272-d961-4884-82f4-b6cb8c85060c-bluemix.cloudant.com/itsystem/_find', {
    method: 'POST',
	 body: {
   "selector": {
      "$or": [
         {
            "name1": ""+softwareName
         },
         {
            "name2": ""+softwareName
         },
         {
            "name3": ""+softwareName
         }
      ]
   },
   "fields": [
      "_id",
      "category",
      "obsoleteversion",
      "version"
   ]
},
    headers: {
        'Content-Type':'application/json',
		'Authorization':'Basic ' + Base64.btoa('a632e272-d961-4884-82f4-b6cb8c85060c-bluemix:4e7ea62dccd8951cba0d0777983da327c6df770a9038a6788f9d43779212df1a')
    },
        
}).then(function(response) {
	
    resultresponse=response.getBody(); 
	//console.log(resultresponse);
	if(resultresponse.bookmark=="nil")
	{
		session.send("Opps the software was not found! <br/>Please reply to start again.");
	}
		else{
	var idvalue=resultresponse.docs[0]._id; // ID of the software
	var category=resultresponse.docs[0].category; //Category of the software
	
	var obsoleteversion=resultresponse.docs[0].obsoleteversion; //The number of current obsolete version
	
	var historyvernumber=resultresponse.docs[0].version.number;
	var historyvernumberarr = historyvernumber.split(","); //Array containing the history of version numbers

	
	var historyverdate=resultresponse.docs[0].version.date;
	var historyverdatearr = historyverdate.split(";"); //Array containing the history of version dates
	
	//To get the latest version, first version and the entered version distance from the latest with their dates
	var arrlength=historyvernumberarr.length;

	var enteredverpos = historyvernumberarr.indexOf(""+softwareVersion);
	
	//#If the entered version is not found, then show error and restart the conversation or so
	if(enteredverpos==-1)
	{
		if(Number(historyvernumberarr[0])>Number(softwareVersion)>Number(0))
		{
			session.send("The entered version is not present in our database yet. For now, here are some details related to the software.");	
		}
		else
		{
	session.send("The entered version number does not exist, please confirm and try again. For now, here are some details related to the software.");	
		}
	session.sendTyping();	
		
	}
	else if(enteredverpos==0)
	{
    //console.log("You are using version "+softwareVersion+", which was released on "+historyverdatearr[0]+". It is the latest version. The first version was released on "+historyverdatearr[arrlength-1]+". Your software is still trendy/up to date!");	
	session.send("You are using version "+softwareVersion+", which was released on "+historyverdatearr[0]+". It is the latest version. The first version was released on "+historyverdatearr[arrlength-1]+". Your software is still trendy/up to date!");	
	session.sendTyping();
	}
	else{
		//console.log("You are using version "+softwareVersion+", which was released on "+historyverdatearr[0]+". Since then, there have been "+enteredverpos+" newer versions. The latest version, version "+historyvernumberarr[0]+" was released on "+historyverdatearr[0]+". The first version was released on "+historyverdatearr[arrlength-1]);
	session.send("You are using version "+softwareVersion+", which was released on "+historyverdatearr[0]+". Since then, there have been "+enteredverpos+" newer versions. The latest version, version "+historyvernumberarr[0]+" was released on "+historyverdatearr[0]+". The first version was released on "+historyverdatearr[arrlength-1]);
	
	if(softwareVersion>obsoleteversion)
	{
		if(enteredverpos>=5)
		{
			session.send("Your software is likely to be obsolete.");
			session.sendTyping();
		}
		else{
			session.send("Your software is still trending ie. not obsolete.");	
			session.sendTyping();
		}
	}
	else
	{
		session.send("The version is no longer supported by the vendor. Your software is obsolete.");
		session.sendTyping();
	}
	}
	
	
	// This will help in finding the related software by searching for the category 


requestify.request('https://a632e272-d961-4884-82f4-b6cb8c85060c-bluemix.cloudant.com/itsystem/_find', {
    method: 'POST',
	 body: {
   "selector": {
      "category": ""+category
   },
   "fields": [
      "_id",
      "version",
	  "name2"
   ]
},
    headers: {
        'Content-Type':'application/json',
		'Authorization':'Basic ' + Base64.btoa('a632e272-d961-4884-82f4-b6cb8c85060c-bluemix:4e7ea62dccd8951cba0d0777983da327c6df770a9038a6788f9d43779212df1a')
    },
        
}).then(function(response) {
    // get the response body
	resultresponse=response.getBody().docs; 
	//console.log(resultresponse);
	var arrlen=resultresponse.length;
	session.send("The related/similar softwares details are as follows:");
	
	for(var i=0;i<arrlen;i++)
	{
		var getvalue=response.getBody().docs[i]._id;
		if(getvalue==idvalue){
		var softFullName=response.getBody().docs[i].name2;
	    var tempstore = softFullName.toLowerCase().split(' ');
  for (var l = 0; l < tempstore.length; l++) {
    tempstore[l] = tempstore[l].charAt(0).toUpperCase() + tempstore[l].slice(1); 
  }
  softFullName=tempstore.join(' ');	
		}
		else{
		
	var histrelatedvernumber=response.getBody().docs[i].version.number;
	var histrelatedvernumberarr = histrelatedvernumber.split(","); //Array containing the history of version numbers
	//console.log(histrelatedvernumberarr[0]);

	var histrelatedverdate=response.getBody().docs[i].version.date;
	var histrelatedverdatearr = histrelatedverdate.split(";"); //Array containing the history of version dates	
	
	var relatedsoftname=response.getBody().docs[i].name2;
	var str = relatedsoftname.toLowerCase().split(' ');
  for (var j = 0; j < str.length; j++) {
    str[j] = str[j].charAt(0).toUpperCase() + str[j].slice(1); 
  }
  relatedsoftname=str.join(' ');
	
	session.send("<br/>Name: " +relatedsoftname+" Latest Version: "+histrelatedvernumberarr[0]+" Release Date: "+histrelatedverdatearr[0]);
	session.sendTyping();
		}
	}
	
// Perform Linear Regression
	historyvernumberarr.reverse();
	historyvernumberarr.splice(0,2);
    
	//console.log(historyvernumberarr);
	
	historyverdatearr.reverse();
    historyverdatearr.splice(0,1);
	
	var analysisarrlen=historyvernumberarr.length;
	
	//console.log(analysisarrlen);
	
	var statisticsarr = [];
	for(var k=0;k<analysisarrlen;k++)
	{
		statisticsarr[k]= Math.floor(( Date.parse(historyverdatearr[k+1]) - Date.parse(historyverdatearr[k])) / 86400000); 	
	}
	console.log(statisticsarr);
var ar2 = [];

for(var i in historyvernumberarr) {
    var ar3 = []
    ar3.push(historyvernumberarr[i], statisticsarr[i]);
    ar2.push(ar3);
}
console.log(ar2);

var result = regression.linear(ar2);
const resultm = result.equation[0];
const resultb = result.equation[1];

console.log("m="+resultm);
console.log("b="+resultb);

//Here we will use plotly to get the obsolescence trend plot

// This will be the data for the scatter
var historyscatter={x:historyvernumberarr,
           y:statisticsarr,
		   name: "History Data Plot",
		   marker: {
    color: "rgb(255, 180, 15)",
    size: 12,
  },
           mode: "markers",type:"scatter"};

	   //console.log(analysisarrlen);
var lastelement=Number(historyvernumberarr[analysisarrlen-1]);
 //console.log(lastelement);
var regxarr=[historyvernumberarr[0],Number(lastelement)+Number(5)];

var y1=(Number(resultm)*Number(historyvernumberarr[0]))+Number(resultb);
var y2=(Number(resultm)*(Number(lastelement)+Number(5)))+Number(resultb);

var regyarr=[y1,y2];
// This will be the data for the regression
var regressionline={x:regxarr,
           y:regyarr,
		   name: "Regression Line",
    line: {
      color: "blue",
      width: 1.5
    }
  ,
           type:"line"};
		   
	//console.log(regressionline);	
	
// This will be the data for the prediction
var predictionarrx=[Number(lastelement)+Number(1),Number(lastelement)+Number(2),Number(lastelement)+Number(3),Number(lastelement)+Number(4),Number(lastelement)+Number(5)];

//console.log(predictionarrx);

var predicty1=(Number(resultm)*(Number(lastelement)+Number(1)))+Number(resultb);
var predicty2=(Number(resultm)*(Number(lastelement)+Number(2)))+Number(resultb);
var predicty3=(Number(resultm)*(Number(lastelement)+Number(3)))+Number(resultb);
var predicty4=(Number(resultm)*(Number(lastelement)+Number(4)))+Number(resultb);
var predicty5=(Number(resultm)*(Number(lastelement)+Number(5)))+Number(resultb);





var predictionarry=[predicty1,predicty2,predicty3,predicty4,predicty5];

//console.log(predictionarry);

var predictionerror={
    x: predictionarrx,
    y: predictionarry,
	name: "Prediction",
    error_y: {
      type: "constant",
      value: 1.5,
      visible: true,
	  opacity: 0.6
    },
	marker: {
    color: "#85144B",
    size: 12,
	symbol:"star"
  },
	mode:"markers",
    type: "scatter"
  };
session.send("Please wait, performing analysis.........");
session.sendTyping();

//console.log(predictionerror);

	requestify.request('https://api.plot.ly/v2/images', {
    method: 'POST',
	 body: {
    "figure": {
        "data": [historyscatter,regressionline,predictionerror],
        "layout": {
  title: "Trend for "+softFullName,
  paper_bgcolor:"#F5F5F5" ,
  "width":1500,
  "height":500,
  titlefont:{
	  size:22
  },
  xaxis: {
    title: "Version Number",
   showline: true,
   gridcolor:'#bdbdbd',
        gridwidth:1,
   autotick:false,
        ticklen:5,
        tickwidth:1,
        tickcolor:'#000'
  },
  yaxis: {
    title: "Consecutive version release date difference (in days)",
	gridcolor:'#bdbdbd',
        gridwidth:1,
    showline: true,
	 autotick:false,
        ticklen:5,
        tickwidth:1,
        tickcolor:'#000'
  }
}
    },
 
    "format": "png",
    "scale": 5,
    "encoded": true
},
    headers: {
        'Content-Type':'application/json',
		'Plotly-Client-Platform':'node.js',
		'Authorization':'Basic ' + Base64.btoa('thereal.hannan:YLbI7ZAJCWnShkW9YxPO')
    },
        
}).then(function(response) {
    // get the response body
	var resultresponse=response.getBody(); 

var resresponse = resultresponse.replace("data:image/png;base64,", "");

 session.sendTyping();	
 
imgurwrap.uploadImageBase64({
    image: resresponse,
    title: 'obsolescence trend',
    description: 'obsolescence trend'
}, function(err, res) {
    var imageattach=res.data.link;
	console.log(imageattach);

	
	
	var contentType = 'image/png';
	
	session.send({
            attachments: [
                {
                    contentUrl:""+imageattach,
            contentType: contentType,
                    name: "obsolescence-trend.jpg"
                }
            ]
        });
	

session.send("The trend graph was generated through the use of machine learning algorithm on the available data to get the prediction data for knowing the obsolescence trend.");
	var obsoletecombinedays = Number(predictionarry[0])+Number(predictionarry[1])+Number(predictionarry[2])+Number(predictionarry[3])+Number(predictionarry[4]);
	session.send("A new version of the software is likely to come up in "+predictionarry[0]+" days.");
	if(enteredverpos==-1)
	{
		session.send("If we consider a 5 version obsolescence period, then the latest version is likely to become obsolete in "+obsoletecombinedays+" days.");
	}
	else if(enteredverpos==0)
	{
	session.send("Yours is the latest version. It will become obsolete after five new updates, most likely in "+obsoletecombinedays+" days.");	
	}
	else{
	session.send("The latest version is likely to become obsolete in "+obsoletecombinedays+" days.");
	if(softwareVersion>=obsoleteversion)
	{
		if(enteredverpos>=5)
		{
			session.send("Your software is already obsolete.");
		}
		else{
			var obsoletecomb=0;
			for(var m=0;m<Number(5)-Number(enteredverpos);m++)
			{
				//console.log(m);
			obsoletecomb=Number(obsoletecomb)+Number(predictionarry[m]);
//console.log(obsoletecomb);			
			}
			//console.log(obsoletecomb);
			session.send("There have been "+enteredverpos+" newer versions with respect to your version. If we consider a 5 version obsolescence period, then it is likely to become obsolete in "+obsoletecomb+" days.");	
		}
	}
	else
	{
		session.send("Your software is already obsoleted by the vendor.");
	}
	}
	
		
		session.endDialog("Hope I was able to be of help. <br/>You can leave the conversation or if you wish to start over then just reply.");

});	

},function(error) {
          console.log(error);
		   session.send("Opps there was an error! <br/>Please reply to start again.");
        });


},function(error) {
          console.log(error);
		   session.send("Opps there was an error! <br/>Please reply to start again.");
        });

}	
},function(error) {
          console.log(error);
		   session.send("Opps there was an error! <br/>Please reply to start again.");
        });







		
        
    }
	
]);

/*
// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        });
    }
});
*/

// The dialog stack is cleared and this dialog is invoked when the user enters 'cancel'
bot.dialog('cancel', function (session, args, next) {
    session.endDialog("Cancelled. Hope I was able to be of help. <br/>You can leave the conversation or if you wish to start over then just reply.");
})
.triggerAction({
    matches: /^end$|^cancel$|^abort$|^over$|^nevermind$/i
});



// The dialog stack is cleared and this dialog is invoked when the user enters 'help'.
bot.dialog('help', function (session, args, next) {
    session.endDialog("I am Obsolute: The solution to the IT System Obsolescence! You can enter the software name and version number when prompted to get to know the software version history and check for your software version obsolescence along with similar software as well as to get to know the obsolescence trend.<br/>Please reply to continue.");
})
.triggerAction({
    matches: /^help$|^about$/i
});

bot.dialog('thanks', function (session, args, next) {
    session.endDialog("No problem.<br/>You can leave the conversation or if you wish to start over then just reply.");
})
.triggerAction({
    matches: /^thanks$|^thank you$/i
});
