

//Many Faced Ability not included
//Heel ability not included

let starterDeck=["LumiMaarit", "MiranScout", "AltambranDuelist", "PhilomanScholar", "RuneKnight", "SummerSavior", "TreeSinger", "WinterWarrior"];

let validEnemyCommanders=["DoujahRaze", "LuminaOfPhiloma", "CyrusMartingo", "HandsomeJack", "RaiDuMorne"];


if (localStorage.getItem("playerDeck") === null) {
  let player=window.prompt("There are three who may enter beyond here.  Aster.  Cyrus.  Lumi.  Which are you?");
  alert("I...I cannot quite...see you.");
  if (player.toLowerCase()=="aster"){
    alert("Should you truly be my dear host I apologize.");
  }
  alert("I shall..attempt to remedy this situation.  In the mean, allow me to offer what hospitality I can, please do enjoy yourself.  As a note, to begin a game you must first 'flip' to see who shall take the initiative.  Then click your deck to draw your opening hand.");
  localStorage.setItem('playerDeck', JSON.stringify(starterDeck));
}

if (localStorage.getItem("currentEnemy") === null) {
  localStorage.setItem('currentEnemy', "VanillaBeast");
}


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

    switch(event){
      case "Decksetup":

      case "Coinflip":

      case "DrawHands"://placement also happens in this phase
      case "PlayerTurnStart":
      //Rallying
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
            console.log("frenzy..tick..tock..." + zones.p1Status.frenzyCounter);
            if(zones.p1Status.frenzyCounter<=0){
              alert("Overcome by your frenzy you have perished.");
              gamePhase="EnemyVictory!";
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
      case "EnemyWin":
      //later things like unitCapture and unitMove may be added as events

      default:
        break;
    }
  }
};

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

//contains information about things like board size
let data={
  getLayers:function(){
    return ["Cards"];
  },
  gridStats:{
    size:250,

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
  gamePhase:"setup",
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
    }
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
          data.gamePhase="EnemyVictory!";
          alert ("enemy wins!");
        }else{
          data.gamePhase="PlayerVictory!";
          alert ("Well played, your opponent has fallen into your Red Jester's trap.  you have snatched victory from the hands of your enemy!");


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
              data.gamePhase="PlayerVictory!";
              alert ("Your opponent has no legal moves!  They lose!");
            }else{
              data.gamePhase="EnemyVictory!";
              alert ("Your opponent is cornered with no legal moves but...The Red Jester has twisted the situation!  Enemy Wins!");
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
      if (this.friendly){
        if(zones.p1Status.frenzyCounter===undefined){
          alert("You are frenzying...win quickly!");
          zones.p1Status.frenzyCounter=3;
        }else{
          zones.p1Status.frenzyCounter--;
        }
        if(zones.p1Status.frenzyCounter<=0){
          alert("Overcome by your frenzy you have perished.");
          gamePhase="EnemyVictory!";
        }
      }
      else{
        if(zones.p2Status.frenzyCounter===undefined){
          alert("The enemy is frenzying...they'll spell their own doom soon but will now fight desperately!");
          zones.p2Status.frenzyCounter=3;
        }else{
          zones.p2Status.frenzyCounter--;
        }
        if(zones.p2Status.frenzyCounter<=0){
          alert("Overcome by their frenzy your foe can fight no longer.  You win!");
          gamePhase="PlayerVictory!";
        }
      }
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

      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"WhenNeeded", triggeringCard:this};}
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


      if (this.friendly && burntCards.length){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"WildMage", triggeringCard:this, cardsToBurn:burntCards};}
      alert(`Lumi can cast the burnt card:${burntCards[0].name}`);
    },
    targetEffect:function(targetPos){
      let kindling;
      let effect;
      let kindleEffect;
      if (this.friendly){
        kindling=zones.p1Status.resolvingEffect.cardsToBurn;
      }
      kindleEffect=kindling[0].abilitySlot1.type=="Tap"? kindling[0].abilitySlot1:kindling[0].abilitySlot2;
      effect=tapLibrary[kindleEffect.name];
      if (!effect.isValid.call(this)){
        kindling.shift();
        if(kindling.length){
          alert(`Lumi can cast the burnt card:${burntCards[0].name}`);
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
          alert(`Lumi can cast the burnt card:${burntCards[0].name}`);
          return false;
        }
        if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
        return true;
      }else if(effect.targetEffect.call(this, targetPos)){
        kindling.shift();
        if(kindling.length){
          alert(`Lumi can cast the burnt card:${burntCards[0].name}`);
          return false;
        }
        if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
        return true;
      }else{
        alert(`Lumi can cast the burnt card:${burntCards[0].name}`);
        return false;
      }


    }
  },
  Whisper:{ //screw it, skip this one.  requires activate->choose
    name:"Whisper",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
      return false;
    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
    },
    targetEffect:function(){

    }
  },
  Champion:{ //should work for allies now, in theory
    name:"Champion",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action

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
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen

      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"Champion", triggeringCard:this};}

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
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"DemandSatisfaction", triggeringCard:this};}
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
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"Ensnare", triggeringCard:this};}
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
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"SeekTheMountain", triggeringCard:this};}
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
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}

      cardArray.push({cardURL:cardLibrary[card.name].cardArt, cardClick:false, arguments:[]});
      cardArray.push({cardURL:assetCache.cache.urls.leaveOnTop, cardClick:leaveOnTop, arguments:[]});
      cardArray.push({cardURL:assetCache.cache.urls.placeOnBottom, cardClick:scryToBottom, arguments:[]});


      if (this.friendly){
        data.gamePhase="discovering";
        gamePlay.launchDiscover(cardArray);
      }
    },
    hasDiscover:true,
  },
  Doctrine:{//onhold until enemy powers are online
    name:"Doctrine",
    isValid:function(){//uses 'call' to set this to a card.  Returns true or false if that card could take this action
    },
    passTurn:true, //whether or not this ability passes the turn.  ,
    effect:function(){//causes something to happen
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
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"KingsCastle", triggeringCard:this};}
    },
    targetEffect:function(targetPos){
      let board=zones.gameBoard.board;
      let targetCell=board[targetPos.y][targetPos.x];


      if (targetCell && targetCell.friendly){
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
      if(!this.tags.includes("Tapped")){this.tags.push("Tapped");}
      if (this.friendly){data.gamePhase="effectSelect"; zones.p1Status.resolvingEffect={name:"Encore", triggeringCard:this};}
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
    }
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
