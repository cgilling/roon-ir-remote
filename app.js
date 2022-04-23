var
    debug = require('debug')('roon-extension-denon'),
    debug_keepalive = require('debug')('roon-extension-denon:keepalive'), RoonApi = require("node-roon-api"),
    RoonApiStatus = require("node-roon-api-status"),
    RoonApiVolumeControl = require('node-roon-api-volume-control')

var roon = new RoonApi({
    extension_id: 'com.github.cgilling.roon-ir-volume',
    display_name: "IR Volume Control",
    display_version: "0.0.1",
    publisher: 'Christopher Gilling',
    email: 'cgilling@gmail.com',
    website: 'https://github.com/cgilling/roon-ir-volume',
    /*
        core_paired: function (core) {
            let transport = core.services.RoonApiTransport;
            transport.subscribe_zones(function (cmd, data) {
                console.log(core.core_id,
                    core.display_name,
                    core.display_version,
                    "-",
                    cmd,
                    JSON.stringify(data, null, '  '));
            });
        },
    
        core_unpaired: function (core) {
            console.log(core.core_id,
                core.display_name,
                core.display_version,
                "-",
                "LOST");
        }
        */
});

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
            debug("set_volume: mode=%s value=%d", mode, value);
        },
        set_mute: function (req, inAction) {
            debug("set_mute: action=%s", inAction);
        }
    };
    volume_control = svc_volume_control.new_device(device);
}

setup_volume_control();

roon.start_discovery();