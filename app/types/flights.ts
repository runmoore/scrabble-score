// Shared types for the flights application

export interface Partner {
  id: string;
  name: string;
  price: number;
  url: string;
}

export interface FlightTimes {
  departTime: string;
  arriveTime: string;
}

export interface Flight {
  id: number;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  price: number;
  duration: string;
  stops: number;
  outbound: FlightTimes;
  return: FlightTimes;
  partners: Partner[];
}

export interface SearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
}
