import {registerApp} from '../commands.js';
import {log} from '../console.js';

registerApp({name: 'Ursa', startApp: launch, info: 'Launches the disconinued game prototype Ursa Arcanum!'});

function launch(targetElement, close_cb, params) {
    window.open('https://daid.coffee/godot/ursa-arcanum.html', '_blank');
    log('Launched Ursa Arcanum in a new Tab.');
    close_cb();
}
