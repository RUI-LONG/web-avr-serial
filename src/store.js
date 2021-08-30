import { get, writable } from 'svelte/store';

export const store = writable({
  data_buff: 0,
  state: 'initial', // initial | active | terminated
  flashState: false, 
  timer: null,
});

export const requestSerialPort = async () => {
  const serial = navigator.serial;
  try{
    const port = await serial.requestPort();
    await port.open({ baudRate: 115200 });
    store.update((value) => ({
      ...value,
      state: 'active',
    }));
    
    const reader = port.readable.getReader()
    const writer = port.writable.getWriter()

    // TODO: Need to test Listen to data coming from the serial device.
    // Memo: if using line 24, comment out line 18 const reader = port.readable.getReader()
    // while (port.readable) {
    //   const reader = port.readable.getReader();
    
    //   try {
    //     while (true) {
    //       const { value, done } = await reader.read();
    //       if (done) {
    //         // Allow the serial port to be closed later.
    //         reader.releaseLock();
    //         break;
    //       }
    //       if (value) {
    //         console.log("value");
    //         console.log(value);
    //       }
    //     }
    //   } catch (error) {
    //     // TODO: Handle non-fatal read error.
    //     console.log(e)
    //   }
    // }
    return {port, reader, writer}

  } catch(e) {
    console.log(e)
  }
  return null;
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

export const flashBoard = async () => {
  // connect to device using web serial API
  let flashSuccess = false
  const serial = await requestSerialPort()

  if (serial) {
    // get .hex buffer
    const response = await fetch('bin/test.hex')
    // TODO: check response status
    // console.log(response)
    // console.log(serial)

    const data = await response.blob()
    const fileData = await readFileAsync(data)

    const hexBuffer = parseHex(new TextDecoder("utf-8").decode(fileData))
    // reset the board
    await reset(serial)
    
    // upload .hex file
    // TODO: check boardName
    try {
      flashSuccess = await flash(serial, hexBuffer, { boardName: 'mega' })
    } catch(e) {
      // console.log(e)
    }
    
    if (flashSuccess) {
      console.log('.hex file uploaded on board successfully!')
    } else {
      console.log('an error has occurred :(')
    }
  } else {
    console.log('operation canceled by user')
  }

  store.update((value) => ({
    ...value,
    flashState: flashSuccess,
  }));
}
