(function() {

    var APP_URL = "https://www.youtube.com/"
    var APP_NAME = "youtube";
    var APP_ICON = "https://cdn.pixabay.com/photo/2016/07/03/18/36/youtube-1495277__340.png"
    
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
