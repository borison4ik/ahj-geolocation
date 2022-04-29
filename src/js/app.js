import { Timer } from 'easytimer.js';

import Modal from '../../node_modules/bootstrap/js/src/modal';

import '../../node_modules/bootstrap/scss/bootstrap.scss';
import '../css/style.scss';

window.onload = () => {
  const coordsModal = new Modal(document.querySelector('#coordsModal'));
  const form = document.getElementById('form');
  const formCoords = document.getElementById('formCoords');
  const inputText = document.getElementById('text');
  const inputCoords = document.getElementById('inputCoords');
  const timeLine = document.getElementById('time-line');

  const microBtn = document.getElementById('micro');
  const microControls = document.getElementById('micro-controls');
  const microTime = document.getElementById('microTime');
  const microApply = document.getElementById('microApply');
  const microStop = document.getElementById('microStop');

  let COORDS = null;
  const timer = new Timer();

  form.addEventListener('submit', onSubmitForm);
  formCoords.addEventListener('submit', onSubmitUserCoords);
  inputCoords.addEventListener('change', checkValidity);
  microBtn.addEventListener('click', onMicroBtnClick);
  microApply.addEventListener('click', onMicroApplyClick);
  microStop.addEventListener('click', onMicroStopClick);
  timer.addEventListener('secondsUpdated', () => {
    microTime.textContent = timer.getTimeValues().toString();
  });

  let stream = null;
  let recorder = null;
  let chunks = [];
  let audioURL = null;

  // micro record
  async function onMicroBtnClick() {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    recorder = new MediaRecorder(stream);

    recorder.addEventListener('start', (evt) => {
      chunks = [];
      console.log('recording start');
      microControls.classList.remove('visually-hidden');
      microBtn.classList.add('visually-hidden');
      timer.start();
    });

    recorder.addEventListener('dataavailable', (evt) => {
      console.log('data available');
      chunks.push(evt.data);
    });

    recorder.addEventListener('stop', (evt) => {
      console.log('recordind stopped');
      timer.stop();
      microTime.textContent = '00:00:00';
      const blob = new Blob(chunks);
      const audio = document.createElement('audio');
      audio.setAttribute('controls', true);
      audio.src = URL.createObjectURL(blob);
      const time = getTime();
      getCoords();
      setTimeout(() => {
        addMessage({ coords: COORDS, time, audio });
        inputText.value = '';
      }, 100);

      microControls.classList.add('visually-hidden');
      microBtn.classList.remove('visually-hidden');
    });

    recorder.start();
  }

  async function onMicroApplyClick() {
    recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
  }

  function onMicroStopClick() {
    microControls.classList.add('visually-hidden');
    microBtn.classList.remove('visually-hidden');

    recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
  }

  // text send
  function onSubmitUserCoords(evt) {
    evt.preventDefault();
    const { value } = inputCoords;

    if (isValid(value)) {
      console.log(value);
      const formatedCoords = formatCoords(value);
      const text = inputText.value;
      const time = getTime();

      setTimeout(() => {
        addMessage(COORDS, time, text);
        inputText.value = '';
        inputCoords.value = '';
        coordsModal.hide();
      }, 100);
    } else {
      inputCoords.classList.add('is-invalid');
    }
  }

  function onSubmitForm(evt) {
    evt.preventDefault();

    getCoords();
    const text = inputText.value;
    const time = getTime();

    setTimeout(() => {
      addMessage({ coords: COORDS, time, text });
      inputText.value = '';
    }, 100);
  }

  function formatCoords(val) {
    const reg = /^\[|\]$/gm;
    const reseltVal = String(val)
      .replace(reg, ' ')
      .split(',')
      .map((item) => item.trim());
    COORDS = {
      latitude: reseltVal[0],
      longitude: reseltVal[1],
    };
  }

  function checkValidity(evt) {
    if (isValid(inputCoords.value)) {
      inputCoords.classList.remove('is-invalid');
      inputCoords.classList.add('is-valid');
    } else {
      inputCoords.classList.add('is-invalid');
      inputCoords.classList.remove('is-valid');
    }
  }

  function isValid(val) {
    const reg = /^\[?\d{2}.\d{5}, ?-?\d{2}.\d{5}\]?/gm;
    return reg.test(String(val));
  }

  function getCoords() {
    if (!navigator.geolocation) {
      COORDS = userInputCoords();
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        COORDS = {
          latitude: latitude.toFixed(5),
          longitude: longitude.toFixed(5),
        };
      },
      (err) => {
        COORDS = userInputCoords();
      }
    );
  }

  function userInputCoords() {
    inputCoords.classList.remove('is-invalid');
    inputCoords.classList.remove('is-valid');
    coordsModal.show();
  }

  function addMessage(obj) {
    const { coords, time, text, audio } = obj;
    console.log('coords', coords);
    const card = document.createElement('div');
    card.className = 'card mb-3';
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = `${coords.latitude}, ${coords.longitude}`;
    const cardSubtitle = document.createElement('h6');
    cardSubtitle.className = 'card-subtitle mb-2 text-muted';
    cardSubtitle.textContent = time;
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardSubtitle);

    if (text) {
      const cardText = document.createElement('p');
      cardText.textContent = text;
      cardBody.appendChild(cardText);
    }

    if (audio) {
      cardBody.appendChild(audio);
    }
    card.appendChild(cardBody);
    timeLine.appendChild(card);
  }

  function getTime() {
    const date = new Date();
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const month =
      date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
    const year = String(date.getFullYear()).slice(-2);
    const h = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const m =
      date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const formated = `${day}.${month}.${year} ${h}:${m}`;

    return formated;
  }
};
