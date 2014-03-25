Capturing video in HTML5 is possible in Google Chrome with getUserMedia method. 

```
function getVideo() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  navigator.getUserMedia({video: true}, successCallback, errorCallback);
}
```

For each frame from camera, we iterate through all pixels and filter out bright red pixels. Then we calculate center of detected blob to get disc's position in camera's view. And it's corresponding position on screen can be calculated by perspective transformation. 

By tracking disc's position on screen frame by frame, we can get it's path and highlight words on it's path and generate a poem and poster.

Here is a picture showing the computer vision process in Chrome, and a photo of screen and disc by a camera.

![Chrome tracking](../project_images/Camera_tracking.jpg?raw=true "Chrome tracking")


