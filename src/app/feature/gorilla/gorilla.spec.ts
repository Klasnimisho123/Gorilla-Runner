import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gorilla } from './gorilla';
import { GameStateService } from '../../core/game-state';
import { GameEngineService } from '../../core/game-engine';
import { MockProvider } from 'ng-mocks';
import { signal } from '@angular/core';

describe('Gorilla Component', () => {
  let component: Gorilla;
  let fixture: ComponentFixture<Gorilla>;
  let state: GameStateService;
  let engine: GameEngineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gorilla],
      providers: [
        MockProvider(GameStateService, {
          isStarted: signal(false),
          isPaused: signal(false),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Gorilla);
    component = fixture.componentInstance;
    state = TestBed.inject(GameStateService);
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default yOffset of 0', () => {
    expect(component.yOffset).toBe(0);
  });

  it('should move gorilla when offset is inputed', () => {
    fixture.componentRef.setInput('yOffset', -200);

    fixture.detectChanges();

    const gorillaElement = fixture.nativeElement.querySelector('.main-unit');

    expect(gorillaElement).toBeTruthy();
    expect(gorillaElement.style.transform).toBe('translateY(-200px)');
  });

  describe('Gorilla Animation Logic', () => {
    it('should be paused when the game has NOT started', () => {
      // arrange
      state.isStarted.set(false);
      state.isPaused.set(false);
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.spinner-loader');
      expect(img).toBeTruthy();
      expect(img.style.animationPlayState).toBe('paused');
    });
    it('should be paused when the game is paused', () => {
      // arrange
      state.isStarted.set(true);
      state.isPaused.set(true);
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.spinner-loader');
      expect(img).toBeTruthy();
      expect(img.style.animationPlayState).toBe('paused');
    });

    it('should be running when the game is started and not paused', () => {
      // arrange
      state.isStarted.set(true);
      state.isPaused.set(false);
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.spinner-loader');
      expect(img).toBeTruthy();
      expect(img.style.animationPlayState).toBe('running');
    });
  });
});
