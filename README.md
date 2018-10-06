<img height="130" src="https://maki.cat/vrchat/realtime_clock_github.png"/>

> 🕒 Show the current time where you live on an analogue clock in VRChat.

## [Download .UnityPackage here!](https://github.com/makitsune/realtime-clock/releases)

It uses https://maki.cat for finding the time with your IP address, therefore it can sometimes return an inaccurate location, which can cause the time to be offsetted by an hour or two. And fyi, I don't track anything from my HTTP GET requests... That would be mean...

You can change the background and foreground colours in the material and change the numbers texture aswell. I kept the .ai file so you can change fonts easily. The mesh uses vertex colors to index each time handle so keep that in mind if you want to edit it!

## How is time served?

It fetches time from https://maki.cat/time-in-image

This is done by looking up your time from your IP using https://www.iplocation.net, `tz-lookup` and `moment-timezone`, then converts hours (h), minutes (m), seconds (s): 24,60,60 into 255,255,255.

It then generates an 8x8 .png file where it has 4 sections of colour assembled like this: (each section shows r,g,b values)

<table>
	<tr><td>h,m,s</td><td>s,h,m</td></tr>
	<tr><td>m,s,h</td><td>0,0,0</td></tr>
</table>

The shader then looks up each value from the three sections and averages them to get an accurate reading of the current time. The reason why we split them up between red, green and blue is because we were having issues with sRGB and gamma changing them. Though by using `VRC_Panorama`, this might be completely unnecessary.

**Caching** was also an issue which we solved by redirecting `/time-in-image` to `/time-in-image/[random string of letters].png`. Otherwise it would turn back time when you rejoined your world.

My **web server** to generate the image was made using Node.js with the modules: `express`, `request` and `jimp`

## How do I setup a server?

I would 1000% appreciate if you were to host it yourself. I'm like, 99.8% uptime, but I try my best~ You will need `node`, `npm` and `git` to continue.

Before running `app.js`, I recommend you take a look at the file and editing the settings variable at the top. You can easily attach `time-in-image.js` onto any Express server. https://maki.cat uses https and a few other middlewares before it gets to the route. If you need help settings things up, I'm on Discord at `Maki#4845`.

```sh
git clone https://github.com/makitsune/realtime-clock
cd realtime-clock/server
npm install
node app.js
```

Once running, a link will spew out with your local address. Take your public IP, add the port and path to it, and replace the old URL in the `VRC_Panorama` component with your new one. Make sure your IP/hostname is static. I use my [cloudflare-ddns](https://github.com/makitsune/cloudflare-ddns) for that.

If you want it to run indefinitely, I recommend using a process manager like `pm2`.

```sh
npm install pm2 -g
pm2 start app.js --name "Realtime Clock"
```

## Thank you!

Made by [Maki](https://github.com/makitsune) and
[Desunyan](https://github.com/Shii2) with lots of love~ *nyan, nyan* <3

*P.S. dont head pat me in vrchat pls...*<br>
*P.P.S. Desunyan approves this readme. meow~ ^.^*<br>
*P.P.P.S. he actually just commited that^, so he could pin to his github... x3*
