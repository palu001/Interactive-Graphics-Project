import { checkVelocities } from './utils.js';
export class Game {
  constructor() {
    this.currentPlayer = 1;
    this.player1Score = 0;
    this.player2Score = 0;

    this.isWaitingForNextTurn = false; // Used to prevent multiple turn changes

    this.player1Type = null; // null until assigned
    this.player2Type = null; // null until assigned

    this.pointsScored = false; // It is useful for the change of turn

    this.targetBall = null; // The ball that the player is aiming for

    // Initialize the scoreboard
    this.updateScoreboard();
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
  }




  handleEightBall() {
      if ((this.currentPlayer === 1 && this.player1Score === 7) || (this.currentPlayer === 2 && this.player2Score === 7)) {
        alert(`Player ${this.currentPlayer} wins by sinking the 8-ball!`);
      } else {
        const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
        alert(`Player ${this.currentPlayer} loses! Player ${otherPlayer} wins because the 8-ball was sunk prematurely.`);
      }
  }

  addScore(ballType) {
      if (ballType === '8') {
          this.handleEightBall();
      } else {
      if (this.currentPlayer === 1) {
        if (this.player1Type === null && ballType !== '8') {
          this.player1Type = ballType;
          this.player2Type = ballType === 'solid' ? 'striped' : 'solid';
        }
        if (ballType === this.player1Type) {
          this.player1Score++;
          this.pointsScored = true;
        }
        else{
          this.player2Score++;
        }
      } else {
        if (this.player2Type === null && ballType !== '8') {
          this.player2Type = ballType;
          this.player1Type = ballType === 'solid' ? 'striped' : 'solid';
        }
        if (ballType === this.player2Type) {
          this.player2Score++;
          this.pointsScored = true;
        }
        else{
          this.player1Score++;
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
  