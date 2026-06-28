
export const handlePoiClick = (feature:any) =>{
    const props = feature.properties;
    const coords = feature.geometry.coordinates;

    return{
        title:props.name|| "Unkown Location",
        category: props.class || "Point of Interest",
        subCategory: props.subclass || "General",
        lat: coords[1].toFixed(5),
        lng: coords[0].toFixed(5),
        //Can add more metadata as more layers are added
    };
};