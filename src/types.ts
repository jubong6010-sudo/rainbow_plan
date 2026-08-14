export type ViewState = 
  | 'cover' 
  | 'nav' 
  | 'year' 
  | 'month' 
  | 'week' 
  | 'day-plan' 
  | 'day-action' 
  | 'day-diary';

export type PenColor = 'blue' | 'black' | 'red' | 'white';
export type PenWidth = 'thin' | 'normal' | 'thick';

export interface PenState {
  isEnabled: boolean;
  color: PenColor;
  width: PenWidth;
  isEraser: boolean;
}

