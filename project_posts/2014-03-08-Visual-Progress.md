Third prototype- After thinking it over, we thought that interaction became overcomplicated with the 'like/dislike' function, so we removed it. We came with a new idea: we can generate a POSTER with a poem. 

![Third version](../project_images/Plinko_poetry_version_3.gif?raw=true "Third version")

We ended up doing the kaleidoscope visual because we were really struggling with how to do a compelling visual. When you search for individual words in google images the results are often terrible clip art. You can see in this test we did with the word "camp", that the image results are pretty horiffic. 

![Third version](../project_images/camp.jpg?raw=true "Third version")

We tried different ways to manipulate the google images. We started doing basic tiling and you can see the results still aren't great. Basic tile with 'camp' image result:

![Third version](../project_images/Tiled_img.png?raw=true "Third version")

Moving on, we added some random shifting to the image. Still pretty bad. 

![Third version](../project_images/Tiled_img_shifted.jpg?raw=true "Third version")

And this is the image result for only image word, so if we added the images for the 5 or 6 other words, we were convinced it would just be a visual mess. 

We realized that we would have to manipulate the image results with an algorithm that visualized the results more abstractly. We really liked the initial idea of having the actual image result visible, but the searches were returning vastly different quality of images. 

Finally we decided to flatten those images in to a single one, trim it to a triangle and tile the triangle to form a kaleidoscopic background. We used that method to convert a random set images to an artistic collage. We put poem on that kaleidoscopic background to finish the poster. And it looks great each time.

How imagery is generated.

![Rendered GIF](../project_images/Poster_generation.gif?raw=true "Rendered GIF")

Procedural steps:
1. Play plinko and generate poem
2. Words are isolated
3. Each word search for top google image
4. Flatten each image into a single image
5. Create triangle from from flattened image
6. Tile it to form kaleidoscope image
7. Overlay poem on top of kaleidoscope image



