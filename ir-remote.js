var lirc = require('lirc_node')

function IRRemote(config) {
    this.remoteName = config.remoteName
    this.commadInProgress = false
    this.queuedCommand = undefined
    this.queueCallback = undefined
    lirc.init(() => this.irsend = lirc.irsend)
}

IRRemote.prototype.sendCommand = function (cmd, cb) {
    if (!this.irsend) {
        if (cb) cb('init in progress')
        return
    }
    if (this.commadInProgress) {
        if (this.queuedCommand) {
            if (this.queueCallback) {
                this.queueCallback('queued command superceded', this.queuedCommand)
            }
        }
        this.queuedCommand = cmd
        this.queueCallback = cb
        return
    }

    this.commadInProgress = true
    this.irsend.send_once(this.remoteName, cmd, (err) => this.irsendCallback(err, cmd, cb))
}

IRRemote.prototype.irsendCallback = function (err, cmd, sendCallback) {
    if (sendCallback) {
        sendCallback(err, cmd)
    }
    if (!this.queuedCommand) {
        this.commadInProgress = false
        return
    }
    this.irsend.send_once(this.remoteName, this.queuedCommand, (err) => this.irsendCallback(err, cmd, this.queueCallback))
    this.queuedCommand = undefined
    this.queueCallback = undefined
}

exports = module.exports = IRRemote