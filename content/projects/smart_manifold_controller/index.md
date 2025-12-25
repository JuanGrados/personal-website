---
title: "Smart Manifold Controller"
date: 2025-12-22
draft: false
summary: "A smart manifold controller made with ESP32-C3."
gallery:
  - media/cover.jpeg
  - media/pcb_v3.png
  - media/pcb_comparison.jpeg
  - media/pcb_design.png
  - media/pcb_case_1.jpeg
  - media/pcb_case_2.jpeg
  - media/usbc_solder.jpeg
  - media/pcb_v3_fix.jpeg
  - media/hoses_1.jpeg
  - media/cabinet_1.jpeg
  - media/final_installation_2.jpeg
  - media/final_installation_3.jpeg

---
![Final installation](media/final_installation_3.jpeg?align=right&width=400px)

## Why this project exists

The motivation for this project was to make the life of my parents easier. They have a well in their house, and they use it to suminister water to the house, irrigate the garden (divided in two sections) and to fill the water tank for a small green house.
In the past, they used to use manual valves to control the water flows for these four different locations. 
If this wasn't inconvient enough the valves were located in different places around the house.
Imagine the situation, every time they wanted to fill the green house water tank they had to go to the green house, open the valve, go to the previously used valve and close it and then turn on the well's pump. 
This was a very tedious process and extreamly umpractical. That is why I decided to create this project.

## Design goals

For this project I had multiple design goals, some of them were related to the independent fuctionality of the controller, other to its integration with the smart home system, and finally to the overall functionality of the system.

### Independent functionality goals

- Control four ball water valves.
- Integrare four water flow sensors.
- To be able to operate the valves from the controller.
- Over-the-air firmware updates.

### Integration with smart home system goals

- Controllable from Home Assistant.

### Overall functionality goals

- Redundant manual system in case the controller fails.

{{< clear >}}

## Hardware choises

In the past I have used ESPHome to create custom sensors and relay cotrollers for my projects, and I have found it to be a great tool for this purpose. It is highly integrated with Home Assistant and it is easy to program. Additionally, it offeres over-the-air firmware updates, which makes it possible for me to update the firmware of the controller without the need to physically access it, even from a remote location.

I have chosen [__ESP32-C3-Mini-1__](https://documentation.espressif.com/esp32-c3-mini-1_datasheet_en.pdf) as microcontroller given its low price, for being compatible with ESPHome, and for its ease of programming. One drawback of this microcontroller is its limited number of GPIOs, which is why I have chosen to use multiplexers to increase the number of GPIOs available. In concreate, I have used two [__MCP23017__](https://www.microchip.com/wwwproducts/en/MCP23017) I2C multiplexers, this [__multiplexer is supported by ESPHome__](https://esphome.io/components/mcp230xx/#mcp23017-component).

Once I started this project I thought that it would be interesting to include water flow sensors in each water line to monitor water consumption. For this purpose I have chosen to use [__YF-B1__](https://media.digikey.com/pdf/data%20sheets/seeed%20technology/114991171_web.pdf) water flow sensors, this sensor is supported by ESPHome via the [__Pulse Meter Sensor Integration__](https://esphome.io/components/sensor/pulse_meter/). One problem with this sensor is that it operates at 5-15V, which is why I have chosen to use a 5V to 3.3V logic level shifter [__TXS0104__](https://www.ti.com/lit/ds/symlink/txs0104e.pdf?ts=1766471560239&ref_url=https%253A%252F%252Fwww.mouser.in%252F).

Finally, I wanted to include a way to control the valves directly from the controller. For that I included two push buttons and indicator LEDs.
One push button is to select the valve to control and the other is to toggle the valve. Each valve gets assigned three LED's, one to indicate if it is open, one if it is closed and one to indicate that it is the currently selected valve.


For the valves I have chosen some relatively cheap [__5V ball valves__](https://de.aliexpress.com/item/1005005048948440.html?spm=a2g0o.order_list.order_list_main.31.4af9180209gZnT&gatewayAdapt=glo2deu) with integrated limit switches for the open and closed positions. 


{{< row >}}
![Valve schematic](media/valve_schematic.png?cols=6)
![Valve type](media/valves_type_2.jpeg?cols=6&ratio=16/9)
{{< /row >}}



These valves are operated by a simple DC motor, which means that to control them I have to flip the polarity of the power supply to open or close the valve. To do this I have used two dual H-Bridge motor drivers [DRV8833](https://www.ti.com/lit/ds/symlink/drv8833.pdf?ts=1766487599607&ref_url=https%253A%252F%252Fwww.google.com%252F). 


Therefore, the required inputs and outputs are:

__Inputs__:
- 4 water flow sensors (YF-B1)
- 2 push buttons
- 8 limit switches

__Outputs__:
- 8 pins for the H-Bridge motor drivers
- 12 indicator LEDs (Open, Closed, Selected for each valve)

All these brings the total number of inputs and outputs to 34, which is more than the ESP32-C3-Mini-1 has available. That is why I have chosen to use two MCP23017 I2C multiplexers to increase the number of GPIOs available to 45. In reality there are also some of the original 15 GPIOs that are not available or are needed for other purposes than controlling inputs and outputs.

### Schematic

{{< pdf "media/schematic.pdf" "center" >}}

## Firmware

The firmware turned to be a bit more complicated than I expected. There were multiple inputs and outputs to "stitch" together to control a single valve.
Namely, two limit switches, two H-Bridge motor driver outputs, three indicator LEDs and the push buttons to select and toggle the valve.

First I defined the physical inputs and outputs. One I2C definition to connect the two multiplexers and four flow sensor inputs. 
Then I created gpio switch definitions for the open/close H-Bridge outputs, the limit switches signals and the indicator LED's.
All these definitions then are connected together in a switch template definition with a lambda to define the state of the valve, and turn_on_action and turn_off_action to control the H-Bridge outputs.

The firmware for the controller is shown below:

{{< code "media/controlador-distribuidor-pozo.yaml" >}}

One of the reasons to chose ESPHome was that the entities that are created in the firmware are automatically available in Home Assistant, which makes it easy to create automations and dashboards.

## What didn't work at first

![PCB fix](media/pcb_v3_fix.jpeg?align=right&width=500px&ratio=1/1)
This being my first time making a (rather complex) custom PCB, it wasn't unexpected to have some issues. For example, the H-Bridge driver DRV8833 has a nsleep pin that has to be pulled high to enable the driver which I of course forgot to include in the PCB and I had to solder a jumper wire to fix it.
Also, there is a pin called VINT that has to be connected to GND with a capacitor, which I also didn't include in the PCB and I had to solder a capacitor to fix it. You can see these two fixes in the image on the right.


{{< clear >}}

## 3D printed case

To finish the project I have designed a 3D printed case to house the controller.
Here is a 3D view of the case:

{{< stl "media/box.stl" "400px" >}}

## Results

At the end I managed to get everything working and I was able to control the valves and monitor the water flow from Home Assistant, as well as control the valves directly from the controller. Given that this was my first time making a custom PCB I was not too confident that it would work long term, therefore I have inluced a physical bypass manual manifild in case the controller fails. You can see this bypass in the image as the second set of pipes behind the pipes with the electric valves.

![Final installation](media/final_installation_2.jpeg?align=center&width=500px)

