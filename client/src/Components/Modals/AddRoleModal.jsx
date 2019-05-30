import React, {Component} from 'react';
import ModalWrapper from './ModalWrapper';
import "../../scss/App.scss";
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import uniqId from "uniqid";
import { modalAction } from "../../ActionsAndReducers/Modal/Modal_ActionCreators";
import {
  addRole,
  updateRole,
  setTabUnsaved,
} from "../../ActionsAndReducers/dbWargames/wargames_ActionCreators";

class AddRoleModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      roleName: this.props.currentModal.data ? this.props.currentModal.data.name : '',
      rolePassword: this.props.currentModal.data ? this.props.currentModal.data.password : `pass${uniqId.time()}`,
    };
  }

  hideModal = () => {

    this.setState({
      roleName: '',
      rolePassword: '',
    });

    this.props.dispatch(modalAction.close());
  };


  setNewRoleName = (e) => {
    let curTab = this.props.wargame.currentTab;
    let selectedForce = this.props.wargame.data.forces.selectedForce.name;
    this.setState({
      roleName: e.target.value,
      sameName: this.props.wargame.data[curTab].forces.find((force) => force.name === selectedForce).roles.some((role) => role.name === e.target.value)
    });
  };

  setNewRolePassword = (e) => {
    let curTab = this.props.wargame.currentTab;
    let selectedForce = this.props.wargame.data.forces.selectedForce.name;
    this.setState({
      rolePassword: e.target.value,
      samePassword: this.props.wargame.data[curTab].forces.find((force) => force.name === selectedForce).roles.some((role) => role.password === e.target.value)
    });
  };

  addRole = () => {
    let selectedForce = this.props.wargame.data.forces.selectedForce.name;

    let newRole = {
      name: this.state.roleName,
      password: this.state.rolePassword,
      control: this.props.currentModal.data ? this.props.currentModal.data.control : false,
    };

    if (this.props.currentModal.data) {
      this.props.dispatch(updateRole(selectedForce, this.props.currentModal.data.name, newRole));
    } else {
      this.props.dispatch(addRole(selectedForce, newRole));
    }
    this.props.dispatch(setTabUnsaved());
    this.props.dispatch(modalAction.close());
  };

  handleKeyDown = (e) => {
    if (e.key === 'Enter' && this.state.roleName.length > 0 && !this.state.sameName) this.addRole();
    if (e.key === "Escape") this.hideModal();
  };



  render() {

    if (!this.props.currentModal.open) return false;

    var disable = this.state.roleName.length < 1 || this.state.sameName || this.state.samePassword || this.state.rolePassword.length > 30;

    const NameTextInput = withStyles({
      root: {
        display: "block",
        marginBottom: "24px",
      },
      input: {
        width: "100%",
      }
    })(({ classes }) => (
      <TextField
        label="Name"
        className={classes.root}
        InputLabelProps={{className: classes.label}}
        InputProps={{className: classes.input}}
        onChange={this.setNewRoleName}
        value={this.state.roleName || ''}
        onKeyDown={this.handleKeyDown}
      />
    ));

    const PasswordTextInput = withStyles({
      root: {
        display: "block",
        marginBottom: "24px",
      },
      input: {
        width: "100%",
      }
    })(({ classes }) => (
      <TextField
        label="Password"
        className={classes.root}
        InputLabelProps={{className: classes.label}}
        InputProps={{className: classes.input}}
        onChange={this.setNewRolePassword}
        value={this.state.rolePassword || ''}
        onKeyDown={this.handleKeyDown}
      />
    ));

    return (
      <ModalWrapper>
        <div className="display-text-wrapper">
          <h3>Add a role</h3>
          {this.state.sameName && <p className="notification">Name already exists</p>}
          {this.state.samePassword && <p className="notification">Password already exists</p>}
          {this.state.rolePassword.length > 30 && <p className="notification">Password limit is 30 chars.</p>}
          <NameTextInput />
          <PasswordTextInput />
          <div className="buttons">
            <button disabled={disable} name="add" className="btn btn-action btn-action--primary" onClick={this.addRole}>Add</button>
            <button name="cancel" className="btn btn-action btn-action--secondary" onClick={this.hideModal}>Cancel</button>
          </div>
        </div>
      </ModalWrapper>
    )
  }
}

const mapStateToProps = ({ wargame, currentModal }) => ({
  wargame,
  currentModal
});

export default connect(mapStateToProps)(AddRoleModal);
