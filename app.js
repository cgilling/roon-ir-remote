var IRControl = require('lirc_node'),
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

var ir_control
const ir_remote_name = 'schiit_freya',
    ir_volume_up_cmd = 'KEY_VOLUMEUP',
    ir_volume_down_cmd = 'KEY_VOLUMEDOWN';

function setup_ir_control() {
    IRControl.init()
    ir_control = IRControl
}

setup_ir_control()

var volume_control;

function setup_volume_control() {
    var device = {
        state: volume_state,
        control_key: 1,

        set_volume: function (req, mode, value) {
            console.log("received set_volume:", mode, value);
            if (value > 0) {
                ir_control.irsend.send_once(ir_remote_name, ir_volume_up_cmd, function () {
                    console.log("Sent Volume Up");
                });
            } else {
                ir_control.irsend.send_once(ir_remote_name, ir_volume_down_cmd, function () {
                    console.log("Sent Volume Down");
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