import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameStateService } from '../../core/game-state';
import { Scoreboard } from './scoreboard';
import { GameEngineService } from '../../core/game-engine';
import { MockProvider } from 'ng-mocks';
import { signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

describe('Scoreboard Component', () => {
  let component: Scoreboard;
  let fixture: ComponentFixture<Scoreboard>;
  let state: GameStateService;
  let engine: GameEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scoreboard],
      providers: [
        MockProvider(GameStateService as any, {
          isStarted: signal(false),
          score: signal(0),
          highScore: signal(0),
          speed: signal(4),
        }),
        MockProvider(GameEngineService as any, {
          timer$: new BehaviorSubject<number>(0),
          passedObjectCounter: 0,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;
    state = TestBed.inject(GameStateService);
    engine = TestBed.inject(GameEngineService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render score from stateService', () => {
    // A A A

    // arrange
    state.score.set(0);
    fixture.detectChanges();

    // act
    state.score.set(500);
    fixture.detectChanges();

    // assert
    const scoreElement = fixture.nativeElement.querySelector('.score-value');

    expect(scoreElement).toBeTruthy();
    expect(scoreElement.textContent).toBe('Score: 500');
  });

  it('should render speed from stateService', () => {
    // A A A
    // arrange
    state.speed.set(4);
    fixture.detectChanges();

    //act
    state.speed.set(7);
    fixture.detectChanges();

    //assert
    const speedElement = fixture.nativeElement.querySelector('.speed-value');
    expect(speedElement).toBeTruthy();
    expect(speedElement.textContent).toBe('Speed: x4');
  });

  it('should render high score from stateService', () => {
    // A A A
    // arrange
    state.highScore.set(0);
    fixture.detectChanges();

    // act
    state.highScore.set(1000);
    fixture.detectChanges();

    // assert
    const highScoreElement = fixture.nativeElement.querySelector('.high-score');
    expect(highScoreElement).toBeTruthy();
    expect(highScoreElement.textContent).toBe('High Score: 1000');
  });

  it('should render passedObjectCounter from engineService', () => {
    // A A A
    // arrange
    engine.passedObjectCounter = 15;
    // act
    // not using signals reason => NG0100: ExpressionChangedAfterItHasBeenCheckedError: - detectChanges()?
    fixture.componentRef.changeDetectorRef.detectChanges();
    // assert
    const passedObjectsElement = fixture.nativeElement.querySelector('.passed-objects');
    expect(passedObjectsElement).toBeTruthy();
    expect(passedObjectsElement.textContent).toBe('Obstacles Passed: 15');
  });

  it('should not show timer if isStarted from stateService is false', () => { 
    // A A A
    // arrange
    state.isStarted.set(false);
    fixture.detectChanges();
    // assert
    const timerElement = fixture.nativeElement.querySelector('.timer-board');
    expect(timerElement).toBeNull();
  });
  it('should show timer if isStarted from stateService is true', () => { 
    // A A A
    // arrange
    state.isStarted.set(true);
    (engine.timer$ as any).next(75);
    // act
    fixture.detectChanges();

    // assert
    const timerElement = fixture.nativeElement.querySelector('.timer-board');
    expect(timerElement).toBeTruthy();
    expect(timerElement.textContent).toContain('1:15');
  });
});
