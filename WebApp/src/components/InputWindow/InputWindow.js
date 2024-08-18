import React, { useState } from 'react';
import './InputWindow.css';

function InputWindow({ origin, destination, setOrigin, setDestination, updateOriginAndDestination }) {
    const [localOrigin, setLocalOrigin] = useState(origin);
    const [localDestination, setLocalDestination] = useState(destination);

    const handleSubmit = (e) => {
        e.preventDefault();
        updateOriginAndDestination(localOrigin, localDestination);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-window">
                <div className="form-group">
                    <label htmlFor="origin">Origin:</label>
                    <input
                        type="text"
                        id="origin"
                        value={localOrigin}
                        onChange={(e) => setLocalOrigin(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="destination">Destination:</label>
                    <input
                        type="text"
                        id="destination"
                        value={localDestination}
                        onChange={(e) => setLocalDestination(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <button type="submit">Search</button>
                </div>
            </div>
        </form>
    );
}

export default InputWindow;
