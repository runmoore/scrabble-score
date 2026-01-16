import type { Flight } from "~/types/flights";

// Example static flight data. Replace with real API integration as needed.
export const flights: Flight[] = [
  {
    id: 1,
    airline: "Emirates",
    flightNumber: "EK012",
    origin: "LGW",
    destination: "DXB",
    departDate: "250619",
    returnDate: "250629",
    price: 520,
    duration: "6h 45m",
    stops: 0,
    outbound: {
      departTime: "08:00",
      arriveTime: "19:45",
    },
    return: {
      departTime: "16:45",
      arriveTime: "22:20",
    },
    partners: [
      { id: "expedia", name: "Expedia", price: 520, url: "#" },
      { id: "kayak", name: "Kayak", price: 525, url: "#" },
      { id: "airline", name: "Emirates", price: 520, url: "#" },
      { id: "skyscanner", name: "Skyscanner", price: 518, url: "#" },
    ],
  },
  {
    id: 2,
    airline: "British Airways",
    flightNumber: "BA105",
    origin: "LGW",
    destination: "DXB",
    departDate: "250619",
    returnDate: "250629",
    price: 495,
    duration: "7h 00m",
    stops: 0,
    outbound: {
      departTime: "10:30",
      arriveTime: "22:30",
    },
    return: {
      departTime: "14:15",
      arriveTime: "18:45",
    },
    partners: [
      { id: "expedia", name: "Expedia", price: 500, url: "#" },
      { id: "kayak", name: "Kayak", price: 495, url: "#" },
      { id: "airline", name: "British Airways", price: 495, url: "#" },
      { id: "skyscanner", name: "Skyscanner", price: 497, url: "#" },
    ],
  },
  {
    id: 3,
    airline: "Qatar Airways",
    flightNumber: "QR328",
    origin: "LGW",
    destination: "DXB",
    departDate: "250619",
    returnDate: "250629",
    price: 470,
    duration: "9h 30m",
    stops: 1,
    outbound: {
      departTime: "12:50",
      arriveTime: "05:20+1",
    },
    return: {
      departTime: "07:30",
      arriveTime: "13:45",
    },
    partners: [
      { id: "expedia", name: "Expedia", price: 480, url: "#" },
      { id: "kayak", name: "Kayak", price: 475, url: "#" },
      { id: "airline", name: "Qatar Airways", price: 470, url: "#" },
      { id: "skyscanner", name: "Skyscanner", price: 472, url: "#" },
    ],
  },
];
