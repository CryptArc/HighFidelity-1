(function() {
    var APP_ICON = "https://datastandard.blob.core.windows.net/botimg/58b03e5e525d6005b8667ad0-logo"
    
    // Get a reference to the tablet 
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var button = tablet.addButton({
        text: "mybot",
        icon: APP_ICON
    });

    var mybot = {};
    button.clicked.connect(function() {
        if (mybot.showing) {
            turnOff();
        } else {
            turnOn();
        }
    });
    
    turnOn();

    function turnOff() {
        mybot.showing = false;
        button.editProperties({
            isActive: false,
        });
        removeMyBot();
    }

    function turnOn() {
        mybot.showing = true;
        button.editProperties({
            isActive: true,
        });
        addMyBot();
    }

    function removeMyBot() {
        Entities.deleteEntity(mybot.entityID);
    }

    function addMyBot() {
        mybot.entityID = Entities.addEntity({
            name: "mybot",
            type: "Sphere",
            position: Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0, z: -3 })),
            rotation: MyAvatar.orientation,
            dimensions: { x: 0.25, y: 0.25, z: 0.25 },
            dynamic: true,
            density: 2500,
        }, true);
    }

    Script.update.connect(function(dt) {
        if (mybot.showing) {
            mybot.props = Entities.getEntityProperties(mybot.entityID);
            mybot.desiredPosition = Vec3.sum(MyAvatar.position, Vec3.UP);
            var keyAway = Vec3.subtract(mybot.desiredPosition, MyAvatar.position);
            keyAway.y = 0;
            var keepAwayOffset = Vec3.multiply(Vec3.normalize(keyAway), 3);
            mybot.desiredPosition = Vec3.sum(mybot.desiredPosition, keepAwayOffset);
            var acceleration = {x: 0, y: -9.8, z: 0};
            var deltaDesired = Vec3.subtract(mybot.desiredPosition, mybot.props.position);
            if(Vec3.length(deltaDesired) > 1) {
                var thrustAmount = 10;
                var dirDesired = Vec3.multiply(Vec3.normalize(deltaDesired), thrustAmount);
                var thrust = dirDesired.y > 0 ? thrustAmount * 2 : 0;
                acceleration = Vec3.sum(acceleration, {x: dirDesired.x, y: dirDesired.y + thrust, z: dirDesired.z})
                
            }
            Entities.editEntity(mybot.entityID, {
                velocity: Vec3.sum(mybot.props.velocity, Vec3.multiply(acceleration, dt)),
                position: Vec3.sum(mybot.props.position, {x: 0, y: 0.001, z: 0}), // try to get it to sync the entity positoin to other players
            })
        }
    });
    
    function cleanup() {
        tablet.removeButton(button);
        removeMyBot();
     }
    Script.scriptEnding.connect(cleanup);
}());
