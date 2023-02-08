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

};
