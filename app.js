var IRRemote = require('./ir-remote'),
    RoonApi = require("node-roon-api"),
    RoonApiStatus = require("node-roon-api-status"),
    RoonApiVolumeControl = require('node-roon-api-volume-control')

var argv = require('minimist')(process.argv.slice(2));
function is_production() {
    return argv.hasOwnProperty('production') && argv['production'] === 'true'
}

var roon = new RoonApi({
    extension_id: 'com.github.cgilling.roon-ir-volume',
    display_name: "IR Volume Control",
    display_version: "0.0.1",
    publisher: 'Christopher Gilling',
    email: 'cgilling@gmail.com',
    website: 'https://github.com/cgilling/roon-ir-volume',
});

if (is_production()) {
    roon.log_level = 'none'
}

var svc_status = new RoonApiStatus(roon);
var svc_volume_control = new RoonApiVolumeControl(roon);

roon.init_services({

    provided_services: [svc_status, svc_volume_control],
});

svc_status.set_status("All is good", false);

var volume_state = {
    display_name: "Living Room",
    volume_type: "incremental",
};


var irRemote
const irRemoteName = 'schiit_freya',
    irVolumeUpCommand = 'KEY_VOLUMEUP',
    irVolumeDownCommand = 'KEY_VOLUMEDOWN';

function setupIRRemote() {
    irRemote = new IRRemote({ remoteName: irRemoteName })
}

setupIRRemote()

var volume_control;

function setup_volume_control() {
    var device = {
        state: volume_state,
        control_key: 1,

        set_volume: function (req, mode, value) {
            console.log("received set_volume:", mode, value);
            if (value > 0) {
                irRemote.sendCommand(irVolumeUpCommand, function (err) {
                    console.log("Sent Volume Up", err);
                });
            } else {
                irRemote.sendCommand(irVolumeDownCommand, function (err) {
                    console.log("Sent Volume Down", err);
                });
            }

        },
        set_mute: function (req, inAction) {
            console.log("received set_mute:", inAction);
        }
    };
    volume_control = svc_volume_control.new_device(device);
}

setup_volume_control();

roon.start_discovery();