'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const dfp = require('./service');
const createClass = require('create-react-class');

const generateNextId = (function() {
  let _id = 0;

  return function _generateNextId(path) {
    const id = ++_id;

    return 'dfp' + path.replace(/\//g, '-') + '-' + id;
  };
})();

const Dfp = createClass({
  propTypes: {
    adUnitPath: PropTypes.string.isRequired,
    adSize: PropTypes.array.isRequired,
    adCentering: PropTypes.bool,
    adCollapse: PropTypes.bool,
    adElementId: PropTypes.string,
    adSizes: PropTypes.array,
    adStyle: PropTypes.object,
    adTargeting: PropTypes.object,
    onImpressionViewable: PropTypes.func,
    onSlotRenderEnded: PropTypes.func,
  },

  getInitialState: function getInitialState() {
    return {
      adElementId:
        this.props.adElementId || generateNextId(this.props.adUnitPath),
    };
  },

  componentDidMount: function componentDidMount() {
    dfp({
      unitPath: this.props.adUnitPath,
      size: this.props.adSize,
      centering: this.props.adCentering,
      collapse: this.props.adCollapse,
      elementId: this.state.adElementId,
      onImpressionViewable: this.props.onImpressionViewable,
      onSlotRenderEnded: this.props.onSlotRenderEnded,
      sizes: this.props.adSizes,
      targeting: this.props.adTargeting,
    });
  },

  shouldComponentUpdate: function shouldComponentUpdate() {
    return false;
  },

  render: function render() {
    return React.createElement('div', { id: this.state.adElementId });
  },
});

module.exports = Dfp;
