var RoonApi = require("node-roon-api"),
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
var volume_control;

function setup_volume_control() {
    var device = {
        state: volume_state,
        control_key: 1,

        set_volume: function (req, mode, value) {
            console.log("set_volume:", mode, value);
        },
        set_mute: function (req, inAction) {
            console.log("set_mute:", inAction);
        }
    };
    volume_control = svc_volume_control.new_device(device);
}

setup_volume_control();

roon.start_discovery();