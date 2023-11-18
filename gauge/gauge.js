module.exports = function(RED) {

    function GaugeNode(config) {
        //console.log(config);
        var hasEditExpression = (config.targetType === "jsonata");
        var editExpression = hasEditExpression ? config.complete : null;
        RED.nodes.createNode(this, config);
        this.complete = hasEditExpression ? null : (config.complete||"payload").toString();
        if (this.complete === "false") { this.complete = "payload"; }
        this.property   = config.property || "msg.payload";
        this.data       = config.data || "";
        this.dataType   = config.dataType || "msg";
        this.position        = config.position || "above";
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

        var preparedEditExpression = null;
        if (editExpression) {
            try {
                preparedEditExpression = RED.util.prepareJSONataExpression(editExpression, this);
            }
            catch (e) {
                node.error(RED._("debug.invalid-exp", {error: editExpression}));
                return;
            }
        }

        var node = this;

        function handleError(err, msg, statusText) {
            node.status({ fill:"red", shape:"dot", text:statusText });
            node.error(err, msg);
        }

        node.on("input", function(msg) {

            if (this.active !== true) { return; }

            node.send(msg);

            var d = { id:node.id }
            console.log(node);

            if (preparedEditExpression) {
                RED.util.evaluateJSONataExpression(preparedEditExpression, msg, (err, value) => {
                    if (err) { done(RED._("debug.invalid-exp", {error: editExpression})); }
                    else { d.data = value; }
                });
            } else {
                // Extract the required message property
                console.log("node.complete =",node.complete);
                console.log("node.dataType = ",node.dataType);
                var property = "payload";
                var output = msg[property];
                if (node.complete !== "false" && typeof node.complete !== "undefined") {
                    property = node.complete;
                    try { d.data = RED.util.getMessageProperty(msg,node.complete); }
                    catch(err) { d.data = undefined; }
                }
                //done(null,{id:node.id, z:node.z, _alias: node._alias,  path:node._flow.path, name:node.name, topic:msg.topic, property:property, msg:output});
            }
        
            try {
                console.log("sending d's:",d);
                RED.comms.publish("gauge", d);
            }
            catch(e) {
                node.error("Invalid msg", msg);
            }

        });



        node.on("close", function() {
            RED.comms.publish("gauge", { id:this.id });
            node.status({});
        });
    }

    RED.nodes.registerType("gauge", GaugeNode);
};
