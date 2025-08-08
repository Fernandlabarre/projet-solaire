import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useState } from "react";
import axios from "axios";

export default function AutocompleteAdresse({ value, onChange, onCoords }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quand on tape dans le champ :
  const handleInputChange = async (event, inputValue) => {
    if (!inputValue || inputValue.length < 3) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get("https://api-adresse.data.gouv.fr/search", {
        params: { q: inputValue, limit: 10 }
      });
      setOptions(res.data.features);
    } catch {
      setOptions([]);
    }
    setLoading(false);
  };

  // Quand on sélectionne une adresse :
  const handleChange = (event, newValue) => {
    if (newValue) {
      // Récupère l'adresse, la lat/lon
      onChange(newValue.properties.label);
      if (onCoords) {
        onCoords({
          latitude: newValue.geometry.coordinates[1],
          longitude: newValue.geometry.coordinates[0]
        });
      }
    } else {
      onChange("");
      if (onCoords) onCoords({ latitude: null, longitude: null });
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      loading={loading}
      getOptionLabel={option =>
        typeof option === "string" ? option : option.properties.label
      }
      onInputChange={handleInputChange}
      onChange={handleChange}
      filterOptions={x => x} // pas de filtrage côté client
      renderInput={params => (
        <TextField
          {...params}
          label="Adresse *"
          value={value}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
