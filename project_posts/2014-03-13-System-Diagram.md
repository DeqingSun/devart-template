System Diagram

![Plinko_Sys_Diagram](../project_images/Plinko_Sys_Diagram.jpg?raw=true "Plinko_Sys_Diagram")

For on-site installation, there will be one interactive screen and a few screens showing recently generated posters. Player can drop a chip, and it randomly hits pegs on the way down. The chip's path will be recorded by a webcam, which highlights the word under each peg, with the untouched pegs automatically darkened. Our algorithm will use result from Google Image search to generate a unique pattern as a background, and overlay the generated poem on it to create a poster.

Once a poster is generated, it will be inserted into the timeline of posters. The computer will display the most recent posters on those screens right to the Plinko Poetry interface one. The computer sends URLs of these picture to Chromecasts through WiFi and Chromecasts display these images on screen.

If viewers like any poster on screen, they can print a physical copy on site. The prints become mementos of the exhibition that viewers can create and collect.

All code will be hosted on Google App Engine, and the installation only need Chrome to open webpages and run all the code.
