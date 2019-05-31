/*global window, document, TextDecoder, setTimeout, console, PIXI*/
(function() {
    var createSpriteObject = function(body) {
        // create a new Sprite using the texture
        var sprite = new PIXI.Sprite(textures.player);
        sprite.height = 50;
        sprite.width = 50;
        // center the sprite's anchor point
        // sprite.anchor.x = 0.38775510204;
        sprite.anchor.y = 1;
        // move the sprite to the center of the screen
        sprite.position = body.position;
        sprite.rotation = body.angle;
        return sprite;
    };

    var speed = 0.25;
    var idCounter = 0;
    //map to track all the pixi objects
    var pixiMap = {};
    //the player object
    var player = {
        id: idCounter += 1,
        position: {
            x: 50,
            y: 0
        },
        velocity: {
            x: 0.25,
            y: 0.15
        },
        angle: 0,
        movement: {
            jumping: false,
            sliding: false,
            direction: 'right'
        }
    };
    //array with all the bodies in the game
    var bodies = [player];

    var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, { backgroundColor: 0x1099bb });
    var stage = new PIXI.Container();
    document.body.appendChild(renderer.view);

    if (player && player.position) {
        //set stage camera to be relative to the player
        stage.pivot.y = player.position.y - renderer.view.height / 2;
    }

    var imageUrl = "./sprite.png";
    var textures = {
        player: PIXI.Texture.fromImage(imageUrl)
    };

    var fpsText = new PIXI.Text('- fps');
    fpsText.position = {
        x: renderer.view.width - fpsText.width,
        y: -renderer.view.height / 2,
    };
    stage.addChild(fpsText);

    var debugText = new PIXI.Text('-');
    debugText.position = {
        x: 0,
        y: -renderer.view.height / 2,
    };
    stage.addChild(debugText);

    // start animating
    var dt, lastFrame, fps, frameCount = 0;
    var animate = function() {
        if(lastFrame){
            dt = Date.now() - lastFrame;
        } else {
            dt = 0;
        }
        lastFrame = Date.now();
        frameCount += 1;

        // calculate and draw fps text
        fps = 1 / dt * 1000;
        if((frameCount % 30) === 0){
            frameCount = 0;
            fpsText.text = Math.floor(fps) + " fps";
            fpsText.position.x = renderer.view.width - fpsText.width;
        }

        // draw controls text
        debugText.text = player.movement.jumping + ", " + player.movement.sliding + ", " + player.movement.direction + ", "
            + player.position.y + ", " + player.velocity.y + ", ";

        //handle jumping
        if(player.movement.jumping){
            if((player.position.y - (dt * player.velocity.y)) > 0){
                player.position.y = 0;
                player.velocity.y = 0.15;
                player.movement.jumping = false;
            } else {
                if(player.velocity.y - 0.0175 < -1){
                    player.velocity.y = -1;
                } else {
                    player.velocity.y -= 0.0175;
                }
                player.position.y -= dt * player.velocity.y;
            }
        }

        //handle sliding
        if(pixiMap[player.id]){
            if(player.movement.sliding){
                pixiMap[player.id].height = 25;
            } else {
                pixiMap[player.id].height = 50;
            }
        }

        bodies.forEach(function(body) {
            if(body.id !== player.id){
                //handle direction
                if(player.movement.direction === 'right'){
                    body.position.x -= dt * player.velocity.x;
                } else {
                    body.position.x += dt * player.velocity.x;
                }
            }

            if(pixiMap[body.id]){
                pixiMap[body.id].position = body.position;
                pixiMap[body.id].rotation = body.angle;
            }else{
                pixiMap[body.id] = createSpriteObject(body);
                stage.addChild(pixiMap[body.id]);
            }
        });

        // render the container
        renderer.render(stage);
        window.requestAnimationFrame(animate);
    };
    animate();

    // renderer.view.onmousemove = function(e) {
    //     if (player) {
    //         mouseX = player.position.x + (e.offsetX - renderer.view.width / 2);
    //         mouseY = player.position.y + (e.offsetY - renderer.view.height / 2);
    //         angle = Math.atan2(mouseY - player.position.y, mouseX - player.position.x);
    //     }
    // };

    // window.onkeypress = function(e){
    //     console.log(e);
    // };

    window.onkeydown = function(e) {
        if (e.key.toLowerCase() === "w") {
            if(player.movement.jumping === false){
                player.movement.jumping = true;
                player.movement.sliding = false;
                player.velocity.y = 0.5;
            }
        } else if (e.key.toLowerCase() === "a") {
            player.movement.direction = "left";
        } else if (e.key.toLowerCase() === "s") {
            player.movement.sliding = true;
        } else if (e.key.toLowerCase() === "d") {
            player.movement.direction = "right";
        }
    };

    window.onkeyup = function(e) {
        if (e.key.toLowerCase() === "s") {
            player.movement.sliding = false;
        }
    };

    window.onresize = function() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        //this part resizes the canvas but keeps ratio the same
        renderer.view.style.width = w + "px";
        renderer.view.style.height = h + "px";
        //this part adjusts the ratio:
        renderer.resize(w, h);
    };

    setInterval(() => {
        bodies.push({
            id: idCounter += 1,
            position: {
                x: renderer.width + 100,
                y: 0
            },
            angle: 0,
            movement: {
                up: false,
                down: false,
                direction: 'right'
            }
        })
    }, 1000);
})();
