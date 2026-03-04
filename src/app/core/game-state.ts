import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  public isStarted = signal(false);
  public isPaused = signal(false);
  public isGameOver = signal(false);
  public isJumping = signal(false);
  public isDucking = signal(false);

  public score = signal(0);
  public highScore = signal(this.loadHighScore());
  public speed = signal(4);

  public updateHighScore() {
    if (this.score() > this.highScore()) {
      localStorage.setItem('highScore', this.score().toString());
      this.highScore.set(this.score());
    }
  }

  public loadHighScore(): number {
    const saved = localStorage.getItem('highScore');
    return saved ? Number(saved) : 0;
  }

  public reset() {
    this.score.set(0);
    this.speed.set(4);
    this.isGameOver.set(false);
    this.isJumping.set(false);
    this.isPaused.set(false);
  }
}