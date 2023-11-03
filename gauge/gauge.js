module.exports = function(RED) {

    function GaugeNode(config) {
        RED.nodes.createNode(this, config);
        this.data       = config.data || "";
        this.dataType   = config.dataType || "msg";
        this.currval        = config.currval || "0";
        this.animationSpeed = config.animationSpeed || 0;
        this.angle          = config.angle || "0";
        this.lineWidth      = config.lineWidth || "0";
        this.radiusScale    = config.radiusScale || "0";
        this.ptrLen         = config.ptrLen || "0";
        this.ptrColor       = config.ptrColor || "0";
        this.ptrStroke      = config.ptrStroke || "0";
        this.fontSize       = config.fontSize || "0";
        this.colorStart     = config.colorStart || "0";
        this.colorStop      = config.colorStop || "0";
        this.strokeColor    = config.strokeColor || "0";
        this.divisionsCbx   = config.divisionsCbx || true;
        this.divisions      = config.divisions || "0";
        this.divLength      = config.divLength || "0";
        this.divColor       = config.divColor || "0";
        this.divWidth       = config.divWidth || "0";
        this.subDivisions   = config.subDivisions || "0";
        this.subLength      = config.subLength || "0";
        this.subColor       = config.subColor || "0";
        this.subWidth       = config.subWidth || "0";
        this.active     = (config.active === null || typeof config.active === "undefined") || config.active;
        this.pass       = config.pass;

        var node = this;

        function sendDataToClient(msg) {
            var d = { id:node.id }
            d.data = msg.payload;
            
            try {
                RED.comms.publish("gauge", d);
            }
            catch(e) {
                node.error("Invalid msg", msg);
            }
        }

        function handleError(err, msg, statusText) {
            node.status({ fill:"red", shape:"dot", text:statusText });
            node.error(err, msg);
        }

        node.on("input", function(msg) {

            if (this.active !== true) { return; }

            node.send(msg);
            sendDataToClient(msg)

        });

        node.on("close", function() {
            RED.comms.publish("gauge", { id:this.id });
            node.status({});
        });
    }

    RED.nodes.registerType("gauge", GaugeNode);
};
