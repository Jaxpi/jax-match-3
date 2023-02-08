window.onload = function () {
  var canvas = document.getElementById("viewport");
  var context = canvas.getContext("2d");

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


  
};
