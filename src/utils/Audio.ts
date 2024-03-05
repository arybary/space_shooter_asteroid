import { Howl } from "howler";

type SoundName = "music" | "shot";

export class GameAudio {
  muted = true;
  music = new Howl({
    src: "/assets/sounds/music.mp3",
    loop: true,
    volume: 0.5,
  });

  shot = new Howl({
    src: "/assets/sounds/shot.mp3",

    volume: 0.5,
  });

  getSounds(name: SoundName): Howl[] {
    switch (name) {
      case "music":
        return [this.music];
      case "shot":
        return [this.shot];
    }
    return [];
  }

  private stop(stop: SoundName[] = []) {
    stop
      .map((sn) => this.getSounds(sn))
      .forEach((stopSounds) => {
        stopSounds.forEach((s) => s.stop());
      });
  }

  private play({
    name,
    keep,
    volume,
    stop = [],
  }: {
    name: SoundName;
    keep?: boolean;
    volume?: number;
    stop?: SoundName[];
  }) {
    const sounds = this.getSounds(name);
    if (sounds.length > 0) {
      this.stop(stop);
      const sound = sounds[Math.floor(Math.random() * sounds.length)];
      if (volume != null && volume >= 0 && volume <= 1) {
        sound.volume(volume);
      }
      if (keep && sound.playing()) {
        return;
      }
      sound.play();
    }
  }

  playMusic() {
    this.play({ name: "music", stop: ["music"] });
  }

  stopMusic() {
    this.stop(["music"]);
  }

  playShot() {
    this.play({ name: "shot" });
  }
}
