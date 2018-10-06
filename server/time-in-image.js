const fs = require("fs");
const request = require("request");
const Jimp = require("jimp");
const tzlookup = require("tz-lookup");
const moment = require("moment-timezone");

const make8x8ImageBufferWith4Colors = c=>{
	return new Promise((resolve,reject)=>{
		let imageData = [];
		for (var i=0; i<64; i++) {
			let colorIndex;

			if (i<32) {
				colorIndex = (i%8<4)? 0: 1;
			} else {
				colorIndex = (i%8<4)? 2: 3;
			}

			imageData = imageData.concat([
				c[colorIndex][0],
				c[colorIndex][1],
				c[colorIndex][2],
			]);
		}

		new Jimp({
			width: 8,
			height: 8,
			data: Buffer.from(imageData)
		}, (err,image)=>{
			resolve(image.getBufferAsync(Jimp.MIME_PNG));
		});
	});
}

const makeTimeImageBuffer = (time)=>{ // 24,60,60
	return new Promise((resolve,reject)=>{
		let h = ((time[0])/24)*255;
		let m = ((time[1])/60)*255;
		let s = ((time[2])/60)*255;
	        
		make8x8ImageBufferWith4Colors([
			[h,m,s],
			[s,h,m],
			[m,s,h],
			[0,0,0]
		]).then(buffer=>{
			resolve(buffer);
		});
	});
};

const generateCharacters = (amount)=>{
	let out = "";
	let choice = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-".split("");
	for (var i=0; i<amount; i++) {
		out+=choice[Math.floor(Math.random()*choice.length)];
	}
	return out;
}

const TimeInImage = function (app,path) {
	this.onRequest = ()=>{};

	app.get(path+"/:random", (req,res)=>{
		this.onRequest(req);

		res.header({"Content-Type": "image/png"});

		let ip = (req.ip.split(":")[3]);

		request.post({
			url: "https://www.iplocation.net",
			form: { query: ip },
			headers: { referer: "https://www.iplocation.net" }
		}, (err,_,body)=>{
			if (err) {
				console.log(err);
				return res.send();
			}

			try {
				body = body
					.split("ipinfo.io</a>")[1].split("</table>")[0]
					.split("<tr>")[4].split("<td>");

				let tz = tzlookup(
					body[3].split("</")[0],
					body[4].split("</")[0]
				);

				let time = moment().tz(tz).format("HH:mm:ss")
					.split(":").map(x=>parseInt(x));

				makeTimeImageBuffer(time).then(buffer=>{
					res.end(buffer);
				});
			} catch(err) {
				console.log(err);
				res.send();
			}
		});
	});

	app.get(path, (req,res)=>{
		res.redirect(path+"/"+generateCharacters(8)+".png");
	});
}

module.exports = TimeInImage;