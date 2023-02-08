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
};