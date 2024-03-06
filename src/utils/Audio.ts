import { Howl } from "howler";

type SoundName =
  | "music"
  | "shot"
  | "explosion"
  | "start"
  | "bossFight"
  | "win"
  | "lose";

export class GameAudio {
  music = new Howl({
    src: "/assets/sounds/music.mp3",
    loop: true,
    volume: 0.3,
  });

  explosion = new Howl({
    src: "/assets/sounds/explosion.mp3",
    volume: 0.2,
  });

  shot = new Howl({
    src: "/assets/sounds/shot.mp3",
    volume: 0.2,
  });

  startBossFight = new Howl({
    src: "/assets/sounds/start.mp3",
    volume: 0.5,
  });

  bossFight = new Howl({
    src: "/assets/sounds/boss_fight.mp3",
    loop: true,
    volume: 0.2,
  });

  win = new Howl({
    src: "/assets/sounds/you_win.mp3",
    volume: 0.5,
  });

  lose = new Howl({
    src: "/assets/sounds/game_over.mp3",
    volume: 0.5,
  });

  getSounds(name: SoundName): Howl[] {
    switch (name) {
      case "music":
        return [this.music];
      case "shot":
        return [this.shot];
      case "explosion":
        return [this.explosion];
      case "start":
        return [this.startBossFight];
      case "bossFight":
        return [this.bossFight];
      case "win":
        return [this.win];
      case "lose":
        return [this.lose];
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
    this.play({ name: "start", stop: ["start"] });
  }

  stopMusic() {
    this.stop(["music"]);
  }

  playShot() {
    this.play({ name: "shot" });
  }
  playExplosion() {
    this.play({ name: "explosion" });
  }

  playBossFight() {
    this.play({ name: "start", stop: ["music"] });
    this.play({ name: "bossFight" });
  }
  playWin() {
    this.play({
      name: "win",
      stop: ["music", "explosion", "start", "bossFight"],
    });
  }
  playLose() {
    this.play({
      name: "lose",
      stop: ["music", "explosion", "start", "bossFight"],
    });
  }
}
