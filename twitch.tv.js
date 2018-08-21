(function() {

    var APP_URL = "https://www.twitch.tv/"
    var APP_NAME = "twitch";
    var APP_ICON = "https://cdn-images-1.medium.com/fit/c/36/36/1*JpEvZD1Wfo5GvUzdTWsJzQ.png"
    
    // Get a reference to the tablet 
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

     var button = tablet.addButton({
             text: APP_NAME,
             icon: APP_ICON
         });
    
   
        function clicked(){
   
            tablet.gotoWebScreen(APP_URL);
           
        }
        button.clicked.connect(clicked);
    
   
     function cleanup() {
            tablet.removeButton(button);
     }
    Script.scriptEnding.connect(cleanup);
    }());
