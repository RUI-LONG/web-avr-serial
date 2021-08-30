<script>
	import { store, requestSerialPort, flashBoard} from './store';
	import { onDestroy } from 'svelte';
	import avrbro from './dist/avrbro.m.js'

	export let serialConnected = false;
	export let startflash = false;
	export let flashSuccess = false;
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
			const serial = navigator.serial;
			flashSuccess = flashBoard();
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
	
	<p>Connection Status: 	{$store.state} </p>
	<p>Flash State: 	{$store.flashState} </p>

	<button disabled={startflash} on:click={() => startflash = true}>flash .hex on board</button>
	
	{#if $store.state != 'active'}
		<button on:click={() => serialConnected = true}>Connect USB Device</button>
	{:else}
		<button>DisConnect USB</button>
	{/if}

</main>

<style>
	main {
		max-width: 960px;
		width: 95%;
		margin: 0 auto;
	}
</style>