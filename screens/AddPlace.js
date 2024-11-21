import PlaceForm from '../components/Places/PlaceForm';
import { useRoute } from '@react-navigation/native';
import { useEffect } from 'react';


function AddPlace({ navigation }) {

  function createPlaceHandler(place) {
    console.log("Create place handler", place);
    navigation.navigate("AllPlaces", { place: place });
  }

  return <PlaceForm onCreatePlace={createPlaceHandler} />;
}

export default AddPlace;
