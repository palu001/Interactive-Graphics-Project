import { checkVelocities, TABLE_WIDTH, BALL_RADIUS, TABLE_LENGTH, CEILINGHEIGHT } from './utils.js';
import { DragControls } from 'three/addons/controls/DragControls.js';
export class Game {
  constructor(balls, camera, renderer, controls) {
    this.currentPlayer = 1;
    this.player1Score = 0;
    this.player2Score = 0;

    this.isWaitingForNextTurn = false; // Used to prevent multiple turn changes

    this.player1Type = null; // null until assigned
    this.player2Type = null; // null until assigned

    this.pointsScored = false; // It is useful for the change of turn

    this.targetBall = null; // The ball that the player is aiming for

    this.dragControls = null; // To drag the white ball

    this.balls = balls;
    this.camera = camera;
    this.renderer = renderer; 
    this.controls = controls;

    this.enterKeyListener = this.onEnterPress.bind(this); // Bind the enter key listener

    // They are used to check if the 8-ball is sunk in the right pocket (side or corner)
    this.player1Position = null;
    this.player2Position = null;

    this.whiteinPocket = false;

    // Initialize the scoreboard
    this.updateScoreboard();
    window.addEventListener('keydown', this.onScenarioPress.bind(this));
  }

  // I need to pass the arrow object to the game object (because arrow has game object)
  setArrow(arrow) {
    this.arrow = arrow;
  }

  updateScoreboard() {
    document.getElementById('player1Score').innerText = `Player 1: ${this.player1Score}`;
    document.getElementById('player2Score').innerText = `Player 2: ${this.player2Score}`;
    document.getElementById('currentPlayerTurn').innerText = `Player ${this.currentPlayer}'s turn`;
    this.updateTargetBall(); // Update target ball display
  }

  changeTurn() {
    if (this.pointsScored) {
      this.pointsScored = false; // If i have scored points, i don't change the turn
    } else {
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
      this.updateScoreboard();
    }
    if (this.whiteinPocket){
      // It initializes the drag controls for the white ball
      this.initializeDragControls();
    }

  }


  isvalidPosition(position) {
    // Ensure the y-coordinate is always 1.12
    position.y = 1.12;

    // Check if the position is within the table boundaries
    if (position.x < -TABLE_WIDTH / 2 + BALL_RADIUS || position.x > TABLE_WIDTH / 2 - BALL_RADIUS ||
        position.z < -TABLE_LENGTH / 2 + BALL_RADIUS || position.z > TABLE_LENGTH / 2 - BALL_RADIUS) {
      return false;
    }
    // Check if the position is not overlapping with other balls
    for (const ball of this.balls) {
      // distanceTo returns the Euclidean distance between two points (origin of the balls)
      if (ball.type !== 'white' && position.distanceTo(ball.mesh.position) < BALL_RADIUS * 2) {
        return false;
      }
    }
    return true;
  }

  initializeDragControls() {
    if (!this.dragControls) {
      alert('Please position the white ball within the table and away from other balls. Press Enter to confirm the position.');
      this.dragControls = new DragControls([this.balls[0].mesh], this.camera, this.renderer.domElement);
      this.camera.position.set(0, CEILINGHEIGHT - 6, 0);
      this.camera.lookAt(0, 0, 0);
      this.camera.fov = 115; // field of view
      this.camera.updateProjectionMatrix();
      this.controls.enabled = false;
      this.arrow.dragControls = true;
      

      this.dragControls.addEventListener('drag', (event) => {
        // Keep the y-coordinate fixed at 1.12 during dragging
        event.object.position.y = 1.12;
      });
    }
    this.dragControls.enabled = true;
    window.addEventListener('keydown', this.enterKeyListener);
  }

  onEnterPress(event) {
    if (event.key === 'Enter') {
      const whiteBall = this.balls[0];
      if (this.isvalidPosition(whiteBall.mesh.position)) {
        const userConfirmed = confirm('Confirm the position for the white ball.');
        if (userConfirmed) {
          this.dragControls.enabled = false;
          this.controls.enabled = true;
          this.arrow.dragControls = false;
          window.removeEventListener('keydown', this.enterKeyListener); // I remove it because enter is needed in order to shoot
          this.camera.fov = 75;
          this.camera.updateProjectionMatrix();
          this.dragControls = null;
          this.whiteinPocket = false;
        } else {
          alert('Please reposition the white ball.');
        }
      } else {
        alert('Invalid position! Please place the white ball within the table and away from other balls.');
      }
    }
  }

  handleEightBall(pocketType, pocketInt) {
    if (pocketType === 'side') {
      if ((this.currentPlayer === 1 && this.player1Score === 7 && this.player1Position != pocketInt ) || (this.currentPlayer === 2 && this.player2Score === 7 && this.player2Position != pocketInt)) {
        alert(`Player ${this.currentPlayer} wins by sinking the 8-ball!`);
        window.location.reload();
      } else {
        const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
        alert(`Player ${this.currentPlayer} loses! Player ${otherPlayer} wins`);
        window.location.reload();
      }
    }
    else{
      const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
      alert(`Player ${this.currentPlayer} loses! Player ${otherPlayer} wins because the 8-ball was sunk in a corner pocket.`);
      window.location.reload();
    }
  }

  // ballType: the type of the ball (solid, striped, 8)
  // pocketType: the type of the pocket (side, corner)
  // pocketInt: the pocket number (1, 2)
  // ballName: the name of the ball (ball1, ball2, ..., ball15)
  addScore(ballType, pocketType, pocketInt, ballName) {
      if (ballType === '8') {
          this.handleEightBall(pocketType, pocketInt);
      } 
      else {
        if (this.currentPlayer == 1) {
          if (this.player1Type == null) {
            this.player1Type = ballType;
            this.player2Type = ballType === 'solid' ? 'striped' : 'solid';
          }
          if (ballType == this.player1Type && ballName != 'ball1' && ballName != 'ball15') {
            this.player1Score++;
            this.pointsScored = true;
            
          }
          else if (ballType != this.player1Type && ballName != 'ball1' && ballName != 'ball15'){
            this.player2Score++;
          }
          else if (ballType == this.player1Type && ballType == 'solid' && ballName == 'ball1') {
            if (pocketType ==='side'){
              this.player1Score++;
              this.pointsScored = true;
              this.player1Position = pocketInt;
              
            }
            else{
              const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
              alert(`Player ${this.currentPlayer} loses! Player ${otherPlayer} wins because the 1-ball was sunk in a wrong pocket.`);
              window.location.reload();
            }
          }
          else if (ballType == this.player1Type && ballType == 'striped' && ballName == 'ball15') {
            if (pocketType =='side'){
              this.player1Score++;
              this.pointsScored = true;
              this.player1Position = pocketInt;
            }
            else{
              const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
              alert(`Player ${this.currentPlayer} loses! Player ${otherPlayer} wins because the 15-ball was sunk in a wrong pocket.`);
              window.location.reload();
            }
          }
          else{
            const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
            alert(`Player ${this.currentPlayer} loses! Player ${otherPlayer} wins because the wrong ball was sunk.`);
            window.location.reload();
          }
        } 
        else {
          if (this.player2Type == null) {
            this.player2Type = ballType;
            this.player1Type = ballType === 'solid' ? 'striped' : 'solid';
          }
          if (ballType == this.player2Type && ballName != 'ball1' && ballName != 'ball15') {
            this.player2Score++;
            this.pointsScored = true;
          }
          else if (ballType != this.player2Type && ballName != 'ball1' && ballName != 'ball15'){
            this.player1Score++;
          }
          else if (ballType == this.player2Type && ballType == 'solid' && ballName == 'ball1') {
            if (pocketType == 'side'){
              this.player2Score++;
              this.pointsScored = true;
              this.player2Position = pocketInt;
            }
            else{
              const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
              alert(`Player ${this.currentPlayer} loses! Player ${otherPlayer} wins because the 1-ball was sunk in a wrong pocket.`);
              window.location.reload();
            }
          }
          else if (ballType == this.player2Type && ballType == 'striped' && ballName == 'ball15') {
            if (pocketType =='side'){
              this.player2Score++;
              this.pointsScored = true;
              this.player2Position = pocketInt;
            }
            else{
              const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
              alert(`Player ${this.currentPlayer} loses! Player ${otherPlayer} wins because the 15-ball was sunk in a wrong pocket.`);
              window.location.reload();
            }
          }
          else{
            const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
            alert(`Player ${this.currentPlayer} loses! Player ${otherPlayer} wins because the wrong ball was sunk.`);
            window.location.reload();
          }
        }
      }
      this.updateScoreboard();
    }

  //Always called in the animate function in Physics.js
  checkForTurnChange(balls) {
      if (this.isWaitingForNextTurn && checkVelocities(balls)) {
          this.changeTurn();
          this.isWaitingForNextTurn = false; // Reset lo stato
      }
  }

  //It is used in Arrow.js to set the state when the shot is finished
  setWaitingForNextTurn() {
      this.isWaitingForNextTurn = true; // Imposta lo stato quando il tiro è terminato
  }

  //It updates the target ball display
  updateTargetBall() {
    const targetBallElement = document.getElementById('targetBall');
    if (this.player1Type === null && this.player2Type === null) {
        this.targetBall = 'Any';
    } else if (this.currentPlayer === 1) {
        this.targetBall = this.player1Type === 'solid' ? 'Solid' : 'Striped';
    } else {
        this.targetBall = this.player2Type === 'solid' ? 'Solid' : 'Striped';
    }
    targetBallElement.innerText = `Target Ball: ${this.targetBall}`;
  }

  onScenarioPress(event) {
    if (event.key === '1') {
      const userConfirmed = confirm('Do you want to set up the final scenario?');
      if (userConfirmed) {
        this.setupFinalScenario();
      }
    }
  }

  //for presentation
  setupFinalScenario() {
    // Clear all balls except 1, 15, and 8
    for (let i=0; i<this.balls.length; i++) {
      if (this.balls[i].name != 'ball1' && this.balls[i].name != 'ball15' && this.balls[i].name != 'ball8' && this.balls[i].name != 'ball0') {
        this.arrow.scene.remove(this.balls[i].mesh);
        this.balls.splice(i, 1);
        i--;
      }
    }

    // Set positions of the balls for the final scenario 
    this.balls.forEach(ball => {
      if (ball.name === 'ball1') {
        ball.setPosition(-TABLE_WIDTH / 4, 1.12, 0);
      } else if (ball.name === 'ball15') {
        ball.setPosition( TABLE_WIDTH / 4, 1.12, TABLE_LENGTH / 4);
      } else if (ball.name === 'ball8') {
        ball.setPosition(TABLE_WIDTH / 4, 1.12, 0);
      }
      else if (ball.type === 'white') {
        ball.setPosition(0, 1.12, 0);
      }
    });

    // Set scores and player types for the final scenario
    this.player1Score = 6;
    this.player2Score = 6;
    this.player1Type = 'solid';
    this.player2Type = 'striped';

    // Update the scoreboard
    this.updateScoreboard();
  }
      
}
  