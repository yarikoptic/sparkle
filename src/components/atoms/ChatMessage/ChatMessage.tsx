import React, { useCallback } from "react";
import classNames from "classnames";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { MessageToDisplay } from "types/chat";

import { useProfileModalControls } from "hooks/useProfileModalControls";

import { UserAvatar } from "components/atoms/UserAvatar";

// import Emoji from "react-emoji-render";
//import { toArray } from 'react-emoji-render';

import "./ChatMessage.scss";

export interface ChatProps {
  message: MessageToDisplay;
  deleteMessage: () => void;
}

function httpHtml(content: string): string {
  // TODO: better regex, anchor by end of word.  if used within parseEmojisAndUrls should be a full match AFIAK
  const reg = /(https?:\/\/\w+\.\w+\S+)/g;
  return content.replace(
    reg,
    "<a href='$1' target='_blank' rel='noopener'>$1</a>"
  );
}

// const parseEmojisAndUrls = (
//     value: string) => {
//   const emojisArray = toArray(value);
//
//   // toArray outputs React elements for emojis and strings for other
//   const newValue = emojisArray.reduce((previous, current) => {
//     if (typeof current === "string") {
//       return previous + httpHtml(current);
//     }
//     if (current) {
//       return previous + current.props.children;
//     }
//     return previous
//   }, "");
//
//   return newValue;
// };

export const ChatMessage: React.FC<ChatProps> = ({
  message,
  deleteMessage,
}) => {
  const { text, ts_utc, isMine, author, canBeDeleted } = message;
  const { openUserProfileModal } = useProfileModalControls();

  const timestamp = ts_utc.toMillis();

  const containerStyles = classNames("chat-message", {
    "chat-message--me": isMine,
  });

  const openAuthorProfile = useCallback(() => {
    openUserProfileModal(author);
  }, [openUserProfileModal, author]);

  //  const text_html = parseEmojisAndUrls(text);
  const text_html = httpHtml(text);
  return (
    <div className={containerStyles}>
      <div className="chat-message__text">{text_html}</div>
      <div className="chat-message__info" onClick={openAuthorProfile}>
        <UserAvatar user={author} />
        <span className="chat-message__author">{author.partyName}</span>
        <span className="chat-message__time">
          {dayjs(timestamp).format("h:mm A")}
        </span>
        {canBeDeleted && (
          <FontAwesomeIcon
            onClick={deleteMessage}
            icon={faTrash}
            className="chat-message__delete-icon"
            size="sm"
          />
        )}
      </div>
    </div>
  );
};
