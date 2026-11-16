---
title: Tiny PCB on the UV laser
description: Scaling an ATtiny3226 board down to 6.5 mm on the xTool F2 Ultra UV, with traces down to about 0.1 mm.
---

# Tiny PCB on the UV laser

**Author:** Svavar Konráðsson. See more of his work
[here](https://fabacademy.org/2023/labs/isafjordur/students/svavar-konradsson/index.html).  
**Date:** March 2026  
**Machine:** [xTool F2 Ultra UV](../../machines/xtool/index.md)

The new UV laser is giving us amazing results at
[Fab Lab Ísafjörður](https://www.fabisa.is). Trace width down to about 0.1 mm,
and it cuts the board outline without charring! This is the future of PCB
production in Fab Labs.

Neil's [hello.t3226-MU board](https://fabacademy.org/2026/classes/embedded_programming/t3226/hello.t3226-MU/hello.t3226-MU.png),
which has an ATtiny3226 in a tiny VQFN package, was scaled down for the first
test, and then *scaled down again* until its longer edge was only 6.5 mm. And
it works! The xTool project files for both runs are at the end of each
section.

The UV laser lets us use pretty much any tiny modern component, except for
most BGA (ball grid array) packages, because we can't do in-pad vias.

## First run

![The scaled down board next to chips and coffee beans for scale](../img/uv-laser-tiny-pcb/header.jpeg)

![Top view with chips, a wafer piece and coffee beans for scale](../img/uv-laser-tiny-pcb/topwaf.jpeg)

![Close-up of the scaled down board](../img/uv-laser-tiny-pcb/thinp.jpeg)

![Test sheet with several boards at different settings](../img/uv-laser-tiny-pcb/proto.jpeg)

[:lucide-download: First run settings, set.xcs](../img/uv-laser-tiny-pcb/set.xcs){ .md-button }

## Second run

![The first and second boards next to a VQFN chip and an SOIC chip](../img/uv-laser-tiny-pcb/s1-11-03-2026_1.jpeg)

![Second run board, top view](../img/uv-laser-tiny-pcb/top2.jpeg)

![Second run board](../img/uv-laser-tiny-pcb/s1-11-03-2026.jpeg)

![xTool Studio settings for the second run](../img/uv-laser-tiny-pcb/settings.jpeg)

![The 6.5 mm board next to a ruler](../img/uv-laser-tiny-pcb/overv.jpeg)

[:lucide-download: Second run settings, smaller_set.xcs](../img/uv-laser-tiny-pcb/smaller_set.xcs){ .md-button }

## Related documentation

- [UV laser PCB settings](uv-laser-pcb.md)
- [xTool F2 Ultra UV](../../machines/xtool/index.md)
