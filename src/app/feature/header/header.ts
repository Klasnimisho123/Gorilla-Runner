import { Component, inject } from '@angular/core';
import { GameStateService } from '../../core/game-state';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public state = inject(GameStateService);
}
