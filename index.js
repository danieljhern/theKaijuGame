// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1200;
canvas.height = 600;
document.body.appendChild(canvas);

//sounds

var soundGameOver = "sounds/screaming-people.wav";
var soundHeroLoses = "sounds/falling-scream.wav";
var soundMonsterLoses = "sounds/angry-monster-scream.wav";
var soundBackgroundMusic = "sounds/futuristic-space-war-percussion.wav";
var soundBackgroundPeople = "sounds/ambient-crowd.wav";

var soundEfx = document.getElementById("soundEfx");

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/seattleSkyline.jpg";


// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};
heroImage.src = "images/heroWorkingOn.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
};
monsterImage.src = "images/teddy.png";

// lots of variables to keep track of sprite geometry
//  I have 8 rows and 3 cols in my space ship sprite sheet
//hero rows and columns
var rows = 6;
var cols = 11;
//monster rows and colums
var mrows = 2;
var mcols = 12;

//monster movement
var monsterleft = 0;





//second row for the right movement (counting the index from 0)
var trackRight = 0;
//third row for the left movement (counting the index from 0)
var trackLeft = 1;
var trackUp = 2;   // not using up and down in this version, see next version
var trackDown = 2;

//Hero Sprite Dimensions
var spriteWidth =  2000 //OG159; // also  spriteWidth/cols; 
var spriteHeight =   800//OG155;  // also spriteHeight/rows; 
var width = spriteWidth / cols; 
var height = spriteHeight / rows; 

//Monster Sprite Dimensions
var mspriteWidth =     3026 //OG159; // also  spriteWidth/cols; 
var mspriteHeight =    604//OG155;  // also spriteHeight/rows; 
var mwidth = mspriteWidth / mcols; 
var mheight = mspriteHeight / mrows; 


//hero frame guidance
var curXFrame = 0; // start on left side
var frameCount = 11;  // 3 frames per row

//monster frame guidance
var mcurXFrame = 0; // start on left side
var mframeCount = 12  // 3 frames per row


//hero x and y cordinates
//x and y coordinates of the overall sprite image to get the single frame  we want
var srcX = 0;  // our image has no borders or other stuff
var srcY = 0;

//monster x and y cordinates we want
var msrcX = 0;  // our image has no borders or other stuff
var msrcY = 0;

//Assuming that at start the character will move right side 
var left = false;
var right = true;


//monster left/ monster right
var mleft = false;
var mright = false;



// Game objects
var hero = {
    speed: 100, // movement in pixels per second
    x: 0,  // where on the canvas are they?
    y: 0,  // where on the canvas are they?
    item: "",
    winner: false,
};
var monster = {
// for this version, the monster does not move, so just and x and y
    x: 0,
    y: 0,
    item: ""
};

storypresent = true

//monster item array and array to hold random object from monster

monsterItem = ["rock","paper","scissors"];

var KaijuDefeated = 0;

// Handle keyboard controls
var keysDown = {}; //object were we properties when keys go down
                // and then delete them when the key goes up
// so the object tells us if any key is down when that keycode
// is down.  In our game loop, we will move the hero image if when
// we go thru render, a key is down

addEventListener("keydown", function (e) {
    //console.log(e.keyCode + " down")
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    ///console.log(e.keyCode + " up")
    delete keysDown[e.keyCode];
}, false);




// ==========================================================

// functions go here



// Update game objects
let update = function (modifier) {

    storypresent == false

    left = false;
    right = false;

    mleft = true;
    mright = false;


    // move if key down but not if about to move into bushes 
    if (38 in keysDown && hero.y > 32+2) { //  holding up key
        hero.y -= hero.speed * modifier;
    }
    if (40 in keysDown && hero.y < canvas.height - (179 + 2)) { //  holding down key
        hero.y += hero.speed * modifier;
    }
    if (37 in keysDown && hero.x > (32+2)) { // holding left key
        hero.x -= hero.speed * modifier;
        left=true;
    }
    if (39 in keysDown && hero.x < canvas.width - (107 + 2)) { // holding right key
        hero.x += hero.speed * modifier;
        right=true;
    }
    monsterMove();
    
    


    // Are they touching?
    if (
        hero.x <= (monster.x + 100)
        && monster.x <= (hero.x + 100)
        && hero.y <= (monster.y + 100)
        && monster.y <= (hero.y + 100)
        
//        hero.x <= (monster.x + 50)
  //      && monster.x <= (hero.x + 50)
 //       && hero.y <= (monster.y + 32)
   //     && monster.y <= (hero.y + 140)


    ) {
        monster.item = monsterItem[Math.floor(Math.random() * 3)];
        console.log(monster.item);
        keysDown = {};
        setHeroItem();
        console.log(hero.item);
        isHeroWinner();
        winnerHandler();
    }
    //hero frame progress
    curXFrame = ++curXFrame % frameCount; 
    

    //monster frame progress
    mcurXFrame = ++mcurXFrame % mframeCount
    
    //Updating the sprite frame index 
    // it will count 0,1,2,0,1,2,0, etc
    srcX = curXFrame * width;   	//Calculating the x coordinate for spritesheet 

    msrcX = mcurXFrame *mwidth;

    //if left is true,  pick Y dim of the correct row
    
    if (left) {
        //calculate srcY 
        srcY = trackLeft * height;
    }

    //if the right is true,   pick Y dim of the correct row
    if (right) {
        //calculating y coordinate for spritesheet
        srcY = trackRight * height;
    }

    if (left == false && right == false) {
     srcX = 1 * width;
     srcY = 2 * height;
    }
    //MONSTERS IF MOVEMENT

    if(mleft) {
        msrcY = monsterleft * height
    }

    if (mleft == false){ //OG&& right == false) {
        msrcX = 1 * width;
        msrcY = 2 * height;
    }


};


// Draw everything in the main render function
let render = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }


    if (heroReady) {
        ctx.drawImage(heroImage, srcX, srcY, width, height, hero.x, hero.y, width, height);
    }
    


    if (monsterReady) {
       // ctx.drawImage(monsterImage, monster.x, monster.y);
        ctx.drawImage(monsterImage,msrcX, msrcY, mwidth, mheight, monster.x, monster.y, mwidth, mheight)
    }

        // Score
        ctx.fillStyle = "rgb(250, 250, 250)";
        ctx.font = "24px Helvetica";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Kaiju Defeated: " + KaijuDefeated, 0, 0);
    

};

var pause = function () {
    monsterMove() == false;
    playBackgroundMusic() == false;
    alert("Game Paused");


}


var monsterMove = function(){
monster.x = monster.x-1/2;
monster.y = 400;
    if (monster.x == 1){
        alert("Kaiju has entered the city. ALL IS LOST!\nPress 'New Game' to try again"); 
        soundEfx.src = soundGameOver;
        soundEfx.play();

    }

}



var setHeroItem=function(){


    let userInput = prompt("A Kaiju is about to attack our city. Choose your weapon!\n'R' for Rock, 'P' for Paper or 'S' for scissors : ");
    switch(userInput) {
        case 'r':
            hero.item="rock";
            break;
        case 'p':
            hero.item="paper";
            break;
        case 's':
            hero.item="scissors";
            break;
        default:
            alert("Please input 'r', 's' or 'p'");
            setHeroItem();
            break;
    }
}




function isHeroWinner(){




    if (hero.item=="rock"&&monster.item=="rock"){
        alert("hero has "+hero.item+"while the Kaiju has "+monster.item+"\nDRAW!")
        hero.winner = false
    }
    if(hero.item=="rock"&&monster.item=="paper"){
        alert("hero has "+hero.item+"while the Kaiju has "+monster.item+"\nDEFEAT!")
        hero.winner = false
    }
    if(hero.item=="rock"&&monster.item=="scissors"){
        alert("hero has "+hero.item+"while the Kaiju has "+monster.item+"\nKAIJU DEFEATED")
        hero.winner = true
    }


    if (hero.item=="paper"&&monster.item=="paper"){
        alert("hero has "+hero.item+"while the Kaiju has "+monster.item+"\nDRAW!")
        return hero.winner = false
    }
    if(hero.item=="paper"&&monster.item=="scissors"){
        alert("hero has "+hero.item+"while the Kaiju has "+monster.item+"\nDEFEAT!")
        hero.winner = false
    }
    if(hero.item=="paper"&&monster.item=="rock"){
        alert("hero has "+hero.item+"while the Kaiju has "+monster.item+"\nKAIJU DEFEATED")
        hero.winner = true
    }


    if (hero.item=="scissors"&&monster.item=="scissors"){
        alert("hero has "+hero.item+"while the Kaiju has "+monster.item+"\nDRAW!")
        hero.winner = false
    }
    if(hero.item=="scissors"&&monster.item=="rock"){
        alert("hero has "+hero.item+"while the Kaiju has "+monster.item+"\nDEFEAT!")
        hero.winner = false
    }
    if(hero.item=="scissors"&&monster.item=="paper"){
        alert("hero has "+hero.item+"while the Kaiju has "+monster.item+"\nKAIJU DEFEATED")
        hero.winner = true
    }

}

var winGame = function(){

    KaijuDefeated = 0;
    alert("You've won the game!\nPush 'New Game' to start a new game");


}

var winnerHandler = function () {

    storypresent == false
    console.log(storypresent)

    if(hero.winner == true){

        if (KaijuDefeated == 1){
            monster.x = 10000;
            monster.y = 8000;
            winGame();       

        }
        else{
        ++KaijuDefeated;
        soundEfx.src = soundMonsterLoses;
        soundEfx.play();
        setTimeout(function(){playBackgroundMusic();
        }, 2000);

        

        hero.x =  1  //canvas.width / 2;
        hero.y =  1        //canvas.height / 2;
    
    //Place the monster somewhere on the screen randomly
    // but not in the hedges, Article in wrong, the 64 needs to be 
    // hedge 32 + hedge 32 + char 32 = 96
        monster.x =  1100//+ (Math.random() * (canvas.width - 122));
        //monster.y = 500// + (Math.random() * (canvas.height - 122));

        }}
    else{
        //alert("lost called")

     //   hero.x =  1  //canvas.width / 2;
       // hero.y =  1        //canvas.height / 2;
        soundEfx.src = soundHeroLoses;
        soundEfx.play();
        setTimeout(function(){playBackgroundMusic()
          }, 2000);
        hero.x =  1  //canvas.width / 2;
        hero.y =  1        //canvas.height / 2;


    }
    };

var beginGame = function(){
    if (storypresent == true){
    var story =
    document.getElementById("story");
    story.remove();
    storypresent = false;


    KaijuDefeated = 0;
    main()
    reset();    
    playBackgroundMusic();}



else {
    KaijuDefeated = 0;
    reset();
    playBackgroundMusic();}
}

// Reset the game when the player catches a monster
var reset = function () {
    hero.x =  canvas.width / 2;
    hero.y =  canvas.height / 2;

//Place the monster somewhere on the screen randomly
// but not in the hedges, Article in wrong, the 64 needs to be 
// hedge 32 + hedge 32 + char 32 = 96
    monster.x =  1100;
    
};

var playBackgroundMusic = function (){



soundEfx.src = soundBackgroundMusic;
soundEfx.play();

}

// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    render();
    then = now;
    //  Request to do this again ASAP
    requestAnimationFrame(main);
};



//=========================
// loop at end after all is defined
// executing code
// Let's play this game!
var then = Date.now();
//reset();
//main(); 