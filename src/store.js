import { get, writable } from 'svelte/store';

export const store = writable({
  data_buff: 0,
  state: 'initial', // initial | active | terminated
  timer: null,
});

export const requestSerialPort = async () => {
  const serial = navigator.serial;
  const port = await serial.requestPort();
  await port.open({ baudRate: 9600 });
  store.update((value) => ({
    ...value,
    state: 'active',
  }));

  const reader = port.readable.getReader()
  const writer = port.writable.getWriter()

  return {port, reader, writer}
};


import avrbro from './dist/avrbro.m.js'
const { parseHex, openSerial, flash, reset } = avrbro

// Here's just an helper function to use async/await with FileReader...
const readFileAsync = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export const flashMyBoard = async () => {
  // connect to device using web serial API
  const serial = await requestSerialPort()
  if (serial) {
    // get .hex buffer
    const response = await fetch('bin/app.ino.hex')
    console.log(response)
    console.log(serial)

    const data = await response.blob()
    const fileData = await readFileAsync(data)
    const hexBuffer = parseHex(new TextDecoder("utf-8").decode(fileData))
    
    // reset the board
    // await reset(serial)
    
    // upload .hex file
    const success = await flash(serial, hexBuffer, { boardName: 'nano' })
    if (success) {
      console.log('.hex file uploaded on board successfully!')
    } else {
      console.log('an error has occurred :(')
    }
  } else {
    console.log('operation canceled by user')
  }
}
