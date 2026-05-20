import Sprite from './sprite';
import Cannon from './cannon';
import Bullet from './bullet';
import Alien from './alien';
import InputHandler from './input-handler';

import assetPath from '../assets/invaders.png';

let assets;

const sprites = {
  aliens: [],
  cannon: null,
  bunker: null
};

const gameState = {
  bullets: [],
  aliens: [],
  cannon: null,

  alienDirection: 1,
  alienSpeed: 1,
  alienDropDistance: 16,

  enemyShootDelay: 700,
  lastEnemyShotTime: 0
};

const inputHandler = new InputHandler();

export function preload(onPreloadComplete) {
  assets = new Image();

	assets.addEventListener("load", () => {
    sprites.cannon = new Sprite(assets, 62, 0, 22, 16);
    sprites.bunker = new Sprite(assets, 84, 8, 36, 24);

    sprites.aliens = [
      [new Sprite(assets, 0, 0, 22, 16), new Sprite(assets, 0, 16, 22, 16)],
			[new Sprite(assets, 22, 0, 16, 16), new Sprite(assets, 22, 16, 16, 16)],
			[new Sprite(assets, 38, 0, 24, 16), new Sprite(assets, 38, 16, 24, 16)]
    ];

    onPreloadComplete();
  });

	assets.src = assetPath;
}

export function init(canvas) {
  const alienTypes = [1, 0, 1, 2, 0, 2];
  const alienPositions = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

	for (let i = 0, len = alienTypes.length; i < len; i++) {
		for (let j = 0; j < 10; j++) {
      if (!alienPositions[i][j]) continue;
      
      const alienType = alienTypes[i];

      let alienX = 30 + j * 30;
      let alienY = 30 + i * 30;

      if (alienType === 1) {
        alienX += 3;
      }

			gameState.aliens.push(
        new Alien(alienX, alienY, sprites.aliens[alienType])
			);
		}
	}

  gameState.cannon = new Cannon(
    100,
    canvas.height - 100,
    sprites.cannon
  );
}

export function update(time, stopGame, canvas) {
	if (inputHandler.isDown('ArrowLeft')) {
		gameState.cannon.moveLeft();
	}

	if (inputHandler.isDown('ArrowRight')) {
		gameState.cannon.moveRight();
	}

  gameState.cannon.clamp(canvas.width);

  if (inputHandler.isPressed('Space')) {
    const bulletX = gameState.cannon.x + gameState.cannon.w / 2 - 1;
    const bulletY = gameState.cannon.y;

		gameState.bullets.push(
      new Bullet(bulletX, bulletY, -8, 2, 8, "#ffffff", "player")
    );
	}

  updateAliens(canvas);
  updateEnemyAttack(time);
  updateBullets(time, canvas);
  handleCollisions(stopGame);

  clearInactiveObjects(canvas);
}

function updateAliens(canvas) {
  let shouldReverse = false;

  gameState.aliens.forEach(alien => {
    alien.update();

    if (alien.x <= 0 || alien.x + alien.w >= canvas.width) {
      shouldReverse = true;
    }
  });

  if (shouldReverse) {
    gameState.alienDirection *= -1;

    gameState.aliens.forEach(alien => {
      alien.reverse(gameState.alienDirection * gameState.alienSpeed);
      alien.moveDown(gameState.alienDropDistance);
    });
  }
}

function updateEnemyAttack(time) {
  if (time - gameState.lastEnemyShotTime < gameState.enemyShootDelay) return;

  const columns = getAlienColumns();
  if (columns.length === 0) return;

  const cannonCenter = gameState.cannon.x + gameState.cannon.w / 2;

  columns.sort((a, b) => {
    const centerA = a.x + a.w / 2;
    const centerB = b.x + b.w / 2;

    return Math.abs(centerA - cannonCenter) - Math.abs(centerB - cannonCenter);
  });

  let shooter = columns[Math.floor(Math.random() * columns.length)];

  const bulletX = shooter.x + shooter.w / 2 - 1;
  const bulletY = shooter.y + shooter.h + 1;

  gameState.bullets.push(
    new Bullet(bulletX, bulletY, 5, 2, 8, "#ffffff", "enemy")
  );

  gameState.lastEnemyShotTime = time;
}

function getAlienColumns() {
  const columns = {};

  gameState.aliens.forEach(alien => {
    const key = Math.round(alien.x);

    if (!columns[key] && !columns[key + 3] && !columns[key - 3]) columns[key] = alien;
    else {
      const _key = columns[key] ? key : (columns[key + 3] ? (key + 3) : (key - 3));
      if (alien.y > columns[_key].y) {
        columns[_key] = alien;
      }
    }
  });

  console.log(Object.values(columns));

  return Object.values(columns);
}

function updateBullets(time, canvas) {
  gameState.bullets.forEach(bullet => {
    bullet.update(time);

    if (bullet.isOutOfScreen(canvas.height)) {
      bullet.active = false;
    }
  });
}

function handleCollisions(stopGame) {
  gameState.bullets.forEach(bullet => {
    if (!bullet.active) {
      return;
    }

    if (bullet.owner === "player") {
      gameState.aliens.forEach(alien => {
        if (!alien.alive) {
          return;
        }

        if (checkSweptCollision(bullet, alien)) {
          bullet.active = false;
          alien.alive = false;
        }
      });
    }

    if (bullet.owner === "enemy") {
      if (checkRectCollision(bullet.getBounds(), gameState.cannon.getBounds())) {
        bullet.active = false;

        stopGame();
      }

      // Friendly Fire (optional)
      gameState.aliens.forEach(alien => {
        if (!alien.alive) {
          return;
        }

        if (checkSweptCollision(bullet, alien)) {
          bullet.active = false;
          alien.alive = false;
        }
      });
    }
  });
}

function clearInactiveObjects(canvas) {
  gameState.bullets = gameState.bullets.filter(bullet => {
    return bullet.active && !bullet.isOutOfScreen(canvas.height);
  });

  gameState.aliens = gameState.aliens.filter(alien => alien.alive);
}

function checkRectCollision(a, b) {
  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

function checkSweptCollision(bullet, alien) {
  const alienBounds = alien.getBounds();

  const bulletLeft = bullet.x;
  const bulletRight = bullet.x + bullet.w;

  const previousTop = Math.min(bullet.prevY, bullet.y);
  const previousBottom = Math.max(
    bullet.prevY + bullet.h,
    bullet.y + bullet.h
  );

  return (
    bulletRight >= alienBounds.left &&
    bulletLeft <= alienBounds.right &&
    previousBottom >= alienBounds.top &&
    previousTop <= alienBounds.bottom
  );
}

export function draw(canvas, time) {
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  gameState.aliens.forEach(alien => alien.draw(ctx, time));

  gameState.cannon.draw(ctx);

  gameState.bullets.forEach(bullet => bullet.draw(ctx));
}