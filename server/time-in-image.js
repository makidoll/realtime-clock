const fs = require("fs");
const request = require("request");
const Jimp = require("jimp");

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
		let url = "https://timezoneapi.io/api/ip/"
		if (ip.substring(0,10)!="192.168.1.") {
			url+="?ip="+ip;
		}

		request(url, (err,_,body)=>{
			if (err) {
				console.log(err);
				res.send();
				return;
			}

			try {			
				body = JSON.parse(body).data;

				let time = body.datetime.time
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