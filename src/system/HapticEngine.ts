class HapticEngine {
  private enabled: boolean = true;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  public trigger(pattern: number | number[]) {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }

  public light() {
    this.trigger(15);
  }

  public medium() {
    this.trigger(30);
  }

  public heavy() {
    this.trigger([40, 30, 40]);
  }

  public clueDiscovered() {
    this.trigger([30, 50, 40]);
  }

  public deduction() {
    this.trigger([50, 40, 80, 50, 100]);
  }

  public alert() {
    this.trigger([100, 60, 100]);
  }
}

export const hapticEngine = new HapticEngine();
