import React, { useRef, useState } from 'react';

function DateInput() {
    const [dateValue, setDateValue] = useState('');
    const dateInputRef = useRef(null);

    const handleDateChange = (event) => {
        setDateValue(event.target.value);
    };

    // Funktion för att öppna datumväljaren när användaren klickar på ikonen
    const openDatepicker = () => {
        dateInputRef.current.focus();
        // Hack för iOS: en kort fördröjning innan att sätta 'type' till 'date' kan ibland hjälpa
        setTimeout(() => {
            dateInputRef.current.type = 'date';
        }, 5);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
                ref={dateInputRef}
                type="text" // Starta som en text för att visa placeholder
                value={dateValue}
                onChange={handleDateChange}
                placeholder="YYYY-MM-DD"
                onFocus={() => dateInputRef.current.type = 'date'}
                onBlur={() => dateInputRef.current.type = 'text'}
                style={{ flex: 1 }}
            />
            <button onClick={openDatepicker} style={{ marginLeft: '10px' }}>
                📅
            </button>
        </div>
    );
}

export default DateInput;
