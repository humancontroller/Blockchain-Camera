import asyncio
import websockets
import RPi.GPIO as GPIO
import time
import io
from PIL import Image
import os
import base64
import json
import hashlib
from detect import detect

gpio_shoot = 26

GPIO.setmode(GPIO.BCM)

GPIO.setup(gpio_shoot, GPIO.IN, pull_up_down=GPIO.PUD_UP)


async def handler(websockets):

    print("Connected")

    send_flg = False

    while websockets.open:

        sw = GPIO.input(gpio_shoot)

        if 0==sw and send_flg==False:
            
            ut = time.time()
            fname = str(ut) + '.jpg'
            print(fname)
            os.system('sh photo_shoot.sh ./' + fname)
            tmpimg = Image.open('./' + fname)

            with open('./'+fname, 'rb') as f:
              sha256 = hashlib.sha256(f.read()).hexdigest()

            with io.BytesIO() as output:
                tmpimg.save(output,format="JPEG")
                contents = output.getvalue()

                b64encoded = base64.b64encode(contents).decode('utf-8')
                d = {'image': b64encoded}

                objects = detect("efficientdet_lite0.tflite", 0, 300, 300, 4, False, fname)
                d['objects'] = objects
                d['filename'] = fname
                d['sha256'] = sha256

                json_data = json.dumps(d, indent=4)

                await websockets.send(json_data)

            send_flg = True
            print("ON")
            await asyncio.sleep(1)

        elif send_flg==True:
            send_flg=False
            print("OFF")

        await asyncio.sleep(0.01)

    print("Disconnected")


async def main():
    async with websockets.serve(handler, "localhost", 8001):
        await asyncio.Future()  # run forever

asyncio.run(main())
