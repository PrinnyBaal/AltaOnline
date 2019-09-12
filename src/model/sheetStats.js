



//Many Faced Ability not included
//Heel ability not included

let starterDeck=["LumiMaarit", "MiranScout", "AltambranDuelist", "PhilomanScholar", "RuneKnight", "SummerSavior", "TreeSinger", "WinterWarrior"];

let validEnemyCommanders=["DoujahRaze", "LuminaOfPhiloma", "CyrusMartingo", "HandsomeJack", "RaiDuMorne"];






//the different zones where cards can exist, they all contain an array of objects inside of them as well as other stats
let zones={
  p1Hand:{heldCards:[]},
  p2Hand:{heldCards:[]},
  p1Deck:{deck:[]},
  p2Deck:{deck:[]},
  gameBoard:{},
  p1Discard:{discardedUnits:[]},
  p2Discard:{discardedUnits:[]},
  p1Captured:{capturedUnits:[]},
  p2Captured:{capturedUnits:[]},
  aiMentalMap:{
    playerUnits:[],
    enemyUnits:[]
  },
  p1Status:{frenzyCounter:false, frenzyExhaust:false, resolvingEffect:false},
  p2Status:{frenzyCounter:false, frenzyExhaust:false},

};

let eventHandler={

  announce:function(event){
    let board=zones.gameBoard.board;
    let portrait, text;

    switch(event){
      case "login":
        portrait=avatarLibrary["HiggsHappy"];
        text="To start a game first flip a coin, then click on your deck to draw your opening hand.";
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsHappy"];
        text="The goal of the game is to get one of your cards to the row closest to your enemy or to make it so your enemy has no legal moves on their turn.";
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsHappy"];
        text="Oh, and remember to customise your deck using the deck builder!  It's the button that looks like a blueprint.";
        gameUI.toBattleLog(portrait, text);
        // portrait=avatarLibrary["HiggsSnide"];
        // text="Yeah, yeah I know your deck 'has no pathetic cards...'";
        // gameUI.toBattleLog(portrait, text);
        break;
      case "Decksetup":

      case "Coinflip":

      case "DrawHands"://placement also happens in this phase
      case "PlayerTurnStart":
      //Rallying
      portrait=avatarLibrary["HiggsHappy"];
      text="Your opponent passed the turn to you, select a unit by clicking it.";
      gameUI.toBattleLog(portrait, text);
      // portrait=avatarLibrary["HiggsHappy"];
      // text="Click one of your cards to select that unit, it'll show you where it can move or capture.";
      // gameUI.toBattleLog(portrait, text);
      // portrait=avatarLibrary["HiggsHappy"];
      // text="If a star shows up on the bottom of the card when you click it, that means that clicking on it again will activate its 'Tap' ability.";
      // gameUI.toBattleLog(portrait, text);
      let activeAllies=data.getActiveUnits().allies;

      for (let i=0, len=activeAllies.length; i<len; i++){
        if(activeAllies[i].hasPassive){

          activeAllies.forEach((ally)=>{
            if (ally.tags.includes("Tapped")){

              ally.tags.splice(ally.tags.indexOf("Tapped"),1);

            }
          });
          break;

        }
      }
      ///Parrying....
        for (let y=0; y<board.length; y++){
          for (let x=0; x<board[y].length; x++){

            if(board[y][x] && board[y][x].friendly && board[y][x].tags.includes("Parry") && !board[y][x].tags.includes("Defended")){

              board[y][x].tags.push("Defended");

            }else if(board[y][x] && board[y][x].friendly && !board[y][x].tags.includes("Parry") && board[y][x].tags.includes("Defended")){
              board[y][x].tags.splice(board[y][x].tags.indexOf("Defended"), 1);
            }
          }
        }

        ///frenzying....

          if(zones.p1Status.frenzyCounter===false){


          }else{
            zones.p1Status.frenzyCounter--;
            portrait=avatarLibrary["HiggsMad"];
            text=`Tick tock...remember, your freny counter's still ticking.  It's at ${zones.p1Status.frenzyCounter} now`;
            gameUI.toBattleLog(portrait, text);

            if(zones.p1Status.frenzyCounter<=0){
              portrait=avatarLibrary["HiggsHappy"];
              text="Tick tock...sorry but the Frenzy counters finished ticking down so unfortunately that means you've lost";
              gameUI.toBattleLog(portrait, text);
              eventHandler.announce("EnemyWin");
            }
          }


        break;

      case "PlayerTurnEnd":
      case "EnemyTurnStart":
      ///Parrying....
        for (let y=0; y<board.length; y++){
          for (let x=0; x<board[y].length; x++){

            if(board[y][x] && !board[y][x].friendly && board[y][x].tags.includes("Parry") && !board[y][x].tags.includes("Defended")){

              board[y][x].tags.push("Defended");

            }else if(board[y][x] && !board[y][x].friendly && !board[y][x].tags.includes("Parry") && board[y][x].tags.includes("Defended")){
              board[y][x].tags.splice(board[y][x].tags.indexOf("Defended"), 1);
            }
          }
        }

        ///frenzying....

          if(zones.p2Status.frenzyCounter===false){

            // alert("You are frenzying...win quickly!");
            // zones.p1Status.frenzyCounter=3;
          }else{
            zones.p2Status.frenzyCounter--;
            console.log("frenzy..tick..tock..." + zones.p2Status.frenzyCounter);
            if(zones.p2Status.frenzyCounter<=0){
              alert("You have survived you opponents onslaught, overcome by their Frenzy they have fallen.");
              gamePhase="PlayerVictory!";
            }
          }


        break;
      case "EnemyTurnEnd":
      case "PlayerWin":
       data.gamePhase="PlayerVictory!";
        portrait=avatarLibrary["HiggsHappy"];
        text="You won, nice work!";
        gameUI.toBattleLog(portrait, text);
        break;
      case "EnemyWin":
        data.gamePhase="EnemyVictory!";
        portrait=avatarLibrary["HiggsHappy"];
        text="Even pros lose, but only scrubs don't learn from it!";
        gameUI.toBattleLog(portrait, text);
        break;
      //later things like unitCapture and unitMove may be added as events

      default:
        break;
    }
  }
};





//contains information about things like board size


let gameCalculations={
  isInCheck:function(gameCell){
    let board=zones.gameBoard.board;

    if (gameCell.y==3){
      return false;
    }

    if (board[gameCell.y+1][gameCell.x-1] && board[gameCell.y+1][gameCell.x-1].friendly){
          return true;
    }else if(board[gameCell.y+1][gameCell.x+1] && board[gameCell.y+1][gameCell.x+1].friendly){
      return true;
    }
    else{
      return false;
    }




  },
  isDefended:function(gameCell){
    let board=zones.gameBoard.board;
    if (gameCell.y==0){
      return false
    }
    else if(board[gameCell.y-1][gameCell.x-1] &&  !board[gameCell.y-1][gameCell.x-1].friendly){
      return true;
    }else if(board[gameCell.y-1][gameCell.x+1] &&  !board[gameCell.y-1][gameCell.x+1].friendly){
      return true;
    }else{
      return false;
    }
  },
  canPlayerAct:function(){
    //returns true or false if player has no moves
    let units=data.getActiveUnits().allies;
    let board=zones.gameBoard.board;
    let pos, posChange, ability;


    for (let i=0, len=units.length; i<len; i++){
      pos=units[i].position;

      //checks for movement
      for (let m=0, moves=units[i].moveRanges.length; m<moves; m++){
        posChange=units[i].moveRanges[m];
        if (board[pos.y+posChange.y] && board[pos.y+posChange.y][pos.x+posChange.x]===false){
          return true;
        }
      }

      //checks for capture
      for (let c=0, caps=units[i].captureRanges.length; c<caps; c++){
        posChange=units[i].captureRanges[c];
        if (board[pos.y+posChange.y] && board[pos.y+posChange.y][pos.x+posChange.x] && !board[pos.y+posChange.y][pos.x+posChange.x].friendly
        && !board[pos.y+posChange.y][pos.x+posChange.x].tags.includes("Defended") && !board[pos.y+posChange.y][pos.x+posChange.x].tags.includes("Unstoppable")){
          return true;
        }
      }

      //checks for abilities
      if (units[i].hasTap){
        ability= units[i].abilitySlot1.type=="Tap" ? units[i].abilitySlot1:units[i].abilitySlot2;
        ability=tapLibrary[ability.name];
        if(ability.isValid.call(units[i])){
          return true
        }
      }
    }

    //gives up
    return false;


  }
}

zones.gameBoard.board=starterGameBoard();

//handles filling a cache of images before the game starts
let assetCache={
  fillCache:function(){
    // let layers= data.getLayers();

    let cards=Object.values(cardLibrary);
    let cardNames=Object.keys(cardLibrary);
    let promisedCards=[];
    let promisedAssets=[];
    let promisesCompleted=0;
    let promiseTotal=2;
    // let tintPromises=[];
    cards.forEach((card, index)=>{

        //HEARTH


        promisedCards.push(
          new Promise(function (resolve, reject){
            const img = new Image();
            img.onload = () => resolve({img:img , name:cardNames[index]});
            img.onerror = () => resolve(`Sorry!  We weren't able to load the url "${card.cardArt}" from image number: "${index}"`);
            img.src =card.cardArt;

          })
        );


    });

    promisedAssets.push(
      new Promise(function (resolve, reject){
        const img = new Image();
        img.onload = () => resolve({img:img , name:"cardBackBlack"});
        img.onerror = () => resolve(`Sorry!  We weren't able to load the card back art`);
        img.src ="images/cardBacks/cardBackBlack.png";

      })
    );

    promisedAssets.push(
      new Promise(function (resolve, reject){
        const img = new Image();
        img.onload = () => resolve({img:img , name:"passiveSymbol"});
        img.onerror = () => resolve(`Sorry!  We weren't able to load the card back art`);
        img.src ="images/abilitySymbols/passiveSymbol.png";

      })
    );

    promisedAssets.push(
      new Promise(function (resolve, reject){
        const img = new Image();
        img.onload = () => resolve({img:img , name:"tapSymbol"});
        img.onerror = () => resolve(`Sorry!  We weren't able to load the card back art`);
        img.src ="images/abilitySymbols/tapSymbol.png";

      })
    );



    Promise.all([...promisedCards]).then(
      function(obj){

        for (let i=0, len=obj.length; i<len; i++){

          if (!obj[i].img){

            continue;
          }else{
            if(!assetCache.cache["Cards"]){
              assetCache.cache["Cards"]={};
            }

            assetCache.cache["Cards"][obj[i].name]=obj[i].img;
          }
        }





    }).catch(function(err) {
      console.log(err); // some coding error in handling happened
    })
    .then(
      function(){
        promisesCompleted++;
        if (promisesCompleted>=promiseTotal){
          gamesBegin();
        }

      });

      Promise.all([...promisedAssets]).then(
        function(obj){

          for (let i=0, len=obj.length; i<len; i++){

            if (!obj[i].img){
              console.log(obj[i]);
              console.log("^^^ no img?");
              continue;
            }else{
              if(!assetCache.cache["CardBacks"]){
                assetCache.cache["CardBacks"]={};
              }

              assetCache.cache["CardBacks"][obj[i].name]=obj[i].img;
            }
          }





      }).catch(function(err) {
        console.log(err); // some coding error in handling happened
      })
      .then(
        function(){
          promisesCompleted++;
          if (promisesCompleted>=promiseTotal){
            gamesBegin();
          }

        });









  },
  cache:{
    urls:{
      placeOnBottom:"https://res.cloudinary.com/metaverse/image/upload/v1567814444/UI/placeOnBottom.png",
      leaveOnTop:"https://res.cloudinary.com/metaverse/image/upload/v1567814440/UI/leaveOnTop.png",
    },
    background:{
      higgsShop:"images/backgrounds/higgsShop.png",
    },
  }
  };
let Construct={
  Card:function(name, friendly, ability){
    let tags=[];
    this.moveRanges=[{y:-1, x:0}];
    this.captureRanges=[{y:-1, x:1}, {y:-1, x:-1}];
    this.name=name;
    this.friendly=friendly;

    this.hasPassive=false;
    this.hasTap=false;
    this.flipY=function(){
      this.moveRanges.forEach((range)=>{
        range.y*=-1;
      });
      this.captureRanges.forEach((range)=>{
        range.y*=-1;
      });
    };

    if (!ability){
      ability=[];
    }

    if (ability[0]){

      this.abilitySlot1={type:ability[0].type, name:ability[0].name};
      if(ability[0].type=="Passive"){
        this.hasPassive=true;


      }else{
        this.hasTap=true;

      }
      tags.push(ability[0].name);
    }else{
      this.abilitySlot1=false;
    }

    if (ability[1]){
      this.abilitySlot2={type:ability[1].type, name:ability[1].name};
      if(ability[1].type=="Passive"){
        this.hasPassive=true;

      }else{
        this.hasTap=true;

      }
      tags.push(ability[1].name);
    }else{
      this.abilitySlot2=false;
    }

    this.tags=tags;
  },
  Action:function(actionType, actionInfo){
    this.actionType=actionType;
    this.actionInfo=actionInfo;//an object that supplies all the unique information an actiontype may need
    this.actValue=1; //currently not checked, but later will help the ai determine which action to take
  },
  Enemy:{
    //will be used to hold methods common between all our enemies
    // Object.assign(data.enemyStats[0], Construct.Enemy);
    isMoveLegal:function(unit, movement){
      let board=zones.gameBoard.board;
      let pos=unit.position;

      try{
        if (board[pos.y+movement.y][pos.x+movement.x]===false){
          return true;
        }
        else{
          return false;
        }
      }catch(error){
        //assumes that board position is out of bounds
        console.log(error);
        return false;
      }


    },
    isCaptureLegal:function(unit, movement){
      let pos=unit.position;
      let board=zones.gameBoard.board;
      try{
        if (board[pos.y+movement.y][pos.x+movement.x].friendly
          && !board[pos.y+movement.y][pos.x+movement.x].tags.includes("Defended")
          && !board[pos.y+movement.y][pos.x+movement.x].tags.includes("Unstoppable")){

          return true;
        }
        else{
          //nothing to cap
          // if(board[pos.y+movement.y][pos.x+movement.x].tags.includes("Defended")){
          //   console.log("Defended unit...");
          // }
          return false;
        }
      }catch(error){
        return false;
      }

    },
    checkVictory:function(){
      let board=zones.gameBoard.board;
      let units=data.getActiveUnits();
      let friendlyEndgame=false;
      let enemyEndgame=false;
      let portrait, text;

      for (let i=0, len=units.allies.length; i<len; i++){
        if (units.allies[i].tags.includes("Endgame")){
          friendlyEndgame=true;
          break;
        }
      }
      for (let i=0, len=units.enemies.length; i<len; i++){
        if (units.enemies[i].tags.includes("Endgame")){
          enemyEndgame=true;
          break;
        }
      }

      for (let i=0, len=board[0].length; i<len;i++){
        if (board[3][i] && !board[3][i].friendly && !board[3][i].tags.includes("Unstoppable")){
          enemyWins();

        }
      }



      function enemyWins(){
        if ((enemyEndgame && friendlyEndgame) || (!enemyEndgame && !friendlyEndgame)){
          // data.gamePhase="EnemyVictory!";
          // alert ("enemy wins!");
          eventHandler.announce("EnemyWin");
        }else{
          portrait=avatarLibrary["HiggsHappy"];
          text="Heh, so normally you'd lose here buut because of the Red Jester the winner gets flipped and you actually win!";
          gameUI.toBattleLog(portrait, text);
          eventHandler.announce("PlayerWin");


        }

      }
    },
    takeAction:function(action){
      if (!action){

        function noAction(){
          let board=zones.gameBoard.board;
          let units=data.getActiveUnits();
          let friendlyEndgame=false;
          let enemyEndgame=false;
          let portrait, text;

          for (let i=0, len=units.allies.length; i<len; i++){
            if (units.allies[i].tags.includes("Endgame")){
              friendlyEndgame=true;
              break;
            }
          }
          for (let i=0, len=units.enemies.length; i<len; i++){
            if (units.enemies[i].tags.includes("Endgame")){
              enemyEndgame=true;
              break;
            }
          }

          enemyLoses();





          function enemyLoses(){
            if ((enemyEndgame && friendlyEndgame) || (!enemyEndgame && !friendlyEndgame)){
              portrait=avatarLibrary["HiggsHappy"];
              text="Your opponent has no legal moves!  That means you win!  Thank them for the good game and get ready for the next one!";
              gameUI.toBattleLog(portrait, text);
              eventHandler.announce("PlayerWin");
            }else{

              portrait=avatarLibrary["HiggsExasperated"];
              text="Your opponent is cornered with no legal moves but...The Red Jester has twisted the situation!  Soo...that's actually a win for your enemy~";
              gameUI.toBattleLog(portrait, text);
              eventHandler.announce("EnemyWin");
            }
          return
        }
        }
        noAction();
      }
      else{

        let board, startSpace, endSpace, cappedSpace;
        let actionTakenBy=false;

        switch(action.actionType){
          case "movement":
            board=zones.gameBoard.board;
            startSpace=action.actionInfo.startSpace;
            endSpace=action.actionInfo.endSpace;
            board[endSpace.y][endSpace.x]=board[startSpace.y].splice(startSpace.x, 1, false)[0];
            board[endSpace.y][endSpace.x].position=endSpace;
            actionCompletedBy=board[endSpace.y][endSpace.x];
            break;


          case "capture":
            board=zones.gameBoard.board;
            startSpace=action.actionInfo.startSpace;
            endSpace=action.actionInfo.endSpace;
            cappedSpace=action.actionInfo.cappedSpace; //in most cases this will be a useless step but will allow us to have abilities which allow capture without moving our unit
            // board[cappedSpace.y][cappedSpace.x]=false;
            zones.p2Captured.capturedUnits.push(board[cappedSpace.y].splice(cappedSpace.x,1,false)[0]);
            //errorWatch
            board[endSpace.y][endSpace.x]=board[startSpace.y].splice(startSpace.x, 1, false)[0]; //in the event that the card is staying put this is...weird...but should be fine?
            board[endSpace.y][endSpace.x].position=endSpace;
            actionCompletedBy=board[endSpace.y][endSpace.x];

            if(actionCompletedBy.tags.includes("Illusion")){
              actionCompletedBy.tags.splice(actionCompletedBy.tags.indexOf("Illusion"),1);
            }


            if(actionCompletedBy.tags.includes("Frenzy")){
              if(zones.p2Status.frenzyExhaust){
                zones.p2Status.frenzyExhaust=false;

              }
              else{
                  zones.p2Status.frenzyExhaust=true;

                  actionCompletedBy=false;
                  gameDisplay.setCardImages();
                  this.checkVictory();
                  if(zones.p2Status.frenzyCounter===false){
                    alert("The enemy is frenzying, they'll crumble soon but until then watch out!");
                    zones.p2Status.frenzyCounter=3;
                  }
                  this.takeAction(this.chooseAction());

              }
            }else if(zones.p2Status.frenzyExhaust){
              zones.p2Status.frenzyExhaust=false;}


            break;

          default:
            console.log(`${action.actionType} is not a recognized action for takeAction`);
            break;

        }
        if (actionCompletedBy){

          if(actionCompletedBy.tags.includes("Parry") && actionCompletedBy.tags.includes("Defended")){
            actionCompletedBy.tags.splice(actionCompletedBy.tags.indexOf("Defended"),1);

          }

          console.log("passing turn to player");
          gameDisplay.setCardImages();
          data.gamePhase="unitSelect";
          eventHandler.announce("PlayerTurnStart");
          this.checkVictory();

      }


    }

  },

}
};
let statusLibrary={
  Defended:"This unit is protected in some way and cannot be captured.  Defended decays at start of turn but some effects re-apply it",
  Tapped:"This unit has used its tap ability and cannot do so again until it becomes untapped.",
  Commander:"This unit is designated as your Commander.  You begin your turn with it in your hand and while it's on the battlefield you may 'rally', meaning you untap all your tapped units.",
}

let passiveLibrary={
  PiercerOfVeils:{ //
    name:"PiercerOfVeils",
    effect:function(){
      //has no effect, instead when its relevant the game will simply check if it exists
    }
  },
  Parry:{ //
    name:"Parry",
    effect:function(turnStart){
      let defendedIndex=this.status.indexOf("Defended");
      if (turnStart && defendedIndex>=0){

        this.status.splice(defendedIndex, 1);
      }
      else{
        if (defendedIndex<0){
          this.status.push("Defended");
        }
      }

    }
  },
  Illusionist:{ //
    name:"Illusionist",
    effect:function(){
      //has no effect, instead when its relevant the game will simply check if it exists
    }
  },
  Heel:{ //Skipping
    name:"Heel",
    effect:function(){
      //Implementing seems...hard...potentially doable with addded animation and a minigame
      //like those old flashgames where you had to sneakily do something while a character wasn't watching but not worth in first build
    }
  },
  Endgame:{ //  In the future we should move win/loss checks to the event board in order to make sure this plays nice with alt win/loss conditions
    name:"Endgame",
    effect:false,
  },
  Frenzy:{//
    name:"Frenzy",
    effect:function(){
      // if (this.friendly){
      //   if(zones.p1Status.frenzyCounter===undefined){
      //     alert("You are frenzying...win quickly!");
      //     zones.p1Status.frenzyCounter=3;
      //   }else{
      //     zones.p1Status.frenzyCounter--;
      //   }
      //   if(zones.p1Status.frenzyCounter<=0){
      //     alert("Overcome by your frenzy you have perished.");
      //     gamePhase="EnemyVictory!";
      //   }
      // }
      // else{
      //   if(zones.p2Status.frenzyCounter===undefined){
      //     alert("The enemy is frenzying...they'll spell their own doom soon but will now fight desperately!");
      //     zones.p2Status.frenzyCounter=3;
      //   }else{
      //     zones.p2Status.frenzyCounter--;
      //   }
      //   if(zones.p2Status.frenzyCounter<=0){
      //     alert("Overcome by their frenzy your foe can fight no longer.  You win!");
      //     gamePhase="PlayerVictory!";
      //   }
      // }
    }
  },
  Strive:{//will be implemented with the addition of tap abilities
    name:"Strive",
    effect:function(){

    }
  },
  Unstoppable:{//surprisingly easy to make work...I hope I didn't screw up.
    name:"Unstoppable",
    effect:function(){

    }
  },
  FromShadow:{
    name:"FromShadow",
    effect:false,
  },
  ManyFaced:{
    name:"ManyFaced"
  }
}

let tapLibrary={
  WhenNeeded:{//seems to work as intended
    name:"WhenNeeded",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action

      let tags=this.tags;
      let board=zones.gameBoard.board;
      let allUnits=data.getActiveUnits();
      let allyUnits= this.friendly ? allUnits.allies:allUnits.enemies;
      let enemyUnits= !this.friendly ? allUnits.allies:allUnits.enemies;

      let checkedAllies=[];
      let availableSpace=false;



      if (tags.includes("Tapped")){return false;}

      allyUnits=allyUnits.filter((ally)=>{
        if (ally.position.x==this.position.x && ally.position.y==this.position.y){
          return false
        }else{
          return true
        }
      });

      allyUnits.forEach((ally)=>{
        let capRange;
        let allyChecked=false;
        for (let i=0, len=enemyUnits.length; i<len && !allyChecked; i++){
          for (let j=0, caps=enemyUnits[i].captureRanges.length; j<caps && !allyChecked;j++){
            capRange=enemyUnits[i].captureRanges[j];
            if (enemyUnits[i].position.x+capRange.x==ally.position.x && enemyUnits[i].position.y+capRange.y==ally.position.y){
              allyChecked=true;
            }
          }
        }
        if (allyChecked){
          checkedAllies.push(ally);
        }

      });

      for (let i=0, len=checkedAllies.length; i<len && !availableSpace; i++){
        if(checkSurroundingCells(checkedAllies[i].position)){
          availableSpace=true;
          break;
        }
      }

      if (!availableSpace){return false;}
      else{return true;}


      function checkSurroundingCells(position){
        if (position.y!=0){
          if (position.x!=0 && !board[position.y-1][position.x-1]){

              return true;

          }

          if (!board[position.y-1][position.x]){
            return true;
          }

          if (position.x!=board[0].length-1 && !board[position.y-1][position.x+1]){return true;}
        }

        if (position.x!=0 && !board[position.x-1][position.y]){return true;}
        if (!board[position.x][position.y]){return true;}
        if (position.x!=board[0].length-1 && !board[position.x+1][position.y]){return true;}

        if (position.y!=board.length-1){
          if (position.x!=0 && !board[position.y+1][position.x-1]){return true;}
          if (!board[position.y+1][position.x]){return true;}
          if (position.x!=board[0].length-1 && !board[position.y+1][position.x+1]){return true;}
        }
        return true;
      }
    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen, uses call to make 'this' refer to the card that calls it
      let portrait, text;
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"WhenNeeded", triggeringCard:this};
        portrait=avatarLibrary["HiggsHappy"];
        text=`You've just activated 'When Needed'.  It lets your unit fly to the defense of one of your other cards.`;
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsHappy"];
        text=`Click any square that's adjacent to another checked card.  A card is 'checked' if it's in the capture range of an enemy card.`;
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsDrained"];
        text=`Some people like to say 'threatened' instead of 'checked' but personally I think threatened is too general a word.  Really, all your cards are under threat the moment you lay them down.  Especially THAT one.  I'm coming for that one's family.`;
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsHappy"];
        text=`See?  Threatened but not checked!`;
        gameUI.toBattleLog(portrait, text);
      }
    },
    targetEffect:function(targetPos){
      //returns false if unable to complete effect with that position, otherwise applies ppropriate effect then returns true
      let board=zones.gameBoard.board;
      let allUnits=data.getActiveUnits();
      let allyUnits= this.friendly ? allUnits.allies:allUnits.enemies;
      let enemyUnits= !this.friendly ? allUnits.allies:allUnits.enemies;
      let checkedAllies=[];

      if (board[targetPos.y][targetPos.x]){
        return false;
      }

      allyUnits=allyUnits.filter((ally)=>{
        if (ally.position.x==this.position.x && ally.position.y==this.position.y){
          return false
        }else{
          return true
        }
      });

      allyUnits.forEach((ally)=>{
        let capRange;
        let allyChecked=false;
        for (let i=0, len=enemyUnits.length; i<len && !allyChecked; i++){
          for (let j=0, caps=enemyUnits[i].captureRanges.length; j<caps && !allyChecked;j++){
            capRange=enemyUnits[i].captureRanges[j];
            if (enemyUnits[i].position.x+capRange.x==ally.position.x && enemyUnits[i].position.y+capRange.y==ally.position.y){
              allyChecked=true;
            }
          }
        }
        if (allyChecked){
          checkedAllies.push(ally);
        }

      });

      for (let i=0, len=checkedAllies.length; i<len; i++){
        if(Math.abs(checkedAllies[i].position.y-targetPos.y)<=1 && Math.abs(checkedAllies[i].position.x-targetPos.x)<=1){
          //space is valid
          board[targetPos.y][targetPos.x]=board[this.position.y].splice(this.position.x, 1)[0];
          board[targetPos.y][targetPos.x].position=targetPos;
          return true;
        }
      }

      return false;

    }
  },//playerDone
  PrincesBinding:{//woo discover mechanic is in and works pretty well!
    name:"PrincesBinding",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      let cappedUnits= this.friendly? zones.p1Captured.capturedUnits:zones.p2Captured.capturedUnits;
      let tapAbility;
      for (let i=0, len=cappedUnits.length; i<len; i++){
        if (cappedUnits[i].hasTap){
          if (cappedUnits[i].abilitySlot1.type=="Tap"){tapAbility=tapLibrary[cappedUnits[i].abilitySlot1.name];}
          else if(cappedUnits[i].abilitySlot2.type=="Tap"){tapAbility=tapLibrary[cappedUnits[i].abilitySlot2.name];}

          if(tapAbility.isValid.call(this)){return true}
        }
      }


      return false;

    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen

      let cappedUnits= this.friendly? zones.p1Captured.capturedUnits:zones.p2Captured.capturedUnits;
      let cardArray=[];
      cappedUnits.forEach((prisoner)=>{
        if (prisoner.hasTap){
          let tapAbility;
          let cardObj={};

          if (prisoner.abilitySlot1.type=="Tap"){tapAbility=tapLibrary[prisoner.abilitySlot1.name];}
          else if(prisoner.abilitySlot2.type=="Tap"){tapAbility=tapLibrary[prisoner.abilitySlot2.name];}
          if(tapAbility.isValid.call(this)){
            cardObj.cardURL=cardLibrary[prisoner.name].cardArt;
            cardObj.cardClick=()=>{

              tapAbility.effect.call(this);
              if (data.gamePhase=="discovering"){

                gameDisplay.setCardImages();
                gamePlay.checkVictory();
                eventHandler.announce("EnemyTurnStart");
                data.gamePhase="enemyTurn";
              }
              gameDisplay.setCardImages();
            };
            cardObj.arguments=[this];
            cardArray.push(cardObj);

          }else{
            // console.log(tapAbility);
            // console.log(tapAbility.isValid.call(this));
          }
        }
      });


      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){
        data.gamePhase="discovering";




        gamePlay.launchDiscover(cardArray);
      }
    },
    targetEffect:function(){

    },
    hasDiscover:true,
  },
  WildMage:{ //in theory it's currently active for players but requires some UI polishing
    name:"WildMage",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      let tags=this.tags;
      let deck= this.friendly? zones.p1Deck.deck: zones.p2Deck.deck;
      if (tags.includes("Tapped") ||!deck.length){return false;}
      else{return true;}


    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen

      let deck= this.friendly ? zones.p1Deck.deck:zones.p2Deck.deck;
      let discard= this.friendly ? zones.p1Discard.discardedUnits:zones.p2Discard.discardedUnits;
      let burntCards=[];
      for (let i=0; i<4 && deck.length; i++){
        burntCards.push(deck[0]);
        discard.push(deck.splice(0,1)[0]);
      }
      console.log(burntCards);
      burntCards=burntCards.filter((card)=>{
        return card.hasTap;

      });
      console.log("cards with a tap");
      console.log(burntCards);
      burntCards=burntCards.filter((card)=>{
        let ability= card.abilitySlot1.type=="Tap"? tapLibrary[card.abilitySlot1.name]:tapLibrary[card.abilitySlot2.name];

        return ability.isValid.call(this);

      });
      console.log("cards Lumi can cast");
      console.log(burntCards);
      portrait=avatarLibrary["HiggsShocked"];
      text=`Oh no, oh no no no no, I still had a Lumi card in that pile?!  I really hope this doesn't break anything...lets discard the top four cards of your deck and...`;
      gameUI.toBattleLog(portrait, text);


      if (this.friendly && burntCards.length){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"WildMage", triggeringCard:this, cardsToBurn:burntCards};}
      if (burntCards.length){
        portrait=avatarLibrary["HiggsHappy"];
        text=`Okay, so here's how this'll work, I'll tell you all the cards with tap abilities you burned with Lumi's ability that you can legally use.`;
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsHappy"];
        text=`If that card requires targetting well...you know click the appropriate target.  Otherwise just keep clicking the board to advance.`;
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsHappy"];
        text=`If you want to check what cards you discarded click the deck on your side with the skull on it.`;
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsHappy"];
        text=`Now, *ahem* first card...${burntCard[0].name}`;
        gameUI.toBattleLog(portrait, text);
      }else{
        portrait=avatarLibrary["HiggsHappy"];
        text=`Phew, Lumi didn't discard any cards that have special abilities, at least not any she could legally use right now.`;
        gameUI.toBattleLog(portrait, text);
      }
    },
    targetEffect:function(targetPos){
      let kindling;
      let effect;
      let kindleEffect;
      let portrait, text;
      if (this.friendly){
        kindling=zones.p1Status.resolvingEffect.cardsToBurn;
      }
      kindleEffect=kindling[0].abilitySlot1.type=="Tap"? kindling[0].abilitySlot1:kindling[0].abilitySlot2;
      effect=tapLibrary[kindleEffect.name];
      if (!effect.isValid.call(this)){
        kindling.shift();
        if(kindling.length){
          portrait=avatarLibrary["HiggsHappy"];
          text=`Next card....${burntCard[0].name}`;
          gameUI.toBattleLog(portrait, text);
          return false;
        }
        if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
        return true;
      }
      if (effect.hasDiscover){
        //there is a slight issue here in that Lumi
        effect.effect.call(this);
        kindling.shift();
        if(kindling.length){
          portrait=avatarLibrary["HiggsHappy"];
          text=`Next card....${burntCard[0].name}`;
          gameUI.toBattleLog(portrait, text);
          return false;
        }
        if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
        return true;
      }else if(effect.targetEffect.call(this, targetPos)){
        kindling.shift();
        if(kindling.length){
          portrait=avatarLibrary["HiggsHappy"];
          text=`Next card....${burntCard[0].name}`;
          gameUI.toBattleLog(portrait, text);
          return false;
        }
        if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
        return true;
      }else{
        portrait=avatarLibrary["HiggsHappy"];
        text=`Next card....${burntCard[0].name}`;
        gameUI.toBattleLog(portrait, text);
        return false;
      }


    }
  },
  Whisper:{ //screw it, skip this one.  requires activate->choose
    name:"Whisper",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      return false;
    },
    passTurn:false, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let portrait, text;
      portrait=avatarLibrary["HiggsHappy"];
      text=`Oh, did I have one of those in my proxies?  Yeah, here just pick another action, pretend Whisper didn't exist. Its got soem weird interactions you're not ready for.`;
      gameUI.toBattleLog(portrait, text);
      portrait=avatarLibrary["HiggsDrained"];
      text=`I only use poxies for it since its also just got a really weird effect when you activate it.   Its battlecries aren't illusory sounds, they're phantasms in yourhead instead.  Blegh.`;
      gameUI.toBattleLog(portrait, text);

    },
    targetEffect:function(){

    }
  },
  Champion:{ //should work for allies now, in theory
    name:"Champion",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action

      let board=zones.gameBoard.board;
      if (this.tags.includes("Tapped") || !checkSurroundingCells(this.position)){
        return false;
      }
      else{
        return true;
      }

      function checkSurroundingCells(position){
        if (position.y!=0){
          if (position.x!=0 && board[position.y-1][position.x-1] && board[position.y-1][position.x-1].friendly){


              return true;

          }

          if (board[position.y-1][position.x] && board[position.y-1][position.x].friendly){
            return true;
          }

          if (position.x!=board[0].length-1 && board[position.y-1][position.x+1] && board[position.y-1][position.x+1].friendly){return true;}
        }

        if (position.x!=0 && board[position.x-1][position.y] && board[position.x-1][position.y].friendly){return true;}
        if (board[position.x][position.y] && board[position.x][position.y].friendly){return true;}
        if (position.x!=board[0].length-1 && board[position.x+1][position.y] &&board[position.x+1][position.y].friendly){return true;}

        if (position.y!=board.length-1){
          if (position.x!=0 && board[position.y+1][position.x-1] && board[position.y+1][position.x-1].friendly){return true;}
          if (board[position.y+1][position.x] && board[position.y+1][position.x].friendly){return true;}
          if (position.x!=board[0].length-1 && board[position.y+1][position.x+1] && board[position.y+1][position.x+1].friendly){return true;}
        }
        return true;
      }

    },
    passTurn:false, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let portrait, text;
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"Champion", triggeringCard:this};}
      portrait=avatarLibrary["HiggsHappy"];
      text=`Protect your allies o valiant champion!  Click any friendly card adjacent to the one you just activated and until the start of your next turn it can't be captured.`;
      gameUI.toBattleLog(portrait, text);
      portrait=avatarLibrary["HiggsHappy"];
      text=`This doesn't eat up your turn so be ready to choose another action afterwards.`;
      gameUI.toBattleLog(portrait, text);
    },
    targetEffect:function(targetPos){
      let board=zones.gameBoard.board;
      let targetCell=board[targetPos.y][targetPos.x];

      if (targetCell && targetCell.friendly){
        if (targetCell.tags.includes("Defended")){targetCell.tags.push("Defended");}

        return true;
      }
      else{
        return false;
      }
    }
  },
  Chooser:{//available now with discover!
    name:"Chooser",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      let cappedUnits= this.friendly? zones.p1Captured.capturedUnits:zones.p2Captured.capturedUnits;
      let homeRow=this.friendly? 3:0;
      let board=zones.gameBoard.board;

      if (this.tags.includes("Tapped") || this.tags.includes("ChoiceMade") || !cappedUnits.length){
        return false;
      }


      for (let i=0; i<board[homeRow].length; i++){
        if (!board[homeRow][i]){
          return true;
        }
      }

      return false;
    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let cappedUnits= this.friendly? zones.p1Captured.capturedUnits:zones.p2Captured.capturedUnits;
      let homeRow=this.friendly? 3:0;
      let board=zones.gameBoard.board;
      let cardArray=[];
      let portrait, text;
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}

      cappedUnits.forEach((prisoner)=>{

          let tapAbility;
          let cardObj={};



        cardObj.cardURL=cardLibrary[prisoner.name].cardArt;
        cardObj.cardClick=()=>{
              if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"Chooser", triggeringCard:this, ridingCard:prisoner};}

            };
        cardObj.arguments=[this];
        cardArray.push(cardObj);





      });

      if (this.friendly){
        data.gamePhase="discovering";
        gamePlay.launchDiscover(cardArray);
      }
      portrait=avatarLibrary["HiggsHappy"];
      text=`Ooo, fun one.  Remember you can only use this ability ONCE in the entire match, are you sure you wanna do it now?`;
      gameUI.toBattleLog(portrait, text);
      portrait=avatarLibrary["HiggsSnide"];
      text=`If not, too bad no take backs in my shop!  So after you've picked which card you want to ressurect under your power...`;
      gameUI.toBattleLog(portrait, text);
      portrait=avatarLibrary["HiggsHappy"];
      text=`...just plop it down anywhere on your home row by clicking on the cell you wanna jam it into.`;
      gameUI.toBattleLog(portrait, text);

    },
    targetEffect:function(targetPos){
      let homeRow=this.friendly? 3:0;
      let board=zones.gameBoard.board;
      let prisoner= this.friendly ? zones.p1Status.resolvingEffect.ridingCard:zones.p2Status.resolvingEffect.ridingCard;
      let capZone=this.friendly? zones.p1Captured.capturedUnits:zones.p2Captured.capturedUnits;
      let capIndex;

      if (targetPos.y!=homeRow || board[targetPos.y][targetPos.x]){return false}
      else{
        for (let i=0, len=capZone.length; i<len; i++){
          if (capZone[i].name==prisoner.name){
            capIndex=i;
            break;
          }
        }
        board[targetPos.y][targetPos.x]=capZone.splice(capIndex, 1)[0];
        board[targetPos.y][targetPos.x].friendly=true;
        board[targetPos.y][targetPos.x].flipY();
        board[targetPos.y][targetPos.x].position=targetPos;
        return true
      }

    },
    hasDiscover:true,
  },
  TrialOfWings:{//untested but SHOULD work just fine for players now
    name:"TrialOfWings",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      if (this.tags.includes("Tapped") || this.tags.includes("Ascended") || !this.tags.includes("TrialComplete")){
        return false;
      }
      else {return true}
    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      this.tags.push("Ascended");
      this.moveRanges=[{x:0, y:-1}, {x:0,y:-2}];
      this.captureRanges=[{x:1, y:-1}, {x:2, y:-2}, {x:-1,y:-1}, {x:-1,y:-2}];
      if (!this.friendly){
        this.flipY();
      }
    }
  },
  DemandSatisfaction:{//in theory this should work now
    name:"DemandSatisfaction",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      let board=zones.gameBoard.board;
      let allUnits=data.getActiveUnits();
      let enemyUnits= !this.friendly ? allUnits.allies:allUnits.enemies;
      if (this.tags.includes("Tapped")){
        return false;
      }
      for (let i=0, len=enemyUnits.length; i<len; i++){
        if (Math.abs(enemyUnits[i].position.x-this.position.x)==1 && enemyUnits[i].position.y==this.position.y
        && !enemyUnits[i].tags.includes("Defended") && !enemyUnits[i].tags.includes("Unstoppable")){

          return true;
        }
      }
      return false;
    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let portrait, text;
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"DemandSatisfaction", triggeringCard:this};}
      portrait=avatarLibrary["HiggsExasperated"];
      text=`*hum*  It's the ten duel commandments~  *hum*  `;
      gameUI.toBattleLog(portrait, text);
      portrait=avatarLibrary["HiggsSnide"];
      text=`Oh!  uh, right, so your duelist can demand that an enemy unit fight him.  Click an enemy that's to your duelist's left or right.  Oh!  And remember that effects that would prevent normal captures apply to this as well.`;
      gameUI.toBattleLog(portrait, text);
    },
    targetEffect:function(targetPos){
      let board=zones.gameBoard.board;
      let targetCell=board[targetPos.y][targetPos.x];
      let capZone= this.friendly ? zones.p1Captured.capturedUnits:zones.p2Captured.capturedUnits;
      if (targetCell && targetPos.y==this.position.y && Math.abs(targetPos.x-this.position.x)==1
        && !targetCell.tags.includes("Defended") && !targetCell.tags.includes("Unstoppable")){
          capZone.push(board[targetPos.y].splice(targetPos.x,1,false)[0]);
          board[targetPos.y][targetPos.x]=board[this.position.y].splice(this.position.x, 1, false)[0];


          this.position={y:targetPos.y, x:targetPos.x};




        return true;
      }else{
        return false;
      }

    }
  },
  Ensnare:{//should work in theory for player now
    name:"Ensnare",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      let board=zones.gameBoard.board;
      let allUnits=data.getActiveUnits();
      let enemyUnits= !this.friendly ? allUnits.allies:allUnits.enemies;
      let forward;

      if (this.tags.includes("Tapped")){return false;}
      for (let i=0, len=enemyUnits.length; i<len; i++){
        forward=enemyUnits[i].position.y>this.position.y ? -1:1;
        if (enemyUnits[i].position.x==this.position.x && Math.abs(enemyUnits[i].position.y-this.position.y)>1 &&
            !board[enemyUnits[i].position.y+forward][enemyUnits[i].position.x]){

          return true;
        }
      }
      return false;
    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let portrait, text;
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"Ensnare", triggeringCard:this};
        portrait=avatarLibrary["HiggsHappy"];
        text=`Ensnare lets you drag an enemy card closer to the card that you just tapped.  Click any enemy card in the same column as that card (and at least two spaces away) and it'll move one square closer whether up or down on the board.`;
        gameUI.toBattleLog(portrait, text);
      }

    },
    targetEffect:function(targetPos){
      let board=zones.gameBoard.board;
      let targetCell=board[targetPos.y][targetPos.x];
      if (!targetCell){return false}
      let forward=targetCell.position.y>this.position.y ? -1:1;
      if (!targetCell.friendly
        && targetPos.x==this.position.x && Math.abs(targetPos.y-this.position.y)>1 && !board[targetPos.y+forward][targetPos.x]){

        targetCell.position.y+=forward;
        board[targetCell.position.y][targetCell.position.x]=board[targetPos.y].splice(targetPos.x,1, false)[0]
        return true;
      }

      return false;
    }
  },
  SeekTheMountain:{//in theory, all set for player
    name:"SeekTheMountain",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      let board=zones.gameBoard.board;
      let allUnits=data.getActiveUnits();
      allUnits=[...allUnits.allies, ...allUnits.enemies];
      let forward= this.friendly? -1:1;

      for (let i=0, len=allUnits.length; i<len; i++){
        if (allUnits[i].position.x==this.position.x && allUnits[i].position.y-forward==this.position.y){
          return true;
        }
      }

      return false;
    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let portrait, text;
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"SeekTheMountain", triggeringCard:this};
      portrait=avatarLibrary["HiggsHappy"];
      text=`Some people won't be distracted from their aspirations.  Click an open space diagonally left or diagonally right from the card you just tapped, letting you sidestep the unit rudely clogging up the space in front of it.`;
      gameUI.toBattleLog(portrait, text);
    }
    },
    targetEffect:function(targetPos){
      let board=zones.gameBoard.board;
      let targetCell=board[targetPos.y][targetPos.x];
      let forward= this.friendly? -1:1;

      if (!targetCell && Math.abs(targetPos.x-this.position.x)==1 && this.position.y+forward==targetPos.y){
        board[targetPos.y][targetPos.x]=board[this.position.y].splice(this.position.x, 1, false)[0];
        board[targetPos.y][targetPos.x].position=targetPos;
        return true;
      }

      return false;
    }
  },
  SeekTruth:{//onhold until discover mechanic
    name:"SeekTruth",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      let deck= this.friendly? zones.p1Deck.deck: zones.p2Deck.deck;
      if (this.tags.includes("Tapped")|| !deck.length){
        return false;
      }
      else{
        return true;
      }

    },
    passTurn:false, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let cardArray=[];  // cardArray:[{cardURL:"url", cardClick:"functionToCall", arguments:[Array, of, arguments, for, cardClick]}]
      let deck= this.friendly? zones.p1Deck.deck: zones.p2Deck.deck;
      let card=deck[0];
      let scryToBottom=function(){

        ci.array_move(deck, 0, deck.length-1);

        data.gamePhase="unitSelect";
      }
      let leaveOnTop=function(){

        data.gamePhase="unitSelect";
      }
      let portrait, text;
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}

      cardArray.push({cardURL:cardLibrary[card.name].cardArt, cardClick:false, arguments:[]});
      cardArray.push({cardURL:assetCache.cache.urls.leaveOnTop, cardClick:leaveOnTop, arguments:[]});
      cardArray.push({cardURL:assetCache.cache.urls.placeOnBottom, cardClick:scryToBottom, arguments:[]});


      if (this.friendly){
        data.gamePhase="discovering";
        gamePlay.launchDiscover(cardArray);
        portrait=avatarLibrary["HiggsHappy"];
        text=`Seek Truth lets you see the top card of your deck and either leave it on top or slide it down to the bottom of your deck.`;
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsHappy"];
        text=`It's not very useful outside of pretty specific strategies but it doesn't eat up your turn.`;
        gameUI.toBattleLog(portrait, text);
      }
    },
    hasDiscover:true,
  },
  Doctrine:{//onhold until enemy powers are online
    name:"Doctrine",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
    },
    passTurn:false, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let portrait, text;
      portrait=avatarLibrary["HiggsMad"];
      text=`Uhm...okay so that's a pretty strong ability but I'm not using any tap abilities until you get a better hang of the game anyway.  It's no biggie we'll just leave it tapped and you can take another action~`;
      gameUI.toBattleLog(portrait, text);
    }
  },
  KingsCastle:{ //should be active player-side
    name:"KingsCastle",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      if (this.tags.includes("Tapped")){return false;}
      let allUnits=data.getActiveUnits();
      if (allUnits.allies.length>1){
        return true
      }else{
        return false
      }

    },
    passTurn:false, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let portrait, text;
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"KingsCastle", triggeringCard:this};
      portrait=avatarLibrary["HiggsHappy"];
      text=`King's Castle lets you swap the locations of the card you tapped with any other allied card.  And after you do you don't pass the turn!`;
      gameUI.toBattleLog(portrait, text);}
    },
    targetEffect:function(targetPos){
      let board=zones.gameBoard.board;
      let targetCell=board[targetPos.y][targetPos.x];


      if (targetCell && targetCell.friendly && (targetPos.x!=this.position.x || targetPos.y!=this.position.y)){
        tempHome=board[targetPos.y].splice(targetPos.x, 1, false)[0];
        board[targetPos.y][targetPos.x]=board[this.position.y].splice(this.position.x, 1, false)[0];
        board[this.position.y][this.position.x]=tempHome;
        board[this.position.y][this.position.x].position={y:this.position.y, x:this.position.x};
        board[targetPos.y][targetPos.x].position=targetPos;
        gameDisplay.setCardImages();
        return true;
      }

      return false;
    }
  },
  FromFlameToFreedom:{//onhold until discover mechanic
    name:"FromFlameToFreedom",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      let discard= this.friendly? zones.p1Discard.discardedUnits:zones.p2Discard.discardedUnits;
      if (this.tags.includes("Tapped") || !discard.length){
        return false;
      }else{
        return true;
      }

    },
    passTurn:false, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let cardArray=[];
      let discard= this.friendly? zones.p1Discard.discardedUnits:zones.p2Discard.discardedUnits;

      discard.forEach((soul, index)=>{
        let cardObj={};



        cardObj.cardURL=cardLibrary[soul.name].cardArt;
        cardObj.cardClick=()=>{
              let deck=this.friendly? zones.p1Deck.deck:zones.p2Deck.deck;
              let discard= this.friendly? zones.p1Discard.discardedUnits:zones.p2Discard.discardedUnits;
              let board=zones.gameBoard.board;
              deck.push(board[this.position.y].splice(this.position.x,1,false)[0]);
              board[this.position.y][this.position.x]=discard.splice(index, 1)[0];
              board[this.position.y][this.position.x].position={x:this.position.x, y:this.position.y}

              gameDisplay.setCardImages();
              gamePlay.checkVictory();

              data.gamePhase="unitSelect";

            };
        cardObj.arguments=[];
        cardArray.push(cardObj);
      });

      if (this.friendly){
        data.gamePhase="discovering";
        gamePlay.launchDiscover(cardArray);
      }
    },
    targetEffect:function(){

    },
    hasDiscover:true,

  },
  Encore:{//should be available now to player
    name:"Encore",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      if (this.tags.includes("Tapped")){return false;}
      let allUnits=data.getActiveUnits();
      if (allUnits.allies.length>1){
        return true
      }else{
        return false
      }
    },
    passTurn:false, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      let portrait, text;
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"Encore", triggeringCard:this};
        portrait=avatarLibrary["HiggsHappy"];
        text=`Sometimes you don't have your commander or just can't wait until your next turn to use a tap ability again.`;
        gameUI.toBattleLog(portrait, text);
        portrait=avatarLibrary["HiggsHappy"];
        text=`The card you tapped can inspire them to make an Encore though!  Click any tapped allied card and you can snap them back to attention, then keep taking your turn!`;
        gameUI.toBattleLog(portrait, text);}
      },
    targetEffect:function(targetPos){
      let board=zones.gameBoard.board;
      let targetCell=board[targetPos.y][targetPos.x];

      if (targetCell && targetCell.friendly){
        if(targetCell.tags.includes("Tapped")){
          targetCell.tags.splice(targetCell.tags.indexOf("Tapped"), 1);
        }

        return true;
      }

      return false;
    },
  },
  FromFrostToFerocity:{//should be available to players now
    name:"FromFrostToFerocity",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      if (this.tags.includes("Tapped")){return false;}
      let board=zones.gameBoard.board;
      let forward= this.friendly ? -1:1;
      if (board[this.position.y+forward] && board[this.position.y+forward][this.position.x] &&
      !board[this.position.y+forward][this.position.x].tags.includes("Unstoppable") && !board[this.position.y+forward][this.position.x].tags.includes("Defended")){
        return this.friendly ? !board[this.position.y+forward][this.position.x].friendly:board[this.position.y+forward][this.position.x].friendly;
      }else{
        return false;
      }
    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      let board=zones.gameBoard.board;
      let forward= this.friendly ? -1:1;
      let capZone= this.friendly ? zones.p1Captured.capturedUnits:zones.p2Captured.capturedUnits;

      capZone.push(board[this.position.y+forward].splice(this.position.x, 1, false)[0]);
      board[this.position.y+forward][this.position.x]=board[this.position.y].splice(this.position.x, 1, false)[0];
      board[this.position.y+forward][this.position.x].position={y:this.position.y+forward, x:this.position.x};
    }
  },

}

let ci={
  dieRoll:function(dieSides){
    return Math.floor(Math.random()*dieSides)+1;
  },
  array_move:function(arr, old_index, new_index) {
    //https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  },
}

//possible moves that can be made
let actionList={
  moveForward:function(){
    //gets movement direction of card
    //tests if movement is legal
    //if yes, moves card into open space
      //empties card's previous space (using splice probably best)
      //returns true
      //updates board
    //if no, returns false

  },
  captureUnit:function(targetCell){
    //checks if there is a unit in targetCell
    //if no, return false
    //if yes, test if this card can capture that unit due to statuses or due to position

      //if no, return false
      //if yes, move captured unit into captured zone
        //move this unit into that units space
        //empty this unit's original space
        //return true
  },
  activateTapAbility:function(){
    //test if this unit has a tap ability
  }

};

let sceneLibrary={

  // sceneName:{
  //   higgsDialogue:[{text:"Things she says on one screen." , sprite:"FullHiggsSmile"},
  //   {text:"Click to advance to next dialogue bit." , sprite:"FullHiggsScared"},
  //    {text:"yay" , sprite:"FullHiggsBlush"}],
  //   playerResponse:[{prompt:"Button txt", leadsTo:"sceneName"}, {prompt:"Another One", leadsTo:"sceneName"}, {prompt:"Ye", leadsTo:"sceneName"}],
  // }

  //Intro, only plays once "what the hell are you doing h-  oh I see.  Shops closed but ask some questions if you wanna"
  firstMeet:{
    higgsDialogue:[{text:"Oh hell no!  I've got two bags of holding and I'm not afraid to take us BOTH out you icicle licking scraph-...oh, wait you're not....",
                    sprite:"FullHiggsScared"},
                    {text:"Aha, well never mind that...  You shouldn't scuttle around like that though.  So...uhm...you don't look like you're Court...you have buisness here or you just the hero type that takes EVERY closed door as an invitation?",
                    sprite:"FullHiggsBlush"}],
    playerResponse:[{prompt:"Oh, I'm...", leadsTo:"hereToShop"}, {prompt:"Who did you THINK I was?", leadsTo:"pushHiggs"}]
  },
  pushHiggs:{
    higgsDialogue:[{text:"I thought I said 'never mind that.'  But I can already tell you're going to be annoying about this so fine I'll give you the gist.",
                    sprite:"FullHiggsTired"},
                    {text:"I'm not actually Court either.  I came from Alt-...ogether a different settlement.  Some people there don't like me much and I thought you mighta been one of 'em.'",
                    sprite:"FullHiggsBlush"},
                    {text:"And that's all you're getting so don't try to wheedle the rest of my life story outta me unless you plan on offering something shiny and metal.",
                    sprite:"FullHiggsSmile"},
                    {text:"Not that that'd get me to open up, buuuut I'd find it way less annoying to be pestered about it if I got some coin outta the interaction.  Night knows I need it...",
                    sprite:"FullHiggsSmileBlink"},
                    {text:"Oh, but I guess I can tell ya I'm Higgs.  It's awkward when you don't know what to call someone and they just have to make up some weird nickname for you, ain't that right Scuttles?",
                    sprite:"FullHiggsSmile"}
                  ],
    playerResponse:[{prompt:"Heh.  Fair enough, anyway I'm here to...", leadsTo:"hereToShop"}, {prompt:"Nope. We're not doing that.  I'm just here to...", leadsTo:"resistNickname"}]
  },
  hereToShop:{
    higgsDialogue:[{text:"Ohhh, yeah you're actually in the right place just the wrong time, I *am* higgs and this *is* my tavern and I *do* deal in Alta supplies...but nothing's really for sale yet.  I bought the property recently but, well...",
                    sprite:"FullHiggsSmile"},
                    {text:"Living and material costs here absolutely kicked my ass. I brought a decent amount of supplies with me but I can't really afford labor so it's taken me longer than I expected to get my shop open.",
                    sprite:"FullHiggsBlush"},
                    {text:"But hey, glad to see advertising wasn't a wash.  Hmm...hey, tell you what.  I can't offer you a drink but I know what you adventurer sorts are usually after.  For coming out all this way, how about I answer some no-personal questions.  Heck you can even borrow my collection and I'll teach you some Alta.",
                    sprite:"FullHiggsSmile"},
                  ],
    playerResponse:[{prompt:"Sure, that works.", leadsTo:"questionHub"}]
  },
  resistNickname:{
    higgsDialogue:[{text:"Pfft, you're no fun.  But I guess you ARE my first customer...hmm...",
                    sprite:"FullHiggsSmileBlink"},
                    {text:"Alright, so here's the deal.  You're in the right place but my tavern isn't actually open yet.  Since you made the trip though I'll play the good host and answer some NON-PERSONAL questions.",
                    sprite:"FullHiggsTired"},
                    {text:"I'll even teach you some Alta.  If things go to plan it'll be pretty big soon so it'll do you some good.  Sound good Scu-...erk..you?",
                    sprite:"FullHiggsSmile"}
                  ],
    playerResponse:[{prompt:"I have some questions, sure.", leadsTo:"questionHub"}]
  },
  questionHub:{
    higgsDialogue:[{text:"Whattya wanna know about?",
                    sprite:"FullHiggsSmile"},
                    ],
    playerResponse:[{prompt:"Give me some of the background on Alta...", leadsTo:"altaBackgroundHub"}, {prompt:"I need a refresher on some Alta rules...", leadsTo:"altaRulesHub"},

                   ]
  },

  ///////////
  altaBackgroundHub:{
    higgsDialogue:[{text:"I think I can help ya there~",
                    sprite:"FullHiggsSmile"},
                    {text:"I don't feel like rehashing anything you already know though, so what in particular brightens your eyes?",
                    sprite:"FullHiggsSmile"},
                    ],
    playerResponse:[{prompt:"How'd the game start out?", leadsTo:"altaBeginnings"}, {prompt:"What's the game supposed to be about?", leadsTo:"altaMeaning"},
                    {prompt:"Where can I find a game of Alta?", leadsTo:"altaPlayers"}, {prompt:"Actually, lemme ask about something else.", leadsTo:"questionHub"}
                   ]
  },
    altaBeginnings:{
      higgsDialogue:[{text:"Okay sooo...I'd say it started back with Hexapawn.  That's the one where you get a Three by three board and load up your side with pawns, then try to promote your piece before your opponent.",
                      sprite:"FullHiggsSmile"},
                      {text:"Game was super easy to break and kinda boring though so I wouldn't be surprised if you've never heard of it.  It was like tic-tac-toe novice chess players liked between matches.",
                      sprite:"FullHiggsSmile"},
                      {text:"It went through a few variations but the one that really launched it was when they switched out the pawns for cards that paid homage to different groups around Silva.  Some Philoman kid sketched out the first few cards I think.  Looked like crap but Handsome Jack, he's this big 'buisnessman' over in Altambra or so I hear, liked the idea and had his people make quality versions.  At first it wasn't even mechanically different a  game but it was way easier to carry and people liked collecting different art.",
                      sprite:"FullHiggsSmile"},
                      {text:"It wasn't just that they were pretty to look at.  They...reminded lot sof folk of home.  Altambra's great because it opens its arms as everyone and anyone's second home.  But people don't just forget their first home.  Even the ones that don't admit it like to remember that home.  Represent it.  And Alta gave a lot of people that.  So I hear.",
                       sprite:"FullHiggsBlush"},
                       {text:"Anyhow once the card thing really stuck the next thing to change was the board, went to a four by four to help with the whole solved game issue.",
                        sprite:"FullHiggsSmile"},
                      {text:"That wasn't <b>quite</b> enough though but thanks to using cards instead of pawns things other than art could go on 'em.  Jack started asking his crafters to make cards with special abilities on 'em.  A little extra rare of course so he could get people buying. around here is where hte name Alta got stuck on.",
                        sprite:"FullHiggsSmile"},
                      {text:"There've been, heck there still are changes and not every place that plays agrees on the exact rules but up to there is what everyone agrees is Alta.  If you pushed me I guess I'd say that the new 'commander' cards are the next big shakeup.  They're extra rare and based on actual people, Jack just leans on his infobrokers to suggest people or legends that people would be excited to slide into their decks.",
                        sprite:"FullHiggsTired"},
                      {text:"Anyhow, that's about the gist.  So I've heard.  Any other questions?",
                        sprite:"FullHiggsSmile"},
                      ],
      playerResponse:[{prompt:"What's the game supposed to be about?", leadsTo:"altaMeaning"},
                      {prompt:"Where can I find a game of Alta?", leadsTo:"altaPlayers"}, {prompt:"Actually, lemme ask about something else.", leadsTo:"questionHub"}
                     ]
    },
    altaMeaning:{
      higgsDialogue:[{text:"Hmm....good question.  It started from this weird chess variant and chess is supposed to represent a war game.",
                      sprite:"FullHiggsSmile"},
                      {text:"Since Alta uses more personalized cards instead of chess pieces though I'd say the scale is definitely smaller.  So maybe representing something like a skirmish in the Outlands is appropriate?",
                      sprite:"FullHiggsSmile"},
                      {text:"Thats just what my gut tells me though.  It's a soup with lots of chefs so I can't be sure what's symbolism and what's just accident.  Maybe I can tell you about something else?",
                      sprite:"FullHiggsSmile"},
                    ],
      playerResponse:[{prompt:"How'd the game start out?", leadsTo:"altaBeginnings"},
                      {prompt:"Where can I find a game of Alta?", leadsTo:"altaPlayers"}, {prompt:"Actually, lemme ask about something else.", leadsTo:"questionHub"}
                    ]

                },
    altaPlayers:{
      higgsDialogue:[{text:"Well you can find plenty of game in Altambra for...well obvious reasons.  <b>Alta</b>mbra.  Get it?  There are plenty of streetgames and most pubs have a table or two going at any time.  But the <b>biggest</b> games are definitely in one of Handsome Jacks' establishments.",
                      sprite:"FullHiggsSmile"},
                      {text:"He runs lots of gambling parlors and recently Alta has been a nice way of drawing people in.  He runs tournaments occasionally that really bring out the fans, even had one not too long ago where the winner got her own card made along with a handful of super rare Commanders. The rules they set down there are the closest you'll get to 'official'.",
                      sprite:"FullHiggsSmile"},
                      {text:"Outside of Altambra though Aestas or Bruma are your best bets, though mostly it's just guards and soldiers who are into it.",
                      sprite:"FullHiggsSmile"},
                      {text:"People trade and sell between eachother but the only REAL way to get more cards, including the latest, is in the parlors at Altambra.  Which is part of why it won't grow until merchants start prioritizing shipments to other settlements.",
                      sprite:"FullHiggsSmile"},
                      {text:"Most of the guards and soldiers here however spend time in Altambra pretty regularly since that's usually where the Courts parley, so they can tap into the supply enough to spawn playgroups among themselves but that's about it.",
                      sprite:"FullHiggsSmile"},
                      {text:"That being said there are some pubs like Green Isle and Red Sands where their sort likes to drink that become a good place to find a game and if you're lucky add a handful of cards to your collection.",
                      sprite:"FullHiggsSmile"},
                      {text:"Of course, I hope to change all that and turn my little Hideaway into the best place in the Courts to play AND get your hands on the latest cards. If I can get the non-soldiers in this place playing I think I'll stand to make a tidy little profit too which is nice!",
                      sprite:"FullHiggsSmile"},
                    ],
      playerResponse:[{prompt:"How'd the game start out?", leadsTo:"altaBeginnings"}, {prompt:"What's the game supposed to be about?", leadsTo:"altaMeaning"},
                       {prompt:"Actually, lemme ask about something else.", leadsTo:"questionHub"}
                     ]
  },
  /////////////
  /////////Alta Rules
  altaRulesHub:{
    higgsDialogue:[{text:"Sure thing, what part of the game's tripping you up?  We'll just go by 'Tambra rules to keep it simple.'",
                    sprite:"FullHiggsSmile"},

                    ],
    playerResponse:[{prompt:"What do I need to play?", leadsTo:"altaGear"}, {prompt:"So what's the 'setup' phase again?", leadsTo:"altaSetup"},
                    {prompt:"What can I do during my turn?", leadsTo:"altaActions"}, {prompt:"So about Commanders and special abilities..", leadsTo:"altaSpecials"},
                    {prompt:"Actually, lemme ask about something else.", leadsTo:"questionHub"}
                   ]
  },
  altaGear:{
    higgsDialogue:[{text:"You don't really need to carry much to play.  The most important thing is having a deck of your own.  It can be as big or small as ya want but most people bring at least 8.",
                    sprite:"FullHiggsSmile"},
                    {text:"Some people have boards or mats to play on but most streetgames just use whatevers handy.  Marking out the grid in chalk or in the dirt isn't too rare.",
                    sprite:"FullHiggsSmile"},
                    {text:"Other than that, lots of people like using a coin to decide who goes first but really the only thing you <b>need</b> is enough cards to grip.",
                    sprite:"FullHiggsSmile"},
                    {text:"Oh, and someone to play with.  There's some single player variants but honestly that's just kinda depressing.  If you want to help me get this place into shape I might have some time to play a few practice games with you.",
                    sprite:"FullHiggsBlush"},

                    ],
    playerResponse:[ {prompt:"So what's the 'setup' phase again?", leadsTo:"altaSetup"},
                    {prompt:"What can I do during my turn?", leadsTo:"altaActions"}, {prompt:"So about Commanders and special abilities..", leadsTo:"altaSpecials"},
                    {prompt:"Actually, lemme ask about something else.", leadsTo:"questionHub"}
                   ]
  },
  altaSetup:{
    higgsDialogue:[{text:"So let's see, well first you set up the board.  Remember it has to be four by four.  The row closest to you is your 'home' row.",
                    sprite:"FullHiggsSmile"},
                    {text:"This is where you'll flip a coin or something to see who'll go first.",
                      sprite:"FullHiggsSmile"},
                    {text:"Shuffle up your deck, oh but first remember to take out and reveal who you're using as your Commander, then draw four cards.  [Revealing your Commander is automatically handled in AltaOnline]",
                    sprite:"FullHiggsSmile"},
                    {text:"If you're going first you put down cards from your hand into your homerow until either they're all filled up or you run out of cards.",
                    sprite:"FullHiggsSmile"},
                    {text:"This uh...this is the part of the game where if you sat down to play with literally zero cards people will just stare at you awkwardly.",
                    sprite:"FullHiggsSmile"},
                    {text:"Then the player who moves second will lay down their cards after they get a chance to see how their opponent arranged things.  Then everyone shuffles any leftover cards back into their decks.",
                    sprite:"FullHiggsSmile"},
                    {text:"And then whoever goes first can take their first tu- Oh! Wait,  while not an official thing this is where people will agree where to put their capture and discard piles.",
                    sprite:"FullHiggsSmile"},
                    {text:"If your card gets captured in game it goes to your opponent's capture zone, and if an ability causes a card to be 'discarded' it goes into the discard pile.  [Discard pile is marked by a skull and is to the left of your deck in AltaOnline.  The Capture Pile will be marked by a set of cell bars and will be on the right.]",
                    sprite:"FullHiggsSmile"},
                    {text:"There SOME fanciness to worry about if you're playing a multi-round game but honestly since you're new just don't worry about it and stick to single-round games where this marks the end of the 'setup' phase.",
                      sprite:"FullHiggsSmile"},


                    ],
    playerResponse:[{prompt:"What do I need to play?", leadsTo:"altaGear"},
                    {prompt:"What can I do during my turn?", leadsTo:"altaActions"}, {prompt:"So about Commanders and special abilities..", leadsTo:"altaSpecials"},
                    {prompt:"Actually, lemme ask about something else.", leadsTo:"questionHub"}
                   ]
  },
  altaActions:{
    higgsDialogue:[{text:"Well that's easy enough.  On your turn you take an action then pass the turn to your opponent to do the same.",
                    sprite:"FullHiggsSmile"},
                    {text:"Pick one of your cards and have it do one of three things: 'Move', 'Capture', or 'use a Tap Ability' [To pick a card simply click it.]",
                      sprite:"FullHiggsSmile"},
                    {text:"Cards can Move one space directly in front of themselves as long as that space isn't already occupied.  Like a pawn in chess.",
                    sprite:"FullHiggsSmile"},
                    {text:"Cards can Capture enemy cards diagonally left or diagonally right of themselves.  Again, like a pawn in chess.",
                    sprite:"FullHiggsSmile"},
                    {text:"Finally IF your card has a tap ability it can use, you can do that instead.  What happens is based on the ability. [To activate a tap ability, click a card again after selecting it]",
                    sprite:"FullHiggsSmile"},
                    {text:"One thing I should point out is that while <b>normally</b> you pass the turn after taking any action some specific abilities don't cause you to do this so keep an eye out and read the card.",
                    sprite:"FullHiggsSmile"},
                    {text:"Normally it's a beneficial thing to be able to do multiple things in one turn, but remember that if it's ever your turn and you can't perform an action, even if you've performed an action earlier that turn, you lose.",
                    sprite:"FullHiggsSmile"},
                    {text:"And that's pretty much all you can do.  Well, except for cheating I guess.",
                    sprite:"FullHiggsSmile"},
                    ],
    playerResponse:[{prompt:"What do I need to play?", leadsTo:"altaGear"}, {prompt:"So what's the 'setup' phase again?", leadsTo:"altaSetup"},
                    {prompt:"So about Commanders and special abilities..", leadsTo:"altaSpecials"},
                    {prompt:"Actually, lemme ask about something else.", leadsTo:"questionHub"}
                   ]
  },
  altaSpecials:{
    higgsDialogue:[{text:"Okay, so let's see...there are two types of special abilities a card can have.  Passive and Tap abilities.  A card can have one of each kind, none, or two passive abilities.",
                    sprite:"FullHiggsSmile"},
                    {text:"Tap abilities are noted by a curved blue arrow.  They're called that because when you use a tap ability you 'tap' on the top of it, turning it sideways to show that you've used its ability.",
                    sprite:"FullHiggsSmile"},
                    {text:"That's important since you can't  use a tap ability if the card is already tapped.  [Double click a card to use its tap ability]",
                      sprite:"FullHiggsSmile"},
                    {text:"As for what it does, well that's based on the card so you'll just have to read it or if you can't, ask someone to read it to ya. [Hover over a card to see a full version of it]",
                      sprite:"FullHiggsSmile"},
                    {text:"Oh and if it's not possible to use the ability listed on it because you don't have the right targets, or its asking you to discard something you don't have even one of, then you also can't activate it.",
                    sprite:"FullHiggsSmile"},
                    {text:"Passive Abilities are noted by a pink infinity symbol.  Infinity because they're 'always' on is a good way to remember it though unless they specifically say otherwise they're only active while the card is on the board.",
                      sprite:"FullHiggsSmile"},
                    {text:"They just change the rules somehow, letting a card move weirdly, letting you draw extra cards, making it impossible to capture in certain situations, etc.",
                    sprite:"FullHiggsSmile"},
                    {text:"Cards can Capture enemy cards diagonally left or diagonally right of themselves.  Again, like a pawn in chess.",
                    sprite:"FullHiggsSmile"},
                    {text:"You can only have <b>one</b> card with a passive ability in your deck unless you're playing in Red Sands Tavern because they a bunch of dumb scrap eaters.",
                    sprite:"FullHiggsSmile"},
                    {text:"That <b>one</b> card however is a bit special because it will also be your Commander.  Other than starting in your hand at the start of the game, Commanders have one other special feature.",
                    sprite:"FullHiggsSmile"},
                    {text:"At the start of your turn your Commander 'rallies' all of your cards on the board, that means they get to untap and potentially use their tap abilities again!",
                    sprite:"FullHiggsSmile"},
                    {text:"And that's pretty much all you need to know for now.",
                    sprite:"FullHiggsSmile"},
                    ],
    playerResponse:[{prompt:"What do I need to play?", leadsTo:"altaGear"}, {prompt:"So what's the 'setup' phase again?", leadsTo:"altaSetup"},
                    {prompt:"What can I do during my turn?", leadsTo:"altaActions"},
                    {prompt:"Actually, lemme ask about something else.", leadsTo:"questionHub"}
                   ]
  },




}

let effectLibrary={
  selectHighlight:function(ctx, position){
    //create a box around unit
    let size=data.gridStats.size;
    ctx.save();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#d65a31";
    ctx.strokeRect(position.x*size, position.y*size, size, size);
    ctx.restore();
  },
  moveHighlight:function(ctx, position){
    //draw a boot on move-intoable cells.
    let size=data.gridStats.size;
    ctx.save();
    ctx.fillStyle = "rgba(131, 250, 250, 0.5)";
    ctx.fillRect(position.x*size, position.y*size, size, size);
    ctx.restore();
  },
  captureHighlight:function(ctx, position){
    let size=data.gridStats.size;
    ctx.save();
    ctx.fillStyle = "rgba(184, 3, 40, 0.6)";
    ctx.fillRect(position.x*size, position.y*size, size, size);
    ctx.restore();
  },
  tapAvailable:function(ctx, position){

    let starLength=15;

    let cellSize=data.gridStats.size;
    ctx.save();

    let centerX=(position.x*cellSize)+(cellSize*.5);
    let centerY=(position.y*cellSize)+(cellSize*.75)
    ctx.translate(centerX, centerY);
    ctx.rotate((Math.PI * 1 / 10));
    ctx.rotate((45 * Math.PI / 180));


    // let centerX=position.x+cellSize*.5;
    // let centerY=position.y+cellSize*.75;



	this.opacity += this.increment * this.factor;

	ctx.beginPath()


    for (var i = 5; i--;) {
      ctx.lineTo(0, starLength);
  		ctx.translate(0, starLength);
  		ctx.rotate((Math.PI * 2 / 10));
  		ctx.lineTo(0, - starLength);
  		ctx.translate(0, - starLength);
  		ctx.rotate(-(Math.PI * 6 / 10));

  	}
  	ctx.lineTo(0, starLength); //origianlly centerX was magic number 0
  	ctx.closePath();
  	ctx.fillStyle = "rgba(255, 255, 200, 1)";
  	ctx.shadowBlur = 5;
  	ctx.shadowColor = '#ffff33';
  	ctx.fill();




	ctx.restore();
},
  starterRowHighlight:function(ctx, position){
    let size=data.gridStats.size;
    ctx.save();
    ctx.fillStyle = "rgba(211, 239, 0, 0.6)";
    ctx.fillRect(position.x*size, position.y*size, size, size);
    ctx.restore();
  }
}

let avatarLibrary={

  HiggsHappy:"https://res.cloudinary.com/metaverse/image/upload/v1541010546/Avatars/Higgsy/side_higgsLaugh.png",
  HiggsDrained:"https://res.cloudinary.com/metaverse/image/upload/v1541010547/Avatars/Higgsy/side_higgsDrained.png",
  HiggsExasperated:"https://res.cloudinary.com/metaverse/image/upload/v1541010536/Avatars/Higgsy/side_higgsShockedBlink.png",
  HiggsMad:"https://res.cloudinary.com/metaverse/image/upload/v1541010545/Avatars/Higgsy/side_higgsMad.png",
  HiggsStare:"https://res.cloudinary.com/metaverse/image/upload/v1541010543/Avatars/Higgsy/side_higgsNormal.png",
  HiggsSnide:"https://res.cloudinary.com/metaverse/image/upload/v1541010541/Avatars/Higgsy/side_higgsSnide.png",
  HiggsShocked:"https://res.cloudinary.com/metaverse/image/upload/v1541010539/Avatars/Higgsy/side_higgsShocked.png",
  FullHiggsScared:"https://res.cloudinary.com/metaverse/image/upload/v1568150446/Avatars/Higgsy/MC_scared_shocked.png",
  FullHiggsTired:"https://res.cloudinary.com/metaverse/image/upload/v1568150560/Avatars/Higgsy/MC_Tired.png",
  FullHiggsSmile:"https://res.cloudinary.com/metaverse/image/upload/v1568150577/Avatars/Higgsy/MC_Smile_eyes_opened.png",
  FullHiggsSmileBlink:"https://res.cloudinary.com/metaverse/image/upload/v1568150594/Avatars/Higgsy/MC_Smile_eyes_closed.png",
  FullHiggsBlush:"https://res.cloudinary.com/metaverse/image/upload/v1568150617/Avatars/Higgsy/MC_Blushing__embarraessed.png"
}

let theEnemy=false;

let enemies={
  TheDefault:{
    name:"Tutorial Enemy",
    deck:["RaiDuMorne", "CourierOppurtunist", "HiredKnife", "DashingRogue", "AltambranDuelist", "MiranScout", "RuneKnight", "WinterWarrior"],
    placeStartRow:function(){
        //just randomly jam down cards
        let board=zones.gameBoard.board;
        let heldCards=zones.p2Hand.heldCards;

        for (let i=0, len=board[0].length; i<len; i++){
          if (!board[0][i]){
            board[0][i]=heldCards.splice(ci.dieRoll(heldCards.length)-1, 1)[0];
            board[0][i].position={x:i, y:0};
          }
        }
        gameDisplay.setCardImages();
        while (heldCards.length){
          zones.p2Deck.deck.push(heldCards.splice(1, 0)[0]);
        }
        //at this point we should shuffle away remaining cards but...not currently an issue until abilities and commanders come into play
      },
    chooseAction:function(){
        let mentalMap=data.getActiveUnits();
        let board=zones.gameBoard.board;

        let possibleActions=[];


        mentalMap.enemies.forEach((enemy)=>{
          enemy.moveRanges.forEach((move)=>{

            if (this.isMoveLegal(enemy, move)){
              possibleActions.push(new Construct.Action("movement", {startSpace:enemy.position, endSpace:{x:enemy.position.x+move.x, y:enemy.position.y+move.y}}));
            }
          });

          enemy.captureRanges.forEach((move)=>{
            if (this.isCaptureLegal(enemy, move)){
              let actInfo={
                startSpace:enemy.position,
                endSpace:{x:enemy.position.x+move.x, y:enemy.position.y+move.y},
                cappedSpace:{x:enemy.position.x+move.x, y:enemy.position.y+move.y} //TODO change code to allow cappedspace and endspace to be different
              };
              possibleActions.push(new Construct.Action("capture", actInfo));
              if (enemy.tags.includes("FromShadow")){
                  actInfo.endSpace=actInfo.startSpace;
                  possibleActions.push(new Construct.Action("capture", actInfo));
              }
            }
          });
        });

        if (!possibleActions.length){

          return false;
        }else{
          return possibleActions[ci.dieRoll(possibleActions.length)-1];
        }

        // function isMoveLegal(unit, movement){
        //   let pos=unit.position;
        //   try{
        //     if (board[pos.y+movement.y][pos.x+movement.x]===false){
        //       return true;
        //     }
        //     else{
        //       return false;
        //     }
        //   }catch(error){
        //     //assumes that board position is out of bounds
        //     return false;
        //   }
        //
        //
        // }
        // function isCaptureLegal(unit, movement){
        //   let pos=unit.position;
        //   try{
        //     if (board[pos.y+movement.y][pos.x+movement.x].friendly){

        //       return true;
        //     }
        //     else{
        //       //nothing to cap
        //       return false;
        //     }
        //   }catch(error){
        //     return false;
        //   }
        //
        // }
      },
  },
  VanillaBeast:{
    name:"Tutorial Enemy",
    deck:["LumiMaarit", "RuneKnight", "TreeSinger"],
    // deck:["LuminaOfPhiloma", "CourierOppurtunist", "HiredKnife", "DashingRogue", "AltambranDuelist", "MiranScout", "RuneKnight", "WinterWarrior"],
    placeStartRow:function(){
        //just randomly jam down cards
        let board=zones.gameBoard.board;
        let heldCards=zones.p2Hand.heldCards;
        let xSlot;

        for (let i=0, len=heldCards.length; i<len; i++){

          if (heldCards[i].hasPassive){
            xSlot=ci.dieRoll(4)-1;
            board[0][xSlot]=heldCards.splice(i, 1)[0];
            board[0][xSlot].position={x:xSlot, y:0};
            break;
          }
        }

        for (let i=0, len=board[0].length; i<len && heldCards.length; i++){
          if (!board[0][i]){
            board[0][i]=heldCards.splice(ci.dieRoll(heldCards.length)-1, 1)[0];
            board[0][i].position={x:i, y:0};
          }
        }
        gameDisplay.setCardImages();
        while (heldCards.length){
          zones.p2Deck.deck.push(heldCards.splice(0, 1)[0]);
        }

        //at this point we should shuffle away remaining cards but...not currently an issue until abilities and commanders come into play
      },
    chooseAction:function(){
        let mentalMap=data.getActiveUnits();
        let board=zones.gameBoard.board;

        let possibleActions=[];


        mentalMap.enemies.forEach((enemy)=>{
          enemy.moveRanges.forEach((move)=>{

            if (this.isMoveLegal(enemy, move)){
              possibleActions.push(new Construct.Action("movement", {startSpace:enemy.position, endSpace:{x:enemy.position.x+move.x, y:enemy.position.y+move.y}}));
            }
          });

          enemy.captureRanges.forEach((move)=>{
            if (this.isCaptureLegal(enemy, move)){
              let actInfo={
                startSpace:enemy.position,
                endSpace:{x:enemy.position.x+move.x, y:enemy.position.y+move.y},
                cappedSpace:{x:enemy.position.x+move.x, y:enemy.position.y+move.y} //TODO change code to allow cappedspace and endspace to be different
              };

              possibleActions.push(new Construct.Action("capture", actInfo));
              if (enemy.tags.includes("FromShadow")){
                  actInfo.endSpace=actInfo.startSpace;
                  possibleActions.push(new Construct.Action("capture", actInfo));
              }
            }
          });
        });

        possibleActions.forEach((act)=>{
          if (act.actionType=="movement"){
            act.actValue=this.judgeMoveValue(act);
          }
          else if(act.actionType=="capture"){
            act.actValue=this.judgeCaptureValue(act);
          }
        });

        if (!possibleActions.length){

          return false;
        }else{
          possibleActions.sort(function(a,b){
            return b.actValue-a.actValue;
          });
          return possibleActions[0];
        }


      },
    judgeMoveValue:function(action){
      let value=0;
      let board=zones.gameBoard.board;
      let act=action.actionInfo;

      switch(act.endSpace.y){
        case 3:
          value+=1000;  //this move gaurantees a win and therefore we should offer a MASSIVE bonus to it being taken
          break;
        case 2:
          value+=10; //this move puts us into position for a win which is but not worth more than the value from getting a sweet capture
          break;
        case 1:
          break;
        default:
          break;
      }
      if (gameCalculations.isInCheck(act.endSpace)){
        value-=25;
      }
      if (gameCalculations.isDefended(act.endSpace)){
        value+=25;
      }




      return value;
    },
    judgeCaptureValue:function(action){
      let value=0;
      let board=zones.gameBoard.board;
      value+=25; //flat bonus for captures being more valuable than moves
      let act=action.actionInfo;

      switch(act.endSpace.y){
        case 3:
          value+=1000;  //this move gaurantees a win and therefore we should offer a MASSIVE bonus to it being taken
          break;
        case 2:
          value+=10; //this move puts us into position for a win which is but not worth more than the value from getting a sweet capture
          break;
        case 1:
          break;
        default:
          break;
      }

      if (gameCalculations.isInCheck(act.endSpace)){
        value-=25;
      }
      if (gameCalculations.isDefended(act.endSpace)){
        value+=25;
      }
      return value;
    }
  },


}

if (localStorage.getItem("currentEnemy") === null) {
  localStorage.setItem('currentEnemy', "VanillaBeast");
}

let data={
  getLayers:function(){
    return ["Cards"];
  },
  playerProfile:{
    name:"Player"
  },
  getProfile:function(){
    return JSON.parse(localStorage.getItem("playerProfile"));
  },
  setProfile:function(newProfile){
    localStorage.setItem('playerProfile', JSON.stringify(newProfile));
  },
  gridStats:{
    size:250,

  },
  sceneStats:{
    activeScene:"questionHub",
    dialogueIndex:0,
  },
  getGameBoard:function(){
    return zones.gameBoard.board;
  },
  getPlayerDeck:function(){
    return JSON.parse(localStorage.getItem("playerDeck"));
  },
  setPlayerDeck:function(newDeck){
    localStorage.setItem('playerDeck', JSON.stringify(newDeck));
  },
  getEnemy:function(){
    // return enemies[localStorage.getItem("currentEnemy")];
    return theEnemy;
  },
  setEnemy:function(){
    theEnemy=enemies[localStorage.getItem("currentEnemy")];
    Object.assign(theEnemy, Construct.Enemy);

  },
  gamePhase:"preGame",
  getActiveUnits:function(){
    //returns an object with two arrays.  One for ally units, one for enemy units
    let board=zones.gameBoard.board;
    let enemyUnits=[];
    let allyUnits=[];

    for (let i=0, row=board.length; i<row; i++){
      for (let j=0, col=board[i].length; j<col; j++){
        if (board[i][j]){
          if (board[i][j].friendly){
            allyUnits.push(board[i][j]);
          }
          else{
            enemyUnits.push(board[i][j]);
          }
        }
      }

    }

    return {enemies:enemyUnits, allies:allyUnits};
  },
  firstTurn:false,
  displayedCard:false,
}

if (localStorage.getItem("playerProfile") === null) {

  localStorage.setItem('playerProfile', JSON.stringify({name:"Player"}));
}



if (localStorage.getItem("playerDeck") === null) {
  let player=window.prompt("Aster.  Cyrus.  Lumi.  Which are you?  Or are you another soul entirely?");
  let playerProfile=data.getProfile();
  console.log()
  playerProfile.name=player;
  data.setProfile(playerProfile);
  data.sceneStats.activeScene="firstMeet";

  switch (player.toLowerCase()){
    case "aster":
      alert("It is a rare pleasure to have a first meetng with a treasured companion.  I am glad to meet you again for the first time, my dear host.");
      break;
    case "cyrus":
      alert("Greetings,  once-Knight.  Shall I wish you good luck in your endeavors?");
      break;
    case "lumi":
      alert("Greetings, tongue-mage.  Shall I prepare myself for a spectacle?");
      break;
    default:
      alert("Another soul than.  Or perhaps I misheard?  Regardless I shall prepare your place ahead.");
      break;
  }

  alert("A word of warning.  A possible reality is not without value, and your soul will surely grow from the experience.  But that value is a fleeting thing until you are able to both awake from your dream and keep a hand clutched around what you have gained here.");

  if (player.toLowerCase()){
    alert("Please try to relax my Dear Host.  We will not be as entwined here as we often are but I will attempt to reach out when I can.");
  }else{alert("I will...attempt...to watch over you, as my Dear Host would wish of me.");}

  localStorage.setItem('playerDeck', JSON.stringify(starterDeck));

}



function resetStorage(){
  if (window.confirm("Do you really want to delete all your saved info?")) {
  localStorage.clear();
  location.reload();
}
}

function starterGameBoard(){
  let rows=4;
  let cols=4;
  let board=[];
  for (let i=0; i<rows; i++){
    board.push([]);
    for (let j=0; j<cols; j++){
      board[i].push(false);
    }
  }

  return board;
}
