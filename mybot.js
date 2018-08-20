(function() {
    var APP_ICON = "https://datastandard.blob.core.windows.net/botimg/58b03e5e525d6005b8667ad0-logo"
    
    // Get a reference to the tablet 
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var button = tablet.addButton({
        text: "mybot",
        icon: APP_ICON
    });
    var debugDesired = false;

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
        MyAvatar.setAvatarEntityData({});
        button.editProperties({
            isActive: true,
        });
        mybot = {
            showing: true,
            lastError: 0,
            iError: 0,
            velocity: { x: 0, y: 0, z: 0 },
            position: Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0, z: -3 })),
        };
        addMyBot();
    }

    function removeMyBot() {
        Entities.deleteEntity(mybot.entityID);
        if (debugDesired) {
            Entities.deleteEntity(mybot.debugID);
        }
    }

    function addMyBot() {
        mybot.entityID = Entities.addEntity({
            name: "mybot",
            type: "Sphere",
            position: mybot.position,
            dimensions: { x: 0.25, y: 0.25, z: 0.25 },
            dynamic: false,
            collisionless: true,
        }, true);
        if (debugDesired) {
            mybot.debugID = Entities.addEntity({
                name: "mybot.debug",
                type: "Box",
                position: Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0, z: -3 })),
                rotation: MyAvatar.orientation,
                dimensions: { x: 0.1, y: 0.1, z: 0.1 },
                collisionless: true,
                dynamic: false,
            }, true);
        }
    }

    var pid = {
        p: 30,
        i: 0.5,
        d: 300,
    };
    Script.update.connect(function(dt) {
        if (mybot.showing) {
            mybot.props = Entities.getEntityProperties(mybot.entityID);
            mybot.desiredPosition = Vec3.sum(MyAvatar.position, {
                x: 0.5 * Math.cos(mybot.props.age * 3),
                y: 1.5,
                z: 0.5 * Math.sin(mybot.props.age * 3),
            });
            
            if (debugDesired) {
                Entities.editEntity(mybot.debugID, {
                    position: mybot.desiredPosition,
                });
            }
            var acceleration = {x: 0, y: -9.8, z: 0};
            var deltaDesired = Vec3.subtract(mybot.desiredPosition, mybot.props.position);
            var errorAmount = Vec3.length(deltaDesired);
            var dErrorAmount = errorAmount - mybot.lastError;
            mybot.iError += dErrorAmount;
            mybot.lastError = errorAmount;
            mybot.iError += dErrorAmount;

            var thrustAmount = pid.p * errorAmount + pid.i * mybot.iError +  pid.d * dErrorAmount;
            var dirDesired = Vec3.multiply(Vec3.normalize(deltaDesired), thrustAmount);
            acceleration = Vec3.sum(acceleration, {x: dirDesired.x, y: dirDesired.y, z: dirDesired.z})

            mybot.velocity = Vec3.sum(mybot.velocity, Vec3.multiply(acceleration, dt));
            mybot.velocity = Vec3.multiply(mybot.velocity, 0.98);
            mybot.position = Vec3.sum(mybot.position, Vec3.multiply(mybot.velocity, dt));

            Entities.editEntity(mybot.entityID, {
                position: mybot.position,
            });
        }
    });
    
    function cleanup() {
        tablet.removeButton(button);
        removeMyBot();
     }
    Script.scriptEnding.connect(cleanup);
}());
