
sheetProj.view.sheetLogic = {
  setupUserInterface: function () {
    assetCache.fillCache();
    enableDragging();
    }
};

function enableDragging(){
  $("html").on("dragover", function(event) {
  event.preventDefault();
  event.stopPropagation();

  });

  $("html").on("dragleave", function(event) {
    event.preventDefault();
    event.stopPropagation();

  });

  $("html").on("drop", function(event) {
    event.preventDefault();
    event.stopPropagation();

  });
}

function gamesBegin(){

  data.setEnemy();

  gameDisplay.updateDisplay();
  gamePlay.setDecks();
  gameUI.setClicks();

}

let gameDisplay={

  updateDisplay:function(){
    let display=``;
    // let layers=data.getLayers();
    //
    // if (!layers){
    //   return;
    // }


    display+=`<canvas id="gameBoardCards" width="${data.gridStats.size*4}" height="${data.gridStats.size*4}" style="position: absolute; margin:auto; left:0; right:0; bottom:0; top: 0; z-index: 0;"></canvas>`;



    //the gridlayer helps simplify clicking, etc.
    display+=`<canvas id="gridLayer"  width="${data.gridStats.size*4}" height="${data.gridStats.size*4}" style="position: absolute; margin:auto; left:0; right:0; bottom:0; top: 0; z-index: 1;"></canvas>`;

    //the discover Layer
    display+=`<div id="discoverLayer" class="hidden"></div>`
    $("#canvasContainer").html(display);
    $("#canvasContainer").height(data.gridStats.size*4);
    $("#canvasContainer").width(data.gridStats.size*4);
    $("#canvasContainer").css("margin", data.gridStats.size);
    $("#canvasContainer").css("margin-left", data.gridStats.size*2);
    $("#gridLayer").on("click", gamePlay.clickBoard);
    // $("#gridLayer").on("mouseenter", gamePlay.hoverBoard);
    // $("#gridLayer").on("mouseleave", gamePlay.hoverBoard);
    $("#gridLayer").on( "mousemove",gamePlay.hoverBoard);

    gameDisplay.createGrid();
    gameDisplay.setLayerImages();
  },
  createGrid:function(){
    // if (!data.gridStats.visible){
    //   return;
    // }

    let canvas = $("#gridLayer")[0];
    let ctx = canvas.getContext('2d');
    let cellSize=data.gridStats.size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.crossOrigin = "Anonymous";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#FF0000";
    for (let y=0, cHeight=canvas.height; y<cHeight; y+=cellSize){
      for (let x=0, cWidth=canvas.width; x<cWidth; x+=cellSize){
        ctx.rect(x, y, cellSize, cellSize);

      }
    }
    ctx.stroke();
  },
  setCardImages:function(){
    let gameBoard=data.getGameBoard();
    let rows=gameBoard.length;
    let cols=gameBoard[0].length;
    let cards=[];
    let cellSize=data.gridStats.size;
    for (let i=0; i<rows; i++){
      for (let j=0; j<cols; j++){
        if (gameBoard[i][j]){
          cards.push({cardStats:gameBoard[i][j], x:j, y:i});
        }
      }
    }

    let promisedCards=[];
    cards.forEach((card)=>{

        promisedCards.push(
          new Promise(function (resolve, reject){


            let img;
            if (card.cardStats.tags.includes("Illusion")){
              img=  assetCache.cache["CardBacks"]["cardBackBlack"];
            }
            else{
              img=  assetCache.cache["Cards"][card.cardStats.name];
            }
            // let img=  assetCache.cache["Cards"][card.cardStats.name];

            if (img===undefined){
              console.log(img);
              console.log(assetCache.cache);
              console.log(card);
            }

            // if(!card.cardStats.friendly){
            //   var rgbks = generateRGBKs( img );
            //   img = generateTintImage( img, rgbks, 200, 50, 100 );
            // }



            resolve({img:img,xPos:card.x*data.gridStats.size,yPos:card.y*data.gridStats.size,width:cellSize,height:cellSize, friendly:card.cardStats.friendly, cardInfo:card.cardStats});

          })
        );


    });

    Promise.all([...promisedCards]).then(
      function(obj){

        let canvas = $(`#gameBoardCards`)[0];
        let ctx = canvas.getContext('2d');
        let cellSize=data.gridStats.size;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let charmImg;

        canvas.crossOrigin = "Anonymous";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        //load images THEN draw images

        for (let i=0, len=obj.length; i<len; i++){

          if (!obj[i].img){

            continue;
          }

            if(obj[i].cardInfo.tags.includes("Tapped")){
              ctx.save();
              ctx.translate(obj[i].xPos+obj[i].width/2, obj[i].yPos+obj[i].height/2);
              ctx.rotate(Math.PI / 2);
              ctx.translate(-(obj[i].xPos+obj[i].width/2), -(obj[i].yPos+obj[i].height/2));}
          // draw your object

            ctx.drawImage(obj[i].img, 0, 0, obj[i].img.width,    obj[i].img.height*.7,
                          obj[i].xPos, obj[i].yPos,obj[i].width, obj[i].height);

            //add ability charms
            if(!obj[i].cardInfo.tags.includes("Illusion")){
              if (obj[i].cardInfo.abilitySlot1){
                if(obj[i].cardInfo.abilitySlot1.type=="Passive"){
                  charmImg=assetCache.cache["CardBacks"]["passiveSymbol"];

                }else{
                  charmImg=assetCache.cache["CardBacks"]["tapSymbol"];
                }
                ctx.drawImage(charmImg, 0, 0, charmImg.width, charmImg.height,
                              obj[i].xPos, obj[i].yPos+(obj[i].height/5)*4,obj[i].width/5, obj[i].height/5);

              }
              if(obj[i].cardInfo.abilitySlot2){
                if(obj[i].cardInfo.abilitySlot2.type=="Passive"){
                  charmImg=assetCache.cache["CardBacks"]["passiveSymbol"];

                }else{
                  charmImg=assetCache.cache["CardBacks"]["tapSymbol"];
                }
                ctx.drawImage(charmImg, 0, 0, charmImg.width, charmImg.height,
                              obj[i].xPos+(obj[i].width/5)*4, obj[i].yPos+(obj[i].height/5)*4,obj[i].width/5, obj[i].height/5);
              }
            }


            if(!obj[i].friendly){
              var imgData = ctx.getImageData(obj[i].xPos, obj[i].yPos, obj[i].width, obj[i].height);

                  // invert colors

                  for (let i = 0; i < imgData.data.length; i += 4) {
                    imgData.data[i] = 255-imgData.data[i];
                    imgData.data[i + 1] = 255-imgData.data[i + 1];
                    imgData.data[i + 2] = 255-imgData.data[i + 2];
                    imgData.data[i + 3] = 255;
                  }

                  //apply a spooky red tint
                  // for (let i = 0; i < imgData.data.length; i += 4) {
                  //   imgData.data[i] = imgData.data[i]+25;
                  //   imgData.data[i + 1] = imgData.data[i + 1]-30;
                  //   imgData.data[i + 2] = imgData.data[i + 2]-30;
                  //   imgData.data[i + 3] = 255;
                  // }

                  ctx.putImageData(imgData, obj[i].xPos, obj[i].yPos);

            }

            if(obj[i].cardInfo.tags.includes("Tapped")){
              ctx.restore();}

          // else{
          //
            // var rgbks = generateRGBKs( obj[i].img );
            // var tintImg = generateTintImage( obj[i].img, rgbks, 200, 50, 100 );
          //
          //
          //   // ctx.fillStyle = "black";
          //   // ctx.fillRect( 0, 0, 100, 100 );
          //
          //   // ctx.drawImage( tintImg, 50, 50 );
          //   ctx.drawImage(tintImg, 0, 0, tintImg.width,    tintImg.height,
          //                 obj[i].xPos, obj[i].yPos,obj[i].width, obj[i].height);
          // }




        }







    }).catch(function(err) {
      console.log(err);
      console.log(assetCache.cache); // some coding error in handling happened
    });;


  },
  setLayerImages:function(){
    gameDisplay.setCardImages();
  },


};

let gamePlay={
  checkVictory:function(){
    //check if ally unit is in enemy home row
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
      if (board[0][i] && board[0][i].friendly && !board[0][i].tags.includes("Unstoppable")){
        playerWins();
      }
    }

    function playerWins(){
      if ((enemyEndgame && friendlyEndgame) || (!enemyEndgame && !friendlyEndgame)){
        data.gamePhase="PlayerVictory!";
        alert ("You've won!");
      }else{
        data.gamePhase="EnemyVictory!";
        alert ("You have fallen prey to the Red Jester's machinations.  Your victory has been corrupted into a loss!");
      }

    }

  },
  setDecks:function(){
    let rawDeck=data.getPlayerDeck();

    zones.p1Deck.deck=[];
    zones.p2Deck.deck=[];
    let playerDeck=zones.p1Deck.deck;
    let playerHand=zones.p1Hand.heldCards;
    let enemyHand=zones.p2Hand.heldCards;
    let enemyDeck=zones.p2Deck.deck;
    let enemy=data.getEnemy();



    rawDeck.forEach((card)=>{
      //later this will pass additional information about the cards passive, tap ability, etc.
      let cardInfo=cardLibrary[card];

      playerDeck.unshift(new Construct.Card(card, true, cardInfo.abilities));

      if (!playerHand.length){

        if (playerDeck[0].hasPassive){
          playerHand.push(playerDeck.splice(0,1)[0]);
        }
      }
    });
    randomizeEnemyDeck();
    enemy.deck.forEach((card)=>{
      //later this will pass additional information about the cards passive tap ability, etc.
      let cardInfo=cardLibrary[card];
      enemyDeck.unshift(new Construct.Card(card, false, cardInfo.abilities));
      enemyDeck[0].flipY();
      if (!enemyHand.length){
        if (enemyDeck[0].hasPassive){

          enemyHand.push(enemyDeck.splice(0,1)[0]);
        }
      }
    });

    // zones.p1Deck.deck=playerDeck;
    //later the enemy deck will be set as well
    //todo place commander into each player's hand

    function randomizeEnemyDeck(){
      let collection=Object.keys(cardLibrary);
      collection=collection.filter((card)=>{
        return !cardLibrary[card].hasPassive;
      });
      enemy.deck=[];
      enemy.deck.push(validEnemyCommanders[ci.dieRoll(validEnemyCommanders.length)-1]);
      for (let i=0; i<8; i++){
        enemy.deck.push(collection.splice(ci.dieRoll(collection.length)-1, 1)[0]);
      }
    }
  },
  drawHand:function(){
    let deck=zones.p1Deck.deck;
    let enemyDeck=zones.p2Deck.deck;
    // let enemy=enemies[localStorage.getItem("currentEnemy")];
    // let enemy=theEnemy;
    let enemy=data.getEnemy();
    let playerCards=4;
    let enemyCards=4;
    if (!data.firstTurn){
      alert("Not so fast.  You need to flip to find out who goes first before you draw your hand.");
      return;
    }

    for (let i=0; i<zones.p1Hand.heldCards.length; i++){
      if (zones.p1Hand.heldCards[i].tags.includes("PiercerOfVeils")){
        playerCards+=2;
        break;
      }
    }

    for (let i=0; i<zones.p2Hand.heldCards.length; i++){

      if (zones.p2Hand.heldCards[i].tags.includes("PiercerOfVeils")){
        enemyCards+=2;
        break;
      }
    }

    for (let i=0; i<playerCards; i++){
      try{
        if(!deck.length){
          throw "No more cards in deck!";
        }
        zones.p1Hand.heldCards.push(deck.splice(ci.dieRoll(deck.length)-1, 1)[0]);
      }
      catch(error){console.log(error);}



    }

    for (let i =0; i<enemyCards; i++){
      try{
        if(!enemyDeck.length){
          throw "No more cards in deck!";
        }
        zones.p2Hand.heldCards.push(enemyDeck.splice(ci.dieRoll(enemyDeck.length)-1, 1)[0]);
      }
      catch(error){}
    }

    for (let i=0; i<zones.p1Hand.heldCards.length; i++){
      if (zones.p1Hand.heldCards[i].tags.includes("Illusionist")){
        zones.p1Hand.heldCards.forEach((card)=>{
          card.tags.push("Illusion");
        })
        break;
      }


    }

    for (let i=0; i<zones.p2Hand.heldCards.length; i++){
      if (zones.p2Hand.heldCards[i].tags.includes("Illusionist")){
        zones.p2Hand.heldCards.forEach((card)=>{
          card.tags.push("Illusion");
        })
        break;
      }


    }

    gameUI.showHand();
    alert("Drag cards from your hand onto the first row of the board...*ahem*  you may need to scroll down a touch");
    $("#playerDeck").off("click.setup");
    if(data.firstTurn=="enemy"){
      enemy.placeStartRow();
    }
  },
  dragFromHand:function(event){
    data.floatingCard=event.target.dataset.position;
    // $("#gridLayer").off("drop.handDrop");

    $("#gridLayer").on("drop.handDrop", event.target.dataset, gamePlay.dropFromHand);
  },
  dropFromHand:function(event){

    $("#gridLayer").off("drop.handDrop");
    if (!event.data.position){
      return
    }else{
      let rect=event.target.getBoundingClientRect();
      let hand=zones.p1Hand.heldCards;
      let enemyHand=zones.p2Hand.heldCards;
      let x=Math.floor((event.clientX-rect.left)/data.gridStats.size);
      let y=Math.floor((event.clientY-rect.top)/data.gridStats.size);

      let board=zones.gameBoard.board;
      let targetCell=board[y][x];
      let enemy=data.getEnemy();

      //checks if cell is empty and that is in bottom row, p1's hand row

      if (!targetCell && y==3){
        board[y][x]=hand.splice([event.data.position], 1)[0];
        board[y][x].position={x:x, y:y};
        gameDisplay.setCardImages();
        gameUI.showHand();
      }else{
        //we can play a sound effect here to show that a card went into the wrong place
      }
      if (hand.length==0 || (board[3][0] && board[3][1] && board[3][2] &&board[3][3])){
        //todo, shuffle excess cards
        $("#playerHandRow").addClass("hidden");
        while (hand.length){
          zones.p1Deck.deck.push(hand.splice(0, 1)[0]);
        }
        if(data.firstTurn=="friendly"){
          enemy.placeStartRow();

          eventHandler.announce("PlayerTurnStart");
          data.gamePhase="unitSelect";
        }else{

          enemy.takeAction(enemy.chooseAction());
        }


      }


    }

  },
  clickBoard:function(event){
    let gamePhase=data.gamePhase;
    let rect=event.target.getBoundingClientRect();
    let x=Math.floor((event.clientX-rect.left)/data.gridStats.size);
    let y=Math.floor((event.clientY-rect.top)/data.gridStats.size);
    let allies=data.getActiveUnits().allies;
    let board=zones.gameBoard.board;
    let targetCell=board[y][x];
    let activeCell=data.activeCell;

    let enemy=data.getEnemy();

    let actionCompletedBy=false;
    let solMiActive=false;

    let tapAbility;
    console.log(gamePhase);

    allies.forEach((ally)=>{
      if (ally.tags.includes("Strive")){
        solMiActive=true;
      }
    });
    switch(gamePhase){
      case "unitSelect":
        if (targetCell){

          if (targetCell.friendly){

            data.gamePhase="unitAction";
            data.activeCell={x:x, y:y};
          }
        }
        break;
      case "unitAction":

        //later we'll deal with abilities and junk

        //picking a different unit to move
        if (targetCell){
          console.log(targetCell);
        }
        if (targetCell.friendly){

          data.activeCell={x:x, y:y};
        }

        //player is double clicking a single card, activate ability if possible
        if (targetCell && targetCell.hasTap && activeCell.x==x && activeCell.y==y ){
          if (targetCell.abilitySlot1.type=="Tap"){
            tapAbility=tapLibrary[targetCell.abilitySlot1.name];
          }
          else if(targetCell.abilitySlot2.type=="Tap"){
            tapAbility=tapLibrary[targetCell.abilitySlot2.name];

          }

          if(tapAbility.isValid.call(targetCell)){
            if(targetCell.tags.includes("Illusion")){
              targetCell.tags.splice(targetCell.tags.indexOf("Illusion"),1);
            }

            tapAbility.effect.call(targetCell);

            if (data.gamePhase=="unitAction"){actionCompletedBy=targetCell;}
          }else{console.log("Ability not currently usable");}
        }


        //target cell is right above active cell, attempt to MOVE

        if (isMoveLegal(board[activeCell.y][activeCell.x])){


            board[y][x]=board[activeCell.y].splice(activeCell.x, 1, false)[0];
            board[y][x].position={x:x, y:y};

            actionCompletedBy=board[y][x];
            // gameDisplay.setCardImages();

        }
        else if(isCaptureLegal(board[activeCell.y][activeCell.x])){


            zones.p1Captured.capturedUnits.push(board[y].splice(x,1,false)[0]);
            board[y][x]=board[activeCell.y].splice(activeCell.x, 1, false)[0];

            actionCompletedBy=board[y][x];
            actionCompletedBy.position={y:y, x:x};
            if(actionCompletedBy.tags.includes("Illusion")){
              actionCompletedBy.tags.splice(actionCompletedBy.tags.indexOf("Illusion"),1);
            }

            if(actionCompletedBy.tags.includes("FromShadow")){
              if(window.confirm("Use 'From Shadow'?")){
                board[activeCell.y][activeCell.x]=board[y].splice(x, 1, false)[0];
                board[activeCell.y][activeCell.x].position={y:activeCell.y, x:activeCell.x};
              }
            }


            if(actionCompletedBy.tags.includes("Frenzy")){
              if(zones.p1Status.frenzyExhaust){
                zones.p1Status.frenzyExhaust=false;

              }
              else{
                  zones.p1Status.frenzyExhaust=true;
                  if(zones.p1Status.frenzyCounter===false){
                    alert("You are frenzying...win quickly!");
                    zones.p1Status.frenzyCounter=3;
                  }
                  actionCompletedBy=false;
                  gameDisplay.setCardImages();
                  gamePlay.checkVictory();

              }
            }else{
              if(zones.p1Status.frenzyExhaust){
                zones.p1Status.frenzyExhaust=false;

              }
            }

            if(actionCompletedBy.tags.includes("TrialOfWings") && !actionCompletedBy.tags.includes("TrialComplete")){actionCompletedBy.tags.push("TrialComplete");}






            // gameDisplay.setCardImages();


        }



        //target cell is in NW or NE of cell meaning a potential CAPTURE
        // else if(Math.abs(activeCell.x-x)==1 && activeCell.y-y==1){



        break;

      case "effectSelect":
      console.log("Effect being targeted");
      console.log(zones.p1Status.resolvingEffect);
        if(tapLibrary[zones.p1Status.resolvingEffect.name].targetEffect.call(zones.p1Status.resolvingEffect.triggeringCard, {x:x, y:y})){
          console.log("effect went through");
          if(tapLibrary[zones.p1Status.resolvingEffect.name].passTurn && !solMiActive){
            console.log("passing turn");
            actionCompletedBy=zones.p1Status.resolvingEffect.triggeringCard;
          }else{
            console.log("holding turn");
            data.gamePhase="unitSelect";
          }

        }else{
          console.log(tapLibrary[zones.p1Status.resolvingEffect.name].targetEffect.call(zones.p1Status.resolvingEffect.triggeringCard, {x:x, y:y}));
        };
        console.log(zones);

        break;



      default:
        console.log(`Clicking does nothing during the ${gamePhase} phase`);
        break;


    }


    if(actionCompletedBy){
      if(actionCompletedBy.tags.includes("Parry") && actionCompletedBy.tags.includes("Defended")){
        console.log("removing Defended...");
        actionCompletedBy.tags.splice(actionCompletedBy.tags.indexOf("Defended"),1);
      }

      console.log(actionCompletedBy);

      gamePlay.checkVictory();
      eventHandler.announce("EnemyTurnStart");
      data.gamePhase="enemyTurn";
    }
    gameDisplay.setCardImages();

    if (data.gamePhase=="enemyTurn"){

      enemy.takeAction(enemy.chooseAction());
    }

    function isMoveLegal(movingUnit){

      let move;

      if (!targetCell){

        for (let i=0, len=movingUnit.moveRanges.length; i<len; i++){
          move=movingUnit.moveRanges[i];

          if (activeCell.x+move.x==x && activeCell.y+move.y==y){

            return true;
          }
        }

      }

      return false;

    }

    function isCaptureLegal(cappingUnit){

      let cap;
      let oldCell={x:activeCell.x, y:activeCell.y};
      if (targetCell && targetCell.friendly===false && !targetCell.tags.includes("Defended") && !targetCell.tags.includes("Unstoppable")){

        for (let i=0, len=cappingUnit.captureRanges.length; i<len; i++){
          cap=cappingUnit.captureRanges[i];
          if (oldCell.x+cap.x==x && oldCell.y+cap.y==y){
            return true;
          }
        }

      }

      return false;

    }
  },
  playerConcede:function(){
    data.gamePhase="EnemyVictory!";
    alert ("You've conceded the round, enemy wins!");

  },
  flipForFirst:function(){
    let players=["friendly", "enemy"];
    // let enemy=enemies[localStorage.getItem("currentEnemy")];
    let enemy=data.getEnemy();
    data.firstTurn= players[ci.dieRoll(players.length)-1];
    // for (let i=0; i<50; i++){
    //   let roll=ci.dieRoll(players.length)-1;
    //   console.log(roll);
    //   console.log(players);
    //   console.log(players[roll]);
    // }

    if (data.firstTurn=="friendly"){
      alert("You won the flip!  You play first.");
    }else{
      alert("You lost the flip!  Opponent plays first.");

    }
  },
  hoverBoard:function(event){
    let gamePhase=data.gamePhase;
    let rect=event.target.getBoundingClientRect();
    let x=Math.floor((event.clientX-rect.left)/data.gridStats.size);
    let y=Math.floor((event.clientY-rect.top)/data.gridStats.size);

    let board=zones.gameBoard.board;
    let targetCell=board[y][x];

    if (targetCell && (!data.displayedCard || data.displayedCard.name!=targetCell.name) && (!targetCell.tags.includes("Illusion") || targetCell.friendly)){
      data.displayedCard=targetCell;
      gameUI.displayCard();
    }
  },
  launchDiscover:function(cardArray){
    //card array is an array of objects [{cardURL:"url", cardClick:"functionToCall", arguments:[Array, of, arguments, for, cardClick]}]
    let discHtml=``;
    let closeLayer=function(){
      $("#discoverLayer").addClass("hidden");

    };
    //throwing up an overlay on top of board, preventing clicks.
    $("#discoverLayer").removeClass("hidden");
    cardArray.forEach((card, index)=>{
      discHtml+=`<img id="discCard${index}" class="discoverCard" src="${card.cardURL}"></img>`;
    });





    $("#discoverLayer").html(discHtml);
    $(".discoverCard").on("click", closeLayer);
    cardArray.forEach((card, index)=>{
      if (!card.cardClick){
        $(`#discCard${index}`).off("click");
      }
    });
    cardArray.forEach((card, index)=>{
      $(`#discCard${index}`).on("click", card.arguments, card.cardClick);
    });


    //overlay has a set of clickable cards
    //each clickable card has its own function
  },
  reset:function(){
      location.reload();
    // gamesBegin();
  }

}

let deckBuilder={
  launchDeckBuilder:function(){
    deckBuilder.fillDeckZone();
    deckBuilder.fillCollectZone();
    $("#deckbuilderScreen").removeClass("hidden");

  },
  exitDeckBuilder:function(){
    $("#deckbuilderScreen").addClass("hidden");
    gamePlay.reset();
  },
  addToDeck:function(name){
    let deck=data.getPlayerDeck();


    // if (cardLibrary[name].hasPassive && hasCommander){
    //   alert("My apologies, however while you have been granted a number of privledges as recompense for my...unfortunate...inability to find your personal legend some rules must still be followed.  Your deck already has a commander, if you'd like to add a new one to your deck you must remove the first.  Commanders are the only cards with passive abilities, noted by the pink infinity symbol because they are 'forever' active.");
    // }
    // else{
      if (name=="AsterLenne"){
       alert("13-25 4-5-1-18 8-15-19-20, 12-9-19-20-5-14 1 12-9-20-20-12-5 8-1-18-4-5-18");
       console.log("7-15 20-15 23-8-5-18-5 20-8-5 18-9-22-5-18 15-14-3-5 19-16-18-15-21-20-5-4 6-9-22-5 8-5-1-4-19 1-14-4 6-9-22-5 13-15-21-20-8-19");
      }
      deck.push(name);
      data.setPlayerDeck(deck);
      deckBuilder.fillDeckZone();
      deckBuilder.fillCollectZone();
    // }

  },
  removeFromDeck:function(name){
    let deck=data.getPlayerDeck();
    if (deck.includes(name)){deck.splice(deck.indexOf(name), 1);}
    data.setPlayerDeck(deck);
    deckBuilder.fillDeckZone();
    deckBuilder.fillCollectZone();
  },
  fillDeckZone:function(){
    let deck=data.getPlayerDeck();
    let deckHtml="";
    deck.forEach((card)=>{
      deckHtml+=`<img class="cardInHand" src="${cardLibrary[card].cardArt}" onclick="deckBuilder.removeFromDeck('${card}')"></img>`;
    });

    $("#deckZone").html(deckHtml);
  },
  fillCollectZone:function(){
    let collection=Object.keys(cardLibrary);
    let deck=data.getPlayerDeck();
    let collectHtml="";
    let hasCommander=false;
    for (let i=0, len=deck.length; i<len; i++){
      if (cardLibrary[deck[i]].hasPassive){
        hasCommander=true;
        break;
      }
    }
    collection.forEach((card)=>{
      if (cardLibrary[card].hasPassive && hasCommander){
        return;
      }
      if (!deck.includes(card)){
        collectHtml+=`<img class="cardInHand" src="${cardLibrary[card].cardArt}" onclick="deckBuilder.addToDeck('${card}')"></img>`;
      }
    });

    $("#collectionZone").html(collectHtml);
  }
}

let gameUI={
  setClicks:function(){
    $("#playerDeck").off();
    $("#playerDeck").on("click.setup", gamePlay.drawHand);
    $(".discardDeck").off("click");
    $(".captureDeck").off("click");
    $(".discardDeck").on("click", gameUI.showDiscard);
    $(".captureDeck").on("click", gameUI.showCapture);

  },
  showHand:function(){
    let handState=``;
    let hand=zones.p1Hand.heldCards;

    hand.forEach((card, index)=>{
      handState+=`<img  data-position="${index}" class="cardInHand" src="${cardLibrary[card.name].cardArt}"></img>`;
      // handState+=`<img class="cardInHand" style="background-image:url(${cardLibrary[card.name].cardArt})"></img>`;
    });

    $("#playerHandRow").html(handState);
    $("#playerHandRow").removeClass("hidden");


    $(".cardInHand").on("dragstart", gamePlay.dragFromHand);

  },
  showDiscard:function(event){

    let allegiance=event.target.dataset.allegiance;
    let discardPile = allegiance=="friendly" ? zones.p1Discard.discardedUnits:zones.p2Discard.discardedUnits;

    let html=`<button class="closeButton" onclick="gameUI.hideDiscard()"></button>`;
    discardPile.forEach((card, index)=>{
      html+=`<img  data-position="${index}" class="discardedCard" src="${cardLibrary[card.name].cardArt}"></img>`;
      // handState+=`<img class="cardInHand" style="background-image:url(${cardLibrary[card.name].cardArt})"></img>`;
    });

    $("#discardZone").html(html);
    $("#discardZone").removeClass("hidden");
  },
  showCapture:function(event){

    let allegiance=event.target.dataset.allegiance;
    let capturePile = (allegiance=="friendly") ? zones.p1Captured.capturedUnits:zones.p2Captured.capturedUnits;

    let html=`<button class="closeButton" onclick="gameUI.hideCapture()"></button>`;
    capturePile.forEach((card, index)=>{
      html+=`<img  data-position="${index}" class="captiveCard" src="${cardLibrary[card.name].cardArt}"></img>`;
      // handState+=`<img class="cardInHand" style="background-image:url(${cardLibrary[card.name].cardArt})"></img>`;
    });

    $("#captureZone").html(html);
    $("#captureZone").removeClass("hidden");
  },
  hideDiscard:function(){
    $("#discardZone").html("");
    $("#discardZone").addClass("hidden");
  },
  hideCapture:function(){
    $("#captureZone").html("");
    $("#captureZone").addClass("hidden");
  },
  displayCard:function(){
    if (!data.displayedCard){
      return
    }

    $("#hoveredCard").attr("src", cardLibrary[data.displayedCard.name]["cardArt"]);

  }
}

// function setClicks(){
//   $("#resetButton").click(resetStorage);
//
//   $("#charPortrait").click({element:'#charOverlay'},toggleDisplay);
//   $("#exitPageButton").click({element:'#charOverlay'},toggleDisplay);
//   $("#skillsPageButton").click({page:'#skillSheet'},turnPage);
//   $("#statsPageButton").click({page:'#statSheet'},turnPage);
//
//   $(".tabHead").click(collapseTabBody);
// }
