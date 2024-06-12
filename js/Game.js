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

    this.dragControls = null;

    this.balls = balls;
    this.camera = camera;
    this.renderer = renderer; 
    this.controls = controls;

    this.enterKeyListener = this.onEnterPress.bind(this); // Bind the enter key listener

    this.player1Position = null;
    this.player2Position = null;

    this.cueinPocket = false;

    // Initialize the scoreboard
    this.updateScoreboard();
  }

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
      this.pointsScored = false;
    } else {
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
      this.updateScoreboard();
    }
    if (this.cueinPocket){
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
      if (ball.type !== 'cue' && position.distanceTo(ball.mesh.position) < BALL_RADIUS * 2) {
        return false;
      }
    }
    return true;
  }

  initializeDragControls() {
    if (!this.dragControls) {
      alert('Please position the cue ball within the table and away from other balls. Press Enter to confirm the position.');
      this.dragControls = new DragControls([this.balls[0].mesh], this.camera, this.renderer.domElement);
      this.camera.position.set(0, CEILINGHEIGHT - 6, 0);
      this.camera.lookAt(0, 0, 0);
      this.camera.fov = 115;
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
      const cueBall = this.balls[0];
      if (this.isvalidPosition(cueBall.mesh.position)) {
        const userConfirmed = confirm('Confirm the position for the cue ball.');
        if (userConfirmed) {
          this.dragControls.enabled = false;
          this.controls.enabled = true;
          this.arrow.dragControls = false;
          window.removeEventListener('keydown', this.enterKeyListener);
          this.camera.fov = 75;
          this.camera.updateProjectionMatrix();
          this.dragControls = null;
          this.cueinPocket = false;
        } else {
          alert('Please reposition the cue ball.');
        }
      } else {
        alert('Invalid position! Please place the cue ball within the table and away from other balls.');
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


  checkForTurnChange(balls) {
      if (this.isWaitingForNextTurn && checkVelocities(balls)) {
          this.changeTurn();
          this.isWaitingForNextTurn = false; // Reset lo stato
      }
  }

  setWaitingForNextTurn() {
      this.isWaitingForNextTurn = true; // Imposta lo stato quando il tiro è terminato
  }

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
      
}
  