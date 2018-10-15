const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

// buttons
const photoButton = document.querySelector('.takephoto');
const redButton = document.querySelector('.redeffect');
const splitButton = document.querySelector('.rgbsplit');
const greenButton = document.querySelector('.greenscreen');

// global filter variable
let filter = 0;

function getVideo() {
  // this returns a promise, needs .then
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      video.src = window.URL.createObjectURL(localMediaStream);
      video.play();
    })
    .catch(err => {
      console.error("Web cam error!", err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  setInterval(() => {
    // console.log("filter: " + filter);
    ctx.drawImage(video, 0, 0, width, height);
    // take pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // mess with them
    if (filter === 1)
      pixels = redEffect(pixels);
    else if (filter === 2)
      pixels = rgbSplit(pixels);
    // ctx.globalAlpha = 0.7;
    else if (filter === 3)
      pixels = greenScreen(pixels);

    //put them back
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

// onClick is in the index.html <button> tag
function takePhoto() {
  snap.currentTime = 0;
  snap.play();

  // take data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src=${data} alt="ME!" />`;
  strip.insertBefore(link, strip.firstChild);
}

// effects functions
function redEffect(pixels) {
  // increment by 4 for RGBA (1 item for each)
  for (let i = 0; i < pixels.data.length; i += 4) {
    // playing around with colors
    pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    // playing around with colors
    pixels.data[i - 150] = pixels.data[i + 0]; // RED
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue    
  }
  return pixels;
}

// play around with sliders while button is toggled
function greenScreen(pixels) {
  const levels = {};
  
  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (let i = 0; i < pixels.data.length; i = i + 4) {
    let red = pixels.data[i + 0];
    let green = pixels.data[i + 1];
    let blue = pixels.data[i + 2];
    // let alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);

photoButton.addEventListener('click', takePhoto);

redButton.addEventListener('click', function () {
  filter !== 1 ? filter = 1 : filter = 0;
  greenButton.style['background-color'] = "initial";
});

splitButton.addEventListener('click', function () {
  filter !== 2 ? filter = 2 : filter = 0;
  greenButton.style['background-color'] = "initial";
});

greenButton.addEventListener('click', function () {
  filter !== 3 ? filter = 3 : filter = 0;
  if (filter === 3)
    this.style['background-color'] = "green";
  else
    this.style['background-color'] = "initial";
});
