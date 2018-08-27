<img height="130" src="https://maki.cat/vrchat/realtime_clock_github.png"/>

> 🕒 Show the current time where you live on an analogue clock in VRChat.

## [Download .UnityPackage here!](https://github.com/makitsune/realtime-clock/releases)

It uses https://maki.cat for finding the time with your IP address, therefore it can sometimes return an inaccurate location, which can cause the time to be offsetted by an hour or two. And fyi, I don't track anything from my HTTP GET requests... That would be mean...

You can change the background and foreground colours in the material and change the numbers texture aswell. I kept the .ai file so you can change fonts easily. The mesh uses vertex colors to index each time handle so keep that in mind if you want to edit it!

## How is time served?

It fetches time from https://maki.cat/time-in-image

This is done by looking up your time from your IP using https://timezoneapi.io and then converts hours (h), minutes (m), seconds (s): 24,60,60 into 255,255,255.

It then generates an 8x8 .png file where it has 4 sections of colour assembled like this: (each section shows r,g,b values)

<table>
	<tr><td>h,m,s</td><td>s,h,m</td></tr>
	<tr><td>m,s,h</td><td>0,0,0</td></tr>
</table>

The shader then looks up each value from the three sections and averages them to get an accurate reading of the current time. The reason why we split them up between red, green and blue is because we were having issues with sRGB and gamma changing them. Though by using VRC_Panorama, this might be completely unnecessary.

**Caching** was also an issue which we solved by redirecting `/time-in-image` to `/time-in-image/[random string of letters].png`. Otherwise it would turn back time when you rejoined your world.

My **web server** to generate the image was made using Node.js with the modules: `express`, `request` and `jimp`

## Thank you!

Made by [Maki](https://github.com/makitsune) and
[Desunyan](https://github.com/Shii2) with lots of love~ *nyan, nyan* <3

*P.S. dont head pat me in vrchat pls...*<br>
*P.P.S. Desunyan approves this readme. meow~ ^.^*<br>
*P.P.P.S. he actually just commited that^, so he could pin to his github... x3*
