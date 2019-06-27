import React, { Component } from 'react';
import { connect } from "react-redux";
import Badge from "react-bootstrap/Badge";
import '../scss/App.scss';
import moment from "moment";
import classNames from "classnames"

class MessagesListChatChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      force: {},
    }
  }

  componentDidMount() {
    const { allForces, selectedForce } = this.props.playerUi || {};
      if( allForces && selectedForce ) {
          this.state.force = {
              ...this.state.force,
              ...allForces.find((force) => force.uniqid === selectedForce)
          };
      }
  }

  render() {
    const { name } = this.state.force;
    const { messages } = this.props;

    return (
      messages.map((item, i) => {
        const { details, message } = item;
        const isOwnMessage = name === details.from.force;
        const listItemClass = isOwnMessage ? 'own-message' : '';
        return (
          <>
            <span className="link link--noIcon link--secondary" onClick={this.props.markAllAsRead}>Mark all as read</span>
            <div key={`preview-${i}`} className={`message-preview-player wrap ${listItemClass}`}>
              {
                isOwnMessage ?
                  null :
                  <span className="message-bullet" style={{ backgroundColor: details.from.forceColor }}>&nbsp;</span>
              }
              <div className={classNames({"bold": !item.hasBeenRead})}>
                {message.content}
              </div>
              <div className="info-wrap">
                <time dateTime={details.timestamp}>{moment(details.timestamp).format("HH:mm")}</time>
                <Badge pill variant="secondary">{details.from.role}</Badge>
              </div>
            </div>
          </>
        );
      })
    );
  }
}

const mapStateToProps = ({ playerUi }) => ({
    playerUi,
});

export default connect(mapStateToProps)(MessagesListChatChannel);
