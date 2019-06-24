import React, { Component } from 'react';
import PropTypes from "prop-types";

import '../../scss/App.scss';

class Checkbox extends Component {

  onChange = (e) => {
    this.props.updateStore(e.target.checked);
  };

  render() {
    return (
      <div className="md-checkbox">
        <input
          id={this.props.id}
          type="checkbox"
          onChange={this.onChange}
          defaultChecked={this.props.isChecked}
          title={this.props.title}
        />
        <label title={this.props.title} htmlFor={this.props.id}>{this.props.label}</label>
      </div>
    );
  }
}

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isChecked: PropTypes.bool.isRequired,
  updateStore: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default Checkbox;
