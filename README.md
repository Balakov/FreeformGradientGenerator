## Freeform Gradient Generator

![Cat_Preview](/Cat_Preview.png)

Adobe Illustrator CC has a funky freeform gradient tool that has no equivalent in the design software I use (Affinity Designer & Inkscape), and there's really no way of working around it.

This is my attempt to bypass that restriction. It's just interpolating colours, how hard can it be! It's actually a bit more difficult than I estimated, and I'm almost certain this isn't the best way of doing it. The maths in here is dodgy for sure, but it works well enough for my needs.

Also the UI is awful, please don't judge me on that. It would be really nice to be able to drag the size of rectangular colour points instead of using input sliders, but rectangular colour points aren't actually that useful, so I didn't bother tidying it up.

https://balakov.github.io/FreeformGradientGenerator/

![Preview](/Preview.png)

Click and drag the points on the image to move the colours around.

 - Toggle Points - turns off the colour points so you can right-click save a clean image.
 - Toggle Overlay - turn image overlay on/off if you've uploaded one.
 - Random Colours - Sets all of the colour points to random colours. If you want to lock a colour so it's not affected, click the "Rnd Locked" checkbox for the colour.
 - Reference Colours - Set colour points to red, yellow, green and blue.
 - Clear Overlay - Remove the uploaded overlay.

Overlay files should be a PNG or SVG square mask. It will be drawn over the gradient so you can use it as a guide when making a gradient to fill a specific shape. The first time you upload an image you might have to move a colour point to get the overlay to display.

If a colour has a width and height of zero then is will be treated as a circular point. Adding width or height will convert it to a rectangular colour patch, which isn't actually that useful it turns out.

The power slider will increase the influence of a colour.
