import React, { Component } from 'react';
import { connect } from "react-redux";
import _ from "lodash";
import '../scss/App.scss';
import {
  getWargame,
  setForce,
  setRole,
  showHideObjectives,
  startListening,
  setAllTemplates,
  failedLoginFeedbackMessage,
  openTour,
  initiateGame,
} from "../ActionsAndReducers/playerUi/playerUi_ActionCreators";
import lineBreak from "../Helpers/splitNewLineBreak";
import {
  addNotification,
} from "../ActionsAndReducers/Notification/Notification_ActionCreators";
import DropdownInput from "../Components/Inputs/DropdownInput";
import GameChannels from "./GameChannels";
import TextInput from "../Components/Inputs/TextInput";
import {getSergeGameInformation} from "../ActionsAndReducers/sergeInfo/sergeInfo_ActionCreators";
import {umpireForceTemplate, expiredStorage, LOCAL_STORAGE_TIMEOUT} from "../consts";
import {populateWargameStore} from "../ActionsAndReducers/dbWargames/wargames_ActionCreators";
import {populateMessageTypesDb} from "../ActionsAndReducers/dbMessageTypes/messageTypes_ActionCreators";
import Tour from "reactour";


class PlayerUi extends Component {

  constructor(props) {
    super(props);

    this.state = {
      landingScreen: true,
      selectedWargame: '',
      wargameAccessCode: '',
      rolePassword: '',
      tourIsOpen: false,
    };


    this.props.dispatch(populateMessageTypesDb());
    this.props.dispatch(populateWargameStore());
    this.props.dispatch(getSergeGameInformation());
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.playerUi.selectedForce && nextProps.playerUi.selectedRole && this.state.isTourOpen === undefined) {
      this.setState({
        tourIsOpen: expiredStorage.getItem(`${nextProps.playerUi.wargameTitle}-${nextProps.playerUi.selectedForce}-${nextProps.playerUi.selectedRole}-tourDone`) !== "done",
      })
    }

    if (nextProps.playerUi.tourIsOpen !== this.props.playerUi.tourIsOpen) {
      this.setState({
        tourIsOpen: nextProps.playerUi.tourIsOpen,
      })
    }
  }

  updateSelectedWargame = (selectedWargame) => {
    this.setState({selectedWargame});
    this.props.dispatch(getWargame(selectedWargame));
  };

  goBack = () => {
    this.props.dispatch(setForce(""));
  };

  setRolePassword = (value) => {
    this.setState({
      rolePassword: value,
    });
  };

  setRolePasswordDemo = (pass) => {
    this.setState({
      rolePassword: pass,
    });
  };

  checkPassword = () => {
    let pass = this.state.rolePassword;

    let matchRole = (force) => force.roles.find((role) => role.password === pass);

    let force = this.props.playerUi.allForces[_.findIndex(this.props.playerUi.allForces, matchRole)];

    if (force === undefined) {
      this.props.dispatch(addNotification("Access code incorrect", "warning"));
      this.props.dispatch(failedLoginFeedbackMessage(this.props.playerUi.currentWargame, pass));
      return;
    }

    let role = force.roles[_.findIndex(force.roles, (role) => role.password === pass)];

    this.props.dispatch(setForce(force.uniqid));
    this.props.dispatch(setRole(role));
    this.props.dispatch(setAllTemplates(this.props.messageTypes.messages));
    // this.props.dispatch(startListening(this.props.playerUi.currentWargame));
  };

  roleOptions() {
    return this.props.playerUi.allForces.map((force) => ({name: force.name, roles: force.roles}));
  }

  showHideForceObjectives = () => {
    this.props.dispatch(showHideObjectives());
  };

  enterSerge = () => {
    this.setState({
      landingScreen: false,
    })
  };

  closeTour = () => {
    expiredStorage.setItem(`${this.props.playerUi.wargameTitle}-${this.props.playerUi.selectedForce}-${this.props.playerUi.selectedRole}-tourDone`, "done", LOCAL_STORAGE_TIMEOUT);
    this.props.dispatch(openTour(false));
  };

  initiateGameplay = () => {
    this.props.dispatch(initiateGame(this.props.playerUi.currentWargame));
  };

  render() {

    if (this.state.landingScreen) {
      return (
        <div className="flex-content-wrapper flex-content-wrapper--welcome">
          <div className="flex-content flex-content--welcome">
            <div className="flex-content--center">
              <img className="serge-logo" src={this.props.gameInfo.imageUrl} alt="Serge gaming" />
              <h1>{this.props.gameInfo.title}</h1>
              {lineBreak(this.props.gameInfo.description)}
              <button name="play" className="btn btn-action btn-action--primary" onClick={this.enterSerge}>Play</button>
            </div>
          </div>
        </div>
      );
    }

    const steps = [
      {
        selector: '[data-tour="first-step"]',
        content: "Take a short guided tour to familiarise yourself with the main features of the War Game interface."
      },
      {
        selector: '[data-tour="second-step"]',
        content: "Check your force objectives by clicking on the target icon."
      },
      {
        selector: '[data-tour="third-step"]',
        content: "Give feedback at any time by clicking on the speech bubble."
      },
      {
        selector: '[data-tour="fourth-step"]',
        content: "In-game channels are on the left. Access is limited to specific forces and roles."
      },
      {
        selector: '[data-tour="fifth-step"]',
        content: "Game admin is on the right. All players can read and write in the channel."
      },
      {
        selector: '[data-tour="sixth-step"]',
        content: "This panel will indicate whether you are in a planning or adjudication phase, and how much time is left when in a planning phase."
      },
      {
        selector: '[data-tour="seventh-step"]',
        content: "Send out-of-game messages and questions here. They are visible by all players and umpires."
      },
      {
        selector: '[data-tour="fourth-step"]',
        content: () => (
          <div>
            Drag and drop a tab to create a new column and re-organize your channels. And use the vertical bars to resize the area occupied by channels.
            <span className="link link--noIcon" onClick={this.closeTour}>Close the tour</span>
          </div>
        ),
      },
    ];

    if (this.props.playerUi.selectedForce === umpireForceTemplate.uniqid && !this.props.playerUi.wargameInitiated) {
      return (
        <div className="flex-content-wrapper">
          <div className="pre-start-screen">
            <button name="initate game" className="btn btn-action btn-action--primary" onClick={this.initiateGameplay}>Initiate Game</button>
          </div>
        </div>
      )
    }

    if (this.props.playerUi.selectedForce && this.props.playerUi.selectedRole && !this.props.playerUi.wargameInitiated) {
      return (
        <div className="flex-content-wrapper">
          <div className="pre-start-screen">
            <div id="loading">
              <div>
                <div id="loader"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (this.props.playerUi.selectedForce && this.props.playerUi.selectedRole) {
      return (
        <>
          <div className="flex-content-wrapper" data-tour="first-step">
            <div className="flex-content flex-content--fill">
              <GameChannels />
            </div>
          </div>
          {/* GUIDED TOUR */}
          <Tour
            steps={steps}
            isOpen={this.state.tourIsOpen}
            onRequestClose={this.closeTour}
            startAt={0}
          />
        </>
      )
    }

    return (
      <div className="flex-content-wrapper flex-content-wrapper--welcome">
        <div className="flex-content flex-content--welcome">
          {!this.props.playerUi.selectedForce && !this.props.playerUi.selectedRole &&
            <div className="flex-content--center">
              <h1>Set wargame</h1>
              <DropdownInput
                data={this.state.selectedWargame}
                updateStore={this.updateSelectedWargame}
                selectOptions={this.props.wargame.wargameList.map((wargame) => ({option: wargame.title, value: wargame.name}))}
              />
              <div className="flex-content">
                <TextInput
                  label="Access code"
                  className="material-input"
                  updateStore={this.setRolePassword}
                  options={{numInput: false}}
                  data={this.state.rolePassword || ''}
                />
              </div>
              {this.state.selectedWargame && this.props.playerUi.showAccessCodes &&
                <div className="demo-passwords">
                  <h3>Not visible in production</h3>
                  {this.roleOptions().map((force) => {
                    return (
                      <React.Fragment key={force.name}>
                        <h4>{force.name}</h4>
                        <ul>
                          {force.roles.map((role) => (<li key={role.name} onClick={this.setRolePasswordDemo.bind(this, role.password)}>{role.name}</li>))}
                        </ul>
                      </React.Fragment>
                    )
                  })
                  }
                </div>
              }
              <button name="add" disabled={!this.state.rolePassword} className="btn btn-action btn-action--primary" onClick={this.checkPassword}>Enter</button>
            </div>
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ playerUi, wargame, messageTypes, gameInfo }) => ({
  playerUi,
  wargame,
  messageTypes,
  gameInfo,
});

export default connect(mapStateToProps)(PlayerUi);
