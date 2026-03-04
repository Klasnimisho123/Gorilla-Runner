import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameStateService } from './core/game-state';
import { GameEngineService } from './core/game-engine';
import { signal } from '@angular/core';
import { MockComponent, MockProvider } from 'ng-mocks';
import { Scoreboard } from './feature/scoreboard/scoreboard';
import { Gorilla } from './feature/gorilla/gorilla';
import { By } from '@angular/platform-browser';
import { App } from './app';

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let state: GameStateService;
  let engine: GameEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, MockComponent(Scoreboard), MockComponent(Gorilla)],
      providers: [
        MockProvider(GameStateService, {
          score: signal(0),
          highScore: signal(0),
          isStarted: signal(false),
          isJumping: signal(false),
          isPaused: signal(false),
          isGameOver: signal(false),
        }),
        MockProvider(GameEngineService, {
          obstacles: signal([]),
          startGame: vi.fn(),
          pauseUnpause: vi.fn(),
        }),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    state = TestBed.inject(GameStateService);
    engine = TestBed.inject(GameEngineService);
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with gorilla on the ground', () => {
    expect(component.gorillaY()).toBe(0);
  });

  it('should update roundTime signal when the time input changes', () => {
    const inputElement = fixture.nativeElement.querySelector('#time-input') as HTMLInputElement;
    expect(inputElement).toBeTruthy();

    component.timeInputControl.setValue(45);
    fixture.detectChanges();

    expect(component.roundTime()).toBe(45);
  });

  it('should pass the roundTime value to the engine when Start is clicked', () => {
    component.timeInputControl.setValue(45);
    fixture.detectChanges();

    component.onStart();

    expect(engine.startGame).toHaveBeenCalledWith(45);
  });

  it('should default to 0 when starting with an empty time input', () => {
    component.timeInputControl.setValue(null);

    component.onStart();

    expect(engine.startGame).toHaveBeenCalledWith(0);
  });

  describe('Keydown shortcuts with HostListener', () => {
    it('should call unitJump when "Space" is pressed', () => {
      const jumpSpy = vi.spyOn(component, 'unitJump');

      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

      expect(jumpSpy).toHaveBeenCalled();
    });

    it('should call unitJump when "ArrowUp" is pressed', () => {
      const jumpSpy = vi.spyOn(component, 'unitJump');

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

      expect(jumpSpy).toHaveBeenCalled();
    });

    it('should pause/unpause the game when "p" is pressed', () => {
      const pauseKey = vi.spyOn(engine, 'pauseUnpause');

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));

      expect(pauseKey).toHaveBeenCalled();
    });

    it('should restart the game when "r" is pressed', () => {
      const startKey = vi.spyOn(component, 'onStart');

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));

      expect(startKey).toHaveBeenCalled();
    });
  });

  describe('unitJump Method', () => {
    describe('should not jump if any blocker state is active', () => {
      const blockerScenarios = [
        { name: 'isPaused', setup: () => state.isPaused.set(true) },
        { name: 'isJumping', setup: () => state.isJumping.set(true) },
        { name: 'isStarted', setup: () => state.isStarted.set(false) },
      ];

      blockerScenarios.forEach((scenario) => {
        it(`should not jump when ${scenario.name}`, () => {
          scenario.setup();
          component.unitJump();
          expect(component.gorillaY()).toBe(0);
        });
      });

      it('should set isJumping to true and gorillaY to -200 when jump is initiated', () => {
        state.isStarted.set(true);
        state.isJumping.set(false);
        state.isPaused.set(false);

        component.unitJump();

        expect(state.isJumping()).toBe(true);
        expect(component.gorillaY()).toBe(-200);
      });

      it('should reset isJumping AND allow jumping again after the full duration', () => {
        vi.useFakeTimers();
        state.isStarted.set(true);

        component.unitJump();
        expect(state.isJumping()).toBe(true);

        vi.advanceTimersByTime(500);
        expect(state.isJumping()).toBe(false);

        vi.advanceTimersByTime(500);

        vi.useRealTimers();
      });
      
    });
  });

  describe('App Component: Integration Tests', () => {
    describe('Game State Overlays', () => {
      it('should render if game is paused', () => {
        state.isPaused.set(true);

        fixture.detectChanges();

        const pauseOverlay = fixture.nativeElement.querySelector('.paused-state');
        expect(pauseOverlay).toBeTruthy();
      });
      it('should render if game is over', () => {
        state.isGameOver.set(true);
        fixture.detectChanges();

        const gameOverOverlay = fixture.nativeElement.querySelector('.gameFailed-state');
        expect(gameOverOverlay).toBeTruthy();
      });
      it('should not render pause or gameover overlay when game is running', () => {
        state.isPaused.set(false);
        state.isGameOver.set(false);
        fixture.detectChanges();

        const pauseOverlay = fixture.nativeElement.querySelector('.paused-state');
        const gameOverOverlay = fixture.nativeElement.querySelector('.gameFailed-state');

        expect(pauseOverlay).toBeFalsy();
        expect(gameOverOverlay).toBeFalsy();
      });
    });

    describe('Parralelax Animation', () => {
      it('should animate background parralelax when game is running', () => {
        state.isStarted.set(true);
        state.isPaused.set(false);
        fixture.detectChanges();

        const bgParalax = fixture.nativeElement.querySelector('.jungle-wrapper');
        expect(bgParalax.style.animationPlayState).toBe('running');
      });

      it('should stop animate background parralelax when game is paused', () => {
        state.isStarted.set(true);
        state.isPaused.set(true);
        fixture.detectChanges();

        const bgParalax = fixture.nativeElement.querySelector('.jungle-wrapper');
        expect(bgParalax.style.animationPlayState).toBe('paused');
      });
    });

    it('should bind gorillaY signal to the Gorilla component input', () => {
      component.gorillaY.set(-200);
      fixture.detectChanges();

      const gorillaComponent = fixture.debugElement.query(By.directive(Gorilla)).componentInstance;

      expect(gorillaComponent.yOffset).toBe(-200);
    });

    describe('Obstacle Rendering and animations', () => {
      it('should render obstacles based on engine.obstacles signal', () => {
        engine.obstacles.set([
          { id: 1, x: 100, flying: false, type: 'angular', width: 50, passed: false },
          { id: 2, x: 500, flying: false, type: 'js', width: 50, passed: false },
        ]);

        fixture.detectChanges();

        const obstacleElements = fixture.nativeElement.querySelectorAll('.obstacle');
        expect(obstacleElements).toBeTruthy();
        expect(obstacleElements.length).toBe(2);
      });
      it('should not render obstacles when engine.obstacles is empty', () => {
        engine.obstacles.set([]);
        fixture.detectChanges();
        const obstacleElements = fixture.nativeElement.querySelectorAll('.obstacle');
        expect(obstacleElements.length).toBe(0);
      });

      it('should set obstacle image source based on obstacle type', () => {
        engine.obstacles.set([{ id: 1, x: 100, flying: false, type: 'css', width: 50, passed: false }]);
        fixture.detectChanges();
        const obstacleImg: HTMLImageElement = fixture.nativeElement.querySelector('.obstacle-img');
        expect(obstacleImg).toBeTruthy();
        expect(obstacleImg.src).toBe('http://localhost:3000/css-obstacle.png');
      });

      it('should position obstacles based on their x value', () => {
        engine.obstacles.set([{ id: 1, x: 300, flying: false, type: 'html', width: 50, passed: false }]);
        fixture.detectChanges();
        const obstacleImg = fixture.nativeElement.querySelector('.obstacle-img') as HTMLElement;
        expect(obstacleImg).toBeTruthy();
        expect(obstacleImg.style.transform).toBe('translateX(300px)');
      });
    });

    describe('Scoreboard Component Integration', () => {
      it('should render the Scoreboard component', () => {
        const scoreboardComponent = fixture.debugElement.query(By.directive(Scoreboard));
        expect(scoreboardComponent).toBeTruthy();
      });

      it('should pass the correct score to the Scoreboard input', () => {
        state.score.set(150);
        fixture.detectChanges();

        const scoreboardDe = fixture.debugElement.query(By.directive(Scoreboard));
        expect(scoreboardDe).toBeTruthy();

        expect(state.score()).toBe(150);
      });

      describe('should update pause/unpause button', () => {
        it('to "Unpause" when game is paused', () => {
          state.isPaused.set(true);
          fixture.detectChanges();
          const pauseButton: HTMLButtonElement =
            fixture.nativeElement.querySelector('.pause-unpause-btn');
          expect(pauseButton).toBeTruthy();
          expect(pauseButton.textContent).toBe('Resume');
        });
        it('to "Pause" when game is running', () => {
          state.isPaused.set(false);
          fixture.detectChanges();
          const pauseButton: HTMLButtonElement =
            fixture.nativeElement.querySelector('.pause-unpause-btn');
          expect(pauseButton).toBeTruthy();
          expect(pauseButton.textContent).toBe('Pause');
        });
      });
    });
  });
});
