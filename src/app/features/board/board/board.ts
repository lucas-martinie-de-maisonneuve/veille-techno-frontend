import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-board',
  imports: [MatCardModule],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {}
