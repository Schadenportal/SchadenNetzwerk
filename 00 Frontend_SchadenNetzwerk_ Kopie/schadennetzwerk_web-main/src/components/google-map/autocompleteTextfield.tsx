import { GeoPoint } from 'firebase/firestore';
import React, { useState, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Libraries, Autocomplete, useJsApiLoader } from '@react-google-maps/api';

import TextField, { TextFieldProps } from '@mui/material/TextField';

import { GeoLocationType } from './types';

const libraries: Libraries = ['places', 'geometry', 'geocoding', 'maps'];

type Props = TextFieldProps & {
  name: string;
}

const AddressAutocomplete = ({ name, helperText, type, ...other }: Props) => {
  const { control, setValue } = useFormContext();
  const [searchResult, setSearchResult] = useState<google.maps.places.Autocomplete | null>(null);


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries,
  });

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setSearchResult(autocomplete)
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (searchResult != null) {
      const place: google.maps.places.PlaceResult = searchResult.getPlace();
      const geoLocation: GeoLocationType = {
        address: place.formatted_address,
        geoPoint: undefined,
      }
      if (place.geometry != null) {
        const lat = place.geometry.location?.lat();
        const lng = place.geometry.location?.lng();
        if (lat && lng) {
          geoLocation.geoPoint = new GeoPoint(lat, lng);
        }
      }
      setValue(name, geoLocation, { shouldValidate: true });
    }
  }, [name, searchResult, setValue]);

  return isLoaded ? (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}>
          <TextField
            {...field}
            fullWidth
            type={type}
            value={field.value.address}
            onChange={(event) => {
              field.onChange(event.target.value);
            }}
            error={!!error}
            helperText={error ? error?.message : helperText}
            {...other}
          />
        </Autocomplete>
      )}
    />
    // eslint-disable-next-line react/jsx-no-useless-fragment
  ) : <></>
}

export default React.memo(AddressAutocomplete)
