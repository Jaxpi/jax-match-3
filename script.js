window.onload = function () {
  var canvas = document.getElementById("viewport");
  var context = canvas.getContext("2d");
  var lastframe = 0;
  var drag = false;

  // GAME BOARD POSITION AND TILES
  var level = {
    x: 250,
    y: 113,
    columns: 9,
    rows: 9,
    tilewidth: 40,
    tileheight: 40,
    tiles: [],
    selectedtile: { selected: false, column: 0, row: 0 },
  };

  var tilecolors = [
    [213, 0, 0],
    [249, 168, 37],
    [255, 255, 0],
    [0, 200, 83],
    [48, 79, 254],
    [64, 196, 255],
    [170, 0, 255],
  ];

  var clusters = [];
  var moves = [];
  var currentmove = { column1: 0, row1: 0, column2: 0, row2: 0 };
  var gamestates = { init: 0, ready: 1, resolve: 2 };
  var gamestate = gamestates.init;
  var score = 0;
  var animationstate = 0;
  var animationtime = 0;
  var animationtimetotal = 0.3;
  var showmoves = false;
  var gameover = false;

    // BUTTONS
    var buttons = [
      { x: 30, y: 240, width: 150, height: 50, text: "New Game" },
      { x: 30, y: 300, width: 150, height: 50, text: "Show Moves" },
    ];

  // GAME INITIALIZATION FUNCTION
  function init() {
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseout", onMouseOut);

    for (var i = 0; i < level.columns; i++) {
      level.tiles[i] = [];
      for (var j = 0; j < level.rows; j++) {
        level.tiles[i][j] = { type: 0, shift: 0 };
      }
    }

    // CALL NEW GAME
    newGame();
    main(0);
  }

  function main(tframe) {
    window.requestAnimationFrame(main);

    update(tframe);
    render();
  }

  function update(tframe) {
    var dt = (tframe - lastframe) / 1000;
    lastframe = tframe;

    if (gamestate == gamestates.ready) {

      if (moves.length <= 0) {
        gameover = true;
      }
    } else if (gamestate == gamestates.resolve) {
      animationtime += dt;

      if (animationstate == 0) {
        if (animationtime > animationtimetotal) {
          findClusters();

          if (clusters.length > 0) {
            for (var i = 0; i < clusters.length; i++) {
              score += 100 * (clusters[i].length - 2);
            }

            removeClusters();

            animationstate = 1;
          } else {
            gamestate = gamestates.ready;
          }
          animationtime = 0;
        }
      } else if (animationstate == 1) {
        if (animationtime > animationtimetotal) {
          shiftTiles();

          animationstate = 0;
          animationtime = 0;

          findClusters();
          if (clusters.length <= 0) {
            gamestate = gamestates.ready;
          }
        }
      } else if (animationstate == 2) {
        if (animationtime > animationtimetotal) {
          swap(
            currentmove.column1,
            currentmove.row1,
            currentmove.column2,
            currentmove.row2
          );

          findClusters();
          if (clusters.length > 0) {
            animationstate = 0;
            animationtime = 0;
            gamestate = gamestates.resolve;
          } else {
            animationstate = 3;
            animationtime = 0;
          }

          findMoves();
          findClusters();
        }
      } else if (animationstate == 3) {
        if (animationtime > animationtimetotal) {
          swap(
            currentmove.column1,
            currentmove.row1,
            currentmove.column2,
            currentmove.row2
          );

          gamestate = gamestates.ready;
        }
      }

      findMoves();
      findClusters();
    }
  }

  function drawCenterText(text, x, y, width) {
    var textdim = context.measureText(text);
    context.fillText(text, x + (width - textdim.width) / 2, y);
  }


  function render() {
    drawFrame();

    context.fillStyle = "#000000";
    context.font = "24px Verdana";
    drawCenterText("Score:", 30, level.y + 40, 150);
    drawCenterText(score, 30, level.y + 70, 150);

    drawButtons();

    var levelwidth = level.columns * level.tilewidth;
    var levelheight = level.rows * level.tileheight;
    context.fillStyle = "#000000";
    context.fillRect(level.x - 4, level.y - 4, levelwidth + 8, levelheight + 8);


    renderTiles();
    renderClusters();

    if (showmoves && clusters.length <= 0 && gamestate == gamestates.ready) {
      renderMoves();
    }

    if (gameover) {
      context.fillStyle = "rgba(0, 0, 0, 0.8)";
      context.fillRect(level.x, level.y, levelwidth, levelheight);

      context.fillStyle = "#ffffff";
      context.font = "24px Verdana";
      drawCenterText(
        "Game Over!",
        level.x,
        level.y + levelheight / 2 + 10,
        levelwidth
      );
    }
  }

  function drawFrame() {
    context.fillStyle = "#d0d0d0";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#e8eaec";
    context.fillRect(1, 1, canvas.width - 2, canvas.height - 2);

    context.fillStyle = "#303030";
    context.fillRect(0, 0, canvas.width, 65);

    context.fillStyle = "#ffffff";
    context.font = "32px Verdana";
    context.fillText("Jax Match 3", 30, 42);
  }

  function drawButtons() {
    for (var i = 0; i < buttons.length; i++) {
      context.fillStyle = "#000000";
      context.shadowColor = "black";
      context.shadowBlur = 5;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.fillRect(
        buttons[i].x,
        buttons[i].y,
        buttons[i].width,
        buttons[i].height
      );

      context.fillStyle = "#ffffff";
      context.font = "18px Verdana";
      var textdim = context.measureText(buttons[i].text);
      context.fillText(
        buttons[i].text,
        buttons[i].x + (buttons[i].width - textdim.width) / 2,
        buttons[i].y + 30
      );
    }
  }

  function renderTiles() {
    for (var i = 0; i < level.columns; i++) {
      for (var j = 0; j < level.rows; j++) {
        var shift = level.tiles[i][j].shift;

        var coord = getTileCoordinate(
          i,
          j,
          0,
          (animationtime / animationtimetotal) * shift
        );

        if (level.tiles[i][j].type >= 0) {
          var col = tilecolors[level.tiles[i][j].type];

          drawTile(coord.tilex, coord.tiley, col[0], col[1], col[2]);
        }

        if (level.selectedtile.selected) {
          if (level.selectedtile.column == i && level.selectedtile.row == j) {
            drawTile(coord.tilex, coord.tiley, 255, 0, 0);
          }
        }
      }
    }
    if (
      gamestate == gamestates.resolve &&
      (animationstate == 2 || animationstate == 3)
    ) {
      var shiftx = currentmove.column2 - currentmove.column1;
      var shifty = currentmove.row2 - currentmove.row1;

      var coord1 = getTileCoordinate(
        currentmove.column1,
        currentmove.row1,
        0,
        0
      );
      var coord1shift = getTileCoordinate(
        currentmove.column1,
        currentmove.row1,
        (animationtime / animationtimetotal) * shiftx,
        (animationtime / animationtimetotal) * shifty
      );
      var col1 =
        tilecolors[level.tiles[currentmove.column1][currentmove.row1].type];

      var coord2 = getTileCoordinate(
        currentmove.column2,
        currentmove.row2,
        0,
        0
      );
      var coord2shift = getTileCoordinate(
        currentmove.column2,
        currentmove.row2,
        (animationtime / animationtimetotal) * -shiftx,
        (animationtime / animationtimetotal) * -shifty
      );
      var col2 =
        tilecolors[level.tiles[currentmove.column2][currentmove.row2].type];

      drawTile(coord1.tilex, coord1.tiley, 0, 0, 0);
      drawTile(coord2.tilex, coord2.tiley, 0, 0, 0);

      if (animationstate == 2) {
        drawTile(
          coord1shift.tilex,
          coord1shift.tiley,
          col1[0],
          col1[1],
          col1[2]
        );
        drawTile(
          coord2shift.tilex,
          coord2shift.tiley,
          col2[0],
          col2[1],
          col2[2]
        );
      } else {
        drawTile(
          coord2shift.tilex,
          coord2shift.tiley,
          col2[0],
          col2[1],
          col2[2]
        );
        drawTile(
          coord1shift.tilex,
          coord1shift.tiley,
          col1[0],
          col1[1],
          col1[2]
        );
      }
    }
  }

  function getTileCoordinate(column, row, columnoffset, rowoffset) {
    var tilex = level.x + (column + columnoffset) * level.tilewidth;
    var tiley = level.y + (row + rowoffset) * level.tileheight;
    return { tilex: tilex, tiley: tiley };
  }

  function drawTile(x, y, r, g, b) {
    context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    context.fillRect(x + 2, y + 2, level.tilewidth - 4, level.tileheight - 4);
  }

  function renderClusters() {
    for (var i = 0; i < clusters.length; i++) {
      var coord = getTileCoordinate(clusters[i].column, clusters[i].row, 0, 0);

      if (clusters[i].horizontal) {
        context.fillStyle = "white";
        context.fillRect(
          coord.tilex,
          coord.tiley,
          (clusters[i].length) * level.tilewidth,
          40
        );
      } else {
        context.fillStyle = "white";
        context.fillRect(
          coord.tilex,
          coord.tiley,
          40,
          (clusters[i].length) * level.tileheight
        );
      }
    }
  }

  function renderMoves() {
    for (var i = 0; i < moves.length; i++) {
      var coord1 = getTileCoordinate(moves[i].column1, moves[i].row1, 0, 0);
      var coord2 = getTileCoordinate(moves[i].column2, moves[i].row2, 0, 0);

      context.strokeStyle = "white";
      context.beginPath();
      context.moveTo(
        coord1.tilex + level.tilewidth / 2,
        coord1.tiley + level.tileheight / 2
      );
      context.lineTo(
        coord2.tilex + level.tilewidth / 2,
        coord2.tiley + level.tileheight / 2
      );
      context.stroke();
    }
  }

 // START NEW GAME
 function newGame() {
  score = 0;
  gamestate = gamestates.ready;
  gameover = false;

  createLevel();
  findMoves();
  findClusters();
}

function createLevel() {
  var done = false;

  while (!done) {
    for (var i = 0; i < level.columns; i++) {
      for (var j = 0; j < level.rows; j++) {
        level.tiles[i][j].type = getRandomTile();
      }
    }

    resolveClusters();
    findMoves();

    if (moves.length > 0) {
      done = true;
    }
  }
}

function getRandomTile() {
  return Math.floor(Math.random() * tilecolors.length);
}

function resolveClusters() {
  findClusters();

  while (clusters.length > 0) {
    removeClusters();
    shiftTiles();
    findClusters();
  }
}

function findClusters() {
  clusters = [];

  for (var j = 0; j < level.rows; j++) {
    var matchlength = 1;
    for (var i = 0; i < level.columns; i++) {
      var checkcluster = false;

      if (i == level.columns - 1) {
        checkcluster = true;
      } else {
        if (
          level.tiles[i][j].type == level.tiles[i + 1][j].type &&
          level.tiles[i][j].type != -1
        ) {
          matchlength += 1;
        } else {
          checkcluster = true;
        }
      }

      if (checkcluster) {
        if (matchlength >= 3) {
          clusters.push({
            column: i + 1 - matchlength,
            row: j,
            length: matchlength,
            horizontal: true,
          });
        }

        matchlength = 1;
      }
    }
  }

  for (var i = 0; i < level.columns; i++) {
    var matchlength = 1;
    for (var j = 0; j < level.rows; j++) {
      var checkcluster = false;

      if (j == level.rows - 1) {
        checkcluster = true;
      } else {
        if (
          level.tiles[i][j].type == level.tiles[i][j + 1].type &&
          level.tiles[i][j].type != -1
        ) {
          matchlength += 1;
        } else {
          checkcluster = true;
        }
      }

      if (checkcluster) {
        if (matchlength >= 3) {
          clusters.push({
            column: i,
            row: j + 1 - matchlength,
            length: matchlength,
            horizontal: false,
          });
        }

        matchlength = 1;
      }
    }
  }
}

// AVAILABLE MOVES
function findMoves() {
  moves = [];

  for (var j = 0; j < level.rows; j++) {
    for (var i = 0; i < level.columns - 1; i++) {
      swap(i, j, i + 1, j);
      findClusters();
      swap(i, j, i + 1, j);

      if (clusters.length > 0) {
        moves.push({ column1: i, row1: j, column2: i + 1, row2: j });
      }
    }
  }

  for (var i = 0; i < level.columns; i++) {
    for (var j = 0; j < level.rows - 1; j++) {
      swap(i, j, i, j + 1);
      findClusters();
      swap(i, j, i, j + 1);

      if (clusters.length > 0) {
        moves.push({ column1: i, row1: j, column2: i, row2: j + 1 });
      }
    }
  }

  clusters = [];
}

function loopClusters(func) {
  for (var i = 0; i < clusters.length; i++) {
    var cluster = clusters[i];
    var coffset = 0;
    var roffset = 0;
    for (var j = 0; j < cluster.length; j++) {
      func(i, cluster.column + coffset, cluster.row + roffset, cluster);

      if (cluster.horizontal) {
        coffset++;
      } else {
        roffset++;
      }
    }
  }
}

// AUTO CLEAR CLUSTERS
function removeClusters() {
  loopClusters(function (index, column, row, cluster) {
    level.tiles[column][row].type = -1;
  });

  for (var i = 0; i < level.columns; i++) {
    var shift = 0;
    for (var j = level.rows - 1; j >= 0; j--) {
      if (level.tiles[i][j].type == -1) {
        shift++;
        level.tiles[i][j].shift = 0;
      } else {
        level.tiles[i][j].shift = shift;
      }
    }
  }
}

function shiftTiles() {
  for (var i = 0; i < level.columns; i++) {
    for (var j = level.rows - 1; j >= 0; j--) {
      if (level.tiles[i][j].type == -1) {
        level.tiles[i][j].type = getRandomTile();
      } else {
        var shift = level.tiles[i][j].shift;
        if (shift > 0) {
          swap(i, j, i, j + shift);
        }
      }

      level.tiles[i][j].shift = 0;
    }
  }
}

function getMouseTile(pos) {
  var tx = Math.floor((pos.x - level.x) / level.tilewidth);
  var ty = Math.floor((pos.y - level.y) / level.tileheight);

  if (tx >= 0 && tx < level.columns && ty >= 0 && ty < level.rows) {
    return {
      valid: true,
      x: tx,
      y: ty,
    };
  }

  return {
    valid: false,
    x: 0,
    y: 0,
  };
}

function canSwap(x1, y1, x2, y2) {
  if (
    (Math.abs(x1 - x2) == 1 && y1 == y2) ||
    (Math.abs(y1 - y2) == 1 && x1 == x2)
  ) {
    return true;
  }

  return false;
}

function swap(x1, y1, x2, y2) {
  var typeswap = level.tiles[x1][y1].type;
  level.tiles[x1][y1].type = level.tiles[x2][y2].type;
  level.tiles[x2][y2].type = typeswap;
}

function mouseSwap(c1, r1, c2, r2) {
  currentmove = { column1: c1, row1: r1, column2: c2, row2: r2 };

  level.selectedtile.selected = false;

  animationstate = 2;
  animationtime = 0;
  gamestate = gamestates.resolve;
}

function onMouseMove(e) {
  var pos = getMousePos(canvas, e);

  if (drag && level.selectedtile.selected) {
    mt = getMouseTile(pos);
    if (mt.valid) {

      if (
        canSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row)
      ) {
        mouseSwap(
          mt.x,
          mt.y,
          level.selectedtile.column,
          level.selectedtile.row
        );
      }
    }
  }
}

function onMouseDown(e) {
  var pos = getMousePos(canvas, e);

  if (!drag) {
    mt = getMouseTile(pos);

    if (mt.valid) {
      var swapped = false;
      if (level.selectedtile.selected) {
        if (
          mt.x == level.selectedtile.column &&
          mt.y == level.selectedtile.row
        ) {
          level.selectedtile.selected = false;
          drag = true;
          return;
        } else if (
          canSwap(
            mt.x,
            mt.y,
            level.selectedtile.column,
            level.selectedtile.row
          )
        ) {
          mouseSwap(
            mt.x,
            mt.y,
            level.selectedtile.column,
            level.selectedtile.row
          );
          swapped = true;
        }
      }

      if (!swapped) {
        level.selectedtile.column = mt.x;
        level.selectedtile.row = mt.y;
        level.selectedtile.selected = true;
      }
    } else {
      level.selectedtile.selected = false;
    }

    drag = true;
  }

  for (var i = 0; i < buttons.length; i++) {
    if (
      pos.x >= buttons[i].x &&
      pos.x < buttons[i].x + buttons[i].width &&
      pos.y >= buttons[i].y &&
      pos.y < buttons[i].y + buttons[i].height
    ) {
      if (i == 0) {
        newGame();
      } else if (i == 1) {
        showmoves = !showmoves;
        buttons[i].text = (showmoves ? "Hide" : "Show") + " Moves";
      }
    }
  }
}

function onMouseUp(e) {
  drag = false;
}

function onMouseOut(e) {
  drag = false;
}

function getMousePos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(
      ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width
    ),
    y: Math.round(
      ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height
    ),
  };
}

// INITIAL START
init();

};
