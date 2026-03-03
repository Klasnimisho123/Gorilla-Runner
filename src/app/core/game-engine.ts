import { Injectable, signal } from '@angular/core';
import {
  interval,
  Subject,
  takeUntil,
  filter,
  tap,
  Subscription,
  takeWhile,
  BehaviorSubject,
} from 'rxjs';
import { GameStateService } from './game-state';
import { Obstacle, ObstacleType } from '../shared/model/models';

@Injectable({ providedIn: 'root' })
export class GameEngineService {
  constructor(public state: GameStateService) {}

  private destroy$ = new Subject<void>();

  private timerSub?: Subscription;
  private scoreSub?: Subscription;
  private obstacleSpawnSub?: Subscription;
  private obstacleMovementSub?: Subscription;

  public obstacles = signal<Obstacle[]>([]);
  public timer$ = new BehaviorSubject<number>(0);
  public passedObjectCounter = 0;
  private obstacleId = 0;

  public startGame(inputedRoundTime: number) {
    if (inputedRoundTime <= 0) return;

    this.cleanup();
    this.state.reset();

    let finalTime = inputedRoundTime * 60;
    this.timer$.next(finalTime);
    this.state.isStarted.set(true);

    this.timerSub = interval(1000)
      .pipe(
        filter(() => !this.state.isPaused() && this.state.isStarted()),
        tap(() => {
          const next = this.timer$.value - 1;
          this.timer$.next(Math.max(next, 0));
        }),
        takeWhile(() => this.timer$.value > 0)
      )
      .subscribe({
        complete: () => this.gameOver(),
      });

    this.scoreSub = interval(100)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.state.isStarted() && !this.state.isPaused()),
        tap(() => {
          this.state.score.update((s) => s + 1 * this.state.speed() / 2);
        })
      )
      .subscribe();

    this.obstacleSpawnSub = interval(2500)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !this.state.isPaused() && this.state.isStarted()),
        tap(() => this.spawnObstacle())
      )
      .subscribe();

    this.obstacleMovementSub = interval(16)
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.state.isStarted() && !this.state.isPaused()),
        tap(() => this.updatePhysics())
      )
      .subscribe();
  }

  private updatePhysics() {
    this.obstacles.update((list) => {
      return list
        .map((obs) => {
          const newX = obs.x - this.state.speed();
          const playerX = 100;

          if (!obs.passed && newX < playerX) {
            this.passedObjectCounter++;
            obs.passed = true;
            this.state.score.update((s) => s + 10 * this.state.speed());

            if (this.passedObjectCounter % 5 === 0) {
              this.state.speed.update((s) => s + 1);
            }
          }
          return { ...obs, x: newX };
        })
        .filter((obs) => {
          const isOffScreen = obs.x + obs.width < -75;

          const collided = this.checkCollision(obs);
          if (collided) {
            this.gameOver();
            return false;
          }

          return !isOffScreen;
        });
    });
  }

  private checkCollision(obs: any): boolean {
    if (this.state.isJumping()) return false;

    const playerX = 100;
    const buffer = 225;

    return obs.x < playerX - buffer;
  }

  private spawnObstacle() {
    const types: ObstacleType[] = ['html', 'css', 'js', 'angular'];

    this.obstacles.update((list) => [
      ...list,
      {
        id: ++this.obstacleId,
        type: types[Math.floor(Math.random() * types.length)],
        x: 1500,
        width: 50,
        passed: false,
      },
    ]);
  }

  public gameOver() {
    this.state.isGameOver.set(true);
    this.state.isStarted.set(false);
    this.state.updateHighScore();
    this.cleanup();
  }

  public pauseUnpause(): void {
    if (!this.state.isStarted()) return;

    if (!this.state.isPaused()) {
      this.state.isPaused.set(true);
      this.timerSub?.unsubscribe();
    } else {
      this.state.isPaused.set(false);
      this.resumeTimer();
    }
  }

  private resumeTimer() {
    this.timerSub = interval(1000)
      .pipe(
        tap(() => {
          const next = this.timer$.value - 1;
          this.timer$.next(Math.max(next, 0));
        }),
        takeWhile(() => this.timer$.value > 0)
      )
      .subscribe({
        complete: () => this.gameOver(),
      });
  }

  private cleanup() {
    this.timerSub?.unsubscribe();
    this.obstacleSpawnSub?.unsubscribe();
    this.obstacleMovementSub?.unsubscribe();
    this.obstacles.set([]);
    this.passedObjectCounter = 0;
  }
}
