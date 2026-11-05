// Sound effects have been completely disabled as per user instruction.
// This mock object ensures safe no-op calls if referenced anywhere.

class SoundManager {
  public enabled: boolean = false;
  playSignIn() {}
  playReceive() {}
  playSent() {}
  playNudge() {}
  playContactOnline() {}
  playWinkSound() {}
}

export const sounds = new SoundManager();
