import { Component } from '@angular/core';
import { GameStateService } from '../../core/game-state';
import { GameEngineService } from '../../core/game-engine';
import { AsyncPipe } from '@angular/common';
import { TimeFormatPipe } from '../../shared/pipes/time-format-pipe';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [
    AsyncPipe,
    TimeFormatPipe
  ],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
})
export class Scoreboard {
  constructor(public state: GameStateService, public engine: GameEngineService) {}
}