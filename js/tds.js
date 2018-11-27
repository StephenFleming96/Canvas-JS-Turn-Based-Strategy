/*
	By Stephen Fleming 2017
	Produced for Gynvael's Winter GameDev Challenge 2017
	Licence: The code for this project is released on an educational basis and cannot be sold or used commerically without explicit written permission from the author (me).

	Some of it may not be best practice, or may not be pretty, but it had to be squished it into <20kb.
*/

(function() {
  "use strict";

  let canvas = document.getElementById("game"),
    canvasCtx = canvas.getContext("2d");

  let main = null; //invertal id for main loop fn

  const TILESIZE = 25,
    halfTile = TILESIZE / 2;

  const DEBUG = false,
    MAX_HIT_DAM = 33,
    SPAWN_RATE = 0.75,
    MOVES_PER_TURN = 5;

  const MOVE_TILE_COLOUR = "rgba(0, 126, 168, 0.44)",
    ATTACK_TILE_COLOUR = "rgba(225, 125, 125, 0.4)";
  const FRIENDLY_COLOUR = "blue",
    ENEMY_COLOUR = "red",
    DEBUG_COLOUR = "rgba(55, 125, 125, 0.3)",
    MOUSE_SELECT_DIS = 10;

  const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  //0=space 1=wall 2=floor 3=door 4=shield 5=darkwall 6=wallvdark
  const testMap = [
    //32 x 24 = 768
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      4,
      4,
      4,
      4,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0
    ],
    [
      0,
      1,
      2,
      2,
      2,
      2,
      2,
      3,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      1,
      1,
      1,
      0
    ],
    [
      0,
      1,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      0
    ],
    [
      0,
      1,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      1,
      1,
      3,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0
    ],
    [
      0,
      1,
      3,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      1,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      1,
      0,
      0,
      5,
      5,
      5,
      0,
      0,
      0
    ],
    [
      0,
      1,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      1,
      0,
      6,
      5,
      6,
      5,
      6,
      0,
      0
    ],
    [
      0,
      1,
      3,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      1,
      0,
      6,
      5,
      6,
      5,
      6,
      0,
      0
    ],
    [
      0,
      1,
      2,
      2,
      2,
      2,
      3,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      1,
      1,
      6,
      5,
      6,
      5,
      6,
      0,
      0
    ],
    [
      0,
      1,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      3,
      2,
      2,
      2,
      2,
      1,
      0,
      6,
      5,
      6,
      5,
      6,
      0,
      0
    ],
    [
      0,
      1,
      1,
      3,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      3,
      1,
      1,
      0,
      6,
      5,
      6,
      5,
      6,
      0,
      0
    ],
    [
      0,
      0,
      1,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      1,
      0,
      6,
      5,
      6,
      5,
      6,
      0,
      0
    ],
    [
      0,
      0,
      1,
      2,
      2,
      3,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      1,
      0,
      0,
      5,
      6,
      5,
      0,
      0,
      0
    ],
    [
      0,
      0,
      1,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      3,
      2,
      2,
      2,
      2,
      1,
      0,
      0,
      0,
      5,
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      1,
      2,
      2,
      1,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      1,
      0,
      0,
      6,
      0,
      6,
      0,
      0,
      0
    ],
    [
      0,
      0,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      6,
      0,
      6,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      1,
      2,
      2,
      3,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      1,
      1,
      1,
      2,
      2,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      2,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      1,
      2,
      2,
      2,
      2,
      1,
      1,
      0,
      0,
      1,
      2,
      2,
      2,
      2,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      1,
      2,
      2,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      2,
      2,
      2,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      1,
      2,
      2,
      1,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  ];

  //input manager
  let input = {
    mousePos: new Vec2D(0, 0),
    mouseClicked: false
  };

  //container for misc game values
  let gOC, gameObjectContainer; //alias for readability
  gOC = gameObjectContainer = {
    active: true,
    map: [],
    players: [new Player(true), new Player(false)],
    pyr: null,
    ai: null
  };

  //ui elements
  let ui = {
    bg: [
      { x: 19.5 * TILESIZE, y: 20.5 * TILESIZE, w: 350, h: 250, col: "#222" },
      { x: 19.8 * TILESIZE, y: 20.8 * TILESIZE, w: 300, h: 75, col: "#555" },
      { x: 27 * TILESIZE, y: 22.5 * TILESIZE, w: 100, h: 20, col: "#CCC" }
    ],
    txt: [
      {
        x: 20 * TILESIZE + halfTile,
        y: 23 * TILESIZE,
        val: "",
        colour: "white"
      },
      {
        x: 27 * TILESIZE + halfTile,
        y: 23.1 * TILESIZE,
        val: "END TURN",
        colour: "black"
      },
      {
        x: 20 * TILESIZE + halfTile,
        y: 22 * TILESIZE,
        val: "",
        colour: "white"
      }
    ],
    draw: function() {
      this.txt[0].val = `MOVES: ${gOC.pyr.movesLeft} of ${MOVES_PER_TURN}`;
      this.txt[2].val = `${gOC.ai.units.length} ENEMIES LEFT`;

      for (let i = 0; i < this.bg.length; i++) {
        let rct = this.bg[i];
        drawRect(rct.x, rct.y, rct.w, rct.h, rct.col);
      }

      for (let i = 0; i < this.txt.length; i++) {
        let txt = this.txt[i];
        drawText(txt.x, txt.y, txt.val, txt.colour);
      }
    }
  };

  function Vec2D(x, y) {
    this.x = x;
    this.y = y;

    //index pos
    this.idx = Math.floor(x / TILESIZE);
    this.idy = Math.floor(y / TILESIZE);

    this.distance = function(other) {
      let dis = Math.sqrt(
        Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2)
      );
      return dis;
    };

    this.plus = function(other) {
      return new Vec2D(this.x + other.x, this.y + other.y);
    };

    this.normalised = function() {
      let mag = Math.sqrt(this.x * this.x + this.y * this.y);
      return new Vec2D(this.x / mag, this.y / mag);
    };

    this.multiplyBy = function(val) {
      return new Vec2D(this.x * val, this.y * val);
    };

    this.minus = function(other) {
      return new Vec2D(this.x - other.x, this.y - other.y);
    };
  }

  function Entity(pos, fct, id) {
    this.pos = pos;
    this.vel = new Vec2D(0, 0);
    this.id = id;

    this.waypoint = null;
    this.moving = false;

    this.baseMoveSpeed = 3;
    this.moveSpeed = this.baseMoveSpeed;
    this.slowDownMultiplier = 0.5;

    this.endWaypointDis = 1;
    this.slowDownDis = 4;

    this.health = 100;
    this.faction = fct;

    this.render = false;
    this.colour = FRIENDLY_COLOUR;

    this.update = function() {
      if (this.health <= 0) return;

      if (this.moving) {
        let newV = this.waypoint.minus(this.pos); //dir to target
        this.vel = newV.plus(newV);

        this.vel = newV.multiplyBy(dt); //delta time
        this.vel = this.vel.normalised();
        this.vel = this.vel.multiplyBy(this.moveSpeed); //set move speed

        //stop moving if at point
        let disFromWP = this.pos.distance(this.waypoint);
        if (disFromWP < this.endWaypointDis) {
          this.waypoint = null;
          this.moving = false;

          if (!DEBUG) updateDrawEnemyUnits();

          return;
          //slow down if near
        } else if (disFromWP < this.slowDownDis) {
          this.moveSpeed = this.moveSpeed * this.slowDownMultiplier;
          //full speed
        } else {
          this.moveSpeed = this.baseMoveSpeed;
        }

        this.pos = this.pos.plus(this.vel); //move
      }
    };

    this.hit = function() {
      this.health -= Math.random() * MAX_HIT_DAM;
      if (this.health < 0) {
        this.render = false;
      }
    };

    this.setTargetPosition = function(pos) {
      this.moveSpeed = this.baseMoveSpeed;
      this.vel = new Vec2D(0, 0);

      let pt, tile;
      if (pos.x < this.pos.x - halfTile)
        //left
        pt = new Vec2D(this.pos.x - TILESIZE, this.pos.y);
      else if (pos.x > this.pos.x + halfTile)
        //right
        pt = new Vec2D(this.pos.x + TILESIZE, this.pos.y);
      else if (pos.y < this.pos.y)
        //top
        pt = new Vec2D(this.pos.x, this.pos.y - TILESIZE);
      else if (pos.y > this.pos.y)
        //bottom
        pt = new Vec2D(this.pos.x, this.pos.y + TILESIZE);

      tile = getTileAtPoint(pt);
      if (!tile.wall) {
        this.waypoint = new Vec2D(
          tile.pos.x * TILESIZE + halfTile,
          tile.pos.y * TILESIZE + halfTile
        );
        this.moving = true;

        return true;
      }

      return false;
    };

    this.draw = function() {
      if (!this.render || this.health <= 0) return;

      let qtTile = halfTile / 2;
      drawCircle(this.pos, qtTile, this.colour);

      if (this.health < 100) {
        drawRect(
          this.pos.x - halfTile,
          this.pos.y - 15,
          (this.health / 100) * TILESIZE,
          5,
          ENEMY_COLOUR
        );
      }
    };

    this.drawMovableTiles = function() {
      let tiles = [
        getTileAtPoint(new Vec2D(this.pos.x, this.pos.y - TILESIZE)),
        getTileAtPoint(new Vec2D(this.pos.x - TILESIZE, this.pos.y)),
        getTileAtPoint(new Vec2D(this.pos.x, this.pos.y + TILESIZE)),
        getTileAtPoint(new Vec2D(this.pos.x + TILESIZE, this.pos.y))
      ];

      for (let i = 0; i < tiles.length; i++) {
        if (!tiles[i].wall) {
          drawRect(
            tiles[i].pos.x * TILESIZE,
            tiles[i].pos.y * TILESIZE,
            TILESIZE,
            TILESIZE,
            MOVE_TILE_COLOUR
          );
        }
      }
    };

    this.AI = function() {
      //	get entities in room
      let utsInRoom = findEntitesInRoom(this.pos.idy, this.pos.idx),
        enemiesInRoom = [];

      //	find enemies
      utsInRoom.forEach(unit => {
        if (unit.faction != this.faction) enemiesInRoom.push(unit);
      });

      if (enemiesInRoom.length > 0) {
        //	shoot
        enemiesInRoom[0].hit();
      } else {
        //move to random position
        let selectedDir =
          directions[Math.floor(Math.random() * directions.length)];
        this.setTargetPosition(
          new Vec2D(
            this.pos.x + selectedDir[1] * TILESIZE,
            this.pos.y + selectedDir[0] * TILESIZE
          )
        );
      }
    };
  }

  function Player(isAi) {
    this.index = 0;
    this.units = [];
    this.selectedUnit = null;

    this.movesLeft = MOVES_PER_TURN;

    this.ai = isAi;

    this.update = function() {
      for (let u = 0; u < this.units.length; u++) {
        if (this.units[u].health <= 0) {
          this.units.splice(u, 1);
          u--;
        } else {
          this.units[u].update();
        }
      }
    };

    this.drawUnits = function() {
      for (let u = 0; u < this.units.length; u++) {
        this.units[u].draw();
      }
    };

    this.spawnUnit = function(pos, colour, pyr, id) {
      let ut = new Entity(pos, this.index, id);
      ut.colour = colour;

      if (pyr) ut.render = true;

      this.units[this.units.length] = ut;
    };

    this.AITurn = function() {
      //let unitI = 0;
      //while(this.movesLeft-- > 0) {
      //	this.units[(unitI++ % this.units.length)].AI();
      //}
      this.units.forEach(unt => {
        unt.AI();
      });
      this.movesLeft = MOVES_PER_TURN;
    };
  }

  function Tile(x, y, type) {
    this.pos = new Vec2D(x, y);
    this.type = type;

    this.colour = "yellow"; //debugging
    this.wall = true;

    this.setTileProperties = function() {
      switch (this.type) {
        case 0:
          this.colour = "black";
          break;
        case 1:
          this.colour = "#555";
          break;
        case 2:
          this.colour = "#AAA";
          this.wall = false;
          break;
        case 3:
          this.colour = "#5e7a73";
          this.wall = false;
          break;
        case 4:
          this.colour = "#5ec6ff";
          break;
        case 5:
          this.colour = "#333";
          break;
        case 6:
          this.colour = "#222";
          break;
      }
    };

    this.draw = function() {
      drawRect(
        this.pos.x * TILESIZE,
        this.pos.y * TILESIZE,
        TILESIZE,
        TILESIZE,
        this.colour
      );
    };

    this.collides = function(point) {
      let worldX = this.pos.x * TILESIZE,
        worldY = this.pos.y * TILESIZE;

      return (
        point.x > worldX &&
        point.x < worldX + TILESIZE &&
        point.y > worldY &&
        point.y < worldY + TILESIZE
      );
    };

    this.setTileProperties();
  }

  function drawRect(x, y, width, height, colour) {
    if (!pointIsOnScreen(x, y)) return;

    canvasCtx.beginPath();
    canvasCtx.rect(x, y, width, height);
    canvasCtx.fillStyle = colour;
    canvasCtx.fill();
    canvasCtx.closePath();
  }

  function drawCircle(pos, rad, colour) {
    if (!pointIsOnScreen(pos.x, pos.y)) return;

    canvasCtx.beginPath();
    canvasCtx.arc(pos.x, pos.y, rad, 0, Math.PI * 2, false);
    canvasCtx.fillStyle = colour;
    canvasCtx.fill();
    canvasCtx.closePath();
  }

  function drawText(x, y, text, colour) {
    if (!pointIsOnScreen(x, y)) return;

    canvasCtx.font = "15px Georgia";
    canvasCtx.fillStyle = colour;
    canvasCtx.fillText(text, x, y);
  }

  function pointIsOnScreen(x, y) {
    return x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height;
  }

  function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return new Vec2D(evt.clientX - rect.left, evt.clientY - rect.top);
  }

  function getNearestTileCentre(pos) {
    return new Vec2D(
      Math.floor(pos.x / TILESIZE) * TILESIZE + halfTile,
      Math.floor(pos.y / TILESIZE) * TILESIZE + halfTile
    );
  }

  function getTileAtPoint(pos) {
    if (
      pos.idx < 0 ||
      pos.idx > testMap[0].length ||
      pos.idy < 0 ||
      pos.idy > testMap.length
    )
      return null;
    else return gOC.map[pos.idy][pos.idx];
  }

  function onClick(e) {
    input.mouseClicked = true;

    if (e.button === 0) {
      let endTButton = ui.bg[2];
      if (
        input.mousePos.x >= endTButton.x &&
        input.mousePos.x <= endTButton.x + endTButton.w &&
        input.mousePos.y >= endTButton.y &&
        input.mousePos.y <= endTButton.y + endTButton.h
      ) {
        endTurn();

        return;
      }

      if (gOC.pyr.selectedUnit) gOC.pyr.selectedUnit = null;

      let ut;
      for (let u = 0; u < gOC.pyr.units.length; u++) {
        ut = gOC.pyr.units[u];
        if (ut.pos.distance(input.mousePos) < halfTile) {
          gOC.pyr.selectedUnit = ut;
          break;
        }
      }
    } else if (e.button === 2) {
      if (gOC.pyr.selectedUnit) {
        for (let i = 0; i < gOC.ai.units.length; i++) {
          let ut = gOC.ai.units[i];
          if (!ut.render) continue;

          //if (Math.floor(ut.pos.x / TILESIZE) === Math.floor(input.mousePos.x/TILESIZE) && Math.floor(ut.pos.y / TILESIZE) === Math.floor(input.mousePos.y / TILESIZE)) {
          if (
            ut.pos.idx === input.mousePos.idx &&
            ut.pos.idy === input.mousePos.idy
          ) {
            ut.hit();
            gOC.pyr.movesLeft--;
            return;
          }
        }

        if (gOC.pyr.selectedUnit.setTargetPosition(input.mousePos))
          gOC.pyr.movesLeft--;
      }
    }
  }

  function updateDrawEnemyUnits(pyr) {
    let frn = gOC.pyr.units,
      enm = gOC.ai.units;

    for (let i = 0; i < enm.length; i++) {
      if (enm[i].health > 0) {
        enm[i].render = false;
      }
    }

    for (let i = 0; i < frn.length; i++) {
      //friendly units
      let room = getTilesInRoom(frn[i].pos.idy, frn[i].pos.idx);

      for (let j = 0; j < enm.length; j++) {
        //enemy units
        for (let k = 0; k < room.length; k++) {
          //tiles in room
          if (enm[j].pos.idx === room[k][1] && enm[j].pos.idy === room[k][0]) {
            enm[j].render = true;
            break;
          }
        }
      }
    }
  }

  function findEntitesInRoom(x, y) {
    let tiles = getTilesInRoom(x, y),
      ret = [],
      tl = null;

    tiles.forEach(tl => {
      gOC.players.forEach(pyr => {
        pyr.units.forEach(unt => {
          //if (unt.pos.idx === tl[1] || unt.pos.idy === tl[0])
          //console.log(unt);

          if (unt.pos.idx === tl[1] && unt.pos.idy === tl[0]) {
            ret.push(unt);
          }
        });
      });
    });
    //}

    return ret;
  }

  //x,y = array index of centre search point
  //breadth first search of room
  function getTilesInRoom(x, y) {
    if (gOC.map[x][y].type !== 2) return [];

    let open = [[x, y]],
      closed = [],
      loop = 0,
      tile = null,
      neighbours = null;

    while (open.length > 0 && loop++ < 100) {
      tile = open[0];
      open.splice(0, 1);

      neighbours = tileNeighbours(tile[0], tile[1]);

      for (let i = 0; i < neighbours.length; i++) {
        let nb = neighbours[i];
        if (containsCoords(closed, nb[0], nb[1])) continue;

        if (!containsCoords(open, nb[0], nb[1])) open.push(nb);
      }

      closed.push(tile);
    }

    return closed;
  }

  function containsCoords(arr, x, y) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][0] === x && arr[i][1] === y) return true;
    }

    return false;
  }

  function tileNeighbours(x, y) {
    let ret = [];

    if (x < 1 || x > gOC.map.length || y < 1 || y > gOC.map[0].length)
      return ret;

    if (gOC.map[x][y].type !== 2)
      //type - not wall
      return ret;

    if (gOC.map[x - 1][y].type === 2) ret.push([x - 1, y]);

    if (gOC.map[x + 1][y].type === 2) ret.push([x + 1, y]);

    if (gOC.map[x][y - 1].type === 2) ret.push([x, y - 1]);

    if (gOC.map[x][y + 1].type === 2) ret.push([x, y + 1]);

    return ret;
  }

  function userInput() {
    if (input.mouseClicked) {
      input.mouseClicked = false;
    }
  }

  function setUp() {
    document.body.addEventListener("mousedown", onClick, false);
    canvas.addEventListener(
      "mousemove",
      function(evt) {
        input.mousePos = getMousePos(canvas, evt);
      },
      false
    );

    //disable right click menu
    canvas.oncontextmenu = function(e) {
      e.preventDefault();
    };

    for (let row = 0; row < testMap.length; row++) {
      let line = testMap[row];
      gOC.map[row] = [];

      for (let col = 0; col < line.length; col++) {
        let tile = new Tile(col, row, testMap[row][col]);

        gOC.map[row][col] = tile;
      }
    }

    let untId = 0;
    gOC.pyr = gOC.players[0];
    gOC.ai = gOC.players[1];
    gOC.pyr.units = [];
    gOC.ai.units = [];
    for (let i = 0; i < 3; i++) {
      gOC.pyr.spawnUnit(
        new Vec2D(562.5, 212.5 + i * TILESIZE),
        FRIENDLY_COLOUR,
        true,
        untId++
      );
    }

    //gOC.players[1].ai = true;
    gOC.players[1].index = 1;
    let enmPos = [
      [412.5, 187.5],
      [387.5, 187.5],
      [412.5, 312.5],
      [512.5, 62.5],
      [512.5, 362.5],
      [87.5, 362.5],
      [87.5, 87.5],
      [337.5, 412.5]
    ];
    for (let i = 0; i < enmPos.length; i++) {
      if (Math.random() <= SPAWN_RATE)
        gOC.ai.spawnUnit(
          new Vec2D(enmPos[i][0], enmPos[i][1]),
          ENEMY_COLOUR,
          DEBUG ? true : false,
          untId++
        );
    }

    console.log(gameObjectContainer);
  }

  function update() {
    userInput();

    for (let p = 0; p < gOC.players.length; p++) {
      if (gOC.players[p].units.length === 0) {
        gameOver();
        return;
      }

      gOC.players[p].update();
    }

    if (gOC.pyr.movesLeft <= 0) endTurn();
  }

  //rendering
  function draw() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    //let row, col;
    for (let r = 0; r < gOC.map.length; r++) {
      let row = gOC.map[r];
      for (let c = 0; c < row.length; c++) {
        row[c].draw();
      }
    }

    for (let p = 0; p < gOC.players.length; p++) {
      gOC.players[p].drawUnits();

      if (p === 0 && gOC.players[p].selectedUnit)
        gOC.players[p].selectedUnit.drawMovableTiles();
    }

    //room highlight
    let room = getTilesInRoom(input.mousePos.idy, input.mousePos.idx);
    for (let i = 0; i < room.length; i++) {
      drawRect(
        room[i][1] * TILESIZE,
        room[i][0] * TILESIZE,
        TILESIZE,
        TILESIZE,
        DEBUG_COLOUR
      );
    }

    //pointer highlight
    drawCircle(
      getNearestTileCentre(input.mousePos),
      halfTile,
      "rgba(225, 25, 50, 0.5)"
    );

    if (DEBUG)
      drawText(
        input.mousePos.x + halfTile,
        input.mousePos.y,
        input.mousePos.x / TILESIZE + "," + input.mousePos.y / TILESIZE,
        "white"
      );

    ui.draw();
  }

  function endTurn() {
    gOC.ai.AITurn();
    gOC.pyr.movesLeft = MOVES_PER_TURN;
  }

  //show win\loss, restart game
  function gameOver() {
    gOC.active = false;
    clearInterval(main); //stop looping

    ui.bg.push({
      x: canvas.width / 2 - 55,
      y: canvas.height / 2 - 30,
      w: 110,
      h: 60,
      col: "#222"
    });
    ui.bg.push({
      x: canvas.width / 2 - 50,
      y: canvas.height / 2 - 25,
      w: 100,
      h: 50,
      col: "#555"
    });

    let winTxt = gOC.pyr.units.length > 0 ? "YOU WIN!" : "YOU LOSE!";
    ui.txt.push({
      x: canvas.width / 2 - 33,
      y: canvas.height / 2 + 5,
      val: winTxt,
      colour: "white"
    });
    ui.draw();

    setTimeout(function() {
      ui.bg.pop();
      ui.bg.pop();
      ui.txt.pop();
      setUp();

      main = setInterval(mainFn, dt);
    }, 1000);
  }

  setUp();

  //'main loop' - called every 10ms
  let fps = 60;
  let dt = 1000 / fps;
  let mainFn = function() {
    update();
    draw();
  };
  main = setInterval(mainFn, dt);
})();
