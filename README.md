![1920x1080](https://github.com/humancontroller/Summer-HackaDOT-2023/assets/131235865/f800ef65-029d-4288-ab05-e1b380cb9b2a)
# Blockchain Camera
This is software to be installed on the Raspberry Pi 4 built into the Blockchain camera hardware.  
For information on how to make that hardware, refer to the BUILD INSTRUCTIONS of Blockchain Camera posted on HACKADAY.IO.
[HACKADAY.IO](https://hackaday.io/project/192538-blockchain-camera)

## 1.COMPONENTS
- Raspberry Pi 4 Model B 2GB  
- SanDisk microSD 32GB Extreme Pro U3 V30 A1  
- OSOYOO Raspberry Pi Touch Screen 3.5"  
- Raspberry Pi Camera V2  
- Adafruit Flat Flex Cables for Raspberry Pi Camera - 200mm  

## 2.TOOLS
- PC
- Micro SD Card Reader
- Wi-Fi
- USB Type-C - AC Power Supply

## 3.Raspberry Pi OS Installation 
Install Raspberry Pi OS (32-bit) on microSD using Raspberry Pi Imager on PC. 

Insert the microSD into the Raspberry Pi and boot.  
Add a user, set the password, configure and connect to the WiFi network.  

The version of the Linux OS when I installed it is as follows.  
```
$ lsb_release -a
No LSB modules are available.
Distributor ID:	Raspbian
Description:	Raspbian GNU/Linux 11 (bullseye)
Release:	11
Codename:	bullseye
$
$ uname -a
Linux raspberrypi 4.15.18-v7 #1 SMP Mon May 7 16:35:40 CST 2018 armv7l GNU/Linux
```

## 4.Enable Raspberry Pi Camera
```
$ sudo raspi-config
```
3 Inter face Options -> I1 Legacy Camera Enable/disable legacy camera support -> Yes -> OK -> Finish -> Yes -> Reboot  
Make sure the Raspberry Pi recognizes the camera.  
```
$ vcgencmd get_camera
supported=1 detected=1, libcamera interfaces=0
```

## 5.Increase Swap Space
Increase the swap space to prevent memory shortage.  
Check current swap space.  
```
$ swapon -s
```
Change CONF_SWAPSIZE in /etc/dphys-swapfile from 100 to 2048.  
```
CONF_SWAPSIZE=2048
```
Check that the swap space has increased.  
```
$ sudo /etc/init.d/dphys-swapfile restart
$ swapon -s
```

## 6.Touch Screen Settings
Use OSOYOO Raspberry Pi Touch Screen 3.5".  
Change screen resolution to 810x540.
When you run the shell to enable the touchscreen, the camera is not recognized.  
Therefore, save /boot/config.txt.  
```
$ cd /boot
$ sudo cp -p config.txt config.txt.bak
```
Download and unzip LCD_show_35hdmi.tar.gz.    
```
$ cd $HOME
$ curl -OL http://osoyoo.com/driver/LCD_show_35hdmi.tar.gz
$ tar -xzvf LCD_show_35hdmi.tar.gz
```
Change screen resolution to 810x540.  
```
$ cd LCD_show_35hdmi
$ sudo ./LCD35_810*540
```
Overwrite the saved config.txt to /boot/config.txt.
```
$ cd /boot
$ sudo cp -p config.txt.bak config.txt
```
Add the following lines to the end of /boot/config.txt.
```
hdmi_force_hotplug=1
hdmi_drive=2
hdmi_group=2
hdmi_mode=87
hdmi_cvt 810 540 60 6 0 0 0 
dtoverlay=ads7846,cs=0,penirq=25,penirq_pull=2,speed=10000,keep_vref_on=0,swapxy=0,pmax=255,xohms=150,xmin=199,xmax=3999,ymin=199,ymax=3999
```
Add the following line to the end of /boot/config.txt to rotate the display 90 degrees.  
```
display_hdmi_rotate=1
```
Add Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1" to /usr/share/X11/xorg.conf.d/40-libinput.conf as follows to rotate touch recognition by 90 degrees To do.  
```
        Identifier "libinput touchscreen catchall"
        MatchIsTouchscreen "on"
        Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1"
        MatchDevicePath "/dev/input/event*"
        Driver "libinput"
```
Reboot the Raspberry Pi and check that the screen has been rotated 90 degrees.  
Check that the touchscreen recognizes touches correctly.  

## 7.Software Keyboard Installation
Software keyboard is used for Metamask password input.  
```
$ sudo apt-get install matchbox-keyboard
Y
$ sudo apt-get install ttf-kochi-gothic xfonts-intl-japanese xfonts-intl-japanese-big xfonts-kaname
Y
$ sudo reboot
```
Replace /usr/share/matchbox-keyboard/keyboard.xml with keyboard.xml from this repository.  
Add the Software keyboard to the top panel.


## 8.Chromium Installation
```
$ sudo apt install chromium
Y
```

## 9.Metamask
Add Metamask to Chromium and create a wallet.  

## 10.Bunzz official ERC721 Minting Boilerplate
The software of NFT Camera is software modified from Bunzz's ERC721 Minting Boilerplate.  
Install up to 4. Update constant.js of ERC721 Minting Boilerplate.  
https://github.com/lastrust/erc721-minting-boilerplate  

Choose a blockchain to mint NFTs when installing this boilerplate.    
Keep some blockchain tokens of your choice in your wallet for the GAS fee.
I chose Astar Network, so anyone who chooses Astar Network can use erc721-minting-boilerplate-main/src/utils/constant.js from the NFT Camera repository.  

```
$ curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
$ sudo apt-get install -y nodejs
$ node -v
v16.20.0 
$ npm -v
8.19.4
$ sudo npm install -g yarn
$ yarn -v
1.22.19
$ cd erc721-minting-boilerplate-main/
$ npm i react-scripts
$ yarn install
$ cd $HOME
$ python -m pip install --upgrade pip setuptools
$ pip install websockets
```

## 11. Blockchain Camera Software Installation
Replace the files in the erc721-minting-boilerplate-main folder of this repository with your current files.  
And place the following three files of this repository in the $HOME directory.  
```
shutdown.py
shutdown.sh
start.sh
```

## 12.Autostart Settings
Place the autostart of this repository in the $HOME/.config/lxsession/LXDE-pi directory.  
