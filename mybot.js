(function() {
    var APP_ICON = "https://datastandard.blob.core.windows.net/botimg/58b03e5e525d6005b8667ad0-logo";
    // CREDIT FOR MODEL: dave404 - https://poly.google.com/view/f_WeaXnvG0T
    var BOT_MODEL = "https://brandf.github.io/HighFidelity/model.fbx";
    var MAX_VELOCITY = 0.03;
    var debugDesired = false;

    String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
    };

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
            rotation: Quat.fromPitchYawRollDegrees(0,0,0),
        };
        chooseTargetAvatar();
        addMyBot();
    }

    function chooseTargetAvatar() {
        var botcolors = [
            { red: 255, green: 0, blue: 0 },
            { red: 0, green: 255, blue: 0 },
            { red: 0, green: 0, blue: 255 },
            { red: 255, green: 255, blue: 0 },
            { red: 0, green: 255, blue: 255 },
            { red: 255, green: 0, blue: 255 },
            { red: 255, green: 255, blue: 255 },
            { red: 0, green: 0, blue: 0 },
        ];
        var avatars = AvatarList.getAvatarsInRange(MyAvatar.position, 500);
        mybot.targetAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        mybot.color = botcolors[Math.abs(mybot.targetAvatar.hashCode()) % botcolors.length];
    }

    Script.setInterval(chooseTargetAvatar, 5000);

    function removeMyBot() {
        Entities.deleteEntity(mybot.entityID);
        if (debugDesired) {
            Entities.deleteEntity(mybot.debugID);
        }
    }

    

    function addMyBot() {
        mybot.entityID = Entities.addEntity({
            name: "mybot",
            type: "Model",
            position: mybot.position,
            dimensions: { x: 0.25, y: 0.25, z: 0.25 },
            modelURL: BOT_MODEL,
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
            var avatar = AvatarManager.getAvatar(mybot.targetAvatar);
            mybot.props = Entities.getEntityProperties(mybot.entityID);
            mybot.desiredPosition = Vec3.sum(avatar.position, {
                x: 0.5 * Math.cos(mybot.props.age * 2),
                y: 1.5 + 0.1 * Math.cos(Math.PI + mybot.props.age * 4),
                z: 0.5 * Math.sin(mybot.props.age * 2),
            });
            
            if (debugDesired) {
                Entities.editEntity(mybot.debugID, {
                    position: mybot.desiredPosition,
                });
            }

            // a crappy pid loop. idk what I'm doing.
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
            if(Vec3.length(mybot.velocity) * dt > MAX_VELOCITY) {
                mybot.velocity = Vec3.multiply(Vec3.normalize(mybot.velocity), MAX_VELOCITY / dt);
            }
            mybot.position = Vec3.sum(mybot.position, Vec3.multiply(mybot.velocity, dt));
            mybot.desiredPosition = Quat.lookAtSimple(mybot.position, Vec3.subtract(mybot.position, mybot.velocity));
            mybot.rotation = Quat.slerp(mybot.rotation, mybot.desiredPosition, dt * 1.5);
            Entities.editEntity(mybot.entityID, {
                position: mybot.position,
                rotation: mybot.rotation,
            });
        }
    });
    
    function cleanup() {
        tablet.removeButton(button);
        removeMyBot();
     }
    Script.scriptEnding.connect(cleanup);
}());
