var DB = (function () {
  const _DB_ = {
    set: (key, data, onError = null) => {
      onError = onError ?? ((error) => console.error(error));

      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        onError && onError(error);
        return false;
      }
    },
    put: (key, newValues, onError = null) => {
      try {
        onError = onError ?? ((error) => console.error(error));

        let currentData = localStorage.getItem(key);
        currentData = currentData ? JSON.parse(currentData) : {};
        const newData = { ...currentData, ...newValues };
        localStorage.setItem(key, JSON.stringify(newData));

        return true
      } catch (error) {
        onError && onError(error);

        return false;
      }
    },
    get: (key, defaultValue = {}, onError = null) => {
      onError = onError ?? ((error) => console.error(error));

      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (error) {
        onError && onError(error);
        return defaultValue;
      }
    },
    clear: (key, onError = null) => {
      onError = onError ?? ((error) => console.error(error));

      try {
        localStorage.removeItem(key)
        return true;
      } catch (error) {
        onError && onError(error);
        return false;
      }
    }
  };

  return _DB_;
})();

// USAGE
// DB.set('snake-game-data', {pointsMax: 10})
// DB.put('snake-game-data', {foo: 'bar'})
// DB.clear('snake-game-data')
// gameData = DB.get('snake-game-data', {pointsMax: 0})

var Snake = (function () {
  const defaultInitialData = {
    pointsMax: 0,
    playerName: 'Player',
  };

  const gameData = DB.get(
    'snake-game-data', defaultInitialData
  ) || defaultInitialData;

  const INITIAL_TAIL = 4;
  var fixedTail = true;

  var intervalID;

  var tileCount = 10;
  var gridSize = 400 / tileCount;

  const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };

  var velocity = { x: 0, y: 0 };
  var player = { x: INITIAL_PLAYER.x, y: INITIAL_PLAYER.y };

  var walls = false;

  var fruit = { x: 1, y: 1 };

  var trail = [];
  var tail = INITIAL_TAIL;

  var reward = 0;
  var points = 0;
  var { pointsMax } = gameData;
  var { playerName } = gameData;

  var ActionEnum = { 'none': 0, 'up': 1, 'down': 2, 'left': 3, 'right': 4 };
  Object.freeze(ActionEnum);
  var lastAction = ActionEnum.none;

  function setup() {
    canv = document.getElementById('gc');
    ctx = canv.getContext('2d');

    game.reset();
  }

  var game = {
    reset: function () {
      ctx.fillStyle = 'grey';
      ctx.fillRect(0, 0, canv.width, canv.height);

      tail = INITIAL_TAIL;
      points = 0;
      velocity.x = 0;
      velocity.y = 0;
      player.x = INITIAL_PLAYER.x;
      player.y = INITIAL_PLAYER.y;
      // this.RandomFruit();
      reward = -1;

      lastAction = ActionEnum.none;

      trail = [];
      trail.push({ x: player.x, y: player.y });
      // for(var i=0; i<tail; i++) trail.push({ x: player.x, y: player.y });
    },

    action: {
      up: function () {
        if (lastAction != ActionEnum.down) {
          velocity.x = 0;
          velocity.y = -1;
        }
      },
      down: function () {
        if (lastAction != ActionEnum.up) {
          velocity.x = 0;
          velocity.y = 1;
        }
      },
      left: function () {
        if (lastAction != ActionEnum.right) {
          velocity.x = -1;
          velocity.y = 0;
        }
      },
      right: function () {
        if (lastAction != ActionEnum.left) {
          velocity.x = 1;
          velocity.y = 0;
        }
      }
    },

    RandomFruit: function () {
      if (walls) {
        fruit.x = 1 + Math.floor(Math.random() * (tileCount - 2));
        fruit.y = 1 + Math.floor(Math.random() * (tileCount - 2));
      }
      else {
        fruit.x = Math.floor(Math.random() * tileCount);
        fruit.y = Math.floor(Math.random() * tileCount);
      }
    },

    log: function () {
      console.log('====================');
      console.log('x:' + player.x + ', y:' + player.y);
      console.log('tail:' + tail + ', trail.length:' + trail.length);
    },

    loop: function () {

      reward = -0.1;

      function DontHitWall() {
        if (player.x < 0) player.x = tileCount - 1;
        if (player.x >= tileCount) player.x = 0;
        if (player.y < 0) player.y = tileCount - 1;
        if (player.y >= tileCount) player.y = 0;
      }
      function HitWall() {
        if (player.x < 1) game.reset();
        if (player.x > tileCount - 2) game.reset();
        if (player.y < 1) game.reset();
        if (player.y > tileCount - 2) game.reset();

        ctx.fillStyle = 'grey';
        ctx.fillRect(0, 0, gridSize - 1, canv.height);
        ctx.fillRect(0, 0, canv.width, gridSize - 1);
        ctx.fillRect(canv.width - gridSize + 1, 0, gridSize, canv.height);
        ctx.fillRect(0, canv.height - gridSize + 1, canv.width, gridSize);
      }

      var stopped = velocity.x == 0 && velocity.y == 0;

      player.x += velocity.x;
      player.y += velocity.y;

      if (velocity.x == 0 && velocity.y == -1) lastAction = ActionEnum.up;
      if (velocity.x == 0 && velocity.y == 1) lastAction = ActionEnum.down;
      if (velocity.x == -1 && velocity.y == 0) lastAction = ActionEnum.left;
      if (velocity.x == 1 && velocity.y == 0) lastAction = ActionEnum.right;

      ctx.fillStyle = 'rgba(40,40,40,0.8)';
      ctx.fillRect(0, 0, canv.width, canv.height);

      if (walls) HitWall();
      else DontHitWall();

      // game.log();

      if (!stopped) {
        trail.push({ x: player.x, y: player.y });
        while (trail.length > tail) trail.shift();
      }

      if (!stopped) {
        ctx.fillStyle = 'rgba(200,200,200,0.2)';
        ctx.font = "small-caps 14px Helvetica";
        ctx.fillText("(esc) reset", 24, 356);
        ctx.fillText("(space) pause", 24, 374);
      }

      ctx.fillStyle = 'green';
      for (var i = 0; i < trail.length - 1; i++) {
        ctx.fillRect(trail[i].x * gridSize + 1, trail[i].y * gridSize + 1, gridSize - 2, gridSize - 2);

        // console.debug(i + ' => player:' + player.x, player.y + ', trail:' + trail[i].x, trail[i].y);
        if (!stopped && trail[i].x == player.x && trail[i].y == player.y) {
          game.reset();
        }
        ctx.fillStyle = 'lime';
      }
      ctx.fillRect(trail[trail.length - 1].x * gridSize + 1, trail[trail.length - 1].y * gridSize + 1, gridSize - 2, gridSize - 2);

      if (player.x == fruit.x && player.y == fruit.y) {
        if (!fixedTail) tail++;
        points++;

        if (points > pointsMax) {
          pointsMax = points;

          DB.put('snake-game-data', { pointsMax })
        };
        reward = 1;
        game.RandomFruit();
        // make sure new fruit didn't spawn in snake tail
        while ((function () {
          for (var i = 0; i < trail.length; i++) {
            if (trail[i].x == fruit.x && trail[i].y == fruit.y) {
              game.RandomFruit();
              return true;
            }
          }
          return false;
        })());
      }

      ctx.fillStyle = 'red';
      ctx.fillRect(fruit.x * gridSize + 1, fruit.y * gridSize + 1, gridSize - 2, gridSize - 2);

      if (stopped) {
        ctx.fillStyle = 'rgba(250,250,250,0.8)';
        ctx.font = "small-caps bold 14px Helvetica";
        ctx.fillText("press ARROW KEYS to START...", 24, 374);
      }

      ctx.fillStyle = 'white';
      ctx.font = "bold small-caps 16px Helvetica";

      let lineHeight = 20;

      let getAndReserveTopPosition = (increment = true) => {
        let currentValue = lineHeight;

        if (increment) {
          lineHeight = lineHeight + 20;
        }

        return currentValue;
      }

      let topRightEnd = 384;
      let charSpace = 8;
      let getTopStart = (content, rightSpaceToSum = 0) => {
        rightSpaceToSum = rightSpaceToSum && Number.isInteger(rightSpaceToSum) ? rightSpaceToSum : 0;

        let value = (
          topRightEnd - (
            (
              (String(content).length)
              +
              (rightSpaceToSum ? rightSpaceToSum : 0)
            ) * charSpace
          )
        );

        return value
      }

      const contentToFill = [
        {
          content: `Score: ${points}`,
          position: 'top-right',
          right: 0,
        },
        {
          content: `Hig Score: ${pointsMax}`,
          position: 'top-right',
          right: 0,
        },
      ];

      if (playerName && playerName.length) {
        contentToFill.push({
          content: `Player: ${playerName}`,
          position: 'top-right',
          right: 0,
        })
      }

      contentToFill.forEach(item => {
        let xPosition = getTopStart(item.content, item?.right || 0);
        let yPosition = getAndReserveTopPosition();

        ctx.fillText(
          item.content,
          xPosition,
          yPosition,
        );
      })

      return reward;
    }
  }

  function keyPush(evt) {
    switch (evt.keyCode) {
      case 37: //left
        game.action.left();
        evt.preventDefault();
        break;

      case 38: //up
        game.action.up();
        evt.preventDefault();
        break;

      case 39: //right
        game.action.right();
        evt.preventDefault();
        break;

      case 40: //down
        game.action.down();
        evt.preventDefault();
        break;

      case 32: //space
        Snake.pause();
        evt.preventDefault();
        break;

      case 27: //esc
        game.reset();
        evt.preventDefault();
        break;
    }
  }

  return {
    start: function (fps = 15) {
      window.onload = setup;
      intervalID = setInterval(game.loop, 1000 / fps);
    },

    loop: game.loop,

    reset: game.reset,

    stop: function () {
      clearInterval(intervalID);
    },

    setup: {
      keyboard: function (state) {
        if (state) {
          document.addEventListener('keydown', keyPush);
        } else {
          document.removeEventListener('keydown', keyPush);
        }
      },
      wall: function (state) {
        walls = state;
      },
      tileCount: function (size) {
        tileCount = size;
        gridSize = 400 / tileCount;
      },
      fixedTail: function (state) {
        fixedTail = state;
      }
    },

    action: function (act) {
      switch (act) {
        case 'left':
          game.action.left();
          break;

        case 'up':
          game.action.up();
          break;

        case 'right':
          game.action.right();
          break;

        case 'down':
          game.action.down();
          break;
      }
    },

    pause: function () {
      velocity.x = 0;
      velocity.y = 0;
    },

    clearTopScore: function () {
      pointsMax = 0;
    },

    data: {
      player: player,
      fruit: fruit,
      trail: function () {
        return trail;
      }
    },

    info: {
      tileCount: tileCount
    }
  };

})();

Snake.start(8);
Snake.setup.keyboard(true);
Snake.setup.fixedTail(false);
