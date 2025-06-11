
export interface HandGesture {
  type: 'point' | 'fist' | 'peace' | 'palm' | 'unknown';
  confidence: number;
  landmarks?: any[];
}

export interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}
