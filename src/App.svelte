<script>
	import { store, requestSerialPort, flashMyBoard} from './store';
	import { onDestroy } from 'svelte';
	import avrbro from './dist/avrbro.m.js'

	export let serialConnected = false;
	export let startflash = false;
	export let flashState = false;
	let hexBuffer;

	let port 
	$: {
		if (serialConnected) {
			requestSerialPort()
				.then(p => {
					port = p
				})
		}
	}
	$: {
		if (startflash) {
			let options = {
			boardName: 'UNO',
			debug: true
			}
			const serial = navigator.serial;
			flashState = flashMyBoard();
		}
	}

	onDestroy(() => {
		if (port) {
			port.close()
		}
	})


</script>

<main>
	<h1>Web Serial API with Matrix Mini</h1>
	
	<p>STATUS: </p>	{$store.state}
	


	<button disabled={startflash} on:click={() => startflash = true}>flash .hex on board</button>

	<button disabled={serialConnected} on:click={() => serialConnected = true}>Connect USB Device</button>

	{#if flashState}
		<button>flash fin</button>
	{:else}
		<button>flash Failed</button>
	{/if}

	
</main>

<style>
	main {
		max-width: 960px;
		width: 95%;
		margin: 0 auto;
	}
</style>