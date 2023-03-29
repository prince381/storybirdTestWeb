import './style.css'
import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
  const apiURL = 'https://storybird-test.herokuapp.com/api/v1';
  
  const imageList = document.querySelector('.image-list');
  const currentImage = document.getElementById('current');
  const audio = document.getElementById('audio');
  const form = document.querySelector('.input-form');
  const button = document.getElementById('generate');

  form.addEventListener('submit', async (e) => {
    button.textContent = 'Generating...';
    e.preventDefault();
    const input = document.getElementById('storyData');
    const inputVal = input.value;
    
    if (!inputVal) return;

    const story = JSON.parse(inputVal);
    console.log(story);

    const generateImages = axios.post(`${apiURL}/image`, { story: story });
    const generateAudio = axios.post(`${apiURL}/audio`, { story: story });

    const [imageResponse, audioResponse] = await Promise.all([generateImages, generateAudio]);
    console.log(imageResponse, audioResponse);

  });

  const audioEvent = new EventSource(`${apiURL}/audio-stream`);
  const imageEvent = new EventSource(`${apiURL}/image-stream`);

  audioEvent.addEventListener('message', (e) => {
    const data = JSON.parse(e.data);
    if (data.url) {
      audio.src = data.url;
      audio.play();
      button.textContent = 'Submit';
    };
    console.log(data);
  });

  audioEvent.addEventListener('error', (err) => {
    console.log(err);
  });

  imageEvent.addEventListener('message', (e) => {
    const data = JSON.parse(e.data);
    console.log(data);
    if (data.imageUrls) {
      currentImage.src = data.imageUrls[0];
      currentImage.removeAttribute('hidden');
      data.imageUrls.forEach((url) => {
        const imgContainer = document.createElement('li');
        const img = document.createElement('img');
        img.src = url;
        imgContainer.appendChild(img);
        imageList.appendChild(imgContainer);
      });
    }
  });

  imageEvent.addEventListener('error', (err) => {
    console.log(err);
  });
})