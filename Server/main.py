from pydub import AudioSegment
import numpy as np
import librosa
import soundfile as sf
import joblib
import subprocess
from tensorflow.keras.models import load_model
from moviepy.editor import *
loaded_model = load_model('C:/Datasets/piano_notes_Dataset/audio_classification2.hdf5')
LE = joblib.load('C:/projects/model_for_chords/project/label_encoder.pkl')


# Converting audio
def convert_mp3_to_wav(mp3_file):
    # Load the MP3 file
    audio = AudioSegment.from_mp3(mp3_file)

    # Export the audio to WAV format and return the audio data
    return audio.export(format="wav")


def convert_m4a_to_wav(m4a_file):
    # Load the M4A file
    audio = AudioSegment.from_file(m4a_file, format="m4a")

    # Export the audio to WAV format and return the audio data
    return audio.export(format="wav")


def convert_mp4_to_wav(mp4_file, wav_file="output.wav"):
    video = VideoFileClip(mp4_file)
    audio = video.audio
    audio.write_audiofile(wav_file)
    return wav_file


# Normalizing the audio
def rms_normalize(audio, target_rms=0.4):
    # Compute the RMS (Root Mean Square) of the audio signal
    rms = np.sqrt(np.mean(np.square(audio)))

    # Calculate the scaling factor to achieve the target RMS
    scale_factor = target_rms / rms

    # Normalize the audio by applying the scaling factor
    normalized_audio = audio * scale_factor

    return normalized_audio


# Onset algorithm- Spectral flux
def spectral_flux_onset_detection(y, sr):
    # Compute spectral flux
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=512)
    # Compute onset times
    onset_frames = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)
    return onset_times


def predict_notes_from_beatmap(file_path, audio_file):
    # Load beatmap file
    with open(file_path, 'r') as f:
        lines = f.readlines()

    # Parse onset times
    onset_times = [float(line.strip()) for line in lines]

    # Calculate note durations
    note_durations = np.diff(onset_times)

    # Load audio file
    x, sr = librosa.load(audio_file)

    # Predict notes for each duration
    predictions = []
    timing_stamps = []
    durations = []
    for duration, onset_time in zip(note_durations, onset_times[:-1]):  # Iterate over both durations and onset times
        # Calculate start and end samples for the audio segment
        start_sample = int(onset_time * sr)
        end_sample = int((onset_time + duration) * sr)

        # Extract segment of audio corresponding to note duration
        audio_segment = x[start_sample:end_sample]

        # Extract features (e.g., MFCCs)
        mfccs_features = librosa.feature.mfcc(y=audio_segment, sr=sr, n_mfcc=40, n_fft=512)
        mfccs_scaled_features = np.mean(mfccs_features.T, axis=0)
        mfccs_scaled_features = mfccs_scaled_features.reshape(1, -1)

        # Make prediction
        predicted_label = np.argmax(loaded_model.predict(mfccs_scaled_features), axis=-1)
        prediction_class = LE.inverse_transform(predicted_label)
        predictions.append(prediction_class[0])

        # Store timing stamp
        timing_stamps.append(onset_time)

        # Store duration
        durations.append(duration)

    return timing_stamps, durations, predictions


def performing_spectral_flux(beatmap_file_path, audio_file):
    y, sr = librosa.load(audio_file)
    # Spectral flux onset detection
    onset_times = spectral_flux_onset_detection(y, sr)
    
    # Write onset times to a file
    with open(beatmap_file_path, 'w') as f:
        for onset_time in onset_times:
            f.write(str(onset_time) + '\n')

    # Predict notes from beatmap
    timing_stamps, durations, predicted_notes = predict_notes_from_beatmap(beatmap_file_path, audio_file)
    return timing_stamps, durations, predicted_notes


def notes_durations(duration, beat_dur):
    durations_map = {
     1: ("1", 4),    # whole note
     2: ("2", 2),    # half note
     4: ("4", 1),    # quarter note
     8: ("8", 0.5),  # eighth note
     16: ("16", 0.25)  # sixteenth note
     }
    dur = 1
    if duration < beat_dur * 0.25:
        return "16"

    while duration < beat_dur * durations_map[dur][1]:
        dur *= 2
    return durations_map[dur][0]


def notes_to_score(durations, predicted_notes, path):
    audio_file = librosa.load(path)
    y, sr = audio_file
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    tempo = round(tempo, 2)
    beat_dur = 60 / tempo  # Duration of a whole beat calculating 60 sec divided by tempo
    treble_previous_octave = 4
    bass_previous_octave = 3
    treble_lilypond_codes = []
    bass_lilypond_codes = []

    for note, duration in zip(predicted_notes, durations):
        pitch, octave = note.split('_')
        pitch = pitch.lower()
        octave = int(octave)

        # Determine the clef based on the octave
        clef = 'treble' if octave >= 4 else 'bass'

        # Determine the previous octave for the clef
        previous_octave = treble_previous_octave if clef == 'treble' else bass_previous_octave
        # Calculate the octave change
        octave_diff = octave - previous_octave

        lilypond_octave = "'" * octave_diff if octave_diff > 0 else "," * abs(octave_diff)

        note_duration = notes_durations(duration, beat_dur)
        lilypond_code = pitch + lilypond_octave + note_duration

        # Append to the appropriate list based on clef
        if clef == 'treble':
            treble_lilypond_codes.append(lilypond_code)
            bass_lilypond_codes.append("r" + note_duration)
            treble_previous_octave = octave  # Update previous octave for treble clef
        else:
            bass_lilypond_codes.append(lilypond_code)
            treble_lilypond_codes.append("r" + note_duration)
            bass_previous_octave = octave  # Update previous octave for bass clef
    print(treble_lilypond_codes, bass_lilypond_codes)
    return treble_lilypond_codes, bass_lilypond_codes


def generate_sheet_music(lilypond_code, output_file):
    try:
        # Run Lilypond compiler as a subprocess
        subprocess.run(['lilypond', '--output=' + output_file, '-'], input=lilypond_code, text=True, check=True)
        print("Sheet music generated successfully.")
    except subprocess.CalledProcessError as e:
        print("Error generating sheet music:", e)


def using_lilypond(treble_clef, bass_clef, chosen_filename):
    t_sign = "4/4"  # default time signature
    treble_notes = "".join(treble_clef)
    bass_notes = "".join(bass_clef)
    lilypond_code = r"""
    \version "2.24.3"
    \language "english"
    % Define the score with two staves (treble and bass)
    \score {
      <<
        % Treble clef staff
        \new Staff {
          \clef treble
          \relative c' {
           \time """ + t_sign + " " + treble_notes + r"""
          }
        }
        % Bass clef staff
        \new Staff {
          \clef bass
          \relative c {
          \time """ + t_sign + " " + bass_notes + r"""
          }
        }
      >>
    }
    """
    # Output file path
    output_file = "./pdfOutputFiles/" + chosen_filename
    generate_sheet_music(lilypond_code, output_file)


def convert_to_wav(file_path):
    if file_path.endswith('.mp3'):
        file_path = convert_mp3_to_wav(file_path)
        return file_path
    elif file_path.endswith('.m4a'):
        file_path = convert_m4a_to_wav(file_path)
        return file_path
    elif file_path.endswith('.mp4'):
        file_path = convert_mp4_to_wav(file_path)
        return file_path
    elif not file_path.endswith('.wav'):
        return 'FILE ERROR'


def writing_score(normalized_file_path, file_name):
    timing_stamps, durations, predicted_notes = performing_spectral_flux('onset_times.txt', normalized_file_path)
    print(timing_stamps)
    print(durations)
    print(predicted_notes)
    treble_lilypond_codes, bass_lilypond_codes = notes_to_score(durations, predicted_notes, normalized_file_path)
    using_lilypond(treble_lilypond_codes, bass_lilypond_codes, file_name)


def main(file_path, file_name):
    # converting if the audio is not wav
    if not file_path.endswith('.wav'):
        file_path = convert_to_wav(file_path)
    # Load the audio file using librosa
    audio, sr = librosa.load(file_path, sr=None)
    # Normalize the audio using RMS normalization
    normalized_audio = rms_normalize(audio)
    normalized_file_path = 'normalized1.wav'
    # Writing the normalized audio features into the path
    sf.write(normalized_file_path, normalized_audio, sr)
    # making the score on pdf file
    writing_score(normalized_file_path, file_name)


if __name__ == '__main__':
    file_p = r'C:\Users\shoam\Downloads\Virtual-Piano-19_41_31.wav'
    file_n = "little"
    main(file_p, file_n)



