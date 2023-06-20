# Copyright 2021 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Main script to run the object detection routine."""
import argparse
import sys
import time

import cv2
from tflite_support.task import core
from tflite_support.task import processor
from tflite_support.task import vision
import utils

def detect(model: str, camera_id: int, width: int, height: int, num_threads: int,
        #enable_edgetpu: bool) -> None:			# 2023.06.20 DEL
        enable_edgetpu: bool, fname: str) -> None:	# 203.06.20 ADD
  """Continuously run inference on images acquired from the camera.

  Args:
    model: Name of the TFLite object detection model.
    camera_id: The camera id to be passed to OpenCV.
    width: The width of the frame captured from the camera.
    height: The height of the frame captured from the camera.
    num_threads: The number of CPU threads to run the model.
    enable_edgetpu: True/False whether the model is a EdgeTPU model.
  """

  # Initialize the object detection model
  base_options = core.BaseOptions(
      file_name=model, use_coral=enable_edgetpu, num_threads=num_threads)
  detection_options = processor.DetectionOptions(
      #max_results=3, score_threshold=0.3)	# 2023.06.20 DEL
      max_results=5, score_threshold=0.3)	# 2023.06.20 ADD
  options = vision.ObjectDetectorOptions(
      base_options=base_options, detection_options=detection_options)
  detector = vision.ObjectDetector.create_from_options(options)

  # Continuously capture images from the camera and run inference

  #image = cv2.imread("./photo.jpg")	# 2023.06.15 ADD # 203.06.20 DEL
  image = cv2.imread("./" + fname)	# 2023.06.20 ADD

  # Convert the image from BGR to RGB as required by the TFLite model.
  rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

  # Create a TensorImage object from the RGB image.
  input_tensor = vision.TensorImage.create_from_array(rgb_image)

  # Run object detection estimation using the model.
  detection_result = detector.detect(input_tensor)

  # 2023.06.15 ADD -->
  category_names = [detection.categories[0].category_name for detection in detection_result.detections]
  #unique_category_names = list(set(category_names))
  #unique_category_names_sorted = sorted(unique_category_names[:], key=lambda x: x[0])
  print(detection_result)
  print(len(category_names))
  print(category_names)
  #print(unique_category_names)
  #print(unique_category_names_sorted)
  # <-- 2023.06.15 ADD

  # Draw keypoints and edges on input image
  image = utils.visualize(image, detection_result)

  cv2.imwrite('./d'+fname, image)	# 2023.06.15 ADD

  #return unique_category_names_sorted
  #return unique_category_names
  return category_names
