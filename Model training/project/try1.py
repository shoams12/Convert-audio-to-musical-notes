import os
from tensorflow.python.util.tf_export import keras_export
from tqdm import tqdm
import pandas as pd
import numpy as np
from scipy.io import wavfile
import librosa
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, GlobalAveragePooling1D, Dense, Dropout, Activation
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint
from datetime import datetime

# Load metadata for training and testing
df_train = pd.read_csv("yourTrainMetadataPath.csv")
df_test = pd.read_csv("yourTestMetadataPath.csv")

# Feature extraction function
def Feature_extractor(file):
    audio, sample_rate = librosa.load(file, res_type='kaiser_fast')
    mfccs_features = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40)
    mfccs_scaled_features = np.mean(mfccs_features.T, axis=0)
    return mfccs_scaled_features

# Extract features and labels for training data
extracted_features_train = []
for index, row in tqdm(df_train.iterrows()): # df_train is a pandas DataFrame containing the training data
    file_name = os.path.join(os.path.abspath('pathToYourTrainDatasetFolder/'), str(row["FileName"]))
    final_class_label = row["Class"]
    data = Feature_extractor(file_name)
    extracted_features_train.append([data, final_class_label])

# Convert to DataFrame
extracted_features_df_train = pd.DataFrame(extracted_features_train, columns=['features', 'class'])

# Extract features and labels for testing data
extracted_features_test = []
for index, row in tqdm(df_test.iterrows()):
    file_name = os.path.join(os.path.abspath('pathToYourTestDatasetFolder/'), str(row["FileName"]))
    final_class_label = row["Class"]
    data = Feature_extractor(file_name)
    extracted_features_test.append([data, final_class_label])


# Convert to DataFrame
extracted_features_df_test = pd.DataFrame(extracted_features_test, columns=['features', 'class'])

@keras_export("keras.utils.to_categorical")
def to_categorical(y, num_classes=None, dtype="float32"):

    """Converts a class vector (integers) to binary class matrix.

    E.g. for use with `categorical_crossentropy`.

    Args:
        y: Array-like with class values to be converted into a matrix
            (integers from 0 to `num_classes - 1`).
        num_classes: Total number of classes. If `None`, this would be inferred
          as `max(y) + 1`.
        dtype: The data type expected by the input. Default: `'float32'`.

    Returns:
        A binary matrix representation of the input as a NumPy array. The class
        axis is placed last.

    Example:

    >>> a = tf.keras.utils.to_categorical([0, 1, 2, 3], num_classes=4)
    >>> print(a)
    [[1. 0. 0. 0.]
     [0. 1. 0. 0.]
     [0. 0. 1. 0.]
     [0. 0. 0. 1.]]

    >>> b = tf.constant([.9, .04, .03, .03,
    ...                  .3, .45, .15, .13,
    ...                  .04, .01, .94, .05,
    ...                  .12, .21, .5, .17],
    ...                 shape=[4, 4])
    >>> loss = tf.keras.backend.categorical_crossentropy(a, b)
    >>> print(np.around(loss, 5))
    [0.10536 0.82807 0.1011  1.77196]

    >>> loss = tf.keras.backend.categorical_crossentropy(a, a)
    >>> print(np.around(loss, 5))
    [0. 0. 0. 0.]
    """
    y = np.array(y, dtype="int")
    input_shape = y.shape

    # Shrink the last dimension if the shape is (..., 1).
    if input_shape and input_shape[-1] == 1 and len(input_shape) > 1:
        input_shape = tuple(input_shape[:-1])

    y = y.reshape(-1)
    if not num_classes:
        num_classes = np.max(y) + 1
    n = y.shape[0]
    categorical = np.zeros((n, num_classes), dtype=dtype)
    categorical[np.arange(n), y] = 1
    output_shape = input_shape + (num_classes,)
    categorical = np.reshape(categorical, output_shape)
    return categorical

# Convert labels to categorical
from sklearn.preprocessing import LabelEncoder
import joblib

LE = LabelEncoder()
print(to_categorical(LE.fit_transform(extracted_features_df_train['class'])))
y_train = to_categorical(LE.fit_transform(extracted_features_df_train['class']))
# Save fitted LabelEncoder for using the save model later
joblib.dump(LE, 'label_encoder.pkl')
y_test = to_categorical(LE.transform(extracted_features_df_test['class']))

# Prepare features
X_train = np.array(extracted_features_df_train['features'].tolist())
X_test = np.array(extracted_features_df_test['features'].tolist())

# Display shapes
print("Shape Of X_train:", X_train.shape)
print("Shape Of X_test:", X_test.shape)
print("Shape Of y_train:", y_train.shape)
print("Shape Of y_test:", y_test.shape)
print(y_test.shape[1])
# Model configuration
num_labels = y_train.shape[1]
model = Sequential()
model.add(Conv1D(filters=64, kernel_size=3, activation='relu', input_shape=(40, 1)))
model.add(MaxPooling1D(pool_size=2))
model.add(Conv1D(filters=128, kernel_size=3, activation='relu'))
model.add(MaxPooling1D(pool_size=2))
model.add(Conv1D(filters=256, kernel_size=3, activation='relu'))
model.add(MaxPooling1D(pool_size=2))
model.add(GlobalAveragePooling1D())
model.add(Dense(128, activation='relu'))
model.add(Dropout(0.3))
model.add(Dense(num_labels, activation='softmax'))
model.compile(loss='categorical_crossentropy', metrics=['accuracy'], optimizer='adam')

# Reshape input data
X_train = X_train.reshape(X_train.shape[0], X_train.shape[1])
X_test = X_test.reshape(X_test.shape[0], X_test.shape[1])

# Model training
num_epochs = 100
num_batch_size = 32
# Save The Model
checkpointer = ModelCheckpoint(filepath='audio_classification.hdf5', verbose=1, save_best_only=True)
start = datetime.now()
history = model.fit(X_train, y_train, batch_size=num_batch_size, epochs=num_epochs,
                    validation_data=(X_test, y_test), callbacks=[checkpointer])

# Model evaluation
test_accuracy = model.evaluate(X_test, y_test, verbose=0)
print("Test Accuracy:", test_accuracy[1])

# Example of testing on a new audio file
filename = "audioExample.wav"
audio, sample_rate = librosa.load(filename, res_type='kaiser_fast')
mfccs_features = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40)
mfccs_scaled_features = np.mean(mfccs_features.T, axis=0)
mfccs_scaled_features = mfccs_scaled_features.reshape(1, -1)

predicted_label = np.argmax(model.predict(mfccs_scaled_features), axis=-1)
prediction_class = LE.inverse_transform(predicted_label)
print("Predicted Class:", prediction_class)

import matplotlib.pyplot as plt

# Plot training & validation accuracy and loss values
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Training Metrics')
plt.xlabel('Epoch')
plt.legend()
plt.show()
