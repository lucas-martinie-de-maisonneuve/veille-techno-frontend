import { animate, style, transition, trigger } from '@angular/animations';

export const collapseExpand = trigger('collapseExpand', [
  transition(':enter', [
    style({ transform: 'scaleX(0)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'scaleX(1)', opacity: 1 })),
  ]),
  transition(':leave', [animate('400ms ease-in', style({ transform: 'scaleX(0)', opacity: 0 }))]),
]);
