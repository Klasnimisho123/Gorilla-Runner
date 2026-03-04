import { Component, computed, input, Input } from '@angular/core';

@Component({
  selector: 'app-gorilla',
  standalone: true,
  templateUrl: './gorilla.html',
  styleUrl: './gorilla.scss',
})
export class Gorilla {
  public yOffset  = input<number>(0);
  public isRunning = input<boolean>(false);
  public isPaused = input<boolean>(false);
  public isDucking = input<boolean>(false);

  public gorillaSrc = computed(() => {
    if (this.isPaused() || !this.isRunning()) {
      return 'gorilla-standing.jpg';
    }
    return 'gorilla-running.gif';
  });

  public playState = computed(() => 
    this.isPaused() || !this.isRunning() ? 'paused' : 'running'
  );

  public transformStyle = computed(() => 
    `translateY(${this.yOffset()}px)`
  );

}
