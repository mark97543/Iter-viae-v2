import React from 'react';

// Inside MenuCard.tsx
function MenuCard({ poi }: any) {
    const isOpen = !!poi; //Boolean Check to handle the transition classes
    const properties = poi?.properties;
    const name = properties?.name || 'Unknown';
    const subclass = properties?.subclass || 'Unknown';
    const lng = poi?.coord?.lng;
    const lat = poi?.coord.lat;

    //Developer Opriotns
    if (poi) {
        console.log("Raw POI object received:", poi);
        const properties = poi.prop?.properties; 

        console.log("--- POI Details ---");
        console.log("Name:", properties?.name || "Unnamed POI");
        console.log("Subclass (Category):", properties?.subclass);
        console.log("Coordinates:", poi.coord); 
        console.log("--- END POI Details ---");
    }
    return (
        <div>
            {/* Menu content goes here */}
        </div>
    );
}

export default MenuCard; // <-- Make sure this is here!
