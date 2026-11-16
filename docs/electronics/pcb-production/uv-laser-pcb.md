---
title: UV laser PCB settings
description: Making PCBs on the xTool F2 Ultra UV, from Gerber files through EasyTrace 5000 to xTool Studio, with settings files.
---

# UV laser PCB settings

**Author:** Svavar Konráðsson. See more of his work
[here](https://fabacademy.org/2023/labs/isafjordur/students/svavar-konradsson/index.html).  
**Machine:** [xTool F2 Ultra UV](../../machines/xtool/index.md)

## EasyTrace 5000

I've found that if I go into the folder with the Gerber files, take the
`F_Cu.gbr` file into Ricardo's [EasyTrace 5000](https://cam.eltryus.design/easytrace5000/)
and use the Filled Polygon option in Isolation Routing, the process takes only
half as long as when you use the PNG of the traces and ablate all the copper
with the laser.

I first select Start with Laser:

![EasyTrace 5000: Start with Laser](../img/uv-laser-pcb/easytrace/01_laser.png)

Then select UV:

![EasyTrace 5000: selecting the UV laser](../img/uv-laser-pcb/easytrace/02_uv_laser.png)

Then I drag the `F_Cu.gbr` file into Isolation Routing:

![EasyTrace 5000: Isolation Routing](../img/uv-laser-pcb/easytrace/03_isolation.jpg)

On the right, I select SVG and xTool Studio:

![EasyTrace 5000: SVG output for xTool Studio](../img/uv-laser-pcb/easytrace/04_svg_xtool.png)

Then on the left, I select the `F_Cu.gbr` file:

![EasyTrace 5000 with the F_Cu.gbr file selected](../img/uv-laser-pcb/easytrace/05_easytrace5000.png)

Now I get the offset settings on the right side. For this board, a 1 mm offset
worked well. I use the Filled Polygon option.

![EasyTrace 5000: 1 mm offset with Filled Polygon](../img/uv-laser-pcb/easytrace/06_1mm_offset.png)

Then I hit Generate Laser Paths and export the SVG, and import the SVG into
xTool Studio.

## xTool Studio settings

I use [Gerber2PNG](https://gerber2png.fablabkerala.in/) to get the PNG files
and import them into the same project in xTool Studio. Then I use the Align
function to align them all together, and the Trace function in xTool Studio to
turn them into vectors.

Here are the settings I used for the traces:

![xTool Studio settings for the traces](../img/uv-laser-pcb/xtool/01_traces_settings_advanced.png)

Here are the settings I used for the holes and outline:

![xTool Studio settings for the holes and outline](../img/uv-laser-pcb/xtool/02_holes_and_outline_settings.png)

I make the different operations different colors, and then arrange the order
of operations by arranging the layers on the left.

Then I select the three dots next to the black Process. Under Processing path
(which means order of operations) I select User defining, and check By layer:

![xTool Studio: processing path set to By layer](../img/uv-laser-pcb/xtool/03_processing_settings.png)

[:lucide-download: Good UV settings, xTool .xcs file](../img/uv-laser-pcb/xtool/good_uv_laser_settings.xcs){ .md-button }

## Outcome

![The finished board seen at an angle](../img/uv-laser-pcb/outcome/01_45degrees.jpg)

I've found that the flatness of the PCB stock matters a lot. When it curves, I
get inconsistent results, like this:

![Uneven copper removal after 8 passes on curved stock](../img/uv-laser-pcb/outcome/02_8passes.jpg)

This was after 8 passes. After 2 more passes, all the copper was cleared:

![All copper cleared after 10 passes](../img/uv-laser-pcb/outcome/03_10passes.jpg)

There may be a little debris, oxidation or charring on the traces after laser
processing. I think they would work fine, but to make the traces a bit nicer I
used a wet sanding sponge to clean them up:

![Cleaning the traces with a wet sanding sponge](../img/uv-laser-pcb/outcome/04_sanding.jpg)

After sanding, the board looks like this:

![The board after sanding](../img/uv-laser-pcb/outcome/05_after_sanding.jpg)

The reason for using the UV laser on this board was the fine spaces between
the pads for the power-only USB-C connector in the top right corner. I
enlarged the pads that the metal housing goes into a lot, to get a better
mechanical connection. I tore up the connector on the last USB-C board I made.

Here is the final result:

![The finished board with the USB-C connector](../img/uv-laser-pcb/outcome/06_result.jpg)

## Related documentation

- [Tiny PCB on the UV laser](uv-laser-tiny-pcb.md)
- [xTool F2 Ultra UV](../../machines/xtool/index.md)
