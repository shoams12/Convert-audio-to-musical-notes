import {
  passwordStrength,
  validateAudioFile,
  validateEmail,
  validatePassword,
  validateSongName,
  validateUsername,
} from "./utils/validation";

describe("validateUsername", () => {
  it("accepts normal names", () => {
    expect(validateUsername("Yael")).toBe("");
    expect(validateUsername("tamar_99")).toBe("");
  });

  it("rejects short, long and badly formed names", () => {
    expect(validateUsername("ab")).not.toBe("");
    expect(validateUsername("a".repeat(21))).not.toBe("");
    expect(validateUsername("9lives")).not.toBe("");
    expect(validateUsername("bad<name>")).not.toBe("");
  });
});

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("name@example.com")).toBe("");
    expect(validateEmail("first.last+tag@mail.co.il")).toBe("");
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("")).not.toBe("");
    expect(validateEmail("yael@sss")).not.toBe("");
    expect(validateEmail("a..b@example.com")).not.toBe("");
    expect(validateEmail("no-at-sign.com")).not.toBe("");
  });
});

describe("validatePassword", () => {
  it("accepts a strong password", () => {
    expect(validatePassword("Piano#2024")).toBe("");
  });

  it("rejects weak passwords", () => {
    expect(validatePassword("1212")).not.toBe("");
    expect(validatePassword("alllowercase1!")).not.toBe("");
    expect(validatePassword("NoNumbers!!")).not.toBe("");
    expect(validatePassword("NoSpecial123")).not.toBe("");
    expect(validatePassword("Has Space1!")).not.toBe("");
  });

  it("rejects passwords containing the username or email", () => {
    expect(validatePassword("Yael#2024x", { username: "yael" })).not.toBe("");
    expect(validatePassword("Shira!123A", { email: "shira@example.com" })).not.toBe("");
  });

  it("scores strength", () => {
    expect(passwordStrength("")).toBe(0);
    expect(passwordStrength("abc")).toBe(1);
    expect(passwordStrength("Piano#2024")).toBe(3);
    expect(passwordStrength("Piano#2024!Long")).toBe(4);
  });
});

describe("validateSongName", () => {
  it("validates song names", () => {
    expect(validateSongName("Für Elise")).toBe("");
    expect(validateSongName("   ")).not.toBe("");
    expect(validateSongName("x".repeat(41))).not.toBe("");
    expect(validateSongName("<script>")).not.toBe("");
  });
});

describe("validateAudioFile", () => {
  const file = (name, size) => ({ name, size });

  it("accepts supported audio files", () => {
    expect(validateAudioFile(file("song.MP3", 1000))).toBe("");
    expect(validateAudioFile(file("song.wav", 1000))).toBe("");
  });

  it("rejects wrong types, empty and huge files", () => {
    expect(validateAudioFile(file("song.ogg", 1000))).not.toBe("");
    expect(validateAudioFile(file("song.wav", 0))).not.toBe("");
    expect(validateAudioFile(file("song.wav", 11 * 1024 * 1024))).not.toBe("");
  });
});
