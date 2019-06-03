"use strict";

const React = require("react");
const PropTypes = require("prop-types");
const dfp = require("./service");
const createClass = require("create-react-class");

const generateNextId = (function() {
  let _id = 0;

  return function _generateNextId(path) {
    const id = ++_id;

    return "dfp" + path.replace(/\//g, "-") + "-" + id;
  };
})();

const Dfp = createClass({
  propTypes: {
    adUnitPath: PropTypes.string.isRequired,
    adSize: PropTypes.array.isRequired,
    adSizes: PropTypes.array,
    adElementId: PropTypes.string,
    adTargeting: PropTypes.object,
    adStyle: PropTypes.object,
    adCollapse: PropTypes.bool,
    onSlotRenderEnded: PropTypes.func,
    onImpressionViewable: PropTypes.func
  },

  getInitialState: function getInitialState() {
    return {
      adElementId:
        this.props.adElementId || generateNextId(this.props.adUnitPath)
    };
  },

  componentDidMount: function componentDidMount() {
    dfp({
      unitPath: this.props.adUnitPath,
      size: this.props.adSize,
      sizes: this.props.adSizes,
      elementId: this.state.adElementId,
      collapse: this.props.adCollapse,
      targeting: this.props.adTargeting,
      onSlotRenderEnded: this.props.onSlotRenderEnded,
      onImpressionViewable: this.props.onImpressionViewable
    });
  },

  shouldComponentUpdate: function shouldComponentUpdate() {
    return false;
  },

  render: function render() {
    return React.createElement("div", { id: this.state.adElementId });
  }
});

module.exports = Dfp;
