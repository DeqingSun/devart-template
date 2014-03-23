This project has been tested on Chromecast for multi-screen installation. Most recent posters will be casted on screens with Chromecast.

![Cast Image](../project_images/cast_img.jpg?raw=true "Cast Image")

The main screen with a Plinko Poetry interface is connected to computer directly and each of the rest screens has a Chromecast. The main tab in Chrome browser draws Plinko Poetry interface and each of the rest tabs has Chromecast sender app in JavaScript. Those sender apps are connected to default media receiver on Chromecast, showing images from specified URL on screen.

Each sender app tab is connected to Google App Engine via Channel API for realtime notification. When a new poster is generated, server side code will figure out content on each screen, and push image URLs to sender apps. Each sender app will relay the URL to Chromecast through Google Cast extension, and those images will be display on multiple screens. 

Chromecast is used here for simplifing installation structure and complexticy of deployment. Since there will be only one computer for the whole installation.
