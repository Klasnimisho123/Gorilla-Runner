import { Component, HostListener, signal } from '@angular/core';
import { GameStateService } from './core/game-state';
import { GameEngineService } from './core/game-engine';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Gorilla } from './feature/gorilla/gorilla';
import { Scoreboard } from './feature/scoreboard/scoreboard';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  imports: [ReactiveFormsModule, Gorilla, Scoreboard],
})
export class App {
  constructor(public state: GameStateService, public engine: GameEngineService) {}

  public timeInputControl = new FormControl(0);
  public roundTime = toSignal(this.timeInputControl.valueChanges, { initialValue: 0 });

  public gorillaY = signal(0);

  private canJump: boolean = true;
  private jumpDuration: number = 500;

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case ' ':
        this.unitJump();
        break;
      case 'p':
        this.engine.pauseUnpause();
        break;
      case 'r':
        this.onStart()
        break;
    }
  }

  unitJump() {
    if (
      this.state.isJumping() ||
      !this.canJump ||
      !this.state.isStarted() ||
      this.state.isPaused()
    ) {
      this.state.isJumping();
      return;
    }

    this.state.isJumping.set(true);
    this.canJump = false;
    this.gorillaY.set(-200);

    setTimeout(() => {
      this.gorillaY.set(0);
      this.state.isJumping.set(false);

      setTimeout(() => {
        this.canJump = true;
      }, this.jumpDuration);
    }, this.jumpDuration);
  }

  onStart() {
    const timeValue = this.roundTime() ?? 0;
    this.engine.startGame(timeValue);
  }
}
