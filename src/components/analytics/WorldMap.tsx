import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as Flags from "country-flag-icons/react/3x2";

// Simple country mappings - inline implementation
const countryNameToGeoJSON = (name: string) => name;
const countryNameToISO = (name: string) => name.substring(0, 2).toUpperCase();

export interface CountryData {
  name: string;
  value: number;
  coordinates: [number, number];
}

interface WorldMapProps {
  data: CountryData[];
}

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

export default function WorldMap({ data }: WorldMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);

  // Sort countries by value in descending order and filter out countries with 0 stores
  const sortedCountries = [...data]
    .filter(country => country.value > 0)
    .sort((a, b) => b.value - a.value);
  
  // Calculate max value for color intensity using all data
  const maxValue = Math.max(...data.map(country => country.value));

  // Function to calculate color intensity
  const getColorIntensity = (value: number) => {
    const intensity = value ? (value / maxValue) : 0;
    return `rgba(139, 92, 246, ${0.2 + (intensity * 0.6)})`;
  };

  // Function to get flag component
  const getFlagComponent = (countryName: string) => {
    const iso2Code = countryNameToISO(countryName);
    if (!iso2Code || !Flags[iso2Code as keyof typeof Flags]) return null;
    
    const FlagComponent = Flags[iso2Code as keyof typeof Flags];
    return <FlagComponent className="w-5 h-5 rounded-sm object-cover shadow-sm" />;
  };

  // Function to find country data with mapping support
  const findCountryData = (geoName: string) => {
    return data.find(d => 
      d.name === geoName || 
      countryNameToGeoJSON(d.name) === geoName
    );
  };

  // Function to get proper country name for display
  const getDisplayName = (geoName: string) => {
    // Simple implementation - just return the geo name since we don't have full mapping
    return geoName;
  };

  return (
    <Card className="bg-white border rounded-xl shadow-sm">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-purple-800 text-lg font-medium">
           Merchants by Country ({sortedCountries.length} Countries)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
                    {/* Country List */}
                    <div className="w-full border-t pt-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">ACTIVE COUNTRIES</h3>
                                  <span className="text-xs text-gray-600">Merchants</span>
              </div>
              {sortedCountries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  {sortedCountries.map((country, index) => (
                    <div
                      key={country.name}
                      className={`flex items-center justify-between group hover:bg-violet-50 p-2 rounded-lg transition-all duration-200 ${
                        hoveredCountry?.name === country.name ? 'bg-violet-50 shadow-sm' : ''
                      }`}
                      onMouseEnter={() => setHoveredCountry(country)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-4">{index + 1}</span>
                        {getFlagComponent(country.name)}
                        <span className="text-sm text-gray-900 font-medium group-hover:text-violet-700 truncate max-w-[100px]">
                          {country.name}
                        </span>
                      </div>
                      <span className="text-xs text-violet-600 font-semibold">
                        {country.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[100px] text-gray-500">
                  No countries with active merchants
                </div>
              )}
            </div>
          </div>
          {/* Map */}
          <div className="w-full">
            <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-gray-50 to-gray-100">
              <ComposableMap
                projectionConfig={{
                  scale: 190,
                  center: [20, 15],
                  rotate: [-10, 0, 0]
                }}
                width={980}
                height={551}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <ZoomableGroup
                  zoom={1}
                  minZoom={1}
                  maxZoom={1}
                  center={[0, 0]}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const countryData = findCountryData(geo.properties.name);
                        const displayName = getDisplayName(geo.properties.name);
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={countryData ? getColorIntensity(countryData.value) : "#E5E7EB"}
                            stroke="#ffffff"
                            strokeWidth={0.5}
                            onMouseEnter={() => {
                              const matchingCountry = findCountryData(geo.properties.name);
                              setHoveredCountry(matchingCountry || {
                                name: displayName,
                                value: 0,
                                coordinates: [0, 0]
                              });
                            }}
                            onMouseLeave={() => setHoveredCountry(null)}
                            style={{
                              default: {
                                outline: "none",
                                transition: "all 250ms",
                              },
                              hover: {
                                fill: countryData ? "#7C3AED" : "#D1D5DB",
                                outline: "none",
                                cursor: "pointer",
                                filter: "brightness(1.1)"
                              },
                              pressed: {
                                outline: "none",
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              {hoveredCountry && (
                <div className="absolute top-2 left-2 bg-white p-3 rounded-lg shadow-lg border backdrop-blur-sm bg-opacity-90">
                  <div className="flex items-center gap-2 mb-1">
                    {getFlagComponent(hoveredCountry.name)}
                    <span className="text-gray-900 font-medium">{hoveredCountry.name}</span>
                  </div>
                  <span className="text-sm text-violet-600 font-semibold">
                    {hoveredCountry.value.toLocaleString()} {hoveredCountry.value === 1 ? 'Merchant' : 'Merchants'}
                  </span>
                </div>
              )}
            </div>
          </div>


        </div>
      </CardContent>
    </Card>
  );
} 