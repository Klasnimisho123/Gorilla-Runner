import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state';
import { describe, it, expect, beforeEach } from 'vitest';

describe('GameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [GameStateService],
    });

    service = TestBed.inject(GameStateService);
  });

  describe('Initial State', () => {
    // better practice - no types?
    //   expect<boolean>(service.isStarted()).toBe(false);
    it('should start with default values', () => {
      expect(service.isStarted()).toBe(false);
      expect(service.isPaused()).toBe(false);
      expect(service.isGameOver()).toBe(false);
      expect(service.isJumping()).toBe(false);
      expect(service.score()).toBe(0);
      expect(service.speed()).toBe(4);

      // ra datvirtva akvs??
      // expect<number>(service.highScore()).toBe(service.loadHighScore());
    });
  });

  describe('initial high score loading', () => {
    it('should start from 0 if localStorage is empty', () => {
      expect(service.highScore()).toBe(0);
    });

    it('should load high score from localStorage if present', () => {
      localStorage.setItem('highScore', '150');

      const freshService = new GameStateService();

      expect(freshService.highScore()).toBe(150);
    });
  });

  describe('updateHighScore', () => {
    it('should update high score if current score is higher', () => {
      localStorage.setItem('highScore', '150');
      service.score.set(200);
      service.highScore.set(150);

      service.updateHighScore();

      expect(service.highScore()).toBe(200);
      expect(localStorage.getItem('highScore')).toBe('200');
    });

    it('should not update high score if current score is lower or equal', () => {
      localStorage.setItem('highScore', '150');
      service.score.set(100);
      service.highScore.set(150);

      service.updateHighScore();

      expect(service.highScore()).toBe(150);
      expect(localStorage.getItem('highScore')).toBe('150');
    });
  });
  describe('loadHighScore', () => {
    it('should return 0 if no high score in localStorage', () => {
      expect(service.loadHighScore()).toBe(0);
    });

    it('should return score from localStorage if highscore exists', () => {
      localStorage.setItem('highScore', '250');
      expect(service.loadHighScore()).toBe(250);
    });
  });

  describe('reset', () => {
    it('should reset game state to initial values', () => {
      service.score.set(100);
      service.speed.set(10);
      service.isGameOver.set(true);
      service.isJumping.set(true);
      service.isPaused.set(true);

      service.reset();

      expect(service.score()).toBe(0);
      expect(service.speed()).toBe(4);
      expect(service.isGameOver()).toBe(false);
      expect(service.isJumping()).toBe(false);
      expect(service.isPaused()).toBe(false);
    });
  });
});
