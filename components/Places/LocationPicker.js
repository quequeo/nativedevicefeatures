import { useEffect, useState } from "react";
import { View, StyleSheet, Alert, Platform, Linking, Text, Image } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import OutlinedButton from "../UI/OutlinedButton";
import { Colors } from "../../constants/colors";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import getMapPreview from "../../utils/location";
import { getAddress } from "../../utils/location";

import { 
  getCurrentPositionAsync, 
  useForegroundPermissions, 
  PermissionStatus 
} from "expo-location";

function LocationPicker({onPickLocation}) {
  const [pickedLocation, setPickedLocation] = useState(null);
  const [locationPermissionInformation, requestPermission] = useForegroundPermissions();
  const [address, setAddress] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && route.params) {
      const mapPickedLocation = { 
        lat: route.params.pickedLat, 
        lng: route.params.pickedLng 
      };
      setPickedLocation(mapPickedLocation);
    }
  }, [isFocused, route]); 

  useEffect(() => {
    async function handleLocation(){
      if (pickedLocation) {
        try {
          const human_address = await getAddress(pickedLocation);
          setAddress(human_address);
        } catch (error) {
          console.error("Error getting address:", error);
          Alert.alert(
            "Could Not Fetch Address",
            "Please try again later or pick a location on the map."
          );
        }
        onPickLocation({...pickedLocation, address: human_address}); 
      }
    }

    handleLocation();
  }, [pickedLocation, onPickLocation, address]);

  const openSettings = () => {
    console.log("Opening settings");
    if (Platform.OS === 'ios') {
      console.log("Opening settings");
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  async function checkPermissions() {
    if (!locationPermissionInformation) {
      console.log("No location permission information available.");
      return false;
    }

    if (locationPermissionInformation.status === PermissionStatus.UNDETERMINED) {
      console.log("Requesting location permissions...");
      const permissionResponse = await requestPermission();
      return permissionResponse.granted;
    }

    if (locationPermissionInformation.status === PermissionStatus.DENIED) {
      Alert.alert(
        "Permission Required",
        "Location permission is required to use this feature. Please enable it in your device settings.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Open Settings",
            onPress: openSettings
          }
        ]
      );
      return false;
    }

    return locationPermissionInformation.status === PermissionStatus.GRANTED;
  }

  async function getLocationHandler() {
    try {
      const hasPermission = await checkPermissions();

      if (!hasPermission) {
        return;
      }

      const location = await getCurrentPositionAsync({});
      
      setPickedLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      let get_address = await getAddress(location.coords);
      console.log(get_address);
      setAddress(get_address);

    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Could Not Fetch Location",
        "Please try again later or pick a location on the map."
      );
    }
  }

  function pickOnMapHandler() {
    navigation.navigate("Map");
  }

  let locationPreview = <Text>No location picked yet.</Text>;

  if (pickedLocation) {
    locationPreview = (
      <Image style={styles.image} source={{ uri: getMapPreview(pickedLocation) }} />
    )
  }

  return (
    <View style={styles.container}>
      {pickedLocation ? (
        <MapView
          style={styles.map}
          region={{
            latitude: pickedLocation.lat,
            longitude: pickedLocation.lng,
            latitudeDelta: pickedLocation.latitudeDelta || 0.0922,
            longitudeDelta: pickedLocation.longitudeDelta || 0.0421,
          }}
        >
          <Marker 
            coordinate={{
              latitude: pickedLocation.lat,
              longitude: pickedLocation.lng
            }} 
            title="Picked Location"
          />
          <Text style={styles.address}>{address}</Text>
        </MapView>

      ) : (
        <View style={styles.mapPlaceholder} />
      )}
        
      <View style={styles.action}>
        <OutlinedButton 
          icon="location" 
          onPress={getLocationHandler}
        >
          Locate Me
        </OutlinedButton>
        <OutlinedButton 
          icon="map" 
          onPress={pickOnMapHandler}
        >
          Pick on Map
        </OutlinedButton>
      </View>
    </View>
  );
  
}

export default LocationPicker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: 200,
  },
  mapPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  action: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
  }
});