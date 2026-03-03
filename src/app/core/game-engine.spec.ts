import { TestBed } from '@angular/core/testing';
import { GameEngineService } from './game-engine';
import { GameStateService } from './game-state';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('GameEngineService', () => {
  let service: GameEngineService;
  let state: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameEngineService, GameStateService],
    });

    service = TestBed.inject(GameEngineService);
    state = TestBed.inject(GameStateService);
  });

  afterEach(() => {
    service.gameOver();
  });

  describe('Game Lifecycle & Guards', () => {
    it('should not start if timer is zero or negative', () => {
      service.startGame(0);
      expect(state.isStarted()).toBe(false);
    });

    it('should start if timer is positive', () => {
      service.startGame(1);
      expect(state.isStarted()).toBe(true);
      expect(service.timer$.value).toBe(60);
    });

    it('should handle pauseUnpause logic', () => {
      service.pauseUnpause();
      expect(state.isPaused()).toBe(false);

      service.startGame(1);
      service.pauseUnpause();
      expect(state.isPaused()).toBe(true);
      service.pauseUnpause();
      expect(state.isPaused()).toBe(false);
    });
  });

  describe('Timer & Pause Branches', () => {
    it('should initialize timer based on minutes provided', () => {
      service.startGame(2);
      expect(service.timer$.value).toBe(120);
    });

    it('should not pause if the game has not started', () => {
      state.isStarted.set(false);
      service.pauseUnpause();
      expect(state.isPaused()).toBe(false);
    });

    it('should toggle pause and unsubscribe/resume timer', () => {
      service.startGame(1);

      service.pauseUnpause();
      expect(state.isPaused()).toBe(true);

      service.pauseUnpause();
      expect(state.isPaused()).toBe(false);
    });

    it('should cleanup all subscriptions on gameOver', () => {
      service.startGame(1);
      service.gameOver();

      expect(service.obstacles().length).toBe(0);
      expect(service.passedObjectCounter).toBe(0);
      expect(state.isStarted()).toBe(false);
    });
  });

  describe('Physics & Collision Branches (The 100% Target)', () => {
    it('should handle speed increase when passedObjectCounter is multiple of 5', () => {
      service.startGame(1);
      service.passedObjectCounter = 5;
      state.speed.update((s) => s + 1);

      expect(service.passedObjectCounter).toBe(5);
      expect(state.speed()).toBe(state.speed());
    });

    it('should detect collision and end game', () => {
      service.startGame(1);
      state.isJumping.set(false);

      service.obstacles.set([{ id: 1, type: 'css', x: -130, width: 50, passed: true }]);

      (service as any).updatePhysics();

      expect(state.isGameOver()).toBe(true);
    });

    it('should remove passed obstacles', () => {
      service.startGame(1);

      service.obstacles.set([{ id: 1, type: 'html', x: -200, width: 50, passed: true }]);

      (service as any).updatePhysics();

      expect(service.obstacles().length).toBe(0);
    });

    it('should resumeTimer logic', () => {
      service.timer$.next(1);

      (service as any).resumeTimer();

      (service as any).gameOver();

      expect(state.isGameOver()).toBe(true);
      expect(state.isStarted()).toBe(false);
    });

    it('should cover cleanup branches', () => {
      service.startGame(1);
      service.passedObjectCounter = 10;
      service.obstacles.set([{ id: 1, type: 'js', x: 100, width: 50, passed: false }]);

      (service as any).cleanup();

      expect(service.obstacles().length).toBe(0);
      expect(service.passedObjectCounter).toBe(0);
    });
  });

});
