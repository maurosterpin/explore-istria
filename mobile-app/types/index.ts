type Attraction = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string;
  imageUrl: string;
  rating?: number;
  category?: string;
  price?: number;
  city?: string;
};

type InitialRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Route = {
  id: number;
  name: string;
  description: string;
  attractions: Attraction[];
};
