import React from 'react';

const availabilityToHebrew = {
    'AVAILABLE': 'פנוי',
    'FULL': 'מלא',
    'ALMOST_FULL': 'כמעט מלא',
    'ACTIVE': 'פעיל',
    'OPEN': 'פתוח',
    'NO_INFORMATION': 'אין מידע'
};

const ParkingInfoModal = ({parkingLotInfo}) => (
    <div style={{
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
        padding: '20px',
        textAlign: 'right'
    }}>
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            textAlign: 'right'
        }}>
            <div style={{marginBottom: '10px', textAlign: 'center'}}>
                <span style={{
                    fontWeight: 'bold',
                    fontSize: '20px'
                }}>
                    {parkingLotInfo.name}
                </span>
            </div>
            <div style={{marginBottom: '14px', fontSize: '14px'}}>
                <span style={{fontWeight: 'bold'}}>כתובת:</span> {parkingLotInfo.address ?? ''}
            </div>
            <div style={{marginBottom: '10px', fontSize: '14px'}}>
                <span
                    style={{fontWeight: 'bold'}}>זמינות: </span>{availabilityToHebrew[parkingLotInfo.parkingLotStatus ?? '']}
            </div>
            <div style={{marginBottom: '10px', fontSize: '14px'}}>
                <span style={{fontWeight: 'bold'}}>מספר מקומות: </span>{parkingLotInfo.numberOfSpots ?? ''}
            </div>
            <div style={{marginBottom: '10px', fontSize: '14px'}}>
                <span style={{fontWeight: 'bold'}}>תמחור: </span>{parkingLotInfo.fixedPriceInformation ?? ''}
            </div>
        </div>
    </div>
);

export default ParkingInfoModal;
