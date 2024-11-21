const GOOGLE_API_KEY = 'AIzaSyCSBTELKuHmuTVJMaezfll1ZtvE1pnWxB0'
import { StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';


function getMapPreview(location) {
  const imagePreviewUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=400x200&maptype=roadmap&key=${GOOGLE_API_KEY}`;

  return (
    <Image
      source={{ uri: imagePreviewUrl }}
      style={styles.mapPreview}
    />
  );
}

export default getMapPreview;

const styles = StyleSheet.create({
  mapPreview: {
    width: '100%',
    height: 200,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary100,
    borderRadius: 4
  },
});

export async function getAddress(location) { // es async porque queremos usar await
  // es async porque necesitamos esperar a que la API responda
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${GOOGLE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK') {
    return data.results[0].formatted_address;
  }

  return 'No address found';
}