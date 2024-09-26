# 2d-eye

## Pages
https://isaactsampson.github.io/2d-eye/

## Notes
This example demonstrates how to render a 3D-like eye on a 2D canvas, eliminating the need for heavy 3D rendering libraries like Three.js. The motivation behind this project was to create eyes that follow the mouse along the margins of a concept website I'm developing, which you can check out here: https://sneaker-society-fe-108c13acc674.herokuapp.com/. Most of the existing examples I found didn’t achieve the 3D illusion I was looking for (like this example: https://codepen.io/whipcat/pen/ExKPQqZ), so I decided to build my own solution from scratch.

IMPORTANT - I encourage viewing this on desktop as it has not yet be optimised for mobile devices.

## Learning sources
I learnt to draw the ellipses here: https://stackoverflow.com/questions/10035150/html5-canvas-wireframe-sphere-in-2d

## How it works
This code draws an interactive eye that follows the mouse movement by using ellipses to represent the different components of the eye (iris, and pupil). It sets up a 2D canvas, draws the shapes with calculated dimensions, and rotates the entire eye based on the position of the mouse. The eye rolls in response to mouse movements by calculating the angle and distance between the mouse position and the center of the canvas, and then adjusts the drawing angles to simulate the eye "following" the cursor. It restricts the eye's movement to stay within a certain boundary (eyeRollRestriction) and prevents it from rotating too far.

The rendering is divided into multiple parts: the background (sclera) which is just a circle, the iris, and the pupil, which are drawn as ellipses using draw_section and draw_arcs. The mouse movement is tracked using the onMouseMove function, which updates the mouse coordinates and recalculates the angles for the eye's movement using calculateTheta. The canvas is then re-rendered with the new angles every time the mouse moves.
