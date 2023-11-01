module.exports = function(RED) {

    function GaugeNode(config) {
        RED.nodes.createNode(this, config);
        this.data       = config.data || "";
        this.dataType   = config.dataType || "msg";
        this.thumbnail  = config.thumbnail;
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
