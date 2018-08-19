(function() {

    var APP_URL = "https://www.emojicopy.com/"
    var APP_NAME = "emojis";
   
    var APP_ICON = "https://emojipedia-us.s3.amazonaws.com/thumbs/120/apple/129/smiling-face-with-heart-shaped-eyes_1f60d.png"
    
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
