import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { GameStateService } from './core/game-state';
import { GameEngineService } from './core/game-engine';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Gorilla } from './feature/gorilla/gorilla';
import { Scoreboard } from './feature/scoreboard/scoreboard';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Footer } from './feature/footer/footer';
import { Header } from './feature/header/header';
import { Subject } from 'rxjs/internal/Subject';
import { tap } from 'rxjs/internal/operators/tap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { timer } from 'rxjs/internal/observable/timer';
import { concatMap } from 'rxjs/internal/operators/concatMap';
import { filter } from 'rxjs/internal/operators/filter';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  imports: [ReactiveFormsModule, Gorilla, Scoreboard, Footer, Header],
})
export class App {
  public state = inject(GameStateService);
  public engine = inject(GameEngineService);

  public timeInputControl = new FormControl(0);
  public roundTime = toSignal(this.timeInputControl.valueChanges, { initialValue: 0 });

  public gorillaY = signal(0);

  private canJump: boolean = true;
  private jumpDuration: number = 500;
  private duckDuration: number = 300;

  private isHoldingDuck = signal(false);

  public activeBtn = signal<string | null>(null);

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.activeBtn.set('jump');
        this.unitJump();
        break;
      case 'ArrowDown':
        if (event.repeat) return;
        this.isHoldingDuck.set(true);
        this.activeBtn.set('duck');
        this.unitDuck();
        break;
      case 'p':
        this.activeBtn.set('pause');
        this.engine.pauseUnpause();
        break;
      case 'r':
        this.activeBtn.set('restart');
        this.onStart();
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyup(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      this.isHoldingDuck.set(false);
      this.activeBtn.set(null);
      this.state.isDucking.set(false);
    }
    this.activeBtn.set(null);
  }

  @HostListener('window:blur')
  onBlur() {
    if (this.state.isStarted() && !this.state.isPaused()) {
      this.engine.pauseUnpause();
    }
  }

  public unitJump(): void {
    if (
      !this.canPerformAction() ||
      this.state.isJumping() ||
      this.state.isDucking() ||
      !this.canJump
    ) {
      return;
    }

    this.state.isJumping.set(true);
    this.canJump = false;
    this.gorillaY.set(-150);

    setTimeout(() => {
      this.state.isJumping.set(false);
    }, this.jumpDuration * 2);

    setTimeout(() => {
      this.gorillaY.set(0);
      setTimeout(() => {
        this.canJump = true;
      }, this.jumpDuration);
    }, this.jumpDuration);
  }

  public unitDuck(): void {
    if (!this.canPerformAction() || this.state.isJumping()) return;

    this.state.isDucking.set(true);

    timer(this.duckDuration)
      .pipe(take(1), takeUntilDestroyed())
      .subscribe(() => {
        if (!this.isHoldingDuck) {
          this.state.isDucking.set(false);
        }
      });
  }

  public canPerformAction = computed(
    () => this.state.isStarted() && !this.state.isPaused() && !this.state.isGameOver(),
  );

  public onStart(): void {
    const timeValue = this.roundTime() ?? 0;
    this.engine.startGame(timeValue);
  }
}
