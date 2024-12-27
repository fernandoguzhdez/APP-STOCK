import React from 'react'
import { faFrown } from "@fortawesome/free-solid-svg-icons";
import "./NoResults.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NoResults = ({Texto}) => {
    return (
        <div className="no-results">
            <FontAwesomeIcon icon={faFrown} size="5x" />
            <p>{Texto}</p>
        </div>
    )
}

export default NoResults